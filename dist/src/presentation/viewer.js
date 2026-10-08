import {$} from './dom.js';
/**
 * Visor de fotos: la foto completa a pantalla entera, sin recortes, para ver cada detalle del producto.
 * - Acercar: pellizco o doble toque en pantallas táctiles; clic o rueda con ratón; teclas + y −.
 * - Con la foto acercada se arrastra para recorrerla. Sin acercar, deslizar a los lados cambia de foto
 *   (si el producto tiene varias) y deslizar hacia abajo cierra.
 * - Se abre encima del detalle del producto, que sigue ahí al cerrar.
 * El marcado está en index.html (`#photo-dialog`) y los estilos en modal.css.
 */
export function mountViewer() {
  const dialog = $('#photo-dialog'), stage = $('#viewer-stage'), img = $('#viewer-img');
  const count = $('#viewer-count'), hint = $('#viewer-hint');
  const [prev, next] = [dialog.querySelector('.viewer-prev'), dialog.querySelector('.viewer-next')];
  const touch = matchMedia('(hover: none) and (pointer: coarse)');
  const MAX = 4, DOUBLE_TAP_MS = 300, EASE = 'cubic-bezier(.23,1,.32,1)';
  let photos = [], index = 0, name = '';
  let scale = 1, x = 0, y = 0;               // la foto se mueve y escala desde su centro
  const pointers = new Map();
  let gesture = null, lastTap = 0, hinted = false, hintTimer = 0;

  const paint = (animate = false) => {
    img.style.transition = animate ? `transform .28s ${EASE}` : 'none';
    img.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    dialog.classList.toggle('zoomed', scale > 1.01);
    dialog.style.removeProperty('--dim');
  };
  /** La foto nunca se separa de los bordes: solo se puede recorrer lo que sobresale de la pantalla. */
  const clamp = () => {
    const box = stage.getBoundingClientRect();
    const mx = Math.max(0, (img.offsetWidth * scale - box.width) / 2), my = Math.max(0, (img.offsetHeight * scale - box.height) / 2);
    x = Math.min(mx, Math.max(-mx, x));
    y = Math.min(my, Math.max(-my, y));
  };
  /** Acerca o aleja manteniendo fijo el punto (cx, cy), medido desde el centro de la pantalla. */
  const zoomAt = (target, cx = 0, cy = 0) => {
    const to = Math.min(MAX, Math.max(1, target)), k = to / scale;
    x = cx - (cx - x) * k;
    y = cy - (cy - y) * k;
    scale = to;
    if (scale === 1) x = y = 0;
    clamp();
  };
  const fromCenter = (px, py) => {
    const box = stage.getBoundingClientRect();
    return [px - box.left - box.width / 2, py - box.top - box.height / 2];
  };
  const quiet = () => { clearTimeout(hintTimer); hint.classList.remove('on'); };

  function render() {
    scale = 1; x = y = 0;
    paint();
    img.src = `assets/${photos[index]}`;
    img.alt = photos.length > 1 ? `${name}, foto ${index + 1} de ${photos.length}` : name;
    const many = photos.length > 1;
    prev.hidden = next.hidden = count.hidden = !many;
    count.textContent = many ? `${index + 1} / ${photos.length}` : '';
  }
  function step(delta) {
    if (photos.length < 2) return paint(true);
    index = (index + delta + photos.length) % photos.length;
    render();
    img.animate?.([{opacity: 0, translate: `${delta * 28}px 0`}, {opacity: 1, translate: '0 0'}], {duration: 240, easing: EASE});
  }
  function close() {
    if (!dialog.open || dialog.classList.contains('leaving')) return;
    quiet();
    dialog.classList.add('leaving');
    setTimeout(() => { dialog.classList.remove('leaving'); dialog.close(); }, 150);
  }
  function toggleZoom(cx, cy) {
    zoomAt(scale > 1.01 ? 1 : 2.5, cx, cy);
    paint(true);
  }

  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    quiet();
    stage.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      gesture = {type: 'pinch', distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale};
    } else if (pointers.size === 1) {
      gesture = {type: scale > 1.01 ? 'pan' : 'swipe', sx: event.clientX, sy: event.clientY, x, y, moved: false, axis: null, onPhoto: event.target === img};
    }
  });
  stage.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    if (gesture.type === 'pinch') {
      if (pointers.size < 2) return;
      const [a, b] = [...pointers.values()];
      zoomAt(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, ...fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2));
      return paint();
    }
    const dx = event.clientX - gesture.sx, dy = event.clientY - gesture.sy;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) gesture.moved = true;
    if (!gesture.moved) return;
    if (gesture.type === 'pan') {
      x = gesture.x + dx; y = gesture.y + dy;
      clamp();
      return paint();
    }
    // Sin acercar: la foto sigue al dedo en un solo eje, el primero que se mueva.
    gesture.axis ??= Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    img.style.transition = 'none';
    if (gesture.axis === 'x') img.style.transform = `translate3d(${photos.length > 1 ? dx : dx * 0.25}px,0,0)`;
    else if (dy > 0) {
      img.style.transform = `translate3d(0,${dy}px,0) scale(${1 - Math.min(dy, 320) / 1600})`;
      dialog.style.setProperty('--dim', String(1 - Math.min(dy, 260) / 330));
    }
  });
  const release = event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    const ended = gesture;
    if (!ended) return;
    if (ended.type === 'pinch') {
      if (scale < 1.05) zoomAt(1);
      paint(true);
      // Si queda un dedo en la pantalla, sigue arrastrando desde donde está.
      const [rest] = [...pointers.values()];
      gesture = rest ? {type: scale > 1.01 ? 'pan' : 'swipe', sx: rest.x, sy: rest.y, x, y, moved: true, axis: null, onPhoto: true} : null;
      return;
    }
    gesture = null;
    const dx = event.clientX - ended.sx, dy = event.clientY - ended.sy;
    if (ended.moved) {
      if (ended.type === 'pan' || event.type === 'pointercancel') return paint(true);
      if (ended.axis === 'x' && Math.abs(dx) > 56) return step(dx < 0 ? 1 : -1);
      if (ended.axis === 'y' && dy > 90) return close();
      return paint(true);
    }
    if (event.type === 'pointercancel') return;
    // Un toque. Fuera de la foto cierra; sobre la foto, el ratón acerca con un clic y el dedo con dos toques.
    if (!ended.onPhoto && scale <= 1.01) return close();
    const now = performance.now(), point = fromCenter(event.clientX, event.clientY);
    if (event.pointerType === 'mouse' || now - lastTap < DOUBLE_TAP_MS) { lastTap = 0; toggleZoom(...point); }
    else lastTap = now;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('wheel', event => {
    event.preventDefault();
    quiet();
    zoomAt(scale * (event.deltaY < 0 ? 1.18 : 1 / 1.18), ...fromCenter(event.clientX, event.clientY));
    paint();
  }, {passive: false});

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  dialog.querySelector('.viewer-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', () => { pointers.clear(); gesture = null; img.removeAttribute('src'); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
    else if (event.key === '+' || event.key === '=') { zoomAt(scale * 1.4); paint(true); }
    else if (event.key === '-') { zoomAt(scale / 1.4); paint(true); }
  });
  addEventListener('resize', () => { if (dialog.open) { clamp(); paint(); } });

  return {
    /** `photos`: archivos dentro de dist/assets/, en el orden de la galería. `start`: cuál se muestra primero. */
    open({photos: files, start = 0, name: productName}) {
      photos = files.filter(Boolean);
      if (!photos.length) return;
      index = Math.max(0, Math.min(photos.length - 1, start));
      name = productName;
      dialog.setAttribute('aria-label', `Foto completa de ${name}`);
      render();
      dialog.showModal();
      // El foco va al diálogo, como en los demás: el lector anuncia de qué es la foto y no aparece un anillo sin motivo.
      dialog.focus({preventScroll: true});
      // La pista se muestra una vez por visita: la gente no lee dos veces lo mismo.
      if (!hinted) {
        hinted = true;
        hint.textContent = touch.matches ? 'Pellizca o toca dos veces para acercar' : 'Haz clic o usa la rueda para acercar';
        hint.classList.add('on');
        hintTimer = setTimeout(quiet, 3200);
      }
    },
    close,
  };
}

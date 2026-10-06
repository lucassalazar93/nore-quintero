import {$} from './dom.js';
import {mountSpring, count} from './spring.js';

/**
 * Sistema de movimiento. Solo presentación: no conoce productos ni reglas de negocio.
 *
 * Reglas de la casa (ver DESIGN.md):
 * - Solo `transform`, `opacity`, `clip-path`, `filter` y las propiedades individuales translate/scale.
 * - Curvas fuertes de salida; nada de `ease-in`, `scale(0)` ni `transition: all`.
 * - El contenido es visible por defecto: sin JS o con error de carga, la página se ve completa.
 * - Con `prefers-reduced-motion` no hay vuelos, marquesina ni transiciones de vista: solo fundidos.
 */
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
export const EASE = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
};
const REVEAL_CLEANUP_MS = 1900;
const sheet = matchMedia('(max-width: 760px)');
// En móvil los diálogos son hojas inferiores: la foto no viaja, la hoja sube desde abajo.
const canFly = () => !reduced.matches && !sheet.matches && 'showPopover' in HTMLElement.prototype;
const rectOf = el => el.getBoundingClientRect();
const radiusOf = el => getComputedStyle(el).borderRadius;
const inViewport = rect => rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;

let transitioning = 0;
let revealObserver;

/* ---------- Estado de scroll: sombra del encabezado y chat compacto, sin escuchar `scroll` ---------- */
function mountScrollState() {
  const sentinel = $('.scroll-sentinel');
  if (!sentinel || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => document.body.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);
}

/* ---------- Revelado al entrar en pantalla: una vez, escalonado por fila ---------- */
function observeReveals() {
  document.querySelectorAll('[data-rv]:not([data-rv-seen])').forEach(el => {
    el.setAttribute('data-rv-seen', '');
    if (el.dataset.rv === 'stagger') [...el.children].forEach((child, i) => child.style.setProperty('--i', Math.min(i, 9)));
    revealObserver.observe(el);
  });
}
function mountReveals() {
  if (!('IntersectionObserver' in window)) return root.classList.add('motion-failed');
  revealObserver = new IntersectionObserver(entries => {
    const arriving = entries.filter(entry => entry.isIntersecting).sort((a, b) =>
      a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
    arriving.forEach((entry, i) => {
      const el = entry.target;
      revealObserver.unobserve(el);
      el.style.setProperty('--rv-delay', `${Math.min(i, 5) * 70}ms`);
      el.classList.add('in');
      // Al terminar, el elemento recupera sus propias transiciones (hover de las tarjetas, etc.).
      setTimeout(() => {
        el.removeAttribute('data-rv');
        el.classList.remove('in');
        el.style.removeProperty('--rv-delay');
      }, REVEAL_CLEANUP_MS + i * 70);
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -6% 0px'});
  observeReveals();
  // Cada filtro vuelve a pintar las tarjetas: ya no se revelan por scroll, entran con la transición de vista.
  window.addEventListener('nore:catalog', () => {
    const cards = [...document.querySelectorAll('#products .product[data-rv]')];
    cards.forEach(card => card.removeAttribute('data-rv'));
    if (!transitioning && !reduced.matches) staggerIn(cards);
  });
}
function staggerIn(cards) {
  cards.slice(0, 9).forEach((card, i) => card.animate(
    [{opacity: 0, translate: '0 22px'}, {opacity: 1, translate: '0 0'}],
    {duration: 420, delay: i * 45, easing: EASE.out, fill: 'backwards'}));
}

/* ---------- Navegación: la sección visible queda marcada ---------- */
function mountScrollSpy() {
  const links = new Map([...document.querySelectorAll('#main-nav a[href^="#"]:not([data-favorites])')].map(a => [a.getAttribute('href').slice(1), a]));
  if (!links.size || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    links.forEach(link => link.removeAttribute('aria-current'));
    links.get(entry.target.id)?.setAttribute('aria-current', 'true');
  }), {rootMargin: '-40% 0px -55% 0px'});
  links.forEach((_, id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
  const hero = document.getElementById('inicio');
  if (hero) new IntersectionObserver(([entry]) => { if (entry.isIntersecting) links.forEach(link => link.removeAttribute('aria-current')); }, {rootMargin: '-40% 0px -55% 0px'}).observe(hero);
}

/* ---------- Filtros: una "lente" recortada se desliza entre los botones ---------- */
function mountFilters() {
  const container = $('.filters');
  const buttons = container ? [...container.querySelectorAll('button')] : [];
  if (!buttons.length) return () => {};
  const track = document.createElement('div');
  track.className = 'filter-track';
  track.append(...buttons);
  const lens = document.createElement('div');
  lens.className = 'filter-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.innerHTML = buttons.map(button => `<span>${button.textContent}</span>`).join('');
  track.append(lens);
  container.replaceChildren(track);
  const copies = [...lens.children];
  // Cada copia toma el tamaño y la letra de su botón: así la lente coincide en cualquier ancho de pantalla.
  const mirror = () => buttons.forEach((button, i) => Object.assign(copies[i].style, {
    boxSizing: 'border-box', width: `${button.offsetWidth}px`, height: `${button.offsetHeight}px`, padding: '0',
    fontSize: getComputedStyle(button).fontSize, lineHeight: `${button.offsetHeight - 2}px`, textAlign: 'center',
  }));
  const place = instant => {
    const active = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
    if (!active) return;
    if (instant) { lens.style.transition = 'none'; mirror(); }
    const left = active.offsetLeft, right = track.offsetWidth - left - active.offsetWidth;
    lens.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
    if (instant) { void lens.offsetWidth; lens.style.transition = ''; }
  };
  place(true);
  if ('ResizeObserver' in window) new ResizeObserver(() => place(true)).observe(track);
  document.fonts?.ready.then(() => place(true));
  return button => {
    place(false);
    button.scrollIntoView({inline: 'center', block: 'nearest', behavior: reduced.matches ? 'auto' : 'smooth'});
  };
}

/* ---------- Transición de vista para el filtro de la colección ---------- */
export function transition(update) {
  if (!('startViewTransition' in document) || reduced.matches) return update();
  const mark = card => { card.style.viewTransitionName = `p-${card.dataset.product}`; card.style.viewTransitionClass = 'card'; };
  const clear = card => { card.style.viewTransitionName = ''; card.style.viewTransitionClass = ''; };
  const cards = () => document.querySelectorAll('#products .product');
  cards().forEach(mark);
  transitioning++;
  const view = document.startViewTransition(() => { update(); cards().forEach(mark); });
  view.finished.finally(() => { transitioning--; if (!transitioning) cards().forEach(clear); });
}

/* ---------- Foto del producto: viaja de la tarjeta al detalle y vuelve ---------- */
let activeFlight = null;
let lastSource = null;
function settleFlight() {
  activeFlight?.finish();
  activeFlight = null;
}
function ghostPhoto(img, rect, radius) {
  const ghost = document.createElement('div');
  ghost.className = 'flight';
  ghost.setAttribute('popover', 'manual');
  ghost.setAttribute('aria-hidden', 'true');
  const copy = new Image();
  copy.alt = '';
  copy.src = img.currentSrc || img.src;
  copy.style.objectPosition = getComputedStyle(img).objectPosition;
  ghost.append(copy);
  Object.assign(ghost.style, {left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: radius});
  document.body.append(ghost);
  ghost.showPopover();
  return ghost;
}
const frame = (rect, radius) => ({left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: radius});
function fly({img, fromRect, fromRadius, toRect, toRadius, duration, easing, hide, onDone}) {
  const ghost = ghostPhoto(img, fromRect, fromRadius);
  hide.forEach(el => { el.style.opacity = '0'; });
  const animation = ghost.animate([frame(fromRect, fromRadius), frame(toRect, toRadius)], {duration, easing, fill: 'forwards'});
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    animation.cancel();
    ghost.remove();
    hide.forEach(el => { el.style.opacity = ''; });
    onDone?.();
  };
  animation.finished.then(finish, finish);
  activeFlight = {finish};
}
export function openProduct(source, dialog) {
  settleFlight();
  lastSource = source || null;
  const target = dialog.querySelector('.detail-photo');
  const from = source?.querySelector('.food-photo');
  const img = from?.querySelector('img:not(.sprite)');
  if (!canFly() || !img || !target?.querySelector('img:not(.sprite)') || !inViewport(rectOf(source))) return;
  fly({
    img, fromRect: rectOf(source), fromRadius: radiusOf(source),
    toRect: rectOf(target), toRadius: radiusOf(target),
    duration: 480, easing: EASE.drawer, hide: [from, target],
  });
}
export function closeDialog(dialog, {fly: allowFlight = true} = {}) {
  if (!dialog?.open) return;
  const source = lastSource?.isConnected ? lastSource : null;
  const target = dialog.id === 'product-dialog' ? dialog.querySelector('.detail-photo') : null;
  const from = source?.querySelector('.food-photo');
  const img = target?.querySelector('img:not(.sprite)');
  settleFlight();
  // Si el detalle se desplazó y la foto ya no está a la vista, no hay nada que devolver a la tarjeta.
  const photoInPlace = target && rectOf(target).top >= rectOf(dialog).top - 8;
  if (allowFlight && canFly() && img && from && photoInPlace && inViewport(rectOf(source))) {
    const fromRect = rectOf(target), fromRadius = radiusOf(target);
    fly({
      img, fromRect, fromRadius, toRect: rectOf(source), toRadius: radiusOf(source),
      duration: 380, easing: EASE.out, hide: [from],
    });
  }
  dialog.close();
}

/* ---------- Agregar a la selección: la miniatura vuela a "Mi selección" ---------- */
export function pop(el, scale = 1.3) {
  if (!el || reduced.matches) return;
  el.animate([{scale: 1}, {scale}, {scale: 1}], {duration: 340, easing: EASE.out});
}
export function flyToBag(origin, src) {
  const count = $('#count');
  const bag = $('#open-bag');
  if (!canFly() || !origin?.isConnected || !count) { pop(count); return; }
  const a = rectOf(origin), b = rectOf(count), size = 52;
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const wrap = document.createElement('div');
  wrap.className = 'flight flight-dot';
  wrap.setAttribute('popover', 'manual');
  wrap.setAttribute('aria-hidden', 'true');
  Object.assign(wrap.style, {left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px`});
  const dot = document.createElement('div');
  dot.className = 'flight-dot-body';
  if (src) dot.style.backgroundImage = `url("${src}")`;
  wrap.append(dot);
  document.body.append(wrap);
  wrap.showPopover();
  const x = wrap.animate([{translate: '0 0'}, {translate: `${dx}px 0`}], {duration: 680, easing: EASE.inOut, fill: 'forwards'});
  dot.animate([
    {translate: '0 0', scale: 1, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)'},
    {translate: '0 -64px', scale: 1, offset: 0.34, easing: 'cubic-bezier(0.55, 0, 0.9, 0.5)'},
    {translate: `0 ${dy}px`, scale: 0.34},
  ], {duration: 680, fill: 'forwards'});
  x.finished.then(() => {
    wrap.remove();
    pop(count);
    bag?.animate([{scale: 1}, {scale: 1.06}, {scale: 1}], {duration: 360, easing: EASE.out});
  }, () => wrap.remove());
}

/* ---------- Gestos pequeños: confirmar, cambiar contenido en el sitio, quitar una fila ---------- */
/** El botón de agregar muestra una marca un instante. */
export function confirm(button) {
  if (!button?.classList.contains('add')) return;
  button.classList.add('added');
  setTimeout(() => button.classList.remove('added'), 1100);
}
/** Otro producto dentro del mismo diálogo: el contenido se funde en su sitio, sin cerrar ni volver a abrir. */
export function swap(box) {
  lastSource = null;
  if (!reduced.matches) box.animate([{opacity: 0, translate: '0 10px'}, {opacity: 1, translate: '0 0'}], {duration: 300, easing: EASE.out});
}
/** Una fila sale antes de quitarse de la lista. */
export function exit(el) {
  if (!el || reduced.matches) return Promise.resolve();
  return el.animate([{opacity: 1, translate: '0 0', scale: 1}, {opacity: 0, translate: '18px 0', scale: 0.98}], {duration: 190, easing: EASE.out, fill: 'forwards'}).finished.catch(() => {});
}
/** FLIP: las filas que quedan se deslizan a su nuevo lugar en vez de saltar. Se emparejan por `data-row`. */
export function flip(container, update) {
  const before = new Map([...(container?.querySelectorAll('[data-row]') || [])].map(el => [el.dataset.row, rectOf(el).top]));
  update();
  if (reduced.matches || !container) return;
  container.querySelectorAll('[data-row]').forEach(el => {
    const from = before.get(el.dataset.row);
    const dy = from === undefined ? 0 : from - rectOf(el).top;
    if (dy) el.animate([{translate: `0 ${dy}px`}, {translate: '0 0'}], {duration: 320, easing: EASE.out});
  });
}

/* ---------- Fotos: las que aún no llegan esperan invisibles y se funden al cargar ---------- */
export function settle(img) {
  if (!img || img.classList.contains('sprite') || (img.complete && img.naturalWidth)) return;
  img.classList.add('img-wait');
  const done = () => {
    if (!img.classList.contains('img-wait')) return;
    img.classList.remove('img-wait');
    if (!reduced.matches) img.animate([{opacity: 0}, {opacity: 1}], {duration: 420, easing: EASE.out});
  };
  img.addEventListener('load', done, {once: true});
  img.addEventListener('error', done, {once: true});
}
function mountImages() {
  if (!('MutationObserver' in window)) return;
  const sweep = scope => scope.querySelectorAll?.('img').forEach(settle);
  const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') settle(node); else sweep(node);
  })));
  ['#products', '#product-detail', '#bag-items', '#bag-suggest'].forEach(selector => {
    const box = $(selector);
    if (!box) return;
    sweep(box);
    observer.observe(box, {childList: true, subtree: true});
  });
}

/* ---------- Modales: barra que reacciona al scroll y hojas que se arrastran para cerrar ---------- */
function mountModals() {
  document.querySelectorAll('dialog.modal').forEach(dialog => {
    const bar = dialog.querySelector('.modal-bar');
    const body = dialog.querySelector('.modal-body');
    body?.addEventListener('scroll', () => dialog.classList.toggle('scrolled', body.scrollTop > 6), {passive: true});
    const reset = () => {
      dialog.classList.remove('dragging');
      dialog.style.translate = '';
      dialog.style.removeProperty('--scrim');
    };
    dialog.addEventListener('close', reset);
    if (!bar) return;
    let drag = null;
    bar.addEventListener('pointerdown', event => {
      if (!sheet.matches || event.target.closest('.close')) return;
      drag = {y: event.clientY, t: performance.now(), height: dialog.offsetHeight};
      bar.setPointerCapture(event.pointerId);
      dialog.classList.add('dragging');
    });
    bar.addEventListener('pointermove', event => {
      if (!drag) return;
      const dy = event.clientY - drag.y;
      // Hacia abajo sigue al dedo 1:1; hacia arriba, con fricción: nada se frena en seco.
      dialog.style.translate = `0 ${dy > 0 ? dy : dy * 0.2}px`;
      dialog.style.setProperty('--scrim', String(1 - 0.7 * Math.min(1, Math.max(0, dy) / drag.height)));
    });
    const release = event => {
      if (!drag) return;
      const dy = event.clientY - drag.y, velocity = dy / Math.max(1, performance.now() - drag.t);
      const dismiss = dy > Math.min(140, drag.height * 0.28) || (dy > 24 && velocity > 0.5);
      drag = null;
      // Al soltar, la hoja vuelve o se va con su transición; el fondo recupera la suya.
      dialog.classList.remove('dragging');
      dialog.style.removeProperty('--scrim');
      if (dismiss) { dialog.style.translate = '0 100%'; closeDialog(dialog, {fly: false}); }
      else dialog.style.translate = '';
    };
    bar.addEventListener('pointerup', release);
    bar.addEventListener('pointercancel', release);
  });
}

/* ---------- Composición ---------- */
/** La interfaz recibe este objeto en `main.js`; `mount()` se llama cuando el DOM de la colección ya existe. */
export function createMotion() {
  const api = {
    transition, openProduct, closeDialog, flyToBag, pop, confirm, swap, exit, flip, settle, count,
    select: () => {},
    mount({onLibrary} = {}) {
      api.select = mountFilters();
      mountScrollState();
      mountReveals();
      mountScrollSpy();
      mountModals();
      mountImages();
      const productDialog = $('#product-dialog');
      // Escape también devuelve la foto a su tarjeta.
      productDialog?.addEventListener('cancel', event => { event.preventDefault(); closeDialog(productDialog); });
      root.classList.add('motion-ready');
      mountSpring(onLibrary);
    },
  };
  return api;
}

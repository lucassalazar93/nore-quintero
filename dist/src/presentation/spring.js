import {$} from './dom.js';

/**
 * Capa opcional con Motion (antes Framer Motion): resortes que conservan la velocidad al interrumpirse.
 * Si la librería no carga, o hay "reducir movimiento", el sitio queda tal cual lo deja motion.js.
 *
 * Solo decoración y detalles que ganan con física real:
 *  - botones magnéticos y profundidad del encabezado (solo ratón: puntero fino con hover);
 *  - titulares que suben palabra por palabra;
 *  - cifras que se acomodan en vez de saltar.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const SRC = 'vendor/motion-14.0.0.min.js';
const FOLLOW = {type: 'spring', stiffness: 170, damping: 19, mass: 0.8};
let M = null;

function load() {
  if (window.Motion) return Promise.resolve(window.Motion);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.onload = () => (window.Motion ? resolve(window.Motion) : reject(new Error('Motion no disponible')));
    script.onerror = () => reject(new Error('Motion no cargó'));
    document.head.append(script);
  });
}

/** Dos valores con resorte (x, y). Cada llamada redirige el resorte desde su posición y velocidad actuales. */
function follower(apply) {
  const x = M.motionValue(0), y = M.motionValue(0);
  const render = () => apply(x.get(), y.get());
  x.on('change', render);
  y.on('change', render);
  return (tx, ty) => { M.animate(x, tx, FOLLOW); M.animate(y, ty, FOLLOW); };
}

function onMouse(target, move, leave) {
  let frame = 0, last;
  target.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    last = event;
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; move(last); });
  });
  target.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; leave(); });
}
const unit = (event, el) => {
  const r = el.getBoundingClientRect();
  return [(event.clientX - r.left) / r.width - 0.5, (event.clientY - r.top) / r.height - 0.5];
};

/* ---------- Botones magnéticos: se inclinan hacia el cursor, pocos píxeles ---------- */
function magnetize(el) {
  const to = follower((x, y) => { el.style.translate = `${x}px ${y}px`; });
  onMouse(el, event => { const [nx, ny] = unit(event, el); to(nx * 14, ny * 10); }, () => to(0, 0));
}

/* ---------- Portada: la foto "mira" hacia el cursor y el sello flota por encima ---------- */
function heroDepth() {
  const hero = $('.hero'), img = $('.hero-visual > img'), seal = $('.round-seal');
  if (!hero || !img) return;
  const base = parseFloat(getComputedStyle(img).objectPosition) || 48;
  const look = follower(x => { img.style.objectPosition = `${base + x}% 50%`; });
  const float = seal ? follower((x, y) => { seal.style.translate = `${x}px ${y}px`; }) : () => {};
  onMouse(hero, event => {
    const [nx, ny] = unit(event, hero);
    look(nx * -9, 0);
    float(nx * 26, ny * 18);
  }, () => { look(0, 0); float(0, 0); });
}

/* ---------- Tarjetas: la foto se desplaza apenas dentro de su marco al pasar el cursor ---------- */
function cardDepth() {
  const rail = $('#products');
  if (!rail) return;
  const followers = new WeakMap();
  rail.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const frame = event.target.closest?.('.product-image');
    if (!frame || frame.querySelector('img[style*="object-position"]')) return;
    const img = frame.querySelector('img:not(.sprite)');
    if (!img) return;
    if (!followers.has(img)) followers.set(img, follower((x, y) => { img.style.translate = `${x}px ${y}px`; }));
    const [nx, ny] = unit(event, frame);
    followers.get(img)(nx * -8, ny * -8);
  });
  rail.addEventListener('pointerout', event => {
    const frame = event.target.closest?.('.product-image');
    if (!frame || frame.contains(event.relatedTarget)) return;
    const img = frame.querySelector('img:not(.sprite)');
    if (img && followers.has(img)) followers.get(img)(0, 0);
  });
}

/* ---------- Titulares: cada palabra sube desde una máscara, con resorte ---------- */
function splitWords(node) {
  [...node.childNodes].forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.append(part); return; }
        const mask = document.createElement('span');
        mask.className = 'w';
        const word = document.createElement('span');
        word.className = 'wi';
        word.textContent = part;
        mask.append(word);
        fragment.append(mask);
      });
      child.replaceWith(fragment);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
      splitWords(child);
    }
  });
}
function splitHeadings() {
  document.querySelectorAll('.section-heading h2, .celebrate-copy h2, .story-title h2, .closing h2, .location-copy h2').forEach(heading => {
    const original = heading.innerHTML;
    try {
      heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
      splitWords(heading);
      heading.querySelectorAll('.w').forEach(mask => mask.setAttribute('aria-hidden', 'true'));
      heading.classList.add('split-ready');
      const stop = M.inView(heading, () => {
        stop?.();
        try {
          M.animate(heading.querySelectorAll('.wi'), {transform: ['translateY(112%)', 'translateY(0%)']},
            {type: 'spring', stiffness: 210, damping: 26, delay: M.stagger(0.05)});
        } catch {
          heading.classList.remove('split-ready');
        }
      }, {amount: 0.55});
    } catch {
      heading.innerHTML = original;
      heading.removeAttribute('aria-label');
      heading.classList.remove('split-ready');
    }
  });
}

/* ---------- Cifras: se acomodan con resorte en lugar de saltar ---------- */
export function count(el, from, to, format) {
  if (!el) return;
  if (!M || reduced.matches || from === to) { el.textContent = format(to); return; }
  el.textContent = format(from);
  M.animate(from, to, {type: 'spring', duration: 0.7, bounce: 0, onUpdate: value => { el.textContent = format(Math.round(value)); }});
}

export function mountSpring(onLibrary) {
  if (reduced.matches) return;
  const start = () => load().then(lib => {
    M = lib;
    onLibrary?.(lib);
    if (fine.matches) {
      splitHeadings();
      document.querySelectorAll('.hero .button, .celebrate-copy .button, .closing .button').forEach(magnetize);
      heroDepth();
      cardDepth();
    }
  }).catch(() => {});
  if (document.readyState === 'complete') setTimeout(start, 400);
  else addEventListener('load', () => setTimeout(start, 400), {once: true});
}

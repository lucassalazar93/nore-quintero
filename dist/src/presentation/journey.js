import {$} from './dom.js';

/**
 * «Del horno a tu mesa»: un recorrido de cuatro capítulos que avanza con el scroll.
 * En pantallas anchas con ratón, la foto se abre dentro de un arco fijo mientras el texto cambia de capítulo,
 * aparece un sello con un dato real y el título de la pestaña acompaña. En móvil, tabletas, sin Motion, sin JS
 * o con "reducir movimiento", los capítulos son tarjetas que se deslizan o secciones apiladas: nada secuestra el scroll.
 */
const root = document.documentElement;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const wide = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

export function mountJourney(M, storefront) {
  const section = $('.journey');
  const track = $('.journey-track');
  if (!section || !track || !M?.scroll) return;
  const chapters = [...section.querySelectorAll('.jchapter')];
  const frames = chapters.map(chapter => chapter.querySelector('.jframe'));
  const bar = $('.journey-bar > span');
  const percent = $('#journey-pct');
  const count = chapters.length;
  if (count < 2 || !bar || !percent) return;

  // Datos de los sellos: salen del catálogo real, no de un número escrito a mano.
  const prices = storefront.lines().map(line => line.price).filter(Number.isFinite);
  const facts = {count: String(storefront.products().length), from: prices.length ? storefront.formatPrice(Math.min(...prices)) : null};
  section.querySelectorAll('[data-fact]').forEach(el => { const value = facts[el.dataset.fact]; if (value) el.textContent = value; });

  const baseTitle = document.title;
  let active = -1;
  let visible = false;
  const setTitle = () => { document.title = wide.matches && visible && active >= 0 ? `Nore Quintero · ${chapters[active].dataset.title}` : baseTitle; };
  const sync = () => {
    root.classList.toggle('journey-pinned', wide.matches);
    if (!wide.matches) { active = -1; setTitle(); }
  };
  sync();
  wide.addEventListener('change', sync);
  M.scroll(progress => {
    if (!wide.matches) return;
    const index = Math.min(count - 1, Math.floor(progress * count));
    if (index !== active) {
      chapters.forEach((chapter, i) => chapter.classList.toggle('is-active', i === index));
      active = index;
      setTitle();
    }
    // Cada foto nueva sube dentro del arco justo antes de que el texto cambie de capítulo.
    frames.forEach((frame, i) => {
      if (!i) return;
      const t = clamp((progress - (i / count - 0.09)) / 0.14);
      if (frame._t !== t) { frame._t = t; frame.style.setProperty('--t', t.toFixed(3)); }
    });
    percent.textContent = String(Math.round(progress * 100)).padStart(3, '0');
    bar.style.transform = `scaleX(${progress.toFixed(3)})`;
  }, {target: track, offset: ['start start', 'end end']});

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; setTitle(); }, {threshold: 0}).observe(track);
  }
}

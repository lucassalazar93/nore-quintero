import {$} from './dom.js';

/**
 * Embudo de ventas, reducido a lo que ayuda a decidir: elegir (tamaño guiado y complementos),
 * revisar (barra y hoja de selección) y pedir (cotización con contexto).
 * Cada palanca usa datos verdaderos del catálogo; nada inventa escasez, popularidad ni opiniones.
 */
export function createFunnel({storefront, motion}) {
  const money = storefront.formatPrice;
  let guests = null;
  const priceText = product => {
    const from = storefront.startingPrice(product);
    return from === null ? 'Por cotizar' : (product.presentations.length > 1 ? 'Desde ' : '') + money(from);
  };

  /* ---------- Barra de selección: el siguiente paso siempre a un toque ---------- */
  function mountBar() {
    const bar = $('#bag-bar');
    if (!bar) return;
    bar.innerHTML = '<button type="button" class="bag-bar-btn" id="bag-bar-open"><b class="bag-bar-count">0</b><span class="bag-bar-text"><strong>Mi selección</strong><small></small></span><span class="bag-bar-flash" aria-hidden="true"><strong>✓ Añadido a tu selección</strong><small></small></span><span class="bag-bar-cta">Ver y cotizar <i class="ar" aria-hidden="true"></i></span></button>';
    const count = bar.querySelector('.bag-bar-count'), note = bar.querySelector('.bag-bar-text small'), added = bar.querySelector('.bag-bar-flash small');
    $('#bag-bar-open').onclick = () => $('#open-bag').click();
    let last = 0, flashTimer;
    // Al agregar, la barra lo confirma un momento y vuelve a mostrar el resumen: el aviso nunca tapa el siguiente paso.
    window.addEventListener('nore:added', event => {
      added.textContent = event.detail.text;
      bar.classList.add('flash');
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => bar.classList.remove('flash'), 2400);
    });
    // Mientras el aviso de privacidad siga abierto, la barra se coloca encima y no lo tapa.
    const banner = $('#cookie-banner');
    const lift = () => bar.style.setProperty('--lift', banner && !banner.hidden ? `${banner.offsetHeight + 10}px` : '0px');
    if (banner) {
      new MutationObserver(lift).observe(banner, {attributes: true, attributeFilter: ['hidden']});
      window.addEventListener('resize', lift, {passive: true});
    }
    window.addEventListener('nore:bag', event => {
      const {count: n, amount, complete, productIds} = event.detail;
      bar.classList.toggle('on', n > 0);
      if (n > 0) bar.removeAttribute('inert'); else bar.setAttribute('inert', '');
      count.textContent = n;
      note.textContent = n === 0 ? '' : `${n} ${n === 1 ? 'producto' : 'productos'}${amount ? ' · ' + money(amount) + (complete ? '' : ' + por cotizar') : ' · por cotizar'}`;
      if (n > last) motion.pop(count);
      last = n;
      lift();
      renderBagSuggest(productIds);
    });
  }
  function renderBagSuggest(productIds) {
    const box = $('#bag-suggest');
    if (!box) return;
    const html = productIds.length ? suggestHtml(storefront.related(productIds, 3), 'Va muy bien con tu selección') : '';
    box.innerHTML = html;
    box.hidden = !html;
  }

  /* ---------- Piezas que usa el detalle del producto ---------- */
  function suggestHtml(items, title) {
    const list = items.filter(item => item.image);
    if (!list.length) return '';
    return `<div class="suggest"><p class="suggest-title">${title}</p><div class="suggest-list">${list.map(item =>
      `<button type="button" class="suggest-item" data-detail="${item.id}"><img src="assets/sm/${item.image}" alt="" width="52" height="52" loading="lazy" decoding="async" /><span><strong>${item.name}</strong><small>${priceText(item)}</small></span><i class="ar" aria-hidden="true"></i></button>`).join('')}</div></div>`;
  }
  function guestsHtml() {
    const options = storefront.guestOptions();
    if (!options.length) return '';
    return `<div class="guests" role="group" aria-label="¿Para cuántas personas?"><span>¿Para cuántas personas?</span>${options.map(option =>
      `<button type="button" data-guests="${option.guests}" aria-pressed="${guests === option.guests}">${option.label}</button>`).join('')}</div>`;
  }

  /* ---------- Opiniones: solo si hay opiniones reales ---------- */
  function mountProof() {
    const quotes = storefront.testimonials();
    const closing = $('.closing');
    if (!quotes.length || !closing) return;
    const section = document.createElement('section');
    section.className = 'proof section';
    section.id = 'opiniones';
    section.setAttribute('aria-label', 'Opiniones de clientes');
    section.innerHTML = `<div class="proof-list" data-rv="stagger">${quotes.map(quote =>
      `<figure><blockquote>${quote.text}</blockquote><figcaption><strong>${quote.name}</strong>${quote.context ? `<small>${quote.context}</small>` : ''}</figcaption></figure>`).join('')}</div>`;
    closing.before(section);
  }

  return {
    guests: () => guests,
    setGuests(value) { guests = value || null; storefront.setContext({guests: guests}); },
    guestsHtml, suggestHtml,
    mount() {
      mountBar();
      mountProof();
    },
  };
}

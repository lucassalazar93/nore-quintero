import {$} from './dom.js';
import {guided, nudge} from './forms.js';

/**
 * Empresas y eventos: una sola solicitud con lo que Nore necesita para cotizar un pedido grande.
 * Qué (servicios con cantidad y producto), cuándo y dónde, y a quién cotizar. Los servicios y sus opciones salen
 * del catálogo real; nada se guarda ni se envía desde aquí.
 *
 * La gente no lee instrucciones largas: el formulario guía con pasos cortos justo donde hay que actuar.
 *   Primero, cantidad → el servicio se resalta y su aro se marca.
 *   Luego, producto   → aparece «Ahora elige el producto» y su punto late hasta que se elige uno (o «Que Nore me recomiende»).
 * Las órdenes no llevan número: los números ya nombran los tres bloques del formulario.
 * El pie dice siempre qué falta o qué se va a cotizar, y el botón lleva a lo que falte en vez de fallar en silencio.
 */
const MAX = 5000;
const TICK = '<i class="tick" aria-hidden="true"></i>';

export function mountCorporate({storefront, onReady}) {
  const form = $('#corporate-form');
  const list = $('#corporate-services');
  const error = $('#corporate-error');
  const recap = $('#corporate-recap');
  const services = storefront.corporateServices();
  const choosable = service => service.options.length > 1;
  list.innerHTML = `<div class="corp-head" aria-hidden="true"><span>¿Qué necesitas?</span><span>Cantidad</span></div>` + services.map(service => {
    const name = service.label.toLowerCase();
    return `<div class="corp-service" data-service="${service.id}">
    <div class="corp-row">
      <i class="tick corp-state" aria-hidden="true"></i>
      <label class="corp-name" for="qty-${service.id}">${service.label}</label>
      <div class="corp-stepper">
        <button type="button" data-step="-1" aria-label="Quitar uno: ${name}">−</button>
        <input id="qty-${service.id}" type="number" inputmode="numeric" min="0" max="${MAX}" step="1" name="qty-${service.id}" placeholder="0" aria-label="Cantidad: ${name}" />
        <button type="button" data-step="1" aria-label="Añadir uno: ${name}">+</button>
      </div>
    </div>
    ${choosable(service) ? `<div class="corp-options" role="group" aria-label="Producto: ${name}" hidden>
      <p class="corp-step"><b></b><span>Ahora elige el producto</span></p>
      ${service.options.map(option => `<button type="button" data-option="${option.id}" aria-pressed="false">${TICK}<span>${option.name}</span></button>`).join('')}
      <button type="button" class="corp-advice" data-advice aria-pressed="false">${TICK}<span>Que Nore me recomiende</span></button>
      <p class="corp-picked" aria-live="polite"></p>
    </div>` : ''}
  </div>`;
  }).join('');
  const row = id => list.querySelector(`[data-service="${id}"]`);
  const clamp = value => Math.min(MAX, Math.max(0, Math.floor(Number(value)) || 0));
  const quantity = id => clamp(row(id).querySelector('input').value);
  const picked = id => [...row(id).querySelectorAll('[data-option][aria-pressed="true"]')];
  const advised = id => row(id).querySelector('[data-advice]')?.getAttribute('aria-pressed') === 'true';
  const pending = service => quantity(service.id) > 0 && choosable(service) && !picked(service.id).length && !advised(service.id);
  const amount = service => `${quantity(service.id)} ${quantity(service.id) === 1 ? service.one : service.many}`;
  // Una sola función pinta el estado: qué servicios cuentan, qué falta elegir y qué se va a cotizar.
  const sync = () => {
    services.forEach(service => {
      const target = row(service.id);
      const on = quantity(service.id) > 0;
      target.classList.toggle('on', on);
      target.classList.toggle('need', pending(service));
      const options = target.querySelector('.corp-options');
      if (!options) return;
      options.hidden = !on;
      const names = picked(service.id).map(option => option.textContent.trim());
      const note = target.querySelector('.corp-picked');
      const done = names.length > 0 || advised(service.id);
      target.querySelector('.corp-step span').textContent = done ? 'Producto elegido' : 'Ahora elige el producto';
      note.textContent = names.length ? `Elegiste: ${names.join(', ')}.` : advised(service.id) ? 'Nore te recomendará las opciones.' : 'Toca una o varias opciones.';
      note.classList.toggle('some', done);
    });
    const active = services.filter(service => quantity(service.id) > 0);
    const missing = active.filter(pending);
    recap.className = `corp-recap ${!active.length ? 'start' : missing.length ? 'warn' : 'ready'}`;
    recap.textContent = !active.length ? 'Empieza por la cantidad: toca + o escribe.'
      : missing.length ? `Falta elegir el producto en ${missing.map(service => service.label).join(', ')}.`
      : `Listo. Vas a cotizar: ${active.map(amount).join(' · ')}`;
    if (active.length) error.hidden = true;
  };
  list.addEventListener('input', sync);
  list.addEventListener('click', event => {
    const step = event.target.closest('[data-step]');
    if (step) {
      const field = step.parentElement.querySelector('input');
      field.value = clamp(clamp(field.value) + Number(step.dataset.step)) || '';
      sync();
      return;
    }
    const choice = event.target.closest('[data-option], [data-advice]');
    if (!choice) return;
    const group = choice.closest('.corp-options');
    const on = choice.getAttribute('aria-pressed') !== 'true';
    // «Que Nore me recomiende» y los productos concretos se excluyen: una decisión clara, no las dos.
    if (on) group.querySelectorAll(choice.matches('[data-advice]') ? '[data-option]' : '[data-advice]').forEach(other => other.setAttribute('aria-pressed', 'false'));
    choice.setAttribute('aria-pressed', String(on));
    sync();
  });

  // Presupuesto: mientras se escribe queda en pesos colombianos, con puntos de miles.
  const budget = form.elements.budget;
  budget.addEventListener('input', () => {
    const digits = budget.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 11);
    budget.value = digits ? storefront.formatPrice(Number(digits)) : '';
  });

  const check = guided(form, {
    date: 'Elige la fecha del evento.',
    address: 'Escribe la dirección o el lugar del evento.',
    area: 'Escribe el barrio o municipio.',
    company: 'Escribe el nombre de la empresa.',
    name: 'Escribe tu nombre.',
  });
  form.elements.date.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const active = services.filter(service => quantity(service.id) > 0);
    if (!active.length) {
      error.hidden = false;
      list.scrollIntoView({block: 'center', behavior: 'smooth'});
      list.querySelector('input').focus({preventScroll: true});
      nudge(recap);
      return;
    }
    const missing = active.find(pending);
    if (missing) {
      const options = row(missing.id).querySelector('.corp-options');
      options.scrollIntoView({block: 'center', behavior: 'smooth'});
      nudge(options);
      nudge(recap);
      return;
    }
    if (!check()) return;
    const data = Object.fromEntries(new FormData(form));
    onReady(storefront.corporate({
      ...data,
      budget: data.budget ? `${data.budget} ${data.budgetBasis}` : '',
      services: active.map(service => ({id: service.id, quantity: quantity(service.id), options: picked(service.id).map(option => option.dataset.option), advice: advised(service.id)})),
    }));
  });
  sync();
  return {
    /** Abre con un servicio ya señalado (desde el detalle de un almuerzo, por ejemplo). */
    prepare(serviceId, optionId) {
      const target = serviceId && row(serviceId);
      if (!target) return;
      const input = target.querySelector('input');
      target.querySelector(`[data-option="${optionId}"]`)?.setAttribute('aria-pressed', 'true');
      sync();
      requestAnimationFrame(() => { target.scrollIntoView({block: 'center'}); input.focus({preventScroll: true}); });
    },
    /** Pasa a la solicitud lo que ya estaba en «Mi selección»: `[{id, quantity, options: [ids]}]`. */
    fill(items) {
      items.forEach(item => {
        const target = row(item.id);
        if (!target) return;
        target.querySelector('input').value = item.quantity;
        item.options.forEach(id => target.querySelector(`[data-option="${id}"]`)?.setAttribute('aria-pressed', 'true'));
      });
      sync();
    },
    reset() {
      form.reset();
      list.querySelectorAll('[aria-pressed]').forEach(choice => choice.setAttribute('aria-pressed', 'false'));
      error.hidden = true;
      sync();
    },
  };
}

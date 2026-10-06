import {$} from './dom.js';
import {guided} from './forms.js';

/**
 * Entrega: el paso entre «Mi selección» y el mensaje. La persona elige recoger o domicilio y deja los datos justos
 * para que el pedido llegue ordenado a la tienda. Nada se guarda ni se envía desde aquí: los datos viven en memoria
 * y solo entran al mensaje que la persona decide enviar.
 */
const HINTS = {
  recoger: 'Nore te confirma el punto y la hora para recogerlo.',
  domicilio: 'Nore te confirma la cobertura y el valor del domicilio.',
};

export function mountDelivery({storefront, onReady}) {
  const form = $('#delivery-form');
  const address = $('#delivery-address');
  const hint = $('#delivery-hint');
  const fields = () => [...form.elements].filter(field => field.name && field.type !== 'radio');
  const sync = () => {
    const home = form.elements.mode.value === 'domicilio';
    address.hidden = !home;
    // Los campos ocultos se desactivan: ni se validan ni viajan en el mensaje.
    address.querySelectorAll('input').forEach(input => { input.disabled = !home; });
    hint.textContent = HINTS[home ? 'domicilio' : 'recoger'];
  };
  form.addEventListener('change', event => { if (event.target.name === 'mode') sync(); });
  form.elements.date.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const check = guided(form, {
    name: 'Escribe a nombre de quién va el pedido.',
    date: 'Elige para cuándo lo necesitas.',
    address: 'Escribe la dirección de entrega.',
    area: 'Escribe el barrio o municipio.',
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!check()) return;
    storefront.setContext({delivery: Object.fromEntries(new FormData(form))});
    onReady();
  });
  // Quien prefiera coordinar la entrega conversando sigue sin llenar nada.
  $('#delivery-skip').onclick = () => { storefront.setContext({delivery: null}); onReady(); };
  sync();
  return {
    /** Lo escrito, tal cual, para devolverlo si la persona no alcanzó a enviar su pedido. Solo en memoria. */
    snapshot: () => ({mode: form.elements.mode.value, values: Object.fromEntries(fields().map(field => [field.name, field.value]))}),
    restore(saved) {
      form.elements.mode.value = saved.mode;
      fields().forEach(field => { field.value = saved.values[field.name] ?? ''; });
      sync();
    },
    reset() { form.reset(); sync(); },
  };
}

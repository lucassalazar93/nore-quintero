import {changeQuantity, filterProducts, categories, selectionLines, selectionTotal, startingPrice, formatPrice, pricePerPortion, bestFit, relatedProducts, portionRange} from '../domain/catalog.js';
import {selectionMessage, customMessage, corporateMessage, withReason} from '../domain/messages.js';
import {nextOccasion} from '../domain/calendar.js';
/**
 * Repository port: {all(): Product[], funnel?(): {calendar, pairings, guestOptions, testimonials}}.
 * All selection state is session-only. Selection keys come from `lines()`.
 */
export function createStorefront(repository) {
  const products = repository.all();
  const lines = selectionLines(products);
  const funnel = repository.funnel?.() ?? {};
  let selection = new Map();
  let context = {};
  return {
    products: () => products,
    lines: () => lines,
    categories: () => categories(products),
    filter: category => filterProducts(products, category),
    entries: () => new Map(selection),
    change(key, delta) { selection = changeQuantity(selection, key, delta, lines); },
    total: () => selectionTotal(selection, lines),
    startingPrice,
    formatPrice,
    perPortion: pricePerPortion,
    sizes: product => lines.filter(line => line.product === product && portionRange(line.label)).length,
    fit: (product, guests) => bestFit(lines.filter(line => line.product === product), guests),
    related: (productIds, limit) => relatedProducts(products, productIds, funnel.pairings, limit),
    guestOptions: () => funnel.guestOptions ?? [],
    testimonials: () => funnel.testimonials ?? [],
    upcoming: now => (funnel.calendar ? nextOccasion(now, funnel.calendar, funnel.calendarWindowDays) : null),
    /**
     * Contexto de la consulta: `occasion`, `guests`, `delivery` (recoger o domicilio y sus datos) y `emoji`
     * (iconos en el mensaje, para teléfonos). Vive solo en memoria y viaja en el mensaje que arma la persona.
     */
    setContext(next) { context = {...context, ...next}; },
    context: () => ({...context}),
    /**
     * Tras enviar el pedido se empieza de cero: selección vacía y sin datos de la consulta anterior.
     * `snapshot` guarda lo que había (solo en memoria) por si la persona no alcanzó a enviarlo; `restore` lo devuelve.
     */
    snapshot: () => ({selection: new Map(selection), context: {...context}}),
    clear() { selection = new Map(); context = {emoji: context.emoji}; },
    restore(saved) { selection = new Map(saved.selection); context = {...saved.context}; },
    quote: () => selectionMessage(selection, lines, context),
    customize: request => customMessage(request, context),
    /** Servicios para empresas, con las opciones resueltas a productos reales del catálogo. */
    corporateServices: () => (funnel.corporate ?? []).map(service => ({
      ...service,
      options: service.options.map(id => products.find(product => product.id === id)).filter(Boolean).map(({id, name, description, category}) => ({id, name, description, category, prompt: (service.prompt ?? service.options).includes(id)})),
    })),
    /** La solicitud llega con ids (`services: [{id, quantity, options: [ids]}]`); el mensaje sale con nombres del catálogo. */
    corporate(request) {
      const services = (request.services ?? []).map(item => {
        const service = (funnel.corporate ?? []).find(entry => entry.id === item.id);
        if (!service) throw new Error('Servicio no disponible');
        const names = (item.options ?? []).filter(id => service.options.includes(id)).map(id => products.find(product => product.id === id)?.name).filter(Boolean);
        return {quantity: item.quantity, one: service.one, many: service.many, options: names, advice: Boolean(item.advice)};
      });
      return corporateMessage({...request, services}, context);
    },
    /** El motivo se suma a la consulta ya armada; nunca la reemplaza. */
    withReason: (message, reason) => withReason(message, reason, context),
  };
}
/** Browser capabilities arrive through ports; this layer never imports a browser API. */
export function createInquiryService({number, clipboard, messenger}) {
  return {
    enabled: Boolean(number),
    async deliver(message, consent) {
      if (number) {
        if (!consent) return 'consent-required';
        messenger.open(number, message);
        return 'opened';
      }
      try { await clipboard.copy(message); return 'copied'; }
      catch { return 'copy-unavailable'; }
    }
  };
}

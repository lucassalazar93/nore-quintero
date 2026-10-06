import {formatPrice, selectionTotal} from './catalog.js';

/**
 * Mensajes que la persona envía por WhatsApp. Reglas:
 * - Tono cercano, en primera persona, y ordenado por bloques para que la tienda lo lea de un vistazo.
 * - `emoji` añade un icono al inicio de cada dato (teléfonos); sin él, el mismo texto queda limpio (WhatsApp de escritorio).
 * - Lo que escribe la persona se limpia a una sola línea: un dato por renglón, siempre.
 */
const ICONS = {hello: '👋', total: '💰', guests: '👥', occasion: '🎉', reason: '🎉', delivery: '🛵', pickup: '🛍️', name: '🙋', address: '📍', notes: '📝', phone: '📞', email: '📧', date: '⏰', idea: '💡', thanks: '🍰', company: '🏢', needs: '🍽️', repeat: '🔁', service: '📦', budget: '💰'};
const tag = (emoji, name) => (emoji ? `${ICONS[name]} ` : '');
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const greeting = emoji => `¡Hola, Nore!${emoji ? ` ${ICONS.hello}` : ''}`;
const thanks = emoji => `¡Muchas gracias!${emoji ? ` ${ICONS.thanks}` : ''}`;

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** '2026-10-10' → 'sábado 10 de octubre'. Es una fecha de calendario, sin zona horaria. Lo que no sea una fecha se devuelve tal cual. */
export function friendlyDate(iso) {
  const text = clean(iso);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return text;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return text;
  return `${WEEKDAYS[date.getUTCDay()]} ${day} de ${MONTHS[month - 1]}`;
}

/** '12:30' → '12:30 p. m.'. Lo que no sea una hora se devuelve tal cual. */
export function friendlyTime(value) {
  const text = clean(value);
  const match = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return text;
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? 'a. m.' : 'p. m.'}`;
}

/** Entrega: `{mode: 'recoger' | 'domicilio', name, address, area, notes, phone, email, date, time}`. Solo salen los datos que existen. */
function deliveryLines(delivery, emoji) {
  if (!delivery) return [];
  const home = delivery.mode === 'domicilio';
  const field = name => clean(delivery[name]);
  const when = [friendlyDate(delivery.date), field('time').toLowerCase()].filter(Boolean).join(', ');
  return [
    `${tag(emoji, home ? 'delivery' : 'pickup')}Entrega: ${home ? 'a domicilio' : 'paso a recoger'}`,
    field('name') && `${tag(emoji, 'name')}A nombre de: ${field('name')}`,
    home && field('address') && `${tag(emoji, 'address')}Dirección: ${[field('address'), field('area')].filter(Boolean).join(' — ')}`,
    home && field('notes') && `${tag(emoji, 'notes')}Indicaciones: ${field('notes')}`,
    field('phone') && `${tag(emoji, 'phone')}Contacto: ${field('phone')}`,
    field('email') && `${tag(emoji, 'email')}Correo: ${field('email')}`,
    when && `${tag(emoji, 'date')}Fecha: ${when}`,
  ].filter(Boolean);
}
/** La pregunta final pide solo lo que falta por saber. */
function closing(complete, delivery, emoji) {
  const pending = [
    !complete && 'precios',
    'disponibilidad',
    !delivery ? 'cómo sería la entrega' : delivery.mode === 'domicilio' ? 'el valor del domicilio' : 'dónde lo recojo',
  ].filter(Boolean);
  return `¿Me confirmas ${pending.slice(0, -1).join(', ')} y ${pending.at(-1)}? ${thanks(emoji)}`;
}

export function selectionMessage(entries, lines, context = {}) {
  const {emoji = false, delivery = null} = context;
  const detail = line => (line.label ? ` — ${line.label}` : '') + (line.price ? ` (${formatPrice(line.price)})` : '');
  const {amount, complete} = selectionTotal(entries, lines);
  const items = [...entries].map(([key, quantity]) => {
    const line = lines.find(item => item.key === key);
    return `• ${quantity} × ${line.product.name}${detail(line)}`;
  });
  const facts = [
    complete && `${tag(emoji, 'total')}Total de referencia: ${formatPrice(amount)}`,
    context.occasion && `${tag(emoji, 'occasion')}Ocasión: ${clean(context.occasion)}`,
    context.guests && `${tag(emoji, 'guests')}Personas: ${clean(context.guests)}`,
  ].filter(Boolean);
  return [
    [`${greeting(emoji)} Me antojé de tu colección y me gustaría pedir:`],
    items,
    facts,
    deliveryLines(delivery, emoji),
    [closing(complete, delivery, emoji)],
  ].filter(block => block.length).map(block => block.join('\n')).join('\n\n');
}
export function customMessage({occasion, date, people, idea}, {emoji = false} = {}) {
  return [
    `${greeting(emoji)} Tengo una idea y me encantaría hacerla realidad contigo:`,
    [
      `${tag(emoji, 'occasion')}Ocasión: ${clean(occasion)}`,
      `${tag(emoji, 'date')}Fecha deseada: ${friendlyDate(date)}`,
      `${tag(emoji, 'guests')}Personas: ${clean(people)}`,
      `${tag(emoji, 'idea')}Mi idea: ${clean(idea) || 'Me gustaría recibir sugerencias.'}`,
    ].join('\n'),
    `¿Revisamos opciones y disponibilidad? ${thanks(emoji)}`,
  ].join('\n\n');
}

/**
 * Eventos y empresas. `request`: {services: [{quantity, one, many, options: [nombres], advice}], company, name, email, date, time,
 * frequency, address, area, service, budget, notes}. Tres bloques: quién, qué, y cuándo-dónde-cómo.
 */
export function corporateMessage(request, {emoji = false} = {}) {
  const field = name => clean(request[name]);
  const line = (icon, label, value) => value && `${tag(emoji, icon)}${label}: ${value}`;
  const needs = (request.services || []).filter(item => item.quantity > 0).map(item =>
    `• ${item.quantity} ${item.quantity === 1 ? item.one : item.many}${item.options?.length ? ` — ${item.options.join(', ')}` : item.advice ? ' — que Nore me recomiende' : ''}`);
  const when = [friendlyDate(request.date), friendlyTime(request.time)].filter(Boolean).join(', ');
  return [
    [`${greeting(emoji)} Quiero cotizar un evento para mi empresa:`],
    [line('company', 'Empresa', field('company')), line('name', 'Contacto', field('name')), line('email', 'Correo', field('email'))],
    needs.length ? [`${tag(emoji, 'needs')}Lo que necesito:`, ...needs] : [],
    [
      line('date', 'Fecha', when),
      line('repeat', 'Frecuencia', field('frequency').toLowerCase()),
      line('address', 'Lugar', [field('address'), field('area')].filter(Boolean).join(' — ')),
      line('service', 'Servicio', field('service').toLowerCase()),
      line('budget', 'Presupuesto', field('budget')),
      line('notes', 'Detalles', field('notes')),
    ],
    [`¿Me ayudas con una propuesta y disponibilidad? ${thanks(emoji)}`],
  ].map(block => block.filter(Boolean)).filter(block => block.length).map(block => block.join('\n')).join('\n\n');
}

const REASON = 'Motivo: ';
const reasonLine = /^(?:\S+ )?Motivo: /u;
/**
 * Añade el motivo de la consulta a un mensaje ya armado, lo cambia si ya tenía uno o lo quita (`reason` vacío).
 * El resto del mensaje no se toca: la selección, los datos del pedido o lo que la persona haya escrito se conservan.
 * Va antes del último párrafo (la pregunta de cierre); en un mensaje de un solo párrafo, al final.
 */
export function withReason(message, reason, {emoji = false} = {}) {
  const line = `${tag(emoji, 'reason')}${REASON}${reason}`;
  if (!message.trim()) return reason ? line : '';
  const lines = message.split('\n');
  const at = lines.findIndex(item => reasonLine.test(item));
  if (at >= 0) {
    // Se va la línea y, si estaba sola en su párrafo, también el renglón en blanco que la separaba.
    const alone = at > 0 && !lines[at - 1].trim() && (at === lines.length - 1 || !lines[at + 1].trim());
    lines.splice(alone ? at - 1 : at, alone ? 2 : 1);
  }
  if (!reason) return lines.join('\n');
  let last = lines.length - 1;
  while (last > 0 && !lines[last].trim()) last--;
  let start = last;
  while (start > 0 && lines[start - 1].trim()) start--;
  if (start === 0) return [...lines.slice(0, last + 1), '', line].join('\n');
  lines.splice(start, 0, line, '');
  return lines.join('\n');
}
export function validPreference(value, now) {
  return !!value && typeof value.maps === 'boolean' && Number.isFinite(value.expires) && value.expires > now;
}

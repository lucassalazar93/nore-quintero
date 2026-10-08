export function filterProducts(products, category = 'Todos') {
  return products.filter(product => category === 'Todos' || product.category === category);
}
export function categories(products) {
  return ['Todos', ...new Set(products.map(product => product.category))];
}
const slug = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/**
 * Unidades que se pueden elegir: una por presentación, o una sola si el producto no tiene presentaciones
 * (con su `price`, si lo tiene). `min` es el pedido mínimo de esa presentación; el del producto va en `product.min`.
 */
export function selectionLines(products) {
  return products.flatMap(product => product.presentations?.length
    ? product.presentations.map(({label, price, note, min, group}) => ({key: `${product.id}:${slug(label)}`, product, label, price: price ?? null, note: note ?? null, min: min ?? null, group: group ?? null}))
    : [{key: product.id, product, label: null, price: product.price ?? null, note: null, min: null, group: null}]);
}
export function startingPrice(product) {
  const prices = (product.presentations?.length ? product.presentations.map(item => item.price) : [product.price]).filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : null;
}
const productTotal = (entries, product, lines) =>
  lines.reduce((sum, line) => sum + (line.product === product ? entries.get(line.key) || 0 : 0), 0);
/**
 * Con cuántas unidades entra una línea a la selección: de a una, salvo que tenga pedido mínimo.
 * Si el mínimo es de la presentación, entra con ese mínimo; si es del producto, con lo que falte para alcanzarlo.
 */
export function firstQuantity(entries, key, lines) {
  const line = lines.find(item => item.key === key);
  if (!line) throw new Error('Producto desconocido');
  if (entries.get(key)) return 1;
  if (line.min) return line.min;
  return line.product.min ? Math.max(1, line.product.min - productTotal(entries, line.product, lines)) : 1;
}
/**
 * Lo elegido que aún no cumple su pedido mínimo. Por presentación (`label` con valor) o por producto,
 * sumando sus presentaciones (`label: null`). `key` es la línea a la que conviene sumarle lo que falta.
 */
export function minimumIssues(entries, lines) {
  const issues = [];
  const checked = new Set();
  for (const [key, quantity] of entries) {
    const line = lines.find(item => item.key === key);
    if (!line) continue;
    if (line.min && quantity < line.min) issues.push({key, product: line.product, label: line.label, required: line.min, current: quantity});
    const {product} = line;
    if (!product.min || checked.has(product)) continue;
    checked.add(product);
    const total = productTotal(entries, product, lines);
    if (total < product.min) issues.push({key, product, label: null, required: product.min, current: total});
  }
  return issues;
}
export function formatPrice(amount) {
  return '$' + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
/** Suma de los productos con precio; `complete` indica que todos los elegidos tienen precio. */
export function selectionTotal(entries, lines) {
  let amount = 0, complete = entries.size > 0;
  for (const [key, quantity] of entries) {
    const price = lines.find(line => line.key === key)?.price;
    if (Number.isFinite(price)) amount += price * quantity; else complete = false;
  }
  return {amount, complete};
}
export function changeQuantity(entries, key, delta, lines) {
  if (!lines.some(line => line.key === key)) throw new Error('Producto desconocido');
  if (!Number.isInteger(delta)) throw new Error('Cantidad inválida');
  const next = new Map(entries);
  const quantity = Math.max(0, (next.get(key) || 0) + delta);
  if (quantity) next.set(key, quantity); else next.delete(key);
  return next;
}
/** «8-10 porciones» → {min: 8, max: 10}. «Personal» o «Caja x 12» no tienen rango: devuelven null. */
export function portionRange(label) {
  const match = /(\d+)\s*-\s*(\d+)\s*porciones?/i.exec(label || '');
  return match ? {min: Number(match[1]), max: Number(match[2])} : null;
}
/** Precio aproximado por porción (punto medio del rango), redondeado a 100 pesos. */
export function pricePerPortion(price, label) {
  const range = portionRange(label);
  if (!range || !Number.isFinite(price)) return null;
  return Math.round(price / ((range.min + range.max) / 2) / 100) * 100;
}
/** La presentación más pequeña cuyo máximo alcanza para esa cantidad de personas (o la mayor, si ninguna alcanza). */
export function bestFit(lines, guests) {
  if (!Number.isFinite(guests)) return null;
  const ranged = lines.map(line => ({line, range: portionRange(line.label)})).filter(item => item.range)
    .sort((a, b) => a.range.max - b.range.max);
  if (!ranged.length) return null;
  return (ranged.find(item => item.range.max >= guests) ?? ranged[ranged.length - 1]).line;
}
/** Productos que combinan con lo elegido: por producto y por sección, sin repetir ni sugerir lo que ya está en la selección. */
export function relatedProducts(products, selectedIds, pairings = {}, limit = 3) {
  const taken = new Set(selectedIds);
  const found = [];
  const consider = id => {
    const product = products.find(item => item.id === id);
    if (product && !taken.has(id) && !found.includes(product)) found.push(product);
  };
  for (const id of selectedIds) {
    pairings.byProduct?.[id]?.forEach(consider);
    const product = products.find(item => item.id === id);
    if (product) pairings.bySection?.[product.category]?.forEach(consider);
  }
  return found.slice(0, limit);
}

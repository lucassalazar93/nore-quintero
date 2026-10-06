/**
 * Favoritos: los productos que la persona guarda para volver a ellos en otra visita.
 * Storage port: read() devuelve lo guardado (o cualquier cosa, si alguien lo alteró) y write(ids) lo conserva.
 * Solo sobreviven ids que existen en el catálogo: un producto retirado deja de ser favorito sin romper nada.
 */
export function createFavorites({storage, ids}) {
  const known = new Set(ids);
  const saved = storage.read();
  let list = Array.isArray(saved) ? [...new Set(saved.filter(id => known.has(id)))] : [];
  return {
    list: () => [...list],
    has: id => list.includes(id),
    /** Guarda o quita; devuelve `true` si quedó guardado. */
    toggle(id) {
      if (!known.has(id)) throw new Error('Producto no disponible');
      const on = !list.includes(id);
      list = on ? [...list, id] : list.filter(item => item !== id);
      storage.write(list);
      return on;
    },
  };
}

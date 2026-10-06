export function createPreferenceStorage(key) {
  return {
    read() { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } },
    write(value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Memory state remains usable. */ } }
  };
}
export const clipboard = {copy: text => navigator.clipboard.writeText(text)};
export const messenger = {
  open(number, text) {
    if (!/^\d{7,15}$/.test(number)) throw new Error('Número internacional inválido');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    // En el teléfono, el enlace lo recibe la aplicación de WhatsApp. Abrirlo en una pestaña nueva dejaba esa pestaña
    // en blanco (about:blank) y la persona volvía a ella en lugar de a la tienda. Como enlace normal, dentro del mismo
    // toque, el sistema abre WhatsApp y la tienda se queda donde estaba, con su mensaje de gracias.
    if (matchMedia('(hover: none) and (pointer: coarse)').matches) {
      const link = Object.assign(document.createElement('a'), {href: url, rel: 'noopener noreferrer'});
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      return;
    }
    // En el computador, WhatsApp Web se abre en otra pestaña y la tienda sigue abierta en la suya.
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
export function renderMap(container, allowed) {
  if (!allowed) { container.replaceChildren(); return; }
  if (container.querySelector('iframe')) return;
  const frame = document.createElement('iframe');
  frame.title = 'Mapa de Medellín, Antioquia, Colombia';
  frame.referrerPolicy = 'no-referrer';
  frame.loading = 'lazy';
  frame.src = 'https://www.google.com/maps?q=Medell%C3%ADn%2CAntioquia%2CColombia&z=12&output=embed';
  frame.allowFullscreen = true;
  container.append(frame);
}

export const $ = selector => document.querySelector(selector);
/** Abre un diálogo y cierra los demás. Si ya estaba abierto, solo vuelve al inicio: su contenido cambió en el sitio. */
export function show(id) {
  const dialog = $(id);
  const others = [...document.querySelectorAll('dialog[open]')].filter(other => other !== dialog);
  if (others.length && !dialog.open) {
    // De un diálogo a otro, el fondo se entrega sin fundirse dos veces (modal.css: `.handoff`).
    const pair = [dialog, ...others];
    pair.forEach(el => el.classList.add('handoff'));
    setTimeout(() => pair.forEach(el => el.classList.remove('handoff')), 450);
  }
  others.forEach(other => other.close());
  if (!dialog.open) dialog.showModal();
  const body = dialog.querySelector('.modal-body');
  if (body) body.scrollTop = 0;
  // El foco va al diálogo, no al botón de cerrar: el lector anuncia su título y no aparece un anillo sin motivo.
  dialog.focus({preventScroll: true});
}

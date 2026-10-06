/**
 * Validación guiada. En vez del globo del navegador (pequeño y distinto en cada teléfono), el dato que falta
 * se marca en su sitio y dice qué hacer, en español. Al escribir, la marca se va.
 *
 * `guided(form, messages)` devuelve una función `check()`: `true` si todo está bien; si no, marca cada falta,
 * lleva a la primera y devuelve `false`. `messages` es {nombreDelCampo: 'qué falta'}.
 */
const FALLBACK = {
  valueMissing: 'Falta este dato.',
  typeMismatch: 'Revisa el correo. Ejemplo: nombre@gmail.com',
  rangeUnderflow: 'Elige una fecha de hoy en adelante.',
};

export function guided(form, messages = {}) {
  form.noValidate = true;
  const clear = field => {
    if (!field?.classList?.contains('invalid')) return;
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
    field.closest('label')?.querySelector('.field-error')?.remove();
  };
  form.addEventListener('input', event => clear(event.target));
  form.addEventListener('change', event => clear(event.target));
  form.addEventListener('reset', () => [...form.elements].forEach(clear));
  const reason = field => {
    const kind = ['valueMissing', 'typeMismatch', 'rangeUnderflow'].find(key => field.validity[key]);
    return (kind === 'valueMissing' && messages[field.name]) || FALLBACK[kind] || 'Revisa este dato.';
  };
  return () => {
    const missing = [...form.elements].filter(field => field.willValidate && !field.checkValidity());
    missing.forEach(field => {
      clear(field);
      field.classList.add('invalid');
      field.setAttribute('aria-invalid', 'true');
      const note = Object.assign(document.createElement('small'), {className: 'field-error', textContent: reason(field)});
      note.setAttribute('role', 'alert');
      field.closest('label')?.append(note);
    });
    if (missing[0]) {
      missing[0].scrollIntoView({block: 'center', behavior: 'smooth'});
      missing[0].focus({preventScroll: true});
    }
    return !missing.length;
  };
}

/** Sacude un elemento para señalar «aquí falta algo». Sin movimiento si la persona lo pidió así. */
export function nudge(element) {
  if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.animate([{translate: '0 0'}, {translate: '-7px 0'}, {translate: '6px 0'}, {translate: '-4px 0'}, {translate: '0 0'}], {duration: 380, easing: 'ease-out'});
}

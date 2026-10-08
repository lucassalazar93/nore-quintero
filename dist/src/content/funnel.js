// Contenido del embudo de ventas: calendario, combinaciones, tamaños por número de personas y opiniones.
//
// Regla de la casa: solo se muestra lo que es verdad. Nada de escasez inventada, contadores falsos,
// reseñas que no existan ni "los más vendidos" sin datos. La urgencia sale del calendario real.
//
// Fechas especiales de Colombia. `when` es una fecha fija {month (0-11), day} o el n-ésimo día de la semana
// {month, weekday (0 = domingo), nth (-1 = último)}. Si falta menos de `windowDays`, se avisa en la página.
export const calendar = [
  {id:'ninos', name:'el Día de los Niños', when:{month:3, weekday:6, nth:-1}, section:'Tortas'},
  {id:'madre', name:'el Día de la Madre', when:{month:4, weekday:0, nth:2}, section:'Anchetas'},
  {id:'padre', name:'el Día del Padre', when:{month:5, weekday:0, nth:3}, section:'Anchetas'},
  {id:'amistad', name:'Amor y Amistad', when:{month:8, weekday:6, nth:3}, section:'Anchetas'},
  {id:'halloween', name:'Halloween', when:{month:9, day:31}, section:'Postres'},
  {id:'navidad', name:'la Navidad', when:{month:11, day:25}, section:'Tortas'},
  {id:'mujer', name:'el Día de la Mujer', when:{month:2, day:8}, section:'Anchetas'},
];
export const calendarWindowDays = 45;

// «Va muy bien con…»: sugerencias de la casa, no estadísticas. Se pueden afinar sin tocar el código.
// Por producto tiene prioridad; por sección completa lo que falte.
export const pairings = {
  byProduct: {},
  bySection: {
    'Postres': ['alfajores', 'cookies-levain', 'panacotas'],
    'Galletas y alfajores': ['brownie', 'panacotas', 'tortas-2'],
    'Tortas': ['alfajores', 'panacotas', 'brownie'],
    'Anchetas': ['alfajores', 'tortas-2', 'brownie'],
    'Salados': ['pave-klim', 'brownie', 'alfajores'],
    'Almuerzos': ['brownie', 'panacotas', 'pave-klim'],
    'Refrigerios': ['brownie', 'alfajores', 'cookies-levain'],
  },
};

// «¿Para cuántas personas?»: cada opción usa una cantidad representativa para elegir el tamaño.
export const guestOptions = [
  {label:'2-4', guests:3}, {label:'5-6', guests:6}, {label:'7-10', guests:9}, {label:'11-16', guests:14}, {label:'17 o más', guests:22},
];

// Opiniones reales de clientes, con su permiso. Vacío = la sección no aparece.
// Formato: {name:'María', context:'Torta de cumpleaños', text:'…'}
export const testimonials = [];

// Eventos y empresas: lo que se puede cotizar en cantidad. Cada servicio apunta a productos reales del catálogo
// (`options`, por id): sus nombres aparecen como opciones para elegir. `one` / `many` es como se nombra en el mensaje.
// Para ofrecer algo nuevo a empresas, primero agrégalo al catálogo y luego pon su id aquí.
// `prompt` son los productos pensados para grupos: en su ficha, su sección y la selección aparece el aviso
// «¿Es para tu empresa?». Sin `prompt`, todos los de `options` lo muestran. Un brownie suelto no debe mostrarlo.
export const corporate = [
  {id:'almuerzos', label:'Almuerzos', one:'almuerzo', many:'almuerzos', options:['costillas-bbq', 'montanera', 'lasana']},
  {id:'refrigerios', label:'Refrigerios y desayunos', one:'refrigerio', many:'refrigerios', options:['snack-express', 'caja-snack', 'sandwich-cubano', 'arepa-rellena', 'amasijos'], prompt:['snack-express', 'caja-snack', 'arepa-rellena', 'amasijos']},
  {id:'dulces', label:'Postres o mesa dulce', one:'porción de postre', many:'porciones de postre', options:['alfajores', 'brownie', 'cookies-levain'], prompt:[]},
  {id:'detalles', label:'Cajas y detalles para regalar', one:'caja o detalle', many:'cajas o detalles', options:['caja-tradicion', 'caja-brunch', 'celebra-la-vida', 'caja-deluxe'], prompt:[]},
];

// Catálogo por secciones. Cada sección es una categoría del filtro.
//
// Agregar un producto  → añade una línea dentro de `items` de su sección.
// Reordenar            → mueve la línea (o el bloque completo de la sección).
//                        El orden de las secciones es el orden de los filtros.
// Sección nueva        → añade un bloque {section:'Nombre', items:[...]}.
//
// Campos del producto:
//   id            único, sin espacios ni acentos, en minúsculas. No repetir entre secciones.
//                 No cambia al renombrar el producto: déjalo como está.
//   name          nombre visible en la tarjeta y en el detalle.
//   tag           etiqueta corta sobre la foto, en mayúsculas.
//   description   texto corto para la tarjeta.
//   detail        texto del diálogo al abrir el producto.
//   image         archivo dentro de dist/assets/, por ejemplo 'alfajores-artesanales.webp'.
//                 Con `null` se usa la ilustración genérica de respaldo.
//   gallery       (opcional) otras fotos del mismo producto, también dentro de dist/assets/.
//   focus         (opcional) qué parte de una foto vertical queda a la vista al recortarla,
//                 como CSS object-position: '50% 10%' prioriza la parte de arriba.
//   presentations (opcional) tamaños o formatos: {label, price, note?}. `price` en pesos
//                 colombianos, número entero sin puntos (55000). `note` es una línea extra bajo
//                 la presentación. Sin `presentations` el producto se cotiza sin precio.
//                 La etiqueta (`label`) forma la clave de la selección: no repetirla en un producto.
//                 La categoría NO se escribe aquí: la aporta la sección.
//
// Fuente de nombres, presentaciones, descripciones y precios: Productos_Precios_Nore_Quintero.xlsx.
// Sin descripción ni precio en esa hoja → texto provisional sin precio, por confirmar con el negocio.
// La sección «Personalizados» sigue con textos de muestra: la hoja no trae datos para ella.
export const catalog = [
{section:'Postres',items:[
 {id:'pave-klim',name:'Pavé Cremoso de Leche Klim',image:'pave-leche-klim.webp',tag:'NOSTÁLGICO Y RECONFORTANTE',description:'Un postre de cuchara irresistible que combina capas de suaves galletas Ducales con una delicada y cremosa natilla de Leche Klim horneada en casa.',detail:'Un postre de cuchara irresistible que combina capas de suaves galletas Ducales con una delicada y cremosa natilla de Leche Klim horneada en casa. Dulce en su punto justo, nostálgico y reconfortante.',presentations:[{label:'Personal',price:18000},{label:'8-10 porciones',price:80000}]},
 {id:'brownie',name:'Brownie Melcochudo',image:'brownie-melcochudo.webp',tag:'ANTOJO DE CHOCOLATE',description:'El equilibrio perfecto entre una fina capa crujiente y un centro húmedo e intenso de puro chocolate, acompañado de un toque crocante de nueces.',detail:'El equilibrio perfecto entre una fina capa crujiente y un centro húmedo e intenso de puro chocolate, acompañado de un toque crocante de nueces. Intenso, suave e irresistible.',presentations:[{label:'Caja x 12 mini (decorados con ganache y nuez)',price:30000},{label:'Personal decorados',price:10000},{label:'Personal sin decoración',price:8000}]},
 {id:'cookies-levain',name:'Cookies Estilo Levain',image:'cookies-levain.webp',tag:'CRUJIENTES Y MELCOCHUDAS',description:'Galletas doradas y crujientes por fuera con un corazón suave y melcochudo, cargadas de chips de chocolate y nueces.',detail:'Galletas doradas y crujientes por fuera con un corazón suave y melcochudo, cargadas de chips de chocolate y nueces. También en versión rellena, con un centro cremoso y fluido.',presentations:[{label:'Tradicional',price:11000,note:'Galletas doradas y crujientes por fuera con un corazón suave y melcochudo, cargadas de chips de chocolate y nueces.'},{label:'Rellena',price:13000,note:'Nuestra galleta artesanal insignia con un centro cremoso y fluido a elección: Arequipe o Nutella.'}]},
]},
{section:'Tortas',items:[
 {id:'tres-leches',name:'Torta tres leches',image:'torta-tres-leches.webp',tag:'SUAVE Y HÚMEDA',description:'Bizcochuelo jugoso y super húmedo, bañado en nuestra mezcla especial de lácteos y coronado con una capa ligera de crema.',detail:'Bizcochuelo jugoso y super húmedo, bañado en nuestra mezcla especial de lácteos y coronado con una capa ligera de crema.',presentations:[{label:'Personal porción',price:14000},{label:'4-6 porciones',price:32000},{label:'8-10 porciones',price:55000},{label:'14-16 porciones',price:79000}]},
 {id:'tortas-2',name:'Torta de Chocolate',image:'torta-chocolate.webp',tag:'UN CLÁSICO QUE NUNCA FALLA',description:'Esponjosa, suave y profundamente chocolatosa. Bañada con una cremosa capa de ganache, el toque justo de arequipe y un crujiente final de nueces.',detail:'Esponjosa, suave y profundamente chocolatosa. Bañada con una cremosa capa de ganache, el toque justo de arequipe y un crujiente final de nueces.',presentations:[{label:'Mini 2-4 porciones',price:30000},{label:'4-6 porciones',price:45000},{label:'8-10 porciones',price:65000},{label:'14-16 porciones',price:85000},{label:'24-26 porciones',price:120000}]},
 {id:'tortas-3',name:'Torta de Zanahoria',image:'torta-zanahoria.webp',tag:'CASERA Y ESPECIADA',description:'Un bizcocho húmedo y aromático con toques especiados, acompañado de una suave y delicada cubierta de queso crema.',detail:'Un bizcocho húmedo y aromático con toques especiados, acompañado de una suave y delicada cubierta de queso crema.',presentations:[{label:'Mini 2-4 porciones',price:22000},{label:'4-6 porciones',price:32000},{label:'8-10 porciones',price:52000},{label:'14-16 porciones',price:78000}]},
 {id:'tortas-1',name:'Torta Redvelvet',image:'torta-redvelvet.webp',tag:'PARA COMPARTIR',description:'El equilibrio perfecto entre un bizcocho de terciopelo rojo, una fresca mermelada de frutos rojos y nuestra cremosa cubierta de queso.',detail:'El equilibrio perfecto entre un bizcocho de terciopelo rojo, una fresca mermelada de frutos rojos y nuestra cremosa cubierta de queso.',presentations:[{label:'Mini 2-4 porciones',price:30000},{label:'4-6 porciones',price:45000},{label:'8-10 porciones',price:65000},{label:'14-16 porciones',price:85000},{label:'24-26 porciones',price:120000}]},
 {id:'almohabana',name:'Torta de Almohabana',image:'torta-almohabana.webp',tag:'SABOR DE NUESTRA TIERRA',description:'Una propuesta artesanal única tipo pudín, que rescata el sabor tradicional y la textura reconfortante de nuestra tierra.',detail:'Una propuesta artesanal única tipo pudín, que rescata el sabor tradicional y la textura reconfortante de nuestra tierra.',presentations:[{label:'Mini 2-4 porciones',price:26000},{label:'8-10 porciones',price:55000},{label:'Caja x 6 muffins',price:54000},{label:'Caja x 12 muffins',price:95000}]},
 {id:'chocoflan',name:'Chocoflan',image:'chocoflan.webp',tag:'LO MEJOR DE DOS MUNDOS',description:'Lo mejor de dos mundos en un solo bocado: La densidad de una buena torta de chocolate con la suavidad de un plan de vainilla horneado.',detail:'Lo mejor de dos mundos en un solo bocado: La densidad de una buena torta de chocolate con la suavidad de un plan de vainilla horneado.',presentations:[{label:'8-10 porciones',price:75000},{label:'14-16 porciones',price:120000}]},
]},
{section:'Tartas vascas',items:[
 {id:'vasca',name:'Tarta vasca',image:'tarta-vasca.webp',tag:'UN CLÁSICO EXQUISITO',description:'Un clásico horneado de centro cremoso que se funde en la boca, con una superficie dorada y un sabor delicado.',detail:'Un clásico horneado de centro cremoso que se funde en la boca, con una superficie dorada y un sabor delicado.',presentations:[{label:'4-6 porciones',price:55000},{label:'8-10 porciones',price:89000},{label:'14-16 porciones',price:125000}]},
]},
{section:'Alfajores',items:[
 {id:'alfajores',name:'Alfajores Artesanales',image:'alfajores-artesanales.webp',tag:'PEQUEÑOS PLACERES',description:'Suaves galletas artesanales de textura ultra delicada que se deshacen en la boca, abundantes en un cremoso relleno de arequipe de la casa y un elegante toque final.',detail:'Suaves galletas artesanales de textura ultra delicada que se deshacen en la boca, abundantes en un cremoso relleno de arequipe de la casa y un elegante toque final. Un clásico que enamora a la primera mordida.',presentations:[{label:'Caja mini x 12',price:30000},{label:'Alfajor de corazón',price:7000},{label:'Alfajor redondo mediano',price:3500}]},
]},
{section:'Desayunos sorpresa',items:[
 {id:'desayuno-corporativo',name:'Desayunos Corporativos',image:'desayuno-corporativo.webp',tag:'PARA TU EQUIPO',description:'Desayuno empacado en caja, listo para entregar a tu equipo.',detail:'Desayuno empacado en caja, listo para entregar a tu equipo. Consulta el contenido, las cantidades, la zona de entrega, el horario y el precio al cotizar.'},
 {id:'desayuno-corporativo-fruta',name:'Desayuno Corporativo Fruta',image:'desayuno-corporativo-fruta.webp',tag:'CON FRUTA',description:'Desayuno corporativo que incluye fruta.',detail:'Desayuno corporativo que incluye fruta. Consulta el contenido, las cantidades, la zona de entrega, el horario y el precio al cotizar.'},
 {id:'desayuno-alfajor',name:'Desayuno Personalizado Alfajor',image:'desayuno-alfajor.webp',tag:'CON ALFAJOR',description:'Desayuno personalizado que incluye alfajor.',detail:'Desayuno personalizado que incluye alfajor. Cuéntanos la ocasión, la dedicatoria, la dirección y el horario para cotizar.'},
 {id:'desayuno-amasijo',name:'Desayuno Personalizado Amasijo',image:'desayuno-amasijo.webp',tag:'CON AMASIJO',description:'Desayuno personalizado que incluye amasijo colombiano.',detail:'Desayuno personalizado que incluye amasijo colombiano. Cuéntanos la ocasión, la dedicatoria, la dirección y el horario para cotizar.'},
 {id:'desayuno-rosas',name:'Desayuno Sorpresa Rosas',image:'desayuno-sorpresa-rosas.webp',tag:'UN DETALLE CON ROSAS',description:'Desayuno sorpresa acompañado de rosas.',detail:'Desayuno sorpresa acompañado de rosas. Cuéntanos la ocasión, la dedicatoria, la dirección y el horario para cotizar.'},
 {id:'desayuno-torta',name:'Desayuno Personalizado Torta',image:'desayuno-torta.webp',gallery:['desayuno-torta-abierto.webp'],tag:'CON TORTA',description:'Desayuno personalizado que incluye una torta.',detail:'Desayuno personalizado que incluye una torta. Cuéntanos la ocasión, la dedicatoria, la dirección y el horario para cotizar.'},
 {id:'desayuno-cumpleanos',name:'Desayuno Personalizado Cumpleaños',image:'desayuno-cumpleanos.webp',focus:'50% 8%',tag:'EMPIEZA LA CELEBRACIÓN',description:'Desayuno personalizado para celebrar un cumpleaños.',detail:'Desayuno personalizado para celebrar un cumpleaños. Cuéntanos la fecha, la dedicatoria, la dirección y el horario para cotizar.'},
]},
{section:'Panacottas',items:[
 {id:'panacotas',name:'Panna Cotta Artesanal',image:'panna-cotta.webp',tag:'DELICADEZA EN CADA CUCHARADA',description:'Postre italiano frío de textura sedosa y delicada, servido con tu salsa de fruta natural preferida: Frutos Amarillos, Frutos Rojos o Duraznos.',detail:'Postre italiano frío de textura sedosa y delicada, servido con tu salsa de fruta natural preferida: Frutos Amarillos, Frutos Rojos o Duraznos.',presentations:[{label:'Individual vidrio',price:15000},{label:'Individual plástico',price:12000},{label:'Familiar',price:85000}]},
]},
{section:'Salados',items:[
 {id:'arepa-rellena',name:'Arepa Rellena',image:'arepa-rellena.webp',tag:'ANTOJO SALADO',description:'Arepa rellena para el antojo salado.',detail:'Arepa rellena. Consulta los rellenos, el tamaño, la presentación y el precio al cotizar.'},
 {id:'sandwich-artesanal',name:'Sandwich Artesanales',image:'sandwich-artesanal.webp',gallery:['sandwich-jamon-queso.webp'],tag:'ANTOJO SALADO',description:'Sándwiches artesanales para cualquier hora del día.',detail:'Sándwiches artesanales. Consulta los sabores, el tamaño, la presentación y el precio al cotizar.'},
 {id:'amasijos',name:'Amasijos Colombianos',image:'amasijos-colombianos.webp',tag:'TRADICIÓN COLOMBIANA',description:'Pandebonos, pan de yuca, pan de queso y tortas de almojábana.',detail:'Panaderías artesanales enfocadas 100% en amasijos colombianos (como pandebonos, pan de yuca, pan de queso y tortas de almojábana, además de innovaciones como el waffle de pan de yuca con mermelada de mora o helado).'},
]},
{section:'Personalizados',items:[
 {id:'personalizados',name:'Creaciones personalizadas',image:null,tag:'TAN ÚNICO COMO TU MOMENTO',description:'Tu idea convertida en un detalle inolvidable.',detail:'Cuéntanos la ocasión, la temática, los colores y la cantidad de personas. Preparemos una propuesta personalizada para esa fecha especial.'},
 {id:'personalizados-2',name:'Torta temática',image:null,tag:'DISEÑADA PARA LA OCASIÓN',description:'La torta que imaginaste, hecha realidad.',detail:'Torta decorada según tu temática, colores y personajes. Comparte una referencia, la fecha y el número de personas para cotizar.'},
 {id:'personalizados-3',name:'Mesa dulce',image:null,tag:'EL CENTRO DE LA FIESTA',description:'Varios dulces, una sola presentación.',detail:'Selección de postres, alfajores y detalles coordinados para tu evento. Cuéntanos el número de invitados y el estilo de la celebración.'},
 {id:'personalizados-4',name:'Detalle corporativo',image:null,tag:'PARA TU EQUIPO O TUS CLIENTES',description:'Un obsequio con el sello de tu marca.',detail:'Cajas y detalles dulces personalizados para empresas. Consulta opciones de presentación, marcación y cantidades por pedido.'},
]},
{section:'Almuerzos personalizados',items:[
 {id:'almuerzo-costilla',name:'Almuerzo Gourmet Costilla',image:'almuerzo-gourmet-costilla.webp',tag:'PARA UN ALMUERZO ESPECIAL',description:'Almuerzo gourmet con costilla.',detail:'Almuerzo gourmet con costilla. Consulta el menú, los acompañamientos, las cantidades, la zona de entrega, el horario y el precio al cotizar.'},
 {id:'almuerzo-tradicional',name:'Almuerzo Tradicional Colombiano',image:'almuerzo-tradicional.webp',tag:'SABOR COLOMBIANO',description:'Almuerzo tradicional colombiano.',detail:'Almuerzo tradicional colombiano. Consulta el menú, los acompañamientos, las cantidades, la zona de entrega, el horario y el precio al cotizar.'},
 {id:'lasana',name:'Lassaña Artesanal',image:'lasana-artesanal.webp',tag:'PARA LA HORA DEL ALMUERZO',description:'Lassaña artesanal para el almuerzo.',detail:'Lassaña artesanal. Consulta el tamaño, los acompañamientos, las cantidades, la zona de entrega, el horario y el precio al cotizar.'},
]},
];

/** Lista plana que consume el repositorio. La categoría proviene del nombre de la sección. */
export const products = catalog.flatMap(({section, items}) =>
  items.map(item => ({image: null, gallery: [], presentations: [], ...item, category: section})));

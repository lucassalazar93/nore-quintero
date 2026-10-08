# Preparación y publicación

## Abrir en local

Requisito: Node.js 22 o superior. No necesitas instalar paquetes.

Haz doble clic en `INICIAR-LOCAL.cmd`, en la carpeta superior, y abre http://127.0.0.1:3000. Mantén la ventana abierta; Ctrl+C detiene el servidor. Si ya está funcionando, basta con abrir la dirección.

También puedes abrir una terminal dentro de `nore-quintero` y ejecutar `npm run dev`.

## Agregar las fotografías

1. Guarda las fotos de productos en `dist/assets/`, por ejemplo `alfajores.webp`.
2. Abre `dist/src/content/products.js` y cambia `image:null` del producto correspondiente por `image:'alfajores.webp'`.
3. Guarda y recarga el navegador. La misma foto aparecerá en la tarjeta y en el detalle, sin editar la presentación. Con `null` se conserva la imagen ilustrativa actual.

Usa nombres sin espacios ni acentos, respetando mayúsculas y minúsculas. Recomendado: WebP o JPG, alrededor de 1200 píxeles y menos de 400 KB por foto. El encuadre se adapta al espacio de la tarjeta.

Otras imágenes se sustituyen directamente, conservando estos nombres (en WebP; los PNG originales de la versión anterior siguen en `dist/assets/` sin usarse y se pueden borrar):

| Archivo en `dist/assets/` | Uso |
| --- | --- |
| `logo.png` | Marca y favicon |
| `hero.webp` | Foto principal y tarta vasca ilustrativa |
| `protagonista.webp` | Historia, botón de asesoría y retrato del diálogo |
| `catalog.webp` | Mosaico ilustrativo de respaldo para productos sin foto |
| `regalos.webp` | Foto de la sección «Para celebrar» |

La sección «Para celebrar» ya usa una foto propia (`regalos.webp`). Para cambiarla, reemplaza el archivo en `dist/assets/` conservando el nombre, o edita el `src` dentro de `celebrate-photo` en `dist/index.html`. No reemplaces `catalog.webp` con una foto individual mientras siga sirviendo de respaldo para los productos sin foto.

## Completar los datos del negocio

- `dist/src/config/site.js`: escribe el WhatsApp internacional, solo dígitos, en `whatsappNumber`. Vacío permite copiar consultas sin enviarlas.
- `dist/src/content/products.js`: el catálogo sale de la hoja «Productos_Precios_Nore_Quintero» (nombres, descripciones, precios, contenido de cada caja y pedidos mínimos). Cuando cambie un precio o un mínimo en la hoja, cámbialo también aquí: la página no lee la hoja. Ver «Catálogo y pedidos mínimos» más abajo.
- `dist/index.html`: confirma historia, ciudad, cobertura y textos de las secciones. Actualiza la nota «Colección ilustrativa» cuando corresponda.
- `dist/src/infrastructure/browser.js`: si publicas una ubicación específica, actualiza el título y URL del mapa; actualiza también el enlace y textos de ubicación en `dist/index.html`.
- `dist/src/content/legal.js`: términos, pedidos y entregas, política de datos, cookies y derechos ya están redactados según cómo funciona la tienda (catálogo que arma un mensaje de WhatsApp, sin pagos ni base de datos), con el correo y el WhatsApp de `config/site.js`. **Pendiente del responsable**: añadir su identificación legal (nombre completo o razón social y NIT o cédula) en «Quiénes somos» y «Responsable», y confirmar que las condiciones descritas (cambios, cancelaciones, reclamos, conservación de datos) son las que el negocio aplica. No son asesoría legal: conviene que un profesional los revise antes de publicar.
- `dist/src/presentation/commerce.js`: cuando las fotos sean reales, actualiza el aviso del detalle «Imagen ilustrativa» si corresponde; confirma siempre ingredientes, alérgenos y disponibilidad.

No guardes contraseñas ni claves privadas aquí: todos los archivos de `dist` son públicos.

## Catálogo y pedidos mínimos

Siete secciones y 25 productos: exactamente los de la hoja de precios, ni uno más. El orden de las secciones (filtros y vista «Todos») es Postres, Galletas y alfajores, Tortas, Salados, Refrigerios, Almuerzos y Anchetas; en «Todos» cada sección sale con su título. Lo que viene de la hoja y lo que decidió el desarrollo:

- **De la hoja, tal cual**: nombres, descripciones, precios, lo que incluye cada caja o menú, los mínimos (10 unidades en Arepa Rellena, Costillas BBQ, Lasaña Gourmet, Snack Express, Caja Snack y en cada amasijo horneado), la reserva de amasijos con 24 horas y las instrucciones de horneado. Se corrigieron dos erratas («choco plan» → «chocoflan», «plastico» → «plástico»).
- **Decidido al integrar, por confirmar con Nore**:
  - La hoja no trae categorías: las secciones son de la casa. «Anchetas», «Almuerzos», «Tortas», «Galletas» y «Postres» y su orden los pidió el responsable; el resto se decidió al integrar: la Panna Cotta va en Postres, la Tarta vasca en Tortas, los alfajores con las galletas, y Salados y Refrigerios quedan entre las tortas y los almuerzos. Las etiquetas cortas sobre cada foto son resúmenes propios.
  - El mínimo de un producto con varias opciones se cuenta sobre el total del producto: 6 arepas de pollo + 4 de carne cumplen el mínimo de 10. En amasijos horneados el mínimo es por variedad.
  - Costillas BBQ: la opción sin acompañamientos se llama «Plato» (la hoja solo da el precio base y el del menú completo).
  - Arepa Rellena: los dos sabores se muestran como opciones al mismo precio.
  - «Montañera Tradicional» no tiene precio en la hoja: sale como «Por cotizar».
  - Los cuatro «Personalizados» de la versión anterior (Creaciones personalizadas, Torta temática, Mesa dulce, Detalle corporativo) no están en la hoja y se quitaron del catálogo. Los pedidos a medida siguen entrando por el formulario «Personalizar» y por el de empresas, con la opción «Que Nore me recomiende».
- **Fotos**: vienen de la carpeta de Drive; los 25 productos tienen foto propia. La foto sin nombre de la carpeta se usó como segunda foto de «Celebra la vida» (la caja cerrada); si es de otro producto, se cambia en `gallery`. `desayuno-torta-abierto.webp` salió del catálogo y está en `fotos-retiradas/`, sin borrar.

Cómo se aplica el mínimo en la página: la tarjeta dice «Mínimo 10», el detalle «Pedido mínimo: 10 unidades» y el botón «Agregar 10»: el primer toque agrega el mínimo completo. Si la persona baja la cantidad, la selección muestra un aviso con el botón «Completar a 10» y no deja preparar la cotización hasta cumplirlo. El formulario de empresas avisa lo mismo al elegir un producto con mínimo.

Campos del catálogo (explicados en la cabecera de `products.js`): `price` (precio único), `presentations` (opciones con precio; admiten `note`, `min` y `group` para agruparlas con un subtítulo), `min` (pedido mínimo del producto), `includes` (lista «Incluye»), `extra` (nota bajo esa lista), `steps` (instrucciones plegables) y `highlight` (el producto insignia: brilla en la colección y muestra ese texto como sello; hoy es Caja Deluxe con «La joya de la casa». Solo uno a la vez; para quitar el efecto, borra el campo. El texto es una frase de la casa: no pongas ahí «la más vendida» ni nada que no se pueda respaldar). `npm run check` valida que precios y mínimos sean enteros positivos y cuenta cuántos productos se cotizan y cuántos tienen mínimo.

## Embudo de ventas: qué confirmar y completar

El visitante elige en la colección (con tamaño guiado por número de personas), revisa su selección con complementos y envía una cotización por WhatsApp que ya lleva la ocasión y las personas. Todo sale de `dist/src/content/funnel.js`.

- **Vista previa al compartir el enlace**: `dist/assets/og-image.jpg` (1200×630, el logo sobre crema) es lo que muestran WhatsApp, Facebook o iMessage. Las etiquetas `og:` de `dist/index.html` usan la dirección pública del sitio (`url` en `config/site.js`, hoy `https://nore-quintero.vercel.app`). Si cambia el dominio, actualiza ambos; `npm run check` avisa si no coinciden. WhatsApp guarda la vista previa de un enlace ya compartido: para ver el cambio, comparte el enlace con algo distinto al final (por ejemplo `/?v=2`) o espera a que caduque.
- **Eventos y empresas** (`corporate` en `content/funnel.js`): cuatro servicios (almuerzos, refrigerios y desayunos, postres o mesa dulce, cajas y detalles para regalar), cada uno con productos reales del catálogo como opciones. Revisa qué se ofrece a empresas y con qué opciones. `prompt` indica en qué productos aparece el aviso «¿Es para tu empresa?» (los pensados para grupos; no los de uso personal). Los mínimos de la hoja se muestran junto a cada opción («mín. 10») y el formulario no deja enviar una cantidad menor. La página no promete anticipación ni cobertura fuera de lo que dice la hoja: el texto dice que las confirma Nore.
- **Favoritos**: se guardan en el navegador de cada persona (clave `nore-favorites-v1`), sin datos personales. No hay cuentas ni sincronización entre dispositivos.
- **Correo**: es opcional y solo viaja en el mensaje de WhatsApp; la tienda no lo recibe por otra vía. Usarlo para publicidad exige una autorización aparte. Un botón «Continuar con Google» para rellenarlo requeriría un identificador de Google Cloud del negocio, cargar código de Google y actualizar los textos legales: decisión del responsable.
- **Datos de entrega**: el paso «¿Cómo lo recibes?» pide nombre, fecha y, para domicilio, dirección, barrio, indicaciones y teléfono. No se guardan ni se envían desde la página: solo entran al mensaje de WhatsApp.
- **Fechas especiales** (`calendar`): el aviso «Se acerca…» se retiró de la página. Las fechas y su regla (45 días) siguen en `content/funnel.js` y `domain/calendar.js`, con pruebas, por si se quiere volver a mostrar en otro lugar; hoy no aparecen en ninguna parte.
- **Combinaciones** (`pairings`): «Va muy bien con…». Son sugerencias de la casa; ajústalas a tu criterio.
- **Tamaños por personas** (`guestOptions`): cada opción usa una cantidad representativa para elegir el tamaño que alcanza.
- **Opiniones** (`testimonials`): vacío a propósito. Agrega solo opiniones reales de clientes, con su permiso; la sección aparece sola. No se deben inventar opiniones, escasez ni números (la ley de protección al consumidor lo prohíbe).
- **Qué no hay y conviene decidir**: medios de pago, tiempos de anticipación, cobertura y costo de entrega. Si los defines, se pueden mostrar junto a «Pedir es sencillo» y en el detalle; hoy el sitio solo dice que se confirman antes de cualquier pedido.
- **Fotos para la rejilla**: al agregar una foto de producto, genera también su miniatura de 520 px en `dist/assets/sm/` con el mismo nombre; la rejilla móvil la usa para cargar rápido.
- **Medir**: no hay analítica, por tu política de privacidad. Para saber qué convierte haría falta una herramienta con consentimiento; es una decisión aparte.

## Validar y desplegar

Ejecuta desde `nore-quintero`:

```sh
npm run build
```

Ejecuta pruebas y valida sintaxis, imports, recursos, fotos configuradas y número de WhatsApp. No genera ni borra `dist`: esa carpeta ya contiene el sitio terminado. El resumen de pendientes es informativo; no certifica que el contenido comercial o legal esté completo.

Puedes subir **el contenido de `dist`** a cualquier alojamiento estático con HTTPS. `index.html` debe quedar en la raíz pública. No necesitas servidor Node en producción.

Para despliegue desde repositorio en Netlify o Vercel, selecciona `nore-quintero` como directorio raíz si el repositorio incluye la carpeta superior. Se incluyen `netlify.toml` y `vercel.json`: comando `npm run build`, salida `dist`. No hay variables de entorno obligatorias. El dominio se configura en el proveedor elegido.

Antes de compartir el dominio, comprueba desde móvil: catálogo, filtros, detalle, selección, formulario personalizado, enlace al número real de WhatsApp y preferencias del mapa.

## Alcance

El sitio ofrece catálogo y solicitudes de cotización. No incluye pagos, inventario, base de datos ni administración. Las selecciones se reinician al recargar. Las fuentes usan Google Fonts; el mapa requiere consentimiento. La publicación en una cuenta de alojamiento queda por realizar cuando elijas dónde alojarlo.

# Nore Quintero — frontend por capas

Frontend estático en JavaScript con módulos ES nativos. Sin backend, framework ni dependencias de ejecución. Conserva el diseño y el carrusel táctil; el catálogo sale de la hoja de precios de la tienda. `dist/` es el sitio completo y publicable; en este proyecto estático contiene el código fuente, no un resultado generado.

## Capas

| Directorio bajo `dist/src` | Responsabilidad |
| --- | --- |
| `domain/` | Reglas puras: filtros, cantidades, pedidos mínimos, mensajes y vigencia de preferencias. |
| `application/` | Casos de uso y estado temporal. Recibe repositorio, reloj y servicios por parámetros. |
| `infrastructure/` | Adaptadores del catálogo, almacenamiento local, portapapeles, WhatsApp y Google Maps. |
| `presentation/` | Plantillas DOM, eventos, diálogos, navegación, carrusel, estilos y movimiento (`motion.js`, `spring.js`). |
| `content/` | Catálogo y textos legales de revisión. |
| `config/` | Configuración pública de la tienda. Nunca guardar secretos. |
| `main.js` | Punto de composición: construye servicios y monta la interfaz una sola vez. |

Las dependencias del núcleo van hacia dentro: `application` importa `domain`; `domain` no importa otras capas. Las capas internas no usan DOM, almacenamiento ni APIs del navegador. La presentación recibe los casos de uso y el adaptador del mapa desde `main.js`; no crea servicios concretos. Los contratos se expresan mediante objetos pequeños, sin jerarquías de clases innecesarias.

## Ejecutar

Desde esta carpeta, ejecutar `npm run dev` y abrir http://127.0.0.1:3000. También puedes hacer doble clic en `INICIAR-LOCAL.cmd` en la carpeta superior. No abrir index.html mediante file://: los módulos ES necesitan un servidor HTTP.

No hay instalación ni compilación obligatoria. Para comprobar el proyecto con Node: `npm test` y `npm run check`. Las pruebas cubren reglas, casos de uso e independencia del estado; la comprobación valida sintaxis, imports, recursos y dirección de dependencias. No sustituyen las pruebas visuales en dispositivos.

## Editar sin cambiar la arquitectura

- Productos: `dist/src/content/products.js`, organizado por secciones. Cada sección es una categoría del filtro y su orden define el orden de los filtros y el de la vista «Todos», donde cada sección sale con su título. Para agregar un producto, añadir una línea a los `items` de su sección; para reordenar, mover la línea o el bloque. La categoría no se escribe en el producto: la aporta la sección. Para una foto real, guardar el archivo en `dist/assets/` y cambiar `image:null` por `image:'nombre.webp'` en el producto. `null` conserva la ilustración de respaldo. Tamaños y precios van en `presentations:[{label:'8-10 porciones',price:65000}]` (pesos enteros, sin puntos): cada presentación se elige y suma por separado en «Mi selección». Un producto de formato único lleva `price:85000`. Sin `presentations` ni `price` el producto sale como «Precio por cotizar». `min` es el pedido mínimo (del producto, sumando sus presentaciones, o de una presentación): el primer «Agregar» pone el mínimo completo y la selección no deja cotizar por debajo. `includes`, `extra` y `steps` añaden al detalle la lista «Incluye», una nota y unas instrucciones plegables. `gallery` añade fotos extra al detalle y `focus` ajusta el recorte de fotos verticales; ambos son opcionales y se explican en la cabecera de `products.js`.
- Contacto: `dist/src/config/site.js`. `email` es el correo de la tienda (pie de página y textos legales; `npm run check` avisa si el pie no coincide). WhatsApp: número internacional solo con dígitos. Vacío mantiene el modo de copiar consulta. Antes de activarlo, completar datos legales y proceso de consentimiento.
- Reglas y validaciones: `domain/`; flujos y estado: `application/`.
- Integración futura con un API: sustituir el repositorio mediante el punto de composición; revisar su contrato si pasa a ser asíncrono.
- Estilos: `presentation/styles/`. Se conserva el orden `base`, `boutique`, `responsive`, `pricing`, `funnel`, `shop`, `motion`, `modal` para mantener la apariencia aprobada. No reordenar sin comprobación visual. Todo lo de los diálogos (hojas inferiores, panel de selección, detalle del producto) vive en `modal.css`; su estructura `modal-bar` / `modal-body` / `modal-foot` se explica en `DESIGN.md`.
- Movimiento: `presentation/motion.js` (revelado por scroll, filtros, foto que viaja al detalle, vuelo a «Mi selección», hojas que se arrastran, fundido de fotos) y `presentation/styles/motion.css`. `presentation/spring.js` es una capa opcional con Motion 14.0.0 (`dist/vendor/`, MIT, carga diferida): botones magnéticos, profundidad de la portada, titulares palabra por palabra y cifras con resorte. Sin `prefers-reduced-motion` normal no hay vuelos ni resortes; si Motion no carga, el sitio queda igual sin esa capa. Las reglas de movimiento y la paleta están en `DESIGN.md`.
- Embudo de ventas: `content/funnel.js` (fechas especiales, combinaciones, tamaños por personas, opiniones), `presentation/funnel.js` (barra de selección, complementos), `presentation/delivery.js` (paso de entrega: recoger o domicilio), `presentation/corporate.js` (solicitud para eventos y empresas; los servicios se definen en `corporate` dentro de `content/funnel.js`), `application/favorites.js` (favoritos, guardados en el dispositivo con la clave `favoritesKey` de `config/site.js`), `domain/messages.js` (el mensaje que se arma: tono, bloques e iconos), `presentation/journey.js` (historia «Del horno a tu mesa») y las reglas puras en `domain/catalog.js` y `domain/calendar.js`. Solo se muestra lo verdadero: sin escasez, contadores ni opiniones inventadas. Qué completar, en `LISTO-PARA-PUBLICAR.md`.
- HTML semántico de secciones: `dist/index.html`. Eventos de UI: `presentation/`.

## Publicar y límites

Publicar todo el contenido de `dist/` en un alojamiento estático con HTTPS y soporte de módulos JavaScript. Conservar las rutas relativas. Se incluyen configuraciones para Netlify y Vercel. Consulta `LISTO-PARA-PUBLICAR.md` para completar contenido y desplegar. No incluir `.git`, pruebas ni scripts de desarrollo en la carpeta pública.

El catálogo, la selección, los datos de entrega y los mensajes viven en memoria durante la visita; solo la preferencia del mapa y la lista de favoritos se guardan localmente. No hay pagos, base de clientes, inventario ni panel administrativo. Textos legales e imágenes de productos siguen siendo de revisión. El mapa se carga tras consentimiento; las fuentes siguen usando Google Fonts.

Para Claude u otro desarrollador: mantener la paleta, el contenido y los flujos aprobados; respetar la dirección de dependencias; ejecutar las pruebas y la comprobación después de cada cambio; no introducir backend o framework sin una necesidad concreta.

# Diseño de Nore Quintero

Boutique de repostería y regalos en Medellín. Cálida, editorial, hecha a mano. Este documento fija lo que **no cambia** y las reglas de movimiento, para que cualquier mejora futura (humana o de un agente) conserve la identidad.

## Identidad (no cambia sin aprobación)

| Elemento | Valor |
| --- | --- |
| Vino | `--wine #650d28` (acciones, cinta superior, cierre) |
| Crema | `--cream #fff9ef` (fondo) |
| Oro | `--gold #97702d` (detalles, etiquetas pequeñas) |
| Oscuro / apagado / línea | `--dark #361b22` · `--muted #766568` · `--line #dacbbc` |
| Titulares | Cormorant Garamond 400–500, con la palabra clave en cursiva color vino |
| Texto e interfaz | DM Sans |
| Forma | Arcos: marcos de foto con esquinas superiores muy redondas, botones en píldora, modales de 28–32 px |
| Voz | Cercana, en español, sin lenguaje técnico. «Mi selección», «cotizar», «Del alma al paladar» |

Orden de hojas de estilo, sin reordenar: `base`, `boutique`, `responsive`, `pricing`, `funnel`, `shop`, `motion`, `modal`.

## Movimiento

Una idea rectora: **el sitio se despliega como un regalo**. Una portada ensayada una vez, y después el movimiento solo explica de dónde viene cada cosa o confirma una acción.

### Curvas y tiempos (en `motion.css`)

| Token | Valor | Uso |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(.23,1,.32,1)` | Entradas y salidas de interfaz |
| `--ease-in-out` | `cubic-bezier(.77,0,.175,1)` | Movimiento dentro de la pantalla (lente de filtros) |
| `--ease-drawer` | `cubic-bezier(.32,.72,0,1)` | Hojas inferiores, panel de selección y foto que viaja al detalle |
| `--ease-hero` | `cubic-bezier(.16,1,.3,1)` | Portada y revelados por scroll |

| Elemento | Duración |
| --- | --- |
| Pulsar un botón (`:active`) | 100–160 ms |
| Modal centrado: entrar / salir | 260–360 ms / 180 ms |
| Hoja inferior y panel lateral: entrar / salir | 500 ms / 300 ms |
| Lente de filtros | 420 ms |
| Foto tarjeta → detalle / vuelta | 480 ms / 380 ms |
| Miniatura a «Mi selección» | 680 ms |
| Portada (una vez) y revelados por scroll | 0,9–1,4 s |

### Reglas

1. Solo `transform`, `opacity`, `clip-path` y `filter` acotado. Propiedades individuales (`translate`, `scale`, `rotate`) para no pisar los `transform` de hover.
2. Nada de `ease-in`, `scale(0)` ni `transition: all`. Entradas desde `scale(.95–.97)` con opacidad.
3. El contenido es visible por defecto. Las clases `js`, `motion-ready`, `motion-failed` y `hero-go` las gestionan `index.html` y `motion.js`; si el script falla, a los 3,5 s todo se muestra.
4. Hover solo con `(hover: hover) and (pointer: fine)`. En táctil, la respuesta está en `:active`.
5. `prefers-reduced-motion`: sin vuelos, resortes ni transiciones de vista; el contenido aparece con un fundido. Los modales solo se funden.
6. Los revelados por scroll ocurren una vez y, al terminar, el elemento recupera sus propias transiciones.
7. Lo que se ve a diario no se anima: filtrar, abrir y cerrar con teclado, cambiar cantidades solo dan feedback mínimo.

### Piezas

- **Portada**: titular por líneas desde una máscara, foto que se abre como un arco, sello que se estampa. Con ratón, la foto «mira» al cursor y el sello flota.
- **Filtros**: una lente recortada desliza el color de un botón al siguiente; las tarjetas se reordenan con *View Transitions*.
- **Producto**: la foto de la tarjeta viaja al detalle y vuelve (con `Escape` también). Abrir otro producto desde el detalle cambia el contenido en el sitio.
- **Selección**: la miniatura vuela al botón «Mi selección», el botón muestra una marca, la barra inferior confirma con el nombre del producto y el total se acomoda con resorte. Al quitar un producto, su fila sale y las demás se deslizan a su lugar.
- **Fotos**: las que aún no han llegado esperan invisibles y se funden al cargar; el detalle muestra la miniatura mientras llega la foto grande.
- **Hilo de lectura y sección activa en el menú**: constantes y discretos.
- **Móvil**: hojas inferiores que suben desde abajo y se arrastran para cerrar; revelados breves y sin desenfoque.

## Modales (`modal.css`)

Los seis diálogos comparten una estructura: `dialog.modal > .modal-bar` (fija, con el botón de cerrar) `+ .modal-body` (lo único que se desplaza) `+ .modal-foot` (fija, opcional, para la acción principal). Nada pasa por debajo del botón de cerrar: al desplazar, la barra se vuelve opaca.

| Presentación | Dónde | Detalle |
| --- | --- | --- |
| Hoja inferior | ≤ 760 px, todos | Sube desde abajo, la barra es el agarre (arrastrar para cerrar), sin desenfoque de fondo para mantener 60 fps |
| Tarjeta centrada | ≥ 761 px | Personalizar, asesoría, textos legales y preferencias |
| Detalle en dos columnas | ≥ 960 px o pantalla apaisada | Foto fija en su arco a la izquierda; a la derecha se elige y se desplaza |
| Panel lateral | ≥ 761 px, «Mi selección» | Entra desde la derecha a todo el alto; título arriba, total y «Preparar mi cotización» siempre abajo |

Reglas: el foco entra al diálogo (no al botón de cerrar) y vuelve a quien lo abrió; `Escape` y un toque en el fondo cierran; de un modal a otro el fondo no parpadea; **no hay avisos flotantes**: la barra de selección confirma lo agregado y una región oculta lo anuncia a lectores de pantalla.

## Experiencia y embudo (móvil primero)

La mayor parte de las visitas llega desde el teléfono, así que el flujo se diseña para una mano y una decisión a la vez:

1. **Portada corta**: titular, una frase y un botón. El primer producto asoma en la primera pantalla (antes: a las 8 pantallas).
2. **Colección**: sin título ni avisos encima; filtros fijos bajo el encabezado y rejilla de 2 columnas (3 en tabletas) con miniaturas livianas. Cada tarjeta dice solo nombre, «Desde $» y un botón; toda la tarjeta abre el detalle.
3. **Hoja inferior** (móvil) o detalle en dos columnas (PC): foto, precio «Desde», «¿Para cuántas personas?», cada tamaño con su precio y botón «Agregar», precio por porción, «Va muy bien con…» y «Pregúntale a Nore». Se cierra arrastrando hacia abajo.
4. **Barra de selección**: aparece al agregar, confirma lo agregado y lleva al resumen (hoja en móvil, panel lateral en PC) con miniaturas, complementos, garantías («No pagas nada aquí») y el total con el botón de cotizar siempre visibles.
5. **Entrega** («¿Cómo lo recibes?»): «Lo recojo» o «A domicilio». Pide solo lo necesario: nombre y fecha siempre; dirección y barrio si es domicilio; indicaciones, teléfono de quien recibe, correo y hora son opcionales. El correo usa `autocomplete="email"`: el navegador ofrece el guardado en el dispositivo o en la cuenta (la página no puede leerlo por su cuenta). Se puede saltar («Prefiero coordinar la entrega por WhatsApp»). Los datos viven en memoria y solo entran al mensaje.
6. **Mensaje por WhatsApp**: cercano y ordenado por bloques (pedido, total y personas, entrega, pregunta final que pide solo lo que falta). En el teléfono cada dato lleva un icono; en el computador va sin iconos. Los botones de motivo añaden una línea «Motivo:» y nunca reemplazan un mensaje ya armado. El consentimiento y el botón de enviar quedan siempre a la vista.
7. **Gracias y volver a empezar**: al abrir WhatsApp, el pedido se limpia (selección, entrega, motivo) y queda una pantalla de agradecimiento que la persona encuentra al volver, con «Hacer otro pedido». La página no puede saber si el mensaje se envió: por eso el texto no lo afirma y ofrece «Recuperar mi pedido», que devuelve todo tal como estaba (se conserva solo en memoria).
8. **Favoritos**: un corazón en cada tarjeta y en el detalle; filtro «Favoritos» en la colección y enlace en el menú. Se guardan solo en el dispositivo (`nore-favorites-v1`), sin datos personales. El corazón es un SVG: los caracteres de corazón se vuelven emoji en iPhone.
9. **Empresas y eventos**: un camino aparte del pedido personal, con el mismo nombre y el mismo botón («Cotizar para mi empresa») en todas partes.
   - *Dónde se entra*: enlace «Empresas» en el menú; sección propia «¿Es para tu empresa?» con lo que se cotiza por cantidad; y un aviso idéntico en cada punto donde alguien puede dudar: la sección de la colección que también se cotiza por cantidad, la ficha de esos productos, «Mi selección» (lleva lo ya elegido) y la asesoría («Es para mi empresa»).
   - *Dónde no aparece*: en productos de uso personal (un brownie, una torta). Lo decide `prompt` en `content/funnel.js`.
   - *La solicitud*, en tres bloques. Qué: cantidad aproximada por servicio y, al escribirla, las opciones reales del catálogo. Cuándo y dónde: fecha, hora, lugar, frecuencia y forma de servicio. A quién: empresa, contacto, correo, presupuesto y detalles. Obligatorio solo lo imprescindible. El formulario guía con órdenes cortas justo donde hay que actuar, porque la gente no lee instrucciones largas: «Primero la cantidad» → el servicio se resalta y marca su aro; «Ahora elige el producto» → su punto late hasta que se elige uno o «Que Nore me recomiende» (una decisión explícita, nunca un vacío). El pie dice siempre qué falta o «Listo. Vas a cotizar: …», y el botón lleva a lo que falte. El presupuesto se escribe en pesos con puntos de miles. Incluye la salida contraria: «¿Es un antojo o un regalo personal? Elige en la colección».
10. **Apoyo, después de decidir**: «Pedir es sencillo» (3 tarjetas), «Del horno a tu mesa» (tarjetas que se deslizan; en escritorio con ratón, capítulos que avanzan con el scroll), pedidos personalizados, historia y ubicación.

Reglas: una acción principal por pantalla; nada secuestra el scroll en móvil; objetivos táctiles de 44 px; sin cinta en movimiento; **sin flechas en el teléfono** (los botones llevan solo su texto, centrado) y, en tabletas y PC, flechas dibujadas con CSS (`.ar`), nunca los caracteres U+2197 o U+21A9, que el iPhone convierte en emoji; las fotos de la rejilla usan miniaturas (`dist/assets/sm/`) y el detalle, la foto completa.

Reglas de honestidad: nada de escasez inventada, contadores, «los más vendidos» sin datos ni opiniones falsas. Si algún día se muestra urgencia, sale del calendario real; la prueba social, de opiniones reales cargadas en `content/funnel.js`.

## Formularios y permisos: que nada falle en silencio

- **Datos que faltan**: sin globos del navegador. Cada campo se marca en su sitio y dice qué hacer («Elige la fecha del evento.»), la pantalla va al primero y la marca se va al escribir (`presentation/forms.js`). Lo no obligatorio lleva la etiqueta «Opcional».
- **Autorización de datos**: si se intenta enviar sin marcarla, la casilla se resalta, se sacude y aparece «Marca la casilla de arriba para autorizar y poder enviar tu mensaje.» No se abre WhatsApp hasta marcarla.
- **Permiso del mapa de Google**: una pregunta directa («¿Quieres ver nuestro mapa de Google?»), qué pasa si sí y si no, y dos respuestas con el mismo peso: «No, gracias» y «Sí, mostrar el mapa». Nunca títulos vagos ni términos técnicos.
- **Dinero**: siempre en pesos colombianos con puntos de miles ($25.000), también mientras la persona escribe.

## Dependencias

Ninguna de ejecución, salvo la capa opcional de resortes: Motion 14.0.0 (`dist/vendor/`, MIT), cargada tras la carga de la página y solo sin «reducir movimiento».

## Pendientes conocidos

- El sitio es solo claro; no hay tema oscuro.
- Imágenes de producto marcadas como ilustrativas hasta contar con fotografías reales.

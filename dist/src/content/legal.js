import {siteConfig} from '../config/site.js';

// Textos legales de la tienda. Describen cómo funciona de verdad: un catálogo que arma un mensaje de WhatsApp,
// sin pagos ni base de datos. El correo y el WhatsApp salen de `config/site.js`: se cambian allí, no aquí.
// Si cambia la forma de vender (pagos en línea, cuentas, envíos nacionales), estos textos deben actualizarse.
const UPDATED = '6 de octubre de 2026';
const phone = siteConfig.whatsappNumber.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '+$1 $2 $3 $4');
const mail = `<a href="mailto:${siteConfig.email}">${siteConfig.email}</a>`;
const updated = `<p class="legal-updated">Última actualización: ${UPDATED}.</p>`;
const link = (key, text) => `<button type="button" data-legal="${key}">${text}</button>`;
const consumerLaw = '<a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306" target="_blank" rel="noopener noreferrer">Estatuto del Consumidor (Ley 1480 de 2011)</a>';
const dataLaw = '<a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981" target="_blank" rel="noopener noreferrer">Ley 1581 de 2012</a>';
const sic = '<a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio</a>';

export const legal = {
  terms: {title: 'Términos y condiciones', body: `${updated}
<h3>1. Quiénes somos</h3>
<p>Nore Quintero es una repostería artesanal de Medellín, Antioquia, Colombia. Nos encuentras por WhatsApp en el ${phone} y en el correo ${mail}.</p>
<h3>2. Qué es este sitio</h3>
<p>Este sitio es un catálogo para conocer nuestros productos y preparar tu pedido. Aquí no se paga ni se cobra nada. Agregar productos a «Mi selección», escribir tus datos de entrega o abrir WhatsApp todavía no es una compra: es una solicitud de cotización.</p>
<h3>3. Cuándo queda confirmado tu pedido</h3>
<p>Tu pedido queda confirmado cuando Nore te responde por WhatsApp y acuerdan los productos y las cantidades, el precio total en pesos colombianos, la fecha y la forma de entrega, y el medio de pago. Antes de ese acuerdo no hay obligación para ti ni para la tienda.</p>
<h3>4. Precios</h3>
<p>Los precios publicados están en pesos colombianos y son de referencia: pueden cambiar hasta que tu pedido quede confirmado. Los productos marcados «Por cotizar», los pedidos personalizados y los pedidos para empresas se cotizan en cada caso. El valor del domicilio no está incluido y se informa antes de confirmar.</p>
<h3>5. Productos</h3>
<p>Preparamos por encargo y de forma artesanal. Las fotografías son ilustrativas: puede haber pequeñas diferencias de tamaño, color o decoración. La disponibilidad depende de la fecha y de la anticipación con la que pidas.</p>
<p><strong>Alérgenos.</strong> Nuestros productos pueden contener gluten, leche, huevo y frutos secos, o trazas de estos y de otros alérgenos. Si tienes una alergia o una restricción alimentaria, cuéntanos antes de confirmar tu pedido.</p>
<h3>6. Pedidos personalizados y para empresas</h3>
<p>El diseño, la temática, la dedicatoria, los sabores, las porciones y las cantidades se acuerdan por WhatsApp. Lo que quede escrito en esa conversación es lo que se prepara: revísalo antes de confirmar.</p>
<h3>7. Pago</h3>
<p>El medio y el momento del pago se acuerdan directamente con Nore al confirmar. Este sitio no recibe pagos ni guarda datos de tarjetas o cuentas. Por tu seguridad, paga únicamente con los datos que recibas desde nuestro WhatsApp ${phone}.</p>
<h3>8. Entregas</h3>
<p>Puedes recibir tu pedido a domicilio, según cobertura, o recogerlo en el punto y la hora que acordemos. Los detalles están en ${link('delivery', 'Pedidos, entregas y cambios')}.</p>
<h3>9. Cambios y cancelaciones</h3>
<p>Si necesitas cambiar o cancelar, escríbenos lo antes posible. Como cada pedido se prepara por encargo, lo que se puede hacer depende de qué tan avanzada esté la preparación; lo revisamos contigo en cada caso.</p>
<h3>10. Garantía y reclamos</h3>
<p>Si tu pedido llega incompleto, en mal estado o distinto de lo acordado, escríbenos cuanto antes, ojalá el mismo día de la entrega, por WhatsApp o al correo, con una foto. Revisamos el caso y, cuando corresponda, reponemos el producto o devolvemos tu dinero.</p>
<p>Por tratarse de alimentos perecederos y de productos hechos a tu medida, la ley no contempla el derecho de retracto para estas compras (artículo 47 de la Ley 1480 de 2011). Tus derechos por calidad, idoneidad y cumplimiento de lo acordado se mantienen siempre, conforme al ${consumerLaw}.</p>
<h3>11. Contenidos del sitio</h3>
<p>La marca, los textos, el diseño y las imágenes de este sitio no pueden usarse con fines comerciales sin autorización de Nore Quintero.</p>
<h3>12. Tus datos</h3>
<p>Tratamos tus datos solo para atender tu consulta o tu pedido. Lee la ${link('privacy', 'Política de tratamiento de datos')}.</p>
<h3>13. Cambios en estos términos y ley aplicable</h3>
<p>Podemos actualizar estos términos; la versión vigente es la que está publicada aquí, y a cada pedido se le aplica la vigente cuando se confirma. Estos términos se rigen por las leyes de la República de Colombia. Si no quedas conforme con nuestra respuesta a un reclamo, puedes acudir a la ${sic}.</p>`},

  delivery: {title: 'Pedidos, entregas y cambios', body: `${updated}
<h3>Cómo se hace un pedido</h3>
<p>1. Elige en la colección y agrega a «Mi selección». 2. Indica si lo recoges o si es a domicilio y deja los datos de entrega. 3. Envía el mensaje que se arma por WhatsApp. 4. Nore te confirma precio, disponibilidad, entrega y medio de pago. Solo entonces el pedido queda en firme.</p>
<p>Para empresas y eventos se usa el formulario «Cotizar para mi empresa», que termina igual: con un mensaje de WhatsApp y una propuesta de Nore.</p>
<h3>Anticipación</h3>
<p>Trabajamos por encargo. Pide con la mayor anticipación que puedas, sobre todo si es un pedido personalizado, grande o para una fecha especial. La fecha que escribes es la que deseas: queda en firme cuando Nore la confirma.</p>
<h3>Entrega a domicilio</h3>
<p>Estamos en Medellín, Antioquia. La cobertura, el valor del domicilio y el horario se confirman en cada pedido según la dirección. Asegúrate de que haya alguien para recibir: son productos frescos y delicados.</p>
<h3>Recoger tu pedido</h3>
<p>No tenemos un local abierto al público. Si eliges recoger, Nore te indica el punto y la hora.</p>
<h3>Al recibir</h3>
<p>Revisa tu pedido al recibirlo y consérvalo como te indiquemos; muchos de nuestros productos necesitan refrigeración. Si algo no está bien, escríbenos cuanto antes con una foto.</p>
<h3>Cambios y cancelaciones</h3>
<p>Escríbenos lo antes posible por WhatsApp (${phone}). Como preparamos cada pedido por encargo, los cambios de diseño, cantidad o fecha y las cancelaciones dependen de qué tan avanzada esté la preparación.</p>
<h3>Reclamos</h3>
<p>Atendemos tus reclamos por WhatsApp y en ${mail}. Conserva la conversación donde se confirmó el pedido y el comprobante de pago. Tus derechos como consumidor están en los ${link('terms', 'Términos y condiciones')}.</p>`},

  privacy: {title: 'Política de tratamiento de datos personales', body: `${updated}
<h3>Responsable</h3>
<p>Nore Quintero, repostería artesanal en Medellín, Antioquia, Colombia. Correo: ${mail}. WhatsApp: ${phone}.</p>
<h3>Qué datos tratamos</h3>
<p>Los que tú decides escribir para tu consulta o pedido: nombre, correo electrónico, teléfono de contacto, dirección e indicaciones de entrega, fecha, número de personas, productos elegidos y, en solicitudes para empresas, el nombre de la organización y los datos del evento. No pedimos documentos de identidad ni datos bancarios, y te pedimos no incluir datos de salud ni de otras personas.</p>
<h3>Para qué los usamos</h3>
<p>Para responder tu consulta, cotizar, preparar y entregar tu pedido, y atender reclamos. No los usamos para enviarte publicidad sin tu autorización, y no los vendemos ni los cedemos a terceros.</p>
<h3>Cómo viajan tus datos</h3>
<p>Este sitio no tiene base de datos ni formularios que nos envíen información. Lo que escribes se queda en tu navegador mientras preparas el mensaje y se borra al recargar la página. Solo sale de tu dispositivo cuando tú envías el mensaje desde tu propio WhatsApp; por eso te pedimos autorizar el tratamiento antes de continuar.</p>
<p>WhatsApp es un servicio de Meta y trata los mensajes según sus propias políticas. Tus favoritos y tu elección sobre el mapa se guardan únicamente en tu dispositivo.</p>
<h3>Servicios externos</h3>
<p>El mapa de Google solo se carga si lo permites. Las tipografías se obtienen de Google Fonts, lo que genera una conexión con Google al abrir la página. El alojamiento del sitio puede registrar información técnica necesaria para funcionar y protegerse. Más detalle en ${link('cookies', 'Cookies y tecnologías')}.</p>
<h3>Cuánto tiempo los conservamos</h3>
<p>Los datos de tu pedido quedan en nuestra conversación de WhatsApp. Los conservamos el tiempo necesario para atenderte, responder reclamos y cumplir las obligaciones legales del negocio.</p>
<h3>Tus derechos</h3>
<p>Puedes conocer, actualizar y rectificar tus datos, pedir prueba de la autorización, saber cómo se han usado, revocar la autorización y pedir que los eliminemos cuando no exista un deber legal de conservarlos. Ejercerlos es gratuito. Te contamos cómo en ${link('rights', 'Consultas y derechos sobre tus datos')}, conforme a la ${dataLaw}.</p>
<h3>Cambios en esta política</h3>
<p>Si cambiamos la forma de tratar tus datos, actualizaremos esta política y su fecha. La versión vigente es la publicada aquí.</p>`},

  cookies: {title: 'Cookies y tecnologías', body: `${updated}
<h3>Una elección sencilla</h3>
<p>Puedes ver el catálogo y preparar tu pedido sin permitir el mapa de Google. La tienda no usa publicidad basada en tu comportamiento ni herramientas de analítica.</p>
<h3>Lo que se guarda en tu dispositivo</h3>
<p>Usamos el almacenamiento local de tu navegador para dos cosas. Con la clave <strong>nore-privacy-v1</strong> recordamos durante 6 meses si permites el mapa. Con la clave <strong>nore-favorites-v1</strong> guardamos la lista de productos que marcas como favoritos, sin ningún dato personal; se borra al quitar los favoritos o al limpiar el almacenamiento del navegador. Tu selección, tus datos de entrega y tus mensajes no se guardan.</p>
<h3>Mapa de Google, opcional</h3>
<p>El mapa está apagado hasta que lo permitas. Al mostrarlo se establece una conexión con Google, que puede recibir tu dirección IP e información del dispositivo y usar sus propias cookies. Revisa la <a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noopener noreferrer">política de privacidad de Google</a> y su <a href="https://policies.google.com/technologies/cookies?hl=es" target="_blank" rel="noopener noreferrer">información sobre cookies</a>.</p>
<h3>Otros recursos</h3>
<p>La página carga tipografías desde Google Fonts. El alojamiento puede usar mecanismos técnicos de seguridad, independientes de tu elección. Abrir WhatsApp, Google Maps u otros enlaces te lleva a un servicio externo con sus propias políticas.</p>
<h3>Cambiar de opinión</h3>
<p>Desde «Configurar preferencias», en el pie de página, puedes apagar el mapa: se retira de la página y no vuelve a cargarse. Eso no borra las cookies que Google haya guardado antes; para eliminarlas usa los ajustes de tu navegador o de tu cuenta de Google.</p>
<button class="plain-link" data-preferences>Configurar mis preferencias</button>`},

  rights: {title: 'Consultas y derechos sobre tus datos', body: `${updated}
<h3>Dónde escribirnos</h3>
<p>Al correo ${mail} o por WhatsApp al ${phone}. Cuéntanos qué necesitas (conocer, corregir o eliminar tus datos, o revocar tu autorización) y con qué nombre o número nos escribiste, para ubicar tu caso. No envíes más datos de los necesarios.</p>
<h3>Qué puedes pedir</h3>
<p>Conocer qué datos tenemos y cómo se han usado, actualizarlos o corregirlos, obtener prueba de tu autorización, revocarla y pedir que los eliminemos cuando no exista un deber legal de conservarlos.</p>
<h3>En cuánto tiempo respondemos</h3>
<p>Las consultas se responden en un máximo de 10 días hábiles y los reclamos en un máximo de 15 días hábiles desde que los recibimos, como lo establece la ${dataLaw}. Si necesitamos más tiempo, te lo avisamos con la razón y la nueva fecha.</p>
<h3>Lo que puedes hacer tú mismo</h3>
<p>En este sitio, recargar la página borra tu selección y lo que hayas escrito. Tus favoritos y tu elección sobre el mapa se cambian desde el sitio o se eliminan limpiando el almacenamiento del navegador. Los mensajes que nos enviaste están en tu propio WhatsApp.</p>
<h3>Autoridad de protección de datos</h3>
<p>Si no quedas conforme con nuestra respuesta, puedes acudir a la ${sic}. Este sitio no recibe trámites en nombre de esa entidad.</p>`},
};

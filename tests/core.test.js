import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorefront,createInquiryService} from '../dist/src/application/storefront.js';
import {createPrivacyService} from '../dist/src/application/privacy.js';
import {createFavorites} from '../dist/src/application/favorites.js';
import {catalogRepository} from '../dist/src/infrastructure/catalog-repository.js';
import {catalog} from '../dist/src/content/products.js';
import {portionRange, pricePerPortion, bestFit, relatedProducts} from '../dist/src/domain/catalog.js';
import {nextOccasion} from '../dist/src/domain/calendar.js';
import {calendar, pairings} from '../dist/src/content/funnel.js';
const repo={all:()=>[{id:'a',name:'Alfajor',category:'Alfajores'},{id:'b',name:'Caja de alfajores',category:'Alfajores'},{id:'c',name:'Torta',category:'Tortas'}]};
test('category filters keep multiple references; selection validates and isolates state',()=>{
 const store=createStorefront(repo);assert.equal(store.filter('Alfajores').length,2);assert.equal(store.filter('Todos').length,3);
 store.change('a',2);const snapshot=store.entries();snapshot.set('a',99);assert.equal(store.entries().get('a'),2);
 assert.match(store.quote(),/2 × Alfajor/);store.change('a',-3);assert.equal(store.entries().size,0);
 assert.throws(()=>store.change('unknown',1));assert.throws(()=>store.change('a',.5));
});
test('custom quote and real catalog remain usable',()=>{
 const store=createStorefront(catalogRepository);const items=catalog.flatMap(s=>s.items);
 assert.equal(store.products().length,items.length);assert.ok(items.length>=catalog.length);
 assert.equal(new Set(store.products().map(p=>p.id)).size,items.length,'ids repetidos en el catálogo');
 assert.deepEqual(store.categories(),['Todos',...catalog.map(s=>s.section)]);
 for(const section of catalog)assert.equal(store.filter(section.section).length,section.items.length);
 for(const p of store.products())assert.ok(p.name&&p.tag&&p.description&&p.detail,'producto incompleto: '+p.id);
 const message=store.customize({occasion:'Cumpleaños',date:'2026-10-10',people:6,idea:'Vino y dorado'});
 assert.match(message,/Vino y dorado/);assert.match(message,/Personas: 6/);
});
test('presentations become selectable lines with prices, totals and a quote that carries them',()=>{
 const priced={id:'t',name:'Torta',category:'Tortas',presentations:[{label:'4-6 porciones',price:45000},{label:'Mini 2-4 porciones',price:30000,note:'Mini'}]};
 const plain={id:'g',name:'Arepa',category:'Salados',presentations:[]};
 const store=createStorefront({all:()=>[priced,plain]});
 assert.deepEqual(store.lines().map(l=>l.key),['t:4-6-porciones','t:mini-2-4-porciones','g']);
 assert.equal(store.lines()[1].note,'Mini');assert.equal(store.startingPrice(priced),30000);assert.equal(store.startingPrice(plain),null);
 assert.equal(store.formatPrice(125000),'$125.000');assert.equal(store.formatPrice(3500),'$3.500');assert.equal(store.formatPrice(800),'$800');
 assert.throws(()=>store.change('t',1),/desconocido/);
 store.change('t:4-6-porciones',2);store.change('t:mini-2-4-porciones',1);
 assert.deepEqual(store.total(),{amount:120000,complete:true});
 assert.match(store.quote(),/2 × Torta — 4-6 porciones \(\$45\.000\)/);assert.match(store.quote(),/Total de referencia: \$120\.000/);
 store.change('g',1);assert.deepEqual(store.total(),{amount:120000,complete:false});
 assert.match(store.quote(),/1 × Arepa\n/);assert.doesNotMatch(store.quote(),/Total de referencia/);
});
test('real catalog: every presentation has a unique key and a whole-peso price',()=>{
 const store=createStorefront(catalogRepository),keys=store.lines().map(l=>l.key);
 assert.equal(new Set(keys).size,keys.length,'claves de selección repetidas');
 for(const l of store.lines().filter(l=>l.label))assert.ok(Number.isInteger(l.price)&&l.price>0,'precio inválido: '+l.key);
 assert.ok(store.products().some(p=>p.presentations.length),'el catálogo debería traer presentaciones con precio');
});
test('inquiry uses clipboard without active WhatsApp and requires consent before opening',async()=>{
 let copied,opened=0;const ports={clipboard:{copy:async text=>{copied=text}},messenger:{open:()=>opened++}};
 assert.equal(await createInquiryService({...ports,number:''}).deliver('Hola',false),'copied');assert.equal(copied,'Hola');assert.equal(opened,0);
 const enabled=createInquiryService({...ports,number:'573000000000'});assert.equal(await enabled.deliver('Hola',false),'consent-required');assert.equal(opened,0);
 assert.equal(await enabled.deliver('Hola',true),'opened');assert.equal(opened,1);
 assert.equal(await createInquiryService({number:'',clipboard:{copy:()=>{throw Error()}},messenger:{}}).deliver('x',false),'copy-unavailable');
});
test('privacy rejects expired or malformed consent and supports revocation and restoration',()=>{
 let value={maps:true,expires:5};let now=10;const storage={read:()=>value,write:v=>{value=v}};
 const service=createPrivacyService({storage,clock:()=>now,retentionDays:180});assert.equal(service.current().maps,false);
 service.save(true);assert.equal(value.maps,true);assert.equal(value.expires,10+180*86400000);
 const restored=createPrivacyService({storage,clock:()=>now,retentionDays:180});assert.equal(restored.current().maps,true);
 restored.save(false);assert.equal(value.maps,false);value={maps:'yes',expires:999};assert.equal(createPrivacyService({storage,clock:()=>now,retentionDays:180}).current().maps,false);
});

test('guided selling: portion ranges, price per portion and the size that fits the guests',()=>{
 assert.deepEqual(portionRange('8-10 porciones'),{min:8,max:10});assert.equal(portionRange('Personal'),null);assert.equal(portionRange('Caja x 12 muffins'),null);
 assert.equal(pricePerPortion(89000,'8-10 porciones'),9900);assert.equal(pricePerPortion(120000,'24-26 porciones'),4800);assert.equal(pricePerPortion(18000,'Personal'),null);
 const lines=['Mini 2-4 porciones','4-6 porciones','8-10 porciones','24-26 porciones','Caja x 6'].map(label=>({label}));
 assert.equal(bestFit(lines,3).label,'Mini 2-4 porciones');assert.equal(bestFit(lines,6).label,'4-6 porciones');assert.equal(bestFit(lines,9).label,'8-10 porciones');
 assert.equal(bestFit(lines,40).label,'24-26 porciones','si ninguna alcanza, la mayor');assert.equal(bestFit([{label:'Personal'}],4),null);assert.equal(bestFit(lines,NaN),null);
});
test('related products skip what is already chosen and never repeat',()=>{
 const items=[{id:'a',category:'X'},{id:'b',category:'Y'},{id:'c',category:'Y'},{id:'d',category:'Z'}];
 const pairs={byProduct:{a:['d']},bySection:{X:['b','c','a'],Y:['a']}};
 assert.deepEqual(relatedProducts(items,['a'],pairs,3).map(p=>p.id),['d','b','c']);
 assert.deepEqual(relatedProducts(items,['a','b'],pairs,3).map(p=>p.id),['d','c']);
 assert.deepEqual(relatedProducts(items,['a'],{},3),[]);assert.equal(relatedProducts(items,['a'],pairs,1).length,1);
});
test('calendar urgency is real: next special date within the window, nothing otherwise',()=>{
 const near=nextOccasion(new Date(2026,9,6),calendar,45);assert.equal(near.id,'halloween');assert.equal(near.days,25);
 assert.equal(nextOccasion(new Date(2026,10,15),calendar,45).id,'navidad');
 assert.equal(nextOccasion(new Date(2026,0,20),calendar,45),null,'a más de 45 días no se presiona');
 assert.equal(nextOccasion(new Date(2026,4,10),calendar,45).days,0,'el mismo día cuenta como hoy');
 assert.equal(nextOccasion(new Date(2026,4,1),calendar,45).id,'madre');assert.equal(nextOccasion(new Date(2026,4,1),calendar,45).days,9,'2.º domingo de mayo de 2026 = 10 de mayo');
 assert.equal(nextOccasion(new Date(2026,5,1),calendar,45).id,'padre');assert.equal(nextOccasion(new Date(2026,5,1),calendar,45).days,20,'3.er domingo de junio de 2026 = 21');
 assert.equal(nextOccasion(new Date(2026,8,1),calendar,45).days,18,'3.er sábado de septiembre de 2026 = 19');
 assert.equal(nextOccasion(new Date(2026,3,1),calendar,45).days,24,'último sábado de abril de 2026 = 25 (faltan 24 días desde el 1)');
});
test('the quote carries the occasion and the number of guests; funnel content points at real products',()=>{
 const store=createStorefront({...catalogRepository});store.change('vasca:8-10-porciones',1);
 assert.doesNotMatch(store.quote(),/Ocasión|Personas/);
 store.setContext({occasion:'Celebrar un cumpleaños',guests:10});assert.match(store.quote(),/Ocasión: Celebrar un cumpleaños\s+Personas: 10/);
 const ids=new Set(store.products().map(p=>p.id)),sections=new Set(store.products().map(p=>p.category));
 for(const c of calendar)assert.ok(sections.has(c.section),'fecha con sección inexistente: '+c.id);
 for(const [section,list] of Object.entries(pairings.bySection)){assert.ok(sections.has(section),'combinación con sección inexistente: '+section);for(const id of list)assert.ok(ids.has(id),'combinación con producto inexistente: '+id);}
});
test('choosing a reason keeps the prepared quote: it only adds, changes or removes one line',()=>{
 const store=createStorefront(repo);store.change('c',2);store.change('a',1);
 const quote=store.quote(),tagged=store.withReason(quote,'Una celebración');
 for(const line of quote.split('\n'))assert.ok(tagged.includes(line),'se perdió: '+line);
 assert.match(tagged,/2 × Torta[\s\S]*\n\nMotivo: Una celebración\n\n¿Me confirmas/);
 const changed=store.withReason(tagged,'Un regalo');assert.equal(changed.match(/Motivo: /g).length,1);assert.match(changed,/Motivo: Un regalo/);
 assert.equal(store.withReason(changed,''),quote);
 const edited=quote+'\nEntrega en Laureles, por favor.';assert.ok(store.withReason(edited,'Un antojo').includes('Entrega en Laureles, por favor.'));
 assert.equal(store.withReason('Hola, Nore. Me interesa «Torta».','Un regalo'),'Hola, Nore. Me interesa «Torta».\n\nMotivo: Un regalo');
 assert.equal(store.withReason('Hola, Nore. Me interesa «Torta».\n\nMotivo: Un regalo',''),'Hola, Nore. Me interesa «Torta».');
});
test('the order message is warm, ordered and carries pickup or delivery; emoji only when asked',()=>{
 const store=createStorefront({...catalogRepository});store.change('tres-leches:8-10-porciones',1);store.setContext({guests:14});
 const open=store.quote();
 assert.match(open,/^¡Hola, Nore! Me antojé de tu colección y me gustaría pedir:\n\n• 1 × Torta tres leches — 8-10 porciones \(\$55\.000\)\n\nTotal de referencia: \$55\.000\nPersonas: 14\n\n¿Me confirmas disponibilidad y cómo sería la entrega\? ¡Muchas gracias!$/);
 assert.doesNotMatch(open,/\p{Extended_Pictographic}/u);
 store.setContext({delivery:{mode:'domicilio',name:' Lucas  Salazar ',address:'Cra 70 # 1-20',area:'Laureles',notes:'Apto 301\nportería',phone:'300 000 0000',date:'2026-10-10',time:'En la tarde'}});
 const home=store.quote();
 assert.match(home,/Entrega: a domicilio\nA nombre de: Lucas Salazar\nDirección: Cra 70 # 1-20 — Laureles\nIndicaciones: Apto 301 portería\nContacto: 300 000 0000\nFecha: sábado 10 de octubre, en la tarde\n\n¿Me confirmas disponibilidad y el valor del domicilio\?/);
 store.setContext({delivery:{mode:'recoger',name:'Lucas',address:'no debe salir',date:'2026-10-10',time:''}});
 const pickup=store.quote();
 assert.match(pickup,/Entrega: paso a recoger\nA nombre de: Lucas\nFecha: sábado 10 de octubre\n\n¿Me confirmas disponibilidad y dónde lo recojo\?/);assert.doesNotMatch(pickup,/Dirección|no debe salir/);
 store.setContext({emoji:true});const phone=store.quote();
 assert.match(phone,/^¡Hola, Nore! 👋 /);assert.match(phone,/💰 Total de referencia: \$55\.000\n👥 Personas: 14/);assert.match(phone,/🛍️ Entrega: paso a recoger\n🙋 A nombre de: Lucas\n⏰ Fecha: sábado 10 de octubre/);assert.match(phone,/¡Muchas gracias! 🍰$/);
 const tagged=store.withReason(phone,'Una celebración');assert.match(tagged,/\n\n🎉 Motivo: Una celebración\n\n¿Me confirmas/);
 assert.equal(store.withReason(store.withReason(tagged,'Un regalo'),''),phone);
 assert.match(store.customize({occasion:'Cumpleaños',date:'2026-10-10',people:6,idea:''}),/🎉 Ocasión: Cumpleaños\n⏰ Fecha deseada: sábado 10 de octubre\n👥 Personas: 6\n💡 Mi idea: Me gustaría recibir sugerencias\./);
});
test('after sending, the order starts clean and can be recovered; the email travels with the delivery data',()=>{
 const store=createStorefront({...catalogRepository});store.setContext({emoji:true});store.change('tres-leches:8-10-porciones',2);
 store.setContext({guests:14,delivery:{mode:'recoger',name:'Lucas',email:' lucas@example.com ',date:'2026-10-10',time:''}});
 const sent=store.quote(),saved=store.snapshot();assert.match(sent,/🙋 A nombre de: Lucas\n📧 Correo: lucas@example\.com\n⏰ Fecha/);
 store.clear();assert.equal(store.entries().size,0);assert.deepEqual(store.context(),{emoji:true});
 store.change('alfajores:caja-mini-x-12',1);assert.doesNotMatch(store.quote(),/Lucas|Personas|Entrega:|tres leches/);
 store.restore(saved);assert.equal(store.quote(),sent);saved.selection.clear();assert.equal(store.entries().get('tres-leches:8-10-porciones'),2);
});
test('favorites persist on the device, ignore unknown or tampered data and never hold personal data',()=>{
 let disk=['brownie','ya-no-existe',7,'brownie'];const storage={read:()=>disk,write:value=>{disk=JSON.parse(JSON.stringify(value))}},ids=['brownie','vasca','alfajores'];
 const favorites=createFavorites({storage,ids});assert.deepEqual(favorites.list(),['brownie']);
 assert.equal(favorites.toggle('vasca'),true);assert.ok(favorites.has('vasca'));assert.deepEqual(disk,['brownie','vasca']);
 assert.equal(favorites.toggle('brownie'),false);assert.deepEqual(createFavorites({storage,ids}).list(),['vasca']);
 assert.throws(()=>favorites.toggle('ya-no-existe'));
 for(const broken of [null,'texto',{a:1},42])assert.deepEqual(createFavorites({storage:{read:()=>broken,write(){}},ids}).list(),[]);
 const copy=favorites.list();copy.push('alfajores');assert.equal(favorites.has('alfajores'),false);
});
test('corporate quote: services come from the real catalog and the message carries what the shop needs',()=>{
 const store=createStorefront({...catalogRepository}),services=store.corporateServices(),names=new Set(store.products().map(p=>p.name));
 assert.ok(services.length>=3);for(const s of services){assert.ok(s.label&&s.one&&s.many&&s.options.length,'servicio incompleto: '+s.id);for(const o of s.options)assert.ok(names.has(o.name),'opción fuera del catálogo: '+o.name);}
 const request={services:[{id:'almuerzos',quantity:40,options:['montanera','lasana','brownie']},{id:'dulces',quantity:1,options:[]},{id:'refrigerios',quantity:0,options:[]}],company:'Acme S.A.S.',name:'Lucas Salazar',email:'lucas@acme.com',date:'2026-10-16',time:'12:30',frequency:'Cada semana',address:'Cra 43A # 1-50',area:'El Poblado',service:'Empaque individual',budget:'$25.000 por persona',notes:'3 vegetarianos\ncon bebida'};
 const plain=store.corporate(request);
 assert.equal(plain,['¡Hola, Nore! Quiero cotizar un evento para mi empresa:','','Empresa: Acme S.A.S.','Contacto: Lucas Salazar','Correo: lucas@acme.com','','Lo que necesito:','• 40 almuerzos — Montañera Tradicional, Lasaña Gourmet','• 1 porción de postre','','Fecha: viernes 16 de octubre, 12:30 p. m.','Frecuencia: cada semana','Lugar: Cra 43A # 1-50 — El Poblado','Servicio: empaque individual','Presupuesto: $25.000 por persona','Detalles: 3 vegetarianos con bebida','','¿Me ayudas con una propuesta y disponibilidad? ¡Muchas gracias!'].join('\n'));
 const short=store.corporate({services:[{id:'refrigerios',quantity:25}],company:'Acme',name:'Lucas',date:'2026-10-16',time:'',frequency:'',address:'Sede norte',area:'Bello',service:'',budget:'',notes:''});
 assert.doesNotMatch(short,/Correo|Frecuencia|Servicio|Presupuesto|Detalles/);assert.match(short,/• 25 refrigerios\n\nFecha: viernes 16 de octubre\nLugar: Sede norte — Bello\n\n¿Me ayudas/);
 store.setContext({emoji:true});assert.match(store.corporate(request),/🏢 Empresa: Acme S\.A\.S\.\n🙋 Contacto: Lucas Salazar[\s\S]*🍽️ Lo que necesito:\n• 40 almuerzos[\s\S]*⏰ Fecha: viernes 16 de octubre, 12:30 p\. m\.\n🔁 Frecuencia: cada semana[\s\S]*💰 Presupuesto: \$25\.000 por persona\n📝 Detalles: 3 vegetarianos con bebida/);
 assert.doesNotMatch(store.corporate({...request,invoice:true}),/actura/i,'la factura electrónica ya no se menciona');
 store.setContext({emoji:false});assert.match(store.corporate({...request,services:[{id:'almuerzos',quantity:12,options:[],advice:true},{id:'refrigerios',quantity:8,options:['amasijos'],advice:true}]}),/• 12 almuerzos — que Nore me recomiende\n• 8 refrigerios — Amasijos Colombianos\n/);store.setContext({emoji:true});
 assert.throws(()=>store.corporate({services:[{id:'inventado',quantity:5}]}));
 const prompts=new Map(services.flatMap(s=>s.options.map(o=>[o.id,o.prompt])));assert.equal(prompts.get('costillas-bbq'),true);assert.equal(prompts.get('snack-express'),true);assert.equal(prompts.get('sandwich-cubano'),false);assert.equal(prompts.get('brownie'),false,'un postre de uso personal no debe invitar a cotizar para empresa');assert.equal(prompts.get('caja-deluxe'),false,'una caja de regalo es de uso personal');
});
test('catalog matches the price sheet: single prices, includes, and minimum orders that are enforced',()=>{
 const store=createStorefront({...catalogRepository}),byId=id=>store.products().find(p=>p.id===id),price=id=>store.startingPrice(byId(id));
 assert.equal(store.products().length,25,'solo los 25 productos de la hoja');assert.deepEqual(store.categories(),['Todos','Postres','Galletas y alfajores','Tortas','Salados','Refrigerios','Almuerzos','Anchetas']);
 assert.deepEqual(store.categories().slice(1).map(name=>store.filter(name).length),[4,2,7,3,2,3,4],'ninguna sección con un solo producto');
 assert.deepEqual(store.products().map(p=>p.category).filter((name,i,list)=>name!==list[i-1]),store.categories().slice(1),'en «Todos» cada sección sale junta y una sola vez');
 assert.deepEqual(store.products().filter(p=>!p.image).map(p=>p.id),[],'todos con foto');assert.deepEqual(store.products().filter(p=>store.startingPrice(p)===null).map(p=>p.id),['montanera']);
 // precios de la hoja
 assert.equal(price('caja-brunch'),85000);assert.equal(price('caja-tradicion'),60000);assert.equal(price('caja-deluxe'),240000);assert.equal(price('celebra-la-vida'),75000);
 assert.equal(price('sandwich-cubano'),24900);assert.equal(price('snack-express'),13000);assert.equal(price('caja-snack'),24000);assert.equal(price('montanera'),null);
 const linePrice=key=>store.lines().find(l=>l.key===key).price;
 assert.equal(linePrice('cheesecake:8-10-porciones'),85000);assert.equal(linePrice('cheesecake:mini-x-6'),40000);assert.equal(linePrice('cheesecake:mini-x-12'),75000);
 assert.equal(linePrice('costillas-bbq:plato'),34900);assert.equal(linePrice('costillas-bbq:menu-completo'),39900);assert.equal(linePrice('lasana:menu-completo'),39900);assert.equal(linePrice('lasana:individual-con-pan-artesanal'),25000);
 assert.equal(linePrice('arepa-rellena:pollo-especial'),18900);assert.equal(linePrice('amasijos:pandequeso-artesanal'),1600);assert.equal(linePrice('amasijos:mezcla-para-almojabana-kilo-1-000-g'),45000);
 assert.deepEqual(store.products().filter(p=>p.highlight).map(p=>[p.id,p.highlight]),[['caja-deluxe','La joya de la casa']]);
 assert.equal(byId('caja-deluxe').includes.length,9);assert.equal(byId('montanera').includes.length,5);assert.ok(byId('amasijos').steps.items.length>=4);
 // pedido mínimo del producto: un formato único entra con el mínimo completo
 assert.equal(byId('snack-express').min,10);assert.equal(store.add('snack-express'),10);assert.equal(store.entries().get('snack-express'),10);assert.equal(store.add('snack-express'),1);
 assert.deepEqual(store.minimums(),[]);assert.match(store.quote(),/11 × Snack Express \(\$13\.000\)/);assert.deepEqual(store.total(),{amount:143000,complete:true});
 store.change('snack-express',-2);const [issue]=store.minimums();assert.equal(issue.product.id,'snack-express');assert.equal(issue.required,10);assert.equal(issue.current,9);
 store.change(issue.key,issue.required-issue.current);assert.deepEqual(store.minimums(),[]);
 // mínimo del producto repartido entre sabores: la primera línea lo completa, la segunda entra de a una
 assert.equal(store.add('arepa-rellena:pollo-especial'),10);assert.equal(store.add('arepa-rellena:carne-criolla'),1);
 store.change('arepa-rellena:pollo-especial',-4);assert.deepEqual(store.minimums().map(i=>[i.product.id,i.label,i.current]),[['arepa-rellena',null,7]]);
 store.change('arepa-rellena:carne-criolla',3);assert.deepEqual(store.minimums(),[]);
 // mínimo por presentación: cada variedad de amasijo horneado por su cuenta; las mezclas no tienen mínimo
 assert.equal(store.add('amasijos:pandequeso-artesanal'),10);assert.equal(store.add('amasijos:mezcla-para-pandeyuca-libra-500-g'),1);
 store.change('amasijos:pandequeso-artesanal',-1);assert.deepEqual(store.minimums().map(i=>[i.label,i.required,i.current]),[['Pandequeso artesanal',10,9]]);
 // sin mínimo: de a una, como siempre
 assert.equal(store.add('tres-leches:8-10-porciones'),1);assert.equal(store.add('caja-brunch'),1);
 // empresas conoce el mínimo de cada opción
 const mins=new Map(store.corporateServices().flatMap(s=>s.options.map(o=>[o.id,o.min])));
 assert.equal(mins.get('costillas-bbq'),10);assert.equal(mins.get('amasijos'),10);assert.equal(mins.get('montanera'),null);assert.equal(mins.get('sandwich-cubano'),null);
});

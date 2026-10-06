import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {products,catalog} from '../dist/src/content/products.js';
import {siteConfig} from '../dist/src/config/site.js';
import {calendar,pairings,corporate} from '../dist/src/content/funnel.js';
const root=resolve('dist');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);}
let count=0;
for(const file of walk(resolve(root,'src')).filter(f=>f.endsWith('.js'))){
 execFileSync(process.execPath,['--check',file]);
 const source=readFileSync(file,'utf8');
 const normalizedFile=file.replaceAll('\\','/');
 for(const m of source.matchAll(/from\s+['"]([^'"]+)['"]/g)){
  const target=resolve(dirname(file),m[1]);if(!existsSync(target))throw Error('Missing import: '+target);
  const normalizedTarget=target.replaceAll('\\','/');
  if(normalizedFile.includes('/domain/')&&!normalizedTarget.includes('/domain/'))throw Error('Domain dependency violation');
  if(normalizedFile.includes('/application/')&&!/\/(domain|application)\//.test(normalizedTarget))throw Error('Application dependency violation');
 }
 if(/\/(domain|application)\//.test(normalizedFile)&&/\b(document|window|localStorage|navigator)\b/.test(source))throw Error('Browser API in core');
 count++;
}
const html=readFileSync(resolve(root,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(https?:|mailto:|tel:)/.test(m[1]))continue;if(!existsSync(resolve(root,m[1])))throw Error('Missing asset '+m[1]);}
console.log(`${count} modules checked: syntax, local references and dependency direction.`);
for(const product of products){
 for(const file of [product.image,...product.gallery].filter(Boolean)){
  if(!/^[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|avif)$/i.test(file) || file.includes('..') || !existsSync(resolve(root,'assets',file)))throw Error('Foto inválida o inexistente: '+product.id+' → '+file);
 }
 if(product.gallery.length&&!product.image)throw Error('La galería necesita una foto principal: '+product.id);
 const labels=new Set();
 for(const item of product.presentations){
  if(!item.label||typeof item.label!=='string')throw Error('Presentación sin nombre en '+product.id);
  if(labels.has(item.label))throw Error('Presentación repetida en '+product.id+': '+item.label);
  labels.add(item.label);
  if(item.price!==undefined&&item.price!==null&&(!Number.isInteger(item.price)||item.price<=0))throw Error('Precio inválido (entero en pesos, sin puntos) en '+product.id+' → '+item.label);
 }
}
if(siteConfig.whatsappNumber && !/^\d{7,15}$/.test(siteConfig.whatsappNumber))throw Error('WhatsApp debe contener de 7 a 15 dígitos, sin + ni espacios.');
const seen=new Set();
for(const section of catalog){
 if(!section.section||!Array.isArray(section.items)||!section.items.length)throw Error('Sección vacía o sin nombre en products.js');
 for(const item of section.items){
  for(const field of ['id','name','tag','description','detail'])if(!item[field])throw Error('Falta "'+field+'" en un producto de la sección '+section.section);
  if(!/^[a-z0-9-]+$/.test(item.id))throw Error('Id inválido (usa minúsculas, números y guiones): '+item.id);
  if(seen.has(item.id))throw Error('Id repetido en el catálogo: '+item.id);
  seen.add(item.id);
 }
}
console.log(`Catálogo: ${catalog.length} secciones, ${products.length} productos, ids únicos.`);

const ids=new Set(products.map(p=>p.id)),sections=new Set(products.map(p=>p.category));
for(const c of calendar)if(!sections.has(c.section))throw Error('Fecha especial con sección inexistente: '+c.id);
for(const [section,list] of Object.entries(pairings.bySection)){if(!sections.has(section))throw Error('Combinación con sección inexistente: '+section);for(const id of list)if(!ids.has(id))throw Error('Combinación con producto inexistente: '+id);}
for(const service of corporate){for(const id of service.options)if(!ids.has(id))throw Error('Servicio para empresas con producto inexistente: '+service.id+' → '+id);for(const id of service.prompt??[])if(!service.options.includes(id))throw Error('Aviso de empresas fuera de las opciones del servicio: '+service.id+' → '+id);}
console.log(`Embudo: ${calendar.length} fechas especiales, combinaciones por sección y ${corporate.length} servicios para empresas verificados.`);
const page=readFileSync(resolve(root,'index.html'),'utf8');
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(siteConfig.email))throw Error('Correo de la tienda inválido en config/site.js');
if(!page.includes('mailto:'+siteConfig.email))throw Error('El correo del pie de página no coincide con config/site.js');
// Vista previa al compartir: dirección absoluta del sitio publicado e imagen presente y liviana.
const share=(page.match(/property="og:image" content="([^"]+)"/)||[])[1];
if(!/^https:\/\/[^/]+$/.test(siteConfig.url))throw Error('`url` en config/site.js debe ser la dirección pública, con https y sin barra final');
if(!share||!share.startsWith(siteConfig.url+'/'))throw Error('og:image debe ser una dirección absoluta que empiece por '+siteConfig.url);
for(const tag of ['rel="canonical" href="','property="og:url" content="'])if(!page.includes(tag+siteConfig.url+'/"'))throw Error('La dirección del sitio en index.html no coincide con config/site.js: '+tag);
const shareFile=resolve(root,share.slice(siteConfig.url.length+1));
if(!existsSync(shareFile))throw Error('Falta la imagen para compartir: '+share);
if(readFileSync(shareFile).length>300*1024)throw Error('La imagen para compartir pesa más de 300 KB: WhatsApp puede no mostrarla');
const pending=products.filter(p=>!p.image).length,unpriced=products.filter(p=>!p.presentations.length).length;
console.log(`Publicable como sitio estático. Pendientes de contenido: ${pending} fotos de catálogo; ${unpriced} productos sin precio; WhatsApp ${siteConfig.whatsappNumber?'configurado':'sin configurar'}. Revisar LISTO-PARA-PUBLICAR.md.`);

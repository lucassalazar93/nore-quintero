import {$,show} from './dom.js';
import {legal} from '../content/legal.js';
export function mountPrivacy({service,map}) {
let privacy=service.current();
function applyMap(){const allowed=privacy.maps;$('#map-placeholder').hidden=allowed;map.render($('#map-frame'),allowed);$('#map-frame').hidden=!allowed;$('#map-consent').checked=allowed;}
function savePrivacy(maps){privacy=service.save(maps);$('#cookie-banner').hidden=true;applyMap();}
$('#cookie-banner').hidden=privacy.expires>Date.now();applyMap();
$('#cookie-reject').onclick=()=>savePrivacy(false);$('#cookie-accept').onclick=()=>savePrivacy(true);$('#load-map').onclick=()=>savePrivacy(true);
$('#save-preferences').onclick=()=>{savePrivacy($('#map-consent').checked);$('#preferences-dialog').close()};
let legalReturn=null;
document.addEventListener('click',e=>{const pref=e.target.closest('[data-preferences]');if(pref){$('#map-consent').checked=privacy.maps;show('#preferences-dialog');return}const link=e.target.closest('[data-legal]');if(link){const entry=legal[link.dataset.legal];if(!entry)return;const current=document.querySelector('dialog[open]');legalReturn=current&&current.id!=='legal-dialog'?'#'+current.id:null;$('#legal-content').innerHTML=`<h2>${entry.title}</h2>${entry.body}`;show('#legal-dialog');}});
$('#legal-back').onclick=()=>{if(legalReturn)show(legalReturn);else $('#legal-dialog').close();legalReturn=null};

}

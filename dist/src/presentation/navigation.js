export function mountNavigation(){
const menuToggle=document.querySelector('.menu-toggle');const menu=document.querySelector('#main-nav');
function closeMenu(){menu.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menú');menuToggle.textContent='☰'}
menuToggle.onclick=()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');menuToggle.textContent=open?'×':'☰'};
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){closeMenu();menuToggle.focus()}});
matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
// Un toque fuera del encabezado cierra el menú.
document.addEventListener('click',e=>{if(menu.classList.contains('open')&&!e.target.closest('header'))closeMenu()});
document.querySelectorAll('dialog').forEach((d,i)=>{const heading=d.querySelector('h2');if(heading){heading.id=heading.id||'dialog-heading-'+i;d.setAttribute('aria-labelledby',heading.id)}else d.setAttribute('aria-label',d.id==='product-dialog'?'Detalle del producto':'Información y condiciones')});

}

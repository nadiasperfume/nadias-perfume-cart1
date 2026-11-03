(function(){
  if(document.querySelector('.nadia-bottom-nav')) return;
  const labels={ar:['الرئيسية','العطور','الهدايا','المفضلة','السلة','بحث','إغلاق','ابحث عن عطر','بحث'],en:['Home','Perfumes','Gifts','Wishlist','Bag','Search','Close','Search perfumes','Search'],fr:['Accueil','Parfums','Cadeaux','Favoris','Panier','Recherche','Fermer','Rechercher un parfum','Chercher']};
  const icons=[
    '<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-7h6v7"/>',
    '<path d="M8 3h8v5l3 5v8H5v-8l3-5z"/><path d="M8 8h8"/>',
    '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8C5 8 6 2 9 3c2 0 3 5 3 5zm0 0c7 0 6-6 3-5-2 0-3 5-3 5z"/>',
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    '<path d="M5 8h14l-1 13H6L5 8zM9 9V6a3 3 0 0 1 6 0v3"/>'
  ];
  const lang=()=>labels[document.documentElement.lang]||labels.ar;
  const nav=document.createElement('nav');nav.className='nadia-bottom-nav';nav.setAttribute('aria-label','Mobile navigation');
  const destinations=['index.html','shop.html','gifts.html','shop.html?view=wishlist','#cart'];
  const path=location.pathname.split('/').pop()||'index.html';
  destinations.forEach((href,i)=>{
    const el=document.createElement(i===4?'button':'a');
    if(i!==4) el.href=href;else el.type='button';
    el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[i]+'</svg><span></span>';
    if((i===0&&path==='index.html')||(i===1&&path==='shop.html'&&!location.search.includes('wishlist'))||(i===2&&path==='gifts.html')||(i===3&&location.search.includes('wishlist')))el.setAttribute('aria-current','page');
    if(i===4)el.addEventListener('click',()=>{if(typeof window.openCart==='function')window.openCart();else location.href='checkout.html';});
    nav.appendChild(el);
  });
  const overlay=document.createElement('div');overlay.className='nadia-nav-search';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.innerHTML='<div class="nadia-nav-search__panel"><button type="button" data-close style="float:inline-end">×</button><h2></h2><form action="shop.html" method="get"><input type="search" name="q" required/><button type="submit"></button></form></div>';
  const close=()=>{overlay.classList.remove('is-open');document.body.style.overflow='';};
  overlay.querySelector('[data-close]').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  const searchButton=document.createElement('button');searchButton.type='button';searchButton.className='nadia-mobile-search';searchButton.setAttribute('aria-label','Search');searchButton.textContent='⌕';searchButton.addEventListener('click',()=>{overlay.classList.add('is-open');document.body.style.overflow='hidden';overlay.querySelector('input').focus();});
  const header=document.querySelector('header .actions');if(header)header.prepend(searchButton);
  const style=document.createElement('style');style.textContent='@media(min-width:801px){.nadia-mobile-search{display:none!important}}';document.head.appendChild(style);
  function translate(){const t=lang();nav.querySelectorAll('span').forEach((x,i)=>x.textContent=t[i]);overlay.querySelector('h2').textContent=t[5];overlay.querySelector('[data-close]').setAttribute('aria-label',t[6]);overlay.querySelector('input').placeholder=t[7];overlay.querySelector('button[type=submit]').textContent=t[8];searchButton.setAttribute('aria-label',t[5]);}
  translate();document.body.append(nav,overlay);
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
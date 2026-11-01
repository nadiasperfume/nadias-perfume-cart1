'use strict';
(function(){
 const host=document.getElementById('customerReviews');if(!host)return;
 const tr=(ar,en)=>typeof t==='function'?t(ar,en):ar;
 const cleanUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:null}catch{return null}};
 async function render(){
  if(typeof sb==='undefined'||!sb)return;
  const {data,error}=await sb.from('site_content').select('value').eq('key','reviews_gallery').maybeSingle();
  if(error)return;
  const slug=new URLSearchParams(location.search).get('slug');
  const items=(Array.isArray(data?.value?.items)?data.value.items:[]).filter(r=>r.visible!==false&&(!slug||!r.product_slug||r.product_slug===slug)).sort((a,b)=>(Number(a.position)||0)-(Number(b.position)||0));
  host.replaceChildren();if(!items.length){host.hidden=true;return;}host.hidden=false;
  const title=document.createElement('h2');title.textContent=tr('تجارب عملائنا 🤍','What our customers say 🤍');host.append(title);
  const track=document.createElement('div');track.className='nadia-review-track';host.append(track);
  for(const r of items){const src=cleanUrl(r.image_url);if(!src)continue;
   const card=document.createElement('figure');card.className='nadia-review-card';
   const img=document.createElement('img');img.src=src;img.alt=tr('صورة مراجعة عميل','Customer review screenshot');img.loading='lazy';
   const a=document.createElement('a');a.href=src;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',tr('تكبير التقييم','View review image'));a.append(img);card.append(a);
   const caption=document.createElement('figcaption');caption.textContent=String(r.source||'');card.append(caption);track.append(card);
  }
  if(!track.children.length)host.hidden=true;
 }
 document.addEventListener('DOMContentLoaded',render);document.addEventListener('languagechange',render);
})();
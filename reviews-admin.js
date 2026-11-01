'use strict';
(function(){
 const root=document.getElementById('tab-reviews');if(!root)return;
 let items=[];
 const $=s=>root.querySelector(s);
 const status=(s)=>{$('#reviewStatus').textContent=s};
 const tr=(a,b)=>document.documentElement.lang==='en'?b:a;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function draw(){
  const list=$('#reviewList');list.replaceChildren();
  items.forEach((r,i)=>{const row=document.createElement('div');row.className='nadia-review-admin-row';
   const image=document.createElement('img');image.src=r.image_url;image.alt='Review';image.loading='lazy';row.append(image);
   const label=document.createElement('span');label.textContent=(r.source||tr('بدون مصدر','No source'))+' · '+(r.visible===false?tr('مخفي','Hidden'):tr('ظاهر','Visible'));row.append(label);
   for(const [name,action] of [[tr('إظهار/إخفاء','Toggle'),()=>{r.visible=r.visible===false;draw()}],[tr('↑','↑'),()=>{if(i){[items[i-1],items[i]]=[items[i],items[i-1]];draw()}}],[tr('↓','↓'),()=>{if(i<items.length-1){[items[i+1],items[i]]=[items[i],items[i+1]];draw()}}],[tr('حذف','Remove'),()=>{items.splice(i,1);draw()}]]){const button=document.createElement('button');button.type='button';button.className='admin-btn';button.textContent=name;button.addEventListener('click',action);row.append(button)}
   list.append(row);
  });
 }
 async function load(){if(typeof sb==='undefined'||!sb)return;try{const data=await getContent('reviews_gallery');items=Array.isArray(data.items)?data.items:[];draw();status('')}catch(e){status(tr('تعذر تحميل التقييمات','Could not load reviews'))}}
 $('#reviewForm').addEventListener('submit',async e=>{
  e.preventDefault();const button=$('#reviewSave');button.disabled=true;status(tr('جاري الحفظ…','Saving…'));
  try{
   const file=$('#reviewImage').files[0];
   if(file){const image_url=await uploadImage(file,'reviews');items.push({id:crypto.randomUUID(),image_url,source:$('#reviewSource').value.trim().slice(0,80),product_slug:$('#reviewProduct').value.trim().slice(0,160),visible:true});}
   else if(!items.length)throw Error(tr('اختر صورة أولاً','Choose an image first'));
   await putContent('reviews_gallery',{items:items.map((r,i)=>({...r,position:i}))});
   e.target.reset();draw();status(tr('تم حفظ التقييمات','Reviews saved'));
  }catch(err){status(err.message||tr('فشل الحفظ','Save failed'))}
  finally{button.disabled=false}
 });
 const original=window.openTab;window.openTab=function(name,button,options){original(name,button,options);if(name==='reviews')load()};
 document.addEventListener('DOMContentLoaded',load);
})();
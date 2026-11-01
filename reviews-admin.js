'use strict';
(function(){
 const root=document.getElementById('tab-reviews');if(!root)return;
 let items=[],loaded=false,loading=null,saving=false;
 const $=s=>root.querySelector(s);
 const status=(s)=>{$('#reviewStatus').textContent=s};
 const tr=(a,b)=>document.documentElement.lang==='en'?b:a;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function draw(){
  const list=$('#reviewList');list.replaceChildren();
  if(!items.length){const empty=document.createElement('p');empty.textContent=tr('لا توجد تقييمات بعد. ارفع أول صورة من النموذج أعلاه.','No reviews yet. Upload your first screenshot above.');list.append(empty);}
  items.forEach((r,i)=>{const row=document.createElement('div');row.className='nadia-review-admin-row';
   const image=document.createElement('img');image.src=r.image_url;image.alt='Review';image.loading='lazy';row.append(image);
   const label=document.createElement('span');label.textContent=(r.source||tr('بدون مصدر','No source'))+' · '+(r.visible===false?tr('مخفي','Hidden'):tr('ظاهر','Visible'));row.append(label);
   for(const [name,action] of [[tr('إظهار/إخفاء','Toggle'),()=>{r.visible=r.visible===false;draw()}],[tr('↑','↑'),()=>{if(i){[items[i-1],items[i]]=[items[i],items[i-1]];draw()}}],[tr('↓','↓'),()=>{if(i<items.length-1){[items[i+1],items[i]]=[items[i],items[i+1]];draw()}}],[tr('حذف','Remove'),()=>{items.splice(i,1);draw()}]]){const button=document.createElement('button');button.type='button';button.className='admin-btn';button.textContent=name;button.addEventListener('click',action);row.append(button)}
   list.append(row);
  });
 }
 async function load(){
  if(loading)return loading;if(saving)return;
  loaded=false;$('#reviewSave').disabled=true;
  loading=(async()=>{try{
   if(typeof sb==='undefined'||!sb)throw Error(tr('الاتصال غير متاح. أعد تحميل الصفحة.','Connection unavailable. Reload the page.'));
   const data=await getContent('reviews_gallery');items=Array.isArray(data.items)?data.items:[];
   loaded=true;draw();status('');
  }catch(e){status(e.message||tr('تعذر تحميل التقييمات. افتح القسم مرة أخرى للمحاولة.','Could not load reviews. Reopen this section to retry.'))}
  finally{$('#reviewSave').disabled=!loaded;loading=null;}})();return loading;
 }
 $('#reviewForm').addEventListener('submit',async e=>{
  e.preventDefault();if(saving)return;if(!loaded){await load();if(!loaded)return;}saving=true;const button=$('#reviewSave');button.disabled=true;status(tr('جاري الحفظ…','Saving…'));
  try{
   const file=$('#reviewImage').files[0];
   if(file){const image_url=await uploadImage(file,'reviews');items.push({id:crypto.randomUUID(),image_url,source:$('#reviewSource').value.trim().slice(0,80),product_slug:$('#reviewProduct').value.trim().slice(0,160),visible:true});}
   else if(!items.length)throw Error(tr('اختر صورة أولاً','Choose an image first'));
   await putContent('reviews_gallery',{items:items.map((r,i)=>({...r,position:i}))});
   e.target.reset();draw();status(tr('تم حفظ التقييمات','Reviews saved'));
  }catch(err){status(err.message||tr('فشل الحفظ','Save failed'))}
  finally{saving=false;button.disabled=!loaded}
 });
 if(typeof TAB_TEXT!=='undefined')TAB_TEXT.reviews=['آراء العملاء','Customer reviews','ارفع صور التقييمات ورتّب ظهورها في المتجر.','Upload review screenshots and manage their display.'];
 const original=window.openTab;window.openTab=function(name,button,options){original(name,button,options);if(name==='reviews')load()};
 document.addEventListener('DOMContentLoaded',load);
})();
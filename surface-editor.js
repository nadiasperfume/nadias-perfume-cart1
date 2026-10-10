// Full-page content editor. Saves through the existing versioned admin-only RPC.
let surfaceKey = null;
let surfaceLoaded = false;
let surfaceBaseline = {};
function surfaceContentKey(key) { return 'surface_' + key; }
async function loadSurfaceEditor() {
  const key = A('#surfacePage').value;
  surfaceLoaded = false;
  A('#surfaceSave').disabled = true;
  A('#surfaceFields').replaceChildren();
  setStatus('#surfaceStatus', txt('جاري تحميل المحتوى…', 'Loading content…'));
  try {
    const value = await getContent(surfaceContentKey(key));
    if (key !== A('#surfacePage').value) return;
    surfaceKey = key;
    surfaceBaseline = value.fields || {};
    const fields = window.NADIA_SURFACE_FIELDS[key] || [];
    A('#surfaceFields').innerHTML = fields.map((field, i) => {
      const saved = surfaceBaseline[field.id] || field;
      const label = esc(lang === 'ar' ? field.ar : field.en);
      const input = field.type === 'image'
        ? `<div class="field"><label for="surface-url-${i}">${txt('رابط الصورة', 'Image URL')}</label><input id="surface-url-${i}" data-surface-value="url" value="${esc(saved.url ?? field.url)}"><label for="surface-upload-${i}">${txt('رفع صورة جديدة', 'Upload a new image')}</label><input id="surface-upload-${i}" data-surface-upload type="file" accept="image/jpeg,image/png,image/webp"><small>${txt('اترك الرابط فارغاً لإخفاء الصورة.', 'Leave the URL empty to hide this image.')}</small></div>`
        : `<div class="admin-grid-2"><div class="field"><label for="surface-ar-${i}">${txt('العربية', 'Arabic')}</label><textarea id="surface-ar-${i}" data-surface-value="ar">${esc(saved.ar ?? field.ar)}</textarea></div><div class="field"><label for="surface-en-${i}">${txt('الإنجليزية', 'English')}</label><textarea id="surface-en-${i}" data-surface-value="en">${esc(saved.en ?? field.en)}</textarea></div></div>`;
      return `<details class="admin-card-v2" data-surface-field="${esc(field.id)}"><summary>${label || txt('صورة', 'Image')}</summary>${input}<button type="button" class="admin-btn" data-surface-reset>${txt('استعادة المحتوى الأصلي', 'Restore original content')}</button></details>`;
    }).join('');
    AA('[data-surface-field]').forEach(row => {
      row.querySelector('[data-surface-reset]').onclick = () => {
        const field = fields.find(f => f.id === row.dataset.surfaceField);
        row.querySelectorAll('[data-surface-value]').forEach(input => input.value = field[input.dataset.surfaceValue] ?? '');
        row.dataset.reset = 'true';
      };
      row.querySelectorAll('[data-surface-value]').forEach(input => {
        input.dataset.initial = input.value;
        input.addEventListener('input', () => delete row.dataset.reset);
      });
      row.querySelector('[data-surface-upload]')?.addEventListener('change', () => delete row.dataset.reset);
    });
    surfaceLoaded = true;
    A('#surfaceSave').disabled = false;
    setStatus('#surfaceStatus', txt('اختر الجزء الذي تريد تعديله، ثم احفظ.', 'Open the section you want to edit, then save.'));
  } catch (error) { setStatus('#surfaceStatus', error.message, 'error'); }
}
async function saveSurfaceEditor(event) {
  event.preventDefault();
  if (!surfaceLoaded || surfaceKey !== A('#surfacePage').value || !lockForm(event.target)) return;
  A('#surfacePage').disabled = true;
  try {
    const fields = {...surfaceBaseline};
    for (const row of AA('[data-surface-field]')) {
      const id = row.dataset.surfaceField;
      const definition = window.NADIA_SURFACE_FIELDS[surfaceKey].find(f => f.id === id);
      const values = [...row.querySelectorAll('[data-surface-value]')];
      const file = row.querySelector('[data-surface-upload]')?.files?.[0];
      if (row.dataset.reset === 'true') { delete fields[id]; continue; }
      if (!file && values.every(input => input.value === input.dataset.initial)) continue;
      const value = Object.fromEntries(values.map(input => [input.dataset.surfaceValue, input.value]));
      if (definition.type === 'image') {
        if (file) value.url = await uploadImage(file, 'pages/' + surfaceKey);
        if (value.url && !NadiaStore.imageUrl(value.url)) throw new Error(txt('استخدم رابط صورة HTTPS أو مسار صورة داخل الموقع.', 'Use an HTTPS image URL or an image path in this site.'));
      }
      fields[id] = value;
    }
    await putContent(surfaceContentKey(surfaceKey), {...contentValues[surfaceContentKey(surfaceKey)], fields});
    surfaceBaseline = fields;
    AA('[data-surface-field]').forEach(row => {
      delete row.dataset.reset;
      row.querySelectorAll('[data-surface-value]').forEach(input => input.dataset.initial = input.value);
      const fileInput = row.querySelector('[data-surface-upload]');
      if (fileInput) fileInput.value = '';
    });
    setStatus('#surfaceStatus', txt('تم الحفظ. افتح الصفحة لمراجعة التعديلات.', 'Saved. Open the page to review your changes.'), 'success');
  } catch (error) { setStatus('#surfaceStatus', error.message, 'error'); }
  finally { unlockForm(event.target); A('#surfacePage').disabled = false; }
}
document.addEventListener('DOMContentLoaded', () => {
  A('#surfacePage').addEventListener('change', loadSurfaceEditor);
  A('#surfaceForm').addEventListener('submit', saveSurfaceEditor);
});

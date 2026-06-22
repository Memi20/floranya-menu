let ADMIN_PASSWORD = '';
let menuData = [];
let allItems = [];
let settingsData = {};

/* ===================== AUTH ===================== */
async function login() {
  const pass = document.getElementById('password-input').value;
  const res = await fetch('/api/admin/check', { method: 'POST', headers: { 'x-admin-password': pass } });
  if (res.ok) {
    ADMIN_PASSWORD = pass;
    sessionStorage.setItem('floranya_admin_pw', pass);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'block';
    refreshAll();
  } else {
    document.getElementById('login-error').textContent = 'Wrong password.';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('floranya_admin_pw');
  if (saved) { document.getElementById('password-input').value = saved; login(); }
});

function ah(extra = {}) { return { 'x-admin-password': ADMIN_PASSWORD, ...extra }; }
function ahj() { return ah({ 'Content-Type': 'application/json' }); }

/* ===================== TAB NAVIGATION ===================== */
const tabTitles = { slideshow: 'Hero Video', featured: 'Featured', categories: 'Categories', items: 'Items', comments: 'Comments', design: 'Design' };

function switchTab(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item, .admin-mobile-nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll(`[data-tab="${name}"]`).forEach(b => b.classList.add('active'));
  document.getElementById('topbar-title').textContent = tabTitles[name] || name;
}

/* ===================== REFRESH ALL ===================== */
async function refreshAll() {
  await Promise.all([refreshMenu(), loadHeroVideoTab(), refreshSettings(), refreshComments(), applyDesignSettings()]);
}

async function refreshMenu() {
  const res = await fetch('/api/menu?all=1', { headers: ah() });
  menuData = await res.json();
  allItems = menuData.flatMap(c => c.items);
  renderCategoriesTable();
  renderCategoryDropdown();
  renderItemsTable();
  renderFeaturedManualList();
}

async function refreshSettings() {
  const res = await fetch('/api/settings');
  settingsData = await res.json();
  const isAuto = settingsData.featured_mode === 'auto';
  const toggle = document.getElementById('featured-auto-toggle');
  if (toggle) { toggle.checked = isAuto; }
  document.getElementById('featured-manual-panel').style.display = isAuto ? 'none' : 'block';
}

async function loadHeroVideoTab() {
  const settings = await fetch('/api/settings').then(r => r.json());
  settingsData = { ...settingsData, ...settings };
  renderHeroVideoPreview(settings.hero_video_filename || '');
}

function renderHeroVideoPreview(filename) {
  const el = document.getElementById('hero-video-preview');
  if (!el) return;
  if (filename) {
    el.innerHTML = `
      <video src="/videos/${esc(filename)}" muted controls
             style="width:100%;aspect-ratio:21/9;object-fit:cover;border-radius:8px;margin-top:12px;background:#000;"></video>
      <button class="btn-sm danger" onclick="removeHeroVideo()" style="margin-top:8px;">Remove Video</button>`;
  } else {
    el.innerHTML = '<p style="color:var(--ink-soft);font-size:.85rem;padding:14px 0 4px;">No video uploaded yet. Upload an MP4 or WebM file.</p>';
  }
}

async function uploadHeroVideo() {
  const file = document.getElementById('hero-video-file')?.files[0];
  if (!file) return alert('Please select a video file first.');
  const form = new FormData();
  form.append('video', file);
  const res = await fetch('/api/upload/video', { method: 'POST', headers: ah(), body: form });
  const data = await res.json();
  if (!data.filename) return alert('Upload failed.');
  await fetch('/api/settings', { method: 'PUT', headers: ahj(), body: JSON.stringify({ hero_video_filename: data.filename }) });
  renderHeroVideoPreview(data.filename);
  document.getElementById('hero-video-file').value = '';
}

async function removeHeroVideo() {
  if (!confirm('Remove the hero video?')) return;
  await fetch('/api/settings', { method: 'PUT', headers: ahj(), body: JSON.stringify({ hero_video_filename: '' }) });
  renderHeroVideoPreview('');
}

async function refreshComments() {
  const res = await fetch('/api/admin/comments', { headers: ah() });
  const comments = await res.json();
  const pending = comments.filter(c => !c.approved);
  const badge = document.getElementById('pending-badge');
  badge.textContent = pending.length;
  badge.style.display = pending.length ? 'inline' : 'none';

  const label = document.getElementById('comments-count-label');
  if (label) label.textContent = `${pending.length} pending`;

  const list = document.getElementById('comments-list');
  if (!comments.length) {
    list.innerHTML = '<p style="color:var(--ink-soft);text-align:center;padding:20px;">No comments yet.</p>';
    return;
  }
  list.innerHTML = comments.map(c => `
    <div class="comment-admin-card">
      <div class="comment-admin-meta">
        <span class="comment-admin-author">${esc(c.author_name)}</span>
        <span class="comment-admin-item">on: ${esc(c.item_name)}</span>
        ${!c.approved ? '<span class="pending-badge">Pending</span>' : ''}
        <span class="comment-admin-date">${new Date(c.created_at).toLocaleDateString()}</span>
      </div>
      <div class="comment-admin-body">${esc(c.body)}</div>
      <div style="display:flex;gap:8px;">
        ${!c.approved ? `<button class="btn-sm" onclick="approveComment(${c.id})">✓ Approve</button>` : ''}
        <button class="btn-sm danger" onclick="deleteComment(${c.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

/* ===================== DRAG-TO-REORDER ===================== */
let dragCatId  = null;
let dragItemId = null;

function startDragCat(e, id) {
  dragCatId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.style.opacity = '.45';
}
function endDragCat(e) {
  e.currentTarget.style.opacity = '';
  document.querySelectorAll('#categories-table tr.drag-over').forEach(r => r.classList.remove('drag-over'));
}
function dragOverCat(e, el) {
  e.preventDefault();
  document.querySelectorAll('#categories-table tr.drag-over').forEach(r => r.classList.remove('drag-over'));
  el.classList.add('drag-over');
}
async function dropOnCat(e, targetId) {
  e.preventDefault();
  document.querySelectorAll('#categories-table tr.drag-over').forEach(r => r.classList.remove('drag-over'));
  if (!dragCatId || dragCatId === targetId) { dragCatId = null; return; }
  const src = menuData.find(c => c.id === dragCatId);
  const tgt = menuData.find(c => c.id === targetId);
  dragCatId = null;
  if (!src || !tgt) return;
  await Promise.all([
    fetch(`/api/categories/${src.id}`, { method: 'PUT', headers: ahj(), body: JSON.stringify({ ...src, sort_order: tgt.sort_order }) }),
    fetch(`/api/categories/${tgt.id}`, { method: 'PUT', headers: ahj(), body: JSON.stringify({ ...tgt, sort_order: src.sort_order }) })
  ]);
  refreshMenu();
}

function startDragItem(e, id) {
  dragItemId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.style.opacity = '.45';
}
function endDragItem(e) {
  e.currentTarget.style.opacity = '';
  document.querySelectorAll('#items-table tr.drag-over').forEach(r => r.classList.remove('drag-over'));
}
function dragOverItem(e, el) {
  e.preventDefault();
  document.querySelectorAll('#items-table tr.drag-over').forEach(r => r.classList.remove('drag-over'));
  el.classList.add('drag-over');
}
async function dropOnItem(e, targetId) {
  e.preventDefault();
  document.querySelectorAll('#items-table tr.drag-over').forEach(r => r.classList.remove('drag-over'));
  if (!dragItemId || dragItemId === targetId) { dragItemId = null; return; }
  const src = allItems.find(i => i.id === dragItemId);
  const tgt = allItems.find(i => i.id === targetId);
  dragItemId = null;
  if (!src || !tgt) return;
  await Promise.all([
    fetch(`/api/items/${src.id}`, { method: 'PUT', headers: ahj(), body: JSON.stringify({ ...src, sort_order: tgt.sort_order }) }),
    fetch(`/api/items/${tgt.id}`, { method: 'PUT', headers: ahj(), body: JSON.stringify({ ...tgt, sort_order: src.sort_order }) })
  ]);
  refreshMenu();
}

/* ===================== CATEGORIES ===================== */
function renderCategoriesTable() {
  const tbody = document.querySelector('#categories-table tbody');
  tbody.innerHTML = menuData.map(cat => `
    <tr draggable="true"
        ondragstart="startDragCat(event, ${cat.id})"
        ondragend="endDragCat(event)"
        ondragover="dragOverCat(event, this)"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="dropOnCat(event, ${cat.id})"
        style="${cat.available ? '' : 'opacity:.55;'}">
      <td><span class="drag-handle">⠿</span></td>
      <td>
        ${cat.icon_filename
          ? `<img src="/images/${esc(cat.icon_filename)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
          : '<span style="color:var(--ink-soft);font-size:.8rem;">—</span>'}
        <label class="btn-sm secondary" style="cursor:pointer;margin-top:4px;display:inline-block;">
          Change
          <input type="file" accept="image/*" style="display:none;"
                 onchange="uploadIconForCategory(${cat.id}, this)">
        </label>
      </td>
      <td><input class="a-input" value="${esc(cat.name)}"
           onchange="updateCategory(${cat.id}, 'name', this.value)" style="width:130px;"></td>
      <td><input class="a-input" dir="rtl" value="${esc(cat.name_ar||'')}"
           onchange="updateCategory(${cat.id}, 'name_ar', this.value)" style="width:130px;"></td>
      <td>
        <label class="a-toggle">
          <input type="checkbox" ${cat.available !== 0 ? 'checked' : ''}
                 onchange="updateCategory(${cat.id}, 'available', this.checked)">
          <div class="toggle-track"></div>
        </label>
      </td>
      <td><button class="btn-sm danger" onclick="deleteCategory(${cat.id})">Delete</button></td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="padding:16px;color:var(--ink-soft);">No categories yet.</td></tr>';
}

function renderCategoryDropdown() {
  const sel = document.getElementById('new-item-cat');
  if (!sel) return;
  sel.innerHTML = menuData.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
}

async function addCategory() {
  const name = document.getElementById('new-cat-en').value.trim();
  const name_ar = document.getElementById('new-cat-ar').value.trim();
  const iconInput = document.getElementById('new-cat-icon');
  if (!name) return alert('Name is required.');
  let icon_filename = null;
  if (iconInput.files[0]) icon_filename = await uploadImage(iconInput.files[0]);
  await fetch('/api/categories', { method: 'POST', headers: ahj(),
    body: JSON.stringify({ name, name_ar, icon_filename, sort_order: menuData.length + 1 }) });
  document.getElementById('new-cat-en').value = '';
  document.getElementById('new-cat-ar').value = '';
  iconInput.value = '';
  refreshMenu();
}

async function updateCategory(id, field, value) {
  const cat = menuData.find(c => c.id === id);
  if (!cat) return;
  const coerced = field === 'sort_order' ? Number(value) : field === 'available' ? (value ? 1 : 0) : value;
  const updated = { name: cat.name, name_ar: cat.name_ar, icon_filename: cat.icon_filename, sort_order: cat.sort_order, available: cat.available ?? 1, [field]: coerced };
  await fetch(`/api/categories/${id}`, { method: 'PUT', headers: ahj(), body: JSON.stringify(updated) });
  refreshMenu();
}

async function uploadIconForCategory(id, input) {
  if (!input.files[0]) return;
  const icon_filename = await uploadImage(input.files[0]);
  await updateCategory(id, 'icon_filename', icon_filename);
}

async function deleteCategory(id) {
  if (!confirm('Delete this category and all its items?')) return;
  await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: ah() });
  refreshMenu();
}

/* ===================== ITEMS ===================== */
let expandedItemId = null;

function renderItemsTable() {
  const tbody = document.querySelector('#items-table tbody');
  const rows = [];
  menuData.forEach(cat => {
    cat.items.forEach(item => {
      const isExpanded = expandedItemId === item.id;
      rows.push(`
        <tr draggable="true"
            ondragstart="startDragItem(event, ${item.id})"
            ondragend="endDragItem(event)"
            ondragover="dragOverItem(event, this)"
            ondragleave="this.classList.remove('drag-over')"
            ondrop="dropOnItem(event, ${item.id})"
            onclick="toggleItemExpand(${item.id})" style="cursor:pointer;">
          <td onclick="event.stopPropagation()"><span class="drag-handle">⠿</span></td>
          <td><img src="/images/${esc(item.image_filename||'placeholder.svg')}" onerror="this.src='/images/placeholder.svg'"></td>
          <td>
            <strong>${esc(item.name)}</strong>
            ${item.name_ar ? `<div style="font-size:.78rem;color:var(--ink-soft);" dir="rtl">${esc(item.name_ar)}</div>` : ''}
          </td>
          <td>${esc(cat.name)}</td>
          <td>${Number(item.price).toLocaleString()}</td>
          <td>
            <label class="a-toggle" onclick="event.stopPropagation()">
              <input type="checkbox" ${item.available ? 'checked' : ''}
                     onchange="updateItemField(${item.id}, 'available', this.checked)">
              <div class="toggle-track"></div>
            </label>
          </td>
          <td>
            <div class="td-actions" onclick="event.stopPropagation()">
              <label class="btn-sm secondary" style="cursor:pointer;">
                Image <input type="file" accept="image/*" style="display:none;" onchange="uploadImageForItem(${item.id}, this)">
              </label>
              <button class="btn-sm danger" onclick="deleteItem(${item.id})">Delete</button>
            </div>
          </td>
        </tr>
        ${isExpanded ? `
        <tr class="item-expand-row">
          <td colspan="7">
            <div class="item-expand-inner">
              ${renderItemEditForm(item)}
            </div>
          </td>
        </tr>` : ''}
      `);
    });
  });
  tbody.innerHTML = rows.join('') || '<tr><td colspan="7" style="padding:16px;color:var(--ink-soft);">No items yet.</td></tr>';
}

function renderItemEditForm(item) {
  const extras = item.extras || [];
  return `
    <div class="form-grid form-grid-2" style="margin-bottom:14px;">
      <div>
        <label class="a-label">Name (English)</label>
        <input class="a-input" value="${esc(item.name)}"
               onchange="updateItemField(${item.id},'name',this.value)">
      </div>
      <div>
        <label class="a-label">Name (Arabic)</label>
        <input class="a-input" dir="rtl" value="${esc(item.name_ar||'')}"
               onchange="updateItemField(${item.id},'name_ar',this.value)">
      </div>
      <div>
        <label class="a-label">Description (English)</label>
        <textarea class="a-textarea"
                  onchange="updateItemField(${item.id},'description',this.value)">${esc(item.description||'')}</textarea>
      </div>
      <div>
        <label class="a-label">Description (Arabic)</label>
        <textarea class="a-textarea" dir="rtl"
                  onchange="updateItemField(${item.id},'description_ar',this.value)">${esc(item.description_ar||'')}</textarea>
      </div>
      <div>
        <label class="a-label">Price (IQD)</label>
        <input type="number" class="a-input" value="${item.price}"
               onchange="updateItemField(${item.id},'price',Number(this.value))">
      </div>
      <div>
        <label class="a-label">Category</label>
        <select class="a-select" onchange="updateItemField(${item.id},'category_id',this.value)">
          ${menuData.map(c => `<option value="${c.id}" ${c.id===item.category_id?'selected':''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
    </div>
    ${renderExtrasEditor(extras, item.id)}
  `;
}

function toggleItemExpand(id) {
  expandedItemId = expandedItemId === id ? null : id;
  renderItemsTable();
}

async function addItem() {
  const category_id = document.getElementById('new-item-cat').value;
  const name        = document.getElementById('new-item-name-en').value.trim();
  const name_ar     = document.getElementById('new-item-name-ar').value.trim();
  const description = document.getElementById('new-item-desc-en').value.trim();
  const description_ar = document.getElementById('new-item-desc-ar').value.trim();
  const price       = document.getElementById('new-item-price').value;
  const fileInput   = document.getElementById('new-item-img');
  if (!category_id || !name || !price) return alert('Category, name and price are required.');
  let image_filename = null;
  if (fileInput.files[0]) image_filename = await uploadImage(fileInput.files[0]);
  await fetch('/api/items', { method: 'POST', headers: ahj(),
    body: JSON.stringify({ category_id, name, name_ar, description, description_ar, price: Number(price), image_filename }) });
  ['new-item-name-en','new-item-name-ar','new-item-desc-en','new-item-desc-ar','new-item-price'].forEach(id => {
    document.getElementById(id).value = '';
  });
  fileInput.value = '';
  refreshMenu();
}

async function updateItemField(id, field, value) {
  const item = allItems.find(i => i.id === id);
  if (!item) return;
  const updated = { ...item, [field]: value };
  await fetch(`/api/items/${id}`, { method: 'PUT', headers: ahj(), body: JSON.stringify(updated) });
  refreshMenu();
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  await fetch(`/api/items/${id}`, { method: 'DELETE', headers: ah() });
  if (expandedItemId === id) expandedItemId = null;
  refreshMenu();
}

async function uploadImageForItem(id, input) {
  if (!input.files[0]) return;
  const filename = await uploadImage(input.files[0]);
  await updateItemField(id, 'image_filename', filename);
}

/* ===================== EXTRAS ===================== */
function renderExtrasEditor(extras, itemId) {
  const standalone = extras.filter(ex => !ex.conflict_group);
  const groups = {};
  extras.filter(ex => ex.conflict_group).forEach(ex => {
    if (!groups[ex.conflict_group]) groups[ex.conflict_group] = [];
    groups[ex.conflict_group].push(ex);
  });

  const extraRow = ex => `
    <div class="extra-row">
      <input class="a-input" value="${esc(ex.name)}" placeholder="Name EN"
             onchange="updateExtra(${ex.id},'name',this.value)">
      <input class="a-input" dir="rtl" value="${esc(ex.name_ar||'')}" placeholder="الاسم"
             onchange="updateExtra(${ex.id},'name_ar',this.value)">
      <input type="number" class="a-input price-input" value="${ex.price_addition}" placeholder="+IQD"
             onchange="updateExtra(${ex.id},'price_addition',Number(this.value))">
      <button class="btn-sm danger" onclick="deleteExtra(${ex.id}, ${itemId})">✕</button>
    </div>`;

  let html = `<div style="font-weight:600;font-size:.82rem;margin-bottom:8px;color:var(--ink-soft);">
    ☑ ADD-ONS <span style="font-weight:400;">(customer can select multiple)</span></div>
  <div class="extras-editor">${standalone.map(extraRow).join('')}</div>
  <div class="extra-row" style="margin-bottom:16px;">
    <input class="a-input" id="new-addon-en-${itemId}" placeholder="Name (EN)">
    <input class="a-input" dir="rtl" id="new-addon-ar-${itemId}" placeholder="الاسم">
    <input type="number" class="a-input price-input" id="new-addon-price-${itemId}" placeholder="+IQD">
    <button class="btn-sm" onclick="addAddon(${itemId})">+ Add</button>
  </div>`;

  html += `<div style="font-weight:600;font-size:.82rem;margin-bottom:8px;color:var(--ink-soft);">
    ◉ OPTION GROUPS <span style="font-weight:400;">(customer picks one per group)</span></div>`;

  for (const [group, options] of Object.entries(groups)) {
    html += `<div class="option-group-block">
      <div class="option-group-label">◉ ${esc(group)}</div>
      ${options.map(extraRow).join('')}
      <div class="extra-row" style="margin-top:6px;" data-group="${esc(group)}" data-item="${itemId}">
        <input class="a-input new-opt-en" placeholder="Option (EN)">
        <input class="a-input new-opt-ar" dir="rtl" placeholder="الخيار">
        <input type="number" class="a-input price-input new-opt-price" placeholder="+IQD">
        <button class="btn-sm secondary" onclick="addOptionToGroup('${esc(group)}',${itemId},this)">+ Add</button>
      </div>
    </div>`;
  }

  html += `<div class="extra-row" style="margin-top:6px;">
    <input class="a-input" id="new-group-name-${itemId}" placeholder="New group name (e.g. Milk Type)">
    <button class="btn-sm secondary" onclick="addNewGroup(${itemId})">+ Add Option Group</button>
  </div>`;

  return html;
}

async function addAddon(itemId) {
  const name   = document.getElementById(`new-addon-en-${itemId}`)?.value.trim();
  const name_ar = document.getElementById(`new-addon-ar-${itemId}`)?.value.trim();
  const price  = Number(document.getElementById(`new-addon-price-${itemId}`)?.value || 0);
  if (!name) return alert('Add-on name is required.');
  await fetch(`/api/items/${itemId}/extras`, { method: 'POST', headers: ahj(),
    body: JSON.stringify({ name, name_ar, price_addition: price, conflict_group: null }) });
  refreshMenu();
}

async function addOptionToGroup(groupName, itemId, btn) {
  const row  = btn.closest('[data-group]');
  const name   = row.querySelector('.new-opt-en')?.value.trim();
  const name_ar = row.querySelector('.new-opt-ar')?.value.trim();
  const price  = Number(row.querySelector('.new-opt-price')?.value || 0);
  if (!name) return alert('Option name is required.');
  await fetch(`/api/items/${itemId}/extras`, { method: 'POST', headers: ahj(),
    body: JSON.stringify({ name, name_ar, price_addition: price, conflict_group: groupName }) });
  refreshMenu();
}

async function addNewGroup(itemId) {
  const groupName = document.getElementById(`new-group-name-${itemId}`)?.value.trim();
  if (!groupName) return alert('Group name is required.');
  await fetch(`/api/items/${itemId}/extras`, { method: 'POST', headers: ahj(),
    body: JSON.stringify({ name: groupName, name_ar: '', price_addition: 0, conflict_group: groupName }) });
  refreshMenu();
}

async function updateExtra(extraId, field, value) {
  // Find the extra
  let ex = null;
  for (const cat of menuData) {
    for (const item of cat.items) {
      ex = (item.extras || []).find(e => e.id === extraId);
      if (ex) break;
    }
    if (ex) break;
  }
  if (!ex) return;
  const updated = { ...ex, [field]: value };
  await fetch(`/api/extras/${extraId}`, { method: 'PUT', headers: ahj(), body: JSON.stringify(updated) });
  refreshMenu();
}

async function deleteExtra(extraId, itemId) {
  await fetch(`/api/extras/${extraId}`, { method: 'DELETE', headers: ah() });
  refreshMenu();
}

/* ===================== SLIDESHOW ===================== */
/* slide functions removed — replaced by hero video */

/* ===================== FEATURED ===================== */
function renderFeaturedManualList() {
  const list = document.getElementById('featured-manual-list');
  if (!list) return;
  const selectedIds = new Set((settingsData.featured_item_ids || '').split(',').map(Number).filter(Boolean));
  list.innerHTML = allItems.map(item => `
    <label class="featured-manual-item ${selectedIds.has(item.id) ? 'selected' : ''}">
      <input type="checkbox" value="${item.id}" ${selectedIds.has(item.id) ? 'checked' : ''}
             onchange="this.closest('.featured-manual-item').classList.toggle('selected', this.checked)">
      ${esc(item.name)}
    </label>
  `).join('');
}

async function saveFeaturedMode() {
  const isAuto = document.getElementById('featured-auto-toggle').checked;
  await fetch('/api/settings', { method: 'PUT', headers: ahj(),
    body: JSON.stringify({ featured_mode: isAuto ? 'auto' : 'manual' }) });
  settingsData.featured_mode = isAuto ? 'auto' : 'manual';
  document.getElementById('featured-manual-panel').style.display = isAuto ? 'none' : 'block';
}

async function saveFeaturedItems() {
  const checked = [...document.querySelectorAll('#featured-manual-list input:checked')].map(i => i.value);
  await fetch('/api/settings', { method: 'PUT', headers: ahj(),
    body: JSON.stringify({ featured_item_ids: checked.join(',') }) });
  alert('Featured items saved.');
}

/* ===================== COMMENTS ===================== */
async function approveComment(id) {
  await fetch(`/api/comments/${id}/approve`, { method: 'PUT', headers: ah() });
  refreshComments();
}
async function deleteComment(id) {
  if (!confirm('Delete this comment?')) return;
  await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: ah() });
  refreshComments();
}

/* ===================== IMAGE UPLOAD ===================== */
async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', headers: ah(), body: form });
  const data = await res.json();
  return data.filename;
}

/* ===================== DESIGN PANEL ===================== */
async function applyDesignSettings() {
  try {
    const s = await fetch('/api/settings').then(r => r.json());
    if (s.color_primary) {
      document.documentElement.style.setProperty('--primary', s.color_primary);
      const el = document.getElementById('color-primary');
      if (el) el.value = s.color_primary;
    }
    if (s.color_accent) {
      document.documentElement.style.setProperty('--accent', s.color_accent);
      const el = document.getElementById('color-accent');
      if (el) el.value = s.color_accent;
    }
    if (s.color_bg) {
      const el = document.getElementById('color-bg');
      if (el) el.value = s.color_bg;
    }
    // Apply nav icons
    const navMap = { slideshow: s.icon_nav_slideshow, featured: s.icon_nav_featured, categories: s.icon_nav_categories, items: s.icon_nav_items, comments: s.icon_nav_comments };
    for (const [key, filename] of Object.entries(navMap)) {
      const el = document.getElementById(`nav-icon-${key}`);
      if (el && filename) el.innerHTML = `<img src="/images/${esc(filename)}" alt="">`;
    }
    renderIconGrids(s);
  } catch {}
}

function renderIconGrids(s) {
  const uiSlots = [
    { key: 'icon_like_outline', label: 'Like (outline)', fallback: '🤍' },
    { key: 'icon_like_filled',  label: 'Like (filled)',  fallback: '❤️' },
    { key: 'icon_comment',      label: 'Comment',        fallback: '💬' },
  ];
  const navSlots = [
    { key: 'icon_nav_slideshow',   label: 'Hero Video',   fallback: '🎬' },
    { key: 'icon_nav_featured',    label: 'Featured',    fallback: '⭐' },
    { key: 'icon_nav_categories',  label: 'Categories',  fallback: '📂' },
    { key: 'icon_nav_items',       label: 'Items',       fallback: '🧾' },
    { key: 'icon_nav_comments',    label: 'Comments',    fallback: '💬' },
  ];

  const renderGrid = (containerId, slots) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = slots.map(slot => {
      const filename = s[slot.key] || '';
      const preview  = filename
        ? `<img src="/images/${esc(filename)}" alt="">`
        : `<div class="slot-emoji">${slot.fallback}</div>`;
      return `
        <label class="icon-upload-slot">
          ${preview}
          <div class="slot-label">${slot.label}</div>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none;"
                 onchange="uploadIconSetting('${slot.key}', this)">
          <span style="font-size:.72rem;color:var(--primary);">Click to upload</span>
        </label>`;
    }).join('');
  };

  renderGrid('ui-icon-grid', uiSlots);
  renderGrid('nav-icon-grid', navSlots);
}

async function uploadIconSetting(settingKey, input) {
  if (!input.files[0]) return;
  const filename = await uploadImage(input.files[0]);
  await fetch('/api/settings', { method: 'PUT', headers: ahj(), body: JSON.stringify({ [settingKey]: filename }) });
  applyDesignSettings();
}

async function uploadLogo(input) {
  if (!input.files[0]) return;
  const form = new FormData();
  form.append('image', input.files[0]);
  const res  = await fetch('/api/upload/logo', { method: 'POST', headers: ah(), body: form });
  const data = await res.json();
  const preview = document.getElementById('logo-preview');
  if (preview) { preview.style.opacity = '1'; preview.src = `/logo.png?t=${Date.now()}`; }
  // Also update sidebar logo
  document.querySelectorAll('.admin-brand img, .admin-login-logo').forEach(img => {
    img.src = `/logo.png?t=${Date.now()}`;
  });
}

function previewColor(varName, value) {
  document.documentElement.style.setProperty(varName, value);
}

async function saveColors() {
  const primary = document.getElementById('color-primary')?.value;
  const accent  = document.getElementById('color-accent')?.value;
  const bg      = document.getElementById('color-bg')?.value;
  await fetch('/api/settings', { method: 'PUT', headers: ahj(),
    body: JSON.stringify({ color_primary: primary, color_accent: accent, color_bg: bg }) });
  alert('Colors saved. The live menu will reflect these on next load.');
}

/* ===================== HELPERS ===================== */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

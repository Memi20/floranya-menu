/* ===================== DEVICE ID ===================== */
function getDeviceId() {
  let id = localStorage.getItem('floranya_device_id');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
    localStorage.setItem('floranya_device_id', id);
  }
  return id;
}
function getLikedItems() {
  try { return new Set(JSON.parse(localStorage.getItem('floranya_liked_items') || '[]')); } catch { return new Set(); }
}
function getLikedComments() {
  try { return new Set(JSON.parse(localStorage.getItem('floranya_liked_comments') || '[]')); } catch { return new Set(); }
}
function saveLikedItems(s) { localStorage.setItem('floranya_liked_items', JSON.stringify([...s])); }
function saveLikedComments(s) { localStorage.setItem('floranya_liked_comments', JSON.stringify([...s])); }

/* ===================== DESIGN / ICONS ===================== */
let designIcons = {};

async function applyDesignSettings() {
  try {
    const settings = await fetch('/api/settings').then(r => r.json());
    if (settings.color_primary)      document.documentElement.style.setProperty('--primary', settings.color_primary);
    if (settings.color_accent)       document.documentElement.style.setProperty('--accent', settings.color_accent);
    if (settings.color_bg)           document.documentElement.style.setProperty('--bg', settings.color_bg);
    designIcons = {
      like_outline: settings.icon_like_outline || '',
      like_filled:  settings.icon_like_filled  || '',
      comment:      settings.icon_comment      || '',
    };
  } catch {}
}

// Returns an <img> or inline SVG fallback for an icon
function icon(type, cls = '') {
  const clsAttr = cls ? ` class="${cls}"` : '';
  const src = designIcons[type];
  if (src) return `<img src="/images/${esc(src)}"${clsAttr} alt="">`;
  // SVG fallbacks
  if (type === 'like_outline') return `<svg${clsAttr} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  if (type === 'like_filled')  return `<svg${clsAttr} viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  if (type === 'comment')      return `<svg${clsAttr} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  return '';
}

/* ===================== LANGUAGE ===================== */
let lang = localStorage.getItem('floranya_lang') || 'en';

function toggleLang() {
  lang = lang === 'en' ? 'ar' : 'en';
  localStorage.setItem('floranya_lang', lang);
  applyLang();
  // Re-render everything in new language
  init();
}

function applyLang() {
  const root = document.getElementById('html-root');
  root.lang = lang; root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('lang-btn').textContent = lang === 'en' ? 'عربي' : 'English';
  document.querySelectorAll('[data-en][data-ar]').forEach(el => { el.textContent = el.dataset[lang]; });
}

/* ===================== PRICE ===================== */
function fmtPrice(p) {
  const n = Number(p);
  return lang === 'ar'
    ? new Intl.NumberFormat('ar-IQ').format(n) + ' د.ع'
    : new Intl.NumberFormat('en-IQ').format(n) + ' IQD';
}
function itemName(i)  { return (lang==='ar' && i.name_ar)        ? i.name_ar        : i.name; }
function itemDesc(i)  { return (lang==='ar' && i.description_ar) ? i.description_ar : (i.description||''); }
function catName(c)   { return (lang==='ar' && c.name_ar)        ? c.name_ar        : c.name; }
function extraName(e) { return (lang==='ar' && e.name_ar)        ? e.name_ar        : e.name; }

/* ===================== ESCAPE ===================== */
function esc(str) {
  const d = document.createElement('div'); d.textContent = str ?? ''; return d.innerHTML;
}

/* ===================== HERO VIDEO ===================== */
async function loadHeroVideo() {
  try {
    const settings = await fetch('/api/settings').then(r => r.json());
    const filename = settings.hero_video_filename;
    if (!filename) return;
    const wrap  = document.getElementById('hero-video-wrap');
    const video = document.getElementById('hero-video');
    video.src = `/videos/${esc(filename)}`;
    wrap.style.display = 'block';
  } catch {}
}

/* ===================== FEATURED ===================== */
async function loadFeatured() {
  let items;
  try { items = await fetch('/api/featured').then(r => r.json()); }
  catch { return; }
  if (!items.length) return;

  const likedItems = getLikedItems();
  const wrap   = document.getElementById('featured-wrap');
  const scroll = document.getElementById('featured-scroll');

  scroll.innerHTML = items.map((item, idx) => `
    <div class="featured-card anim-item" style="transition-delay:${idx * 0.06}s" onclick="openModal(${item.id})">
      <div class="featured-card-img-wrap">
        <img src="/images/${esc(item.image_filename||'placeholder.svg')}"
             alt="${esc(itemName(item))}" loading="lazy"
             onerror="this.src='/images/placeholder.svg'">
        <div class="featured-card-body">
          <div class="featured-card-name">${esc(itemName(item))}</div>
          <div class="featured-card-meta">
            <span class="featured-price">${fmtPrice(item.price)}</span>
            <span class="featured-likes">${icon(likedItems.has(item.id)?'like_filled':'like_outline')} ${item.likes_count||0}</span>
          </div>
        </div>
        ${item.top_comment ? `
        <div class="featured-comment-note">
          <span class="note-author">${esc(item.top_comment.author_name)}</span>
          <span class="note-text">${esc(item.top_comment.body)}</span>
        </div>` : ''}
      </div>
    </div>
  `).join('');

  wrap.style.display = 'block';
}

/* ===================== FULL MENU ===================== */
let menuData = [];

async function loadMenu() {
  const root = document.getElementById('menu-root');
  const nav  = document.getElementById('cat-nav');
  let menu;
  try { menu = await fetch('/api/menu').then(r => r.json()); }
  catch {
    root.innerHTML = `<p class="state-msg">${lang==='ar'?'تعذّر تحميل القائمة.':'Could not load the menu.'}</p>`;
    return;
  }
  menuData = menu;
  if (!menu.length) {
    root.innerHTML = `<p class="state-msg">${lang==='ar'?'لا توجد عناصر بعد.':'No items yet — check back soon.'}</p>`;
    return;
  }

  const likedItems = getLikedItems();

  // Category nav — icon-only pills when icon available, text pills otherwise
  nav.innerHTML = menu.map(cat => {
    if (cat.icon_filename) {
      return `<button class="cat-pill cat-pill-icon" data-cat="cat-${cat.id}"
                      title="${esc(catName(cat))}"
                      onclick="scrollToCat(${cat.id}, this)">
        <img src="/images/${esc(cat.icon_filename)}" alt="${esc(catName(cat))}">
      </button>`;
    }
    return `<button class="cat-pill" data-cat="cat-${cat.id}" onclick="scrollToCat(${cat.id}, this)">
      ${esc(catName(cat))}
    </button>`;
  }).join('');

  // Sections — title shows icon + text
  root.innerHTML = menu.map(cat => {
    const iconHtml = cat.icon_filename
      ? `<img class="cat-section-icon" src="/images/${esc(cat.icon_filename)}" alt="">`
      : '';
    return `
      <section class="cat-section" id="cat-${cat.id}">
        <h2 class="cat-section-title anim-slide-left">${iconHtml}${esc(catName(cat))}</h2>
        <div class="items-grid">
          ${cat.items.length
            ? cat.items.map(item => renderCard(item, likedItems)).join('')
            : `<p class="state-msg" style="padding:20px 0;">${lang==='ar'?'لا توجد عناصر.':'No items yet.'}</p>`}
        </div>
      </section>`;
  }).join('');
}

function renderCard(item, likedItems) {
  const liked = likedItems.has(item.id);
  const img   = item.image_filename || 'placeholder.svg';
  const desc  = itemDesc(item);
  return `
    <div class="item-card anim-item" onclick="openModal(${item.id})">
      <div class="item-card-img-wrap">
        <img src="/images/${esc(img)}" alt="${esc(itemName(item))}" loading="lazy"
             onerror="this.src='/images/placeholder.svg'">
      </div>
      <button class="item-like-btn ${liked?'liked':''}"
              onclick="event.stopPropagation(); toggleItemLike(${item.id}, this)"
              aria-label="Like">
        ${icon(liked ? 'like_filled' : 'like_outline')}
      </button>
      <div class="item-card-body">
        <div class="item-name">${esc(itemName(item))}</div>
        ${desc ? `<div class="item-desc">${esc(desc)}</div>` : ''}
        ${!item.available ? `<span class="unavail-tag">${lang==='ar'?'غير متوفر':'Unavailable'}</span>` : ''}
        <div class="item-card-footer">
          <span class="item-price">${fmtPrice(item.price)}</span>
          <div class="item-stats">
            <span class="item-stat">${icon('like_outline')} <span id="likes-count-${item.id}">${item.likes_count||0}</span></span>
            <span class="item-stat">${icon('comment')} ${item.comment_count||0}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function scrollToCat(id, btn) {
  document.querySelectorAll('.cat-pill, .cat-pill-icon').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===================== ITEM LIKE (CARD) ===================== */
async function toggleItemLike(itemId, btn) {
  const liked = getLikedItems();
  const was   = liked.has(itemId);
  was ? liked.delete(itemId) : liked.add(itemId);
  saveLikedItems(liked);
  btn.innerHTML = icon(was ? 'like_outline' : 'like_filled');
  btn.classList.toggle('liked', !was);
  try {
    const data = await fetch(`/api/items/${itemId}/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: getDeviceId() })
    }).then(r => r.json());
    const el = document.getElementById(`likes-count-${itemId}`);
    if (el) el.textContent = data.likes_count;
  } catch {}
}

/* ===================== MODAL ===================== */
let currentItemId = null;

async function openModal(itemId) {
  currentItemId = itemId;
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-body');

  body.innerHTML = `<p style="padding:48px;text-align:center;color:var(--ink-soft);">${lang==='ar'?'جاري التحميل…':'Loading…'}</p>`;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  let item = null;
  for (const cat of menuData) {
    item = cat.items.find(i => i.id === itemId);
    if (item) break;
  }
  if (!item) { body.innerHTML = `<p style="padding:48px;text-align:center;">${lang==='ar'?'تعذّر التحميل.':'Could not load.'}</p>`; return; }

  const likedItems    = getLikedItems();
  const likedComments = getLikedComments();
  let comments = [];
  try { comments = await fetch(`/api/items/${itemId}/comments`).then(r => r.json()); } catch {}

  const liked     = likedItems.has(itemId);
  const img       = item.image_filename || 'placeholder.svg';
  const desc      = itemDesc(item);
  const hasExtras = item.extras?.length > 0;

  body.innerHTML = `
    <img class="modal-img" src="/images/${esc(img)}" alt="${esc(itemName(item))}"
         onerror="this.src='/images/placeholder.svg'">
    <div class="modal-info">
      <div class="modal-title-row">
        <h2 class="modal-title">${esc(itemName(item))}</h2>
        <button class="modal-like-btn ${liked?'liked':''}" id="modal-like-btn" onclick="toggleModalLike(${itemId})">
          ${icon(liked?'like_filled':'like_outline')}
          <span id="modal-likes-count">${item.likes_count||0}</span>
        </button>
      </div>
      ${desc ? `<p class="modal-desc">${esc(desc)}</p>` : ''}
      <div class="modal-price-row">
        <span class="modal-base-price" id="modal-base-price">${fmtPrice(item.price)}</span>
        <span class="modal-price-total" id="modal-price-total"></span>
      </div>
    </div>

    ${hasExtras ? renderExtrasSection(item) : ''}

    <div class="comments-section">
      <div class="comments-title">${icon('comment')} ${lang==='ar'?'التعليقات':'Comments'} (${comments.length})</div>
      <div class="comment-form">
        <input type="text" id="comment-name" maxlength="60"
               placeholder="${lang==='ar'?'اسمك الأول':'Your first name'}">
        <textarea id="comment-body" maxlength="500"
                  placeholder="${lang==='ar'?'اكتب تعليقك…':'Write your comment…'}"></textarea>
        <button class="comment-submit" onclick="submitComment(${itemId})">
          ${lang==='ar'?'إرسال':'Send'}
        </button>
        <div id="comment-msg"></div>
      </div>
      <div class="comment-list" id="comment-list">
        ${comments.length
          ? comments.map(c => renderComment(c, likedComments)).join('')
          : `<p class="no-comments">${lang==='ar'?'لا توجد تعليقات بعد. كن أول من يعلق!':'No comments yet. Be the first!'}</p>`}
      </div>
    </div>
  `;

}

/* ===================== EXTRAS — RADIO GROUPS + CHECKBOXES ===================== */
function renderExtrasSection(item) {
  const standalone = item.extras.filter(ex => !ex.conflict_group);
  const groups = {};
  item.extras.filter(ex => ex.conflict_group).forEach(ex => {
    if (!groups[ex.conflict_group]) groups[ex.conflict_group] = [];
    groups[ex.conflict_group].push(ex);
  });

  let html = '';

  if (standalone.length) {
    html += `<div class="extras-section">
      <div class="extras-title">${lang==='ar'?'الإضافات':'Add-ons'}</div>
      ${standalone.map(ex => `
        <div class="extra-item">
          <label class="extra-label">
            <input type="checkbox" data-price="${ex.price_addition}"
                   onchange="recalcPrice(${item.price})">
            <span class="extra-name">${esc(extraName(ex))}</span>
          </label>
          <span class="extra-price-add">+ ${fmtPrice(ex.price_addition)}</span>
        </div>`).join('')}
    </div>`;
  }

  for (const [group, options] of Object.entries(groups)) {
    html += `<div class="extras-section">
      <div class="extras-title">
        <span class="extras-group-header">${esc(group)}</span>
      </div>
      <div class="extra-item">
        <label class="extra-label">
          <input type="radio" name="xg-${item.id}-${esc(group)}" value=""
                 checked onchange="recalcPrice(${item.price})">
          <span class="extra-name">${lang==='ar'?'بدون إضافة':'None'}</span>
        </label>
        <span class="extra-price-add"></span>
      </div>
      ${options.map(ex => `
        <div class="extra-item">
          <label class="extra-label">
            <input type="radio" name="xg-${item.id}-${esc(group)}"
                   value="${ex.price_addition}" data-price="${ex.price_addition}"
                   onchange="recalcPrice(${item.price})">
            <span class="extra-name">${esc(extraName(ex))}</span>
          </label>
          <span class="extra-price-add">+ ${fmtPrice(ex.price_addition)}</span>
        </div>`).join('')}
    </div>`;
  }

  return html;
}

function recalcPrice(basePrice) {
  let total = Number(basePrice);
  document.querySelectorAll('.modal-body input[type="checkbox"]:checked').forEach(cb => {
    total += Number(cb.dataset.price);
  });
  document.querySelectorAll('.modal-body input[type="radio"]:checked').forEach(rb => {
    if (rb.value !== '') total += Number(rb.value);
  });
  const el = document.getElementById('modal-price-total');
  if (el) el.textContent = total !== Number(basePrice) ? `→ ${fmtPrice(total)}` : '';
}

/* ===================== COMMENT RENDER ===================== */
function renderComment(c, likedComments) {
  const liked = likedComments.has(c.id);
  const date  = new Date(c.created_at).toLocaleDateString(lang==='ar'?'ar-IQ':'en-GB',
    { year: 'numeric', month: 'short', day: 'numeric' });
  return `
    <div class="comment-card" id="comment-${c.id}">
      <div class="comment-header">
        <span class="comment-author">${esc(c.author_name)}</span>
        <span class="comment-date">${date}</span>
      </div>
      <div class="comment-body">${esc(c.body)}</div>
      <div class="comment-footer">
        <button class="comment-like-btn ${liked?'liked':''}" onclick="toggleCommentLike(${c.id}, this)">
          ${icon(liked?'like_filled':'like_outline')} <span>${c.likes_count||0}</span>
        </button>
      </div>
    </div>`;
}

/* ===================== MODAL LIKE ===================== */
async function toggleModalLike(itemId) {
  const liked = getLikedItems();
  const was   = liked.has(itemId);
  was ? liked.delete(itemId) : liked.add(itemId);
  saveLikedItems(liked);
  const btn = document.getElementById('modal-like-btn');
  if (btn) { btn.classList.toggle('liked', !was); btn.querySelector('svg, img').outerHTML; }
  try {
    const data = await fetch(`/api/items/${itemId}/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: getDeviceId() })
    }).then(r => r.json());
    const countEl = document.getElementById('modal-likes-count');
    if (countEl) countEl.textContent = data.likes_count;
    const cardCountEl = document.getElementById(`likes-count-${itemId}`);
    if (cardCountEl) cardCountEl.textContent = data.likes_count;
    // Refresh modal like button icon
    if (btn) {
      const iconEl = btn.querySelector('svg, img');
      if (iconEl) iconEl.outerHTML = icon(data.liked ? 'like_filled' : 'like_outline');
    }
  } catch {}
}

/* ===================== COMMENT LIKE ===================== */
async function toggleCommentLike(commentId, btn) {
  const liked = getLikedComments();
  const was   = liked.has(commentId);
  was ? liked.delete(commentId) : liked.add(commentId);
  saveLikedComments(liked);
  btn.classList.toggle('liked', !was);
  try {
    const data = await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: getDeviceId() })
    }).then(r => r.json());
    const span = btn.querySelector('span');
    if (span) span.textContent = data.liked
      ? (Number(span.textContent) + (was ? 0 : 1))
      : Math.max(0, Number(span.textContent) - (was ? 1 : 0));
    btn.classList.toggle('liked', data.liked);
  } catch {}
}

/* ===================== COMMENT SUBMIT ===================== */
async function submitComment(itemId) {
  const name  = document.getElementById('comment-name')?.value.trim();
  const body  = document.getElementById('comment-body')?.value.trim();
  const msg   = document.getElementById('comment-msg');
  if (!name || !body) {
    if (msg) { msg.style.color = '#b03a2e'; msg.textContent = lang==='ar'?'الاسم والتعليق مطلوبان.':'Name and comment are required.'; }
    return;
  }
  try {
    await fetch(`/api/items/${itemId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_name: name, body })
    });
    if (msg) { msg.style.color = 'green'; msg.textContent = lang==='ar'?'شكراً! سيظهر تعليقك بعد المراجعة.':'Thanks! Your comment will appear after review.'; }
    if (document.getElementById('comment-name')) document.getElementById('comment-name').value = '';
    if (document.getElementById('comment-body')) document.getElementById('comment-body').value = '';
  } catch {
    if (msg) { msg.style.color = '#b03a2e'; msg.textContent = lang==='ar'?'حدث خطأ.':'Something went wrong.'; }
  }
}

/* ===================== MODAL CLOSE ===================== */
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  currentItemId = null;
}

/* ===================== SCROLL ANIMATIONS ===================== */
let _animObserver = null;
function initScrollAnimations() {
  if (_animObserver) _animObserver.disconnect();
  _animObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('anim-visible');
        _animObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.anim-item, .anim-slide-left').forEach(el => {
    _animObserver.observe(el);
  });
}

/* ===================== STICKY CATEGORY OBSERVER ===================== */
let _catObserver = null;
function initCatObserver() {
  if (_catObserver) _catObserver.disconnect();
  _catObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('cat-', '');
        document.querySelectorAll('.cat-pill, .cat-pill-icon').forEach(b => b.classList.remove('active'));
        const pill = document.querySelector(`[data-cat="cat-${id}"]`);
        if (pill) {
          pill.classList.add('active');
          // Auto-scroll the pill into view within the nav
          pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, {
    rootMargin: '-64px 0px -65% 0px',
    threshold: 0
  });
  document.querySelectorAll('.cat-section').forEach(s => _catObserver.observe(s));
}

/* ===================== INIT ===================== */
async function init() {
  applyLang();
  await applyDesignSettings();
  await Promise.all([loadHeroVideo(), loadFeatured(), loadMenu()]);
  initScrollAnimations();
  initCatObserver();
}

// On lang toggle, clear rendered sections and reload
const _origInit = init;
init = async function() {
  document.getElementById('hero-video-wrap').style.display = 'none';
  document.getElementById('featured-wrap').style.display = 'none';
  document.getElementById('cat-nav').innerHTML = '';
  document.getElementById('menu-root').innerHTML = '';
  await _origInit();
};

init();

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'floranya123';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Image uploads
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(
      path.extname(file.originalname).toLowerCase()
    );
    cb(ok ? null : new Error('Unsupported image type'), ok);
  }
});

function requireAdmin(req, res, next) {
  if (req.header('x-admin-password') !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ===================== PUBLIC =====================

app.get('/api/menu', (req, res) => {
  const showAll  = req.query.all === '1' && req.header('x-admin-password') === ADMIN_PASSWORD;
  const categories = showAll
    ? db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all()
    : db.prepare('SELECT * FROM categories WHERE available != 0 ORDER BY sort_order, id').all();
  const items      = db.prepare('SELECT * FROM items ORDER BY sort_order, id').all();
  const extras     = db.prepare('SELECT * FROM extras ORDER BY sort_order, id').all();
  const counts     = db.prepare(
    'SELECT item_id, COUNT(*) as c FROM comments WHERE approved=1 GROUP BY item_id'
  ).all();
  const countMap = Object.fromEntries(counts.map(r => [r.item_id, r.c]));

  const menu = categories.map(cat => ({
    ...cat,
    items: items
      .filter(i => i.category_id === cat.id && i.available)
      .map(item => ({
        ...item,
        extras: extras.filter(e => e.item_id === item.id),
        comment_count: countMap[item.id] || 0
      }))
  }));
  res.json(menu);
});

app.get('/api/slideshow', (req, res) => {
  res.json(db.prepare('SELECT * FROM slideshow WHERE active=1 ORDER BY sort_order, id').all());
});

app.get('/api/featured', (req, res) => {
  const settings = Object.fromEntries(
    db.prepare('SELECT * FROM settings').all().map(r => [r.key, r.value])
  );
  const extras = db.prepare('SELECT * FROM extras ORDER BY sort_order, id').all();
  let items;

  if (settings.featured_mode === 'auto') {
    items = db.prepare('SELECT * FROM items WHERE available=1 ORDER BY likes_count DESC LIMIT 10').all();
  } else {
    const ids = (settings.featured_item_ids || '').split(',').map(Number).filter(Boolean);
    if (!ids.length) {
      items = db.prepare('SELECT * FROM items WHERE available=1 ORDER BY likes_count DESC LIMIT 10').all();
    } else {
      items = db.prepare(
        `SELECT * FROM items WHERE id IN (${ids.map(() => '?').join(',')}) AND available=1`
      ).all(...ids);
    }
  }

  const topComments = db.prepare(`
    SELECT * FROM comments c WHERE approved=1
    AND id = (SELECT id FROM comments WHERE item_id=c.item_id AND approved=1 ORDER BY likes_count DESC, id DESC LIMIT 1)
  `).all();
  const topCommentMap = Object.fromEntries(topComments.map(c => [c.item_id, c]));

  res.json(items.map(item => ({
    ...item,
    extras: extras.filter(e => e.item_id === item.id),
    top_comment: topCommentMap[item.id] || null
  })));
});

app.get('/api/settings', (req, res) => {
  res.json(Object.fromEntries(db.prepare('SELECT * FROM settings').all().map(r => [r.key, r.value])));
});

// Like / unlike item
app.post('/api/items/:id/like', (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id required' });
  const existing = db.prepare('SELECT id FROM item_likes WHERE item_id=? AND device_id=?').get(req.params.id, device_id);
  if (existing) {
    db.prepare('DELETE FROM item_likes WHERE item_id=? AND device_id=?').run(req.params.id, device_id);
    db.prepare('UPDATE items SET likes_count=MAX(0,likes_count-1) WHERE id=?').run(req.params.id);
    res.json({ liked: false, likes_count: db.prepare('SELECT likes_count FROM items WHERE id=?').get(req.params.id).likes_count });
  } else {
    db.prepare('INSERT INTO item_likes (item_id, device_id) VALUES (?,?)').run(req.params.id, device_id);
    db.prepare('UPDATE items SET likes_count=likes_count+1 WHERE id=?').run(req.params.id);
    res.json({ liked: true, likes_count: db.prepare('SELECT likes_count FROM items WHERE id=?').get(req.params.id).likes_count });
  }
});

// Comments for item
app.get('/api/items/:id/comments', (req, res) => {
  res.json(db.prepare(
    'SELECT * FROM comments WHERE item_id=? AND approved=1 ORDER BY likes_count DESC, created_at DESC'
  ).all(req.params.id));
});

app.post('/api/items/:id/comments', (req, res) => {
  const { author_name, body } = req.body;
  if (!author_name?.trim() || !body?.trim())
    return res.status(400).json({ error: 'Name and comment required' });
  db.prepare('INSERT INTO comments (item_id, author_name, body) VALUES (?,?,?)')
    .run(req.params.id, author_name.trim().slice(0, 60), body.trim().slice(0, 500));
  res.json({ ok: true });
});

// Like / unlike comment
app.post('/api/comments/:id/like', (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id required' });
  const existing = db.prepare('SELECT id FROM comment_likes WHERE comment_id=? AND device_id=?').get(req.params.id, device_id);
  if (existing) {
    db.prepare('DELETE FROM comment_likes WHERE comment_id=? AND device_id=?').run(req.params.id, device_id);
    db.prepare('UPDATE comments SET likes_count=MAX(0,likes_count-1) WHERE id=?').run(req.params.id);
  } else {
    db.prepare('INSERT INTO comment_likes (comment_id, device_id) VALUES (?,?)').run(req.params.id, device_id);
    db.prepare('UPDATE comments SET likes_count=likes_count+1 WHERE id=?').run(req.params.id);
  }
  const likes_count = db.prepare('SELECT likes_count FROM comments WHERE id=?').get(req.params.id)?.likes_count ?? 0;
  res.json({ liked: !existing, likes_count });
});

// ===================== ADMIN =====================

app.post('/api/admin/check', requireAdmin, (req, res) => res.json({ ok: true }));

app.put('/api/settings', requireAdmin, (req, res) => {
  const upd = db.prepare('UPDATE settings SET value=? WHERE key=?');
  for (const [k, v] of Object.entries(req.body)) upd.run(String(v), k);
  res.json({ ok: true });
});

// Categories
app.post('/api/categories', requireAdmin, (req, res) => {
  const { name, name_ar, icon_filename, sort_order, available } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const r = db.prepare('INSERT INTO categories (name, name_ar, icon_filename, sort_order, available) VALUES (?,?,?,?,?)')
    .run(name.trim(), name_ar || null, icon_filename || null, sort_order || 0, available === false || available === 0 ? 0 : 1);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const { name, name_ar, icon_filename, sort_order, available } = req.body;
  db.prepare('UPDATE categories SET name=?, name_ar=?, icon_filename=?, sort_order=?, available=? WHERE id=?')
    .run(name, name_ar || null, icon_filename || null, sort_order || 0, available === false || available === 0 ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Items
app.post('/api/items', requireAdmin, (req, res) => {
  const { category_id, name, name_ar, description, description_ar, price, image_filename, sort_order } = req.body;
  if (!category_id || !name || price === undefined) return res.status(400).json({ error: 'Required fields missing' });
  const r = db.prepare(`
    INSERT INTO items (category_id,name,name_ar,description,description_ar,price,image_filename,sort_order)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(category_id, name.trim(), name_ar||null, description||null, description_ar||null, price, image_filename||null, sort_order||0);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/items/:id', requireAdmin, (req, res) => {
  const { category_id, name, name_ar, description, description_ar, price, image_filename, available, sort_order } = req.body;
  db.prepare(`
    UPDATE items SET category_id=?,name=?,name_ar=?,description=?,description_ar=?,price=?,image_filename=?,available=?,sort_order=? WHERE id=?
  `).run(category_id, name, name_ar||null, description||null, description_ar||null, price, image_filename||null, available?1:0, sort_order||0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/items/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM items WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Extras
app.get('/api/items/:id/extras', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM extras WHERE item_id=? ORDER BY sort_order,id').all(req.params.id));
});

app.post('/api/items/:id/extras', requireAdmin, (req, res) => {
  const { name, name_ar, price_addition, sort_order, conflict_group, is_none_label } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const r = db.prepare('INSERT INTO extras (item_id,name,name_ar,price_addition,sort_order,conflict_group,is_none_label) VALUES (?,?,?,?,?,?,?)')
    .run(req.params.id, name.trim(), name_ar||null, price_addition||0, sort_order||0, conflict_group||null, is_none_label?1:0);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/extras/:id', requireAdmin, (req, res) => {
  const { name, name_ar, price_addition, sort_order, conflict_group, is_none_label } = req.body;
  db.prepare('UPDATE extras SET name=?,name_ar=?,price_addition=?,sort_order=?,conflict_group=?,is_none_label=? WHERE id=?')
    .run(name, name_ar||null, price_addition||0, sort_order||0, conflict_group||null, is_none_label?1:0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/extras/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM extras WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Comments (admin)
app.get('/api/admin/comments', requireAdmin, (req, res) => {
  res.json(db.prepare(`
    SELECT c.*, i.name AS item_name FROM comments c
    JOIN items i ON c.item_id=i.id ORDER BY c.created_at DESC
  `).all());
});

app.put('/api/comments/:id/approve', requireAdmin, (req, res) => {
  db.prepare('UPDATE comments SET approved=1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

app.delete('/api/comments/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM comments WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Slideshow (admin)
app.get('/api/admin/slideshow', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM slideshow ORDER BY sort_order,id').all());
});

app.post('/api/slideshow', requireAdmin, (req, res) => {
  const { filename, caption, caption_ar, sort_order } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename required' });
  const r = db.prepare('INSERT INTO slideshow (filename,caption,caption_ar,sort_order,active) VALUES (?,?,?,?,1)')
    .run(filename, caption||null, caption_ar||null, sort_order||0);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/slideshow/:id', requireAdmin, (req, res) => {
  const { caption, caption_ar, sort_order, active } = req.body;
  db.prepare('UPDATE slideshow SET caption=?,caption_ar=?,sort_order=?,active=? WHERE id=?')
    .run(caption||null, caption_ar||null, sort_order||0, active?1:0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/slideshow/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM slideshow WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Video upload
const videosDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videosDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.mp4', '.webm', '.mov'].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Unsupported video type'), ok);
  }
});

app.post('/api/upload/video', requireAdmin, uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ filename: req.file.filename });
});

// General image upload
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ filename: req.file.filename });
});

// Logo upload — always saves as public/logo.png
app.post('/api/upload/logo', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  fs.renameSync(req.file.path, logoPath);
  res.json({ filename: 'logo.png' });
});

app.listen(PORT, () => {
  console.log(`Floranya running at http://localhost:${PORT}`);
  console.log(`Admin panel:  http://localhost:${PORT}/admin.html`);
});

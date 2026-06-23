const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(__dirname, 'data', 'floranya.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ar TEXT,
    icon_filename TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    price REAL NOT NULL,
    image_filename TEXT,
    available INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS item_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    UNIQUE(item_id, device_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS extras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    price_addition REAL NOT NULL DEFAULT 0,
    conflict_group TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    UNIQUE(comment_id, device_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS slideshow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    caption TEXT,
    caption_ar TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const migrate = (sql) => { try { db.exec(sql); } catch (_) {} };
migrate('ALTER TABLE categories ADD COLUMN name_ar TEXT');
migrate('ALTER TABLE categories ADD COLUMN icon_filename TEXT');
migrate('ALTER TABLE categories ADD COLUMN available INTEGER NOT NULL DEFAULT 1');
migrate('ALTER TABLE items ADD COLUMN name_ar TEXT');
migrate('ALTER TABLE items ADD COLUMN description TEXT');
migrate('ALTER TABLE items ADD COLUMN description_ar TEXT');
migrate('ALTER TABLE items ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0');
migrate('ALTER TABLE extras ADD COLUMN conflict_group TEXT');
migrate('ALTER TABLE extras ADD COLUMN is_none_label INTEGER NOT NULL DEFAULT 0');
migrate("UPDATE items SET description = ingredients WHERE description IS NULL AND ingredients IS NOT NULL AND ingredients != ''");

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
// Featured
insertSetting.run('featured_mode', 'auto');
insertSetting.run('featured_item_ids', '');
// Colors
insertSetting.run('color_primary', '#5c0d12');
insertSetting.run('color_accent', '#c8ac8f');
insertSetting.run('color_bg', '#f9f4ee');
// UI icons (empty = use built-in SVG fallback)
insertSetting.run('icon_like_outline', '');
insertSetting.run('icon_like_filled', '');
insertSetting.run('icon_comment', '');
// Admin nav icons
insertSetting.run('icon_nav_slideshow', '');
insertSetting.run('icon_nav_featured', '');
insertSetting.run('icon_nav_categories', '');
insertSetting.run('icon_nav_items', '');
insertSetting.run('icon_nav_comments', '');
// Hero video
insertSetting.run('hero_video_filename', '');

const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
if (count === 0) {
  const insertCat  = db.prepare('INSERT INTO categories (name, name_ar, sort_order) VALUES (?, ?, ?)');
  const insertItem = db.prepare(`
    INSERT INTO items (category_id, name, name_ar, description, description_ar, price, image_filename, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertExtra = db.prepare('INSERT INTO extras (item_id, name, name_ar, price_addition, conflict_group) VALUES (?, ?, ?, ?, ?)');

  const coffeeId = insertCat.run('Coffee', 'القهوة', 1).lastInsertRowid;
  const cakesId  = insertCat.run('Cakes',  'الكيك',  2).lastInsertRowid;
  const coldId   = insertCat.run('Cold Drinks', 'المشروبات الباردة', 3).lastInsertRowid;

  const c1 = insertItem.run(coffeeId, 'Cardamom Latte', 'لاتيه الهيل',
    'Espresso with steamed milk and a hint of cardamom',
    'إسبريسو مع حليب مبخر ولمسة هيل', 4500, 'placeholder.svg', 1).lastInsertRowid;
  const c2 = insertItem.run(coffeeId, 'Rose Latte', 'لاتيه الورد',
    'Creamy latte infused with rose water',
    'لاتيه كريمي بماء الورد', 5000, 'placeholder.svg', 2).lastInsertRowid;
  const k1 = insertItem.run(cakesId, 'Pistachio Cake', 'كيكة الفستق',
    'Soft pistachio sponge with rosewater cream',
    'إسفنج فستق ناعم مع كريمة ماء الورد', 6500, 'placeholder.svg', 1).lastInsertRowid;
  insertItem.run(cakesId, 'Lotus Cheesecake', 'تشيزكيك لوتس',
    'Classic cheesecake topped with Lotus Biscoff',
    'تشيزكيك كلاسيكي مع لوتس بسكوف', 7000, 'placeholder.svg', 2);
  const d1 = insertItem.run(coldId, 'Iced Matcha', 'ماتشا باردة',
    'Japanese matcha over ice with oat milk',
    'ماتشا يابانية على الثلج مع حليب الشوفان', 5500, 'placeholder.svg', 1).lastInsertRowid;

  // milk_type conflict group: only one can be selected
  insertExtra.run(c1, 'Extra shot', 'شوت إضافي', 500, null);
  insertExtra.run(c1, 'Oat milk', 'حليب الشوفان', 500, 'milk_type');
  insertExtra.run(c1, 'Coconut milk', 'حليب جوز الهند', 500, 'milk_type');
  insertExtra.run(c1, 'Vanilla syrup', 'شراب الفانيليا', 250, null);
  insertExtra.run(c2, 'Extra shot', 'شوت إضافي', 500, null);
  insertExtra.run(c2, 'Extra rose', 'ورد إضافي', 250, null);
  insertExtra.run(d1, 'Extra matcha', 'ماتشا إضافية', 500, null);
  insertExtra.run(d1, 'Oat milk', 'حليب الشوفان', 500, 'milk_type');
  insertExtra.run(d1, 'Coconut milk', 'حليب جوز الهند', 500, 'milk_type');
  insertExtra.run(k1, 'Extra cream', 'كريمة إضافية', 500, null);

  console.log('Seeded demo data.');
}

module.exports = db;

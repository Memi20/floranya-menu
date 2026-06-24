const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'floranya.db'));
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
insertSetting.run('hero_video_filename', 'hero.mov');

const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
if (count === 0) {
  require('./seed-default')(db);
}

module.exports = db;

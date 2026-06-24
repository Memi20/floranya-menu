// seed-menu.js — run once: node seed-menu.js
// Clears all data and re-seeds the full default menu (items + extras).
const db = require('./db');

console.log('Clearing existing menu data…');
db.prepare('DELETE FROM comment_likes').run();
db.prepare('DELETE FROM item_likes').run();
db.prepare('DELETE FROM comments').run();
db.prepare('DELETE FROM extras').run();
db.prepare('DELETE FROM items').run();
db.prepare('DELETE FROM categories').run();
try { db.exec("DELETE FROM sqlite_sequence WHERE name IN ('categories','items','extras','comments','item_likes','comment_likes')"); } catch {}

require('./seed-default')(db);
process.exit(0);

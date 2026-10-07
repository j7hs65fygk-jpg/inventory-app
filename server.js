const path = require('path');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(DB_PATH);

const initialSamples = [
  {
    id: 'sample-1',
    name: '紙コップ 500ml',
    category: '食品',
    quantity: 120,
    price: 120,
    supplier: 'A商事',
    status: '通常',
  },
  {
    id: 'sample-2',
    name: 'ノート A5',
    category: '文房具',
    quantity: 18,
    price: 220,
    supplier: '文具協同',
    status: '要確認',
  },
  {
    id: 'sample-3',
    name: '掃除用クロス',
    category: '清掃用品',
    quantity: 3,
    price: 350,
    supplier: '清潔堂',
    status: '要補充',
  },
];

const defaultCategories = ['食品', '文房具', '家電', '清掃用品', 'その他'];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function initializeDatabase(username = 'admin', password = 'admin123') {
  await run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      price INTEGER DEFAULT 0,
      supplier TEXT,
      status TEXT DEFAULT '通常'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  const adminExists = await get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!adminExists) {
    const passwordHash = bcrypt.hashSync(password, 10);
    await run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
  }

  for (const categoryName of defaultCategories) {
    const alreadyExists = await get('SELECT * FROM categories WHERE name = ?', [categoryName]);
    if (!alreadyExists) {
      await run('INSERT INTO categories (name) VALUES (?)', [categoryName]);
    }
  }

  const countRow = await get('SELECT COUNT(*) AS count FROM items');
  if ((countRow?.count ?? 0) === 0) {
    const insertPromises = initialSamples.map((item) =>
      run(
        'INSERT INTO items (id, name, category, quantity, price, supplier, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.name, item.category, item.quantity, item.price, item.supplier, item.status]
      )
    );
    await Promise.all(insertPromises);
  }
}

async function verifyAdmin(username, password) {
  const row = await get('SELECT * FROM admins WHERE username = ?', [String(username).trim()]);
  if (!row) return false;
  return bcrypt.compareSync(String(password), row.password_hash);
}

async function listCategories() {
  return all('SELECT * FROM categories ORDER BY name COLLATE NOCASE ASC');
}

async function ensureCategoryName(categoryName) {
  const clean = String(categoryName || '').trim();
  if (!clean) return 'その他';

  const existing = await get('SELECT * FROM categories WHERE name = ?', [clean]);
  if (existing) return existing.name;

  await run('INSERT INTO categories (name) VALUES (?)', [clean]);
  return clean;
}

async function addCategory(name) {
  const clean = String(name || '').trim();
  if (!clean) {
    throw new Error('カテゴリ名は必須です。');
  }

  const existing = await get('SELECT * FROM categories WHERE name = ?', [clean]);
  if (existing) {
    return existing;
  }

  await run('INSERT INTO categories (name) VALUES (?)', [clean]);
  return await get('SELECT * FROM categories WHERE name = ?', [clean]);
}

async function updateCategory(id, name) {
  const clean = String(name || '').trim();
  if (!clean) {
    throw new Error('カテゴリ名は必須です。');
  }

  const existing = await get('SELECT * FROM categories WHERE id = ?', [id]);
  if (!existing) return null;

  const result = await run('UPDATE categories SET name = ? WHERE id = ?', [clean, id]);
  if (result.changes === 0) return null;

  return await get('SELECT * FROM categories WHERE id = ?', [id]);
}

async function deleteCategory(id) {
  const result = await run('DELETE FROM categories WHERE id = ?', [id]);
  return result.changes > 0;
}

async function listItems(search = '') {
  const query = search.trim();
  let sql = 'SELECT * FROM items';
  const params = [];

  if (query) {
    sql += ' WHERE name LIKE ? OR category LIKE ? OR supplier LIKE ? OR status LIKE ?';
    const likeValue = `%${query}%`;
    params.push(likeValue, likeValue, likeValue, likeValue);
  }

  sql += ' ORDER BY name COLLATE NOCASE ASC';
  return all(sql, params);
}

async function addItem(item) {
  const normalizedCategory = await ensureCategoryName(item.category);

  await run(
    'INSERT INTO items (id, name, category, quantity, price, supplier, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      item.id,
      item.name,
      normalizedCategory,
      Number(item.quantity) || 0,
      Number(item.price) || 0,
      item.supplier || '',
      item.status || '通常',
    ]
  );
  return await get('SELECT * FROM items WHERE id = ?', [item.id]);
}

async function updateItem(item) {
  const normalizedCategory = await ensureCategoryName(item.category);

  const result = await run(
    'UPDATE items SET name = ?, category = ?, quantity = ?, price = ?, supplier = ?, status = ? WHERE id = ?',
    [
      item.name,
      normalizedCategory,
      Number(item.quantity) || 0,
      Number(item.price) || 0,
      item.supplier || '',
      item.status || '通常',
      item.id,
    ]
  );

  if (result.changes === 0) {
    return null;
  }

  return await get('SELECT * FROM items WHERE id = ?', [item.id]);
}

async function deleteItem(id) {
  const result = await run('DELETE FROM items WHERE id = ?', [id]);
  return result.changes > 0;
}

async function getSummary() {
  const items = await listItems();
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  const lowStockCount = items.filter((item) => Number(item.quantity) <= 5).length;

  return {
    totalItems: totalQty,
    totalValue,
    lowStockCount,
  };
}

async function getCategorySummary() {
  const items = await listItems();
  const categoryMap = {};

  items.forEach((item) => {
    const category = item.category || 'その他';
    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        itemCount: 0,
        totalQuantity: 0,
        totalValue: 0,
      };
    }

    categoryMap[category].itemCount += 1;
    categoryMap[category].totalQuantity += Number(item.quantity || 0);
    categoryMap[category].totalValue += Number(item.quantity || 0) * Number(item.price || 0);
  });

  return Object.values(categoryMap).sort((a, b) => a.category.localeCompare(b.category));
}

async function resetItems() {
  await run('DELETE FROM items');
  const insertPromises = initialSamples.map((item) =>
    run(
      'INSERT INTO items (id, name, category, quantity, price, supplier, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.category, item.quantity, item.price, item.supplier, item.status]
    )
  );

  await Promise.all(insertPromises);
  return listItems();
}

module.exports = {
  initializeDatabase,
  verifyAdmin,
  listCategories,
  ensureCategoryName,
  addCategory,
  updateCategory,
  deleteCategory,
  listItems,
  addItem,
  updateItem,
  deleteItem,
  getSummary,
  getCategorySummary,
  resetItems,
};


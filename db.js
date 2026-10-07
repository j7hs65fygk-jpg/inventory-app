const path = require('path');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(DB_PATH);

const initialSamples = [
  {
    id: 'sample-1',
    name: '\u7d19\u30b3\u30c3\u30d7 500ml',
    category: '\u98df\u54c1',
    quantity: 120,
    price: 120,
    supplier: 'A\u5546\u4e8b',
    status: '\u901a\u5e38',
  },
  {
    id: 'sample-2',
    name: '\u30ce\u30fc\u30c8 A5',
    category: '\u6587\u623f\u5177',
    quantity: 18,
    price: 220,
    supplier: '\u6587\u5177\u5354\u540c',
    status: '\u8981\u78ba\u8a8d',
  },
  {
    id: 'sample-3',
    name: '\u6383\u9664\u7528\u30af\u30ed\u30b9',
    category: '\u6e05\u6383\u7528\u54c1',
    quantity: 3,
    price: 350,
    supplier: '\u6e05\u6f54\u5802',
    status: '\u8981\u88dc\u5145',
  },
];

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
      status TEXT DEFAULT '\u901a\u5e38'
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

  const adminExists = await get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!adminExists) {
    const passwordHash = bcrypt.hashSync(password, 10);
    await run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
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
  await run(
    'INSERT INTO items (id, name, category, quantity, price, supplier, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [item.id, item.name, item.category, Number(item.quantity) || 0, Number(item.price) || 0, item.supplier || '', item.status || '\u901a\u5e38']
  );
  return await get('SELECT * FROM items WHERE id = ?', [item.id]);
}

async function updateItem(item) {
  const result = await run(
    'UPDATE items SET name = ?, category = ?, quantity = ?, price = ?, supplier = ?, status = ? WHERE id = ?',
    [
      item.name,
      item.category,
      Number(item.quantity) || 0,
      Number(item.price) || 0,
      item.supplier || '',
      item.status || '\u901a\u5e38',
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
  listItems,
  addItem,
  updateItem,
  deleteItem,
  getSummary,
  getCategorySummary,
  resetItems,
};

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const {
  initializeDatabase,
  listItems,
  addItem,
  updateItem,
  deleteItem,
  getSummary,
  resetItems,
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', async (req, res) => {
  try {
    const search = (req.query.q || '').trim();
    const items = await listItems(search);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: '商品一覧の取得に失敗しました', error: error.message });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const summary = await getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: '集計の取得に失敗しました', error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const item = {
      id: crypto.randomUUID(),
      name: String(req.body.name || '').trim(),
      category: String(req.body.category || 'その他'),
      quantity: Number(req.body.quantity ?? 0),
      price: Number(req.body.price ?? 0),
      supplier: String(req.body.supplier || '').trim(),
      status: String(req.body.status || '通常'),
    };

    if (!item.name) {
      return res.status(400).json({ message: '商品名は必須です。' });
    }

    const created = await addItem(item);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: '商品の追加に失敗しました', error: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const item = {
      id: req.params.id,
      name: String(req.body.name || '').trim(),
      category: String(req.body.category || 'その他'),
      quantity: Number(req.body.quantity ?? 0),
      price: Number(req.body.price ?? 0),
      supplier: String(req.body.supplier || '').trim(),
      status: String(req.body.status || '通常'),
    };

    if (!item.name) {
      return res.status(400).json({ message: '商品名は必須です。' });
    }

    const updated = await updateItem(item);
    if (!updated) {
      return res.status(404).json({ message: '対象の商品が見つかりませんでした。' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: '商品の更新に失敗しました', error: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const removed = await deleteItem(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: '対象の商品が見つかりませんでした。' });
    }

    res.json({ message: '商品を削除しました。' });
  } catch (error) {
    res.status(500).json({ message: '商品の削除に失敗しました', error: error.message });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    const items = await resetItems();
    res.json({ message: 'サンプルデータを再読み込���しました。', items });
  } catch (error) {
    res.status(500).json({ message: 'データの初期化に失敗しました', error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

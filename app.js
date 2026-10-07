const STORAGE_KEY = 'inventory-app-items';
const LOW_STOCK_THRESHOLD = 5;

const initialItems = [
  {
    id: crypto.randomUUID(),
    name: '紙コップ 500ml',
    category: '食品',
    quantity: 120,
    price: 120,
    supplier: 'A商事',
    status: '通常',
  },
  {
    id: crypto.randomUUID(),
    name: 'ノート A5',
    category: '文房具',
    quantity: 18,
    price: 220,
    supplier: '文具協同',
    status: '要確認',
  },
  {
    id: crypto.randomUUID(),
    name: '掃除用クロス',
    category: '清掃用品',
    quantity: 3,
    price: 350,
    supplier: '清潔堂',
    status: '要補充',
  },
];

const inventoryForm = document.getElementById('inventoryForm');
const formTitle = document.getElementById('formTitle');
const itemIdInput = document.getElementById('itemId');
const cancelEditButton = document.getElementById('cancelEdit');
const tableBody = document.getElementById('inventoryTableBody');
const searchInput = document.getElementById('searchInput');
const resetButton = document.getElementById('resetButton');

const totalItemsOutput = document.getElementById('totalItems');
const totalValueOutput = document.getElementById('totalValue');
const lowStockCountOutput = document.getElementById('lowStockCount');

let items = loadItems();

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
      return [...initialItems];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...initialItems];
  } catch (error) {
    return [...initialItems];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getStatusMeta(status) {
  const statusMap = {
    通常: { className: 'status-normal', label: '通常' },
    要確認: { className: 'status-warning', label: '要確認' },
    要補充: { className: 'status-low', label: '要補充' },
  };

  return statusMap[status] || statusMap['通常'];
}

function updateSummary() {
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  const lowStockCount = items.filter((item) => Number(item.quantity) <= LOW_STOCK_THRESHOLD).length;

  totalItemsOutput.textContent = totalQty.toLocaleString();
  totalValueOutput.textContent = `¥${totalValue.toLocaleString()}`;
  lowStockCountOutput.textContent = lowStockCount.toLocaleString();
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (!query) return true;

    return [item.name, item.category, item.supplier, item.status]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  if (!filtered.length) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">該当する商品がありません</td></tr>';
    return;
  }

  tableBody.innerHTML = filtered
    .map((item) => {
      const statusMeta = getStatusMeta(item.status);
      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${Number(item.quantity).toLocaleString()}</td>
          <td>¥${Number(item.price).toLocaleString()}</td>
          <td><span class="status-badge ${statusMeta.className}">${statusMeta.label}</span></td>
          <td>
            <div class="row-actions">
              <button class="edit-btn" data-action="edit" data-id="${item.id}">編集</button>
              <button class="delete-btn" data-action="delete" data-id="${item.id}">削除</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function resetForm() {
  inventoryForm.reset();
  document.getElementById('quantity').value = 0;
  document.getElementById('price').value = 0;
  itemIdInput.value = '';
  formTitle.textContent = '商品を追加';
  cancelEditButton.classList.add('hidden');
}

function editItem(itemId) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;

  itemIdInput.value = item.id;
  document.getElementById('name').value = item.name;
  document.getElementById('category').value = item.category;
  document.getElementById('quantity').value = item.quantity;
  document.getElementById('price').value = item.price;
  document.getElementById('supplier').value = item.supplier;
  document.getElementById('status').value = item.status;

  formTitle.textContent = '商品を編集';
  cancelEditButton.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeItem(itemId) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;

  const confirmed = window.confirm(`${item.name} を削除しますか？`);
  if (!confirmed) return;

  items = items.filter((entry) => entry.id !== itemId);
  saveItems();
  renderTable();
  updateSummary();

  if (itemIdInput.value === itemId) {
    resetForm();
  }
}

inventoryForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(inventoryForm);
  const newItem = {
    id: itemIdInput.value || crypto.randomUUID(),
    name: String(formData.get('name')).trim(),
    category: String(formData.get('category')),
    quantity: Number(formData.get('quantity')),
    price: Number(formData.get('price')),
    supplier: String(formData.get('supplier') || '').trim(),
    status: String(formData.get('status')),
  };

  if (!newItem.name) return;

  if (itemIdInput.value) {
    items = items.map((item) => (item.id === newItem.id ? newItem : item));
  } else {
    items.unshift(newItem);
  }

  saveItems();
  renderTable();
  updateSummary();
  resetForm();
});

tableBody.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const { action, id } = target.dataset;
  if (!action || !id) return;

  if (action === 'edit') editItem(id);
  if (action === 'delete') removeItem(id);
});

searchInput.addEventListener('input', renderTable);

cancelEditButton.addEventListener('click', resetForm);

resetButton.addEventListener('click', () => {
  const confirmed = window.confirm('サンプルデータを元に戻しますか？');
  if (!confirmed) return;

  items = [...initialItems];
  saveItems();
  renderTable();
  updateSummary();
  resetForm();
});

updateSummary();
renderTable();

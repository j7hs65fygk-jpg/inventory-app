const LOW_STOCK_THRESHOLD = 5;
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

let items = [];

function getStatusMeta(status) {
  const statusMap = {
    通常: { className: 'status-normal', label: '通常' },
    要確認: { className: 'status-warning', label: '要確認' },
    要補充: { className: 'status-low', label: '要補充' },
  };

  return statusMap[status] || statusMap['通常'];
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '処理に失敗しました');
  }

  return data;
}

async function loadItems() {
  try {
    items = await fetchJSON('/api/items?q=' + encodeURIComponent(searchInput.value.trim()));
    renderTable();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

async function loadSummary() {
  try {
    const summary = await fetchJSON('/api/summary');
    totalItemsOutput.textContent = Number(summary.totalItems || 0).toLocaleString();
    totalValueOutput.textContent = `¥${Number(summary.totalValue || 0).toLocaleString()}`;
    lowStockCountOutput.textContent = Number(summary.lowStockCount || 0).toLocaleString();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function renderTable() {
  if (!items.length) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">該当する商品がありません</td></tr>';
    return;
  }

  tableBody.innerHTML = items
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

async function editItem(itemId) {
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

async function deleteItem(itemId) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;

  const confirmed = window.confirm(`${item.name} を削除しますか？`);
  if (!confirmed) return;

  try {
    await fetchJSON(`/api/items/${itemId}`, { method: 'DELETE' });
    if (itemIdInput.value === itemId) {
      resetForm();
    }
    await loadItems();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
}

inventoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById('name').value.trim(),
    category: document.getElementById('category').value,
    quantity: Number(document.getElementById('quantity').value),
    price: Number(document.getElementById('price').value),
    supplier: document.getElementById('supplier').value.trim(),
    status: document.getElementById('status').value,
  };

  if (!payload.name) {
    alert('商品名は必須です');
    return;
  }

  try {
    if (itemIdInput.value) {
      await fetchJSON(`/api/items/${itemIdInput.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await fetchJSON('/api/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    await loadItems();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
});

tableBody.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const { action, id } = target.dataset;
  if (!action || !id) return;

  if (action === 'edit') {
    editItem(id);
  }

  if (action === 'delete') {
    deleteItem(id);
  }
});

searchInput.addEventListener('input', async () => {
  await loadItems();
});

cancelEditButton.addEventListener('click', resetForm);

resetButton.addEventListener('click', async () => {
  const confirmed = window.confirm('サンプルデータを元に戻しますか？');
  if (!confirmed) return;

  try {
    await fetchJSON('/api/reset', { method: 'POST' });
    resetForm();
    await loadItems();
    await loadSummary();
  } catch (error) {
    alert(error.message);
  }
});

async function initialize() {
  await loadItems();
  await loadSummary();
}

initialize();

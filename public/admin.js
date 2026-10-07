<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>在庫管理アプリ - 管理者画面</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="app-shell">
      <header class="topbar admin-topbar">
        <div>
          <p class="eyebrow">Inventory System</p>
          <h1>管理者画面</h1>
        </div>
        <div class="topbar-actions">
          <span id="adminUserLabel" class="user-label">ログイン中</span>
          <button id="logoutButton" class="secondary-button">ログアウト</button>
        </div>
      </header>

      <section class="summary-grid" aria-label="在庫概要">
        <article class="summary-card accent-blue">
          <span>総在庫数</span>
          <strong id="totalItems">0</strong>
        </article>
        <article class="summary-card accent-gold">
          <span>総在庫金額</span>
          <strong id="totalValue">¥0</strong>
        </article>
        <article class="summary-card accent-red">
          <span>要補充</span>
          <strong id="lowStockCount">0</strong>
        </article>
      </section>

      <main class="panel-grid">
        <section class="panel form-panel">
          <h2 id="formTitle">商品を追加</h2>
          <form id="inventoryForm">
            <input type="hidden" id="itemId" />

            <div class="field-grid">
              <label>
                <span>商品名</span>
                <input id="name" name="name" type="text" placeholder="例: 紙コップ 500ml" required />
              </label>

              <label>
                <span>カテゴリ</span>
                <select id="category" name="category"></select>
              </label>

              <label>
                <span>在庫数</span>
                <input id="quantity" name="quantity" type="number" min="0" value="0" required />
              </label>

              <label>
                <span>単価</span>
                <input id="price" name="price" type="number" min="0" step="1" value="0" required />
              </label>

              <label>
                <span>仕入先</span>
                <input id="supplier" name="supplier" type="text" placeholder="例: A商事" />
              </label>

              <label>
                <span>状態</span>
                <select id="status" name="status">
                  <option value="通常">通常</option>
                  <option value="要確認">要確認</option>
                  <option value="要補充">要補充</option>
                </select>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="primary-button">保存</button>
              <button type="button" id="cancelEdit" class="secondary-button hidden">キャンセル</button>
            </div>
          </form>
        </section>

        <section class="panel table-panel">
          <div class="table-toolbar">
            <h2>商品一覧</h2>
            <div class="toolbar-controls">
              <input id="searchInput" type="search" placeholder="商品名やカテゴリで検索" aria-label="商品検索" />
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>在庫数</th>
                  <th>単価</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="inventoryTableBody"></tbody>
            </table>
          </div>
        </section>
      </main>

      <section class="panel category-panel">
        <h2>カテゴリ管理</h2>

        <form id="categoryForm">
          <input type="hidden" id="categoryId" />
          <div class="category-form-row">
            <label>
              <span>カテゴリ名</span>
              <input id="categoryName" type="text" placeholder="例: 食品" required />
            </label>
            <div class="category-form-actions">
              <button type="submit" class="primary-button">保存</button>
              <button type="button" id="cancelCategoryEdit" class="secondary-button hidden">キャンセル</button>
            </div>
          </div>
        </form>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>カテゴリ名</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="categoryTableBody"></tbody>
          </table>
        </div>
      </section>

      <section class="panel category-panel">
        <h2>カテゴリ別集計</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>商品数</th>
                <th>総在庫数</th>
                <th>総金額</th>
              </tr>
            </thead>
            <tbody id="categorySummaryBody"></tbody>
          </table>
        </div>
      </section>
    </div>

    <script src="admin.js"></script>
  </body>
</html>


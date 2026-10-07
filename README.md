body {
  margin: 0;
  font-family: "Segoe UI", "Hiragino Sans", "Yu Gothic", sans-serif;
  background: linear-gradient(135deg, #eff6ff, #f8fafc 35%, #f8fafc);
  color: #0f172a;
}

button,
input,
select {
  font: inherit;
}

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: min(100%, 420px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
  padding: 32px 28px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.auth-header {
  text-align: center;
  margin-bottom: 18px;
}

.auth-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.3rem);
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

.auth-form input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.auth-form input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.11);
}

.full-width {
  width: 100%;
}

.primary-button,
.secondary-button {
  border: none;
  border-radius: 12px;
  padding: 11px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.primary-button {
  background: #2563eb;
  color: white;
}

.secondary-button {
  background: #eef2ff;
  color: #0f172a;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.auth-help {
  margin-top: 18px;
  margin-bottom: 0;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.error-message {
  min-height: 22px;
  margin-top: 10px;
  text-align: center;
  color: #b91c1c;
  font-weight: 600;
}

.app-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-label {
  color: #1e293b;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.summary-card {
  background: white;
  border-radius: 18px;
  padding: 20px 22px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 0.92rem;
  margin-bottom: 10px;
}

.summary-card strong {
  font-size: clamp(1.5rem, 1.8vw, 2rem);
}

.accent-blue strong { color: #3b82f6; }
.accent-gold strong { color: #f59e0b; }
.accent-red strong { color: #ef4444; }

.panel-grid {
  display: grid;
  grid-template-columns: minmax(300px, 420px) 1fr;
  gap: 24px;
}

.panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.14);
  padding: 22px;
}

.form-panel h2,
.table-panel h2 {
  margin-bottom: 18px;
}

.field-grid {
  display: grid;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}

input,
select {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
}

input:focus,
select:focus {
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.11);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.hidden { display: none; }

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.toolbar-controls {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

#searchInput {
  width: min(100%, 260px);
}

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  text-align: left;
  padding: 14px 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

th {
  color: #64748b;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tbody tr:hover {
  background: rgba(37, 99, 235, 0.02);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.74rem;
}

.status-normal { background: #dcfce7; color: #166534; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-low { background: #fee2e2; color: #991b1b; }

.row-actions {
  display: flex;
  gap: 8px;
}

.row-actions button {
  border: none;
  border-radius: 8px;
  padding: 7px 10px;
  cursor: pointer;
  font-weight: 600;
}

.edit-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.delete-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.empty-state {
  text-align: center;
  color: #64748b;
  padding: 18px 12px;
}

@media (max-width: 880px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .topbar,
  .table-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-controls {
    width: 100%;
    justify-content: stretch;
  }

  #searchInput { width: 100%; }
}

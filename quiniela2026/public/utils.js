// ─── Toast ───────────────────────────────────────────────
function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ─── API helper ──────────────────────────────────────────
async function api(method, url, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Format date ─────────────────────────────────────────
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Status badge ─────────────────────────────────────────
function statusBadge(status) {
  const map = {
    SCHEDULED: ['badge-info', 'Programado'],
    TIMED: ['badge-info', 'Programado'],
    IN_PLAY: ['badge-warning', 'En juego'],
    PAUSED: ['badge-warning', 'Medio tiempo'],
    FINISHED: ['badge-success', 'Finalizado'],
    POSTPONED: ['badge-danger', 'Pospuesto'],
  };
  const [cls, label] = map[status] || ['badge-info', status || 'Prog.'];
  return `<span class="badge ${cls}">${label}</span>`;
}

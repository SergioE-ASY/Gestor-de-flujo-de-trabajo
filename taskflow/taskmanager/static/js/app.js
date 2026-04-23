// ─── Theme ───
const PREMIUM_COLORS = ['pink', 'red', 'blue', 'green'];

function applyTheme(base, color) {
  document.documentElement.setAttribute('data-theme', base || 'dark');
  document.documentElement.setAttribute('data-color', color || 'default');
  const isLight = base === 'light';
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun) sun.style.display = isLight ? 'block' : 'none';
  if (moon) moon.style.display = isLight ? 'none' : 'block';
  document.querySelectorAll('.theme-swatch[data-color]').forEach(el => {
    el.classList.toggle('active', el.dataset.color === (color || 'default'));
  });
}

function setBaseTheme(base) {
  const color = document.documentElement.getAttribute('data-color') || 'default';
  applyTheme(base, color);
  fetch('/set-theme/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCsrf(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'base=' + encodeURIComponent(base),
  }).catch(() => {});
}

function setAccentColor(color, isPremium) {
  if (PREMIUM_COLORS.includes(color) && !isPremium) return;
  const base = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(base, color);
  fetch('/set-theme/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCsrf(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'color=' + encodeURIComponent(color),
  }).catch(() => {});
}

function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme') || 'dark';
  setBaseTheme(curr === 'light' ? 'dark' : 'light');
}

// ─── Modal helpers ───
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ─── Inactividad: cerrar sesión tras 30 min sin actividad ───
const SESSION_TIMEOUT_MS = 30 * 60 *1000; // 30 minutos
let _inactivityTimer = null;

function resetInactivityTimer() {
  if (_inactivityTimer) clearTimeout(_inactivityTimer);
  _inactivityTimer = setTimeout(() => {
    window.location.href = '/logout/';
  }, SESSION_TIMEOUT_MS);
}

// Reiniciar timer con interacción REAL del usuario
['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, resetInactivityTimer, { passive: true });
});
resetInactivityTimer();

// ─── Notification counter ───
async function fetchNotifCount() {
  const el = document.getElementById('notif-count');
  if (!el) return;
  try {
    const r = await fetch('/notifications/count/');
    if (r.status === 401) {
      // Sesión expirada en el servidor
      window.location.href = '/login/';
      return;
    }
    const data = await r.json();
    el.textContent = data.count || '';
    el.style.display = data.count > 0 ? 'flex' : 'none';
  } catch {}
}
fetchNotifCount();
setInterval(fetchNotifCount, 30000);

// ─── Mark notification read ───
async function markRead(pk) {
  await fetch(`/notifications/${pk}/read/`, { method: 'POST', headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' } });
  const el = document.getElementById(`notif-${pk}`);
  if (el) el.classList.add('read');
  fetchNotifCount();
}

// ─── Mark all read ───
async function markAllRead() {
  await fetch('/notifications/read-all/', { method: 'POST', headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' } });
  document.querySelectorAll('.notif-item').forEach(el => el.classList.add('read'));
  fetchNotifCount();
}

// ─── Kanban drag & drop (status update) ───
function initKanban() {
  document.querySelectorAll('.board-tasks').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', async e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const projectId = col.dataset.project;
      const newStatus = col.dataset.status;
      if (!taskId || !newStatus) return;

      const fd = new FormData();
      fd.append('status', newStatus);
      const resp = await fetch(`/projects/${projectId}/tasks/${taskId}/status/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' },
        body: fd,
      });
      if (resp.ok) location.reload();
    });
  });

  document.querySelectorAll('.task-card[draggable]').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.taskId);
      card.style.opacity = '0.5';
    });
    card.addEventListener('dragend', () => card.style.opacity = '1');
  });
}
if (document.querySelector('.board')) initKanban();

// ─── CSRF helper ───
function getCsrf() {
  return document.querySelector('[name=csrfmiddlewaretoken]')?.value
    || document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='))?.split('=')[1] || '';
}

// ─── Auto-dismiss messages ───
document.querySelectorAll('.message').forEach(msg => {
  setTimeout(() => msg.style.opacity = '0', 4000);
  setTimeout(() => msg.remove(), 4500);
});

// ─── Color picker preview ───
const colorInputs = document.querySelectorAll('input[type="color"]');
colorInputs.forEach(inp => {
  const preview = inp.nextElementSibling;
  if (preview) {
    preview.style.background = inp.value;
    inp.addEventListener('input', () => preview.style.background = inp.value);
  }
});

// ─── Key auto-uppercase ───
const keyInput = document.getElementById('id-key');
if (keyInput) keyInput.addEventListener('input', () => keyInput.value = keyInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));

// ─── Mobile menus outside click ───
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (sidebar && sidebar.classList.contains('open') && mobileMenuBtn) {
    if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }

  const topbarActions = document.getElementById('topbar-actions');
  const mobileActionsBtn = document.getElementById('mobile-actions-btn');
  if (topbarActions && topbarActions.classList.contains('open') && mobileActionsBtn) {
    if (!topbarActions.contains(e.target) && !mobileActionsBtn.contains(e.target)) {
      topbarActions.classList.remove('open');
    }
  }
});

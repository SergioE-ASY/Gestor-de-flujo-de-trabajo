// ─── Theme toggle ───
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun) sun.style.display = theme === 'light' ? 'block' : 'none';
  if (moon) moon.style.display = theme === 'light' ? 'none' : 'block';
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', next);
  applyTheme(next);
}
applyTheme(localStorage.getItem('theme') || 'dark');

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

// ─── Notification counter ───
async function fetchNotifCount() {
  const el = document.getElementById('notif-count');
  if (!el) return;
  try {
    const r = await fetch('/notifications/count/');
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

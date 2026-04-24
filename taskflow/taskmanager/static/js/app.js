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

// ─── Kanban drag & drop (persistent position + status) ───
function initKanban() {
  let dragging = null;

  const placeholder = document.createElement('div');
  placeholder.className = 'drop-placeholder';

  function getInsertBefore(col, clientY) {
    const cards = Array.from(col.querySelectorAll('.task-card:not(.dragging)'));
    for (const card of cards) {
      const { top, height } = card.getBoundingClientRect();
      if (clientY < top + height / 2) return card;
    }
    return null;
  }

  function updateColCounts() {
    document.querySelectorAll('.board-col').forEach(col => {
      const count = col.querySelectorAll('.board-tasks .task-card').length;
      const el = col.querySelector('.col-count');
      if (el) el.textContent = count;
    });
  }

  document.querySelectorAll('.board-tasks').forEach(col => {
    let enterDepth = 0;

    col.addEventListener('dragenter', e => {
      if (!dragging) return;
      enterDepth++;
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', e => {
      if (!dragging) return;
      enterDepth--;
      if (enterDepth <= 0) {
        enterDepth = 0;
        col.classList.remove('drag-over');
        if (placeholder.parentNode === col) placeholder.remove();
      }
    });

    col.addEventListener('dragover', e => {
      if (!dragging) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const ref = getInsertBefore(col, e.clientY);
      // Insert before the first card that the cursor is above, or before the add-link
      const addLink = col.querySelector('a[href*="status="]');
      col.insertBefore(placeholder, ref || addLink || null);
    });

    col.addEventListener('drop', async e => {
      e.preventDefault();
      enterDepth = 0;
      col.classList.remove('drag-over');
      if (!dragging) return;

      col.insertBefore(dragging, placeholder);
      placeholder.remove();

      const newStatus = col.dataset.status;
      const projectId = col.dataset.project;
      const order = Array.from(col.querySelectorAll('.task-card')).map(c => c.dataset.taskId);

      updateColCounts();

      try {
        const resp = await fetch(`/projects/${projectId}/tasks/reorder/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrf(),
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ task_id: dragging.dataset.taskId, status: newStatus, order }),
        });
        if (!resp.ok) location.reload();
      } catch {
        location.reload();
      }
    });
  });

  document.querySelectorAll('.task-card[draggable]').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragging = card;
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.taskId);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => { card.style.opacity = '0.4'; }, 0);
    });
    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      card.classList.remove('dragging');
      placeholder.remove();
      document.querySelectorAll('.board-tasks').forEach(c => c.classList.remove('drag-over'));
      dragging = null;
    });
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

// ─── Markdown editor sync ───
function initMarkdownEditors() {
  if (typeof EasyMDE === 'undefined') return;

  document.querySelectorAll('textarea[data-md-editor="true"]').forEach(textarea => {
    if (textarea.dataset.mdReady === 'true') return;

    const editor = new EasyMDE({
      element: textarea,
      spellChecker: false,
      status: false,
      autoDownloadFontAwesome: true,
      forceSync: true,
      minHeight: textarea.rows && textarea.rows > 3 ? '120px' : '90px',
      toolbar: ['bold', 'italic', 'strikethrough', '|', 'heading', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', 'table', '|', 'preview', 'side-by-side', 'guide'],
    });

    const codemirror = editor.codemirror;
    const syncToTextarea = () => {
      textarea.value = editor.value();
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    };

    codemirror.on('change', syncToTextarea);

    textarea.addEventListener('input', () => {
      const currentValue = editor.value();
      if (textarea.value !== currentValue) {
        editor.value(textarea.value || '');
      }
    });

    if (textarea.form) {
      textarea.form.addEventListener('reset', () => {
        setTimeout(() => editor.value(textarea.defaultValue || ''), 0);
      });
    }

    textarea.dataset.mdReady = 'true';
  });
}

initMarkdownEditors();

function renderMarkdownBlocks() {
  if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') return;

  document.querySelectorAll('[data-render-markdown="true"]').forEach(el => {
    if (el.dataset.mdRendered === 'true') return;
    const source = el.textContent || '';
    if (!source.trim()) {
      el.dataset.mdRendered = 'true';
      return;
    }

    const rendered = marked.parse(source, { gfm: true, breaks: true });
    el.innerHTML = DOMPurify.sanitize(rendered);
    el.dataset.mdRendered = 'true';
  });
}

renderMarkdownBlocks();

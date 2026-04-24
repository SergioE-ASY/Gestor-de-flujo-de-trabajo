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
// Escape is handled by the keyboard shortcuts module below

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

// ─── Keyboard shortcuts ───────────────────────────────────────────────────
(function () {
  function inInput() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable || el.closest('.CodeMirror'));
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }

  // ── G-prefix sequence ──
  let gPending = false;
  let gTimer = null;

  function cancelG() {
    gPending = false;
    if (gTimer) { clearTimeout(gTimer); gTimer = null; }
  }

  function handleGSequence(key) {
    cancelG();
    const k = key.toLowerCase();
    // Tab shortcuts — click the matching tab if it exists on this page
    const tabMap = { b: 'board', l: 'list', s: 'sprints', h: 'hours', m: 'members', t2: 'tags' };
    const tabTarget = { b: 'board', l: 'list' }[k];
    if (tabTarget) {
      const tab = document.querySelector(`.tab[onclick*="'${tabTarget}'"]`);
      if (tab) { tab.click(); return; }
    }
    // Page navigation
    const navMap = { d: '/dashboard/', t: '/my-tasks/', o: '/organizations/', p: '/projects/', r: null };
    if (k === 'r') {
      // Roadmap link — look for it in the topbar
      const roadmapLink = document.querySelector('a[href*="/roadmap/"]');
      if (roadmapLink) window.location.href = roadmapLink.href;
      return;
    }
    if (navMap[k]) window.location.href = navMap[k];
  }

  document.addEventListener('keydown', e => {
    // Escape always closes modals/palette, regardless of focus
    if (e.key === 'Escape') {
      cancelG();
      closeAllModals();
      return;
    }

    // Cmd/Ctrl+K: open command palette — works even when in input
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCmdPalette();
      return;
    }

    // All other shortcuts: skip when typing in a field or a modal is open
    if (inInput()) return;
    if (document.querySelector('.modal-overlay.open')) return;

    // G prefix sequence
    if (gPending) {
      e.preventDefault();
      handleGSequence(e.key);
      return;
    }

    switch (e.key) {
      case '?':
        openModal('shortcut-panel');
        break;
      case 'g':
      case 'G':
        gPending = true;
        gTimer = setTimeout(cancelG, 1000);
        break;
      case 'c':
      case 'C': {
        const createLink = document.querySelector('a[href*="/tasks/new/"]');
        if (createLink) window.location.href = createLink.href;
        break;
      }
    }
  });

  // ── Command palette ──
  const NAV_ITEMS = [
    { label: 'Dashboard',            url: '/dashboard/',      icon: 'grid' },
    { label: 'Mis Tareas',           url: '/my-tasks/',       icon: 'check' },
    { label: 'Mis Organizaciones',   url: '/organizations/',  icon: 'home' },
    { label: 'Mis Proyectos',        url: '/projects/',       icon: 'briefcase' },
    { label: 'Nueva Organización',   url: '/organizations/new/', icon: 'plus' },
    { label: 'Nuevo Proyecto',       url: '/projects/new/',   icon: 'plus' },
    { label: 'Mi Perfil',            url: '/profile/',        icon: 'user' },
    { label: 'Notificaciones',       url: '/notifications/',  icon: 'bell' },
  ];

  const ICONS = {
    grid:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    check:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    home:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
    briefcase: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>',
    plus:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    user:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    bell:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>',
    tab:       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>',
  };

  function getPageItems() {
    const items = [];
    // Tabs on the current project page
    const tabLabels = { board: 'Tablero', list: 'Lista', sprints: 'Sprints', hours: 'Horas', members: 'Miembros', tags: 'Etiquetas' };
    document.querySelectorAll('.tab[onclick]').forEach(tab => {
      const m = tab.getAttribute('onclick').match(/showTab\('([^']+)'/);
      if (m && tabLabels[m[1]]) {
        items.push({ label: tabLabels[m[1]], action: () => tab.click(), icon: 'tab' });
      }
    });
    // Task create link
    const createLink = document.querySelector('a[href*="/tasks/new/"]');
    if (createLink) items.push({ label: 'Nueva tarea', url: createLink.href, icon: 'plus' });
    // Roadmap link
    const roadmapLink = document.querySelector('a[href*="/roadmap/"]');
    if (roadmapLink) items.push({ label: 'Roadmap', url: roadmapLink.href, icon: 'tab' });
    return items;
  }

  function openCmdPalette() {
    const overlay = document.getElementById('cmd-palette');
    if (!overlay) return;
    // Close other modals first
    document.querySelectorAll('.modal-overlay.open:not(#cmd-palette)').forEach(m => m.classList.remove('open'));
    overlay.classList.add('open');
    const input = document.getElementById('cmd-input');
    if (input) { input.value = ''; input.focus(); }
    renderCmdItems('');
  }

  function renderCmdItems(query) {
    const container = document.getElementById('cmd-results');
    if (!container) return;
    const all = [...getPageItems(), ...NAV_ITEMS];
    const q = query.toLowerCase().trim();
    const filtered = q ? all.filter(i => i.label.toLowerCase().includes(q)) : all;

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.82rem;">Sin resultados</div>';
      return;
    }
    filtered.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'cmd-item' + (idx === 0 ? ' cmd-item-active' : '');
      div.innerHTML = `<span class="cmd-item-icon">${ICONS[item.icon] || ''}</span><span>${item.label}</span>`;
      div.addEventListener('mousedown', e => {
        e.preventDefault(); // prevent input blur before click fires
        closeAllModals();
        if (item.url) window.location.href = item.url;
        else if (item.action) item.action();
      });
      container.appendChild(div);
    });
  }

  const cmdInput = document.getElementById('cmd-input');
  if (cmdInput) {
    cmdInput.addEventListener('input', () => renderCmdItems(cmdInput.value));
    cmdInput.addEventListener('keydown', e => {
      const items = Array.from(document.querySelectorAll('.cmd-item'));
      if (!items.length) return;
      const activeIdx = items.findIndex(i => i.classList.contains('cmd-item-active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(activeIdx + 1, items.length - 1);
        items.forEach(i => i.classList.remove('cmd-item-active'));
        items[next].classList.add('cmd-item-active');
        items[next].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(activeIdx - 1, 0);
        items.forEach(i => i.classList.remove('cmd-item-active'));
        items[prev].classList.add('cmd-item-active');
        items[prev].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.cmd-item.cmd-item-active')?.dispatchEvent(new MouseEvent('mousedown'));
      }
    });
  }
})();

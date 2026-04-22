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
  fetch('/accounts/set-theme/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCsrf(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'base=' + encodeURIComponent(base),
  }).catch(() => {});
}

function setAccentColor(color, isPremium) {
  if (PREMIUM_COLORS.includes(color) && !isPremium) return;
  const base = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(base, color);
  fetch('/accounts/set-theme/', {
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
// Close modal on overlay click (search modal gets full closeSearch(); others just remove 'open')
document.addEventListener('click', e => {
  if (!e.target.classList.contains('modal-overlay')) return;
  if (e.target.id === 'search-modal') {
    // handled by the search IIFE's closeSearch after it loads
    const si = document.getElementById('search-input');
    if (si) si.value = '';
  }
  e.target.classList.remove('open');
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

// ─── Global Search (Cmd+K / Ctrl+K) ───
(function () {
  const overlay = document.getElementById('search-modal');
  if (!overlay) return;

  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  const searchBtn = document.getElementById('search-btn');
  let debounceTimer = null;
  let currentIndex = -1;

  function openSearch() {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 30);
  }

  function closeSearch() {
    overlay.classList.remove('open');
    input.value = '';
    resultsEl.innerHTML = '<div class="search-empty" style="padding:28px 16px;"><div style="font-size:1.4rem;margin-bottom:8px;">⌕</div>Escribe para buscar en toda tu área de trabajo</div>';
    currentIndex = -1;
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closeSearch() : openSearch();
    }
  });

  // Override global Escape handler for the search modal specifically
  overlay.addEventListener('keydown', e => {
    const items = resultsEl.querySelectorAll('a.search-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      updateActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, -1);
      updateActive(items);
      if (currentIndex === -1) input.focus();
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      e.preventDefault();
      window.location = items[currentIndex].href;
      closeSearch();
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  function updateActive(items) {
    items.forEach((el, i) => el.classList.toggle('active', i === currentIndex));
    if (currentIndex >= 0) items[currentIndex].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    currentIndex = -1;
    const q = input.value.trim();
    if (q.length < 2) {
      resultsEl.innerHTML = q.length === 0
        ? '<div class="search-empty" style="padding:28px 16px;"><div style="font-size:1.4rem;margin-bottom:8px;">⌕</div>Escribe para buscar en toda tu área de trabajo</div>'
        : '<div class="search-empty">Escribe al menos 2 caracteres…</div>';
      return;
    }
    debounceTimer = setTimeout(() => fetchResults(q), 220);
  });

  async function fetchResults(q) {
    resultsEl.innerHTML = '<div class="search-empty">Buscando…</div>';
    try {
      const r = await fetch('/search/?q=' + encodeURIComponent(q), {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const data = await r.json();
      renderResults(data);
    } catch {
      resultsEl.innerHTML = '<div class="search-empty">Error al buscar.</div>';
    }
  }

  function renderResults({ tasks, projects, users }) {
    const total = tasks.length + projects.length + users.length;
    if (total === 0) {
      resultsEl.innerHTML = '<div class="search-empty">Sin resultados para esta búsqueda.</div>';
      return;
    }

    let html = '';

    if (projects.length) {
      html += '<div class="search-group-label">Proyectos</div>';
      for (const p of projects) {
        html += `<a class="search-item" href="${p.url}">
          <div class="search-item-icon">${esc(p.key)}</div>
          <div class="search-item-text">
            <div class="search-item-title">${esc(p.title)}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>
        </a>`;
      }
    }

    if (tasks.length) {
      html += '<div class="search-group-label">Tareas</div>';
      for (const t of tasks) {
        html += `<a class="search-item" href="${t.url}">
          <div class="search-item-icon">${esc(t.key)}</div>
          <div class="search-item-text">
            <div class="search-item-title">${esc(t.title)}</div>
            <div class="search-item-sub">${esc(t.project)}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>
        </a>`;
      }
    }

    if (users.length) {
      html += '<div class="search-group-label">Personas</div>';
      for (const u of users) {
        html += `<div class="search-item" tabindex="-1">
          <div class="search-item-icon" style="background:var(--accent-light);color:var(--accent);">${esc(u.initials)}</div>
          <div class="search-item-text">
            <div class="search-item-title">${esc(u.title)}</div>
            <div class="search-item-sub">${esc(u.subtitle)}</div>
          </div>
        </div>`;
      }
    }

    resultsEl.innerHTML = html;
    currentIndex = -1;

    resultsEl.querySelectorAll('a.search-item').forEach(el => {
      el.addEventListener('click', closeSearch);
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();

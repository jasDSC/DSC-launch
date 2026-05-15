const STORAGE_KEY = 'dsc_launchpad_v2';
const THEME_KEY   = 'dsc_theme';

const DAYS   = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
const MONTHS = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];

function formatDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]} den ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Godmorgen, velkommen tilbage.';
  if (h >= 12 && h < 18) return 'Goddag, velkommen tilbage.';
  return 'Godaften, velkommen tilbage.';
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_TILES = [
  { id: uid(), title: 'Align',    category: 'PLATFORM',     url: '', icon: '⊞',  color: '#3b82f6', desc: 'Opdatering og styring af Must Win Battles i Digital.' },
  { id: uid(), title: 'Prio',     category: 'PLATFORM',     url: '', icon: '≡',  color: '#06b6d4', desc: 'Strategisk prioriteringsværktøj.' },
  { id: uid(), title: 'PLUS+',    category: 'RAPPORTERING', url: '', icon: '◑',  color: '#10b981', desc: 'Overblikket over vores loyalitetsprogram.' },
  { id: uid(), title: 'Kundetal', category: 'RAPPORTERING', url: '', icon: '▮',  color: '#f59e0b', desc: 'Direkte adgang til Kundetalsrapporten.' },
  { id: uid(), title: 'Nyheder',  category: 'PLATFORM',     url: '', icon: '📰', color: '#f97316', desc: 'Nyt fra DSC organisationen.' },
  { id: uid(), title: 'ChatGPT',  category: 'PLATFORM',     url: '', icon: '🤖', color: '#8b5cf6', desc: 'DSC chatgpt.' },
  { id: uid(), title: 'Visma',    category: 'PLATFORM',     url: '', icon: '🕐', color: '#ef4444', desc: 'Ferie, fravær, timer og privatudlæg.' },
  { id: uid(), title: 'Emplate',  category: 'PLATFORM',     url: '', icon: '🏪', color: '#ec4899', desc: 'Adgang til multimall dashboard. Kontakt Emplate for adgang.' },
];

function loadTiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_TILES;
}

function saveTiles(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

let tiles = loadTiles();
let editingId = null;

const greeting      = document.querySelector('.greeting');
const themeBtn      = document.getElementById('themeBtn');
const tilesGrid     = document.getElementById('tilesGrid');
const emptyState    = document.getElementById('emptyState');
const dateBadge     = document.getElementById('dateBadge');
const settingsBtn   = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const overlay       = document.getElementById('overlay');
const closeSettings = document.getElementById('closeSettings');
const tileList      = document.getElementById('tileList');
const addTileBtn    = document.getElementById('addTileBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModal    = document.getElementById('closeModal');
const cancelModal   = document.getElementById('cancelModal');
const saveTileBtn   = document.getElementById('saveTile');
const deleteTileBtn = document.getElementById('deleteTileBtn');
const modalTitle    = document.getElementById('modalTitle');
const fieldTitle    = document.getElementById('fieldTitle');
const fieldCategory = document.getElementById('fieldCategory');
const fieldUrl      = document.getElementById('fieldUrl');
const fieldDesc     = document.getElementById('fieldDesc');
const fieldIcon     = document.getElementById('fieldIcon');
const fieldColor    = document.getElementById('fieldColor');
const colorPreview  = document.getElementById('colorPreview');

// ── Init date & greeting ──
dateBadge.textContent = formatDate();
greeting.textContent  = getGreeting();

// ── Theme ──
function applyTheme(light) {
  document.documentElement.classList.toggle('light', light);
  localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
}
applyTheme(localStorage.getItem(THEME_KEY) === 'light');
themeBtn.addEventListener('click', () => {
  applyTheme(!document.documentElement.classList.contains('light'));
});

// ── Render tiles ──
function renderTiles() {
  tilesGrid.innerHTML = '';
  const isEmpty = tiles.length === 0;
  emptyState.style.display = isEmpty ? 'flex' : 'none';
  tilesGrid.style.display  = isEmpty ? 'none' : 'grid';
  tiles.forEach(tile => {
    const a = document.createElement('a');
    a.className = 'tile';
    a.href = tile.url || '#';
    a.target = tile.url ? '_blank' : '_self';
    a.rel = 'noopener noreferrer';
    const bg = hexToRgba(tile.color || '#3b82f6', 0.15);
    a.innerHTML = `
      <div class="tile-icon-wrap" style="background:${bg}">
        <span style="color:${escHtml(tile.color||'#3b82f6')};font-size:1.4rem;">${escHtml(tile.icon||'🔗')}</span>
      </div>
      <div class="tile-category">${escHtml(tile.category||'PLATFORM')}</div>
      <div class="tile-title">${escHtml(tile.title)}</div>
      <div class="tile-desc">${escHtml(tile.desc||'')}</div>
      <div class="tile-cta">Gå til værktøj <span>→</span></div>
    `;
    tilesGrid.appendChild(a);
  });
}

// ── Render settings list ──
function renderTileList() {
  tileList.innerHTML = '';
  tiles.forEach(tile => {
    const item = document.createElement('div');
    item.className = 'tile-list-item';
    const bg = hexToRgba(tile.color || '#3b82f6', 0.15);
    item.innerHTML = `
      <div class="tile-list-dot" style="background:${bg};color:${escHtml(tile.color||'#3b82f6')}">${escHtml(tile.icon||'🔗')}</div>
      <div class="tile-list-info">
        <div class="tile-list-name">${escHtml(tile.title)}</div>
        <div class="tile-list-cat">${escHtml(tile.category||'PLATFORM')}</div>
      </div>
    `;
    item.addEventListener('click', () => openModal(tile.id));
    tileList.appendChild(item);
  });
}

// ── Settings panel ──
function openSettings() {
  renderTileList();
  settingsPanel.classList.add('open');
  overlay.classList.add('active');
}

function closeSettingsPanel() {
  settingsPanel.classList.remove('open');
  overlay.classList.remove('active');
}

settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsPanel);
overlay.addEventListener('click', closeSettingsPanel);

// ── Modal ──
function openModal(id) {
  editingId = id || null;
  const tile = id ? tiles.find(t => t.id === id) : null;
  modalTitle.textContent        = tile ? 'Rediger tile' : 'Ny tile';
  fieldTitle.value              = tile?.title    || '';
  fieldCategory.value           = tile?.category || 'PLATFORM';
  fieldUrl.value                = tile?.url      || '';
  fieldDesc.value               = tile?.desc     || '';
  fieldIcon.value               = tile?.icon     || '';
  fieldColor.value              = tile?.color    || '#3b82f6';
  colorPreview.style.background = fieldColor.value;
  deleteTileBtn.style.display   = tile ? 'block' : 'none';
  modalBackdrop.classList.add('open');
  setTimeout(() => fieldTitle.focus(), 50);
}

function closeModalFn() {
  modalBackdrop.classList.remove('open');
  editingId = null;
}

addTileBtn.addEventListener('click', () => openModal(null));
closeModal.addEventListener('click', closeModalFn);
cancelModal.addEventListener('click', closeModalFn);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModalFn(); });
fieldColor.addEventListener('input', () => { colorPreview.style.background = fieldColor.value; });

saveTileBtn.addEventListener('click', () => {
  const title = fieldTitle.value.trim();
  if (!title) { fieldTitle.focus(); return; }
  const data = {
    title,
    category: fieldCategory.value,
    url:      fieldUrl.value.trim(),
    desc:     fieldDesc.value.trim(),
    icon:     fieldIcon.value.trim() || '🔗',
    color:    fieldColor.value,
  };
  if (editingId) {
    tiles = tiles.map(t => t.id === editingId ? { ...t, ...data } : t);
  } else {
    tiles.push({ id: uid(), ...data });
  }
  saveTiles(tiles);
  renderTiles();
  renderTileList();
  closeModalFn();
});

deleteTileBtn.addEventListener('click', () => {
  if (!editingId) return;
  tiles = tiles.filter(t => t.id !== editingId);
  saveTiles(tiles);
  renderTiles();
  renderTileList();
  closeModalFn();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalBackdrop.classList.contains('open')) closeModalFn();
    else closeSettingsPanel();
  }
});

renderTiles();

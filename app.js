const STORAGE_KEY = 'dsc_launchpad_v3';
const THEME_KEY   = 'dsc_theme';
const NAME_KEY    = 'dsc_user_name';

const DAYS   = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
const MONTHS = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];

function formatDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]} den ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getGreeting() {
  const h      = new Date().getHours();
  const name   = localStorage.getItem(NAME_KEY)?.trim();
  const suffix = name ? ` ${name}.` : ', velkommen tilbage.';
  if (h >= 5 && h < 12) return 'Godmorgen' + suffix;
  if (h >= 12 && h < 18) return 'Goddag' + suffix;
  return 'Godaften' + suffix;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const FIXED_TILES = [
  { id: 'fixed-1', title: 'Align',       category: 'PLATFORM', url: 'https://dsc-align.vercel.app/',    icon: '🎯', color: '#3b82f6', desc: 'Opdatering og styring af Must Win Battles i Digital.' },
  { id: 'fixed-2', title: 'Rate',        category: 'PLATFORM', url: 'https://dsc-rate.vercel.app/',     icon: '⭐', color: '#06b6d4', desc: 'Rate både individuelt og som team.' },
  { id: 'fixed-3', title: 'Team profil', category: 'PLATFORM', url: 'https://dsc-disc.vercel.app/',     icon: '👥', color: '#8b5cf6', desc: 'Skab en teamprofil og styrk samarbejde.' },
  { id: 'fixed-4', title: 'Intega',      category: 'PLATFORM', url: 'https://integatime.dk/web/',       icon: '📅', color: '#f97316', desc: 'Ferie, fravær og personlige udlæg.' },
  { id: 'fixed-5', title: 'CatalystOne', category: 'PLATFORM', url: 'https://dsc.catalystone.com/',     icon: '🏢', color: '#10b981', desc: 'HR portal.' },
];

const DEFAULT_CONFIGURABLE = [
  { id: uid(), title: 'PLUS+',   category: 'RAPPORTERING', url: 'https://app.powerbi.com/Redirect?action=OpenReport&appId=f3d8cbea-ed58-44ba-8e36-9374e5e37850&reportObjectId=9c69306e-4831-44fe-99e6-5d6e6b12797a&ctid=b674d8e3-4004-4ad4-81d7-15f60fd35cd6&reportPage=f2d8a56517ca2e70292c&pbi_source=appShareLink&portalSessionId=0d654b33-7553-4347-a0b6-c6ae0d24ff43', icon: '◑',  color: '#10b981', desc: 'Overblikket over vores loyalitetsprogram.' },
  { id: uid(), title: 'Nyheder', category: 'PLATFORM',     url: 'https://danskeshoppingcentre.sharepoint.com/sites/home', icon: '📰', color: '#f59e0b', desc: 'Nyt fra DSC organisationen.' },
  { id: uid(), title: 'ChatGPT', category: 'PLATFORM',     url: 'https://chatgpt.com/',                 icon: '🤖', color: '#ec4899', desc: 'DSC chatgpt.' },
];

function loadConfigurable() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CONFIGURABLE;
}

function saveConfigurable(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return 'https://' + url;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

let configTiles = loadConfigurable();
let editingId = null;

const greeting      = document.querySelector('.greeting');
const fieldName     = document.getElementById('fieldName');
const saveNameBtn   = document.getElementById('saveNameBtn');
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

dateBadge.textContent = formatDate();
greeting.textContent  = getGreeting();

// ── Name ──
fieldName.value = localStorage.getItem(NAME_KEY) || '';
saveNameBtn.addEventListener('click', () => {
  const name = fieldName.value.trim();
  if (name) localStorage.setItem(NAME_KEY, name);
  else localStorage.removeItem(NAME_KEY);
  greeting.textContent = getGreeting();
});
fieldName.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveNameBtn.click();
});

// ── Theme ──
function applyTheme(light) {
  document.documentElement.classList.toggle('light', light);
  localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
}
applyTheme(localStorage.getItem(THEME_KEY) === 'light');
themeBtn.addEventListener('click', () => {
  applyTheme(!document.documentElement.classList.contains('light'));
});

function makeTileEl(tile) {
  const a = document.createElement('a');
  a.className = 'tile';
  const tileUrl = normalizeUrl(tile.url);
  a.href = tileUrl || '#';
  a.target = tileUrl ? '_blank' : '_self';
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
  return a;
}

function renderTiles() {
  tilesGrid.innerHTML = '';
  const all = [...FIXED_TILES, ...configTiles];
  const isEmpty = all.length === 0;
  emptyState.style.display = isEmpty ? 'flex' : 'none';
  tilesGrid.style.display  = isEmpty ? 'none' : 'grid';
  FIXED_TILES.forEach(t => tilesGrid.appendChild(makeTileEl(t)));
  configTiles.forEach(t => tilesGrid.appendChild(makeTileEl(t)));
}

function renderTileList() {
  tileList.innerHTML = '';
  configTiles.forEach(tile => {
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

function openModal(id) {
  editingId = id || null;
  const tile = id ? configTiles.find(t => t.id === id) : null;
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
    url:      normalizeUrl(fieldUrl.value.trim()),
    desc:     fieldDesc.value.trim(),
    icon:     fieldIcon.value.trim() || '🔗',
    color:    fieldColor.value,
  };
  if (editingId) {
    configTiles = configTiles.map(t => t.id === editingId ? { ...t, ...data } : t);
  } else {
    configTiles.push({ id: uid(), ...data });
  }
  saveConfigurable(configTiles);
  renderTiles();
  renderTileList();
  closeModalFn();
});

deleteTileBtn.addEventListener('click', () => {
  if (!editingId) return;
  configTiles = configTiles.filter(t => t.id !== editingId);
  saveConfigurable(configTiles);
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

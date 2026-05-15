const STORAGE_KEY = 'dsc_launchpad_tiles';

const DEFAULT_TILES = [
  { id: uid(), title: 'Google Drive', url: 'https://drive.google.com', icon: '📁', color: '#4f46e5', desc: 'Filer og dokumenter' },
  { id: uid(), title: 'Gmail', url: 'https://mail.google.com', icon: '✉️', color: '#ea4335', desc: 'E-mail' },
  { id: uid(), title: 'Google Meet', url: 'https://meet.google.com', icon: '🎥', color: '#34a853', desc: 'Videomøder' },
  { id: uid(), title: 'Notion', url: 'https://notion.so', icon: '📝', color: '#6366f1', desc: 'Notater og wikis' },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadTiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_TILES;
}

function saveTiles(tiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
}

function renderTileIcon(icon) {
  if (!icon) return '🔗';
  if (icon.startsWith('http')) {
    return `<img src="${escHtml(icon)}" alt="" onerror="this.parentElement.textContent='🔗'" />`;
  }
  return escHtml(icon);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let tiles = loadTiles();
let editingId = null;

const tilesContainer = document.getElementById('tilesContainer');
const emptyState     = document.getElementById('emptyState');
const settingsBtn    = document.getElementById('settingsBtn');
const settingsPanel  = document.getElementById('settingsPanel');
const overlay        = document.getElementById('overlay');
const closeSettings  = document.getElementById('closeSettings');
const tileList       = document.getElementById('tileList');
const addTileBtn     = document.getElementById('addTileBtn');
const modalBackdrop  = document.getElementById('modalBackdrop');
const closeModal     = document.getElementById('closeModal');
const cancelModal    = document.getElementById('cancelModal');
const saveTileBtn    = document.getElementById('saveTile');
const deleteTileBtn  = document.getElementById('deleteTileBtn');
const modalTitle     = document.getElementById('modalTitle');
const fieldTitle     = document.getElementById('fieldTitle');
const fieldUrl       = document.getElementById('fieldUrl');
const fieldIcon      = document.getElementById('fieldIcon');
const fieldColor     = document.getElementById('fieldColor');
const fieldDesc      = document.getElementById('fieldDesc');
const colorPreview   = document.getElementById('colorPreview');

function renderTiles() {
  tilesContainer.innerHTML = '';
  const isEmpty = tiles.length === 0;
  emptyState.style.display = isEmpty ? 'flex' : 'none';
  tilesContainer.style.display = isEmpty ? 'none' : 'grid';
  tiles.forEach(tile => {
    const a = document.createElement('a');
    a.className = 'tile';
    a.href = tile.url || '#';
    a.target = tile.url ? '_blank' : '_self';
    a.rel = 'noopener noreferrer';
    a.style.setProperty('--tile-color', tile.color || 'var(--accent)');
    a.innerHTML = `
      <div class="tile-icon">${renderTileIcon(tile.icon)}</div>
      <div class="tile-title">${escHtml(tile.title)}</div>
      ${tile.desc ? `<div class="tile-desc">${escHtml(tile.desc)}</div>` : ''}
    `;
    tilesContainer.appendChild(a);
  });
}

function renderTileList() {
  tileList.innerHTML = '';
  tiles.forEach(tile => {
    const item = document.createElement('div');
    item.className = 'tile-list-item';
    item.innerHTML = `
      <div class="tile-list-icon">${renderTileIcon(tile.icon)}</div>
      <div class="tile-list-info">
        <div class="tile-list-name">${escHtml(tile.title)}</div>
        <div class="tile-list-url">${escHtml(tile.url || '—')}</div>
      </div>
      <div class="tile-list-color" style="background:${escHtml(tile.color || '#4f46e5')}"></div>
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
  const tile = id ? tiles.find(t => t.id === id) : null;
  modalTitle.textContent = tile ? 'Rediger tile' : 'Ny tile';
  fieldTitle.value = tile?.title || '';
  fieldUrl.value   = tile?.url   || '';
  fieldIcon.value  = tile?.icon  || '';
  fieldColor.value = tile?.color || '#4f46e5';
  fieldDesc.value  = tile?.desc  || '';
  colorPreview.style.background = fieldColor.value;
  deleteTileBtn.style.display = tile ? 'block' : 'none';
  modalBackdrop.classList.add('open');
  fieldTitle.focus();
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
    url:   fieldUrl.value.trim(),
    icon:  fieldIcon.value.trim() || '🔗',
    color: fieldColor.value,
    desc:  fieldDesc.value.trim(),
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

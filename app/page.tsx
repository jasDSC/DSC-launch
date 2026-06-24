'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Constants ──
const STORAGE_KEY = 'dsc_launchpad_v3';
const THEME_KEY   = 'dsc_theme';
const NAME_KEY    = 'dsc_user_name';

const DAYS   = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

function formatDate(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]} den ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getGreeting(name: string): string {
  const h = new Date().getHours();
  const suffix = name ? ` ${name}.` : ', velkommen tilbage.';
  if (h >= 5 && h < 12) return 'Godmorgen' + suffix;
  if (h >= 12 && h < 18) return 'Goddag' + suffix;
  return 'Godaften' + suffix;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return 'https://' + url;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Types ──
interface Tile {
  id: string;
  title: string;
  category: string;
  url: string;
  icon: string;
  color: string;
  desc: string;
}

// ── Fixed tiles ──
const FIXED_TILES: Tile[] = [
  { id: 'fixed-1', title: 'Align',       category: 'PLATFORM', url: 'https://dsc-align.vercel.app/',    icon: '🎯', color: '#303751', desc: 'Opdatering og styring af Must Win Battles i Digital.' },
  { id: 'fixed-2', title: 'Rate',        category: 'PLATFORM', url: 'https://dsc-rate.vercel.app/',     icon: '⭐', color: '#BC9F6D', desc: 'Rate både individuelt og som team.' },
  { id: 'fixed-3', title: 'Team profil', category: 'PLATFORM', url: 'https://dsc-disc.vercel.app/',     icon: '👥', color: '#506C56', desc: 'Skab en teamprofil og styrk samarbejde.' },
  { id: 'fixed-4', title: 'Intega',      category: 'PLATFORM', url: 'https://integatime.dk/web/',       icon: '📅', color: '#CBD7D7', desc: 'Ferie, fravær og personlige udlæg.' },
  { id: 'fixed-5', title: 'CatalystOne', category: 'PLATFORM', url: 'https://dsc.catalystone.com/',     icon: '🏢', color: '#E0D0CA', desc: 'HR portal.' },
];

const DEFAULT_CONFIGURABLE: Tile[] = [
  { id: uid(), title: 'PLUS+',   category: 'RAPPORTERING', url: 'https://app.powerbi.com/Redirect?action=OpenReport&appId=f3d8cbea-ed58-44ba-8e36-9374e5e37850&reportObjectId=9c69306e-4831-44fe-99e6-5d6e6b12797a&ctid=b674d8e3-4004-4ad4-81d7-15f60fd35cd6&reportPage=f2d8a56517ca2e70292c&pbi_source=appShareLink&portalSessionId=0d654b33-7553-4347-a0b6-c6ae0d24ff43', icon: '◑', color: '#506C56', desc: 'Overblikket over vores loyalitetsprogram.' },
  { id: uid(), title: 'Nyheder', category: 'PLATFORM',     url: 'https://danskeshoppingcentre.sharepoint.com/sites/home', icon: '📰', color: '#BC9F6D', desc: 'Nyt fra DSC organisationen.' },
  { id: uid(), title: 'ChatGPT', category: 'PLATFORM',     url: 'https://chatgpt.com/',                 icon: '🤖', color: '#303751', desc: 'DSC chatgpt.' },
];

// ── SVG Icons ──
function IconGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ── Tile Card ──
interface TileCardProps {
  tile: Tile;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

function TileCard({ tile, draggable: isDraggable, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver }: TileCardProps) {
  const tileUrl = normalizeUrl(tile.url);
  const iconBg  = hexToRgba(tile.color || '#303751', 0.12);

  return (
    <a
      href={tileUrl || '#'}
      target={tileUrl ? '_blank' : '_self'}
      rel="noopener noreferrer"
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="group flex flex-col rounded-lg shadow-sm border border-[var(--border-subtle)] p-[22px] gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg no-underline"
      style={{
        textDecoration: 'none',
        background: 'var(--bg-surface)',
        cursor: isDraggable ? 'grab' : undefined,
        opacity: isDragging ? 0.35 : 1,
        transform: isDragOver ? 'translateY(-4px)' : undefined,
        boxShadow: isDragOver ? '0 8px 30px rgba(59,130,246,0.2)' : undefined,
        borderColor: isDragOver ? 'var(--navy-500)' : undefined,
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-12 h-12 rounded-md text-xl flex-shrink-0"
        style={{ background: iconBg }}
      >
        <span style={{ color: tile.color || '#303751' }}>{tile.icon || '🔗'}</span>
      </div>

      {/* Category label */}
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--fg-2)' }}
      >
        {tile.category || 'PLATFORM'}
      </span>

      {/* Title */}
      <h3
        className="text-[18px] font-bold leading-snug tracking-[-0.02em] m-0"
        style={{ color: 'var(--fg-1)' }}
      >
        {tile.title}
      </h3>

      {/* Description */}
      {tile.desc && (
        <p
          className="text-[13px] leading-relaxed flex-1 m-0"
          style={{ color: 'var(--fg-2)' }}
        >
          {tile.desc}
        </p>
      )}

      {/* CTA */}
      <div
        className="flex items-center justify-between text-[13px] font-semibold pt-3 mt-auto border-t"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--fg-brand)',
        }}
      >
        <span>Gå til værktøj</span>
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </div>
    </a>
  );
}

// ── Settings Tile List Item ──
interface TileListItemProps {
  tile: Tile;
  onClick: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

function TileListItem({ tile, onClick, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver }: TileListItemProps) {
  const iconBg = hexToRgba(tile.color || '#303751', 0.12);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors border"
      style={{
        borderColor: isDragOver ? 'var(--navy-500)' : 'transparent',
        background: isDragOver ? 'rgba(48,55,81,0.06)' : 'transparent',
        opacity: isDragging ? 0.4 : 1,
        cursor: 'default',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex-shrink-0 select-none text-[16px] leading-none px-0.5"
        style={{ color: 'var(--fg-3)', cursor: 'grab' }}
        title="Træk for at sortere"
      >
        ⠿
      </div>
      <div
        className="flex items-center justify-center w-9 h-9 rounded-sm text-base flex-shrink-0"
        style={{ background: iconBg }}
      >
        <span style={{ color: tile.color || '#303751' }}>{tile.icon || '🔗'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--fg-1)' }}>
          {tile.title}
        </div>
        <div className="text-[11px] uppercase tracking-[0.1em] font-semibold" style={{ color: 'var(--fg-3)' }}>
          {tile.category}
        </div>
      </div>
      <button
        onClick={onClick}
        className="flex items-center justify-center w-7 h-7 rounded-md transition-colors border-0 bg-transparent flex-shrink-0"
        style={{ cursor: 'pointer' }}
        aria-label={`Rediger ${tile.title}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: 'var(--fg-3)' }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

// ── Vacation Calendar ──
interface VacationEvent {
  name: string;
  start: string;
  end: string;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

function isActiveToday(start: string, end: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return start <= today && today < end;
}

const PERSON_COLORS: string[] = [
  '#303751', '#506C56', '#BC9F6D', '#7B8FA1', '#8B7355',
  '#4A6741', '#9B8B7A', '#3D5A80', '#6B5E4E', '#557A52',
];

function getPersonColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PERSON_COLORS[h % PERSON_COLORS.length];
}

function VacationCalendar() {
  const [events, setEvents]   = useState<VacationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(d => {
        if (d.events) setEvents(d.events);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const inFourWeeks = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const awayNow  = events.filter(e => isActiveToday(e.start, e.end));
  const upcoming = events.filter(e => !isActiveToday(e.start, e.end) && e.start <= inFourWeeks && e.end > today);

  return (
    <div
      className="rounded-lg border px-5 py-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">📅</span>
        <span className="text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--fg-1)' }}>
          Feriekalender
        </span>
        <span className="text-[11px] ml-auto" style={{ color: 'var(--fg-3)' }}>
          DSC Digital
        </span>
      </div>

      {loading && (
        <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>Henter feriedata…</p>
      )}

      {error && (
        <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>
          Kunne ikke hente data — tjek at Azure-integration er sat op.
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          {/* Away now */}
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--fg-2)' }}>
              Væk i dag
            </div>
            {awayNow.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>Alle er på kontoret</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {awayNow.map((e, i) => {
                  const color = getPersonColor(e.name);
                  const bg    = `${color}1a`;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: bg, color }}
                      >
                        {e.name[0].toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--fg-1)' }}>{e.name}</span>
                      <span className="text-[12px] ml-auto" style={{ color: 'var(--fg-3)' }}>
                        til {formatShortDate(e.end)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px self-stretch" style={{ background: 'var(--border-subtle)' }} />

          {/* Upcoming */}
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--fg-2)' }}>
              Kommende ferie (4 uger)
            </div>
            {upcoming.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>Ingen planlagt ferie de næste 4 uger</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {upcoming.map((e, i) => {
                  const color = getPersonColor(e.name);
                  const bg    = `${color}1a`;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: bg, color }}
                      >
                        {e.name[0].toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--fg-1)' }}>{e.name}</span>
                      <span className="text-[12px] ml-auto whitespace-nowrap" style={{ color: 'var(--fg-3)' }}>
                        {formatShortDate(e.start)} – {formatShortDate(e.end)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal ──
interface ModalState {
  open: boolean;
  editingId: string | null;
  title: string;
  category: string;
  url: string;
  desc: string;
  icon: string;
  color: string;
}

const emptyModal: ModalState = {
  open: false,
  editingId: null,
  title: '',
  category: 'PLATFORM',
  url: '',
  desc: '',
  icon: '',
  color: '#303751',
};

// ── Main Component ──
export default function LaunchpadPage() {
  const [mounted, setMounted]           = useState(false);
  const [darkMode, setDarkMode]         = useState(false);
  const [userName, setUserName]         = useState('');
  const [greeting, setGreeting]         = useState('');
  const [dateStr, setDateStr]           = useState('');
  const [configTiles, setConfigTiles]   = useState<Tile[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modal, setModal]               = useState<ModalState>(emptyModal);
  const [nameInput, setNameInput]       = useState('');
  const [dragSrcId, setDragSrcId]       = useState<string | null>(null);
  const [dragOverId, setDragOverId]     = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // ── Hydration ──
  useEffect(() => {
    const savedName  = localStorage.getItem(NAME_KEY) || '';
    const savedTheme = localStorage.getItem(THEME_KEY);
    const isDark     = savedTheme === 'dark';

    let saved: Tile[] = DEFAULT_CONFIGURABLE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    setUserName(savedName);
    setNameInput(savedName);
    setDarkMode(isDark);
    setConfigTiles(saved);
    setGreeting(getGreeting(savedName));
    setDateStr(formatDate());
    setMounted(true);
  }, []);

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Refresh greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting(userName));
    }, 60_000);
    return () => clearInterval(interval);
  }, [userName]);

  // Focus modal title when it opens
  useEffect(() => {
    if (modal.open && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [modal.open]);

  // Keyboard dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modal.open) setModal(emptyModal);
        else if (settingsOpen) setSettingsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modal.open, settingsOpen]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const saveName = useCallback(() => {
    const n = nameInput.trim();
    if (n) localStorage.setItem(NAME_KEY, n);
    else localStorage.removeItem(NAME_KEY);
    setUserName(n);
    setGreeting(getGreeting(n));
  }, [nameInput]);

  const saveConfigTiles = useCallback((tiles: Tile[]) => {
    setConfigTiles(tiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
  }, []);

  const openModalNew = useCallback(() => {
    setModal({ ...emptyModal, open: true });
  }, []);

  const openModalEdit = useCallback((id: string) => {
    const tile = configTiles.find(t => t.id === id);
    if (!tile) return;
    setModal({
      open: true,
      editingId: id,
      title: tile.title,
      category: tile.category,
      url: tile.url,
      desc: tile.desc,
      icon: tile.icon,
      color: tile.color,
    });
  }, [configTiles]);

  const handleSaveTile = useCallback(() => {
    if (!modal.title.trim()) {
      titleRef.current?.focus();
      return;
    }
    const data = {
      title:    modal.title.trim(),
      category: modal.category,
      url:      normalizeUrl(modal.url.trim()),
      desc:     modal.desc.trim(),
      icon:     modal.icon.trim() || '🔗',
      color:    modal.color,
    };
    if (modal.editingId) {
      saveConfigTiles(configTiles.map(t => t.id === modal.editingId ? { ...t, ...data } : t));
    } else {
      saveConfigTiles([...configTiles, { id: uid(), ...data }]);
    }
    setModal(emptyModal);
  }, [modal, configTiles, saveConfigTiles]);

  const handleDeleteTile = useCallback(() => {
    if (!modal.editingId) return;
    saveConfigTiles(configTiles.filter(t => t.id !== modal.editingId));
    setModal(emptyModal);
  }, [modal.editingId, configTiles, saveConfigTiles]);

  const handleDrop = useCallback((toId: string) => {
    if (!dragSrcId || dragSrcId === toId) return;
    const fromIdx = configTiles.findIndex(t => t.id === dragSrcId);
    const toIdx   = configTiles.findIndex(t => t.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...configTiles];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    saveConfigTiles(next);
  }, [dragSrcId, configTiles, saveConfigTiles]);

  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }} />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center font-sans"
      style={{ background: 'var(--bg-page)', color: 'var(--fg-1)' }}
    >
      {/* ── Header ── */}
      <header>
        <div className="max-w-6xl mx-auto px-6 py-5">
          {/* Top row */}
          <div className="flex items-center justify-between mb-5">
            {/* Label bar */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-0.5 h-4 rounded-full flex-shrink-0"
                style={{ background: 'var(--navy-500)' }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: 'var(--navy-500)' }}
              >
                INTERNE VÆRKTØJER &amp; RAPPORTERING I DIGITAL
              </span>
            </div>

            {/* Topbar actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-md transition-colors border"
                style={{
                  color: 'var(--fg-2)',
                  borderColor: 'var(--border-subtle)',
                  background: 'transparent',
                }}
                title="Skift tema"
                aria-label="Skift tema"
              >
                {darkMode ? <IconSun /> : <IconMoon />}
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-md transition-colors border"
                style={{
                  color: 'var(--fg-2)',
                  borderColor: 'var(--border-subtle)',
                  background: 'transparent',
                }}
                title="Indstillinger"
                aria-label="Indstillinger"
              >
                <IconGear />
              </button>
            </div>
          </div>

          {/* Hero row */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-[34px] font-extrabold leading-tight m-0"
                style={{ letterSpacing: '-0.03em', color: 'var(--fg-1)' }}
              >
                {greeting}
              </h1>
              <p
                className="text-[15px] mt-1.5 m-0"
                style={{ color: 'var(--fg-2)' }}
              >
                Her er dit overblik over platforme og rapporter.
              </p>
            </div>

            {/* Date badge */}
            <div
              className="px-4 py-2 rounded-md text-[13px] font-semibold flex-shrink-0 border"
              style={{
                background: 'var(--bg-tinted-tan)',
                borderColor: 'var(--tan-200)',
                color: 'var(--tan-700)',
              }}
            >
              {dateStr}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-6 pb-8 flex flex-col gap-6">
        <VacationCalendar />

        {FIXED_TILES.length + configTiles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 gap-3 rounded-lg border"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
          >
            <span className="text-4xl">🧩</span>
            <p className="text-[15px]" style={{ color: 'var(--fg-2)' }}>Ingen tiles endnu.</p>
            <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>
              Klik på tandhjulet øverst for at tilføje tiles.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FIXED_TILES.map(tile => (
              <TileCard key={tile.id} tile={tile} />
            ))}
            {configTiles.map(tile => (
              <TileCard
                key={tile.id}
                tile={tile}
                draggable
                isDragging={dragSrcId === tile.id}
                isDragOver={dragOverId === tile.id}
                onDragStart={() => setDragSrcId(tile.id)}
                onDragOver={e => { e.preventDefault(); setDragOverId(tile.id); }}
                onDrop={e => { e.preventDefault(); handleDrop(tile.id); setDragOverId(null); }}
                onDragEnd={() => { setDragSrcId(null); setDragOverId(null); }}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Logo footer ── */}
      <div className="max-w-6xl mx-auto w-full px-6 pb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cgbkfogmxyawrakqvxen.supabase.co/storage/v1/object/sign/Media/DSC_Logo_Black_Payoff_2058x1080.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MzdiMWQ4Ni04MDMwLTQxYmYtODc1Ni04NTFkNzhiZGM1YjAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNZWRpYS9EU0NfTG9nb19CbGFja19QYXlvZmZfMjA1OHgxMDgwLnBuZyIsImlhdCI6MTc3ODkxMzAyOCwiZXhwIjoxOTA1MDU3MDI4fQ.GEcDYbVxPh_uMwh66g0uabys4L7I7hnFK-geRSG8f_M"
          alt="DSC logo"
          width={144}
          height={76}
          className="block object-contain dark-invert-logo ml-auto"
          style={{ opacity: 0.7 }}
        />
      </div>

      {/* ── Overlay ── */}
      {(settingsOpen || modal.open) && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-200"
          style={{ background: 'rgba(27,31,44,0.35)' }}
          onClick={() => {
            if (modal.open) setModal(emptyModal);
            else setSettingsOpen(false);
          }}
        />
      )}

      {/* ── Settings Panel ── */}
      <aside
        className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col transition-transform duration-300 shadow-lg border-l"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          transform: settingsOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-[18px] font-bold m-0" style={{ color: 'var(--fg-1)' }}>
            Indstillinger
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-[16px] border transition-colors"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--fg-2)', background: 'transparent' }}
            aria-label="Luk indstillinger"
          >
            ✕
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Name */}
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
              style={{ color: 'var(--fg-2)' }}
            >
              Dit navn
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
                placeholder="f.eks. Jacob"
                maxLength={40}
                className="flex-1 px-3 py-2 rounded-md text-[14px] border outline-none transition-shadow"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--fg-1)',
                }}
              />
              <button
                onClick={saveName}
                className="px-4 py-2 rounded-md text-[13px] font-semibold transition-colors flex-shrink-0"
                style={{
                  background: 'var(--navy-500)',
                  color: 'var(--white)',
                }}
              >
                Gem
              </button>
            </div>
          </div>

          {/* Fixed tiles notice */}
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
              style={{ color: 'var(--fg-2)' }}
            >
              Faste tiles
            </div>
            <p
              className="text-[13px] leading-relaxed px-3 py-2.5 rounded-md border"
              style={{
                color: 'var(--fg-2)',
                background: 'var(--bg-surface-2)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              Align, Rate, Team profil, Intega og CatalystOne er faste og kan ikke redigeres.
            </p>
          </div>

          {/* Configurable tiles */}
          <div className="flex-1">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
              style={{ color: 'var(--fg-2)' }}
            >
              Konfigurerbare tiles
            </div>
            <div className="flex flex-col gap-1">
              {configTiles.length === 0 && (
                <p className="text-[13px] px-3 py-2" style={{ color: 'var(--fg-3)' }}>
                  Ingen tiles endnu.
                </p>
              )}
              {configTiles.map(tile => (
                <TileListItem
                  key={tile.id}
                  tile={tile}
                  onClick={() => openModalEdit(tile.id)}
                  isDragging={dragSrcId === tile.id}
                  isDragOver={dragOverId === tile.id}
                  onDragStart={() => setDragSrcId(tile.id)}
                  onDragOver={e => { e.preventDefault(); setDragOverId(tile.id); }}
                  onDrop={e => { e.preventDefault(); handleDrop(tile.id); setDragOverId(null); }}
                  onDragEnd={() => { setDragSrcId(null); setDragOverId(null); }}
                />
              ))}
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={openModalNew}
            className="w-full py-2.5 rounded-md text-[14px] font-semibold border-2 border-dashed transition-colors"
            style={{
              borderColor: 'var(--navy-300)',
              color: 'var(--navy-500)',
              background: 'transparent',
            }}
          >
            + Tilføj tile
          </button>
        </div>
      </aside>

      {/* ── Tile Editor Modal ── */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setModal(emptyModal); }}
        >
          <div
            className="w-full max-w-md rounded-xl shadow-lg border flex flex-col max-h-[90vh]"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="text-[18px] font-bold m-0" style={{ color: 'var(--fg-1)' }}>
                {modal.editingId ? 'Rediger tile' : 'Ny tile'}
              </h3>
              <button
                onClick={() => setModal(emptyModal)}
                className="flex items-center justify-center w-8 h-8 rounded-md text-[16px] border transition-colors"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--fg-2)', background: 'transparent' }}
                aria-label="Luk"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {/* Title */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--fg-2)' }}>
                  Titel
                </span>
                <input
                  ref={titleRef}
                  type="text"
                  value={modal.title}
                  onChange={e => setModal(m => ({ ...m, title: e.target.value }))}
                  placeholder="f.eks. Align"
                  className="px-3 py-2.5 rounded-md text-[14px] border outline-none"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--fg-1)',
                  }}
                />
              </label>

              {/* Category */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--fg-2)' }}>
                  Kategori
                </span>
                <select
                  value={modal.category}
                  onChange={e => setModal(m => ({ ...m, category: e.target.value }))}
                  className="px-3 py-2.5 rounded-md text-[14px] border outline-none"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--fg-1)',
                  }}
                >
                  <option value="PLATFORM">Platform</option>
                  <option value="RAPPORTERING">Rapportering</option>
                  <option value="ANDET">Andet</option>
                </select>
              </label>

              {/* URL */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--fg-2)' }}>
                  URL
                </span>
                <input
                  type="url"
                  value={modal.url}
                  onChange={e => setModal(m => ({ ...m, url: e.target.value }))}
                  placeholder="https://..."
                  className="px-3 py-2.5 rounded-md text-[14px] border outline-none"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--fg-1)',
                  }}
                />
              </label>

              {/* Description */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--fg-2)' }}>
                  Beskrivelse
                </span>
                <input
                  type="text"
                  value={modal.desc}
                  onChange={e => setModal(m => ({ ...m, desc: e.target.value }))}
                  placeholder="Kort beskrivelse af værktøjet"
                  className="px-3 py-2.5 rounded-md text-[14px] border outline-none"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--fg-1)',
                  }}
                />
              </label>

              {/* Icon */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--fg-2)' }}>
                  Ikon
                </span>
                <input
                  type="text"
                  value={modal.icon}
                  onChange={e => setModal(m => ({ ...m, icon: e.target.value }))}
                  placeholder="📊"
                  maxLength={4}
                  className="px-3 py-2.5 rounded-md text-[14px] border outline-none"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--fg-1)',
                  }}
                />
              </label>

              {/* Color */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--fg-2)' }}>
                  Ikonfarve
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={modal.color}
                    onChange={e => setModal(m => ({ ...m, color: e.target.value }))}
                    className="w-10 h-10 rounded-md border cursor-pointer p-0.5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  />
                  <div
                    className="w-10 h-10 rounded-md border flex-shrink-0"
                    style={{
                      background: hexToRgba(modal.color, 0.15),
                      borderColor: 'var(--border-subtle)',
                    }}
                  />
                  <span className="text-[13px]" style={{ color: 'var(--fg-2)' }}>
                    {modal.color}
                  </span>
                </div>
              </label>
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {modal.editingId ? (
                <button
                  onClick={handleDeleteTile}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
                  style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger-fg)',
                    border: '1px solid var(--plum-200)',
                  }}
                >
                  Slet
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal(emptyModal)}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold transition-colors border"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--fg-2)',
                    background: 'transparent',
                  }}
                >
                  Annuller
                </button>
                <button
                  onClick={handleSaveTile}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
                  style={{
                    background: 'var(--navy-500)',
                    color: 'var(--white)',
                  }}
                >
                  Gem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

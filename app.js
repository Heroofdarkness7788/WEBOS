/* =========================================================
   NEBULA OS — app.js  (macOS-style)
   A tiny web desktop built with plain HTML, CSS and JS.

   Sections:
     1.  Configuration (name, wallpapers)
     2.  App registry
     3.  Boot sequence
     4.  Window manager
     5.  Dock
     6.  Menubar + menus
     7.  Spotlight
     8.  Control Center
     9.  Sleep / lock screen
     10. Context menu (wallpapers)
     11. Apps: Notes, Calculator, Snake, Music, Finder, Devlogs, About, Trash
     11.5 Finder: a real, persistent file system
     11.6 Music: Web Audio synth engine, app + mini-player
     12. Devlog data
     13. Helpers
     14. Init
   ========================================================= */

/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const OS = {
  name: 'Nebula',
  version: '3.0.0',
  codename: 'Sequoia',
  user: 'guest', // no password — anyone can jump in!
};

const MENUBAR_H = 28;

// Wallpaper gallery — pick one from the right-click menu,
// the Control Center, or the View menu.
const WALLPAPERS = {
  sequoia: {
    name: 'Sequoia',
    css: [
      'radial-gradient(120% 100% at 78% 0%, #cfe9ff 0%, transparent 55%)',
      'radial-gradient(110% 90% at 15% 15%, #7fb8ff 0%, transparent 60%)',
      'radial-gradient(140% 110% at 55% 110%, #0b57c8 0%, transparent 65%)',
      'linear-gradient(165deg, #e8f4ff 0%, #4a90e2 42%, #0b3f8f 100%)',
    ].join(', '),
  },
  aurora: {
    name: 'Aurora',
    css: [
      'radial-gradient(100% 80% at 72% 18%, #7cf5c8 0%, transparent 55%)',
      'radial-gradient(100% 90% at 18% 90%, #2ea8ff 0%, transparent 60%)',
      'linear-gradient(165deg, #0a3b2e 0%, #0f5e4f 55%, #06233c 100%)',
    ].join(', '),
  },
  sunset: {
    name: 'Sunset',
    css: [
      'radial-gradient(90% 70% at 72% 72%, #ffb347 0%, transparent 55%)',
      'radial-gradient(100% 90% at 18% 28%, #ff5e7e 0%, transparent 60%)',
      'linear-gradient(170deg, #2b1a4d 0%, #7a2a68 50%, #d8495f 100%)',
    ].join(', '),
  },
  midnight: {
    name: 'Midnight',
    css: [
      'radial-gradient(80% 60% at 75% 18%, #6a8bff 0%, transparent 55%)',
      'linear-gradient(180deg, #0a0f2e 0%, #05070f 100%)',
    ].join(', '),
  },
  ocean: {
    name: 'Ocean',
    css: [
      'radial-gradient(90% 70% at 25% 25%, #37c8ff 0%, transparent 55%)',
      'radial-gradient(100% 80% at 80% 88%, #0d7dff 0%, transparent 60%)',
      'linear-gradient(165deg, #021b33 0%, #07406e 60%, #010d18 100%)',
    ].join(', '),
  },
};

const KEYS = {
  notes: 'nebula.notes',
  best: 'nebula.snake.best',
  wallpaper: 'nebula.wallpaper',
  bright: 'nebula.brightness',
  booted: 'nebula.bootedOnce',
  vol: 'nebula.volume',
  fs: 'nebula.fs',
  theme: 'nebula.theme',
  rect: (appId) => 'nebula.rect.' + appId,
};

/* =========================================================
   2. APP REGISTRY
   ========================================================= */

const APPS = {
  finder: { name: 'Finder',     icon: '📁', w: 640, h: 460, onOpen: openFinder },
  notes:  { name: 'Notes',      icon: '📝', w: 470, h: 400, onOpen: openNotes },
  calc:   { name: 'Calculator', icon: '🧮', w: 300, h: 440, onOpen: openCalc },
  snake:  { name: 'Snake',      icon: '🐍', w: 390, h: 500, onOpen: openSnake },
  music:  { name: 'Music',      icon: '🎵', w: 560, h: 520, onOpen: openMusic },
  devlog: { name: 'Devlogs',    icon: '📓', w: 570, h: 480, onOpen: openDevlogs },
  system: { name: 'About',      icon: '🪐', w: 420, h: 440, onOpen: openAbout },
  trash:  { name: 'Trash',      icon: '🗑️', w: 420, h: 340, onOpen: openTrash },
  settings: { name: 'Settings', icon: '⚙️', w: 660, h: 470, onOpen: openSettings },
};

const DESKTOP_APPS = ['finder', 'notes', 'calc', 'snake', 'music', 'devlog', 'system', 'trash', 'settings'];
const DOCK_APPS = ['finder', 'notes', 'calc', 'snake', 'music', 'devlog', 'system', 'settings'];

// UI state that the View menu toggles.
const UI = { showIcons: true, showDock: true };

/* ---- macOS-style app icons (SVG tiles, no emoji) ---- */

const ICONS = {
  finder: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#cfe3ff"/>
    <path d="M32 1 h31 v62 h-31 z" fill="#3f7fd6"/>
    <rect x="15" y="17" width="9" height="28" rx="4.5" fill="#ffffff"/>
    <rect x="40" y="17" width="9" height="28" rx="4.5" fill="#ffffff"/>
    <path d="M13 51 q18 12 38 0" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`,
  notes: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#f6c945"/>
    <rect x="13" y="9" width="38" height="7" rx="3.5" fill="#d99b1c"/>
    <rect x="13" y="24" width="38" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
    <rect x="13" y="32" width="30" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
    <rect x="13" y="40" width="34" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
    <rect x="13" y="48" width="24" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
  </svg>`,
  calc: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#2f2f36"/>
    <rect x="11" y="11" width="42" height="13" rx="3" fill="#4b4b54"/>
    <rect x="11" y="29" width="12" height="12" rx="2" fill="#ff9f0a"/>
    <rect x="26" y="29" width="12" height="12" rx="2" fill="#d8d8de"/>
    <rect x="41" y="29" width="12" height="12" rx="2" fill="#d8d8de"/>
    <rect x="11" y="44" width="12" height="12" rx="2" fill="#d8d8de"/>
    <rect x="26" y="44" width="12" height="12" rx="2" fill="#d8d8de"/>
    <rect x="41" y="44" width="12" height="12" rx="2" fill="#d8d8de"/>
  </svg>`,
  snake: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#14402f"/>
    <path d="M9 45 q16 14 25 0 t21 -6" stroke="#3ee0c7" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="51" cy="33" r="5.5" fill="#ff6ec7"/>
    <circle cx="42" cy="39" r="2" fill="#ffffff"/>
    <circle cx="36" cy="36" r="1.6" fill="#ffffff"/>
  </svg>`,
  music: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#ff453a"/>
    <rect x="1" y="41" width="62" height="22" rx="11" fill="#d70015"/>
    <path d="M40 12 v26 a9 9 0 1 1 -6 -8.4 V20 l18 -4 v22 a9 9 0 1 1 -6 -8.4 V12 z" fill="#ffffff"/>
  </svg>`,
  devlog: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#0a84ff"/>
    <path d="M13 11 h17 v42 h-17 a6 6 0 0 1 -6 -6 v-30 a6 6 0 0 1 6 -6 z" fill="#ffffff"/>
    <path d="M34 11 h17 a6 6 0 0 1 6 6 v30 a6 6 0 0 1 -6 6 h-17 z" fill="#dcecff"/>
    <rect x="17" y="20" width="13" height="3" rx="1.5" fill="#0a84ff" opacity="0.55"/>
    <rect x="17" y="27" width="10" height="3" rx="1.5" fill="#0a84ff" opacity="0.55"/>
    <rect x="17" y="34" width="12" height="3" rx="1.5" fill="#0a84ff" opacity="0.55"/>
    <rect x="17" y="41" width="8" height="3" rx="1.5" fill="#0a84ff" opacity="0.55"/>
    <rect x="39" y="20" width="11" height="3" rx="1.5" fill="#0a84ff" opacity="0.35"/>
    <rect x="39" y="27" width="8" height="3" rx="1.5" fill="#0a84ff" opacity="0.35"/>
    <rect x="39" y="34" width="10" height="3" rx="1.5" fill="#0a84ff" opacity="0.35"/>
  </svg>`,
  system: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#5e5ce6"/>
    <circle cx="35" cy="36" r="14" fill="#ffffff"/>
    <ellipse cx="35" cy="36" rx="22" ry="7" fill="none" stroke="#c9c4ff" stroke-width="4.5" transform="rotate(-18 35 36)"/>
  </svg>`,
  trash: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#d4d7dd"/>
    <path d="M22 24 h20 l-2 25 a4 4 0 0 1 -4 3.5 h-8 a4 4 0 0 1 -4 -3.5 z" fill="#8f949c"/>
    <path d="M17 24 h30" stroke="#8f949c" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M25.5 24 v-3.5 a2.5 2.5 0 0 1 2.5 -2.5 h8 a2.5 2.5 0 0 1 2.5 2.5 V24" stroke="#8f949c" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  trashFull: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#c9ccd3"/>
    <path d="M22 24 h20 l-2 25 a4 4 0 0 1 -4 3.5 h-8 a4 4 0 0 1 -4 -3.5 z" fill="#7d828b"/>
    <path d="M17 24 h30" stroke="#7d828b" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M25.5 24 v-3.5 a2.5 2.5 0 0 1 2.5 -2.5 h8 a2.5 2.5 0 0 1 2.5 2.5 V24" stroke="#7d828b" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <rect x="24" y="29" width="13" height="8" rx="2" fill="#ffffff" transform="rotate(-10 30 33)"/>
    <rect x="28" y="34" width="13" height="8" rx="2" fill="#ffffff" transform="rotate(8 34 38)"/>
  </svg>`,
  launchpad: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#3b3b44"/>
    <g fill="#ffffff">
      <circle cx="19" cy="19" r="5.5"/>
      <circle cx="32" cy="19" r="5.5"/>
      <circle cx="45" cy="19" r="5.5"/>
      <circle cx="19" cy="32" r="5.5"/>
      <circle cx="32" cy="32" r="5.5"/>
      <circle cx="45" cy="32" r="5.5"/>
      <circle cx="19" cy="45" r="5.5"/>
      <circle cx="32" cy="45" r="5.5"/>
      <circle cx="45" cy="45" r="5.5"/>
    </g>
  </svg>`,
  settings: () => `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#b9bdc6"/>
    <path d="M32 7c-2.4 0-4.3 1.9-4.3 4.3v1.7c-3.1 1-5.8 2.9-7.6 5.5l-1.5-.9a4.3 4.3 0 0 0-5.9 1.5l-2.2 3.8a4.3 4.3 0 0 0 1.5 5.9l1.5.9c-.2 1.7-.2 3.4 0 5.1l-1.5.9a4.3 4.3 0 0 0-1.5 5.9l2.2 3.8a4.3 4.3 0 0 0 5.9 1.5l1.5-.9c1.8 2.6 4.5 4.5 7.6 5.5v1.7c0 2.4 1.9 4.3 4.3 4.3h4.4c2.4 0 4.3-1.9 4.3-4.3v-1.7c3.1-1 5.8-2.9 7.6-5.5l1.5.9a4.3 4.3 0 0 0 5.9-1.5l2.2-3.8a4.3 4.3 0 0 0-1.5-5.9l-1.5-.9c.2-1.7.2-3.4 0-5.1l1.5-.9a4.3 4.3 0 0 0 1.5-5.9l-2.2-3.8a4.3 4.3 0 0 0-5.9-1.5l-1.5.9c-1.8-2.6-4.5-4.5-7.6-5.5V11.3C36.3 8.9 34.4 7 32 7z" fill="#5a5e68"/>
    <circle cx="34.2" cy="32" r="10.5" fill="#e6e8ec"/>
    <circle cx="34.2" cy="32" r="4.6" fill="#5a5e68"/>
  </svg>`,
};

const appIcon = (id) => (ICONS[id] ? ICONS[id]() : '📁');

/* =========================================================
   3. BOOT SEQUENCE
   ========================================================= */

const bootScreen = () => document.getElementById('boot-screen');
let booting = false;

function runBoot() {
  if (booting) return;
  booting = true;

  const screen = bootScreen();
  const fill = document.getElementById('boot-fill');
  screen.classList.remove('hidden');

  fill.style.width = '0%';
  let progress = 0;

  const step = () => {
    progress = Math.min(progress + 8 + Math.random() * 10, 100);
    fill.style.width = progress + '%';

    if (progress < 100) {
      setTimeout(step, 120 + Math.random() * 90);
    } else {
      setTimeout(finishBoot, 320);
    }
  };

  const finishBoot = () => {
    screen.classList.add('hidden');
    booting = false;
    updateClock();
    updateBattery();
    // First visit? Open the Devlogs app so you can read how this was made.
    if (!localStorage.getItem(KEYS.booted)) {
      localStorage.setItem(KEYS.booted, 'yes');
      setTimeout(() => openWindow('devlog'), 500);
    }
  };

  setTimeout(step, 320);
}

// Click anywhere on the boot screen to skip straight to the desktop.
bootScreen().addEventListener('pointerdown', () => {
  if (!booting) return;
  booting = false;
  bootScreen().classList.add('hidden');
  document.getElementById('boot-fill').style.width = '100%';
});

/* =========================================================
   4. WINDOW MANAGER
   ========================================================= */

const windows = new Map(); // id -> state
let zTop = 10;
let nextId = 1;
let focusedAppId = null;

const desktopEl = () => document.getElementById('windows');
const desktopSize = () => ({ w: window.innerWidth, h: window.innerHeight - MENUBAR_H });
let snakeKeyHandler = null; // set by openSnake, used by the single global key listener

function openWindow(appId, opts = {}) {
  const app = APPS[appId];
  const id = 'win-' + nextId++;
  const size = desktopSize();

  // Cascade new windows so they don't stack exactly on top of each other.
  const cascade = (windows.size % 6) * 30;
  const saved = loadRect(appId);
  const w = Math.min(app.w, size.w);
  const h = Math.min(app.h, size.h);
  const x = saved ? saved.x : Math.min(64 + cascade, Math.max(size.w - w - 10, 0));
  const y = saved ? saved.y : Math.min(42 + cascade, Math.max(size.h - h - 12, 0));

  const state = {
    id, appId, title: app.name, icon: app.icon,
    x, y, w, h,
    minimized: false,
    maximized: false,
    rectBeforeMax: null,
    el: null,
  };

  // ---- build the DOM ----
  const el = document.createElement('div');
  el.className = 'window';
  el.id = id;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.zIndex = ++zTop;
  el.innerHTML = `
    <div class="win-titlebar">
      <div class="win-lights">
        <button class="tl tl-close" data-act="close" title="Close"><span>×</span></button>
        <button class="tl tl-min" data-act="min" title="Minimize"><span>−</span></button>
        <button class="tl tl-max" data-act="max" title="Zoom"><span>＋</span></button>
      </div>
      <span class="win-title">${app.name}</span>
      <div class="win-lights right"></div>
    </div>
    <div class="win-body"></div>
  `;

  state.el = el;
  desktopEl().appendChild(el);

  // ---- traffic light buttons ----
  el.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'close') closeWindow(id);
      if (act === 'min') toggleMinimize(id);
      if (act === 'max') toggleMaximize(id);
    });
  });

  // ---- make it draggable ----
  const titlebar = el.querySelector('.win-titlebar');
  titlebar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.tl')) return;
    toggleMaximize(id);
  });
  makeDraggable(state, titlebar);

  windows.set(id, state);
  updateDock();
  app.onOpen(state, el.querySelector('.win-body'));
  focusWindow(id);
  return state;
}

/* ---- drag + snap ---- */

function makeDraggable(state, titlebar) {
  titlebar.addEventListener('pointerdown', (e) => {
    if (state.maximized) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return; // left click only
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = state.x;
    const origY = state.y;
    const hint = document.getElementById('snap-hint');

    const onMove = (ev) => {
      const size = desktopSize();
      state.x = clamp(origX + (ev.clientX - startX), -(state.w - 80), size.w - 80);
      state.y = clamp(origY + (ev.clientY - startY), 0, size.h - 42);
      applyRect(state);

      const target = snapTarget(ev.clientX, ev.clientY);
      if (target) {
        hint.hidden = false;
        hint.style.left = target.x + 'px';
        hint.style.top = target.y + 'px';
        hint.style.width = target.w + 'px';
        hint.style.height = target.h + 'px';
      } else {
        hint.hidden = true;
      }
    };

    const onUp = (ev) => {
      hint.hidden = true;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      const target = snapTarget(ev.clientX, ev.clientY);
      if (target) {
        setRect(state, target.x, target.y, target.w, target.h);
      } else {
        saveRect(state);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function snapTarget(clientX, clientY) {
  const size = desktopSize();
  if (clientY <= MENUBAR_H + 6) return { x: 0, y: 0, w: size.w, h: size.h }; // full
  if (clientX <= 12) return { x: 0, y: 0, w: Math.floor(size.w / 2), h: size.h }; // left
  if (clientX >= size.w - 12) return { x: Math.floor(size.w / 2), y: 0, w: Math.floor(size.w / 2), h: size.h }; // right
  return null;
}

/* ---- window operations ---- */

function focusWindow(id) {
  const state = windows.get(id);
  if (!state || state.minimized) return;
  state.el.style.zIndex = ++zTop;
  windows.forEach((w) => w.el.classList.toggle('focused', w.id === id));
  focusedAppId = state.appId;
  updateDock();
}

function toggleMinimize(id) {
  const state = windows.get(id);
  state.minimized = !state.minimized;
  state.el.classList.toggle('minimized', state.minimized);
  if (!state.minimized) {
    focusWindow(id);
  } else {
    windows.forEach((w) => w.el.classList.remove('focused'));
    focusedAppId = null;
  }
  updateDock();
}

function toggleMaximize(id) {
  const state = windows.get(id);
  if (!state.maximized) {
    state.rectBeforeMax = { x: state.x, y: state.y, w: state.w, h: state.h };
    state.maximized = true;
    state.el.classList.add('maximized');
  } else {
    state.maximized = false;
    state.el.classList.remove('maximized');
    const r = state.rectBeforeMax;
    if (r) setRect(state, r.x, r.y, r.w, r.h);
  }
  focusWindow(id);
}

function closeWindow(id) {
  const state = windows.get(id);
  if (!state) return;
  if (state.onCleanup) state.onCleanup();
  state.el.remove();
  windows.delete(id);
  updateDock();

  // Focus the next top-most window, if any.
  const top = focusedState();
  focusedAppId = top ? top.appId : null;
  if (top) focusWindow(top.id);
  updateDock();
}

function focusedState() {
  let top = null;
  windows.forEach((w) => {
    if (!w.minimized && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w;
  });
  return top;
}

function setRect(state, x, y, w, h) {
  const size = desktopSize();
  state.x = Math.round(clamp(x, -(state.w - 80), size.w - 80));
  state.y = Math.round(clamp(y, 0, size.h - 42));
  state.w = Math.round(clamp(w, 260, size.w));
  state.h = Math.round(clamp(h, 180, size.h));
  if (state.maximized) {
    state.maximized = false;
    state.el.classList.remove('maximized');
  }
  applyRect(state);
  saveRect(state);
}

function applyRect(state) {
  state.el.style.left = state.x + 'px';
  state.el.style.top = state.y + 'px';
  state.el.style.width = state.w + 'px';
  state.el.style.height = state.h + 'px';
}

/* ---- persistence of window positions ---- */

function saveRect(state) {
  try {
    localStorage.setItem(KEYS.rect(state.appId), JSON.stringify({ x: state.x, y: state.y, w: state.w, h: state.h }));
  } catch (e) { /* ignore quota errors */ }
}

function loadRect(appId) {
  try {
    const raw = localStorage.getItem(KEYS.rect(appId));
    if (!raw) return null;
    const r = JSON.parse(raw);
    const size = desktopSize();
    if (r.x < 0 || r.y < 0 || r.x > size.w - 60 || r.y > size.h - 40) return null;
    return r;
  } catch (e) {
    return null;
  }
}

/* =========================================================
   5. DOCK
   ========================================================= */

const dockEl = () => document.getElementById('dock');

function buildDock() {
  const wrap = document.getElementById('dock-items');
  wrap.innerHTML = '';
  wrap.appendChild(launchpadItem()); // Launchpad sits first, just like macOS
  DOCK_APPS.forEach((id) => wrap.appendChild(dockItem(id)));
  const trash = document.getElementById('dock-trash');
  trash.innerHTML = '';
  trash.appendChild(dockItem('trash'));
}

function launchpadItem() {
  const item = document.createElement('div');
  item.className = 'dock-item';
  item.dataset.app = 'launchpad';
  item.innerHTML = `
    <button class="dock-icon" data-app="launchpad" title="Launchpad">${ICONS.launchpad()}</button>
    <span class="dock-dot"></span>
  `;
  item.querySelector('.dock-icon').addEventListener('click', () => toggleLaunchpad());
  return item;
}

function dockItem(appId) {
  const app = APPS[appId];
  const item = document.createElement('div');
  item.className = 'dock-item';
  item.dataset.app = appId;
  const body = appId === 'trash'
    ? `<span class="trash-empty-ic">${ICONS.trash()}</span><span class="trash-full-ic" style="display:none">${ICONS.trashFull()}</span>`
    : appIcon(appId);
  item.innerHTML = `
    <button class="dock-icon" data-app="${appId}" title="${app.name}">${body}</button>
    <span class="dock-dot"></span>
  `;
  item.querySelector('.dock-icon').addEventListener('click', () => dockClick(appId));
  return item;
}

function dockClick(appId) {
  const states = [...windows.values()].filter((w) => w.appId === appId);
  if (!states.length) {
    openWindow(appId);
    bounceDockIcon(appId); // the classic macOS launch bounce
    return;
  }
  states.sort((a, b) => +b.el.style.zIndex - +a.el.style.zIndex);
  const top = states[0];
  if (top.minimized) {
    toggleMinimize(top.id);
    focusWindow(top.id);
  } else if (top.el.classList.contains('focused')) {
    toggleMinimize(top.id);
  } else {
    focusWindow(top.id);
  }
}

function updateDock() {
  const openIds = new Set([...windows.values()].map((w) => w.appId));
  document.querySelectorAll('#dock .dock-item').forEach((it) => {
    it.classList.toggle('running', openIds.has(it.dataset.app));
  });
  document.getElementById('mb-appname').textContent =
    focusedAppId && APPS[focusedAppId] ? APPS[focusedAppId].name : 'Nebula';
}

/* ---- magnification + launch bounce ---- */

function dockMagnify() {
  const dock = dockEl();
  if (!dock) return;

  const SCALE_MAX = 1.65;   // peak icon size
  const RANGE = 150;        // px: influence radius from icon center
  const SIGMA = RANGE / 2.2; // gaussian spread

  /* helper: base centre-X of an icon relative to the dock, ignoring transforms */
  function baseCentres(icons) {
    const dockRect = dock.getBoundingClientRect();
    return Array.from(icons).map((ic) => {
      const r = ic.getBoundingClientRect();
      return r.left + r.width / 2 - dockRect.left;
    });
  }

  let centres = [];

  /* re-measure on layout changes */
  function remeasure() { centres = baseCentres(dock.querySelectorAll('.dock-icon')); }
  remeasure();
  const ro = new ResizeObserver(remeasure);
  ro.observe(dock);

  dock.addEventListener('mousemove', (e) => {
    const icons = dock.querySelectorAll('.dock-icon');
    const dockRect = dock.getBoundingClientRect();
    const mx = e.clientX - dockRect.left; // cursor X relative to dock
    const scales = [];

    /* 1. Compute Gaussian scale for each icon */
    icons.forEach((ic, i) => {
      const d = Math.abs(mx - centres[i]);
      if (d >= RANGE) { scales.push(1); return; }
      const t = Math.exp(-(d * d) / (2 * SIGMA * SIGMA)); // Gaussian 0→1
      scales.push(1 + t * (SCALE_MAX - 1));
    });

    /* 2. Compute horizontal spread offset — each icon is pushed left/right
          by the extra height of its neighbours (parabolic look). */
    const gaps = [];
    for (let i = 0; i < icons.length; i++) {
      let leftPush = 0, rightPush = 0;
      // neighbours to the left push this icon right
      for (let j = 0; j < i; j++) leftPush += (scales[j] - 1) * 28;
      // neighbours to the right push this icon left
      for (let j = i + 1; j < icons.length; j++) rightPush += (scales[j] - 1) * 28;
      gaps.push(rightPush - leftPush); // positive = shift right
    }

    /* 3. Apply transforms */
    icons.forEach((ic, i) => {
      ic.style.transform = `translateX(${gaps[i].toFixed(1)}px) scale(${scales[i].toFixed(3)})`;
      ic.style.zIndex = Math.round(scales[i] * 10);
    });
  });

  dock.addEventListener('mouseleave', () => {
    const icons = dock.querySelectorAll('.dock-icon');
    icons.forEach((ic) => {
      ic.style.transition = 'transform 0.22s cubic-bezier(0.25, 0.1, 0.25, 1)';
      ic.style.transform = '';
      ic.style.zIndex = '';
    });
    setTimeout(() => icons.forEach((ic) => { ic.style.transition = ''; }), 240);
  });
}

/* ---- dock tooltip on hover ---- */
let _dockTooltip = null;
document.addEventListener('mouseover', (e) => {
  const di = e.target.closest('.dock-item');
  if (!di) { if (_dockTooltip) { _dockTooltip.remove(); _dockTooltip = null; } return; }
  const name = di.dataset.app && APPS[di.dataset.app] ? APPS[di.dataset.app].name : di.getAttribute('aria-label') || '';
  if (!name) return;
  if (!_dockTooltip) {
    _dockTooltip = document.createElement('div');
    _dockTooltip.className = 'dock-tooltip';
    document.body.appendChild(_dockTooltip);
  }
  _dockTooltip.textContent = name;
  const r = di.getBoundingClientRect();
  _dockTooltip.style.left = r.left + r.width / 2 + 'px';
  _dockTooltip.style.top = (r.top - 8) + 'px';
  _dockTooltip.style.opacity = '1';
});
document.addEventListener('mouseout', (e) => {
  const di = e.target.closest('.dock-item');
  if (di && _dockTooltip) { _dockTooltip.style.opacity = '0'; }
});

function bounceDockIcon(appId) {
  const ic = document.querySelector(`.dock-item[data-app="${appId}"] .dock-icon`);
  if (!ic) return;
  ic.classList.remove('bounce');
  void ic.offsetWidth;
  ic.classList.add('bounce');
  // Reset magnification transforms so bounce isn't offset
  ic.style.transform = '';
  ic.style.zIndex = '';
  setTimeout(() => ic.classList.remove('bounce'), 780);
}

/* =========================================================
   6. MENUBAR + MENUS
   ========================================================= */

const MENUS = {
  apple: [
    { label: 'About Nebula', action: 'about' },
    'sep',
    { label: 'Sleep', action: 'sleep', shortcut: '⌥⌘⏻' },
    { label: 'Restart…', action: 'restart' },
    'sep',
    { label: 'Lock Screen', action: 'lock', shortcut: '⌃⌘Q' },
  ],
  app: [
    { label: 'About Nebula', action: 'about' },
    'sep',
    { label: 'Settings…', shortcut: '⌘,', action: 'about' },
    'sep',
    { label: 'Quit Nebula', shortcut: '⌘Q', action: 'quit' },
  ],
  file: [
    { label: 'New Note', shortcut: '⌘N', action: 'open:notes' },
    { label: 'New Snake Game', shortcut: '⌘⇧N', action: 'open:snake' },
    'sep',
    { label: 'Close Window', shortcut: '⌘W', action: 'close' },
  ],
  edit: [
    { label: 'Undo', shortcut: '⌘Z', disabled: true },
    { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
    'sep',
    { label: 'Cut', shortcut: '⌘X', disabled: true },
    { label: 'Copy', shortcut: '⌘C', disabled: true },
    { label: 'Paste', shortcut: '⌘V', disabled: true },
    'sep',
    { label: 'Select All', shortcut: '⌘A', disabled: true },
  ],
  view: [
    { label: 'Change Wallpaper…', action: 'wallpaper' },
    { label: 'Next Wallpaper', shortcut: '⌥⌘→', action: 'wallpaper:next' },
    'sep',
    { label: 'Show Desktop Icons', checked: () => UI.showIcons, action: 'toggle:icons' },
    { label: 'Show Dock', checked: () => UI.showDock, action: 'toggle:dock' },
    'sep',
    { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: 'fullscreen' },
    'sep',
    { label: 'Launchpad', shortcut: 'F4', action: 'launchpad' },
    { label: 'Mission Control', shortcut: '⌃↑', action: 'mc' },
  ],
  window: [
    { label: 'Minimize', shortcut: '⌘M', action: 'minimize' },
    { label: 'Zoom', action: 'maximize' },
    'sep',
    { label: 'Close', shortcut: '⌘W', action: 'close' },
  ],
  help: [
    { label: 'Devlogs', action: 'open:devlog' },
    { label: 'About Nebula', action: 'about' },
    'sep',
    { label: 'Built with vanilla HTML / CSS / JS', disabled: true },
  ],
};

let openMenuKey = null;

function buildMenus() {
  const drop = document.getElementById('menu-drop');

  document.querySelectorAll('.menu-item').forEach((item) => {
    const key = item.dataset.menu;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (openMenuKey === key) closeMenus();
      else openMenu(key, item);
    });
    // Once a menu is open, hovering another menu item switches to it.
    item.addEventListener('mouseenter', () => {
      if (openMenuKey && openMenuKey !== key) openMenu(key, item);
    });
  });

  drop.addEventListener('click', (e) => {
    const btn = e.target.closest('.md-item');
    if (!btn || btn.disabled) return;
    runMenuAction(btn.dataset.action);
  });
}

function openMenu(key, item) {
  openMenuKey = key;
  document.querySelectorAll('.menu-item').forEach((m) => m.classList.toggle('open', m === item));

  const drop = document.getElementById('menu-drop');
  drop.innerHTML = (MENUS[key] || []).map((d) => {
    if (d === 'sep') return '<div class="md-sep"></div>';
    const checked = typeof d.checked === 'function' ? d.checked() : d.checked;
    return `
      <button class="md-item${d.disabled ? ' disabled' : ''}" data-action="${d.action || ''}" ${d.disabled ? 'disabled' : ''}>
        ${checked ? '<span class="md-check">✓</span>' : ''}
        <span>${d.label}</span>
        ${d.shortcut ? `<span class="md-shortcut">${d.shortcut}</span>` : ''}
      </button>`;
  }).join('');
  drop.hidden = false;

  const r = item.getBoundingClientRect();
  drop.style.left = Math.min(r.left, window.innerWidth - drop.offsetWidth - 4) + 'px';
  drop.style.top = r.bottom + 3 + 'px';
}

function closeMenus() {
  openMenuKey = null;
  document.querySelectorAll('.menu-item').forEach((m) => m.classList.remove('open'));
  document.getElementById('menu-drop').hidden = true;
}

function runMenuAction(action) {
  if (!action) return;
  closeMenus();

  if (action.startsWith('open:')) { openWindow(action.slice(5)); return; }

  const f = focusedState();
  switch (action) {
    case 'about': openWindow('system'); break;
    case 'sleep':
    case 'lock': goSleep(); break;
    case 'restart': restartOS(); break;
    case 'quit':
    case 'close': if (f) closeWindow(f.id); break;
    case 'minimize': if (f) toggleMinimize(f.id); break;
    case 'maximize': if (f) toggleMaximize(f.id); break;
    case 'wallpaper': openWallpaperPicker(); break;
    case 'wallpaper:next': nextWallpaper(); break;
    case 'toggle:icons':
      UI.showIcons = !UI.showIcons;
      document.getElementById('icons').style.display = UI.showIcons ? '' : 'none';
      break;
    case 'toggle:dock':
      UI.showDock = !UI.showDock;
      dockEl().style.display = UI.showDock ? '' : 'none';
      break;
    case 'fullscreen':
      document.documentElement.requestFullscreen?.().catch(() => {});
      break;
    case 'launchpad': toggleLaunchpad(); break;
    case 'mc': toggleMissionControl(); break;
  }
}

/* ---- clock + battery ---- */

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  document.getElementById('mb-clock').textContent = `${date}  ${time}`;
}

function updateBattery() {
  const seed = Math.floor(Date.now() / 600000) % 10;
  document.getElementById('mb-battery').title = `Battery: ${98 - seed}%`;
}

/* =========================================================
   7. SPOTLIGHT
   ========================================================= */

// Built fresh each time Spotlight opens so your files show up too.
function getSPSources() {
  return [
    ...Object.entries(APPS).map(([id, a]) => ({ id, name: a.name, icon: ICONS[id] ? ICONS[id]() : a.icon, kind: 'App', type: 'app' })),
    ...Object.entries(WALLPAPERS).map(([id, w]) => ({ id, name: w.name, icon: '🖼️', kind: 'Wallpaper', type: 'wall' })),
    { id: 'sleep', name: 'Sleep', icon: '🔒', kind: 'Action', type: 'action' },
    { id: 'lock', name: 'Lock Screen', icon: '🔐', kind: 'Action', type: 'action' },
    { id: 'restart', name: 'Restart', icon: '⏻', kind: 'Action', type: 'action' },
    ...Object.values(fsData.files)
      .filter((f) => !fsData.trash.includes(f.id))
      .map((f) => ({ id: 'file:' + f.id, name: f.name, icon: fsFileIcon(f.kind), kind: 'File', type: 'file' })),
  ];
}

let spActive = 0;
let spItems = [];

function toggleSpotlight(force) {
  const sp = document.getElementById('spotlight');
  const show = force !== undefined ? force : sp.hidden;
  sp.hidden = !show;
  if (show) {
    document.getElementById('sp-input').value = '';
    renderSpotlight('');
    setTimeout(() => document.getElementById('sp-input').focus(), 20);
  }
}

function renderSpotlight(q) {
  const results = document.getElementById('sp-results');
  const input = q.trim().toLowerCase();
  spItems = input ? getSPSources().filter((s) =>
    s.name.toLowerCase().includes(input) || s.kind.toLowerCase().includes(input)
  ) : [];
  spActive = 0;

  if (!spItems.length) {
    results.innerHTML = '<div class="sp-item" style="color:rgba(255,255,255,0.4);cursor:default">' +
      (input ? 'No results for "' + q.trim() + '"' : 'Type to search apps, wallpapers & actions') + '</div>';
    return;
  }

  results.innerHTML = spItems.map((s, i) => `
    <button class="sp-item${i === 0 ? ' active' : ''}" data-i="${i}">
      <span class="sp-ico">${s.icon}</span>
      <span>${s.name}</span>
      <span class="sp-kind">${s.kind}</span>
    </button>
  `).join('');

  results.querySelectorAll('.sp-item[data-i]').forEach((b) => {
    b.addEventListener('click', () => runSpotlight(spItems[+b.dataset.i]));
    b.addEventListener('mousemove', () => setSpActive(+b.dataset.i));
  });
}

function setSpActive(i) {
  spActive = clamp(i, 0, spItems.length - 1);
  document.querySelectorAll('#sp-results .sp-item[data-i]').forEach((b) => {
    b.classList.toggle('active', +b.dataset.i === spActive);
  });
}

function runSpotlight(item) {
  if (!item) return;
  toggleSpotlight(false);
  if (item.type === 'app') openWindow(item.id);
  else if (item.type === 'wall') setWallpaper(item.id);
  else if (item.type === 'file') openFinderAt(item.id.slice(5));
  else if (item.id === 'sleep' || item.id === 'lock') goSleep();
  else if (item.id === 'restart') restartOS();
}

function buildSpotlight() {
  const input = document.getElementById('sp-input');
  const sp = document.getElementById('spotlight');
  // Clicking the dimmed backdrop (outside the box) closes Spotlight.
  sp.addEventListener('click', (e) => {
    if (e.target === sp) toggleSpotlight(false);
  });
  input.addEventListener('input', () => renderSpotlight(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSpActive(spActive + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSpActive(spActive - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); runSpotlight(spItems[spActive]); }
    else if (e.key === 'Escape') { e.preventDefault(); toggleSpotlight(false); }
  });
}

/* =========================================================
   7.5 LAUNCHPAD + MISSION CONTROL
   ========================================================= */

const lpEl = () => document.getElementById('launchpad');
const mcEl = () => document.getElementById('mc');

/* ---- Launchpad ---- */

function toggleLaunchpad(force) {
  const lp = lpEl();
  const show = force !== undefined ? force : lp.hidden;
  lp.hidden = !show;
  if (show) {
    const input = document.getElementById('lp-search');
    input.value = '';
    renderLaunchpad('');
    setTimeout(() => input.focus(), 20);
  }
}

function renderLaunchpad(q) {
  const query = q.trim().toLowerCase();
  const grid = document.getElementById('lp-grid');
  const list = Object.entries(APPS).filter(([id, a]) => {
    if (id === 'trash') return false; // Trash doesn't live in Launchpad
    return !query || a.name.toLowerCase().includes(query);
  });
  grid.innerHTML = list.map(([id, a]) => `
    <button class="lp-app" data-app="${id}">
      <span class="lp-icon">${ICONS[id] ? ICONS[id]() : a.icon}</span>
      <span class="lp-name">${a.name}</span>
    </button>`).join('');
  grid.querySelectorAll('[data-app]').forEach((b) => {
    b.addEventListener('click', () => {
      toggleLaunchpad(false);
      openWindow(b.dataset.app);
    });
  });
}

function buildLaunchpad() {
  const input = document.getElementById('lp-search');
  input.addEventListener('input', () => renderLaunchpad(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); toggleLaunchpad(false); }
  });
  lpEl().addEventListener('click', (e) => {
    if (e.target === lpEl()) toggleLaunchpad(false);
  });
}

/* ---- Mission Control ---- */

function toggleMissionControl(force) {
  const mc = mcEl();
  const show = force !== undefined ? force : mc.hidden;
  mc.hidden = !show;
  if (show) renderMissionControl();
}

function renderMissionControl() {
  const grid = document.getElementById('mc-grid');
  const list = [...windows.values()].filter((w) => !w.minimized);
  if (!list.length) {
    grid.innerHTML = '<div class="mc-empty">no windows open — open an app from the dock</div>';
    return;
  }
  const cardW = list.length <= 2 ? 320 : list.length <= 4 ? 250 : 210;
  grid.innerHTML = '';
  list.forEach((w) => {
    const card = document.createElement('div');
    card.className = 'mc-card';
    const thumb = document.createElement('div');
    thumb.className = 'mc-thumb';
    const scale = cardW / Math.max(w.w, 1);
    const clone = w.el.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.remove('focused');
    clone.style.animation = 'none'; // no re-entrance animation inside the card
    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.transform = `scale(${scale.toFixed(4)})`;
    clone.style.transformOrigin = 'top left';
    clone.style.width = w.w + 'px';
    clone.style.height = w.h + 'px';
    thumb.appendChild(clone);
    thumb.style.width = Math.round(w.w * scale) + 'px';
    thumb.style.height = Math.round(w.h * scale) + 'px';
    card.appendChild(thumb);
    const label = document.createElement('div');
    label.className = 'mc-label';
    label.innerHTML = `<span class="mc-ico">${ICONS[w.appId] ? ICONS[w.appId]() : ''}</span><span>${APPS[w.appId].name}</span>`;
    card.appendChild(label);
    card.addEventListener('click', () => {
      toggleMissionControl(false);
      focusWindow(w.id);
    });
    grid.appendChild(card);
  });
}

/* =========================================================
   8. CONTROL CENTER
   ========================================================= */

const ccEl = () => document.getElementById('cc');

function buildCC() {
  // connectivity toggles
  [document.getElementById('cc-wifi'), document.getElementById('cc-bt')].forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('on');
      btn.querySelector('.cc-state').textContent = btn.classList.contains('on') ? 'On' : 'Off';
    });
  });

  // brightness
  const bright = document.getElementById('cc-bright');
  bright.value = parseInt(localStorage.getItem(KEYS.bright) || '100', 10);
  bright.addEventListener('input', () => setBrightness(+bright.value));

  // volume — wired to the Web Audio engine's master gain
  const vol = document.getElementById('cc-vol');
  const volVal = document.getElementById('cc-vol-val');
  vol.value = audioEngine.vol;
  volVal.textContent = audioEngine.vol + '%';
  vol.addEventListener('input', () => {
    volVal.textContent = vol.value + '%';
    audioEngine.setVolume(+vol.value);
  });

  document.getElementById('cc-sleep').addEventListener('click', () => { closeCC(); goSleep(); });
  document.getElementById('cc-lock').addEventListener('click', () => { closeCC(); goSleep(); });
  document.getElementById('cc-restart').addEventListener('click', () => { closeCC(); restartOS(); });

  buildCCWalls();
}

function buildCCWalls() {
  const wrap = document.getElementById('cc-wall');
  wrap.innerHTML = '';
  Object.entries(WALLPAPERS).forEach(([id, w]) => {
    const b = document.createElement('button');
    b.className = 'cc-swatch' + (id === currentWallpaper ? ' on' : '');
    b.style.background = w.css;
    b.title = w.name;
    b.addEventListener('click', (e) => {
      // stopPropagation: re-rendering the swatches detaches the target mid-bubble,
      // which would otherwise make the global click handler close the panel.
      e.stopPropagation();
      setWallpaper(id);
      buildCCWalls();
    });
    wrap.appendChild(b);
  });
}

function setBrightness(v) {
  localStorage.setItem(KEYS.bright, String(v));
  document.getElementById('wallpaper').style.filter = `brightness(${v / 100})`;
}

function toggleCC(force) {
  const show = force !== undefined ? force : ccEl().hidden;
  ccEl().hidden = !show;
}

function closeCC() { ccEl().hidden = true; }

/* =========================================================
   9. SLEEP / LOCK SCREEN
   ========================================================= */

let sleepTimer = null;

function goSleep() {
  closeMenus();
  closeCC();
  closeContextMenu();
  toggleSpotlight(false);
  musicPlayer.pause(); // like a real machine, the music stops when it sleeps
  document.body.classList.add('asleep');
  const s = document.getElementById('sleep-screen');
  s.hidden = false;
  updateSleepClock();
  if (!sleepTimer) sleepTimer = setInterval(updateSleepClock, 1000);
}

function wake() {
  document.body.classList.remove('asleep');
  document.getElementById('sleep-screen').hidden = true;
  if (sleepTimer) { clearInterval(sleepTimer); sleepTimer = null; }
}

function updateSleepClock() {
  const now = new Date();
  document.getElementById('sleep-time').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sleep-date').textContent =
    now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

/* =========================================================
   10. CONTEXT MENU (wallpapers)
   ========================================================= */

const ctxMenu = () => document.getElementById('context-menu');
let currentWallpaper = localStorage.getItem(KEYS.wallpaper) || 'sequoia';

function openContextMenu(x, y) {
  const menu = ctxMenu();
  menu.innerHTML = `
    <div class="ctx-title">Change Desktop Background</div>
    ${Object.entries(WALLPAPERS).map(([id, w]) => `
      <button class="ctx-item" data-wall="${id}">
        <span>${wallpaperSwatch(id)}</span>
        <span>${w.name}</span>
        ${id === currentWallpaper ? '<span class="ctx-check">✓</span>' : ''}
      </button>
    `).join('')}
    <div class="ctx-title">System</div>
    <button class="ctx-item" data-action="about">🪐 About Nebula</button>
  `;

  menu.hidden = false;
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  menu.style.left = clamp(x, 8, window.innerWidth - mw - 8) + 'px';
  menu.style.top = clamp(y, MENUBAR_H + 8, window.innerHeight - mh - 8) + 'px';

  menu.querySelectorAll('[data-wall]').forEach((b) => {
    b.addEventListener('click', () => {
      setWallpaper(b.dataset.wall);
      closeContextMenu();
    });
  });
  menu.querySelector('[data-action="about"]').addEventListener('click', () => {
    closeContextMenu();
    openWindow('system');
  });
}

function wallpaperSwatch(id) {
  const w = WALLPAPERS[id];
  return `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${w.css};border:1px solid rgba(255,255,255,0.3)"></span>`;
}

function openWallpaperPicker() {
  openContextMenu(Math.round(window.innerWidth / 2 - 105), Math.round(window.innerHeight / 2 - 130));
}

function closeContextMenu() {
  ctxMenu().hidden = true;
}

function setWallpaper(id) {
  if (!WALLPAPERS[id]) return;
  currentWallpaper = id;
  localStorage.setItem(KEYS.wallpaper, id);
  document.getElementById('wallpaper').style.background = WALLPAPERS[id].css;
  buildCCWalls();
}

function nextWallpaper() {
  const keys = Object.keys(WALLPAPERS);
  const i = keys.indexOf(currentWallpaper);
  setWallpaper(keys[(i + 1) % keys.length]);
}

/* =========================================================
   11. APPS
   ========================================================= */

/* ---- Notes: autosaves to localStorage ---- */

function openNotes(state, body) {
  body.innerHTML = `
    <div class="notes-toolbar">
      <span>Untitled note · saved in your browser</span>
      <span class="notes-saved" id="notes-saved">saved ✓</span>
    </div>
    <textarea class="notes-area" id="notes-area" placeholder="Write something… it saves automatically!"></textarea>
  `;
  const ta = body.querySelector('#notes-area');
  const saved = body.querySelector('#notes-saved');
  ta.value = localStorage.getItem(KEYS.notes) || '';

  let fadeTimer = null;
  ta.addEventListener('input', () => {
    try { localStorage.setItem(KEYS.notes, ta.value); } catch (e) { /* ignore */ }
    saved.classList.remove('faded');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => saved.classList.add('faded'), 1200);
  });

  setTimeout(() => ta.focus(), 80);
}

/* ---- Calculator ---- */

function openCalc(state, body) {
  body.innerHTML = `
    <div class="calc-wrap">
      <div class="calc-display" id="calc-display">0</div>
      <div class="calc-grid" id="calc-grid"></div>
    </div>
  `;

  const display = body.querySelector('#calc-display');
  const grid = body.querySelector('#calc-grid');

  let expr = '';
  let justEvaluated = false;

  const buttons = [
    ['C', 'fn'], ['(', 'fn'], [')', 'fn'], ['⌫', 'fn'],
    ['7', 'num'], ['8', 'num'], ['9', 'num'], ['÷', 'op'],
    ['4', 'num'], ['5', 'num'], ['6', 'num'], ['×', 'op'],
    ['1', 'num'], ['2', 'num'], ['3', 'num'], ['−', 'op'],
    ['0', 'num'], ['.', 'num'], ['=', 'eq'], ['+', 'op'],
  ];

  buttons.forEach(([label, kind]) => {
    const b = document.createElement('button');
    b.className = 'calc-btn ' + (kind === 'op' ? 'op' : kind === 'fn' ? 'fn' : kind === 'eq' ? 'eq' : '');
    b.textContent = label;
    b.addEventListener('click', () => press(label));
    grid.appendChild(b);
  });

  function render() {
    display.classList.remove('error');
    display.textContent = expr === '' ? '0' : expr;
  }

  function press(key) {
    display.classList.remove('error');
    if (key === 'C') {
      expr = '';
    } else if (key === '⌫') {
      expr = expr.slice(0, -1);
    } else if (key === '=') {
      const result = safeEval(expr);
      if (result === null) {
        display.classList.add('error');
        display.textContent = 'Error';
        return;
      }
      expr = String(result);
      justEvaluated = true;
    } else if (key === '.') {
      if (justEvaluated) { expr = '0.'; justEvaluated = false; }
      else expr += '.';
    } else if (['+', '−', '×', '÷'].includes(key)) {
      if (justEvaluated) justEvaluated = false;
      if (['+', '−', '×', '÷'].includes(expr.slice(-1))) expr = expr.slice(0, -1);
      expr += key;
    } else {
      if (justEvaluated) { expr = ''; justEvaluated = false; }
      expr += key;
    }
    render();
  }

  function safeEval(s) {
    const cleaned = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!/^[0-9+\-*/().\s]*$/.test(cleaned)) return null;
    if (cleaned === '' || /[+\-*/.]$/.test(cleaned)) return null;
    try {
      const v = Function('"use strict"; return (' + cleaned + ')')();
      if (typeof v !== 'number' || !isFinite(v)) return null;
      return Math.round(v * 1e10) / 1e10;
    } catch (e) {
      return null;
    }
  }
}

/* ---- Snake: the bonus game (not in the guide!) ---- */

function openSnake(state, body) {
  const GRID = 20;
  const CELL = 16;
  const SIZE = GRID * CELL;

  body.innerHTML = `
    <div class="snake-wrap">
      <div class="snake-score">
        <span>Score: <b id="snake-score">0</b></span>
        <span>Best: <b id="snake-best">0</b></span>
      </div>
      <div class="snake-stage">
        <canvas id="snake-canvas" width="${SIZE}" height="${SIZE}"></canvas>
        <div class="snake-overlay" id="snake-overlay">
          <div class="overlay-title">🐍 Snake</div>
          <div class="overlay-hint">arrow keys / WASD to move<br>eat the stars, don't hit yourself!</div>
          <button class="play-btn" id="snake-play">Play</button>
        </div>
      </div>
    </div>
  `;

  const canvas = body.querySelector('#snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = body.querySelector('#snake-score');
  const bestEl = body.querySelector('#snake-best');
  const overlay = body.querySelector('#snake-overlay');
  const playBtn = body.querySelector('#snake-play');

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = null;
  let score = 0;
  let alive = false;
  let timer = null;

  const best = () => parseInt(localStorage.getItem(KEYS.best) || '0', 10);
  bestEl.textContent = best();

  function randCell() {
    return {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  }

  function spawnFood() {
    let c;
    do {
      c = randCell();
    } while (snake.some((s) => s.x === c.x && s.y === c.y));
    food = c;
  }

  function start() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    alive = true;
    scoreEl.textContent = '0';
    overlay.classList.add('hidden');
    spawnFood();
    draw();
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 130);
  }

  function gameOver() {
    alive = false;
    clearInterval(timer);
    timer = null;
    if (score > best()) {
      localStorage.setItem(KEYS.best, String(score));
      bestEl.textContent = score;
    }
    overlay.querySelector('.overlay-title').textContent = '💀 Game over';
    overlay.querySelector('.overlay-hint').innerHTML =
      `you scored <b>${score}</b> — best: <b>${best()}</b><br>press any arrow key to try again`;
    overlay.classList.remove('hidden');
  }

  function tick() {
    dir = nextDir;
    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
    const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      spawnFood();
      clearInterval(timer);
      timer = setInterval(tick, Math.max(60, 130 - score * 3));
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.fillStyle = '#0a0d1a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    ctx.fillStyle = '#ff6ec7';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.32, 0, Math.PI * 2);
    ctx.fill();

    snake.forEach((seg, i) => {
      const t = i / Math.max(snake.length - 1, 1);
      ctx.fillStyle = i === 0 ? '#3ee0c7' : `rgb(${Math.round(60 + t * 30)}, ${Math.round(224 - t * 60)}, ${Math.round(199 - t * 40)})`;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });

    ctx.fillStyle = '#0a0d1a';
    const hx = snake[0].x * CELL, hy = snake[0].y * CELL;
    ctx.fillRect(hx + CELL * 0.28, hy + CELL * 0.28, 3, 3);
    ctx.fillRect(hx + CELL * 0.62, hy + CELL * 0.28, 3, 3);
  }

  function handleKey(e) {
    const k = e.key.toLowerCase();
    const map = {
      arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    };
    const want = map[k];
    if (!want) return;
    e.preventDefault();

    if (want.x === -dir.x && want.y === -dir.y) return;

    if (!alive) {
      start();
      return;
    }
    nextDir = want;
  }

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    start();
  });

  snakeKeyHandler = handleKey;
}

/* ---- Devlogs: the journey so far ---- */

function openDevlogs(state, body) {
  body.innerHTML = `
    <div class="devlog-list">
      ${DEVLOGS.map((d) => `
        <article class="devlog-entry">
          <div class="devlog-meta">
            <span class="devlog-date">${d.date}</span>
            <span class="devlog-tag">${d.tag}</span>
          </div>
          <div class="devlog-title">${d.title}</div>
          <div class="devlog-body">${d.body}</div>
        </article>
      `).join('')}
    </div>
  `;
}

/* ---- About (About This Mac style) ---- */

function openAbout(state, body) {
  body.innerHTML = `
    <div class="about-wrap">
      <div class="about-hero">
        <span class="hero-logo">${ICONS.system()}</span>
        <div class="hero-name">${OS.name}</div>
        <div class="hero-sub">Version ${OS.version} (${OS.codename})</div>
        <div class="about-chip">Nebula Chip · 8-Core · 16 GB</div>
      </div>
      <table class="sys-table">
        <tr><td>User</td><td>${OS.user}</td></tr>
        <tr><td>Password</td><td>none — open for everyone ✌️</td></tr>
        <tr><td>Session uptime</td><td id="about-uptime">0s</td></tr>
        <tr><td>Browser</td><td id="about-browser">—</td></tr>
        <tr><td>Storage used</td><td id="about-storage">…</td></tr>
        <tr><td>Built with</td><td>vanilla HTML · CSS · JS</td></tr>
        <tr><td>Made with</td><td>❤️ by <b>Muhammad Saleh</b></td></tr>
      </table>
      <div class="about-actions">
        <button class="about-btn primary" id="about-restart">⏻ Restart</button>
        <button class="about-btn" id="about-wall">🖼️ Wallpaper</button>
      </div>
    </div>
  `;

  body.querySelector('#about-browser').textContent =
    navigator.userAgent.match(/(Chrome|Firefox|Safari|Edg)\/?\s?([\d.]+)/)?.[0] || navigator.userAgent.slice(0, 40);

  const bootTime = window.__bootTime;
  const updateUptime = () => {
    const el = body.querySelector('#about-uptime');
    if (!el) return;
    const s = Math.floor((Date.now() - bootTime) / 1000);
    el.textContent = fmtUptime(s);
  };
  updateUptime();
  const iv = setInterval(updateUptime, 1000);
  state.onCleanup = () => clearInterval(iv);

  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((est) => {
      const el = body.querySelector('#about-storage');
      if (!el) return;
      const used = (est.usage / 1024 / 1024).toFixed(2);
      const quota = (est.quota / 1024 / 1024 / 1024).toFixed(2);
      el.textContent = `${used} MB / ${quota} GB`;
    });
  }

  body.querySelector('#about-restart').addEventListener('click', restartOS);
  body.querySelector('#about-wall').addEventListener('click', () => {
    closeWindow(state.id);
    openWallpaperPicker();
  });
}

/* =========================================================
   11.5 FINDER — a real, persistent file system
   ---------------------------------------------------------
   Folders & files live in localStorage (nebula.fs). Create,
   rename and delete folders; deleted items go to the Trash
   app where they can be restored or emptied for good.
   ========================================================= */

let fsData = loadFS();
const fsWindows = new Set();   // open Finder window bodies
const trashWindows = new Set(); // open Trash window bodies
let fsCurrent = 'root';
const fsHist = { back: [], fwd: [] };

const FS_FAVORITES = [
  { id: 'root', name: 'Home',     icon: '🏠' },
  { id: 'desk', name: 'Desktop',  icon: '🖥️' },
  { id: 'docs', name: 'Documents', icon: '📄' },
  { id: 'down', name: 'Downloads', icon: '⬇️' },
  { id: 'pics', name: 'Pictures',  icon: '🖼️' },
  { id: 'music', name: 'Music',   icon: '🎵' },
];

const FS_KIND_ICON = { text: '📄', sheet: '📊', pdf: '📑', zip: '🗜️', image: '🖼️', code: '💾' };
const fsFileIcon = (kind) => FS_KIND_ICON[kind] || '📄';

function defaultFS() {
  return {
    folders: {
      root: { id: 'root', name: 'Home', parent: null },
      docs: { id: 'docs', name: 'Documents', parent: 'root' },
      down: { id: 'down', name: 'Downloads', parent: 'root' },
      pics: { id: 'pics', name: 'Pictures',  parent: 'root' },
      music: { id: 'music', name: 'Music',   parent: 'root' },
      desk: { id: 'desk', name: 'Desktop',   parent: 'root' },
      proj: { id: 'proj', name: 'Nebula OS', parent: 'docs' },
    },
    files: {
      f1: { id: 'f1', name: 'welcome.txt',  parent: 'docs', kind: 'text',  size: '2 KB' },
      f2: { id: 'f2', name: 'budget.xlsx',  parent: 'docs', kind: 'sheet', size: '48 KB' },
      f3: { id: 'f3', name: 'roadmap.pdf',  parent: 'docs', kind: 'pdf',   size: '1.2 MB' },
      f4: { id: 'f4', name: 'nebula-os.zip', parent: 'down', kind: 'zip',   size: '8.4 MB' },
      f5: { id: 'f5', name: 'webos-guide.pdf', parent: 'down', kind: 'pdf', size: '3.1 MB' },
      f6: { id: 'f6', name: 'sequoia.png',  parent: 'pics', kind: 'image', size: '2.1 MB' },
      f7: { id: 'f7', name: 'devlog-final.pdf', parent: 'down', kind: 'pdf', size: '940 KB' },
      f8: { id: 'f8', name: 'notes.md',     parent: 'proj', kind: 'text',  size: '6 KB' },
      f9: { id: 'f9', name: 'index.html',   parent: 'proj', kind: 'code',  size: '18 KB' },
    },
    trash: [],
  };
}

function loadFS() {
  try {
    const raw = localStorage.getItem(KEYS.fs);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.folders && d.files && Array.isArray(d.trash)) return d;
    }
  } catch (e) { /* fall back to defaults */ }
  return defaultFS();
}

function saveFS() {
  try { localStorage.setItem(KEYS.fs, JSON.stringify(fsData)); } catch (e) { /* ignore quota */ }
}

/* ---- queries ---- */

const fsFolder = (id) => fsData.folders[id] || null;
const fsFile = (id) => fsData.files[id] || null;

function fsChildren(id) {
  return {
    folders: Object.values(fsData.folders).filter((f) => f.parent === id && !fsData.trash.includes(f.id)),
    files: Object.values(fsData.files).filter((f) => f.parent === id && !fsData.trash.includes(f.id)),
  };
}

function fsBreadcrumb(id) {
  const out = [];
  let cur = fsFolder(id);
  while (cur) { out.unshift(cur); cur = cur.parent ? fsFolder(cur.parent) : null; }
  return out;
}

function uniqueName(parent, base) {
  const taken = new Set();
  fsChildren(parent).folders.forEach((f) => taken.add(f.name.toLowerCase()));
  fsChildren(parent).files.forEach((f) => taken.add(f.name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  let i = 2;
  while (taken.has(`${base} ${i}`.toLowerCase())) i++;
  return `${base} ${i}`;
}

function fsCollect(id) {
  const out = [id];
  Object.values(fsData.folders).forEach((f) => { if (f.parent === id) out.push(...fsCollect(f.id)); });
  Object.values(fsData.files).forEach((f) => { if (f.parent === id) out.push(f.id); });
  return out;
}

/* ---- mutations ---- */

function fsNewFolder(body) {
  const id = 'fld' + Date.now().toString(36) + Math.floor(Math.random() * 99);
  fsData.folders[id] = { id, name: uniqueName(fsCurrent, 'untitled folder'), parent: fsCurrent };
  saveFS();
  fsRefresh();
  fsWindows.forEach((b) => { if (b === body) startRename(b, id); });
}

function fsRename(id, name) {
  const item = fsFolder(id) || fsFile(id);
  if (!item) return;
  const clean = name.trim().slice(0, 60);
  if (clean && clean !== item.name) item.name = uniqueName(item.parent, clean);
  saveFS();
  fsRefresh();
}

function fsMoveToTrash(id) {
  fsCollect(id).forEach((i) => { if (!fsData.trash.includes(i)) fsData.trash.push(i); });
  // If the folder you're looking at got trashed, step back out.
  if (fsData.trash.includes(fsCurrent)) {
    const p = fsFolder(fsCurrent).parent;
    fsCurrent = p && !fsData.trash.includes(p) ? p : 'root';
    fsHist.back = [];
    fsHist.fwd = [];
  }
  saveFS();
  fsRefresh();
}

function fsRestore(id) {
  // Restore the item and its whole subtree (children went to trash with it).
  fsCollect(id).filter((i) => fsData.trash.includes(i)).forEach((i) => {
    fsData.trash = fsData.trash.filter((x) => x !== i);
    const item = fsFolder(i) || fsFile(i);
    if (item && !fsFolder(item.parent)) item.parent = 'root'; // parent was deleted too
  });
  saveFS();
  fsRefresh();
}

function fsEmptyTrash() {
  fsData.trash.forEach((id) => {
    delete fsData.folders[id];
    delete fsData.files[id];
  });
  fsData.trash = [];
  saveFS();
  fsRefresh();
}

/* ---- navigation ---- */

function fsGo(id) {
  if (!fsFolder(id) || id === fsCurrent) return;
  fsHist.back.push(fsCurrent);
  fsHist.fwd = [];
  fsCurrent = id;
  fsRefresh();
}

function fsBack() {
  if (!fsHist.back.length) return;
  fsHist.fwd.push(fsCurrent);
  fsCurrent = fsHist.back.pop();
  fsRefresh();
}

function fsForward() {
  if (!fsHist.fwd.length) return;
  fsHist.back.push(fsCurrent);
  fsCurrent = fsHist.fwd.pop();
  fsRefresh();
}

function fsUp() {
  const p = fsFolder(fsCurrent).parent;
  if (p) fsGo(p);
}

function fsRefresh() {
  fsWindows.forEach((b) => renderFinder(b));
  trashWindows.forEach((b) => renderTrash(b));
  updateDockTrash();
}

function updateDockTrash() {
  const full = fsData.trash.length > 0;
  document.querySelectorAll('.dock-item[data-app="trash"] .dock-icon').forEach((ic) => {
    ic.classList.toggle('full', full);
  });
}

/* ---- Finder app UI ---- */

function openFinder(state, body) {
  body.innerHTML = `
    <div class="finder-wrap">
      <div class="finder-toolbar">
        <button class="fs-tb" id="fs-back" title="Back">‹</button>
        <button class="fs-tb" id="fs-fwd" title="Forward">›</button>
        <button class="fs-tb" id="fs-up" title="Up one level">↑</button>
        <div class="fs-crumbs" id="fs-crumbs"></div>
        <button class="fs-tb accent" id="fs-new">＋ New Folder</button>
      </div>
      <div class="finder-main">
        <div class="finder-sidebar" id="fs-sidebar"></div>
        <div class="finder-content" id="fs-content">
          <div class="fs-grid" id="fs-grid"></div>
        </div>
      </div>
      <div class="finder-status" id="fs-status"></div>
      <div class="fs-ctx" id="fs-ctx" hidden></div>
      <div class="fs-ql" id="fs-ql" hidden>
        <div class="fs-ql-card">
          <div class="fs-ql-icon" id="fs-ql-icon">📄</div>
          <div class="fs-ql-name" id="fs-ql-name"></div>
          <div class="fs-ql-meta" id="fs-ql-meta"></div>
          <button class="fs-ql-close" id="fs-ql-close">Close</button>
        </div>
      </div>
    </div>
  `;

  fsWindows.add(body);
  state.onCleanup = () => fsWindows.delete(body);
  body.fsSel = null;
  body.setAttribute('tabindex', '-1');
  body.style.outline = 'none';

  const content = body.querySelector('#fs-content');

  body.querySelector('#fs-back').addEventListener('click', fsBack);
  body.querySelector('#fs-fwd').addEventListener('click', fsForward);
  body.querySelector('#fs-up').addEventListener('click', fsUp);
  body.querySelector('#fs-new').addEventListener('click', (e) => {
    e.stopPropagation();
    fsNewFolder(body);
  });

  body.querySelector('#fs-sidebar').addEventListener('click', (e) => {
    const row = e.target.closest('.fs-side-item');
    if (!row) return;
    if (row.dataset.nav) fsGo(row.dataset.nav);
    else if (row.dataset.action === 'trash') openWindow('trash');
  });

  content.addEventListener('click', (e) => {
    closeFsMenu(body);
    const item = e.target.closest('.fs-item');
    if (item) selectFsItem(body, item.dataset.id);
    else clearFsSelection(body);
    body.focus();
  });

  content.addEventListener('dblclick', (e) => {
    const item = e.target.closest('.fs-item');
    if (!item) return;
    if (item.dataset.type === 'folder') fsGo(item.dataset.id);
    else quickLook(body, item.dataset.id);
  });

  content.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const item = e.target.closest('.fs-item');
    if (item) selectFsItem(body, item.dataset.id);
    openFsMenu(body, e, item ? { type: item.dataset.type, id: item.dataset.id } : null);
  });

  body.addEventListener('keydown', (e) => {
    if (e.target.classList && e.target.classList.contains('fs-rename')) return;
    if (e.key === 'Escape') {
      closeFsMenu(body);
      closeQuickLook(body);
      return;
    }
    const id = body.fsSel;
    if (!id) return;
    if (e.key === 'Enter') {
      if (fsFolder(id)) fsGo(id);
      else quickLook(body, id);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      fsMoveToTrash(id);
    }
  });

  body.querySelector('#fs-ql-close').addEventListener('click', () => closeQuickLook(body));
  body.querySelector('#fs-ql').addEventListener('click', (e) => {
    if (e.target.id === 'fs-ql') closeQuickLook(body);
  });

  renderFinder(body);
  body.focus();
}

function selectFsItem(body, id) {
  body.fsSel = id;
  body.querySelectorAll('.fs-item').forEach((el) => el.classList.toggle('selected', el.dataset.id === id));
}

function clearFsSelection(body) {
  body.fsSel = null;
  body.querySelectorAll('.fs-item').forEach((el) => el.classList.remove('selected'));
}

function fsItemHTML(id, type, name, icon) {
  return `
    <div class="fs-item" data-id="${id}" data-type="${type}" title="${name}">
      <div class="fs-icon">${icon}</div>
      <div class="fs-label">${name}</div>
    </div>`;
}

function renderFinder(body) {
  // breadcrumbs
  const crumbEl = body.querySelector('#fs-crumbs');
  crumbEl.innerHTML = fsBreadcrumb(fsCurrent).map((f) =>
    `<button class="fs-crumb${f.id === fsCurrent ? ' current' : ''}" data-crumb="${f.id}">${f.name}</button>`
  ).join('');
  crumbEl.querySelectorAll('[data-crumb]').forEach((b) => {
    b.addEventListener('click', (e) => { e.stopPropagation(); fsGo(b.dataset.crumb); });
  });

  body.querySelector('#fs-back').disabled = !fsHist.back.length;
  body.querySelector('#fs-fwd').disabled = !fsHist.fwd.length;
  body.querySelector('#fs-up').disabled = !fsFolder(fsCurrent).parent;

  // sidebar
  body.querySelector('#fs-sidebar').innerHTML = `
    <div class="fs-side-title">Favorites</div>
    ${FS_FAVORITES.filter((f) => fsFolder(f.id)).map((f) => `
      <button class="fs-side-item${f.id === fsCurrent ? ' current' : ''}" data-nav="${f.id}">
        <span>${f.icon}</span><span>${f.name}</span>
      </button>`).join('')}
    <div class="fs-side-sep"></div>
    <button class="fs-side-item" data-action="trash"><span>🗑️</span><span>Trash</span></button>
  `;

  // items
  const { folders, files } = fsChildren(fsCurrent);
  const grid = body.querySelector('#fs-grid');
  if (!folders.length && !files.length) {
    grid.innerHTML = '<div class="fs-empty">This folder is empty</div>';
  } else {
    grid.innerHTML = [
      ...folders.map((f) => fsItemHTML(f.id, 'folder', f.name, '📁')),
      ...files.map((f) => fsItemHTML(f.id, 'file', f.name, fsFileIcon(f.kind))),
    ].join('');
    grid.querySelectorAll('.fs-item').forEach((el) => {
      if (el.dataset.id === body.fsSel) el.classList.add('selected');
    });
  }

  const n = folders.length + files.length;
  body.querySelector('#fs-status').textContent = `${n} item${n === 1 ? '' : 's'}`;
}

/* ---- Finder context menu + rename + quick look ---- */

function openFsMenu(body, e, target) {
  const menu = body.querySelector('#fs-ctx');
  let html = '';
  if (target) {
    const isFolder = target.type === 'folder';
    html += `<button class="fs-menu-item" data-act="open">${isFolder ? 'Open' : 'Quick Look'}</button>`;
    if (!isFolder || target.id !== 'root') {
      html += `<button class="fs-menu-item" data-act="rename">Rename</button>`;
    }
    html += `<div class="fs-menu-sep"></div>`;
    html += `<button class="fs-menu-item danger" data-act="trash">Move to Trash</button>`;
  } else {
    html += `<button class="fs-menu-item" data-act="new">New Folder</button>`;
  }
  menu.innerHTML = html;
  menu.hidden = false;

  const r = body.getBoundingClientRect();
  menu.style.left = clamp(e.clientX - r.left, 8, r.width - 180) + 'px';
  menu.style.top = clamp(e.clientY - r.top, 8, r.height - 150) + 'px';

  menu.querySelectorAll('[data-act]').forEach((b) => {
    b.addEventListener('click', () => {
      const act = b.dataset.act;
      closeFsMenu(body);
      if (act === 'open') {
        if (target.type === 'folder') fsGo(target.id);
        else quickLook(body, target.id);
      } else if (act === 'rename') {
        startRename(body, target.id);
      } else if (act === 'trash') {
        fsMoveToTrash(target.id);
      } else if (act === 'new') {
        fsNewFolder(body);
      }
    });
  });
}

function closeFsMenu(body) { body.querySelector('#fs-ctx').hidden = true; }

function startRename(body, id) {
  const item = fsFolder(id) || fsFile(id);
  if (!item) return;
  const label = body.querySelector(`.fs-item[data-id="${id}"] .fs-label`);
  if (!label) return;

  const input = document.createElement('input');
  input.className = 'fs-rename';
  input.value = item.name;
  input.maxLength = 60;
  label.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const commit = () => { if (done) return; done = true; fsRename(id, input.value); };
  const cancel = () => { if (done) return; done = true; fsRefresh(); };
  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') cancel();
  });
  input.addEventListener('blur', commit);
}

function quickLook(body, id) {
  const f = fsFile(id);
  if (!f) return;
  const parent = fsFolder(f.parent);
  body.querySelector('#fs-ql-icon').textContent = fsFileIcon(f.kind);
  body.querySelector('#fs-ql-name').textContent = f.name;
  body.querySelector('#fs-ql-meta').textContent =
    `${f.kind.toUpperCase()} file · ${f.size} · ${parent ? parent.name : 'Home'}`;
  body.querySelector('#fs-ql').hidden = false;
}

function closeQuickLook(body) { body.querySelector('#fs-ql').hidden = true; }

function openFinderAt(fileId) {
  const f = fsFile(fileId);
  if (!f) return;
  fsCurrent = f.parent && !fsData.trash.includes(f.parent) ? f.parent : 'root';
  openWindow('finder');
  fsWindows.forEach((b) => { b.fsSel = fileId; renderFinder(b); });
}

/* ---- Trash app (real this time) ---- */

function trashItems() {
  return fsData.trash
    .map((id) => {
      const f = fsFolder(id);
      if (f) return { ...f, type: 'folder' };
      const fl = fsFile(id);
      if (fl) return { ...fl, type: 'file' };
      return null;
    })
    .filter(Boolean);
}

function openTrash(state, body) {
  trashWindows.add(body);
  state.onCleanup = () => trashWindows.delete(body);
  body.innerHTML = `
    <div class="trash-wrap">
      <div class="trash-head">
        <div class="trash-ico" id="trash-ico">🗑️</div>
        <div class="trash-head-info">
          <div class="trash-title">Trash</div>
          <div class="trash-sub">Items you delete are kept here</div>
        </div>
      </div>
      <div class="trash-list" id="trash-list"></div>
      <div class="trash-actions">
        <button class="trash-btn" id="trash-restore-all">Restore All</button>
        <button class="trash-btn danger" id="trash-empty">Empty Trash…</button>
      </div>
    </div>
  `;
  body.querySelector('#trash-restore-all').addEventListener('click', () => {
    [...fsData.trash].forEach((i) => fsRestore(i));
  });
  body.querySelector('#trash-empty').addEventListener('click', fsEmptyTrash);
  renderTrash(body);
}

function renderTrash(body) {
  const items = trashItems();
  const list = body.querySelector('#trash-list');
  const restoreAll = body.querySelector('#trash-restore-all');
  const empty = body.querySelector('#trash-empty');

  if (!items.length) {
    body.querySelector('#trash-ico').textContent = '🗑️';
    list.innerHTML = '<div class="trash-empty-note">Trash is empty — nothing deleted yet</div>';
    restoreAll.disabled = true;
    empty.disabled = true;
    return;
  }

  body.querySelector('#trash-ico').textContent = '🗑️';
  restoreAll.disabled = false;
  empty.disabled = false;
  list.innerHTML = items.map((it) => `
    <div class="trash-row">
      <span class="trash-row-ico">${it.type === 'folder' ? '📁' : fsFileIcon(it.kind)}</span>
      <span class="trash-row-info">
        <b>${it.name}</b>
        <i>${it.type === 'folder' ? 'Folder' : it.kind.toUpperCase() + ' file'}</i>
      </span>
      <button class="trash-row-btn" data-restore="${it.id}">Restore</button>
    </div>`).join('');
  list.querySelectorAll('[data-restore]').forEach((b) => {
    b.addEventListener('click', () => fsRestore(b.dataset.restore));
  });
}

/* =========================================================
   11.6 MUSIC — Web Audio synth engine, app & mini-player
   ---------------------------------------------------------
   No audio files anywhere: every track is synthesized live
   with the Web Audio API (oscillators + noise). A tiny
   lookahead scheduler keeps the beats in time, and the
   Control Center volume slider drives the master gain.
   ========================================================= */

const NOTE_FREQ = {};
{
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  for (let oct = 0; oct <= 8; oct++) {
    names.forEach((n, i) => {
      NOTE_FREQ[n + oct] = 440 * Math.pow(2, ((oct + 1) * 12 + i - 69) / 12);
    });
  }
}

// Tracks: melody & bass are 8th-note strings over a 2-bar (16 step) loop;
// '.' is a rest. Kicks land on every 4th step, hats on every off-beat,
// so any pattern you write here will sound musical.
const TRACKS = [
  { id: 'neon',     title: 'Neon Nights',   artist: 'Nebula Synth',  icon: '🎹', bpm: 112, loops: 8,
    melody: 'D5 F5 A5 F5 D5 F5 A5 F5 C5 E5 G5 E5 D5 F5 A5 .',
    bass:   'D2 . D2 . D2 . D2 . C2 . C2 . C2 . C2 .' },
  { id: 'midnight', title: 'Midnight Drive', artist: 'The Orbits',   icon: '🌃', bpm: 96, loops: 8,
    melody: 'A4 . E5 . A5 E5 . E5 . D5 . E5 . C5 . B4 .',
    bass:   'A1 . A1 . A1 . A1 . F1 . F1 . G1 . G1 .' },
  { id: 'stardust', title: 'Stardust',      artist: 'Nebula Synth',  icon: '✨', bpm: 90, loops: 8,
    melody: 'E5 G5 C6 G5 E5 G5 C6 G5 D5 F5 A5 F5 D5 F5 A5 .',
    bass:   'C2 . G2 . C2 . G2 . F2 . F2 . G2 . G2 .' },
  { id: 'funk',     title: 'Cosmic Funk',   artist: 'The Orbits',    icon: '🕺', bpm: 118, loops: 8,
    melody: 'E4 G4 B4 G4 E4 G4 B4 G4 D4 F#4 A4 F#4 E4 G4 B4 G4',
    bass:   'E1 . E1 . E1 . E1 . D1 . D1 . B1 . B1 .' },
  { id: 'deep',     title: 'Deep Space',    artist: 'Signal Lost',   icon: '🌌', bpm: 74, loops: 6,
    melody: 'D4 A4 D5 . A4 D5 F5 . E5 D5 B4 . A4 . . .',
    bass:   'D2 . D2 . D2 . D2 . B1 . B1 . A1 . A1 .' },
  { id: 'sunrise',  title: 'Sunrise',       artist: 'Nebula Synth',  icon: '🌅', bpm: 104, loops: 8,
    melody: 'B4 D5 G5 D5 B4 D5 G5 D5 A4 C5 E5 C5 A4 C5 E5 .',
    bass:   'G1 . G1 . G1 . G1 . C2 . C2 . D2 . D2 .' },
].map((t) => {
  const mel = parseSeq(t.melody);
  const bas = parseSeq(t.bass);
  return { ...t, steps: mel.map((m, i) => ({ m, b: bas[i] || null })), stepDur: 60 / t.bpm / 2 };
});

function parseSeq(str) {
  return str.trim().split(/\s+/).map((tok) => (tok === '.' ? null : NOTE_FREQ[tok]));
}

const trackDur = (t) => t.steps.length * t.stepDur * t.loops;

/* ---- shared audio context + master gain ---- */

const audioEngine = {
  ctx: null,
  master: null,
  noise: null,
  vol: parseInt(localStorage.getItem(KEYS.vol) || '70', 10),
  muted: false,

  ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return; // no Web Audio in this browser — music stays silent
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.vol / 100;
    this.master.connect(this.ctx.destination);
    // 1 second of white noise, reused for every hi-hat
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
  },

  resume() {
    this.ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  setVolume(v) {
    this.vol = clamp(v, 0, 100);
    try { localStorage.setItem(KEYS.vol, String(this.vol)); } catch (e) { /* ignore */ }
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.vol / 100, this.ctx.currentTime, 0.02);
    }
    const slider = document.getElementById('cc-vol');
    if (slider) { slider.value = this.vol; document.getElementById('cc-vol-val').textContent = this.vol + '%'; }
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.vol / 100, this.ctx.currentTime, 0.02);
    }
    renderMini();
  },
};

/* ---- the player: queue, transport + lookahead scheduler ---- */

const musicPlayer = {
  track: null,
  queue: [...TRACKS],
  index: 0,
  playing: false,
  shuffle: false,
  repeat: false,
  timer: null,
  step: 0,
  nextTime: 0,
  startTime: 0,
  scheduled: [],

  elapsed() {
    if (!this.track || !audioEngine.ctx) return 0;
    return Math.max(0, audioEngine.ctx.currentTime - this.startTime);
  },

  playIndex(i) {
    audioEngine.resume();
    miniVisible = true; // starting a track re-shows the mini player
    this.flush();
    this.index = clamp(i, 0, this.queue.length - 1);
    this.track = this.queue[this.index];
    this.step = 0;
    this.startTime = audioEngine.ctx.currentTime + 0.05;
    this.nextTime = this.startTime;
    this.playing = true;
    this.startTimer();
    renderAllMusic();
  },

  playTrack(id) {
    const i = this.queue.findIndex((t) => t.id === id);
    if (i >= 0) this.playIndex(i);
  },

  toggle() {
    if (!this.track) { this.playIndex(0); return; }
    if (this.playing) this.pause();
    else this.resumePlay();
  },

  pause() {
    if (!this.playing || !audioEngine.ctx) return;
    this.playing = false;
    this.stopTimer();
    audioEngine.ctx.suspend(); // freezes the audio clock — everything holds
    renderAllMusic();
  },

  resumePlay() {
    audioEngine.resume();
    this.playing = true;
    this.startTimer();
    renderAllMusic();
  },

  next() {
    if (!this.track) { this.playIndex(0); return; }
    if (this.shuffle) {
      let i;
      do { i = Math.floor(Math.random() * this.queue.length); }
      while (this.queue.length > 1 && i === this.index);
      this.playIndex(i);
      return;
    }
    if (this.index < this.queue.length - 1) { this.playIndex(this.index + 1); return; }
    if (this.repeat) { this.playIndex(0); return; }
    this.stopAll();
  },

  prev() {
    if (!this.track) { this.playIndex(0); return; }
    if (this.elapsed() > 3) { this.seek(0); return; } // restart the track first
    this.playIndex(this.index > 0 ? this.index - 1 : 0);
  },

  seek(frac) {
    if (!this.track) return;
    audioEngine.ensure();
    this.flush();
    const dur = trackDur(this.track);
    const total = this.track.steps.length * this.track.loops;
    this.step = clamp(Math.floor(frac * total), 0, total - 1);
    this.startTime = audioEngine.ctx.currentTime - frac * dur;
    this.nextTime = audioEngine.ctx.currentTime + 0.02;
    renderAllMusic();
  },

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    if (this.shuffle) {
      const cur = this.track;
      const rest = this.queue.filter((t) => t !== cur);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      this.queue = cur ? [cur, ...rest] : rest;
      this.index = 0;
    } else {
      this.queue = [...TRACKS];
      this.index = Math.max(0, this.queue.indexOf(this.track));
    }
    renderAllMusic();
  },

  toggleRepeat() {
    this.repeat = !this.repeat;
    renderAllMusic();
  },

  stopAll() {
    this.flush();
    this.stopTimer();
    this.playing = false;
    this.track = null;
    renderAllMusic();
  },

  /* ---- scheduler ---- */

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => this.tick(), 25);
  },

  stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  tick() {
    const ctx = audioEngine.ctx;
    if (!ctx || !this.track) return;
    const LOOKAHEAD = 0.12;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.scheduleStep(this.step, this.nextTime);
      this.nextTime += this.track.stepDur;
      this.step++;
    }
    if (this.elapsed() >= trackDur(this.track)) this.next();
  },

  scheduleStep(step, time) {
    const t = this.track;
    const s = t.steps[step % t.steps.length];
    if (s.m) this.note(s.m, time, 'triangle', t.stepDur * 2.2, 0.16);
    if (s.b) this.note(s.b, time, 'sine', t.stepDur * 2.6, 0.2);
    if (step % 4 === 0) this.kick(time, 0.5);
    if (step % 2 === 1) this.hat(time, 0.1);
  },

  note(freq, time, type, dur, gain) {
    const ctx = audioEngine.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g).connect(audioEngine.master);
    osc.start(time);
    osc.stop(time + dur + 0.05);
    this.scheduled.push(osc, g);
  },

  kick(time, gain) {
    const ctx = audioEngine.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.12);
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    osc.connect(g).connect(audioEngine.master);
    osc.start(time);
    osc.stop(time + 0.25);
    this.scheduled.push(osc, g);
  },

  hat(time, gain) {
    const ctx = audioEngine.ctx;
    const src = ctx.createBufferSource();
    src.buffer = audioEngine.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    src.connect(hp).connect(g).connect(audioEngine.master);
    src.start(time);
    src.stop(time + 0.06);
    this.scheduled.push(src, hp, g);
  },

  flush() {
    this.scheduled.forEach((n) => {
      try { n.stop(); } catch (e) { /* already stopped */ }
      try { n.disconnect(); } catch (e) { /* already gone */ }
    });
    this.scheduled = [];
  },
};

/* ---- Music app UI ---- */

const musicWindows = new Set(); // open Music window bodies, for live updates

function openMusic(state, body) {
  body.innerHTML = `
    <div class="music-wrap">
      <div class="music-now">
        <div class="music-art" id="music-art">🎵</div>
        <div class="music-now-info">
          <div class="music-title" id="music-title">Nothing playing</div>
          <div class="music-artist" id="music-artist">pick a track from the library</div>
        </div>
        <div class="music-controls">
          <button class="music-btn" id="m-prev" title="Previous">⏮</button>
          <button class="music-btn play" id="m-play" title="Play / Pause">▶</button>
          <button class="music-btn" id="m-next" title="Next">⏭</button>
        </div>
        <div class="music-opts">
          <button class="music-btn" id="m-shuffle" title="Shuffle">🔀</button>
          <button class="music-btn" id="m-repeat" title="Repeat">🔁</button>
        </div>
        <div class="music-progress-row">
          <span id="m-cur">0:00</span>
          <div class="music-progress" id="m-progress"><div class="music-progress-fill" id="m-progress-fill"></div></div>
          <span id="m-dur">0:00</span>
        </div>
      </div>
      <div class="music-cols">
        <div class="music-col">
          <div class="music-col-title">Library</div>
          <div class="music-list" id="music-library"></div>
        </div>
        <div class="music-col">
          <div class="music-col-title">Up Next</div>
          <div class="music-list" id="music-queue"></div>
        </div>
      </div>
    </div>
  `;

  musicWindows.add(body);
  state.onCleanup = () => musicWindows.delete(body);

  body.querySelector('#m-play').addEventListener('click', () => musicPlayer.toggle());
  body.querySelector('#m-next').addEventListener('click', () => musicPlayer.next());
  body.querySelector('#m-prev').addEventListener('click', () => musicPlayer.prev());
  body.querySelector('#m-shuffle').addEventListener('click', () => musicPlayer.toggleShuffle());
  body.querySelector('#m-repeat').addEventListener('click', () => musicPlayer.toggleRepeat());
  body.querySelector('#m-progress').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    musicPlayer.seek((e.clientX - r.left) / r.width);
  });

  renderAllMusic();
  updateMusicProgress();
}

function renderAllMusic() {
  renderMusicApp();
  renderMini();
}

function renderMusicApp() {
  musicWindows.forEach((body) => {
    if (!body.isConnected) return; // stale body from a cleared window
    const t = musicPlayer.track;
    body.querySelector('#music-title').textContent = t ? t.title : 'Nothing playing';
    body.querySelector('#music-artist').textContent = t ? t.artist : 'pick a track from the library';
    body.querySelector('#music-art').textContent = t ? t.icon : '🎵';
    body.querySelector('#m-play').textContent = musicPlayer.playing ? '⏸' : '▶';
    body.querySelector('#m-shuffle').classList.toggle('on', musicPlayer.shuffle);
    body.querySelector('#m-repeat').classList.toggle('on', musicPlayer.repeat);

    body.querySelector('#music-library').innerHTML = TRACKS.map((tr) => `
      <button class="music-item${musicPlayer.track === tr ? ' current' : ''}" data-mid="${tr.id}">
        <span class="music-item-ico">${tr.icon}</span>
        <span class="music-item-info"><b>${tr.title}</b><i>${tr.artist}</i></span>
        <span class="music-item-dur">${fmtTime(trackDur(tr))}</span>
      </button>`).join('');
    body.querySelectorAll('#music-library [data-mid]').forEach((b) => {
      b.addEventListener('click', () => musicPlayer.playTrack(b.dataset.mid));
    });

    const q = body.querySelector('#music-queue');
    if (!musicPlayer.track) {
      q.innerHTML = '<div class="music-empty">nothing in the queue — pick a track</div>';
    } else {
      q.innerHTML = musicPlayer.queue.map((tr, i) => {
        const isCur = i === musicPlayer.index && musicPlayer.track === tr;
        return `
          <button class="music-item${isCur ? ' current' : ''}" data-qid="${tr.id}">
            ${isCur ? '<span class="music-now-badge">▶</span>' : `<span class="music-qnum">${i + 1}</span>`}
            <span class="music-item-info"><b>${tr.title}</b><i>${tr.artist}</i></span>
          </button>`;
      }).join('');
      body.querySelectorAll('#music-queue [data-qid]').forEach((b) => {
        b.addEventListener('click', () => musicPlayer.playTrack(b.dataset.qid));
      });
    }
  });
}

/* ---- mini player (persists above the dock) ---- */

let miniVisible = true;

function renderMini() {
  const mini = document.getElementById('mini-player');
  if (!mini) return;
  const t = musicPlayer.track;
  mini.hidden = !(t && miniVisible);
  if (!t) return;
  mini.querySelector('.mini-art').textContent = t.icon;
  mini.querySelector('.mini-title').textContent = t.title;
  mini.querySelector('.mini-artist').textContent = t.artist;
  mini.querySelector('#mini-play').textContent = musicPlayer.playing ? '⏸' : '▶';
  mini.querySelector('#mini-mute').textContent = audioEngine.muted ? '🔇' : '🔊';
}

function updateMusicProgress() {
  const t = musicPlayer.track;
  const elapsed = t ? Math.min(musicPlayer.elapsed(), trackDur(t)) : 0;
  const frac = t ? elapsed / trackDur(t) : 0;
  const cur = t ? fmtTime(elapsed) : '0:00';
  const dur = t ? fmtTime(trackDur(t)) : '0:00';
  musicWindows.forEach((body) => {
    if (!body.isConnected) return; // stale body from a cleared window
    body.querySelector('#m-cur').textContent = cur;
    body.querySelector('#m-dur').textContent = dur;
    body.querySelector('#m-progress-fill').style.width = (frac * 100) + '%';
  });
  const mini = document.getElementById('mini-player');
  if (mini && !mini.hidden) {
    mini.querySelector('.mini-progress-fill').style.width = (frac * 100) + '%';
  }
}

function initMusic() {
  const mini = document.getElementById('mini-player');
  mini.querySelector('#mini-play').addEventListener('click', () => musicPlayer.toggle());
  mini.querySelector('#mini-next').addEventListener('click', () => musicPlayer.next());
  mini.querySelector('#mini-prev').addEventListener('click', () => musicPlayer.prev());
  mini.querySelector('#mini-mute').addEventListener('click', () => audioEngine.toggleMute());
  mini.querySelector('#mini-close').addEventListener('click', () => {
    miniVisible = false;
    renderMini();
  });
  mini.querySelector('.mini-progress').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    musicPlayer.seek((e.clientX - r.left) / r.width);
  });
  renderMini();
  setInterval(updateMusicProgress, 200);
}

/* =========================================================
   11.7 APPEARANCE (light/dark) + SYSTEM SETTINGS
   ---------------------------------------------------------
   Light mode is the default, just like macOS. Switch it in
   the Settings app (Appearance pane) — your choice is
   remembered in localStorage.
   ========================================================= */

const settingsWindows = new Set();

function setTheme(mode) {
  const light = mode !== 'dark';
  document.body.classList.toggle('light', light); // light is the override layer
  document.body.classList.toggle('dark', !light);
  try { localStorage.setItem(KEYS.theme, light ? 'light' : 'dark'); } catch (e) { /* ignore */ }
  settingsWindows.forEach((b) => {
    b.querySelectorAll('.set-card').forEach((c) => {
      c.classList.toggle('on', c.dataset.mode === (light ? 'light' : 'dark'));
    });
  });
}

function openSettings(state, body) {
  settingsWindows.add(body);
  state.onCleanup = () => settingsWindows.delete(body);
  body.innerHTML = `
    <div class="set-wrap">
      <div class="set-side">
        <button class="set-side-item current" data-pane="appearance">🎨 Appearance</button>
        <button class="set-side-item" data-pane="wallpaper">🖼️ Wallpaper</button>
        <button class="set-side-item" data-pane="sound">🔊 Sound</button>
        <button class="set-side-item" data-pane="display">☀️ Display</button>
        <button class="set-side-item" data-pane="about">🪐 About</button>
      </div>
      <div class="set-content" id="set-content"></div>
    </div>
  `;
  body.querySelectorAll('.set-side-item').forEach((b) => {
    b.addEventListener('click', () => renderSettingsPane(body, b.dataset.pane));
  });
  renderSettingsPane(body, 'appearance');
}

function renderSettingsPane(body, pane) {
  body.querySelectorAll('.set-side-item').forEach((b) => b.classList.toggle('current', b.dataset.pane === pane));
  const c = body.querySelector('#set-content');

  if (pane === 'appearance') {
    const light = !document.body.classList.contains('dark');
    c.innerHTML = `
      <div class="set-title">Appearance</div>
      <div class="set-cards">
        <button class="set-card${light ? ' on' : ''}" data-mode="light">
          <div class="set-card-mini light-mini"><span class="mini-bar"></span></div>
          <div class="set-card-name">Light</div>
        </button>
        <button class="set-card${light ? '' : ' on'}" data-mode="dark">
          <div class="set-card-mini dark-mini"><span class="mini-bar"></span></div>
          <div class="set-card-name">Dark</div>
        </button>
      </div>
      <p class="set-note">The whole interface — menu bar, dock, windows, apps — switches instantly.</p>`;
    c.querySelectorAll('.set-card').forEach((b) => {
      b.addEventListener('click', () => setTheme(b.dataset.mode));
    });
  } else if (pane === 'wallpaper') {
    c.innerHTML = `
      <div class="set-title">Wallpaper</div>
      <div class="set-wall">
        ${Object.entries(WALLPAPERS).map(([id, w]) => `
          <button class="set-swatch${id === currentWallpaper ? ' on' : ''}" data-wall="${id}" style="background:${w.css}" title="${w.name}">
            <span>${w.name}</span>
          </button>`).join('')}
      </div>`;
    c.querySelectorAll('[data-wall]').forEach((b) => {
      b.addEventListener('click', () => {
        setWallpaper(b.dataset.wall);
        renderSettingsPane(body, 'wallpaper');
      });
    });
  } else if (pane === 'sound') {
    c.innerHTML = `
      <div class="set-title">Sound</div>
      <div class="set-row"><span>Output volume</span><span class="set-val" id="set-vol-val">${audioEngine.vol}%</span></div>
      <input type="range" id="set-vol" min="0" max="100" value="${audioEngine.vol}" />
      <div class="set-row"><button class="set-btn" id="set-mute">${audioEngine.muted ? '🔇 Unmute' : '🔊 Mute'}</button></div>
      <p class="set-note">Music is synthesized live by the Web Audio engine — play a track in Music while you drag this.</p>`;
    const vol = c.querySelector('#set-vol');
    vol.addEventListener('input', () => {
      audioEngine.setVolume(+vol.value);
      c.querySelector('#set-vol-val').textContent = vol.value + '%';
    });
    c.querySelector('#set-mute').addEventListener('click', () => {
      audioEngine.toggleMute();
      renderSettingsPane(body, 'sound');
    });
  } else if (pane === 'display') {
    c.innerHTML = `
      <div class="set-title">Display</div>
      <div class="set-row"><span>Brightness</span></div>
      <input type="range" id="set-bright" min="30" max="150" value="${parseInt(localStorage.getItem(KEYS.bright) || '100', 10)}" />
      <p class="set-note">Dims the wallpaper like a real screen.</p>`;
    c.querySelector('#set-bright').addEventListener('input', (e) => setBrightness(+e.target.value));
  } else if (pane === 'about') {
    const up = Math.floor((Date.now() - (window.__bootTime || Date.now())) / 1000);
    c.innerHTML = `
      <div class="set-title">About</div>
      <div class="set-about">
        <span class="set-about-logo">${ICONS.system()}</span>
        <div class="set-about-name">${OS.name} ${OS.version}</div>
        <div class="set-about-sub">${OS.codename} · ${OS.user} · no password</div>
      </div>
      <table class="sys-table">
        <tr><td>Session uptime</td><td>${fmtUptime(up)}</td></tr>
        <tr><td>Browser</td><td>${navigator.userAgent.match(/(Chrome|Firefox|Safari|Edg)\/?\s?([\d.]+)/)?.[0] || '—'}</td></tr>
        <tr><td>Storage used</td><td id="set-storage">…</td></tr>
        <tr><td>Built with</td><td>vanilla HTML · CSS · JS</td></tr>
      </table>`;
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        const el = c.querySelector('#set-storage');
        if (el) el.textContent = `${(est.usage / 1024 / 1024).toFixed(2)} MB / ${(est.quota / 1024 / 1024 / 1024).toFixed(2)} GB`;
      });
    }
  }
}

/* =========================================================
   12. DEVLOG DATA
   ========================================================= */

const DEVLOGS = [
  {
    date: 'Aug 12, 2026',
    tag: 'v0.1 · concept',
    title: 'A blank screen and a big idea',
    body: `Day one. I wanted to build a "web OS" with zero frameworks and zero build steps — just files you can open in a browser and poke at. I settled on a space theme and named it Nebula. First milestone: a desktop with a wallpaper, a starfield, and app icons. It was just a picture at this point, but it felt like a place.`,
  },
  {
    date: 'Aug 13, 2026',
    tag: 'v0.2 · window manager',
    title: 'Windows that actually move',
    body: `The big one: a window manager in vanilla JS. Every window can be dragged by its titlebar, clicked to come to the front, minimized, maximized (double-click the titlebar!) and closed. I even added drag-to-edge snapping — push a window to the left or right edge to split the screen, or to the top to go fullscreen. That was not in the guide; I just wanted it.`,
  },
  {
    date: 'Aug 14, 2026',
    tag: 'v0.3 · first apps',
    title: 'Apps start to appear',
    body: `Built three apps: Notes (autosaves to the browser so your writing survives a refresh), a working Calculator, and — the fun one — a Snake game on a canvas, with a high score. Added the animated boot screen with the fake BIOS log and a clock in the taskbar. I love how the boot screen makes it feel like a real machine.`,
  },
  {
    date: 'Aug 16, 2026',
    tag: 'v0.4 · ship it',
    title: 'Polish, wallpapers, and shipping',
    body: `Final pass: a start menu with every app, five switchable wallpapers (right-click the desktop), an About app with live uptime, and window positions that are remembered between visits. No password, no login — anyone can open it and play. Next up, if this was a bigger project: WebOS 2! 🌌`,
  },
  {
    date: 'Aug 17, 2026',
    tag: 'v1.0 · nebula',
    title: 'The macOS-style makeover',
    body: `Big redesign: the taskbar is gone. Nebula now has a real menu bar with working dropdowns, a dock with magnification and running indicators, Spotlight search (press ⌘Space or Ctrl+K), a Control Center with sliders and wallpaper swatches, and a Sleep/Lock screen. Windows got traffic-light buttons and a proper center title. Also fixed a sneaky bug: the empty window layer was silently eating clicks meant for the desktop icons.`,
  },
  {
    date: 'Aug 18, 2026',
    tag: 'v1.1 · sound',
    title: 'Music, without a single audio file',
    body: `New Music app — and there are no MP3s anywhere. All six tracks are synthesized live by a Web Audio sequencer: triangle melodies, sine basses, kicks and hi-hats, scheduled a fraction of a second ahead so the beat stays tight. There's a full queue with shuffle and repeat, plus a mini-player that floats above the dock, so the music keeps playing even after you close the window. Best part: the Control Center volume slider is wired to the engine's master gain now — it finally does something!`,
  },
  {
    date: 'Aug 18, 2026',
    tag: 'v1.2 · files',
    title: 'Finder: the desktop finally has files',
    body: `Added a real Finder. There's now an actual file system living in your browser: folders and files you can create, rename (inline, like macOS), navigate with back/forward and breadcrumbs, and delete. Deleted items don't vanish — they go to the Trash app, where you can restore them or empty it for good, and the dock trash icon glows when it's full. Everything persists in localStorage, so your folders survive a reboot. Spotlight even searches your files now.`,
  },
  {
    date: 'Aug 18, 2026',
    tag: 'v1.3 · 1:1',
    title: 'Pushing for a 1:1 macOS look',
    body: `The emoji are gone. Every app got a hand-drawn SVG tile icon in the macOS style — the blue Finder face, the yellow Notes notepad, the silver trash that fills up with paper when it's full. Launchpad joined the dock (press F4): a full-screen grid of apps over a blurred wallpaper with search. Mission Control arrived too (F3 or Ctrl+↑): live scaled thumbnails of every open window, click one to bring it to the front. And the boot screen went Apple-quiet: black screen, logo, thin progress bar — no more BIOS log.`,
  },
  {
    date: 'Aug 18, 2026',
    tag: 'v1.4 · light',
    title: 'The mac feeling: light mode + System Settings',
    body: `The thing that was still missing was the light. Real macOS defaults to a bright translucent look, so Nebula does now too: light menu bar and dock, light windows with proper titlebars, a fresh bright Sequoia wallpaper. There's a System Settings app with a real sidebar — Appearance (light/dark cards), Wallpaper, Sound (wired to the music engine), Display, and About — and your choice is remembered. It finally feels like a Mac.`,
  },
];

/* =========================================================
   13. HELPERS
   ========================================================= */

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

function fmtUptime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function restartOS() {
  // Close everything and boot up fresh, like a real power cycle.
  windows.forEach((w) => w.el.remove());
  windows.clear();
  focusedAppId = null;
  musicWindows.clear(); // windows were removed directly, not via closeWindow
  musicPlayer.stopAll();
  closeMenus();
  closeCC();
  closeContextMenu();
  toggleSpotlight(false);
  wake();
  window.__bootTime = Date.now();
  runBoot();
}

/* =========================================================
   14. INIT
   ========================================================= */

function init() {
  setTheme(localStorage.getItem(KEYS.theme) || 'light'); // light is the macOS default
  window.__bootTime = Date.now();
  setWallpaper(currentWallpaper);
  setBrightness(parseInt(localStorage.getItem(KEYS.bright) || '100', 10));
  buildIcons();
  buildDock();
  updateDockTrash();
  dockMagnify();
  buildMenus();
  buildSpotlight();
  buildLaunchpad();
  buildCC();
  initMusic();
  runBoot();

  // ---- menubar right side ----
  document.getElementById('mb-cc').addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    toggleCC();
  });
  document.getElementById('mb-search').addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    toggleSpotlight();
  });

  // ---- clock + battery ticker ----
  setInterval(() => { updateClock(); updateBattery(); }, 1000);

  // ---- desktop icons ----
  function buildIcons() {
    const wrap = document.getElementById('icons');
    wrap.innerHTML = '';
    DESKTOP_APPS.forEach((id) => {
      const app = APPS[id];
      const el = document.createElement('div');
      el.className = 'icon';
      el.dataset.app = id;
      el.innerHTML = `<div class="icon-img">${appIcon(id)}</div><div class="icon-label">${app.name}</div>`;
      el.title = 'Open ' + app.name;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectIcon(el);
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openWindow(id);
      });
      wrap.appendChild(el);
    });
  }

  function selectIcon(el) {
    document.querySelectorAll('.icon').forEach((i) => i.classList.toggle('selected', i === el));
  }

  function deselectIcons() {
    document.querySelectorAll('.icon').forEach((i) => i.classList.remove('selected'));
  }

  // ---- right-click wallpaper menu + click-away handling ----
  document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window') || e.target.closest('.icon')) return;
    e.preventDefault();
    deselectIcons();
    openContextMenu(e.clientX, e.clientY);
  });
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window')) e.preventDefault();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#menu-drop') && !e.target.closest('.menu-item')) closeMenus();
    if (!e.target.closest('#cc') && !e.target.closest('#mb-cc')) closeCC();
    if (!e.target.closest('#context-menu')) closeContextMenu();
    if (!e.target.closest('#spotlight')) toggleSpotlight(false);
    if (!e.target.closest('.icon') && !e.target.closest('.window')) deselectIcons();
  });

  // ---- sleep: click or press any key to wake ----
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#sleep-screen')) wake();
  });
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('sleep-screen').hidden) {
      wake();
      return;
    }
  });

  // ---- global keys ----
  document.addEventListener('keydown', (e) => {
    // While asleep, keys are handled by the wake listener only.
    if (!document.getElementById('sleep-screen').hidden) return;
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.code === 'Space') { e.preventDefault(); toggleSpotlight(); return; }
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); toggleSpotlight(); return; }
    if (e.metaKey && e.key.toLowerCase() === 'w') { const f = focusedState(); if (f) closeWindow(f.id); return; }
    if (e.metaKey && e.key.toLowerCase() === 'm') { const f = focusedState(); if (f) toggleMinimize(f.id); return; }
    if (e.code === 'F3' || (e.ctrlKey && e.key === 'ArrowUp')) { e.preventDefault(); toggleMissionControl(); return; }
    if (e.code === 'F4') { e.preventDefault(); toggleLaunchpad(); return; }
    if (e.key === 'Escape') {
      closeMenus();
      closeCC();
      closeContextMenu();
      toggleSpotlight(false);
      toggleLaunchpad(false);
      toggleMissionControl(false);
    }

    // Music: space toggles play/pause while the app is focused.
    if (focusedAppId === 'music' && e.code === 'Space' && !(e.target.closest && e.target.closest('input, textarea'))) {
      e.preventDefault();
      musicPlayer.toggle();
      return;
    }

    // Snake keys: only when Snake is the focused app and a game is open.
    if (focusedAppId === 'snake' && snakeKeyHandler) snakeKeyHandler(e);
  });

  window.addEventListener('resize', () => {
    windows.forEach((state) => {
      if (state.maximized) return;
      const size = desktopSize();
      state.x = clamp(state.x, 0, Math.max(size.w - state.w, 0));
      state.y = clamp(state.y, 0, Math.max(size.h - state.h, 0));
      applyRect(state);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);

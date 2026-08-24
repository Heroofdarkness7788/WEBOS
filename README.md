# 🪐 Nebula OS — a macOS-style web OS

A tiny web operating system built with **plain HTML, CSS and JavaScript** — no frameworks,
no build step, no dependencies. Open it in a browser and it boots into a desktop with
draggable windows, a menu bar, a dock, Spotlight search, a Control Center, and more.

It started as a beginner-friendly "build your own web OS" workshop project, then got a full
macOS-style makeover.

## Run it

Easiest: double-click `index.html` — it works straight from disk.

Or serve it (nicer for testing localStorage persistence across refreshes):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## What's inside

**The desktop**
- **Light mode by default**, just like macOS — bright translucent menu bar, dock and
  windows on a fresh Sequoia wallpaper; switch to Dark in System Settings
- Apple-style boot screen: black, logo, thin progress bar (click to skip)
- 5 macOS-style gradient wallpapers (Sequoia, Aurora, Sunset, Midnight, Ocean)
- Desktop icons on the right — single-click to select, double-click to open
- Right-click the desktop to change the wallpaper

**The window manager**
- Drag windows by their titlebar, click to focus
- Traffic-light buttons: red = close, yellow = minimize, green = zoom
- Double-click a titlebar to zoom, drag to the left/right edge to snap, top edge to fullscreen
- Window positions are remembered between visits (localStorage)

**The menu bar**
- Working dropdowns: Nebula , File, Edit, View, Window, Help
- The bold app menu shows whichever app is focused
- Clock, Wi-Fi/battery icons, Control Center and Spotlight buttons

**The dock**
- Hand-drawn SVG app icons (no emoji!) — Finder face, yellow Notes, silver Trash that
  fills with paper when it's full
- Magnification as your cursor sweeps over it
- Running-app indicator dots
- Click an app to open it, or to focus/minimize it if it's already open
- **Launchpad** (first icon, or F4): full-screen app grid with search
- Trash at the far end

**Extras**
- 🔍 **Spotlight** — press `Ctrl+K` (or `⌘Space` on a Mac) and search apps, wallpapers and actions
- 🪟 **Mission Control** — press `F3` (or `Ctrl+↑`) to see live thumbnails of every open
  window; click one to bring it to the front
- 🎛️ **Control Center** — Wi-Fi/Bluetooth toggles, brightness (actually dims the wallpaper),
  volume (drives the Music app's audio engine), Sleep/Restart/Lock, wallpaper swatches
- 😴 **Sleep** — locks to a blurred clock screen; click or press any key to wake
- Apps: 📁 Finder, 📝 Notes (autosaves), 🧮 Calculator, 🐍 Snake (bonus game with high score),
  🎵 Music, 📓 Devlogs, 🪐 About, 🗑️ Trash, ⚙️ System Settings

**System Settings**
- Sidebar app with panes: Appearance (light/dark cards), Wallpaper, Sound (drives the
  music engine), Display (brightness), and About — all persisted in localStorage

**Finder — a real file system**
- Folders and files persisted in localStorage — create, rename (inline), and delete them
- Back/forward/up navigation, clickable breadcrumbs, and a Favorites sidebar
- Deleted items go to the **Trash** app (which is real now too): restore them or empty it
  for good, and the dock trash icon glows while the trash is full
- Spotlight searches your files and jumps straight to them

**Music (no audio files — all synthesized!)**
- Six procedural chiptune tracks played live by a Web Audio sequencer
  (triangle melodies, sine basses, kick + hi-hat drums)
- Play queue with shuffle and repeat, plus a library you can jump into
- A mini-player floats above the dock and keeps playing after you close the app
- The Control Center volume slider is wired to the master gain — and music
  pauses automatically when the machine sleeps
- **No password** — anyone can open it and play

## Make it your own

Everything lives in three files. The comments point you to the right spot.

| Want to change… | Look for… |
| --- | --- |
| OS name / version | `OS` at the top of `app.js` |
| Wallpapers | `WALLPAPERS` in `app.js` (add one with a CSS gradient) |
| Apps in the dock / desktop | `DOCK_APPS` / `DESKTOP_APPS` in `app.js` |
| Music tracks | `TRACKS` in `app.js` (notes as 8th-note strings, `.` = rest) |
| File system | `defaultFS()` in `app.js` (seed folders/files), stored under `nebula.fs` |
| Menu bar items | `MENUS` in `app.js` |
| Accent / window colors | `--accent` and the `--glass` vars in `styles.css` |
| Menu bar height / dock | `--menubar-h` / `#dock` in `styles.css` |

Adding a new app: add an entry to `APPS` (with `name`, `icon`, `w`, `h`, and an `onOpen`
function), write the `onOpen` function, and drop its id into `DOCK_APPS` or `DESKTOP_APPS`.

## Mission checklist

- ✅ Working webpage with multiple draggable windows
- ✅ Looks like its own thing (macOS-inspired, not a guide copy)
- ✅ 9 devlogs documenting progress (open the Devlogs app)
- ✅ New features beyond the guide: menu bar, dock magnification, Spotlight,
  Control Center, Sleep/Lock, snapping, boot screen, Trash, Music + mini-player,
  Finder file system, Launchpad, Mission Control, SVG app icons, light/dark mode,
  System Settings
- ✅ No password

## File layout

```
index.html   — page structure: boot screen, desktop, menubar, dock, overlays
styles.css   — the macOS look: glass, traffic lights, dock, spotlight, control center
app.js       — window manager + dock + menus + spotlight + all the apps
README.md    — this file
```

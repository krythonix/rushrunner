# Runner Rush

A richer endless runner prototype built with plain HTML/CSS/JavaScript.

## Run locally

Open `index.html` in a browser, or serve the folder over HTTP (required for PWA install and service worker):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Install on your phone (PWA)

The game is a Progressive Web App. Install it from your **deployed HTTPS site** (GitHub Pages or similar):

**iPhone (Safari)**
1. Open the game URL in Safari
2. Tap Share → **Add to Home Screen**
3. Tap **Add**

**Android (Chrome)**
1. Open the game URL in Chrome
2. Tap the menu → **Install app** or **Add to Home screen**

The installed app runs fullscreen, caches assets for faster loads, and works offline after the first visit.

## Deploy / cache busting

Static assets (`style.css`, `game.js`, audio) use a `?v=` query string so browsers fetch fresh files after each deploy.

Before deploying manually, run:

```bash
bash scripts/inject-cache-version.sh
```

This sets `?v=` to the current git commit (or a timestamp if git is unavailable) in `index.html`. A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs the same step automatically on push to `main`/`master` when using GitHub Pages.

`index.html` also sends no-cache meta tags so the page shell is less likely to stay stale.

## Current features

- Full run flow: menu, play, game-over, restart, one-run revive
- Jump + slide mechanics with different obstacle types
- Coin collection and persistent coin bank
- Fixed 20-stage progression with stage goals and unlocks
- Boss stages (Stage 5, 10, 15, and 20)
- Endless survival mode after beating all stages
- Upgrade loop:
  - jump height upgrades
  - coin magnet upgrades
- Shield power-up spawns
- Persistent profile save in localStorage
- Installable PWA with offline cache (Add to Home Screen / Install app)

## Next steps for mobile launch

1. Replace placeholder art with production assets and animations.
2. Add daily rewards, limited-time events, and character skins.
3. Integrate ads:
   - Rewarded ad for one revive per run
   - Interstitial ad every 3-5 runs
   - Remove-ads purchase
4. Package with Capacitor or migrate to Unity for app-store deployment.

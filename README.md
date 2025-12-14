# The Brothers Chess (Dostoevsky-themed)

A **fully static** chess web app designed for **GitHub Pages**:

- **Hotseat** (same device)
- **Against AI** (Stockfish in your browser via WebAssembly)
- **Online with a friend** (**true P2P** via WebRTC with copy/paste signaling — no server)
- Move list, **PGN** import/export, **FEN** copy, chat, clocks, and a small **daily puzzle**

## Run locally

Any static server works.

```bash
cd /path/to/repo
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy on GitHub Pages

This repo is already compatible with GitHub Pages (no build step).

- Put these files at the Pages root (`index.html`, `app.js`, `styles.css`, `sw.js`, etc.)
- In your repo settings: **Pages → Deploy from branch**

## Online play (no backend)

Because GitHub Pages is static, online multiplayer is done with **manual WebRTC signaling**.

- **Host** clicks **Host (create offer)**, then copies the JSON and sends it to the friend
- **Joiner** pastes the offer JSON and clicks **Join (make answer)**, then sends the answer back
- **Host** pastes the answer JSON and clicks **Apply**

After the data channel opens:
- Moves and chat are sent directly between browsers
- Clocks are synced by sending remaining time on each move

## Notes

- The app uses CDN dependencies:
  - `chess.js` (rules/validation)
  - `stockfish.js` (WASM engine in a Worker)
- Offline mode is **best-effort**: the service worker caches the app shell and tries to cache the CDN scripts too.

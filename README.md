# Dostoevsky Chess

A multiplayer chess web application with a Fyodor Dostoevsky theme. Play against friends online (P2P), locally, or challenge the machine ("The Grand Inquisitor").

## Features

- **Thematic Visuals**: Dark, moody, 19th-century aesthetic inspired by Dostoevsky's works.
- **Game Modes**:
  - **The Grand Inquisitor (AI)**: Play against Stockfish engine.
  - **The Double (Local)**: Pass and play with a friend on the same device.
  - **Notes from Underground (Online)**: Host or join a P2P game using PeerJS.
- **Literary Quotes**: Features quotes from Dostoevsky's major novels.

## How to Play

### Online
1. Click "Host Online Game".
2. Share the generated ID with your friend.
3. Your friend clicks "Join Online Game" and enters your ID.
4. The game starts! Host plays White, Guest plays Black.

### Local
1. Click "Pass & Play".
2. Take turns making moves on the same device.

### AI
1. Click "The Grand Inquisitor".
2. Play against the computer.

## Installation / Hosting

This is a static web application. 

### GitHub Pages
1. Fork this repository.
2. Go to Settings > Pages.
3. Select the `main` branch (or `master`) and `/` (root) folder.
4. Save. The site will be published at your GitHub Pages URL.

### Local Development
You need a local web server because of Web Worker security restrictions (for Stockfish).

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server .
```

Then visit `http://localhost:8000`.

## Credits
- Chess logic: [Chess.js](https://github.com/jhlywa/chess.js)
- UI: [Chessboard.js](https://chessboardjs.com/)
- AI: [Stockfish.js](https://github.com/nmrugg/stockfish.js)
- Networking: [PeerJS](https://peerjs.com/)

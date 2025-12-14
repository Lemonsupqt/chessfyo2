# ♔ Братья Карамазовы Chess

> *"Beauty will save the world."* — The Idiot

A beautifully crafted multiplayer chess web application inspired by the literary works of **Fyodor Dostoevsky**. Play chess against friends locally, online via peer-to-peer connections, or challenge the Stockfish AI engine—all wrapped in a dark, atmospheric aesthetic drawn from 19th-century Russian literature.

![Dostoevsky Chess](https://img.shields.io/badge/Chess-Dostoevsky%20Edition-8B0000?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-C9A227?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-181717?style=for-the-badge)

## ✨ Features

### 🎮 Game Modes
- **Local Duel** — Two players, one device. Classic hot-seat chess.
- **Online Match** — Peer-to-peer multiplayer via WebRTC. Share a link with friends!
- **Versus AI** — Challenge Stockfish with adjustable difficulty levels named after Dostoevsky characters.
- **Puzzles** — Classic chess puzzles with literary themes and quotes.

### 🤖 AI Integration
- **Stockfish Engine** — The world's strongest open-source chess engine
- **5 Difficulty Levels:**
  - Alyosha (Beginner)
  - Dmitri (Intermediate)
  - Ivan (Advanced)
  - Smerdyakov (Expert)
  - Grand Inquisitor (Master)

### 🌐 Multiplayer
- **No server required** — Pure peer-to-peer connections via PeerJS/WebRTC
- **Shareable room links** — Just send a link to your friend
- **Real-time gameplay** — Instant move synchronization
- **Draw offers & resignation** — Full game protocol support

### 🎨 Dostoevsky Aesthetic
- **Dark, moody color palette** — Deep reds, blacks, and golds
- **Literary quotes** — Wisdom from Crime and Punishment, The Brothers Karamazov, The Idiot, and more
- **Atmospheric effects** — Fog, candlelight glow animations
- **Multiple board themes:**
  - Classic Dostoevsky
  - Manuscript
  - Midnight Petersburg
  - Sepia Pages

### ⚙️ Additional Features
- ⏱️ Customizable time controls (3, 10, 15, 30 min, or unlimited)
- 📜 Move history with algebraic notation
- 💡 Hint system (powered by Stockfish)
- ↶ Undo/Redo moves
- 🔄 Board flip
- 📤 PGN export
- 🔊 Sound effects (Web Audio API)
- 📱 Fully responsive design
- ⌨️ Keyboard shortcuts

## 🚀 Quick Start

### Play Online
Simply visit: **[Your GitHub Pages URL]**

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/dostoevsky-chess.git
cd dostoevsky-chess
```

2. **Start a local server:**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. **Open in browser:**
```
http://localhost:8000
```

## 📦 Deployment to GitHub Pages

This project is designed for static hosting on GitHub Pages.

### Method 1: Direct Upload

1. Push all files to your GitHub repository's `main` branch
2. Go to **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select `main` branch and `/ (root)` folder
5. Click **Save**
6. Your site will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Method 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
          
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

## 🎯 How to Play

### Starting a Game

1. Click **"New Game"** in the header
2. Choose your game mode:
   - **Local Duel**: Play on the same device
   - **Online Match**: Create or join a room
   - **Versus Machine**: Play against AI
   - **Puzzles**: Solve chess puzzles
3. Select your color and time control
4. Click **"Begin the Game"**

### Playing Online

**To host a game:**
1. Select "Online Match"
2. Click "Create Room"
3. Share the generated link with your friend

**To join a game:**
1. Open the shared link, OR
2. Select "Online Match" → Enter the room code → "Join Room"

### Controls

| Action | Button | Keyboard |
|--------|--------|----------|
| Flip Board | ⟲ | `F` |
| Undo Move | ↶ | `Ctrl+Z` |
| Redo Move | ↷ | `Ctrl+Y` |
| Get Hint | 💡 | `H` |
| New Game | — | `N` |
| Close Modal | × | `Esc` |

## 📁 Project Structure

```
dostoevsky-chess/
├── index.html          # Main HTML file
├── css/
│   ├── style.css       # Main styles
│   ├── board.css       # Chess board styles
│   └── modals.css      # Modal dialogs
├── js/
│   ├── chess.js        # Chess game logic
│   ├── board.js        # Board rendering
│   ├── game.js         # Game manager
│   ├── stockfish-loader.js  # AI engine
│   ├── multiplayer.js  # P2P connections
│   ├── puzzles.js      # Puzzle mode
│   ├── sounds.js       # Audio system
│   ├── quotes.js       # Literary quotes
│   └── app.js          # Main application
├── assets/
│   └── favicon.svg     # Site icon
└── README.md
```

## 🔧 Technical Details

### Dependencies (CDN-loaded)
- **PeerJS** — WebRTC abstraction for P2P connections
- **Stockfish.js** — Chess engine compiled to WebAssembly

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### No Build Required
This is a vanilla JavaScript project with no build steps. Simply serve the files!

## 📖 Dostoevsky Quotes Featured

The game includes dozens of quotes from:
- *Crime and Punishment*
- *The Brothers Karamazov*
- *The Idiot*
- *Notes from Underground*
- *Demons (The Possessed)*
- *The Gambler*

> *"The soul is healed by being with children... and chess."*

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Add more Dostoevsky quotes!

## 📜 License

MIT License — Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- **Fyodor Dostoevsky** — For the eternal wisdom and literary inspiration
- **Stockfish Team** — For the incredible open-source chess engine
- **PeerJS** — For making WebRTC accessible

---

<div align="center">

*"Man is sometimes extraordinarily, passionately, in love with suffering."*

**— Crime and Punishment**

♔ ♕ ♖ ♗ ♘ ♙

Made with ❤️ and existential contemplation

</div>

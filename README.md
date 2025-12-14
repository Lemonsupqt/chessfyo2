# Братья Шахматисты | The Brothers Chess

> *"The soul is healed by being with children... and by playing chess."* — Fyodor Dostoevsky

A beautiful, atmospheric chess web application inspired by the literary works of **Fyodor Dostoevsky**. Play against friends online, challenge the AI, or enjoy local two-player games—all wrapped in a dark, Russian literary aesthetic.

![Chess Banner](https://img.shields.io/badge/Chess-Dostoevsky%20Edition-8b3a44?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-c9a227?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-gold?style=for-the-badge)

## ✨ Features

### 🎮 Game Modes

- **🕯️ The Innocent (Easy AI)** - Alyosha's Path: Perfect for beginners
- **⚖️ The Intellectual (Medium AI)** - Ivan's Challenge: Balanced gameplay
- **🔥 The Tormented (Hard AI)** - Dmitri's Fury: For experienced players
- **💀 The Grand Inquisitor (Master AI)** - Ultimate challenge with Stockfish
- **👥 Brothers at the Board** - Local two-player on the same device
- **🔍 The Confession** - Analysis mode to study positions

### 🌐 Multiplayer

- **Peer-to-peer connections** using WebRTC (via PeerJS)
- **Shareable game links** - Send a link, they join instantly
- **Game codes** - Easy 6-character codes to share
- **No account required** - Just create and play!

### ⏱️ Time Controls

- ♾️ Unlimited - Take your time
- ⚡ 1 minute - Bullet chess
- 🔥 3 minutes - Blitz
- ⏱️ 5 minutes - Rapid
- 🕐 10 minutes - Classical
- 📖 15 minutes - Correspondence style

### 🎨 Dostoevsky Theme

- **Dark, atmospheric color palette** inspired by 19th century Russia
- **Gold and burgundy accents** evoking candlelit salons
- **Literary typography** with elegant serif fonts
- **Dynamic Dostoevsky quotes** throughout the experience
- **Wisdom snippets** that change based on game state

### 🛠️ Features

- ♟️ Full chess rules including castling, en passant, and promotion
- 📜 Move history with algebraic notation
- 🔊 Sound effects for moves, captures, and check
- 🔄 Board flip option
- ↩️ Undo moves (in non-online modes)
- 📊 Position evaluation bar
- 🎯 Legal move highlighting
- 👑 Captured pieces display
- 🏳️ Resign and draw offers

## 🚀 Quick Start

### Play Online

Simply visit the GitHub Pages deployment:
```
https://[your-username].github.io/[repo-name]/
```

### Host Locally

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. That's it! No build process required.

```bash
# Clone the repository
git clone https://github.com/[your-username]/[repo-name].git

# Open in browser
open index.html
# or
python -m http.server 8000
# then visit http://localhost:8000
```

## 🎯 How to Play

### Single Player vs AI

1. Click **"New Game"** from the main menu
2. Select your difficulty (Alyosha, Ivan, Dmitri, or Grand Inquisitor)
3. Choose your time control (or unlimited)
4. Play as White against the AI

### Local Multiplayer

1. Click **"New Game"** → **"Brothers at the Board"**
2. Two players take turns on the same device
3. White moves first, then Black

### Online Multiplayer

**To host a game:**
1. Click **"Play with Friends"**
2. Choose your color (White, Black, or Random)
3. Select time control
4. Click **"Create Game Room"**
5. Share the link or game code with your friend

**To join a game:**
1. Click **"Play with Friends"** or **"Join Game"**
2. Enter the game code from your friend
3. Click **"Join Game"**

## 🏗️ Project Structure

```
dostoevsky-chess/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # Dostoevsky-themed styles
├── js/
│   ├── app.js          # Main application logic
│   ├── chess-game.js   # Chess board and game logic
│   ├── stockfish-wrapper.js  # AI engine integration
│   └── multiplayer.js  # P2P multiplayer system
├── assets/             # Images and assets (if any)
└── README.md           # This file
```

## 🔧 Technologies

- **Pure HTML/CSS/JavaScript** - No frameworks required
- **[Chess.js](https://github.com/jhlywa/chess.js)** - Chess move validation
- **[PeerJS](https://peerjs.com/)** - WebRTC peer-to-peer connections
- **[Stockfish.js](https://github.com/nickverlern/stockfish.js)** - Chess AI engine
- **Google Fonts** - Playfair Display, Cormorant Garamond, EB Garamond

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (responsive design)

## 🎭 Dostoevsky References

The game is steeped in references to Dostoevsky's works:

- **The Brothers Karamazov**: AI difficulty levels named after Alyosha, Ivan, and Dmitri
- **Crime and Punishment**: Dark, brooding aesthetic
- **The Grand Inquisitor**: Ultimate AI challenge
- **Notes from Underground**: Atmosphere of introspection
- **Dynamic quotes**: Wisdom from Dostoevsky's novels appears throughout

## 🌍 Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to repository **Settings** → **Pages**
3. Under "Source", select **main branch**
4. Your site will be live at `https://[username].github.io/[repo-name]/`

## 📜 License

MIT License - Feel free to use, modify, and share!

## 🙏 Acknowledgments

- Fyodor Dostoevsky for the timeless literary inspiration
- The chess.js team for the chess logic library
- PeerJS for making WebRTC accessible
- Stockfish team for the powerful chess engine

---

<p align="center">
  <em>"Beauty will save the world."</em><br>
  — Fyodor Dostoevsky, The Idiot
</p>

<p align="center">
  ❧ Братья Шахматисты | The Brothers Chess ☙
</p>

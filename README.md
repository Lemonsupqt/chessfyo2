# The Brothers Gambit ♚

> *"The soul is healed by being with children... and by chess."* — Fyodor Dostoevsky

A beautifully crafted multiplayer chess web application inspired by the literary works of Fyodor Dostoevsky. Play chess with friends online, locally, or challenge the Stockfish AI—all wrapped in a dark, atmospheric Russian literary aesthetic.

![Chess Board Preview](https://img.shields.io/badge/Theme-Dostoevsky-8b2942?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-c9a959?style=for-the-badge)
![Hosting](https://img.shields.io/badge/Hosting-GitHub%20Pages-121214?style=for-the-badge)

## ✨ Features

### Game Modes

- **🏠 The Underground** — Local two-player game on the same device
- **✉️ Crime & Punishment** — Create an online game and invite friends with a shareable link
- **🔗 The Possessed** — Join a friend's game using a room code
- **🎭 The Idiot** — Challenge the Stockfish AI at 5 difficulty levels
- **📖 Notes from Underground** — Free analysis mode for practice

### Gameplay Features

- ♟ Complete chess rules implementation including:
  - Castling (kingside & queenside)
  - En passant captures
  - Pawn promotion with piece selection
  - Check, checkmate, and stalemate detection
  - Draw by insufficient material, threefold repetition, and 50-move rule

- ⏱ Multiple time controls:
  - Untimed
  - Bullet (1 min)
  - Blitz (5 min)
  - Rapid (10 min)
  - Classical (30 min)

- 🎨 Beautiful Dostoevsky-themed UI:
  - Dark, atmospheric color palette
  - Literary quotes throughout
  - Elegant typography with serif fonts
  - Smooth animations and transitions

### Technical Features

- 🌐 **P2P Multiplayer** — WebRTC-based online play via PeerJS
- 🤖 **Stockfish AI** — Full Stockfish.js integration with adjustable difficulty
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🔊 **Sound Effects** — Web Audio API-generated chess sounds
- 📄 **PGN Export** — Save your games in standard format
- 🔗 **Shareable Links** — Invite friends with a simple URL
- 🚫 **No Server Required** — Fully static, hosts on GitHub Pages

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main → root
4. Your game will be live at `https://yourusername.github.io/repository-name`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/brothers-gambit.git

# Navigate to directory
cd brothers-gambit

# Serve with any static server
python -m http.server 8000
# or
npx serve .
# or just open index.html in your browser
```

## 🎮 How to Play

### Playing Online with Friends

1. Click **"Crime & Punishment"** to create a new game
2. Share the 6-character room code or the shareable link with your friend
3. Your friend clicks **"The Possessed"** and enters the code (or uses the link directly)
4. The game begins automatically when both players are connected!

### Playing Against AI

1. Click **"The Idiot"** to challenge the AI
2. Select difficulty:
   - **Raskolnikov** — Beginner
   - **Myshkin** — Intermediate
   - **Karamazov** — Advanced
   - **The Grand Inquisitor** — Master
   - **Dostoevsky** — Maximum strength
3. Choose your color and start playing!

### Controls

- **Click** or **drag** pieces to move
- **🔄** — Flip the board orientation
- **↩** — Undo move (local/AI games only)
- **🤝** — Offer draw
- **🏳** — Resign
- **🔊** — Toggle sound effects

## 🎨 The Dostoevsky Aesthetic

The game draws inspiration from the themes and atmosphere of Dostoevsky's masterworks:

- **Color Palette**: Deep blacks, dark reds (crimson), and candlelight gold—reminiscent of 19th-century Russian interiors
- **Typography**: Elegant serif fonts (Cinzel, Cormorant Garamond, EB Garamond) evoking classical literature
- **Atmosphere**: Fog effects, vignettes, and subtle animations create a moody, contemplative environment
- **Literary Touch**: Rotating quotes from Dostoevsky appear throughout the game

## 🏗 Project Structure

```
brothers-gambit/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # Dostoevsky-themed styling
├── js/
│   ├── chess.js        # Chess game logic engine
│   ├── board.js        # Interactive board UI
│   ├── stockfish.js    # Stockfish AI integration
│   ├── multiplayer.js  # P2P multiplayer (PeerJS)
│   ├── sounds.js       # Web Audio sound effects
│   └── app.js          # Main application controller
└── README.md
```

## 🔧 Technical Details

### Chess Engine

The chess engine (`chess.js`) is a complete implementation with:
- Full legal move generation
- Check and pin detection
- Special move handling (castling, en passant, promotion)
- FEN import/export
- PGN generation
- Threefold repetition and 50-move rule detection

### Multiplayer

Online multiplayer uses **PeerJS** for WebRTC peer-to-peer connections:
- No server infrastructure needed
- Free PeerJS signaling servers
- Direct P2P connection for low latency
- Automatic room code generation

### AI Engine

**Stockfish.js** provides world-class AI:
- Web Worker for non-blocking computation
- Adjustable skill level (1-20)
- Configurable thinking time and depth
- Works entirely in the browser

## 📝 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome for Android)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📜 License

MIT License — feel free to use, modify, and distribute.

## 🙏 Credits

- Chess piece Unicode symbols
- [PeerJS](https://peerjs.com/) for WebRTC abstraction
- [Stockfish.js](https://github.com/nicenumber109/nicenumber109.github.io/tree/master/1/5) for the AI engine
- [Google Fonts](https://fonts.google.com/) for typography
- Fyodor Dostoevsky for eternal literary inspiration

---

*"Beauty will save the world."* — Fyodor Dostoevsky

Made with ♟ and a deep appreciation for Russian literature.

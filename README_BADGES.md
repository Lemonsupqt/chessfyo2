# 🎮 Dostoevsky Chess

[![GitHub Pages](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge)](https://yourusername.github.io/dostoevsky-chess/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Chess.js](https://img.shields.io/badge/Chess.js-v0.10.3-green?style=for-the-badge)](https://github.com/jhlywa/chess.js)
[![Stockfish](https://img.shields.io/badge/Stockfish-v10.0.2-orange?style=for-the-badge)](https://github.com/nmrugg/stockfish.js)
[![PeerJS](https://img.shields.io/badge/PeerJS-v1.5.2-purple?style=for-the-badge)](https://peerjs.com/)

> *"The mystery of human existence lies not in just staying alive, but in finding something to live for."* — Fyodor Dostoevsky

A beautifully crafted multiplayer chess web application that combines strategic gameplay with the profound philosophical atmosphere of Dostoevsky's literary masterpieces.

## 🌟 Highlights

🎭 **Literary Theme** — Immerse yourself in Russian literature  
🤖 **AI Opponent** — Three difficulty levels powered by Stockfish  
🌐 **P2P Multiplayer** — Play with friends anywhere, no server needed  
👥 **Local Mode** — Classic pass-and-play on one device  
📱 **Mobile Ready** — Fully responsive, works everywhere  
⚡ **Zero Setup** — Pure HTML/CSS/JS, deploy to GitHub Pages instantly  
🎨 **Beautiful UI** — Vintage aesthetic with smooth animations  
📖 **Philosophical** — 18 Dostoevsky quotes throughout

## 🚀 Quick Start

### Play Now
👉 **[Play Dostoevsky Chess](https://yourusername.github.io/dostoevsky-chess/)**

### Deploy Your Own (30 seconds)
```bash
# Clone repository
git clone https://github.com/yourusername/dostoevsky-chess.git
cd dostoevsky-chess

# Push to your GitHub
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# Enable GitHub Pages in Settings → Pages
# Your game is now live! 🎉
```

## 📸 Screenshots

### Main Menu
Beautiful landing page with rotating Dostoevsky quotes and atmospheric snow effects.

### Game Modes
Choose from five different ways to play: three AI difficulties, online multiplayer, or local pass-and-play.

### Chess Board
Elegant board with move highlighting, captured pieces display, and complete move history.

### Online Multiplayer
Share a simple 6-character code with friends to play together in real-time.

## 🎯 Features

### Game Modes
- **vs Stockfish (Easy)** — Perfect for beginners
- **vs Stockfish (Medium)** — Balanced challenge
- **vs Stockfish (Hard)** — Master-level play
- **Online Multiplayer** — P2P connection via WebRTC
- **Local Multiplayer** — Pass-and-play

### Chess Features
- Full chess rules (castling, en passant, promotion)
- Legal move validation
- Check/checkmate/stalemate detection
- Move history in standard notation
- Captured pieces tracker
- Undo moves (AI/Local modes)

### Aesthetic Features
- Russian winter theme with snow animation
- Classic book-inspired typography
- Warm brown and gold color palette
- Smooth animations and transitions
- Philosophical quotes from Dostoevsky
- Responsive design for all devices

## 📚 Documentation

- **[README](README.md)** — Full documentation
- **[Quick Start](QUICKSTART.md)** — Get playing in 2 minutes
- **[Deployment](DEPLOYMENT.md)** — GitHub Pages setup
- **[Features](FEATURES.md)** — Complete feature list
- **[Testing](TESTING.md)** — Testing checklist
- **[Project Summary](PROJECT_SUMMARY.md)** — Overview

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling & Animations |
| JavaScript | Game Logic |
| Chess.js | Chess Rules |
| Stockfish.js | AI Engine |
| PeerJS | P2P Networking |
| GitHub Pages | Hosting |

## 🎮 How to Play

### Against AI
1. Click "New Game" → Choose difficulty
2. Play as White against the AI
3. Click pieces to move them

### With Friends Online
1. Click "New Game" → "vs Friend Online"
2. Share the room code with your friend
3. They click "Join Friend" and enter the code
4. Play in real-time!

### Local Multiplayer
1. Click "New Game" → "Local Multiplayer"
2. Pass device between players
3. Traditional chess experience

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ 90+ |
| Firefox | ✅ 88+ |
| Safari | ✅ 14+ |
| Edge | ✅ 90+ |
| Mobile Safari | ✅ iOS 14+ |
| Chrome Mobile | ✅ Android 5+ |

## 📱 Mobile Support

✅ Fully responsive design  
✅ Touch controls optimized  
✅ PWA installable  
✅ Works offline (after first load)  
✅ Portrait & landscape modes  

## 🎨 Customization

The game is easy to customize:

```javascript
// Change AI difficulty
gameState.stockfish.setDifficulty(15); // 1-20

// Add quotes
const dostoevsky_quotes = [
    "Your custom quote here...",
];
```

```css
/* Change colors */
:root {
    --accent-gold: #your-color;
    --bg-dark: #your-background;
}
```

## 🤝 Contributing

Contributions welcome! Ideas:
- Additional difficulty levels
- Chess puzzles mode
- Time controls (blitz/rapid)
- Game analysis
- Tournament mode
- More literary themes
- Sound effects

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **Fyodor Dostoevsky** — Literary inspiration
- **Chess.js** — Robust chess logic
- **Stockfish** — World-class AI
- **PeerJS** — Simple P2P connections
- **GitHub** — Free hosting

## 📊 Stats

- **Code**: 1,736 lines
- **Files**: 12 project files
- **Size**: ~60KB total (excluding libraries)
- **Load Time**: <2 seconds
- **Dependencies**: 3 (CDN-hosted)
- **License**: MIT

## 🔗 Links

- **Demo**: [Live Game](https://yourusername.github.io/dostoevsky-chess/)
- **Repository**: [GitHub](https://github.com/yourusername/dostoevsky-chess)
- **Issues**: [Report Bug](https://github.com/yourusername/dostoevsky-chess/issues)
- **Chess.js**: [Documentation](https://github.com/jhlywa/chess.js)
- **Stockfish**: [Engine Info](https://stockfishchess.org/)

## 💬 Social Media

Share your games!

**Twitter/X**:
```
Just played a beautiful game of chess on Dostoevsky Chess! 
♟️ Literary-themed chess with AI and multiplayer
🎭 "To suffer, is to live" — and to play chess!
[Your URL] #chess #dostoevsky #webdev
```

**Reddit** (r/chess, r/webdev):
```
Made a Dostoevsky-themed chess web app with Stockfish AI 
and P2P multiplayer. Fully open source, deployable to 
GitHub Pages! [Your URL]
```

**Discord**:
```
Check out this beautiful chess app I found/made!
✨ Dostoevsky literary theme
🤖 Stockfish AI (3 difficulties)
🌐 Online multiplayer
📱 Mobile friendly
[Your URL]
```

## 🎯 Perfect For

- **Chess enthusiasts** looking for a beautiful UI
- **Developers** learning web development
- **Students** studying game programming
- **Friends** wanting to play online
- **Literature fans** who appreciate Dostoevsky
- **Anyone** who loves a good game of chess!

## ⭐ Star This Repo

If you enjoyed this project, give it a star! ⭐

## 📞 Contact

Questions? Suggestions? Open an issue or PR!

---

<div align="center">

**"Beauty will save the world."** — Fyodor Dostoevsky

[Play Now](https://yourusername.github.io/dostoevsky-chess/) · [Report Bug](https://github.com/yourusername/dostoevsky-chess/issues) · [Request Feature](https://github.com/yourusername/dostoevsky-chess/issues)

Made with ♟️ and ☕

</div>

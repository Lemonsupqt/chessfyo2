# 🎭 Dostoevsky Chess

*"Pain and suffering are always inevitable for a large intelligence and a deep heart."*

A beautifully themed multiplayer chess web application inspired by the works of Fyodor Dostoevsky. Play chess locally, against the Stockfish AI, or with friends online through peer-to-peer connections.

![Dostoevsky Chess](https://img.shields.io/badge/Chess-Multiplayer-gold?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-181717?style=for-the-badge&logo=github)

## ✨ Features

### 🎮 Three Game Modes

1. **Local Game** - Play with a friend on the same device
2. **vs Stockfish AI** - Challenge yourself against the powerful Stockfish chess engine
   - 6 difficulty levels from Novice to Master
   - Real-time thinking indicator
3. **Online Multiplayer** - Play with friends anywhere in the world
   - Peer-to-peer connection using WebRTC
   - No server required - completely free
   - Built-in chat system
   - Share room codes to invite friends

### 🎨 Dostoevsky-Themed UI

- Dark, literary aesthetic inspired by 19th-century Russia
- Quotes from Dostoevsky's greatest works
- Beautiful starfield background animation
- Gold and crimson accent colors
- Elegant typography with Playfair Display and Crimson Text fonts

### ♟️ Chess Features

- Full chess rules implementation using Chess.js
- Legal move highlighting
- Move validation and capture indicators
- Check and checkmate detection
- Move history with algebraic notation
- FEN and PGN export
- Board flip functionality
- Captured pieces display
- Undo moves (local and AI modes)

### 🎯 Additional Features

- Fully responsive design
- Keyboard shortcuts (Ctrl+Z to undo, F to flip board)
- Game over modal with contextual Dostoevsky quotes
- Real-time game state synchronization in multiplayer
- Connection status indicators

## 🚀 Live Demo

**[Play Dostoevsky Chess →](https://yourusername.github.io/dostoevsky-chess)**

## 📦 Installation & Deployment

### Deploy to GitHub Pages (Recommended)

1. **Fork or Clone this repository**

```bash
git clone https://github.com/yourusername/dostoevsky-chess.git
cd dostoevsky-chess
```

2. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dostoevsky-chess.git
git push -u origin main
```

3. **Enable GitHub Pages**

   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at `https://yourusername.github.io/dostoevsky-chess/`

### Local Development

Simply open `index.html` in a modern web browser. All dependencies are loaded via CDN.

```bash
# Using Python's built-in server
python -m http.server 8000

# Or using Node.js
npx serve

# Then open http://localhost:8000
```

## 🎯 How to Play

### Local Game
1. Click "Begin the Duel" on the Local Game card
2. Take turns moving pieces
3. White starts first

### vs Stockfish AI
1. Click "Face the Algorithm" on the Challenge Stockfish card
2. Play as White against the AI (Black)
3. Adjust difficulty in the sidebar
4. The AI will think before each move

### Online Multiplayer
1. Click "Enter the Network" on the Online Multiplayer card
2. **To Create a Room:**
   - Enter your name
   - Click "Create Room"
   - Share the generated room code with your friend
3. **To Join a Room:**
   - Enter your name
   - Enter the room code your friend shared
   - Click "Join the Battle"
4. Use the chat to communicate during the game

## 🛠️ Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Chess Engine:** [Chess.js](https://github.com/jhlywa/chess.js) - Chess logic and validation
- **AI Engine:** [Stockfish.js](https://github.com/nmrugg/stockfish.js) - Computer opponent
- **Multiplayer:** [PeerJS](https://peerjs.com/) - WebRTC peer-to-peer connections
- **Fonts:** Google Fonts (Playfair Display, Crimson Text)
- **Hosting:** GitHub Pages (static hosting)

## 📁 Project Structure

```
dostoevsky-chess/
├── index.html              # Landing page with game mode selection
├── game.html               # Main game interface
├── styles.css              # All styling and animations
├── app.js                  # Landing page logic
├── game.js                 # Main game controller
├── chess-engine.js         # Chess board and rules logic
├── multiplayer.js          # P2P multiplayer functionality
├── stockfish-integration.js # AI opponent integration
└── README.md               # This file
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo last move (local/AI only)
- `F` - Flip board orientation
- `Escape` - Close modals
- `Enter` - Send chat message (in multiplayer)

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-bg: #0a0a0f;
    --accent-gold: #d4af37;
    --accent-red: #8b0000;
    /* ... more variables */
}
```

### Adding More Quotes

Add quotes to the arrays in `chess-engine.js`:

```javascript
this.quotes = {
    start: [
        { text: "Your quote here", cite: "Source" }
    ],
    // ... more quote categories
};
```

### Adjusting AI Difficulty

Modify the difficulty options in `game.html`:

```html
<option value="10">Custom (Depth 10)</option>
```

## 🐛 Known Limitations

- **Stockfish AI:** May fallback to random moves if CDN is unavailable (rare)
- **Multiplayer:** Both players must keep their browser tabs open during the game
- **Mobile:** Best experienced on tablet or desktop for optimal board size
- **GitHub Pages:** First connection might take a moment as PeerJS establishes

## 🤝 Contributing

Contributions are welcome! Some ideas:

- Add sound effects for moves, captures, and checks
- Implement time controls (blitz, rapid, classical)
- Add game analysis features
- Create an opening book
- Add more Dostoevsky quotes
- Implement game saving/loading
- Add puzzle mode

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Fyodor Dostoevsky** - For the inspiration and profound quotes
- **Chess.js** - Excellent chess logic library
- **Stockfish** - World's strongest open-source chess engine
- **PeerJS** - Simple WebRTC implementation

## 📞 Support

If you encounter any issues:

1. Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
2. Check browser console for errors
3. For multiplayer issues, ensure both players have stable internet
4. Try refreshing the page

## 🌟 Show Your Support

If you enjoyed this project:

- ⭐ Star this repository
- 🍴 Fork it for your own modifications
- 🐛 Report bugs or suggest features
- 📢 Share it with fellow chess and Dostoevsky enthusiasts!

---

*"To live without hope is to cease to live."* — Fyodor Dostoevsky

**Play Responsibly. Suffer Beautifully. Checkmate Gracefully.**

---

Made with ♟️ and 📖 by chess enthusiasts, for chess enthusiasts.

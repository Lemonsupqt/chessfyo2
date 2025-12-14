# Dostoevsky Chess

A beautifully crafted multiplayer chess web application inspired by the philosophical depth and literary genius of Fyodor Dostoevsky. Play chess with friends locally or online, or challenge the mighty Stockfish AI - all wrapped in a dark, contemplative aesthetic.

![Dostoevsky Chess](https://img.shields.io/badge/Chess-Dostoevsky%20Style-gold)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-green)

## 🎭 Features

### Game Modes
- **🤖 vs Stockfish AI**: Challenge yourself against the powerful Stockfish chess engine with adjustable difficulty levels (Novice to Grandmaster)
- **🏠 Local Duel**: Play with a friend on the same device, taking turns
- **🌐 Online Match**: Play with friends anywhere in the world using peer-to-peer connections (no server required!)

### Aesthetic & Theme
- Dark, literary-inspired design with a rich color palette
- Rotating Dostoevsky quotes to contemplate during your games
- Beautiful serif typography (Crimson Text & Playfair Display)
- Smooth animations and elegant UI transitions

### Chess Features
- Full chess rules implementation (castling, en passant, pawn promotion, etc.)
- Move validation and legal move highlighting
- Check and checkmate detection
- Stalemate and draw detection (threefold repetition, insufficient material, 50-move rule)
- Visual last move highlighting
- Captured pieces display
- Complete move history notation
- Game controls: Resign, Offer Draw, New Game

### Technical Highlights
- **No backend required** - Perfect for GitHub Pages hosting
- Peer-to-peer multiplayer using PeerJS
- Stockfish integration for AI gameplay
- Chess.js for robust game logic
- Responsive design (works on mobile, tablet, and desktop)
- Pure vanilla JavaScript - no framework dependencies

## 🚀 Quick Start

### Play Online
Visit the live version: `https://yourusername.github.io/dostoevsky-chess/`

### Local Development
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/dostoevsky-chess.git
   cd dostoevsky-chess
   ```

2. Open `index.html` in your web browser:
   ```bash
   open index.html
   # or
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

That's it! No build process, no dependencies to install.

## 📦 Deployment to GitHub Pages

### Method 1: Automatic with GitHub Actions (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - Dostoevsky Chess"
   git push origin main
   ```

2. Go to your repository settings on GitHub
3. Navigate to **Settings → Pages**
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

Your site will be live at `https://yourusername.github.io/repository-name/` in a few minutes!

### Method 2: Manual Deployment

If you're working in a subdirectory or want more control:

1. Create a `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```

2. In GitHub Settings → Pages, select the `gh-pages` branch

### Important Notes for GitHub Pages
- The site is completely static - no backend needed
- All multiplayer connections are peer-to-peer
- Stockfish loads from CDN (no local files needed)
- Make sure all paths are relative (already configured)

## 🎮 How to Play

### Playing vs AI
1. Select "vs Stockfish" from the main menu
2. Choose your color (White, Black, or Random)
3. Select difficulty level:
   - **Novice**: Depth 1 - Good for beginners
   - **Intermediate**: Depth 5 - Casual play
   - **Advanced**: Depth 10 - Challenging
   - **Master**: Depth 15 - Very difficult
   - **Grandmaster**: Depth 20 - Expert level
4. Click "Begin the Struggle"

### Playing Locally
1. Select "Local Duel"
2. Share the device with your friend
3. Take turns making moves

### Playing Online
1. **Host a game**:
   - Select "Online Match"
   - Click "Create Game"
   - Share the generated link with your friend
   - Wait for them to join

2. **Join a game**:
   - Get the Game ID from your friend
   - Select "Online Match"
   - Enter the Game ID or use the shared link
   - Click "Join Game"

## 🏗️ Project Structure

```
dostoevsky-chess/
├── index.html       # Main HTML structure
├── styles.css       # Complete styling with Dostoevsky theme
├── game.js         # Core game logic, UI management, multiplayer
├── stockfish.js    # Stockfish AI integration wrapper
└── README.md       # This file
```

## 🛠️ Technologies Used

- **Chess.js** (v0.10.3) - Chess game logic and rules
- **PeerJS** (v1.5.2) - WebRTC peer-to-peer connections for online play
- **Stockfish.js** (v10.0.2) - Chess AI engine
- **Google Fonts** - Crimson Text & Playfair Display
- **Vanilla JavaScript** - No frameworks!
- **CSS Grid & Flexbox** - Modern responsive layouts

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --color-bg-primary: #1a1410;
    --color-accent-gold: #d4af37;
    /* ... more variables */
}
```

### Adding More Quotes
Add to the arrays in `game.js`:
```javascript
const dostoevsky_quotes = [
    "Your new quote here...",
    // ...
];
```

### Adjusting Board Size
Modify in `styles.css`:
```css
.chess-board {
    width: 600px;  /* Change this */
    height: 600px; /* And this */
}
```

## 🐛 Troubleshooting

### Stockfish Won't Load
- Check your internet connection (Stockfish loads from CDN)
- Try a different browser
- Check browser console for errors

### Online Game Connection Issues
- Ensure both players have stable internet
- Try regenerating a new game (PeerJS can sometimes have connection issues)
- Check that no browser extensions are blocking WebRTC

### Mobile Display Issues
- The app is responsive but works best on tablets and desktop
- Try landscape mode on smaller phones

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Credits

- **Chess Engine**: [Stockfish](https://stockfishchess.org/)
- **Chess Logic**: [chess.js](https://github.com/jhlywa/chess.js)
- **P2P Connection**: [PeerJS](https://peerjs.com/)
- **Inspiration**: Fyodor Dostoevsky and his profound philosophical works
- **Fonts**: Google Fonts (Crimson Text & Playfair Display)

## 🎯 Future Enhancements

Some ideas for future versions:
- Timer/clock functionality
- Player ratings and statistics
- Game replay and analysis
- More visual themes
- Tournament mode
- Puzzle mode with famous games
- Opening book references

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Contact

Created with ♟️ and philosophical contemplation.

---

*"To live without Hope is to Cease to live."* - Fyodor Dostoevsky

Enjoy your games, and may your moves be as profound as Dostoevsky's prose!

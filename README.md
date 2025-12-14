# Dostoevsky Chess ♟️

> *"The mystery of human existence lies not in just staying alive, but in finding something to live for."*

A beautifully themed chess web application inspired by the profound works of Fyodor Dostoevsky. Play against AI, challenge friends online, or enjoy local multiplayer—all while immersed in the philosophical atmosphere of 19th-century Russian literature.

![Dostoevsky Chess](https://img.shields.io/badge/Chess-Dostoevsky%20Themed-d4af37?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-181717?style=for-the-badge&logo=github)
![PeerJS](https://img.shields.io/badge/P2P-PeerJS-00C853?style=for-the-badge)
![Stockfish](https://img.shields.io/badge/AI-Stockfish-0088cc?style=for-the-badge)

## 🎭 Features

### Game Modes
- **🤖 vs Stockfish AI** - Three difficulty levels (Easy, Medium, Hard)
  - Easy: Perfect for beginners learning chess
  - Medium: A balanced challenge for intermediate players
  - Hard: Face the brutal mastery of Stockfish
  
- **🌐 Online Multiplayer** - Play with friends anywhere via P2P connection
  - No server required - completely peer-to-peer
  - Share a simple room code to connect
  - Real-time gameplay with WebRTC
  
- **👥 Local Multiplayer** - Pass-and-play on the same device
  - Perfect for face-to-face games
  - Classic chess experience

### Aesthetic Features
- **📖 Dostoevsky Quotes** - Philosophical wisdom throughout your game
- **❄️ Russian Winter Theme** - Atmospheric snow effects
- **🎨 Beautiful UI** - Vintage book-inspired design
- **📜 Move History** - Track every move in elegant notation
- **♟️ Captured Pieces** - Visual display of captured pieces
- **✨ Smooth Animations** - Polished transitions and effects

## 🚀 Live Demo

Play now at: **[Your GitHub Pages URL]** (See deployment instructions below)

## 🎮 How to Play

### Starting a Game

1. **Main Menu**: Choose from "New Game", "Join Friend", or read "About"
2. **Select Mode**: Pick your preferred game mode
3. **Play**: Click pieces to move them on the board

### Online Multiplayer Instructions

**Host a Game:**
1. Click "New Game" → "vs Friend Online"
2. Click "Share Code" button to get your room code
3. Share the 6-character code with your friend
4. Wait for them to connect
5. Play!

**Join a Game:**
1. Get the room code from your friend
2. Click "Join Friend" on main menu
3. Enter the room code
4. Start playing!

### Controls

- **Click** on a piece to select it
- **Click** on a highlighted square to move
- **Undo** - Take back your last move (not available in online mode)
- **Resign** - Forfeit the game
- **Menu** - Return to main menu

## 📦 Installation & Deployment

### Quick Deploy to GitHub Pages

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/dostoevsky-chess.git
   cd dostoevsky-chess
   ```

2. **Push to your GitHub repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Select **/ (root)** folder
   - Click **Save**
   - Your site will be live at `https://yourusername.github.io/dostoevsky-chess/`

4. **That's it!** No build process, no dependencies to install. Pure HTML/CSS/JS.

### Local Development

Since this is a pure static site, you can simply open `index.html` in your browser:

```bash
# Option 1: Open directly
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use a local server (recommended)
python -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Use Node.js http-server
npx http-server
```

**Note**: For online multiplayer to work properly, you need to serve the app over HTTP/HTTPS (not file://).

## 🛠️ Technical Details

### Technologies Used

- **Chess.js** - Chess logic and move validation
- **Stockfish.js** - AI chess engine
- **PeerJS** - WebRTC peer-to-peer connections
- **Vanilla JavaScript** - No frameworks needed!
- **CSS3** - Modern styling with animations
- **Google Fonts** - Cinzel & Crimson Text for that classic literary feel

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### File Structure

```
dostoevsky-chess/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── game.js            # Game logic and UI handling
├── stockfish.js       # Stockfish AI integration
└── README.md          # This file
```

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --bg-dark: #1a1410;
    --bg-medium: #2a2218;
    --accent-gold: #d4af37;
    --accent-red: #8b2e2e;
    /* ... etc */
}
```

### Adding More Quotes

Edit the `dostoevsky_quotes` array in `game.js`:

```javascript
const dostoevsky_quotes = [
    "Your quote here...",
    // Add more quotes
];
```

### Adjusting AI Difficulty

Modify Stockfish skill levels in `game.js`:

```javascript
// In startGame() function
gameState.stockfish.setDifficulty(1);   // Easy: 1-5
gameState.stockfish.setDifficulty(10);  // Medium: 8-12
gameState.stockfish.setDifficulty(20);  // Hard: 15-20
```

## 🐛 Troubleshooting

### Online Multiplayer Not Connecting

1. **Check your internet connection** - P2P requires both players online
2. **Try different network** - Some corporate/school networks block WebRTC
3. **Use mobile hotspot** - If your network has strict firewall rules
4. **Check browser console** - Press F12 and look for errors

### Stockfish AI Not Working

1. **Wait a few seconds** - Stockfish needs time to initialize
2. **Check console for errors** - The engine loads from CDN
3. **Try a different browser** - Some browsers may have compatibility issues
4. **Refresh the page** - Sometimes a fresh start helps

### Board Not Displaying Correctly

1. **Clear browser cache** - Old CSS might be cached
2. **Check screen size** - The board is responsive but needs minimum width
3. **Disable browser extensions** - Some extensions interfere with styling

## 📚 About Fyodor Dostoevsky

Fyodor Dostoevsky (1821-1881) was a Russian novelist, philosopher, short story writer, and journalist. His works explore human psychology in the troubled political, social, and spiritual atmospheres of 19th-century Russia. Major works include:

- Crime and Punishment
- The Brothers Karamazov
- The Idiot
- Notes from Underground
- Demons

This chess game pays homage to his profound insights into human nature, morality, and the eternal struggle between reason and passion.

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- 🎨 Additional themes (Tolstoy, Gogol, Chekhov?)
- 🌍 Internationalization (multiple languages)
- 📊 Game statistics and history
- 🏆 Achievement system
- 🎵 Background music/sound effects
- ⏱️ Chess clock/timer
- 📱 PWA support for offline play

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Fyodor Dostoevsky** - For the inspiration
- **Chess.js** - For excellent chess logic library
- **Stockfish** - For the powerful chess engine
- **PeerJS** - For making P2P connections simple
- **Google Fonts** - For beautiful typography

## 📧 Contact

Have questions or suggestions? Feel free to open an issue on GitHub!

---

*"To love someone means to see them as God intended them."* - Fyodor Dostoevsky

**Enjoy your game, and may your moves be as profound as Dostoevsky's words!** ♟️🇷🇺

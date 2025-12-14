# Dostoevsky Chess - A Game of Souls

A beautiful, literary-themed multiplayer chess web application inspired by Fyodor Dostoevsky, featuring dark aesthetics, Stockfish AI integration, and online multiplayer capabilities.

## Features

### 🎨 **Dostoevsky-Inspired Design**
- Dark, melancholic theme with gold accents
- Elegant typography using Crimson Text and Playfair Display fonts
- Russian literature-inspired quotes and aesthetics
- Smooth animations and transitions

### ♟️ **Game Modes**
1. **vs Stockfish AI** - Challenge the powerful Stockfish engine with 5 difficulty levels
2. **Local Multiplayer** - Pass and play on the same device
3. **Online Multiplayer** - Play with friends using PeerJS for peer-to-peer connections

### 🎮 **Game Features**
- Full chess rules implementation using chess.js
- Move history tracking
- Captured pieces display
- Check/checkmate detection
- Draw detection (stalemate, insufficient material, threefold repetition)
- Undo moves
- Resignation
- Game sharing via room codes
- Responsive design for mobile and desktop

### 🌐 **GitHub Pages Ready**
- Fully static - no backend required
- Uses CDN libraries for all dependencies
- PeerJS for free WebRTC signaling
- Easy to deploy and share

## Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies needed - everything runs client-side!

### Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to your repository Settings → Pages
3. Select the branch (usually `main`) and folder (`/root`)
4. Your chess app will be live at `https://yourusername.github.io/repository-name`

## How to Play

### Playing vs AI
1. Click "Play vs Stockfish"
2. Choose your difficulty level (Novice to Master)
3. You play as White, Stockfish plays as Black
4. Click pieces to select them, then click a valid square to move

### Local Multiplayer
1. Click "Local Multiplayer"
2. Players take turns on the same device
3. The board shows whose turn it is

### Online Multiplayer
1. **Creating a Room:**
   - Click "Online Multiplayer" → "Create New Room"
   - Share the 6-character room code with your friend
   - Wait for them to join

2. **Joining a Room:**
   - Click "Join Game" or "Online Multiplayer"
   - Enter the 6-character room code
   - Click "Join"
   - The game will start automatically

3. **Sharing:**
   - Click the "Share Game" button during an online game
   - Copy the link or use your device's share functionality
   - Your friend can click the link to automatically join

## Technical Details

### Dependencies (Loaded via CDN)
- **chess.js** - Chess game logic and rules
- **Stockfish.js** - Chess engine for AI opponent
- **PeerJS** - WebRTC peer-to-peer connections

### Browser Compatibility
- Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- Mobile browsers supported
- Requires JavaScript enabled

### Architecture
- Pure vanilla JavaScript (no frameworks)
- Modular class-based structure
- Event-driven architecture
- Responsive CSS Grid and Flexbox layouts

## Game Controls

- **Select Piece**: Click on a piece
- **Move**: Click on a highlighted square
- **Undo**: Undo the last move
- **Resign**: Forfeit the game
- **New Game**: Start a fresh game
- **Menu**: Access game menu and settings

## Tips

- The board flips automatically when playing as Black vs AI
- Valid moves are highlighted in red when a piece is selected
- Checked kings are highlighted with a pulsing animation
- Move history shows all moves in algebraic notation
- Captured pieces are displayed above/below the board

## Customization

Feel free to customize:
- Colors in `styles.css` (CSS variables)
- Quotes in `index.html`
- AI difficulty levels in `app.js`
- Board styling and animations

## Credits

- Chess logic: [chess.js](https://github.com/jhlywa/chess.js)
- AI Engine: [Stockfish](https://stockfishchess.org/)
- Peer-to-peer: [PeerJS](https://peerjs.com/)
- Design inspiration: Fyodor Dostoevsky's literary works

## License

Free to use and modify. Share with friends and enjoy!

---

*"The soul is healed by being with children"* - Fyodor Dostoevsky

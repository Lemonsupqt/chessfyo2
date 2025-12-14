# The Brothers' Gambit
## A Dostoevsky-Themed Multiplayer Chess Web Application

A beautiful, literary-themed chess web application inspired by Fyodor Dostoevsky's works. Play chess against AI, locally with friends, or online with players around the world.

## Features

### 🎮 Game Modes
- **Play Against AI**: Challenge Stockfish AI with adjustable difficulty levels (Easy, Medium, Hard, Master)
- **Local Multiplayer**: Play with a friend on the same device
- **Online Multiplayer**: Create or join rooms to play with friends online using peer-to-peer connections

### 🎨 Aesthetic Design
- **Dostoevsky Theme**: Dark, literary aesthetic inspired by Russian literature
- **Classic Quotes**: Rotating quotes from Dostoevsky's works displayed throughout gameplay
- **Elegant UI**: Gold accents, serif typography, and a sophisticated color scheme
- **Multiple Themes**: Choose from Classic, Dark, or Sepia board themes

### ♟️ Chess Features
- **Full Chess Rules**: Complete implementation of chess rules including castling, en passant, and pawn promotion
- **Move History**: Track all moves with algebraic notation
- **Game Status**: Real-time display of check, checkmate, draw, and stalemate
- **Board Controls**: Flip board, undo moves, and reset game
- **Stockfish Integration**: Powerful chess engine for AI opponents

### 🌐 Online Features
- **Room System**: Create or join games with 6-character room codes
- **Peer-to-Peer**: Direct connections between players using WebRTC
- **Real-time Sync**: Moves synchronized instantly between players
- **Share Room Codes**: Easy sharing of room codes to invite friends

## Deployment

This application is designed to work on GitHub Pages (static hosting).

### Quick Deploy to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "main" branch as source
   - Save

3. **Access Your App**:
   - Your app will be available at `https://yourusername.github.io/chessfyo2/`

### Local Development

Simply open `index.html` in a web browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## How to Play

### Against AI
1. Click "New Game"
2. Select "Play Against AI"
3. Choose your difficulty level in Settings
4. Make your moves by dragging pieces

### Local Multiplayer
1. Click "New Game"
2. Select "Local Multiplayer"
3. Players take turns on the same device
4. The board indicates whose turn it is

### Online Multiplayer
1. **Host**: Click "New Game" → "Online Multiplayer"
   - A room code will be generated
   - Share this code with your friend
   - Copy the code using the 📋 button

2. **Join**: Click "Join Room"
   - Enter the 6-character room code
   - Click "Join"
   - Wait for connection

## Technical Details

### Technologies Used
- **chess.js**: Chess game logic and rules
- **chessboard.js**: Interactive chess board UI
- **Stockfish.js**: Chess engine for AI opponents
- **PeerJS**: WebRTC peer-to-peer connections for online multiplayer
- **Vanilla JavaScript**: No frameworks, pure JavaScript

### Browser Compatibility
- Modern browsers with WebRTC support (Chrome, Firefox, Edge, Safari)
- Requires JavaScript enabled
- Works best on desktop but is mobile-responsive

## Notes

- Online multiplayer uses PeerJS's free signaling server (0.peerjs.com)
- Stockfish AI may take a moment to initialize on first use
- Room codes are case-insensitive
- Game state is synchronized in real-time for online games

## Credits

Inspired by the literary works of Fyodor Dostoevsky, particularly "The Brothers Karamazov" and "Crime and Punishment".

---

*"The mystery of human existence lies not in just staying alive, but in finding something to live for."* — Fyodor Dostoevsky

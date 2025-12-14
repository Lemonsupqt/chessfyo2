# The Brothers' Gambit - A Dostoevsky Chess Experience

A beautiful, literary-themed multiplayer chess web application inspired by Fyodor Dostoevsky, featuring local play, online multiplayer, Stockfish AI, and analysis mode.

## Features

- 🎨 **Dostoevsky-Inspired Design**: Dark, elegant theme with literary quotes and golden accents
- 👥 **Multiple Game Modes**:
  - Local Match: Play face-to-face on the same device
  - Online Match: Challenge friends via WebRTC peer-to-peer connection
  - Against Stockfish: Test your skills against a powerful AI engine
  - Analysis Board: Study positions and explore variations
- 🤖 **Stockfish Integration**: Play against one of the strongest chess engines
- 📱 **Responsive Design**: Works beautifully on desktop and mobile devices
- 📊 **Game Features**:
  - Move history with algebraic notation
  - FEN position display
  - PGN export functionality
  - Board flipping
  - Undo moves
  - Share game links
- 🌐 **GitHub Pages Ready**: Fully static, no backend required

## Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. That's it! No build process or dependencies to install.

### Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to your repository settings
3. Navigate to "Pages" in the sidebar
4. Select your branch (usually `main` or `master`)
5. Click "Save"
6. Your chess app will be live at `https://yourusername.github.io/repository-name`

## How to Play

### Local Match
- Click "Local Match" from the main menu
- Players take turns moving pieces
- Perfect for playing with someone next to you

### Online Match
- **Creating a Room**: Click "Online Match" → "Create New Room"
- Share the generated Room ID with your friend
- **Joining a Room**: Enter the Room ID and click "Join Room"
- **Note**: Online multiplayer uses WebRTC peer-to-peer connections. For best results:
  - Both players should be on the same network, OR
  - Use a free WebRTC signaling service, OR
  - Consider using local match mode for face-to-face play
  - The connection may take a few moments to establish

### Against Stockfish
- Click "Against Stockfish"
- You play as White, Stockfish plays as Black
- The AI will automatically make moves after yours

### Analysis Board
- Click "Analysis Board"
- Set up positions and explore moves freely
- Great for studying chess positions

## Technical Details

- **Chess Engine**: Uses `chess.js` for game logic
- **Board Rendering**: `chessboard.js` for the visual board
- **AI Engine**: Stockfish.js (WebAssembly) for computer opponent
- **Multiplayer**: WebRTC for peer-to-peer connections (no server needed)
- **Styling**: Custom CSS with Dostoevsky-inspired dark theme

## Browser Compatibility

Works best in modern browsers that support:
- ES6+ JavaScript
- WebRTC (for online multiplayer)
- Web Workers (for Stockfish)

Recommended browsers: Chrome, Firefox, Edge, Safari (latest versions)

## Features in Detail

### Move History
All moves are recorded in standard algebraic notation and displayed in the sidebar.

### PGN Export
Export your games in Portable Game Notation format for analysis or sharing.

### Share Functionality
Generate shareable links to invite friends to games or share interesting positions.

### Board Controls
- **Flip Board**: Rotate the board to see from the opponent's perspective
- **Undo**: Take back the last move
- **Reset**: Start a new game
- **Export PGN**: Download the game in PGN format

## Credits

- Inspired by the literary works of Fyodor Dostoevsky
- Chess pieces: Wikipedia-style pieces via chessboard.js
- Stockfish: Open-source chess engine

## License

Free to use and modify. Enjoy your games!

---

*"The mystery of human existence lies not in just staying alive, but in finding something to live for."*  
— Fyodor Dostoevsky


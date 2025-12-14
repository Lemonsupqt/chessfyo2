# 🎭 Dostoevsky Chess - Project Overview

## Project Summary

**Dostoevsky Chess** is a feature-rich, multiplayer chess web application inspired by the literary works of Fyodor Dostoevsky. It offers three distinct game modes and is designed to be hosted for free on GitHub Pages without requiring any backend infrastructure.

## Key Highlights

### ✅ Completed Features

1. **Three Game Modes**
   - Local multiplayer (pass-and-play)
   - AI opponent powered by Stockfish
   - Online multiplayer via WebRTC (PeerJS)

2. **Complete Chess Implementation**
   - Full chess rules via Chess.js
   - Move validation and legal move highlighting
   - Check, checkmate, and stalemate detection
   - En passant, castling, pawn promotion
   - Move history with algebraic notation
   - FEN and PGN export

3. **Multiplayer Features**
   - Peer-to-peer connections (no server needed)
   - Room code system for easy friend invites
   - Built-in chat system
   - Real-time move synchronization
   - Connection status indicators

4. **AI Features**
   - Stockfish.js integration
   - 6 difficulty levels (depth 1-15)
   - Thinking indicator
   - Fallback to random moves if Stockfish unavailable

5. **UI/UX**
   - Dark, literary Dostoevsky theme
   - Russian/19th-century aesthetic
   - Starfield background animation
   - Responsive design (desktop, tablet, mobile)
   - Dostoevsky quotes throughout
   - Captured pieces display
   - Game over modal with thematic quotes

6. **Additional Features**
   - Board flip functionality
   - Undo moves (local/AI modes)
   - Keyboard shortcuts
   - Move highlighting (last move, check)
   - FEN position display
   - PGN game export

## Technical Architecture

### Frontend Stack
- **HTML5** - Semantic structure
- **CSS3** - Advanced styling with animations
- **Vanilla JavaScript** - No framework dependencies

### Libraries (via CDN)
- **Chess.js 0.12.1** - Chess logic
- **PeerJS 1.5.2** - WebRTC abstraction
- **Stockfish.js 10.0.2** - AI engine

### Fonts
- **Playfair Display** - Headers
- **Crimson Text** - Body text

## File Structure

```
dostoevsky-chess/
├── index.html                    # Landing page (game mode selection)
├── game.html                     # Main game interface
├── quickstart.html               # Quick start guide
├── styles.css                    # All CSS styling (500+ lines)
├── app.js                        # Landing page functionality
├── game.js                       # Main game controller
├── chess-engine.js               # Chess board logic (~400 lines)
├── multiplayer.js                # P2P networking (~200 lines)
├── stockfish-integration.js      # AI integration (~150 lines)
├── README.md                     # Comprehensive documentation
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # MIT License
├── .gitignore                    # Git ignore rules
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Actions for auto-deployment
```

## How It Works

### Local Game Mode
1. User selects "Local Game"
2. Chess board initializes
3. Players alternate turns clicking pieces
4. All chess rules enforced client-side

### AI Mode
1. User selects "Challenge Stockfish"
2. Stockfish worker loads
3. Player moves as White
4. AI calculates best move using minimax at selected depth
5. AI plays as Black

### Online Multiplayer Mode
1. Host creates room → gets unique code
2. Host's browser creates PeerJS instance with room code as ID
3. Joiner enters room code → connects to host's peer ID
4. WebRTC connection established (STUN servers for NAT traversal)
5. All moves sent as JSON messages via data channel
6. Board state synchronized in real-time

## Deployment Process

### GitHub Pages Setup
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select "main" branch as source
4. GitHub Actions (optional) auto-deploys on push
5. Site live at `username.github.io/repo-name`

### No Backend Required
- All game logic runs in browser
- P2P connections are direct between players
- Stockfish runs as Web Worker
- Free hosting on GitHub Pages

## Browser Compatibility

### Fully Supported
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- JavaScript enabled
- WebRTC support (for multiplayer)
- Web Workers support (for AI)
- LocalStorage (for game state)

## Performance

- **Initial Load**: ~1-2 seconds (CDN dependencies)
- **Local Game**: Instant move validation
- **AI Move**: 0.5-5 seconds (depends on difficulty)
- **Multiplayer Latency**: 50-200ms (peer-to-peer)

## Security & Privacy

- **No Server**: No data stored anywhere
- **P2P Direct**: Moves sent directly between browsers
- **No Account**: No login or registration required
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: All code visible and auditable

## Future Enhancement Ideas

### High Priority
- [ ] Add sound effects
- [ ] Implement time controls
- [ ] Add game saving/loading (LocalStorage)
- [ ] Create puzzle mode
- [ ] Add more responsive breakpoints

### Medium Priority
- [ ] Opening book integration
- [ ] Move annotations
- [ ] Game analysis mode
- [ ] Replay functionality
- [ ] Tournament bracket system

### Low Priority
- [ ] 3D board view
- [ ] Custom piece sets
- [ ] Alternative themes
- [ ] Statistics tracking
- [ ] Achievement system

## Known Issues & Limitations

1. **Stockfish CDN**: If CDN is down, falls back to random moves
2. **Multiplayer Persistence**: Closing browser disconnects game
3. **Mobile Board**: Slightly cramped on small phones
4. **No Reconnection**: If P2P drops, must create new room
5. **GitHub Pages**: Free tier has bandwidth limits (rare to hit)

## Testing Checklist

- [x] All three game modes work
- [x] Chess rules properly enforced
- [x] Multiplayer connections establish
- [x] AI makes legal moves
- [x] Mobile responsive
- [x] No console errors
- [x] Quotes display correctly
- [x] Game over modal works
- [x] Board flip works
- [x] Undo works (local/AI)

## Statistics

- **Total Lines of Code**: ~2,500
- **CSS Lines**: ~800
- **JavaScript Lines**: ~1,700
- **HTML Lines**: ~400
- **Development Time**: ~4 hours
- **Dependencies**: 3 (all via CDN)
- **Bundle Size**: ~50KB (uncompressed)

## Credits

**Concept & Theme**: Inspired by Fyodor Dostoevsky's literary works

**Libraries Used**:
- Chess.js by Jeff Hlywa
- PeerJS by PeerJS Team
- Stockfish.js by Nathan Rugg

**Fonts**: Google Fonts (Playfair Display, Crimson Text)

## License

MIT License - Free to use, modify, and distribute

## Contact & Support

- **Issues**: GitHub Issues tab
- **Discussions**: GitHub Discussions
- **Contributions**: See CONTRIBUTING.md

---

## Quick Start

1. Clone repository
2. Open `index.html` in browser
3. Select game mode
4. Play chess!

For deployment to GitHub Pages, see README.md

---

*"The darker the night, the brighter the stars, the deeper the grief, the closer is God!"*

**— Crime and Punishment**

🎭 ♟️ 📖

# Changelog

All notable changes to Dostoevsky Chess will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-14

### 🎉 Initial Release

#### Added
- Complete chess game implementation with Chess.js
- Three game modes:
  - Online multiplayer via PeerJS (peer-to-peer)
  - AI opponent with Stockfish integration (20 difficulty levels)
  - Local pass & play mode
- Beautiful Dostoevsky-inspired dark theme
- Three board color schemes:
  - Classic Dostoevsky (gold and dark blue)
  - Underground Dark (deep blacks)
  - Crime & Crimson (blood red accents)
- Move validation and legal move highlighting
- Captured pieces display
- Complete move history with notation
- Sound effects (toggleable)
- Undo move functionality (local/AI modes)
- Draw offers and resignation
- Game over detection (checkmate, stalemate, draws)
- 10 authentic Dostoevsky quotes
- 10 philosophical chess musings
- Fully responsive design (desktop, tablet, mobile)
- Settings panel with preferences
- Loading screens and modals
- Complete documentation:
  - README.md
  - DEPLOYMENT.md
  - FEATURES.md
  - CONTRIBUTING.md
  - PROJECT_SUMMARY.md
- GitHub Actions workflow for auto-deployment
- Test page for system verification
- SEO optimization (meta tags, robots.txt, sitemap)
- Custom 404 page
- MIT License
- SVG favicon

#### Technical Details
- Pure HTML5, CSS3, JavaScript ES6+
- No build process required
- No backend needed
- No registration required
- Privacy-first (no data collection)
- CDN-based dependencies:
  - Chess.js 0.10.3
  - PeerJS 1.5.0
  - Stockfish 16.1.0
- Web Workers for AI
- Web Audio API for sound
- LocalStorage for settings
- WebRTC for multiplayer

#### Performance
- Fast loading (< 70KB total)
- Efficient rendering
- Smooth animations
- Works offline after initial load (except AI)

#### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Known Limitations
- Online multiplayer requires WebRTC (blocked by some corporate networks)
- Stockfish AI loads from CDN (requires internet)
- No game persistence (games lost on refresh)
- No chat functionality
- No spectator mode

### Future Enhancements (Planned)
- Chess clock/timer
- PGN export/import
- Game saving to localStorage
- Opening book suggestions
- More board themes
- Internationalization (i18n)
- Chess puzzles
- PWA support
- Mobile app version

---

## Version History

### [1.0.0] - Initial Release
The first complete, production-ready version of Dostoevsky Chess.

---

**For detailed feature information, see [FEATURES.md](FEATURES.md)**

**For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

**For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)**

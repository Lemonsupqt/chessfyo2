# The Brothers' Gambit - Dostoevsky Chess WebApp

A beautifully crafted multiplayer chess web application with a dark, literary aesthetic inspired by Fyodor Dostoevsky's works. Play chess with friends online, challenge AI opponents, or practice your skills—all in a beautifully designed interface.

## Features

### 🎮 Game Modes

- **Local Game**: Play against a friend on the same device
- **Online Match**: Share a link with friends to play multiplayer chess
- **AI Opponent**: Challenge Stockfish AI with adjustable difficulty levels (Novice to Grandmaster)
- **Practice Mode**: Take your time and practice without time pressure

### 🎨 Design & Aesthetics

- **Dostoevsky-Inspired Theme**: Dark, philosophical aesthetic with literary quotes
- **Elegant UI**: Vintage paper-like textures, gold accents, and classic typography
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices

### ♟️ Chess Features

- Full chess rules implementation
- Move history with algebraic notation
- Visual move hints and highlights
- Check/checkmate detection
- Draw detection (stalemate, threefold repetition, insufficient material, fifty-move rule)
- Share game functionality (PGN export)
- Resignation and draw offers

### 🤖 AI Integration

- **Stockfish Engine**: Powered by Stockfish.js (Level 1-20)
- **Adjustable Difficulty**: From beginner-friendly to grandmaster-level play
- **Smooth Gameplay**: AI moves are calculated and executed automatically

### 🌐 Multiplayer

- **Peer-to-Peer**: Uses browser localStorage for simple multiplayer (works offline)
- **Easy Sharing**: Generate and share game links with friends
- **Real-time Updates**: Moves sync automatically between players

## Getting Started

### Hosting on GitHub Pages

1. **Fork or clone this repository**
   ```bash
   git clone <your-repo-url>
   cd chessfyo2
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access your game**
   - Your chess app will be available at: `https://<your-username>.github.io/chessfyo2/`

### Local Development

Simply open `index.html` in a modern web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## How to Play

### Starting a Game

1. Choose your game mode from the main menu
2. For online games, share the generated link with your friend
3. For AI games, select your preferred difficulty level
4. Start playing!

### Making Moves

- Click on a piece to select it
- Click on a highlighted square to move
- Possible moves are highlighted automatically
- Move history is displayed on the right side

### Game Controls

- **New Game**: Start a fresh game
- **Resign**: Forfeit the current game
- **Offer Draw**: Propose a draw to your opponent
- **Share Game**: Copy game link or PGN notation

## Technical Details

### Technologies Used

- **HTML5/CSS3**: Modern web standards
- **JavaScript (ES6+)**: Core game logic
- **chess.js**: Chess rules engine
- **Stockfish.js**: AI chess engine
- **Web APIs**: localStorage for multiplayer, Web Share API

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires JavaScript enabled and modern browser support for ES6+ features.

## Project Structure

```
chessfyo2/
├── index.html          # Main HTML structure
├── styles.css          # Dostoevsky-themed styling
├── chess.js           # Chess game logic
├── multiplayer.js     # Multiplayer functionality
├── app.js             # Main application controller
└── README.md          # This file
```

## Customization

### Changing AI Difficulty

The AI difficulty can be adjusted in the game settings panel when playing against Stockfish. Levels range from 1 (Novice) to 20 (Grandmaster).

### Styling

The Dostoevsky theme can be customized by modifying CSS variables in `styles.css`:

```css
:root {
    --dark-bg: #1a1a1a;
    --accent-gold: #d4af37;
    --board-light: #d4af37;
    --board-dark: #8b4513;
    /* ... */
}
```

## Future Enhancements

Potential features for future versions:
- Timer/clock functionality
- Game replay and analysis
- Opening book suggestions
- Puzzle mode
- Tournament mode
- Sound effects
- More Dostoevsky quotes and literary references

## Credits

- **Chess Engine**: [chess.js](https://github.com/jhlywa/chess.js)
- **AI Engine**: [Stockfish.js](https://github.com/niklasf/stockfish.js)
- **Inspiration**: Fyodor Dostoevsky's literary works
- **Fonts**: Google Fonts (Crimson Text, Playfair Display)

## License

This project is open source and available for personal and educational use.

## Quotes

> "In every man's memories there are things he will not reveal to everyone"
> — Fyodor Dostoevsky

Enjoy your games of chess, and may your moves be as thoughtful as Dostoevsky's prose! 🎭♟️

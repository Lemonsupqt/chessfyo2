# 🎭 Dostoevsky Chess

> *"To live without hope is to cease to live."* — Fyodor Dostoevsky

A hauntingly beautiful multiplayer chess web application inspired by the dark psychological depths of Fyodor Dostoevsky's literary works. Play chess while immersed in 19th-century Russian aesthetic, complete with philosophical musings and existential dread.

![Dostoevsky Chess](https://img.shields.io/badge/Chess-Dostoevsky%20Edition-gold?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Play-crimson?style=for-the-badge)

## 🌟 Features

### 🎮 Multiple Game Modes
- **🌐 Online Multiplayer**: Play with friends anywhere using peer-to-peer connection (no server needed!)
- **🤖 AI Opponent**: Face off against Stockfish chess engine with 20 difficulty levels
- **👥 Pass & Play**: Local two-player mode for face-to-face psychological warfare

### 🎨 Dostoevsky-Inspired Design
- **Dark Russian Aesthetic**: Immersive 19th-century atmosphere with gold accents and crimson highlights
- **Philosophical Musings**: Dynamic quotes from Dostoevsky's masterpieces
- **Three Board Themes**: Classic Dostoevsky, Underground Dark, and Crime & Crimson
- **Elegant Typography**: Using Cinzel and Crimson Text fonts for authentic period feel

### ⚡ Rich Gameplay Features
- **Move Validation**: Full chess rules implementation via Chess.js
- **Move History**: Track every move in elegant notation
- **Captured Pieces Display**: Visual representation of captured pieces
- **Move Highlights**: Visual feedback for valid moves and captures
- **Sound Effects**: Atmospheric audio feedback (toggleable)
- **Undo Functionality**: Take back moves in local and AI modes
- **Draw Offers**: Propose draws in any game mode
- **Responsive Design**: Plays beautifully on desktop, tablet, and mobile

### 🔧 Technical Features
- **No Backend Required**: Pure client-side application, perfect for GitHub Pages
- **Peer-to-Peer Multiplayer**: Uses PeerJS for WebRTC connections
- **Stockfish Integration**: Powerful chess engine with adjustable difficulty
- **Progressive Enhancement**: Works even if AI fails to load
- **Cross-Browser Compatible**: Works on all modern browsers

## 🚀 Quick Start

### Play Online (Recommended)
Visit the live deployment: **[Your GitHub Pages URL]**

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dostoevsky-chess.git
   cd dostoevsky-chess
   ```

2. **Serve the files**
   
   Option A - Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Option B - Using Node.js:
   ```bash
   npx serve
   ```
   
   Option C - Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

⚠️ **Important**: You must use a local server, not just open `index.html` directly, due to Web Worker security requirements.

## 📦 Deployment to GitHub Pages

### Method 1: Automatic GitHub Pages (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Dostoevsky Chess"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **main** branch and **/ (root)** folder
   - Click **Save**

3. **Wait a few minutes** and your site will be live at:
   ```
   https://yourusername.github.io/repository-name/
   ```

### Method 2: Using gh-pages Branch

1. **Create and deploy to gh-pages branch**
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```

2. **Enable GitHub Pages**
   - Go to **Settings** → **Pages**
   - Select **gh-pages** branch
   - Click **Save**

### Method 3: GitHub Actions (Advanced)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## 🎯 How to Play

### Starting a Game

#### Online Multiplayer
1. Click **"Play Online"**
2. Choose to **Host** or **Join**:
   - **Host**: Share your generated Game ID with a friend
   - **Join**: Enter your friend's Game ID
3. Wait for connection and start playing!

#### AI Opponent
1. Click **"Face the Machine"**
2. Choose your color (White, Black, or Random)
3. Select difficulty level (1-20)
4. Begin your psychological battle with Stockfish!

#### Pass & Play
1. Click **"Pass & Play"**
2. Take turns with a friend on the same device
3. Embrace the existential suffering together!

### Game Controls
- **Click a piece** to select it
- **Click a highlighted square** to move
- **↶ Undo**: Take back the last move (local/AI only)
- **½ Draw**: Offer or accept a draw
- **⚑ Resign**: Admit defeat
- **☰ Menu**: Return to main menu

### Settings
- **Sound Effects**: Toggle audio feedback
- **Move Highlights**: Show/hide valid move indicators
- **Board Theme**: Choose between three aesthetic themes

## 📁 Project Structure

```
dostoevsky-chess/
│
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with themes
├── game.js            # Game logic and state management
├── stockfish.js       # Stockfish AI integration
└── README.md          # This file
```

## 🛠️ Technologies Used

- **HTML5 & CSS3**: Modern, responsive design
- **JavaScript (ES6+)**: Clean, modular code
- **[Chess.js](https://github.com/jhlywa/chess.js)**: Chess logic and validation
- **[PeerJS](https://peerjs.com/)**: WebRTC peer-to-peer connections
- **[Stockfish](https://stockfishchess.org/)**: Powerful chess engine
- **Web Audio API**: Dynamic sound generation
- **Google Fonts**: Cinzel & Crimson Text

## 🎨 Customization

### Changing Board Themes

Edit the CSS variables in `styles.css`:

```css
:root {
    --board-light: #d4af37;  /* Light square color */
    --board-dark: #1a1a28;   /* Dark square color */
    --accent-gold: #d4af37;  /* Gold accents */
    --accent-crimson: #8b1538; /* Crimson accents */
}
```

### Adding More Quotes

Edit the `dostoevskiyQuotes` array in `game.js`:

```javascript
const dostoevskiyQuotes = [
    { 
        text: "Your custom quote here", 
        author: "Book Title" 
    },
    // Add more...
];
```

### Adjusting AI Difficulty

Modify the skill level range in the AI setup:

```javascript
// In game.js
aiDifficulty = parseInt(value); // 1-20 range
```

## 🐛 Troubleshooting

### Online Multiplayer Not Connecting
- **Firewall**: Check if WebRTC is blocked by your firewall
- **Network**: Some corporate networks block peer-to-peer connections
- **Browser**: Try a different browser (Chrome/Firefox recommended)

### AI Not Working
- **Check Console**: Open browser DevTools (F12) and check for errors
- **Fallback Mode**: The game includes a simple AI fallback if Stockfish fails
- **Network**: Ensure you have internet access (AI loads from CDN)

### Sound Not Playing
- **Browser Permissions**: Some browsers block autoplay audio
- **Settings**: Check if sound is enabled in the game settings
- **Volume**: Check your system volume

### Board Not Displaying Correctly
- **Clear Cache**: Try clearing your browser cache
- **Update Browser**: Ensure you're using a modern browser
- **Check Console**: Look for JavaScript errors in DevTools

## 🤝 Contributing

Contributions are welcome! This is a perfect project for:
- UI/UX improvements
- Additional themes
- More Dostoevsky quotes and musings
- Bug fixes
- Performance optimizations

### To Contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is open source and available under the MIT License.

## 🎭 Credits

### Inspiration
- **Fyodor Dostoevsky** - For the philosophical depth and dark aesthetic
- The great works: *Crime and Punishment*, *The Brothers Karamazov*, *The Idiot*

### Libraries
- [Chess.js](https://github.com/jhlywa/chess.js) by Jeff Hlywa
- [PeerJS](https://peerjs.com/) - Simple peer-to-peer with WebRTC
- [Stockfish](https://stockfishchess.org/) - UCI chess engine

### Fonts
- [Cinzel](https://fonts.google.com/specimen/Cinzel) - For titles
- [Crimson Text](https://fonts.google.com/specimen/Crimson+Text) - For body text

## 📞 Support

If you encounter issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review browser console for error messages

## 🌟 Acknowledgments

Special thanks to:
- The chess programming community
- Dostoevsky fans and Russian literature enthusiasts
- Open source chess engine developers
- Everyone who appreciates the marriage of technology and literature

---

<div align="center">

**"The degree of civilization in a society can be judged by entering its prisons... or observing its chess games."**

*Inspired by Fyodor Dostoevsky*

Made with ♟️ and existential dread

[⭐ Star this project](https://github.com/yourusername/dostoevsky-chess) if it speaks to your soul!

</div>

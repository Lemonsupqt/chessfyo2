# ♚ The Grand Inquisitor's Chess

> *"Beauty will save the world."* — Fyodor Dostoevsky

A beautifully crafted, Dostoevsky-themed multiplayer chess web application. Play against friends locally, challenge the Stockfish AI, or connect online through peer-to-peer connections — all with the dark, literary atmosphere of 19th century Russian literature.

![Chess Banner](https://img.shields.io/badge/Chess-Dostoevsky%20Theme-8b0000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7impo8L3RleHQ+PC9zdmc+)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?style=for-the-badge&logo=github)
![No Backend](https://img.shields.io/badge/Backend-None%20Required-d4af37?style=for-the-badge)

## ✨ Features

### 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **Brothers Karamazov** | Local two-player match — share the board with a friend beside you |
| **Crime & Punishment** | Face the relentless Stockfish AI with adjustable difficulty (1-20) |
| **Notes from Underground** | Online P2P multiplayer — connect with distant friends |
| **The Idiot's Study** | Analysis board with real-time Stockfish evaluation |

### 🎨 Dostoevsky Theme
- Dark, atmospheric design inspired by 19th century Russian literature
- Literary quotes from Dostoevsky's works throughout the experience
- AI difficulty levels named after famous characters (Sonya, Dmitri, Ivan, Porfiry, Smerdyakov, The Inquisitor)
- Candle-flicker animations and fog effects for immersive atmosphere

### ♟️ Chess Features
- Full chess rules implementation (castling, en passant, promotion, etc.)
- Drag-and-drop and click-to-move piece movement
- Legal move highlighting
- Move history with algebraic notation
- Captured pieces display
- Multiple time controls (Bullet to Classical)
- Board flip option

### 🤖 Stockfish Integration
- Adjustable AI difficulty (20 levels)
- Real-time position analysis
- Evaluation bar and best move suggestions
- Post-game analysis mode

### 🌐 Online Multiplayer
- Peer-to-peer connection (no account required!)
- Simple game codes for easy sharing
- Shareable links to invite friends
- Draw offers and resignation
- Real-time move synchronization

## 🚀 Hosting on GitHub Pages

This application is designed to be hosted on GitHub Pages with **zero configuration required**.

### Quick Deploy

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/dostoevsky-chess.git
   ```

2. **Push to your GitHub repository**
   ```bash
   git remote set-url origin https://github.com/yourusername/dostoevsky-chess.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Select the **main** branch and **/ (root)** folder
   - Click **Save**

4. **Access your site**
   - Your chess app will be available at: `https://yourusername.github.io/dostoevsky-chess/`
   - It may take a few minutes for the first deployment

### Why It Works on GitHub Pages

- ✅ **100% Static** — Pure HTML, CSS, and JavaScript
- ✅ **No Backend Required** — All logic runs in the browser
- ✅ **CDN Dependencies** — Chess.js, PeerJS, and Stockfish loaded from CDN
- ✅ **P2P Multiplayer** — Uses PeerJS for direct browser-to-browser connections

## 🎯 How to Play

### Local Game (Brothers Karamazov)
1. Click "Brothers Karamazov" on the main menu
2. Set your preferred time control
3. Take turns playing on the same device
4. Pass the device to your friend after each move

### vs AI (Crime & Punishment)
1. Click "Crime & Punishment" on the main menu
2. Choose your difficulty level (1-20)
3. Select your color (White, Black, or Random)
4. Battle against Stockfish!

### Online Multiplayer (Notes from Underground)
1. Click "Notes from Underground" on the main menu
2. **To create a game:**
   - Click "Create Game"
   - Share the game code or link with your friend
   - Wait for them to connect
3. **To join a game:**
   - Click "Join Game"
   - Enter the game code shared by your friend
   - Click "Join Game"

### Analysis Mode (The Idiot's Study)
1. Click "The Idiot's Study" on the main menu
2. Set up any position or play through moves
3. Watch real-time Stockfish evaluation
4. Use undo to explore different variations

## ⚙️ Time Controls

| Name | Duration | Theme |
|------|----------|-------|
| Unlimited | ∞ | Eternal Contemplation |
| 1 min | Bullet | Raskolnikov's Panic |
| 3 min | Blitz | The Underground Man |
| 5 min | Rapid | Alyosha's Pace |
| 10 min | Classical | Ivan's Deliberation |
| 15 min | Correspondence | Father Zosima |
| 30 min | Tournament | The Grand Inquisitor |

## 🛠️ Technical Details

### Dependencies (loaded via CDN)
- [chess.js](https://github.com/jhlywa/chess.js) — Chess move generation and validation
- [PeerJS](https://peerjs.com/) — WebRTC peer-to-peer connections
- [Stockfish.js](https://github.com/nicotaing/stockfish.js) — Chess engine compiled to JavaScript

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

### File Structure
```
dostoevsky-chess/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Dostoevsky theme styles
├── js/
│   ├── game.js         # Chess game logic
│   ├── ui.js           # UI rendering
│   ├── stockfish-wrapper.js  # Stockfish integration
│   ├── multiplayer.js  # P2P multiplayer
│   └── main.js         # Application entry point
└── README.md           # This file
```

## 📱 Sharing with Friends

### Online Play
1. Create a game and get the code (e.g., `ABC123`)
2. Share the code or the full link:
   - **Code**: `ABC123`
   - **Link**: `https://yourusername.github.io/dostoevsky-chess/?join=ABC123`
3. When your friend opens the link, they'll automatically join your game!

### Local Play (IRL)
Simply open the app on any device and select "Brothers Karamazov" mode. Take turns on the same device — perfect for playing with friends in person!

## 🎨 Customization

The theme colors can be modified in `css/style.css` by changing the CSS variables:

```css
:root {
    --gold-bright: #d4af37;      /* Gold accents */
    --crimson-bright: #8b0000;   /* Red accents */
    --bg-darkest: #0a0a0c;       /* Background */
    --square-light: #e8d5b0;     /* Light squares */
    --square-dark: #4a3728;      /* Dark squares */
}
```

## 📖 Quotes

The application features quotes from Fyodor Dostoevsky's works, including:

- *Crime and Punishment*
- *The Brothers Karamazov*
- *The Idiot*
- *Notes from Underground*
- *Demons*

> *"Pain and suffering are always inevitable for a large intelligence and a deep heart."*

## 📄 License

MIT License — Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Fyodor Dostoevsky for the literary inspiration
- The chess.js team for the excellent chess library
- PeerJS for making P2P simple
- The Stockfish team for the world's strongest chess engine

---

<p align="center">
  <em>"To go wrong in one's own way is better than to go right in someone else's."</em>
  <br>
  <strong>— Fyodor Dostoevsky</strong>
</p>

<p align="center">
  Made with ☦️ and chess pieces
</p>

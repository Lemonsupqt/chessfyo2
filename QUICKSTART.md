# 🎮 Quick Start Guide - Dostoevsky Chess

## Welcome to Dostoevsky Chess!

This guide will help you start playing in under 5 minutes.

---

## 📥 Step 1: Get the Code

### Option A: Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/dostoevsky-chess.git
cd dostoevsky-chess
```

### Option B: Download ZIP
1. Click the green "Code" button on GitHub
2. Select "Download ZIP"
3. Extract the files
4. Open the folder in your terminal

---

## 🚀 Step 2: Start the Server

### On Linux/Mac:
```bash
./start.sh
```

### On Windows:
```bash
python -m http.server 8000
```

### Alternative Methods:
```bash
# Using Python 3
python3 -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js
npx serve
```

---

## 🌐 Step 3: Open in Browser

Open your web browser and go to:
```
http://localhost:8000
```

---

## 🎯 Step 4: Choose Your Game Mode

### 🌐 Online Multiplayer
1. Click **"Play Online"**
2. Choose **Host** to create a game
3. Share your Game ID with a friend
4. Wait for them to join
5. Play!

**To join a friend's game:**
1. Click **"Play Online"**
2. Choose **Join**
3. Enter your friend's Game ID
4. Play!

### 🤖 AI Opponent
1. Click **"Face the Machine"**
2. Choose your color (White/Black/Random)
3. Select difficulty (1-20)
4. Click **"Begin the Suffering"**
5. Play against Stockfish AI!

### 👥 Pass & Play
1. Click **"Pass & Play"**
2. Take turns with a friend
3. Board automatically rotates!

---

## 🎨 Step 5: Customize (Optional)

### Change Board Theme
1. Click the **Menu** button (☰)
2. Select **Settings**
3. Choose your theme:
   - Classic Dostoevsky (Gold & Dark Blue)
   - Underground Dark (Deep Blacks)
   - Crime & Crimson (Blood Red)

### Toggle Features
- **Sound Effects**: On/Off
- **Move Highlights**: Show/Hide

---

## 🎭 Playing the Game

### How to Move
1. **Click** a piece to select it
2. **Click** a highlighted square to move
3. Valid moves are shown automatically

### Game Controls
- **↶ Undo**: Take back last move (local/AI only)
- **½ Draw**: Offer or accept a draw
- **⚑ Resign**: Give up (if you dare)
- **☰ Menu**: Return to main menu

### Chess Rules
- All standard chess rules apply
- Special moves work: castling, en passant, promotion
- Game ends on: checkmate, stalemate, or draw

---

## 🚀 Deploy to GitHub Pages

### Quick Deploy:
```bash
# 1. Create GitHub repository
# 2. Push your code
git add .
git commit -m "Initial commit"
git push origin main

# 3. Enable GitHub Pages in repository settings
# Settings → Pages → Source: main branch
```

Your game will be live at:
```
https://YOUR-USERNAME.github.io/REPO-NAME/
```

**Detailed instructions:** See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 💡 Tips & Tricks

### Online Multiplayer
- Share Game IDs via WhatsApp, Discord, SMS, Email
- Works worldwide - no geographic restrictions
- Both players need stable internet

### AI Games
- Start with difficulty 5-8 for fun games
- Difficulty 15+ is challenging even for strong players
- Try different colors to practice openings

### Performance
- Works best on Chrome or Firefox
- Desktop gives you 3-panel view (best experience)
- Mobile works great for casual games

---

## 🐛 Troubleshooting

### "AI not working"
- Check your internet (Stockfish loads from CDN)
- Game will use fallback AI if Stockfish fails
- Clear cache and reload

### "Can't connect online"
- Check firewall settings
- Try different browser
- Some corporate networks block WebRTC

### "Page won't load"
- Must use HTTP server (not file://)
- Check all files are present
- Try different port: `python -m http.server 9000`

---

## 📚 More Resources

- **Full Documentation**: [README.md](README.md)
- **All Features**: [FEATURES.md](FEATURES.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Version History**: [CHANGELOG.md](CHANGELOG.md)

---

## 🎉 You're Ready!

Start playing and enjoy the existential suffering of chess! 🎭♟️

> *"To live without hope is to cease to live."*  
> — Fyodor Dostoevsky

---

## ❓ Need Help?

- Open an issue on GitHub
- Check the documentation
- Read the FAQ in README.md

**Enjoy your game!** 🎮

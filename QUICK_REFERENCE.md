# 📖 Dostoevsky Chess - Quick Reference

## 🚀 Fastest Deploy (Copy & Paste)

```bash
# 1. Create a new GitHub repository (do this on GitHub.com first)

# 2. Run these commands:
git add .
git commit -m "Initial commit: Dostoevsky Chess web app"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 3. Enable GitHub Pages:
#    Go to: Settings → Pages → Source: main, / (root) → Save
```

## 🎮 What You Built

A complete chess web application with:
- ♟️ Full chess rules implementation
- 🤖 Stockfish AI (5 difficulty levels)
- 🏠 Local multiplayer (same device)
- 🌐 Online multiplayer (peer-to-peer, free!)
- 🎨 Beautiful Dostoevsky-themed UI
- 📱 Mobile responsive
- 💰 Zero hosting costs

## 📁 Essential Files

| File | Purpose |
|------|---------|
| `index.html` | Main game page |
| `game.js` | All game logic |
| `styles.css` | All styling |
| `GET_STARTED.md` | **START HERE** |

## 🔧 Common Tasks

### Test Locally
```bash
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### Deploy Changes
```bash
git add .
git commit -m "Your message"
git push origin main
# Wait 2-3 minutes for GitHub Pages to update
```

### Customize Colors
Edit `styles.css`:
```css
:root {
    --color-accent-gold: #d4af37;
    --color-bg-primary: #1a1410;
}
```

### Add Quotes
Edit `game.js`:
```javascript
const dostoevsky_quotes = [
    "Your quote here",
    // ...
];
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Site won't load | Wait 10 min, check GitHub Pages is enabled |
| AI doesn't work | Check internet, look at browser console (F12) |
| Styles broken | Hard refresh (Ctrl+Shift+R) |
| Multiplayer fails | Create new game, check firewall |

## 📚 Documentation Map

- **GET_STARTED.md** ← Start here!
- **README.md** - Feature overview
- **DEPLOYMENT.md** - Detailed deploy guide
- **CHECKLIST.md** - Deploy checklist
- **PROJECT_SUMMARY.md** - Complete documentation
- **guide.html** - User guide (on live site)
- **test.html** - Diagnostics (on live site)

## ⚡ Quick Links

After deployment, your URLs will be:
- Main game: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
- User guide: `https://YOUR_USERNAME.github.io/YOUR_REPO/guide.html`
- Diagnostics: `https://YOUR_USERNAME.github.io/YOUR_REPO/test.html`

## 💡 Remember

- GitHub Pages is **FREE**
- Online multiplayer is **FREE** (P2P)
- No servers needed
- No build process
- Just push and deploy!

## 🎯 Most Important

1. Read **GET_STARTED.md** first
2. Test locally before deploying
3. Use `test.html` to check components
4. Share your game link with friends!

---

*"The soul is healed by being with children."* - Fyodor Dostoevsky

Or by playing chess! ♟️

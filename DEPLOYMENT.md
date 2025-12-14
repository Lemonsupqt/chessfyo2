# 🚀 Deployment Guide - Dostoevsky Chess

This guide will help you deploy your Dostoevsky Chess game to GitHub Pages so you can share it with friends around the world.

## Prerequisites

- A GitHub account (free)
- Git installed on your computer
- Basic command line knowledge

## Method 1: Direct GitHub Upload (Easiest)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon → "New repository"
3. Name it (e.g., `dostoevsky-chess`)
4. Choose "Public" (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Files

1. On your repository page, click "uploading an existing file"
2. Drag and drop ALL project files:
   - index.html
   - game.html
   - styles.css
   - app.js
   - game.js
   - chess-engine.js
   - multiplayer.js
   - stockfish-integration.js
   - favicon.svg
   - README.md
   - LICENSE
   - .gitignore
3. Click "Commit changes"

### Step 3: Enable GitHub Pages

1. Go to repository "Settings"
2. Scroll down to "Pages" in the left sidebar
3. Under "Source", select "main" branch
4. Click "Save"
5. Wait 1-2 minutes for deployment

### Step 4: Access Your Game

Your game will be live at:
```
https://YOUR-USERNAME.github.io/dostoevsky-chess/
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Method 2: Using Git Command Line (Recommended)

### Step 1: Initialize Git Repository

```bash
cd /path/to/dostoevsky-chess
git init
git add .
git commit -m "Initial commit: Dostoevsky Chess game"
```

### Step 2: Create GitHub Repository

1. Go to GitHub and create a new repository (as in Method 1)
2. Don't initialize it with anything

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/dostoevsky-chess.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

Follow Step 3 from Method 1 above.

## Method 3: Using GitHub Desktop (User-Friendly)

### Step 1: Install GitHub Desktop

Download from: https://desktop.github.com/

### Step 2: Add Your Project

1. Open GitHub Desktop
2. File → Add Local Repository
3. Select your project folder
4. Click "Publish repository"

### Step 3: Enable GitHub Pages

Follow the web interface steps from Method 1.

## Automatic Deployment (Optional)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys changes when you push to the main branch.

### To Use:

1. Repository Settings → Actions → General
2. Enable "Read and write permissions"
3. Now every push to main auto-deploys!

## Custom Domain (Optional)

### If you own a domain:

1. Repository Settings → Pages
2. Enter your custom domain
3. Add DNS records at your domain registrar:
   - Type: CNAME
   - Name: www (or subdomain)
   - Value: YOUR-USERNAME.github.io

## Sharing Your Game

Once deployed, share your game URL with friends:

### For Multiplayer:
1. You visit the game URL
2. Click "Online Multiplayer"
3. Create a room
4. Share the room code (not the URL) with your friend
5. Friend visits the SAME URL
6. Friend enters your room code
7. Play!

## Troubleshooting

### Game doesn't load
- Check browser console (F12) for errors
- Ensure all files were uploaded
- Try hard refresh (Ctrl+Shift+R)

### Multiplayer not connecting
- Check firewall settings
- Try different browsers
- Both players must use HTTPS version of site

### AI not working
- This is normal if Stockfish CDN is down
- Game falls back to random moves
- Still fully playable

### GitHub Pages not enabled
- Repository must be public (free accounts)
- Or upgrade to GitHub Pro for private repos

## Performance Tips

### Optimize for Users:
- GitHub Pages has CDN → Fast worldwide
- No backend → No server costs
- WebRTC → Direct peer connections

### Bandwidth Limits:
- GitHub Pages: 100GB/month (free)
- This is ~50,000 game loads
- Rarely an issue unless viral

## Updating Your Game

### After deployment, to make changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push
```

Changes appear in 1-2 minutes (with GitHub Actions).

## Alternative Hosting Options

If you don't want GitHub Pages:

### 1. Netlify (Free)
- Drag & drop folder
- Instant deployment
- Custom domains free
- https://www.netlify.com/

### 2. Vercel (Free)
- Similar to Netlify
- Great for static sites
- https://vercel.com/

### 3. Cloudflare Pages (Free)
- Fast CDN
- Unlimited bandwidth
- https://pages.cloudflare.com/

### 4. Firebase Hosting (Free tier)
- Google infrastructure
- Good free tier
- https://firebase.google.com/

All of these work with the project as-is (no changes needed).

## Security Considerations

- No backend = No server vulnerabilities
- All code runs client-side
- P2P connections are direct
- No user data stored anywhere
- No cookies or tracking

## Legal & Licensing

- Project is MIT licensed (see LICENSE file)
- Free to use, modify, distribute
- Keep attribution in LICENSE file
- Chess.js, PeerJS, Stockfish.js have their own licenses

## Monitoring & Analytics (Optional)

Want to see how many people play?

### Add Google Analytics:
1. Get GA tracking code
2. Add to `index.html` before `</head>`
3. Respect user privacy (add cookie notice)

### Or use privacy-friendly alternatives:
- Plausible Analytics
- Fathom Analytics
- Simple Analytics

## Cost Breakdown

**Total Cost: $0/month**

- GitHub Pages: Free
- Domain (optional): ~$10/year
- Everything else: Free

No hosting fees, no server costs, no database costs!

## Scaling

GitHub Pages handles:
- 100GB bandwidth/month
- 10 builds/hour
- Soft limit: 100,000 requests/month

For most personal projects, this is more than enough!

## Final Checklist

Before going live:
- [ ] All files uploaded
- [ ] GitHub Pages enabled
- [ ] Game loads without errors
- [ ] All three modes work
- [ ] Mobile responsive
- [ ] README updated with your URL
- [ ] Shared with friends!

## Support

If deployment fails:
1. Check GitHub Status: https://www.githubstatus.com/
2. Review GitHub Pages docs: https://docs.github.com/pages
3. Open issue in this repository

## Success!

Once deployed, your game is live 24/7, accessible worldwide, and costs nothing to run. Share the URL, enjoy chess, and embrace the existential dread of losing to Stockfish!

---

*"The darker the night, the brighter the stars, the deeper the grief, the closer is God!"*

**Happy Deploying! ♟️**

---

## Quick Command Reference

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# Future updates
git add .
git commit -m "Update message"
git push

# Check status
git status

# View history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

## Next Steps

After deployment:
1. Star this repository ⭐
2. Share with friends 🎮
3. Customize the theme 🎨
4. Add your own features 💡
5. Contribute back to the project 🤝

Enjoy your chess game!

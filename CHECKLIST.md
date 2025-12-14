# 🚀 Deployment Checklist for Dostoevsky Chess

Use this checklist to ensure smooth deployment to GitHub Pages.

## Pre-Deployment Checklist

### ✅ Local Testing
- [ ] Open `index.html` in a browser (or run local server)
- [ ] Test mode selection screen loads
- [ ] Test AI mode (select difficulty, start game)
- [ ] Test local multiplayer mode
- [ ] Test online mode (create game, see if link generates)
- [ ] Move pieces on the board
- [ ] Check that move history updates
- [ ] Verify captured pieces display
- [ ] Test game over modal
- [ ] Visit `test.html` to verify all components load
- [ ] Check console for errors (F12 → Console)

### ✅ File Verification
- [ ] All HTML files present (index.html, guide.html, test.html)
- [ ] CSS file present (styles.css)
- [ ] JavaScript files present (game.js, stockfish.js)
- [ ] Configuration files present (manifest.json, favicon.svg)
- [ ] Documentation files present (README.md, etc.)
- [ ] .gitignore file present
- [ ] GitHub Actions workflow present (.github/workflows/deploy.yml)

### ✅ Code Quality
- [ ] No console errors in browser
- [ ] No broken links
- [ ] All images/icons load (if any)
- [ ] Responsive design works (test different screen sizes)
- [ ] Quotes rotate on main page
- [ ] All buttons are clickable
- [ ] All modals open and close correctly

## GitHub Setup Checklist

### ✅ Repository Setup
- [ ] GitHub account created
- [ ] New repository created (public)
- [ ] Repository name decided (e.g., "dostoevsky-chess")
- [ ] Repository description added (optional but nice)

### ✅ Code Upload
- [ ] Git initialized locally (`git init`)
- [ ] All files staged (`git add .`)
- [ ] Initial commit made (`git commit -m "Initial commit"`)
- [ ] Remote added (`git remote add origin URL`)
- [ ] Code pushed to main branch (`git push -u origin main`)
- [ ] Verify files appear on GitHub repository page

## GitHub Pages Activation Checklist

### ✅ Pages Configuration
- [ ] Go to repository Settings
- [ ] Click "Pages" in left sidebar
- [ ] Under "Build and deployment":
  - [ ] Source: Deploy from a branch
  - [ ] Branch: main
  - [ ] Folder: / (root)
  - [ ] Click "Save"
- [ ] Wait for deployment (usually 2-3 minutes)
- [ ] Refresh the Pages settings to see the live URL
- [ ] Click the "Visit site" button when it appears

### ✅ GitHub Actions (Optional)
- [ ] Go to "Actions" tab in repository
- [ ] Check if workflow is running
- [ ] Wait for green checkmark (success)
- [ ] If using Actions deployment:
  - [ ] Go to Settings → Pages
  - [ ] Change Source to "GitHub Actions"
  - [ ] Next push will auto-deploy

## Post-Deployment Verification

### ✅ Live Site Testing
- [ ] Visit the live GitHub Pages URL
- [ ] Page loads without errors
- [ ] CSS styling appears correctly
- [ ] Fonts load (Crimson Text & Playfair Display)
- [ ] Chess board renders correctly
- [ ] Click through all three game modes
- [ ] Test starting a game in each mode
- [ ] Make a few moves
- [ ] Test on mobile device (or browser dev tools mobile view)
- [ ] Check guide.html loads
- [ ] Check test.html loads and all components pass

### ✅ Online Multiplayer Testing
- [ ] Create an online game
- [ ] Copy the game link
- [ ] Open in a different browser or incognito window
- [ ] Paste the link and join
- [ ] Make moves from both sides
- [ ] Verify moves sync in real-time
- [ ] Test resign and draw offers

### ✅ AI Testing
- [ ] Start a game against Stockfish
- [ ] Make a move
- [ ] Wait for AI response (should take a few seconds)
- [ ] Verify AI makes a legal move
- [ ] Play a few more moves
- [ ] Test different difficulty levels

### ✅ Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test in Edge
- [ ] Test on mobile browser

## Sharing Checklist

### ✅ Prepare for Sharing
- [ ] Note down your live URL
- [ ] Test the URL in an incognito/private window
- [ ] Prepare a short description for sharing
- [ ] Consider creating a README with screenshots
- [ ] Test online multiplayer with a friend

### ✅ Share Your Game
- [ ] Share URL on social media (if desired)
- [ ] Send to friends to play
- [ ] Add to portfolio/resume (if applicable)
- [ ] Consider submitting to web game directories

## Troubleshooting Checklist

### ❌ If Site Doesn't Load
- [ ] Wait 10 minutes (initial deploy can be slow)
- [ ] Check repository is public
- [ ] Verify GitHub Pages is enabled in settings
- [ ] Check branch name is correct (main vs master)
- [ ] Look at GitHub Actions tab for errors
- [ ] Check browser console for specific errors

### ❌ If Styles Don't Load
- [ ] Verify styles.css is in root directory
- [ ] Check HTML links to CSS are relative (no leading /)
- [ ] Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Clear browser cache

### ❌ If JavaScript Doesn't Work
- [ ] Check browser console for errors
- [ ] Verify all .js files are in root directory
- [ ] Check CDN links for chess.js, PeerJS, Stockfish
- [ ] Ensure JavaScript is enabled in browser
- [ ] Try in different browser

### ❌ If Online Multiplayer Doesn't Work
- [ ] Check both players have internet
- [ ] Verify PeerJS CDN is accessible
- [ ] Try creating a new game
- [ ] Check for firewall/network restrictions
- [ ] Use browser console to see peer connection logs

### ❌ If Stockfish AI Doesn't Work
- [ ] Check internet connection (loads from CDN)
- [ ] Verify browser console for errors
- [ ] Try a different browser
- [ ] Check if Stockfish CDN is accessible
- [ ] Wait a bit longer (first load can be slow)

## Maintenance Checklist

### 🔄 Regular Updates
- [ ] Periodically test all features still work
- [ ] Check if CDN libraries have updates
- [ ] Monitor GitHub Pages uptime
- [ ] Respond to user feedback (if shared publicly)
- [ ] Keep documentation up to date

### 🔄 Making Changes
- [ ] Test changes locally first
- [ ] Commit with descriptive message
- [ ] Push to GitHub
- [ ] Wait for automatic redeployment
- [ ] Verify changes live on site
- [ ] Test all features still work

## Success Indicators

✅ Your deployment is successful when:
- [ ] Site loads at GitHub Pages URL
- [ ] All three game modes work
- [ ] You can make moves and play chess
- [ ] Online multiplayer connects two browsers
- [ ] AI opponent makes moves
- [ ] All pages (guide, test) are accessible
- [ ] No console errors
- [ ] Works on mobile and desktop

## 🎉 Deployment Complete!

Congratulations! Your Dostoevsky Chess is now live and accessible to the world!

**Your live URL format:**
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

**Share your game:**
- Send the URL to friends
- Play online together
- Enjoy philosophical chess battles!

**Need help?**
- See DEPLOYMENT.md for detailed instructions
- See README.md for feature documentation
- Check test.html for system diagnostics
- Review browser console for errors

---

*"To live without Hope is to Cease to live."* - Fyodor Dostoevsky

Your chess game is now immortalized on the internet! ♟️

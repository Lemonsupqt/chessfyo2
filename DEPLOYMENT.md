# GitHub Pages Deployment Guide

## Quick Start (5 minutes)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Dostoevsky Chess"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/dostoevsky-chess.git

# Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository: `https://github.com/YOUR_USERNAME/dostoevsky-chess`
2. Click **Settings** (top right)
3. Scroll down and click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: Select `main`
   - Folder: Select `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your site will be live at: `https://YOUR_USERNAME.github.io/dostoevsky-chess/`

### Step 3: Share with Friends!

Your chess app is now live and accessible to anyone with the link!

## Optional: Custom Domain

If you own a domain (e.g., `dostoevskychess.com`):

1. Create a file named `CNAME` in the root directory
2. Add your domain name (just the domain, no http://):
   ```
   dostoevskychess.com
   ```
3. Commit and push the CNAME file
4. In your domain registrar, add these DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   
   Type: A
   Name: @
   Value: 185.199.109.153
   
   Type: A
   Name: @
   Value: 185.199.110.153
   
   Type: A
   Name: @
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```
5. Wait for DNS propagation (up to 24 hours)

## Troubleshooting

### Site Not Loading
- Wait 2-3 minutes after enabling GitHub Pages
- Check that `index.html` is in the root directory
- Ensure the repository is public (or you have GitHub Pro for private)

### 404 Error
- Verify the URL is correct: `https://USERNAME.github.io/REPO_NAME/`
- Check that the `main` branch is selected in Settings

### Online Multiplayer Not Working
- GitHub Pages uses HTTPS, which is required for WebRTC
- Should work out of the box once deployed

## Updating Your Site

Every time you push changes, GitHub Pages automatically redeploys:

```bash
git add .
git commit -m "Update game features"
git push
```

Wait 1-2 minutes and refresh your site to see changes.

## Testing Before Deploy

Test locally with:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## Performance Tips

1. **Caching**: GitHub Pages automatically caches files
2. **CDN**: All libraries load from CDN for fast loading
3. **No Build Required**: Pure HTML/CSS/JS means instant deployment

## Security Notes

- All P2P connections use encryption
- No user data is stored on any server
- Game state is entirely client-side
- Room codes are temporary and peer-to-peer

## Monitoring

Check your site status:
- GitHub Actions tab shows deployment status
- Settings → Pages shows current deployment URL
- Browser console (F12) shows any errors

---

**That's it! Your Dostoevsky Chess app is now live and shareable! 🎉**

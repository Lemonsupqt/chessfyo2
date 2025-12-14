# Dostoevsky Chess - Quick Deployment Guide

## 🚀 Deploy to GitHub Pages in 3 Steps

### Step 1: Create a GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Dostoevsky Chess"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/dostoevsky-chess.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. Click **Pages** in the left sidebar
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 3: Wait & Play!
- Your site will be live in 1-2 minutes at:
  `https://YOUR-USERNAME.github.io/dostoevsky-chess/`

## 🎮 Test Locally First

Before deploying, test locally:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## ✅ Checklist Before Deployment

- [ ] Test all three game modes (Local, AI, Online)
- [ ] Check that pieces move correctly
- [ ] Verify online multiplayer connection works
- [ ] Test on mobile devices
- [ ] Ensure sound effects work (optional)

## 🔧 Custom Domain (Optional)

To use a custom domain like `chess.yourdomain.com`:

1. Create a file named `CNAME` in the root directory
2. Add your domain: `chess.yourdomain.com`
3. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `YOUR-USERNAME.github.io`
4. Wait for DNS propagation (up to 24 hours)

## 📝 Notes

- **No backend needed**: Everything runs in the browser!
- **Free hosting**: GitHub Pages is completely free
- **HTTPS**: Automatic SSL certificate
- **CDN**: Fast delivery worldwide
- **Updates**: Just push to main branch to update

## 🐛 Troubleshooting

**Site not showing?**
- Check GitHub Actions tab for deployment status
- Ensure repository is public (or GitHub Pro for private)
- Wait a few minutes for DNS propagation

**404 Error?**
- Verify repository name in Settings → Pages
- Check that index.html is in root directory

**Features not working?**
- Open browser DevTools (F12) and check Console
- Verify all CDN resources are loading
- Test with different browsers

---

**Ready to share your existential chess experience with the world! 🎭♟️**

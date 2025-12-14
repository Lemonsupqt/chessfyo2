# Deployment Guide for Dostoevsky Chess

This guide will help you deploy your Dostoevsky Chess game to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your chess game files ready

## Step-by-Step Deployment

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., "dostoevsky-chess")
4. Make it **Public** (required for free GitHub Pages)
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push Your Code to GitHub

Open your terminal in the project directory and run:

```bash
# If you haven't initialized git yet
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: Dostoevsky Chess web app"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" (top right, under the repository name)
3. In the left sidebar, click "Pages"
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select "main"
   - **Folder**: Select "/ (root)"
5. Click "Save"

### Step 4: Wait for Deployment

- GitHub will now build and deploy your site
- This usually takes 1-3 minutes
- You'll see a message like: "Your site is live at https://YOUR_USERNAME.github.io/YOUR_REPO/"

### Step 5: Visit Your Site!

Your Dostoevsky Chess game is now live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

Share this URL with your friends to play online!

## Alternative: Using GitHub Actions (Advanced)

If you want automatic deployments, the included `.github/workflows/deploy.yml` file will:
- Automatically deploy on every push to main
- Use GitHub Actions for deployment

To enable this:
1. Go to Settings → Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. The workflow will run automatically on your next push

## Troubleshooting

### Site Not Loading?
- Wait a few more minutes - initial deployment can take up to 10 minutes
- Check that your repository is public
- Verify the branch name is correct (main or master)

### CSS/JS Not Loading?
- Make sure all paths in your HTML are relative (no leading `/`)
- Check the browser console for errors
- Verify all files were committed and pushed

### Online Multiplayer Not Working?
- Ensure both players have stable internet
- Try creating a new game
- Check browser console for PeerJS errors
- Some corporate networks block WebRTC - try from home/mobile

### Stockfish AI Not Loading?
- Check your internet connection
- Verify the CDN is accessible
- Look for errors in browser console
- Try a different browser

## Custom Domain (Optional)

To use a custom domain:
1. Buy a domain from any registrar
2. In your repository, go to Settings → Pages
3. Under "Custom domain", enter your domain
4. Configure your DNS settings as instructed
5. Enable "Enforce HTTPS"

## Updating Your Site

To make changes and redeploy:

```bash
# Make your changes to files
# Then:
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes in a few minutes.

## Local Testing Before Deployment

Always test locally before pushing:

```bash
# Start a local web server
python -m http.server 8000

# Or use npx
npx http-server

# Visit http://localhost:8000 in your browser
```

## Important Notes

- GitHub Pages is **free** for public repositories
- Sites are publicly accessible - anyone with the URL can access
- No backend/server-side code - everything runs in the browser
- Online multiplayer uses peer-to-peer (no server costs!)
- Game state is not saved - closing the tab ends the game

## Need Help?

- Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Review the [README.md](README.md) for game features
- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Enjoy!

Your Dostoevsky Chess game is now accessible to the world. Share the link with friends and enjoy philosophical chess battles!

*"The soul is healed by being with children."* - Just kidding, it's healed by playing chess! 😄

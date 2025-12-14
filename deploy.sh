#!/bin/bash

# Dostoevsky Chess - Quick Deploy Script
# This script helps you deploy to GitHub Pages

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Dostoevsky Chess - GitHub Pages Deployment            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized in this directory"
    echo "   Run: git init"
    exit 1
fi

echo "📦 Staging all files..."
git add .

echo ""
echo "📝 Current files to be committed:"
git status --short

echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update Dostoevsky Chess"
fi

echo ""
echo "💾 Committing changes..."
git commit -m "$commit_msg"

echo ""
echo "🔍 Checking remote repository..."
if ! git remote | grep -q origin; then
    echo ""
    echo "⚠️  No remote repository found."
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No repository URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Remote repository added"
fi

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Deployment Complete! 🎉                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "   1. Go to your GitHub repository"
echo "   2. Click 'Settings' → 'Pages'"
echo "   3. Set Source to 'main' branch, '/ (root)' folder"
echo "   4. Click 'Save'"
echo "   5. Wait 2-3 minutes for deployment"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO/"
echo ""
echo "♟️  Enjoy your Dostoevsky Chess!"
echo ""

# Dostoevsky Chess

A multiplayer chess web application with a Fyodor Dostoevsky theme.

## Features

- **Local Multiplayer**: Play face-to-face on the same device.
- **Man vs Machine**: Challenge the Stockfish chess engine.
- **Correspondence (Online)**: Play with a friend online using PeerJS (P2P).
- **Aesthetic**: Immersive Dostoevsky-inspired UI with quotes and dark, moody visuals.

## How to Play Online

1. Select "Correspondence (Online)".
2. **Host**: Copy your "Identity" code and send it to your friend.
3. **Guest**: Paste the Host's code into the "Opponent's Identity" box and click "Connect".
4. The game begins when connection is established.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## Deployment (GitHub Pages)

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

1. Push this code to a GitHub repository.
2. Go to the repository **Settings**.
3. Navigate to **Pages** (in the sidebar).
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. The action will trigger on the next push to `main` and deploy your site.

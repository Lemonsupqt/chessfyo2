# Dostoevsky Chess WebApp

A multiplayer chess web application with a Fyodor Dostoevsky theme. Play locally, online with friends via P2P (PeerJS), or against the "Grand Inquisitor" (Stockfish AI).

## Features

- **Dostoevsky Aesthetic**: Sepia tones, old paper textures, and philosophical atmosphere.
- **Game Modes**:
  - **Local Multiplayer**: Play on the same device.
  - **Online Multiplayer**: Host a game and share the ID with a friend (P2P, no server required).
  - **Vs AI (The Grand Inquisitor)**: Play against Stockfish with adjustable difficulty.
  - **Vs AI (Prince Myshkin)**: A "Unpredictable" mode where the AI sometimes plays randomly.
- **Tech Stack**: React, Vite, Chess.js, React-Chessboard, PeerJS, Tailwind CSS.

## Installation & Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Hosting on GitHub Pages

This project is configured for GitHub Pages.

1.  Build the project:
    ```bash
    npm run build
    ```
2.  This creates a `dist` folder.
3.  To deploy manually:
    - Push the contents of `dist` to a `gh-pages` branch on your repository.
    - Enable GitHub Pages in your repository settings and select the `gh-pages` branch.

### Automated Deployment (Recommended)

You can use the `gh-pages` package:

1.  `npm install gh-pages --save-dev`
2.  Add `"deploy": "gh-pages -d dist"` to `package.json` scripts.
3.  Run `npm run build && npm run deploy`.

## Credits

- Stockfish.js for the chess engine.
- PeerJS for WebRTC networking.
- React Chessboard for the board UI.

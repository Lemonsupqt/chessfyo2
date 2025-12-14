import { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './ChessGame.css';

const DOSTOEVSKY_QUOTES = [
  "To go wrong in one's own way is better than to go right in someone else's.",
  "Power is given only to him who dares to stoop and take it.",
  "The darker the night, the brighter the stars.",
  "Beauty will save the world.",
  "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
  "Man is a creature that can get used to anything.",
  "It is better to be unhappy and know the worst, than to be happy in a fool's paradise."
];

export default function ChessGame({ mode, initialFen }) {
  // Use useMemo to ensure initialFen is only used once or when it explicitly changes
  // Actually, we want to initialize state once.
  // If initialFen is provided, use it, otherwise new game.
  const [game, setGame] = useState(() => {
    try {
      return new Chess(initialFen || undefined);
    } catch (e) {
      return new Chess();
    }
  });
  const [fen, setFen] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [currentQuote, setCurrentQuote] = useState(DOSTOEVSKY_QUOTES[0]);
  const engine = useRef(null);

  useEffect(() => {
    // If initialFen changes (e.g. from parent), we might want to reset, but typically we just use the initial state.
    // However, we should make sure FEN matches game state if we rely on it.
    setFen(game.fen());
    updateStatus();
    
    // Pick a random quote on mount
    setCurrentQuote(DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)]);

    // Initialize Stockfish if in bot mode
    if (mode === 'bot') {
      try {
        const stockfishUrl = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';
        fetch(stockfishUrl)
          .then(res => res.text())
          .then(blobText => {
            const blob = new Blob([blobText], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            const worker = new Worker(workerUrl);
            
            engine.current = worker;
        
            worker.onmessage = (event) => {
              const line = event.data;
              if (line.startsWith('bestmove')) {
                const bestMove = line.split(' ')[1];
                if (bestMove) {
                  makeAMove({
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: bestMove.length > 4 ? bestMove.substring(4, 5) : 'q',
                  });
                }
              }
            };
            
            worker.postMessage('uci');
            worker.postMessage('isready');
          })
          .catch(err => console.error("Failed to load Stockfish", err));

      } catch (e) {
        console.error("Stockfish init failed", e);
      }
    }

    return () => {
      if (engine.current) engine.current.terminate();
    };
  }, [mode]);

  useEffect(() => {
    // Bot's turn
    if (mode === 'bot' && game.turn() === 'b' && !game.isGameOver()) {
      setTimeout(() => {
        if (engine.current) {
          engine.current.postMessage(`position fen ${game.fen()}`);
          engine.current.postMessage('go depth 10');
        }
      }, 500);
    }
    
    updateStatus();
  }, [game, mode]);

  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setFen(gameCopy.fen());
        setMoveHistory(prev => [...prev, result.san]);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare, targetSquare) {
    if (mode === 'bot' && game.turn() === 'b') return false;

    return makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', 
    });
  }

  function updateStatus() {
    if (game.isCheckmate()) {
      setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
    } else if (game.isDraw()) {
      setStatus('Draw!');
    } else {
      setStatus(`${game.turn() === 'w' ? 'White' : 'Black'}'s turn`);
    }
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setStatus('White\'s turn');
    setCurrentQuote(DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)]);
    
    // Clear URL param
    const url = new URL(window.location);
    url.searchParams.delete('fen');
    window.history.pushState({}, '', url);
  }

  function copyShareLink() {
    const url = new URL(window.location);
    url.searchParams.set('fen', game.fen());
    navigator.clipboard.writeText(url.toString())
      .then(() => alert("Link copied to clipboard! Send it to your friend."))
      .catch(err => console.error("Could not copy link: ", err));
  }

  return (
    <div className="chess-wrapper paper-card">
      <div className="game-info">
        <h3>{status}</h3>
        <blockquote className="quote">"{currentQuote}"</blockquote>
      </div>
      
      <div className="board-container">
        <Chessboard 
          id="DostoevskyBoard" 
          position={fen} 
          onPieceDrop={onDrop}
          customDarkSquareStyle={{ backgroundColor: '#4a3c31' }}
          customLightSquareStyle={{ backgroundColor: '#e8d0aa' }}
          boardWidth={500}
        />
      </div>

      <div className="controls">
        <div className="move-history">
          <h4>History</h4>
          <div className="history-list">
            {moveHistory.map((move, index) => (
              <span key={index} className="move-item">
                {index % 2 === 0 ? `${Math.floor(index/2) + 1}. ` : ''}{move}
              </span>
            ))}
          </div>
        </div>
        <div className="action-buttons">
          <button onClick={resetGame} className="reset-btn">Reset Game</button>
          <button onClick={copyShareLink} className="share-btn">Share Game Link</button>
        </div>
      </div>
    </div>
  );
}

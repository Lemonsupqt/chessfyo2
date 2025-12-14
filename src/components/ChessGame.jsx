import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessGame = ({ gameMode = 'local', gameVariant = 'standard', onExit, connection, myColor }) => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState(null);
  const [optionSquares, setOptionSquares] = useState({});
  const engine = useRef(null);
  const [engineDifficulty, setEngineDifficulty] = useState(10); // 0-20
  
  // Timer State
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(600);
  const [timerRunning, setTimerRunning] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (timerRunning && !game.isGameOver()) {
        interval = setInterval(() => {
            if (game.turn() === 'w') {
                setWhiteTime(t => Math.max(0, t - 1));
            } else {
                setBlackTime(t => Math.max(0, t - 1));
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, game]);

  useEffect(() => {
    if (whiteTime === 0 || blackTime === 0) {
        setTimerRunning(false);
        // Handle timeout (simple alert for now or status update)
    }
  }, [whiteTime, blackTime]);

  useEffect(() => {
      // Start timer on first move if not started
      if (game.history().length > 0 && !game.isGameOver()) {
          setTimerRunning(true);
      }
      if (game.isGameOver()) {
          setTimerRunning(false);
      }
  }, [game]);


  // Initialize Engine for AI mode
  useEffect(() => {
    if (gameMode === 'ai') {
      try {
        engine.current = new Worker('./stockfish.js');
        engine.current.onmessage = (event) => {
          const line = event.data;
          // Parse "bestmove e2e4"
          if (line && typeof line === 'string' && line.startsWith('bestmove')) {
             const parts = line.split(' ');
             const bestMove = parts[1];
             if (bestMove) {
                 safeGameMutate((g) => {
                     g.move({
                         from: bestMove.substring(0, 2),
                         to: bestMove.substring(2, 4),
                         promotion: bestMove.substring(4, 5) || 'q'
                     });
                 });
             }
          }
        };
        // Init engine
        engine.current.postMessage('uci');
        engine.current.postMessage('isready');
      } catch (e) {
        console.error("Could not load stockfish worker", e);
      }
      
      return () => {
        if (engine.current) engine.current.terminate();
      };
    }
  }, [gameMode]);

  // Handle Online Messages
  useEffect(() => {
    if (gameMode === 'online' && connection) {
        connection.on('data', (data) => {
            if (data.type === 'move') {
                safeGameMutate((g) => {
                    g.move(data.move);
                });
            } else if (data.type === 'reset') {
                safeGameMutate((g) => g.reset());
                setWhiteTime(600);
                setBlackTime(600);
            }
        });
    }
  }, [gameMode, connection]);

  // Trigger AI move when it's black's turn
  useEffect(() => {
    if (gameMode === 'ai' && game.turn() === 'b' && !game.isGameOver()) {
        const fen = game.fen();
        
        // "The Idiot" Mode: Sometimes play random move (Myskhin is unpredictable)
        if (gameVariant === 'idiot' && Math.random() > 0.7) {
            setTimeout(() => {
                const moves = game.moves();
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                safeGameMutate((g) => g.move(randomMove));
            }, 500);
            return;
        }

        setTimeout(() => {
            if (engine.current) {
                engine.current.postMessage(`position fen ${fen}`);
                engine.current.postMessage(`go depth ${engineDifficulty}`);
            }
        }, 500); 
    }
  }, [game, gameMode, engineDifficulty, gameVariant]);

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }

  function getMoveOptions(square) {
    // Only allow moving if it's player's turn in AI mode or Online mode
    if (gameMode === 'ai' && game.turn() !== 'w') return false;
    if (gameMode === 'online' && game.turn() !== myColor) return false;

    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.turn()
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    // Prevent interaction if AI or Opponent is thinking
    if (gameMode === 'ai' && game.turn() !== 'w') return;
    if (gameMode === 'online' && game.turn() !== myColor) return;

    if (moveFrom === square) {
      setMoveFrom(null);
      setOptionSquares({});
      return;
    }

    if (moveFrom) {
      const move = {
        from: moveFrom,
        to: square,
        promotion: 'q', 
      };
      
      let moveResult = null;
      try {
        const gameCopy = new Chess(game.fen());
        moveResult = gameCopy.move(move);
      } catch (e) {
        // invalid
      }

      if (moveResult) {
        safeGameMutate((g) => {
          g.move({ from: moveFrom, to: square, promotion: 'q' });
        });
        
        if (gameMode === 'online' && connection) {
            connection.send({ type: 'move', move: { from: moveFrom, to: square, promotion: 'q' } });
        }

        setMoveFrom(null);
        setOptionSquares({});
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setMoveFrom(square);
      getMoveOptions(square);
      return;
    }
    
    setMoveFrom(null);
    setOptionSquares({});
  }

  function onDrop(sourceSquare, targetSquare) {
    if (gameMode === 'ai' && game.turn() !== 'w') return false;
    if (gameMode === 'online' && game.turn() !== myColor) return false;

    let move = null;
    safeGameMutate((g) => {
      try {
        move = g.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });
      } catch(e) {
          // invalid
      }
    });
    
    if (move === null) return false;

    if (gameMode === 'online' && connection) {
        connection.send({ type: 'move', move: { from: sourceSquare, to: targetSquare, promotion: 'q' } });
    }

    setOptionSquares({});
    setMoveFrom(null);
    return true;
  }

  const customDarkSquareStyle = { backgroundColor: '#8b4513' }; 
  const customLightSquareStyle = { backgroundColor: '#f4ecd8' }; 

  let statusText = "";
  if (gameMode === 'local') statusText = game.turn() === 'w' ? "White's Turn" : "Black's Turn";
  else if (gameMode === 'ai') statusText = game.turn() === 'w' ? "Your Turn" : "Grand Inquisitor is thinking...";
  else if (gameMode === 'online') statusText = game.turn() === myColor ? "Your Turn" : "Opponent's Turn";

  if (game.isCheckmate()) statusText = "Checkmate!";
  else if (game.isDraw()) statusText = "Draw!";

  const formatTime = (time) => {
      const m = Math.floor(time / 60);
      const s = time % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[600px] mx-auto">
      <div className="flex justify-between w-full px-4 text-dostoevsky-ink font-mono font-bold">
         <div className={`p-2 rounded ${game.turn() === 'w' ? 'bg-dostoevsky-accent text-white' : ''}`}>
             White: {formatTime(whiteTime)}
         </div>
         <div className={`p-2 rounded ${game.turn() === 'b' ? 'bg-dostoevsky-accent text-white' : ''}`}>
             Black: {formatTime(blackTime)}
         </div>
      </div>

      <div className="w-full bg-dostoevsky-ink/5 p-4 rounded-lg shadow-inner">
        <div className="flex justify-between items-center mb-2 font-serif">
          <span className="text-xl font-bold">
            {statusText}
          </span>
          {game.inCheck() && <span className="text-red-700 font-bold animate-pulse">CHECK!</span>}
        </div>
        
        <div className="border-8 border-double border-dostoevsky-ink/20 rounded shadow-2xl relative">
            <Chessboard
                id="BasicBoard"
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                customDarkSquareStyle={customDarkSquareStyle}
                customLightSquareStyle={customLightSquareStyle}
                animationDuration={200}
                arePiecesDraggable={
                    !game.isGameOver() && (
                    (gameMode === 'local') || 
                    (gameMode === 'ai' && game.turn() === 'w') || 
                    (gameMode === 'online' && game.turn() === myColor)
                    )
                }
                boardOrientation={myColor === 'b' ? 'black' : 'white'}
            />
            {game.isGameOver() && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-dostoevsky-paper p-6 rounded shadow-2xl text-center border-2 border-dostoevsky-ink">
                        <h3 className="text-2xl font-bold mb-2">Game Over</h3>
                        <p>{statusText}</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="flex gap-4 w-full">
        {gameMode === 'local' && (
            <button 
                onClick={() => {
                    safeGameMutate((g) => g.reset());
                    setWhiteTime(600);
                    setBlackTime(600);
                    setOptionSquares({});
                    setMoveFrom(null);
                }}
                className="flex-1 py-2 border border-dostoevsky-ink hover:bg-dostoevsky-ink hover:text-white transition-colors rounded font-serif"
            >
                Reset Board
            </button>
        )}
        <button 
            onClick={onExit}
            className="flex-1 py-2 border border-red-800 text-red-900 hover:bg-red-800 hover:text-white transition-colors rounded font-serif"
        >
            Exit to Menu
        </button>
      </div>
      
      {gameMode === 'ai' && (
          <div className="flex flex-col gap-2 w-full p-2 bg-dostoevsky-ink/5 rounded">
              <label className="text-sm font-bold">Inquisitor's Strength (Depth): {engineDifficulty}</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={engineDifficulty} 
                onChange={(e) => setEngineDifficulty(Number(e.target.value))}
                className="accent-dostoevsky-ink w-full"
              />
          </div>
      )}

      <div className="w-full text-sm font-mono p-2 bg-dostoevsky-dark text-dostoevsky-paper rounded opacity-80 h-24 overflow-y-auto">
        {game.history().map((move, i) => (
             <span key={i} className="mr-2">{(i % 2 === 0 ? (i/2 + 1) + '.' : '')} {move}</span>
        ))}
      </div>
    </div>
  );
}

export default ChessGame;

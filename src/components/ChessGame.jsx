import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RefreshCw, Users, Wifi, Copy, Check, ExternalLink } from 'lucide-react';
import { Peer } from 'peerjs';

const DOSTOEVSKY_QUOTES = [
  "To go wrong in one's own way is better than to go right in someone else's.",
  "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
  "The darker the night, the brighter the stars.",
  "It takes something more than intelligence to act intelligently.",
  "We sometimes encounter people, even perfect strangers, who begin to interest us at first sight.",
  "Beauty will save the world.",
  "I am a sick man... I am a spiteful man.",
  "Man is a creature that can get used to anything, and I think that is the best definition of him.",
  "Taking a new step, uttering a new word, is what people fear most.",
  "If you want to be respected by others, the great thing is to respect yourself."
];

export default function ChessGame({ mode }) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState([]);
  const [quote, setQuote] = useState(DOSTOEVSKY_QUOTES[0]);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  
  // AI State
  const engine = useRef(null);
  const [engineReady, setEngineReady] = useState(false);

  // Online State
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [conn, setConn] = useState(null);
  const [playerColor, setPlayerColor] = useState('white'); // 'white' or 'black'
  const [status, setStatus] = useState("");

  // Initialize Game
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setGameOver(false);
    setHistory([]);
    setQuote(DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)]);
    
    // Cleanup old connections/workers if switching modes
    if (engine.current) {
      engine.current.terminate();
      engine.current = null;
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    
    // Mode specific setup
    if (mode === 'ai') {
      setupStockfish();
    } else if (mode === 'online') {
      setupPeer();
    }
  }, [mode]);

  // AI Logic
  const setupStockfish = async () => {
    try {
      setStatus("Loading Engine...");
      const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js');
      if (!response.ok) throw new Error("Failed to load Stockfish");
      const script = await response.text();
      const blob = new Blob([script], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
          setEngineReady(true);
          setStatus("");
        }
        if (msg.startsWith('bestmove')) {
          const move = msg.split(' ')[1];
          if (move) {
            safeMove({
              from: move.substring(0, 2),
              to: move.substring(2, 4),
              promotion: move.substring(4, 5) || 'q'
            });
          }
        }
      };
      
      engine.current = worker;
      worker.postMessage('uci');
      worker.postMessage('isready');
    } catch (e) {
      console.error(e);
      setStatus("Failed to load engine (Network error?)");
    }
  };

  useEffect(() => {
    if (mode === 'ai' && engineReady && game.turn() === 'b' && !gameOver) {
      // AI is Black
      setTimeout(() => {
        engine.current.postMessage(`position fen ${game.fen()}`);
        engine.current.postMessage('go depth 10');
      }, 500);
    }
  }, [fen, mode, engineReady, gameOver]);

  // Online Logic
  const setupPeer = () => {
    const newPeer = new Peer();
    newPeer.on('open', (id) => {
      setPeerId(id);
      setStatus("Waiting for opponent...");
    });
    
    newPeer.on('connection', (c) => {
      setConn(c);
      setStatus("Connected!");
      setupConnection(c);
      // If we received a connection, we are effectively 'Host' but PeerJS is symmetric mostly.
      // Usually the one who connects is the 'Guest'.
      // Let's decide colors: Host is White, Guest is Black.
      // Since we are receiving connection here, we are Host.
      setPlayerColor('white'); 
    });

    setPeer(newPeer);
  };

  const connectToPeer = () => {
    if (!peer || !remotePeerId) return;
    const c = peer.connect(remotePeerId);
    setConn(c);
    setStatus("Connecting...");
    setupConnection(c);
    setPlayerColor('black'); // Guest is Black
  };

  const setupConnection = (c) => {
    c.on('open', () => {
      setStatus("Game Started!");
    });
    c.on('data', (data) => {
      if (data.type === 'move') {
        safeMove(data.move, true); // true = isRemote
      }
      if (data.type === 'reset') {
        resetBoard(false);
      }
    });
    c.on('close', () => {
      setStatus("Opponent disconnected.");
      setConn(null);
    });
  };

  // Game Logic
  function safeMove(moveObj, isRemote = false) {
    try {
      const result = game.move(moveObj);
      if (result) {
        const newFen = game.fen();
        setFen(newFen);
        setHistory(prev => [...prev, result.san]);
        checkGameOver();
        
        // Random quote on significant events
        if (result.captured || game.isCheck()) {
          setQuote(DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)]);
        }

        // Send move if online and we made it
        if (mode === 'online' && !isRemote && conn) {
          conn.send({ type: 'move', move: moveObj });
        }
        return true;
      }
    } catch (e) {
      console.error("Invalid move", e);
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare, targetSquare) {
    if (gameOver) return false;
    
    // Turn validation
    if (mode === 'online' && game.turn() !== playerColor[0]) return false;
    if (mode === 'ai' && game.turn() === 'b') return false; // Player is white vs AI

    return safeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
  }

  function checkGameOver() {
    if (game.isGameOver()) {
      setGameOver(true);
      if (game.isCheckmate()) setGameOverReason("Checkmate. The struggle is over.");
      else if (game.isDraw()) setGameOverReason("Draw. A stalemate of souls.");
      else setGameOverReason("Game Over.");
    }
  }

  function resetBoard(shouldNotify = true) {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setGameOver(false);
    setQuote(DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)]);
    if (mode === 'online' && shouldNotify && conn) {
      conn.send({ type: 'reset' });
    }
  }

  // UI Styles
  const customDarkSquareStyle = { backgroundColor: '#5c4d3c' };
  const customLightSquareStyle = { backgroundColor: '#f4e4bc' };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      <div className="w-full max-w-[600px] aspect-square shadow-2xl border-4 border-dostoevsky-ink/50 rounded-sm relative">
        <Chessboard 
          position={fen} 
          onPieceDrop={onDrop}
          customDarkSquareStyle={customDarkSquareStyle}
          customLightSquareStyle={customLightSquareStyle}
          boardOrientation={playerColor}
        />
        {status && (
          <div className="absolute top-2 left-2 bg-dostoevsky-gloom/80 text-white px-2 py-1 text-xs rounded">
            {status}
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 bg-dostoevsky-paper border-2 border-dostoevsky-ink p-6 shadow-xl relative min-h-[400px] flex flex-col">
        <h2 className="text-2xl font-title text-dostoevsky-ink mb-4 border-b border-dostoevsky-ink pb-2">
          {mode === 'local' && "Local Skirmish"}
          {mode === 'ai' && "Man vs Machine"}
          {mode === 'online' && "Distant Minds"}
        </h2>

        {mode === 'online' && !conn && (
           <div className="mb-4 p-4 bg-dostoevsky-ink/10 rounded">
             <div className="mb-4">
               <p className="text-xs uppercase tracking-widest text-dostoevsky-ink/60 mb-1">Your Identity</p>
               <div className="flex gap-2">
                 <code className="bg-white px-2 py-1 rounded border border-dostoevsky-ink flex-1 text-sm overflow-hidden text-ellipsis">
                   {peerId || "Generating..."}
                 </code>
                 <button 
                   onClick={() => navigator.clipboard.writeText(peerId)}
                   className="p-1 hover:text-dostoevsky-blood text-dostoevsky-ink"
                   title="Copy ID"
                 >
                   <Copy size={16}/>
                 </button>
               </div>
             </div>
             
             <div>
               <p className="text-xs uppercase tracking-widest text-dostoevsky-ink/60 mb-1">Opponent's Identity</p>
               <div className="flex gap-2">
                 <input 
                   value={remotePeerId} 
                   onChange={(e) => setRemotePeerId(e.target.value)}
                   className="flex-1 px-2 py-1 border border-dostoevsky-ink bg-white text-sm"
                   placeholder="Enter code..."
                 />
                 <button 
                   onClick={connectToPeer}
                   className="bg-dostoevsky-ink text-white px-3 py-1 text-sm hover:bg-dostoevsky-blood"
                 >
                   Connect
                 </button>
               </div>
             </div>
           </div>
        )}

        <div className="mb-6 italic text-dostoevsky-accent text-lg font-serif leading-relaxed min-h-[4rem]">
          "{quote}"
        </div>

        {gameOver && (
          <div className="mb-6 p-4 bg-dostoevsky-blood/10 border border-dostoevsky-blood text-dostoevsky-blood font-bold text-center animate-pulse">
            {gameOverReason}
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <h3 className="font-bold border-b border-dostoevsky-ink/20 pb-1 mb-2 text-sm uppercase tracking-wider">Chronicle</h3>
          <div className="flex-1 overflow-y-auto text-sm font-mono bg-white/50 p-2 border border-dostoevsky-ink/10">
            {history.map((move, i) => (
              <span key={i} className="inline-block mr-2">
                {i % 2 === 0 ? <span className="text-dostoevsky-ink/50 mr-1">{Math.floor(i/2) + 1}.</span> : ''} 
                <span className={i % 2 === 0 ? "text-dostoevsky-ink" : "text-dostoevsky-blood"}>{move}</span>
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => resetBoard(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 border border-dostoevsky-ink py-2 text-dostoevsky-ink hover:bg-dostoevsky-ink hover:text-dostoevsky-paper transition-all"
        >
          <RefreshCw size={16} /> Start Anew
        </button>
      </div>
    </div>
  );
}

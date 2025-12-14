import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { Copy } from 'lucide-react';

const OnlineLobby = ({ onJoinGame, onBack }) => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [status, setStatus] = useState('Initializing...');
  const peerRef = useRef(null);

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('Ready to host or join.');
    });

    peer.on('connection', (conn) => {
      setStatus('Connecting to opponent...');
      conn.on('open', () => {
        // We are the host, so we play White (usually)
        onJoinGame(conn, 'w');
      });
    });

    peer.on('error', (err) => {
      setStatus('Error: ' + err.type);
      console.error(err);
    });

    return () => {
      // Don't destroy peer here if we are transitioning to game, 
      // but ideally we should manage peer lifecycle better.
      // For this simple app, we might want to keep peer alive.
      // Actually, if we unmount Lobby, we might lose the listener if not careful.
      // But we will pass the connection up.
    };
  }, [onJoinGame]);

  const connectToPeer = () => {
    if (!remotePeerId) return;
    setStatus(`Connecting to ${remotePeerId}...`);
    const conn = peerRef.current.connect(remotePeerId);
    
    conn.on('open', () => {
      // We are the joiner, so we play Black
      onJoinGame(conn, 'b');
    });
    
    conn.on('error', (err) => {
        setStatus('Connection failed.');
    });
  };

  const copyId = () => {
    navigator.clipboard.writeText(peerId);
    setStatus('ID copied to clipboard!');
    setTimeout(() => setStatus('Ready to host or join.'), 2000);
  };

  return (
    <div className="bg-white/50 p-8 rounded shadow-xl backdrop-blur-sm max-w-lg w-full text-center border border-dostoevsky-ink/10">
      <h2 className="text-2xl font-bold mb-6 font-serif">Online Lobby</h2>
      
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest">Your ID</p>
        <div className="flex items-center justify-center gap-2 bg-dostoevsky-ink/5 p-2 rounded">
          <code className="font-mono text-lg select-all">{peerId || 'Loading...'}</code>
          <button onClick={copyId} className="p-2 hover:bg-dostoevsky-ink/10 rounded transition-colors">
            <Copy size={20} />
          </button>
        </div>
        <p className="text-xs mt-2 text-dostoevsky-ink/60">Share this with your friend to host a game.</p>
      </div>

      <div className="border-t border-dostoevsky-ink/20 my-6"></div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest">Join a Game</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter Friend's ID"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            className="p-3 border border-dostoevsky-ink/30 rounded bg-transparent focus:border-dostoevsky-ink focus:outline-none text-center font-mono"
          />
          <button 
            onClick={connectToPeer}
            disabled={!peerId || !remotePeerId}
            className="w-full py-3 bg-dostoevsky-ink text-dostoevsky-paper rounded hover:bg-dostoevsky-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-widest"
          >
            Join Game
          </button>
        </div>
      </div>

      <p className="text-sm font-mono mb-4 text-dostoevsky-accent">{status}</p>

      <button onClick={onBack} className="underline text-sm hover:text-dostoevsky-accent">
        Back to Menu
      </button>
    </div>
  );
};

export default OnlineLobby;

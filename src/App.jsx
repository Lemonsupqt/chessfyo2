import { useState } from 'react'
import ChessGame from './components/ChessGame'
import OnlineLobby from './components/OnlineLobby'

function App() {
  const [gameState, setGameState] = useState('MENU'); // MENU, LOCAL, AI, ONLINE_LOBBY, ONLINE
  const [connection, setConnection] = useState(null);
  const [myColor, setMyColor] = useState('w');
  const [gameVariant, setGameVariant] = useState('standard'); // standard, idiot

  const onJoinGame = (conn, color) => {
    setConnection(conn);
    setMyColor(color);
    setGameState('ONLINE');
  };

  const startAI = (variant) => {
      setGameVariant(variant);
      setGameState('AI');
  }

  const renderMenu = () => (
    <div className="bg-white/50 p-8 rounded shadow-xl backdrop-blur-sm max-w-2xl w-full text-center border border-dostoevsky-ink/10">
        <p className="mb-4 text-lg italic">"The chessboard is the world, the pieces are the phenomena of the universe, the rules of the game are what we call the laws of Nature."</p>
        
        <div className="mt-8 space-y-4">
          <button 
            onClick={() => { setGameVariant('standard'); setGameState('LOCAL'); }}
            className="w-full py-3 px-6 bg-dostoevsky-ink text-dostoevsky-paper rounded hover:bg-dostoevsky-accent transition-colors font-bold uppercase tracking-widest shadow-lg"
          >
            Play vs Friend (Local)
          </button>
          <button 
            onClick={() => setGameState('ONLINE_LOBBY')}
            className="w-full py-3 px-6 bg-transparent border-2 border-dostoevsky-ink text-dostoevsky-ink rounded hover:bg-dostoevsky-ink hover:text-dostoevsky-paper transition-colors font-bold uppercase tracking-widest"
          >
            Play vs Friend (Online)
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => startAI('standard')}
                className="w-full py-3 px-6 bg-transparent border-2 border-dostoevsky-ink text-dostoevsky-ink rounded hover:bg-dostoevsky-ink hover:text-dostoevsky-paper transition-colors font-bold uppercase tracking-widest text-sm"
            >
                Vs The Grand Inquisitor (Standard AI)
            </button>
            <button 
                onClick={() => startAI('idiot')}
                className="w-full py-3 px-6 bg-transparent border-2 border-dostoevsky-ink text-dostoevsky-ink rounded hover:bg-dostoevsky-ink hover:text-dostoevsky-paper transition-colors font-bold uppercase tracking-widest text-sm"
            >
                Vs Prince Myshkin (Unpredictable AI)
            </button>
          </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dostoevsky-paper text-dostoevsky-ink selection:bg-dostoevsky-accent selection:text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 italic font-serif tracking-tighter drop-shadow-sm">Dostoevsky Chess</h1>
      
      {gameState === 'MENU' && renderMenu()}
      
      {gameState === 'LOCAL' && (
        <ChessGame 
            gameMode="local" 
            gameVariant="standard"
            onExit={() => setGameState('MENU')} 
        />
      )}

      {gameState === 'ONLINE_LOBBY' && (
         <OnlineLobby 
            onJoinGame={onJoinGame}
            onBack={() => setGameState('MENU')}
         />
      )}
      
      {gameState === 'ONLINE' && (
         <ChessGame 
            gameMode="online"
            connection={connection}
            myColor={myColor}
            onExit={() => {
                if(connection) connection.close();
                setGameState('MENU');
            }} 
        />
      )}
      
      {gameState === 'AI' && (
         <ChessGame 
            gameMode="ai" 
            gameVariant={gameVariant}
            onExit={() => setGameState('MENU')} 
        />
      )}
      
      <div className="mt-8 text-xs text-dostoevsky-ink/50 font-mono">
        Built with React, Chess.js, Stockfish.js & PeerJS
      </div>
    </div>
  )
}

export default App

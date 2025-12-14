import React, { useState } from 'react';
import ChessGame from './components/ChessGame';
import { BookOpen, Users, Cpu, Scroll } from 'lucide-react';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'local', 'ai', 'online'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-6xl font-title text-dostoevsky-ink mb-2">The Idiot's Gambit</h1>
        <p className="text-xl italic text-dostoevsky-accent">"But how could you live and have no story to tell?"</p>
      </header>

      {!gameMode ? (
        <div className="max-w-md w-full bg-dostoevsky-paper border-2 border-dostoevsky-ink p-8 shadow-2xl rounded-sm transform rotate-1">
          <div className="space-y-6">
            <button
              onClick={() => setGameMode('local')}
              className="w-full flex items-center justify-center gap-3 bg-dostoevsky-ink text-dostoevsky-paper py-4 px-6 hover:bg-dostoevsky-blood transition-colors duration-300 font-serif text-xl border border-transparent hover:border-dostoevsky-ink"
            >
              <Users size={24} />
              <span>Face a Friend (Local)</span>
            </button>
            
            <button
              onClick={() => setGameMode('ai')}
              className="w-full flex items-center justify-center gap-3 bg-dostoevsky-ink text-dostoevsky-paper py-4 px-6 hover:bg-dostoevsky-blood transition-colors duration-300 font-serif text-xl border border-transparent hover:border-dostoevsky-ink"
            >
              <Cpu size={24} />
              <span>Challenge the Machine</span>
            </button>
            
            <button
              onClick={() => setGameMode('online')}
              className="w-full flex items-center justify-center gap-3 bg-dostoevsky-ink text-dostoevsky-paper py-4 px-6 hover:bg-dostoevsky-blood transition-colors duration-300 font-serif text-xl border border-transparent hover:border-dostoevsky-ink"
            >
              <BookOpen size={24} />
              <span>Correspondence (Online)</span>
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-dostoevsky-ink/20 text-center text-dostoevsky-ink/60 text-sm italic font-serif">
            <p>Fyodor Dostoevsky Themed Chess</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-6xl">
           <button 
             onClick={() => setGameMode(null)}
             className="mb-4 flex items-center gap-2 text-dostoevsky-ink hover:text-dostoevsky-blood transition-colors font-serif"
           >
             <Scroll size={20} /> Return to Society
           </button>
           <ChessGame mode={gameMode} />
        </div>
      )}
    </div>
  );
}

export default App;

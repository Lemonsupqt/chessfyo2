import { useState, useEffect } from 'react'
import ChessGame from './components/ChessGame'
import './App.css'

function App() {
  const [gameMode, setGameMode] = useState(null) // 'local', 'bot', 'online'
  const [initialFen, setInitialFen] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fenParam = params.get('fen')
    if (fenParam) {
      setInitialFen(decodeURIComponent(fenParam))
      setGameMode('local')
    }
  }, [])

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    setInitialFen(null) // Reset if picking new mode manually
    // Clear URL param if we go back to menu or change mode
    window.history.pushState({}, '', window.location.pathname)
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Dostoevsky Chess</h1>
        <p className="subtitle">"Man is a mystery. It needs to be unravelled."</p>
      </header>

      <main>
        {!gameMode ? (
          <div className="menu paper-card">
            <h2>Select Mode</h2>
            <div className="button-group">
              <button onClick={() => handleModeSelect('local')}>Local Multiplayer</button>
              <button onClick={() => handleModeSelect('bot')}>Challenge Stockfish</button>
              {/* Future feature: <button onClick={() => setGameMode('online')}>Online (P2P)</button> */}
            </div>
          </div>
        ) : (
          <div className="game-container">
            <button className="back-btn" onClick={() => setGameMode(null)}>← Return to Menu</button>
            <ChessGame mode={gameMode} initialFen={initialFen} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Inspired by Fyodor Dostoevsky</p>
      </footer>
    </div>
  )
}

export default App

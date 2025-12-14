// Stockfish.js Wrapper
// This file serves as a bridge to load Stockfish engine

// For GitHub Pages deployment, we'll use the CDN version
// The actual Stockfish engine will be loaded from a CDN

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish@16.1.0/src/stockfish.js';

// Create a worker from CDN URL
try {
    if (typeof Worker !== 'undefined') {
        // Web Worker wrapper that loads Stockfish from CDN
        const workerCode = `
            importScripts('${STOCKFISH_CDN}');
            
            // Forward all messages to/from Stockfish
            self.onmessage = function(e) {
                if (typeof Stockfish !== 'undefined') {
                    if (!self.stockfish) {
                        self.stockfish = Stockfish();
                        self.stockfish.onmessage = function(msg) {
                            self.postMessage(msg);
                        };
                    }
                    self.stockfish.postMessage(e.data);
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        // Export worker creator
        self.createStockfishWorker = function() {
            return new Worker(workerUrl);
        };
    }
} catch (e) {
    console.warn('Stockfish initialization failed:', e);
    
    // Fallback: provide a dummy worker for development
    self.createStockfishWorker = function() {
        return {
            postMessage: function(msg) {
                console.log('Stockfish (offline):', msg);
            },
            onmessage: null,
            terminate: function() {}
        };
    };
}

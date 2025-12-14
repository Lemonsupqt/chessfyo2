/* Stockfish worker shim (static-host friendly).
 * The imported script installs its own onmessage handler and uses postMessage for output.
 */
importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.wasm.min.js');

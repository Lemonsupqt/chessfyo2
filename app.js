import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js';

const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));

const elBoard = $('board');
const elStatus = $('status');
const elModeTag = $('modeTag');
const elTurnTag = $('turnTag');
const elQuote = $('quote');

const elBtnNewGame = $('btnNewGame');
const elBtnFlip = $('btnFlip');
const elBtnUndo = $('btnUndo');
const elBtnCopyFEN = $('btnCopyFEN');
const elBtnCopyPGN = $('btnCopyPGN');

const elModeSelect = /** @type {HTMLSelectElement} */ ($('modeSelect'));
const elAIControls = $('aiControls');
const elAILevel = /** @type {HTMLInputElement} */ ($('aiLevel'));
const elAIColor = /** @type {HTMLSelectElement} */ ($('aiColor'));

const elClockControls = $('clockControls');
const elClockPreset = /** @type {HTMLSelectElement} */ ($('clockPreset'));
const elTimeWhite = $('timeWhite');
const elTimeBlack = $('timeBlack');
const elClockWhite = $('clockWhite');
const elClockBlack = $('clockBlack');

const elOnlineControls = $('onlineControls');
const elBtnHost = $('btnHost');
const elBtnJoin = $('btnJoin');
const elSignalBox = /** @type {HTMLTextAreaElement} */ ($('signalBox'));
const elBtnCopySignal = $('btnCopySignal');
const elBtnApplySignal = $('btnApplySignal');
const elOnlineRole = /** @type {HTMLSelectElement} */ ($('onlineRole'));
const elConnState = $('connState');

const elMoveList = $('moveList');

const elChatLog = $('chatLog');
const elChatInput = /** @type {HTMLInputElement} */ ($('chatInput'));
const elBtnSendChat = $('btnSendChat');

const elPGNInput = /** @type {HTMLTextAreaElement} */ ($('pgnInput'));
const elBtnLoadPGN = $('btnLoadPGN');
const elBtnClearPGN = $('btnClearPGN');

const elPuzzleCard = $('puzzleCard');
const elPuzzleInfo = $('puzzleInfo');
const elBtnPuzzleReset = $('btnPuzzleReset');
const elBtnPuzzleReveal = $('btnPuzzleReveal');
const elPuzzleSolution = $('puzzleSolution');

const elPromotion = $('promotion');

const elToggleSound = /** @type {HTMLInputElement} */ ($('toggleSound'));

/** @type {'hotseat'|'ai'|'online'|'puzzle'} */
let mode = 'hotseat';

/** @type {'w'|'b'} */
let orientation = 'w';

/** @type {'w'|'b'} */
let myColor = 'w';

let game = new Chess();

/** @type {null | { from: string, to: string }} */
let pendingPromotion = null;

let selectedSquare = null;
/** @type {import('https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js').Move[]} */
let selectedMoves = [];

// -------------------- Sound --------------------

let audioCtx = null;

function blip(kind) {
  if (!elToggleSound.checked) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    const now = ctx.currentTime;
    const freq = kind === 'capture' ? 220 : kind === 'check' ? 392 : 330;
    o.frequency.setValueAtTime(freq, now);
    o.type = 'triangle';

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.14);
  } catch {
    // ignore
  }
}

// -------------------- Quotes --------------------

const QUOTES = [
  '“The soul is healed by being with children.” — Fyodor Dostoevsky',
  '“To go wrong in one\’s own way is better than to go right in someone else\’s.” — Fyodor Dostoevsky',
  '“Nothing is easier than to denounce the evildoer; nothing is more difficult than to understand him.” — Fyodor Dostoevsky',
  '“The mystery of human existence lies not in just staying alive, but in finding something to live for.” — Fyodor Dostoevsky'
];

function setQuote() {
  const idx = Math.floor(Math.random() * QUOTES.length);
  elQuote.textContent = QUOTES[idx];
}

// -------------------- Helpers --------------------

function pieceToGlyph(piece) {
  if (!piece) return '';
  const map = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  };
  return map[piece.color][piece.type];
}

function squaresInView() {
  const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = orientation === 'w' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
  const sqs = [];
  for (const r of ranks) {
    for (const f of files) sqs.push(`${f}${r}`);
  }
  return sqs;
}

function formatClock(seconds) {
  if (seconds == null) return '—';
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function setStatus(text) {
  elStatus.textContent = text;
}

// -------------------- Clock --------------------

let clockEnabled = false;
let baseSeconds = null;
let incSeconds = 0;

/** @type {{w: number|null, b: number|null}} */
let remaining = { w: null, b: null };

/** @type {'w'|'b'|null} */
let activeClock = null;
let lastTick = 0;
let clockTimer = null;

function applyClockPreset(preset) {
  if (preset === 'off') {
    clockEnabled = false;
    baseSeconds = null;
    incSeconds = 0;
    remaining = { w: null, b: null };
    activeClock = null;
    stopClock();
    renderClocks();
    return;
  }

  const [baseStr, incStr] = preset.split('+');
  baseSeconds = Number(baseStr);
  incSeconds = Number(incStr);
  clockEnabled = Number.isFinite(baseSeconds);
  remaining = { w: baseSeconds, b: baseSeconds };
  activeClock = null;
  stopClock();
  renderClocks();
}

function stopClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
}

function startClock(color) {
  if (!clockEnabled) return;
  activeClock = color;
  lastTick = Date.now();
  if (!clockTimer) {
    clockTimer = setInterval(() => {
      if (!clockEnabled || !activeClock) return;
      const now = Date.now();
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      remaining[activeClock] = Math.max(0, remaining[activeClock] - dt);
      renderClocks();
    }, 200);
  }
  renderClocks();
}

function switchClock(afterMoveColor) {
  if (!clockEnabled) return;

  // Apply increment to player who just moved (opposite of afterMoveColor)
  const mover = afterMoveColor === 'w' ? 'b' : 'w';
  remaining[mover] = Math.max(0, remaining[mover] + incSeconds);
  startClock(afterMoveColor);
}

function renderClocks() {
  elTimeWhite.textContent = formatClock(remaining.w);
  elTimeBlack.textContent = formatClock(remaining.b);

  elClockWhite.classList.toggle('active', activeClock === 'w');
  elClockBlack.classList.toggle('active', activeClock === 'b');
}

// -------------------- Online (WebRTC) --------------------

/** @type {RTCPeerConnection | null} */
let pc = null;
/** @type {RTCDataChannel | null} */
let dc = null;

function setConnState(text) {
  elConnState.textContent = text;
}

function resetConnection() {
  try {
    if (dc) dc.close();
  } catch {}
  try {
    if (pc) pc.close();
  } catch {}
  pc = null;
  dc = null;
  setConnState('Not connected.');
}

function ensurePeerConnection() {
  if (pc) return;
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  pc.oniceconnectionstatechange = () => {
    setConnState(`ICE: ${pc.iceConnectionState}${dc?.readyState ? `, DC: ${dc.readyState}` : ''}`);
  };

  pc.ondatachannel = (ev) => {
    dc = ev.channel;
    bindDataChannel();
  };
}

function bindDataChannel() {
  if (!dc) return;
  dc.onopen = () => {
    setConnState(`Connected (DC open). You are ${myColor === 'w' ? 'White' : 'Black'}.`);
    // Send current state
    sendMsg({
      type: 'sync',
      fen: game.fen(),
      pgn: game.pgn(),
      clocks: clockEnabled ? remaining : null,
      clockEnabled,
      incSeconds,
      baseSeconds
    });
  };
  dc.onclose = () => setConnState('Disconnected (DC closed).');
  dc.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      onRemoteMsg(msg);
    } catch {
      // ignore
    }
  };
}

function sendMsg(obj) {
  if (!dc || dc.readyState !== 'open') return;
  dc.send(JSON.stringify(obj));
}

async function waitIceGatheringComplete(conn) {
  if (conn.iceGatheringState === 'complete') return;
  await new Promise((resolve) => {
    const onChange = () => {
      if (conn.iceGatheringState === 'complete') {
        conn.removeEventListener('icegatheringstatechange', onChange);
        resolve(null);
      }
    };
    conn.addEventListener('icegatheringstatechange', onChange);
  });
}

async function hostCreateOffer() {
  resetConnection();
  ensurePeerConnection();
  dc = pc.createDataChannel('chess');
  bindDataChannel();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitIceGatheringComplete(pc);

  elSignalBox.value = JSON.stringify(pc.localDescription);
  setConnState('Offer created. Copy and send it to your friend.');
}

async function joinWithOffer(offerJson) {
  resetConnection();
  ensurePeerConnection();

  const offer = JSON.parse(offerJson);
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitIceGatheringComplete(pc);

  elSignalBox.value = JSON.stringify(pc.localDescription);
  setConnState('Answer created. Copy it back to the host.');
}

async function hostApplyAnswer(answerJson) {
  if (!pc) throw new Error('No connection yet. Create an offer first.');
  const answer = JSON.parse(answerJson);
  await pc.setRemoteDescription(answer);
  setConnState('Answer applied. Waiting for data channel…');
}

function onRemoteMsg(msg) {
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'chat' && typeof msg.text === 'string') {
    addChatLine('Friend', msg.text);
    return;
  }

  if (msg.type === 'sync') {
    if (typeof msg.fen === 'string') {
      game.load(msg.fen);
      clearSelection();
      renderAll();
    }

    if (msg.clockEnabled && msg.clocks && typeof msg.clocks.w === 'number' && typeof msg.clocks.b === 'number') {
      clockEnabled = true;
      remaining = { w: msg.clocks.w, b: msg.clocks.b };
      baseSeconds = typeof msg.baseSeconds === 'number' ? msg.baseSeconds : baseSeconds;
      incSeconds = typeof msg.incSeconds === 'number' ? msg.incSeconds : incSeconds;
      startClock(game.turn());
      renderClocks();
    }

    return;
  }

  if (msg.type === 'move' && msg.move) {
    const before = game.fen();
    try {
      const result = game.move(msg.move);
      if (!result && typeof msg.fen === 'string') game.load(msg.fen);
    } catch {
      if (typeof msg.fen === 'string') game.load(msg.fen);
      else game.load(before);
    }

    if (msg.clocks && typeof msg.clocks.w === 'number' && typeof msg.clocks.b === 'number') {
      clockEnabled = true;
      remaining = { w: msg.clocks.w, b: msg.clocks.b };
      startClock(game.turn());
    }

    clearSelection();
    renderAll();
    blip('move');
    return;
  }

  if (msg.type === 'newGame') {
    startNewGame({
      preserveMode: true,
      fen: typeof msg.fen === 'string' ? msg.fen : undefined,
      clockPreset: typeof msg.clockPreset === 'string' ? msg.clockPreset : undefined
    });
    addChatLine('System', 'A new game has been started by your friend.');
    return;
  }
}

// -------------------- AI (Stockfish) --------------------

/** @type {Worker | null} */
let sf = null;
/** @type {((v: string) => void) | null} */
let sfLineWaiter = null;

function ensureStockfish() {
  if (sf) return;
  sf = new Worker('./stockfish-worker.js');
  sf.onmessage = (ev) => {
    const line = String(ev.data || '');
    if (sfLineWaiter) sfLineWaiter(line);
  };

  // UCI init
  sf.postMessage('uci');
  sf.postMessage('isready');
}

function onceStockfishLine(predicate, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const handler = (line) => {
      if (predicate(line)) {
        sfLineWaiter = null;
        resolve(line);
        return;
      }
      if (Date.now() > deadline) {
        sfLineWaiter = null;
        reject(new Error('Stockfish timeout'));
      }
    };
    sfLineWaiter = handler;
  });
}

async function getBestMove(fen, level) {
  ensureStockfish();

  // Skill Level (0..20)
  const skill = Math.max(0, Math.min(20, Number(level)));
  sf.postMessage(`setoption name Skill Level value ${skill}`);
  sf.postMessage('setoption name UCI_AnalyseMode value false');

  sf.postMessage(`position fen ${fen}`);

  // Simple mapping: higher level -> longer movetime
  const movetime = 120 + skill * 40; // 160ms..920ms
  sf.postMessage(`go movetime ${movetime}`);

  const best = await onceStockfishLine((l) => l.startsWith('bestmove '), 10000);
  const parts = best.trim().split(/\s+/);
  return parts[1];
}

function uciToMove(bestmove) {
  if (!bestmove || bestmove === '(none)') return null;
  const from = bestmove.slice(0, 2);
  const to = bestmove.slice(2, 4);
  const promo = bestmove.length >= 5 ? bestmove[4] : undefined;
  return promo ? { from, to, promotion: promo } : { from, to };
}

async function maybeAIMove() {
  if (mode !== 'ai') return;
  const human = elAIColor.value === 'w' ? 'w' : 'b';
  const toMove = game.turn();
  if (toMove === human) return;

  setStatus('The engine thinks…');

  try {
    const best = await getBestMove(game.fen(), elAILevel.value);
    const moveObj = uciToMove(best);
    if (!moveObj) {
      renderAll();
      return;
    }

    const result = game.move(moveObj);
    if (result) {
      switchClock(game.turn());
      clearSelection();
      renderAll();
      blip(result.isCapture() ? 'capture' : game.isCheck() ? 'check' : 'move');
    } else {
      renderAll();
    }
  } catch {
    renderAll();
    setStatus('AI could not move (engine unavailable).');
  }
}

// -------------------- Puzzle --------------------

const PUZZLES = [
  {
    name: 'Mate in 1',
    // White to move: Qh7#
    fen: '7k/8/6KQ/8/8/8/8/8 w - - 0 1',
    solutionSAN: ['Qh7#']
  },
  {
    name: 'Mate in 1',
    // White to move: Qg7#
    fen: '7k/5K2/6Q1/8/8/8/8/8 w - - 0 1',
    solutionSAN: ['Qg7#']
  },
  {
    name: 'Mate in 1',
    // White to move: Qb7#
    fen: 'k7/2K5/1Q6/8/8/8/8/8 w - - 0 1',
    solutionSAN: ['Qb7#']
  }
];

function puzzleOfTheDayIndex() {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return seed % PUZZLES.length;
}

let puzzle = {
  idx: puzzleOfTheDayIndex(),
  revealed: false
};

function loadPuzzle() {
  puzzle.idx = puzzleOfTheDayIndex();
  puzzle.revealed = false;
  const p = PUZZLES[puzzle.idx];
  game.load(p.fen);
  orientation = 'w';
  clearSelection();
  elPuzzleInfo.textContent = `${p.name}. Side to move: ${game.turn() === 'w' ? 'White' : 'Black'}.`;
  elPuzzleSolution.hidden = true;
  elPuzzleSolution.textContent = `Solution: ${p.solutionSAN.join(' ')}.`;
  renderAll();
}

// -------------------- Rendering --------------------

function clearSelection() {
  selectedSquare = null;
  selectedMoves = [];
  pendingPromotion = null;
  elPromotion.hidden = true;
}

function canUserMove(color) {
  if (mode === 'hotseat') return true;
  if (mode === 'puzzle') return true;
  if (mode === 'ai') {
    const human = elAIColor.value === 'w' ? 'w' : 'b';
    return color === human;
  }
  if (mode === 'online') return color === myColor && dc && dc.readyState === 'open';
  return true;
}

function renderBoard() {
  const sqs = squaresInView();

  elBoard.innerHTML = '';

  for (let idx = 0; idx < sqs.length; idx++) {
    const sq = sqs[idx];
    const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = Number(sq[1]);
    const isDark = (file + rank) % 2 === 1;

    const btn = document.createElement('button');
    btn.className = `square ${isDark ? 'dark' : 'light'}`;
    btn.type = 'button';
    btn.dataset.square = sq;
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', sq);

    const piece = game.get(sq);
    btn.textContent = pieceToGlyph(piece);

    if (selectedSquare === sq) btn.classList.add('selected');

    const moveHere = selectedMoves.find((m) => m.to === sq);
    if (moveHere) btn.classList.add(moveHere.isCapture() ? 'capture' : 'legal');

    btn.addEventListener('click', () => onSquareClick(sq));
    elBoard.appendChild(btn);
  }
}

function renderMoves() {
  elMoveList.innerHTML = '';
  const hist = game.history({ verbose: true });

  for (let i = 0; i < hist.length; i++) {
    const li = document.createElement('li');
    const ply = i + 1;
    const moveNo = Math.ceil(ply / 2);
    const prefix = i % 2 === 0 ? `${moveNo}. ` : '';
    li.textContent = `${prefix}${hist[i].san}`;
    elMoveList.appendChild(li);
  }

  elMoveList.scrollTop = elMoveList.scrollHeight;
}

function renderTags() {
  elModeTag.textContent = `Mode: ${mode}`;
  elTurnTag.textContent = `Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`;
}

function renderStatusLine() {
  if (game.isCheckmate()) {
    setStatus(`Checkmate. ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
    stopClock();
    blip('check');
    return;
  }
  if (game.isStalemate()) {
    setStatus('Stalemate.');
    stopClock();
    return;
  }
  if (game.isDraw()) {
    setStatus('Draw.');
    stopClock();
    return;
  }

  const who = game.turn() === 'w' ? 'White' : 'Black';
  const extra = game.isCheck() ? ' (check)' : '';

  if (mode === 'online' && (!dc || dc.readyState !== 'open')) {
    setStatus(`${who} to move${extra}. (Not connected.)`);
  } else {
    setStatus(`${who} to move${extra}.`);
  }
}

function renderAll() {
  renderBoard();
  renderMoves();
  renderTags();
  renderStatusLine();
  renderClocks();

  // Controls
  elBtnUndo.disabled = mode === 'online' || mode === 'ai';
}

// -------------------- Moves --------------------

function onSquareClick(square) {
  if (pendingPromotion) return;

  const turn = game.turn();
  if (!canUserMove(turn)) return;

  const piece = game.get(square);

  // Selecting a piece
  if (!selectedSquare) {
    if (!piece) return;
    if (piece.color !== turn) return;

    selectedSquare = square;
    selectedMoves = game.moves({ square, verbose: true });
    renderBoard();
    return;
  }

  // Clicking same square clears
  if (selectedSquare === square) {
    clearSelection();
    renderBoard();
    return;
  }

  // If clicking another own piece, reselect
  if (piece && piece.color === turn) {
    selectedSquare = square;
    selectedMoves = game.moves({ square, verbose: true });
    renderBoard();
    return;
  }

  // Attempt move
  const candidate = selectedMoves.find((m) => m.to === square);
  if (!candidate) return;

  if (candidate.isPromotion()) {
    pendingPromotion = { from: candidate.from, to: candidate.to };
    openPromotionPicker();
    return;
  }

  makeMove({ from: candidate.from, to: candidate.to });
}

function openPromotionPicker() {
  elPromotion.hidden = false;
  for (const btn of Array.from(elPromotion.querySelectorAll('button[data-promo]'))) {
    btn.onclick = () => {
      const promo = btn.getAttribute('data-promo');
      if (!pendingPromotion || !promo) return;
      const move = { from: pendingPromotion.from, to: pendingPromotion.to, promotion: promo };
      pendingPromotion = null;
      elPromotion.hidden = true;
      makeMove(move);
    };
  }
}

function makeMove(moveObj) {
  try {
    const result = game.move(moveObj);
    if (!result) return;

    clearSelection();

    // Clocks
    if (clockEnabled) {
      // Start clock on first move
      if (!activeClock) startClock(game.turn() === 'w' ? 'w' : 'b');
      switchClock(game.turn());
    }

    // Online sync
    if (mode === 'online') {
      sendMsg({
        type: 'move',
        move: moveObj,
        fen: game.fen(),
        pgn: game.pgn(),
        clocks: clockEnabled ? remaining : null
      });
    }

    renderAll();
    blip(result.isCapture() ? 'capture' : game.isCheck() ? 'check' : 'move');

    // AI reply
    if (mode === 'ai') {
      setTimeout(() => void maybeAIMove(), 50);
    }
  } catch {
    // ignore
  }
}

// -------------------- Chat --------------------

function addChatLine(who, text) {
  const wrap = document.createElement('div');
  wrap.className = 'chatLine';
  const meta = document.createElement('div');
  meta.className = 'chatMeta';
  meta.textContent = `${who} · ${new Date().toLocaleTimeString()}`;
  const body = document.createElement('div');
  body.textContent = text;
  wrap.appendChild(meta);
  wrap.appendChild(body);
  elChatLog.appendChild(wrap);
  elChatLog.scrollTop = elChatLog.scrollHeight;
}

function sendChat() {
  const text = (elChatInput.value || '').trim();
  if (!text) return;
  elChatInput.value = '';
  addChatLine('You', text);
  if (mode === 'online') sendMsg({ type: 'chat', text });
}

// -------------------- Game lifecycle --------------------

function startNewGame({ preserveMode = true, fen, clockPreset } = {}) {
  if (!preserveMode) mode = elModeSelect.value;

  clearSelection();
  game = new Chess();
  if (fen) game.load(fen);

  // Mode-specific
  if (mode === 'ai') {
    orientation = elAIColor.value === 'w' ? 'w' : 'b';
  } else if (mode === 'online') {
    myColor = elOnlineRole.value === 'w' ? 'w' : 'b';
    orientation = myColor;
  } else {
    orientation = 'w';
  }

  // Clock
  applyClockPreset(clockPreset ?? elClockPreset.value);
  if (clockEnabled) startClock(game.turn());

  // Reset chat on new local game
  if (mode !== 'online') elChatLog.innerHTML = '';

  // Puzzle
  if (mode === 'puzzle') loadPuzzle();

  renderAll();

  // AI first move if needed
  if (mode === 'ai') setTimeout(() => void maybeAIMove(), 80);
}

function applyModeUI() {
  mode = elModeSelect.value;

  elAIControls.hidden = mode !== 'ai';
  elOnlineControls.hidden = mode !== 'online';
  elPuzzleCard.hidden = mode !== 'puzzle';

  // Chat works best in online; still allowed locally
  if (mode === 'puzzle') {
    addChatLine('System', 'Puzzle mode: try to find the best line.');
  }

  if (mode !== 'online') {
    resetConnection();
  }

  startNewGame({ preserveMode: true });
}

// -------------------- Event wiring --------------------

elBtnNewGame.addEventListener('click', () => {
  startNewGame({ preserveMode: true });
  if (mode === 'online') {
    sendMsg({ type: 'newGame', fen: game.fen(), clockPreset: elClockPreset.value });
  }
});

elBtnFlip.addEventListener('click', () => {
  orientation = orientation === 'w' ? 'b' : 'w';
  renderBoard();
});

elBtnUndo.addEventListener('click', () => {
  if (mode === 'online' || mode === 'ai') return;
  game.undo();
  clearSelection();
  renderAll();
});

elBtnCopyFEN.addEventListener('click', () => copyText(game.fen()));

elBtnCopyPGN.addEventListener('click', () => copyText(game.pgn()));

elModeSelect.addEventListener('change', applyModeUI);

elAIColor.addEventListener('change', () => {
  if (mode !== 'ai') return;
  orientation = elAIColor.value === 'w' ? 'w' : 'b';
  startNewGame({ preserveMode: true });
});

elClockPreset.addEventListener('change', () => {
  applyClockPreset(elClockPreset.value);
  if (clockEnabled) startClock(game.turn());
  if (mode === 'online') {
    sendMsg({
      type: 'sync',
      fen: game.fen(),
      pgn: game.pgn(),
      clocks: clockEnabled ? remaining : null,
      clockEnabled,
      incSeconds,
      baseSeconds
    });
  }
});

elBtnSendChat.addEventListener('click', sendChat);
elChatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
});

elBtnLoadPGN.addEventListener('click', () => {
  const text = (elPGNInput.value || '').trim();
  if (!text) return;
  try {
    const ok = game.loadPgn(text, { strict: false });
    if (!ok) {
      addChatLine('System', 'Could not load PGN.');
      return;
    }
    clearSelection();
    renderAll();
    addChatLine('System', 'PGN loaded.');

    if (mode === 'online') {
      sendMsg({
        type: 'sync',
        fen: game.fen(),
        pgn: game.pgn(),
        clocks: clockEnabled ? remaining : null,
        clockEnabled,
        incSeconds,
        baseSeconds
      });
    }

    if (mode === 'ai') setTimeout(() => void maybeAIMove(), 80);
  } catch {
    addChatLine('System', 'Invalid PGN.');
  }
});

elBtnClearPGN.addEventListener('click', () => {
  elPGNInput.value = '';
});

elBtnPuzzleReset.addEventListener('click', () => {
  if (mode !== 'puzzle') return;
  loadPuzzle();
});

elBtnPuzzleReveal.addEventListener('click', () => {
  if (mode !== 'puzzle') return;
  puzzle.revealed = true;
  elPuzzleSolution.hidden = false;
});

elBtnHost.addEventListener('click', async () => {
  myColor = elOnlineRole.value === 'w' ? 'w' : 'b';
  orientation = myColor;
  try {
    await hostCreateOffer();
  } catch {
    setConnState('Failed to create offer.');
  }
});

elBtnJoin.addEventListener('click', async () => {
  myColor = elOnlineRole.value === 'w' ? 'w' : 'b';
  orientation = myColor;
  const text = (elSignalBox.value || '').trim();
  if (!text) {
    setConnState('Paste an offer first.');
    return;
  }
  try {
    await joinWithOffer(text);
  } catch {
    setConnState('Failed to create answer. Is the offer valid JSON?');
  }
});

elBtnCopySignal.addEventListener('click', () => copyText(elSignalBox.value || ''));

elBtnApplySignal.addEventListener('click', async () => {
  const text = (elSignalBox.value || '').trim();
  if (!text) return;
  try {
    await hostApplyAnswer(text);
  } catch {
    setConnState('Failed to apply. Make sure you pasted the correct answer JSON.');
  }
});

elOnlineRole.addEventListener('change', () => {
  myColor = elOnlineRole.value === 'w' ? 'w' : 'b';
  orientation = myColor;
  renderAll();
});

// -------------------- Startup --------------------

setQuote();
elToggleSound.checked = true;

applyClockPreset(elClockPreset.value);
applyModeUI();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore
    });
  });
}

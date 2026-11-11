(function () {
  /* ---------- CAT PIECES (SVG) ---------- */
  const BASE = '<path d="M24 92h52v-7q0-5-5-5H29q-5 0-5 5z"/>';
  const FACE = (ex, ey, nx, ny, gap = 6) =>
    `<circle cx="${ex - gap}" cy="${ey}" r="2.6"/><circle cx="${ex + gap}" cy="${ey}" r="2.6"/><path d="M${nx - 3} ${ny}h6l-3 3.4z"/>`;
  const PIECES = {
    p: { s: '<path d="M36 38 37 18 50 30zM64 38 63 18 50 30z"/><path d="M33 82Q35 62 50 60Q65 62 67 82z"/><circle cx="50" cy="46" r="16"/>' + BASE, f: FACE(50, 46, 50, 52) },
    r: { s: '<path d="M30 84 34 52H66L70 84z"/><path d="M30 54 30 16 44 30H56L70 16 70 54z"/>' + BASE, f: FACE(50, 42, 50, 47, 8) },
    b: { s: '<path d="M34 58 30 40 44 48zM66 58 70 40 56 48z"/><path d="M34 82Q34 68 50 62Q66 68 66 82z"/><path d="M50 10Q70 28 66 58H34Q30 28 50 10z"/><circle cx="50" cy="9" r="4.5"/>' + BASE + '<path class="line" d="M53 20 45 34"/>', f: FACE(50, 48, 50, 53) },
    q: { s: '<path d="M32 46 28 18 41 30 50 14 59 30 72 18 68 46z"/><circle cx="28" cy="15" r="4"/><circle cx="50" cy="10" r="4"/><circle cx="72" cy="15" r="4"/><path d="M30 84Q32 66 50 64Q68 66 70 84z"/><circle cx="50" cy="54" r="16"/>' + BASE, f: FACE(50, 54, 50, 60) },
    k: { s: '<path d="M46 5H54V12H61V20H54V30H46V20H39V12H46z"/><path d="M35 48 36 30 49 42zM65 48 64 30 51 42z"/><path d="M30 84Q32 68 50 66Q68 68 70 84z"/><circle cx="50" cy="55" r="16"/>' + BASE, f: FACE(50, 55, 50, 61) },
    n: { s: '<path d="M58 28 66 12 73 34z"/><path d="M30 84C30 66 38 58 42 50L32 48C28 42 34 34 42 32L46 14 56 26C72 28 78 46 74 62C73 70 72 78 72 84z"/>' + BASE, f: '<circle cx="52" cy="38" r="2.8"/><circle cx="33" cy="45" r="2.6"/>' }
  };
  const NAMES = { k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn' };
  const MOVES = { k: 'One step any way', q: 'Slides any direction', r: 'Straight lines', b: 'Diagonals', n: 'Jumps in an L', p: 'Forward, captures diagonal' };
  function pc(type, color, style) {
    const p = PIECES[type];
    return `<svg class="pc ${color}" viewBox="0 0 100 100" ${style ? `style="${style}"` : ''}><g class="shape">${p.s}</g><g class="face">${p.f}</g></svg>`;
  }

  /* ---------- MODES ---------- */
  const MODES = [
    { id: 'bullet', name: 'Bullet', time: 60, inc: 0, label: '1 minute', desc: 'Fast and frantic', icon: 'p' },
    { id: 'blitz', name: 'Blitz', time: 180, inc: 2, label: '3 min + 2 sec', desc: 'A little extra per move', icon: 'n' },
    { id: 'rapid', name: 'Rapid', time: 600, inc: 0, label: '10 minutes', desc: 'Time to think', icon: 'r' },
    { id: 'relaxed', name: 'Relaxed', time: 0, inc: 0, label: 'No clock', desc: 'Undo allowed', icon: 'q' }
  ];

  /* ---------- SCREENS + HOME ART ---------- */
  const $ = id => document.getElementById(id);
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));

  $('heroArt').innerHTML =
    pc('k', 'w', 'width:42%;left:4%;top:6%') + pc('q', 'b', 'width:42%;right:2%;top:0%') +
    pc('n', 'w', 'width:34%;left:16%;bottom:0%') + pc('r', 'b', 'width:34%;right:12%;bottom:4%');
  $('legend').innerHTML = ['k', 'q', 'r', 'b', 'n', 'p'].map(t =>
    `<div>${pc(t, 'w')}<strong>${NAMES[t]}</strong><small>${MOVES[t]}</small></div>`).join('');
  $('modeGrid').innerHTML = MODES.map(m =>
    `<button class="mode" data-mode="${m.id}">${pc(m.icon, 'w')}<strong>${m.name}</strong><div class="t">${m.label}</div><small>${m.desc}</small></button>`).join('');
  $('avWhite').innerHTML = pc('k', 'w');
  $('avBlack').innerHTML = pc('k', 'b');

  /* ---------- GAME ---------- */
  const game = new Chess();
  const files = 'abcdefgh';
  let mode = MODES[1], times = { w: 0, b: 0 }, tick = null, lastTs = 0, over = false;
  let selected = null, legal = [], lastMove = null;

  document.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => start(MODES.find(m => m.id === b.dataset.mode))));

  function start(m) {
    mode = m || mode;
    game.reset(); selected = null; legal = []; lastMove = null; over = false;
    times = { w: mode.time * 1000, b: mode.time * 1000 };
    $('modeLabel').textContent = mode.name + (mode.time ? ' · ' + mode.label : '');
    $('undoBtn').style.display = mode.time ? 'none' : '';
    $('overModal').classList.remove('open');
    show('game');
    runClock();
    render();
  }

  function runClock() {
    clearInterval(tick);
    if (!mode.time) return;
    lastTs = Date.now();
    tick = setInterval(() => {
      const now = Date.now(), dt = now - lastTs; lastTs = now;
      if (over || game.history().length === 0) return;
      const t = game.turn();
      times[t] -= dt;
      if (times[t] <= 0) { times[t] = 0; timeout(t); }
      renderClocks();
    }, 100);
  }

  function lonely(color) { // opponent cannot mate -> draw on timeout
    return game.board().flat().filter(p => p && p.color === color && p.type !== 'k').length === 0;
  }
  function timeout(loser) {
    const winner = loser === 'w' ? 'b' : 'w';
    if (lonely(winner)) finish('Draw', 'Time ran out, but there is not enough material to checkmate.');
    else finish('Time out', (winner === 'w' ? 'White' : 'Black') + ' wins on time.');
  }

  function fmt(ms) {
    if (!mode.time) return '∞';
    const s = Math.ceil(ms / 1000);
    if (ms < 10000) return (Math.max(ms, 0) / 1000).toFixed(1);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function renderClocks() {
    ['w', 'b'].forEach(c => {
      const el = $(c === 'w' ? 'clockWhite' : 'clockBlack');
      el.textContent = fmt(times[c]);
      el.classList.toggle('low', mode.time > 0 && times[c] < 10000 && !over);
    });
  }

  function render() {
    const b = $('board'), board = game.board(), chk = game.in_check();
    b.innerHTML = '';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const sq = files[c] + (8 - r), p = board[r][c], el = document.createElement('div');
      el.className = 'sq ' + ((r + c) % 2 ? 'd' : 'l');
      if (sq === selected) el.classList.add('sel');
      if (lastMove && (sq === lastMove.from || sq === lastMove.to)) el.classList.add('last');
      const h = legal.find(m => m.to === sq);
      if (h) { el.classList.add('hint'); if (p || h.flags.includes('e')) el.classList.add('cap'); }
      if (chk && p && p.type === 'k' && p.color === game.turn()) el.classList.add('chk');
      if (p) el.insertAdjacentHTML('beforeend', pc(p.type, p.color === 'w' ? 'w' : 'b'));
      if (c === 0) el.insertAdjacentHTML('beforeend', `<span class="co" style="top:2px;left:3px">${8 - r}</span>`);
      if (r === 7) el.insertAdjacentHTML('beforeend', `<span class="co" style="bottom:1px;right:3px">${files[c]}</span>`);
      el.addEventListener('click', () => onSquare(sq));
      b.appendChild(el);
    }
    info(); renderClocks();
  }

  function onSquare(sq) {
    if (over) return;
    const mv = legal.find(m => m.to === sq);
    if (selected && mv) { mv.flags.includes('p') ? askPromo(mv.from, mv.to) : play(mv.from, mv.to); return; }
    const p = game.get(sq);
    if (p && p.color === game.turn()) { selected = sq; legal = game.moves({ square: sq, verbose: true }); }
    else { selected = null; legal = []; }
    render();
  }

  function play(from, to, promo) {
    const mover = game.turn();
    const m = game.move({ from, to, promotion: promo || 'q' });
    if (!m) return;
    if (mode.time && game.history().length > 1) times[mover] += mode.inc * 1000;
    lastMove = { from: m.from, to: m.to }; selected = null; legal = [];
    lastTs = Date.now();
    render();
    if (game.in_checkmate()) finish('Checkmate', (mover === 'w' ? 'White' : 'Black') + ' wins.');
    else if (game.in_stalemate()) finish('Stalemate', 'No legal moves. It is a draw.');
    else if (game.in_draw()) finish('Draw', 'The game is a draw.');
  }

  function askPromo(from, to) {
    const color = game.turn() === 'w' ? 'w' : 'b';
    $('promoChoices').innerHTML = '';
    ['q', 'r', 'b', 'n'].forEach(t => {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', NAMES[t]);
      btn.innerHTML = pc(t, color);
      btn.onclick = () => { $('promoModal').classList.remove('open'); play(from, to, t); };
      $('promoChoices').appendChild(btn);
    });
    $('promoModal').classList.add('open');
  }

  function finish(title, msg) {
    over = true; clearInterval(tick);
    $('overTitle').textContent = title; $('overMsg').textContent = msg;
    $('overModal').classList.add('open');
    renderClocks(); info();
  }

  function info() {
    const t = game.turn();
    $('barWhite').classList.toggle('turn', t === 'w' && !over);
    $('barBlack').classList.toggle('turn', t === 'b' && !over);
    let s = (t === 'w' ? "White's" : "Black's") + ' turn';
    if (game.in_check()) s += ' · check!';
    if (over) s = $('overTitle').textContent + ' · ' + $('overMsg').textContent;
    $('status').textContent = s;
    const hist = game.history(), h = $('history');
    if (!hist.length) { h.innerHTML = '<p class="empty">No moves yet. White starts.</p>'; return; }
    h.innerHTML = '';
    for (let i = 0; i < hist.length; i += 2)
      h.insertAdjacentHTML('beforeend', `<span class="n">${i / 2 + 1}.</span><span>${hist[i]}</span><span>${hist[i + 1] || ''}</span>`);
    h.scrollTop = h.scrollHeight;
  }

  $('undoBtn').onclick = () => {
    if (over) return;
    game.undo(); selected = null; legal = [];
    const hv = game.history({ verbose: true }); lastMove = hv.length ? hv[hv.length - 1] : null;
    render();
  };
  $('resignBtn').onclick = () => {
    if (over) return;
    if (confirm((game.turn() === 'w' ? 'White' : 'Black') + ' resigns?'))
      finish('Resigned', (game.turn() === 'w' ? 'Black' : 'White') + ' wins.');
  };
  $('restartBtn').onclick = () => start(mode);
  $('rematchBtn').onclick = () => start(mode);
  $('menuBtn').onclick = () => { clearInterval(tick); over = true; show('modes'); };
  $('overMenuBtn').onclick = () => { $('overModal').classList.remove('open'); show('modes'); };
  $('overViewBtn').onclick = () => $('overModal').classList.remove('open');
})();

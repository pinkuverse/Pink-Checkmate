(function () {
  /* ---------- PIECES (SVG) ---------- */
  const BASE = '<path d="M24 92h52v-7q0-5-5-5H29q-5 0-5 5z"/>';
  const FACE = (ex, ey, nx, ny, gap = 6) =>
    `<circle cx="${ex - gap}" cy="${ey}" r="2.6"/><circle cx="${ex + gap}" cy="${ey}" r="2.6"/><path d="M${nx - 3} ${ny}h6l-3 3.4z"/>`;
  const CAT = {
    p: { s: '<path d="M36 38 37 18 50 30zM64 38 63 18 50 30z"/><path d="M33 82Q35 62 50 60Q65 62 67 82z"/><circle cx="50" cy="46" r="16"/>' + BASE, f: FACE(50, 46, 50, 52) },
    r: { s: '<path d="M30 84 34 52H66L70 84z"/><path d="M30 54 30 16 44 30H56L70 16 70 54z"/>' + BASE, f: FACE(50, 42, 50, 47, 8) },
    b: { s: '<path d="M34 58 30 40 44 48zM66 58 70 40 56 48z"/><path d="M34 82Q34 68 50 62Q66 68 66 82z"/><path d="M50 10Q70 28 66 58H34Q30 28 50 10z"/><circle cx="50" cy="9" r="4.5"/>' + BASE + '<path class="line" d="M53 20 45 34"/>', f: FACE(50, 48, 50, 53) },
    q: { s: '<path d="M32 46 28 18 41 30 50 14 59 30 72 18 68 46z"/><circle cx="28" cy="15" r="4"/><circle cx="50" cy="10" r="4"/><circle cx="72" cy="15" r="4"/><path d="M30 84Q32 66 50 64Q68 66 70 84z"/><circle cx="50" cy="54" r="16"/>' + BASE, f: FACE(50, 54, 50, 60) },
    k: { s: '<path d="M46 5H54V12H61V20H54V30H46V20H39V12H46z"/><path d="M35 48 36 30 49 42zM65 48 64 30 51 42z"/><path d="M30 84Q32 68 50 66Q68 68 70 84z"/><circle cx="50" cy="55" r="16"/>' + BASE, f: FACE(50, 55, 50, 61) },
    n: { s: '<path d="M58 28 66 12 73 34z"/><path d="M30 84C30 66 38 58 42 50L32 48C28 42 34 34 42 32L46 14 56 26C72 28 78 46 74 62C73 70 72 78 72 84z"/>' + BASE, f: '<circle cx="52" cy="38" r="2.8"/><circle cx="33" cy="45" r="2.6"/>' }
  };
  const CLASSIC = {
    p: { s: '<circle cx="50" cy="30" r="12"/><path d="M42 44h16l-3 8q10 8 12 28H33q2-20 12-28z"/>' + BASE, f: '' },
    r: { s: '<path d="M32 18h9v8h6v-8h6v8h6v-8h9v22l-6 6 3 26H35l3-26-6-6z"/>' + BASE, f: '' },
    n: { s: '<path d="M28 82C30 62 36 54 46 46L30 52C26 52 24 48 28 44L44 26 46 14 54 22C72 26 78 48 74 66L74 82z"/>' + BASE, f: '<circle cx="55" cy="35" r="3"/>' },
    b: { s: '<path d="M50 12C64 26 66 38 60 50H40C34 38 36 26 50 12z"/><circle cx="50" cy="9" r="4.5"/><path d="M36 50h28v7H36zM41 57h18l5 23H36z"/>' + BASE + '<path class="line" d="M54 24 47 36"/>', f: '' },
    q: { s: '<path d="M28 34 33 46 39 24 44 44 50 20 56 44 61 24 67 46 72 34 66 64H34z"/><circle cx="28" cy="31" r="3.6"/><circle cx="39" cy="21" r="3.6"/><circle cx="50" cy="17" r="3.6"/><circle cx="61" cy="21" r="3.6"/><circle cx="72" cy="31" r="3.6"/><path d="M34 64h32l4 16H30z"/>' + BASE, f: '' },
    k: { s: '<path d="M46 5h8v7h7v8h-7v7h-8v-7h-7v-8h7z"/><path d="M36 56Q34 34 50 31Q66 34 64 56z"/><path d="M36 56h28v6H36zM40 62h20l5 18H35z"/>' + BASE, f: '' }
  };
  const BASE2 = '<path d="M24 92h52v-5q0-3-3-3H27q-3 0-3 3z"/><path d="M30 83h40v-5H30z"/>';
  const ROYAL = {
    p: { s: '<circle cx="50" cy="26" r="11"/><path d="M37 41h26v6H37z"/><path d="M42 47Q41 62 33 78h34Q59 62 58 47z"/>' + BASE2 + '<path class="line" d="M45 22q3-4 8-2"/><path class="line" d="M41 62q9 4 18 0"/>', f: '' },
    r: { s: '<path d="M30 14h9v7h6v-7h10v7h6v-7h9v20H30z"/><path d="M34 34h32l-2 7H36z"/><path d="M37 41h26l3 37H34z"/>' + BASE2 + '<path class="line" d="M33 27h34"/><path class="line" d="M37 56h26"/><path class="line" d="M42 44l-2 28"/>', f: '' },
    n: { s: '<path d="M30 78C30 64 36 54 46 46 40 47 34 48 28 46 24 44 26 40 30 36L42 24 44 12 52 20C70 22 76 44 72 60 70 68 70 72 70 78z"/>' + BASE2 + '<path class="line" d="M57 24C65 34 67 48 62 62"/><path class="line" d="M52 29C58 38 60 48 58 58"/>', f: '<circle cx="54" cy="34" r="2.8"/><circle cx="31" cy="41" r="2.2"/>' },
    b: { s: '<path d="M50 11C63 21 67 33 60 44H40C33 33 37 21 50 11z"/><circle cx="50" cy="8" r="4"/><path d="M36 44h28v6H36z"/><path d="M41 50h18l5 28H36z"/>' + BASE2 + '<path class="line" d="M50 20v13M44 26h12"/><path class="line" d="M41 62q9 4 18 0"/>', f: '' },
    q: { s: '<path d="M30 40 26 20 36 32 40 14 45 30 50 11 55 30 60 14 64 32 74 20 70 40z"/><circle cx="26" cy="18" r="3.5"/><circle cx="40" cy="12" r="3.5"/><circle cx="50" cy="9" r="3.5"/><circle cx="60" cy="12" r="3.5"/><circle cx="74" cy="18" r="3.5"/><path d="M32 40h36v6H32z"/><path d="M38 46h24l6 32H32z"/>' + BASE2 + '<path class="line" d="M36 56q14 5 28 0"/>', f: '' },
    k: { s: '<path d="M46 3h8v7h6v8h-6v6h-8v-6h-6v-8h6z"/><path d="M33 44 35 30Q50 23 65 30L67 44z"/><path d="M32 44h36v6H32z"/><path d="M38 50h24l6 28H32z"/>' + BASE2 + '<path class="line" d="M50 26v16"/><path class="line" d="M36 62q14 5 28 0"/>', f: '' }
  };
  const BASE3 = '<ellipse cx="50" cy="86" rx="27" ry="8"/>';
  const GLOSSY = {
    p: { s: '<path d="M31 84C31 64 40 54 50 54S69 64 69 84z"/><circle cx="50" cy="36" r="16"/>' + BASE3, f: '' },
    r: { s: '<path d="M31 84Q35 64 36 46H64Q65 64 69 84z"/><rect x="30" y="30" width="40" height="18" rx="6"/><circle cx="38" cy="26" r="7"/><circle cx="50" cy="23" r="7"/><circle cx="62" cy="26" r="7"/>' + BASE3, f: '' },
    n: { s: '<path d="M30 84C28 66 38 56 44 49 36 49 30 45 30 39 30 31 40 23 48 17L51 8 58 18C74 22 79 42 72 58 70 70 72 78 72 84z"/>' + BASE3, f: '<circle cx="55" cy="34" r="3"/>' },
    b: { s: '<path d="M33 84Q36 62 50 58 64 62 67 84z"/><ellipse cx="50" cy="36" rx="15" ry="21"/><ellipse cx="50" cy="58" rx="19" ry="5"/><circle cx="50" cy="10" r="5"/>' + BASE3 + '<path class="line" d="M54 26 46 40"/>', f: '' },
    q: { s: '<path d="M30 84Q32 62 50 58 68 62 70 84z"/><path d="M28 28 36 50H64L72 28 61 38 50 22 39 38z"/><circle cx="28" cy="25" r="5"/><circle cx="50" cy="17" r="5"/><circle cx="72" cy="25" r="5"/><ellipse cx="50" cy="56" rx="19" ry="6"/>' + BASE3, f: '' },
    k: { s: '<path d="M31 84C31 66 40 58 50 58S69 66 69 84z"/><circle cx="50" cy="44" r="17"/><path d="M45 3h10v8h8v9h-8v8H45v-8h-8v-9h8z"/>' + BASE3, f: '' }
  };
  const SETS = { classic: CLASSIC, royal: ROYAL, cat: CAT, glossy: GLOSSY };
  const NAMES = { k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn' };
  const MOVES = { k: 'One step any way', q: 'Slides any direction', r: 'Straight lines', b: 'Diagonals', n: 'Jumps in an L', p: 'Forward, captures diagonal' };
  let pieceStyle = 'classic', pieceColor = 'pink', boardTheme = 'blush';
  function pc(type, color, style, ps) {
    ps = ps || pieceStyle;
    const p = SETS[ps][type];
    const sh = `<g class="shade" fill="url(#shade)" stroke="none">${p.s}</g>`;
    const gl = `<g class="gloss" fill="url(#gloss)" stroke="none">${p.s}</g>`;
    const shine = ps === 'glossy' ? sh + gl : ps === 'royal' ? sh : '';
    return `<svg class="pc ${color}${ps === 'glossy' || ps === 'royal' ? ' glossy' : ''}" viewBox="0 0 100 100" ${style ? `style="${style}"` : ''}><g class="shape">${p.s}</g>${shine}<g class="face">${p.f}</g></svg>`;
  }
  const PCOLORS = {
    pink:     { n: 'Pink',     wf: '#fff5f9', ws: '#e07aa3', bf: '#f06fa0', bs: '#b83c73', bface: '#ffffff' },
    green:    { n: 'Mint',     wf: '#f3fff8', ws: '#4fae86', bf: '#57c796', bs: '#2d8a62', bface: '#ffffff' },
    lavender: { n: 'Lavender', wf: '#f8f4ff', ws: '#9b86d6', bf: '#a78ce6', bs: '#6a52b3', bface: '#ffffff' },
    blue:     { n: 'Sky',      wf: '#f2faff', ws: '#5aa2d6', bf: '#6cb4ec', bs: '#3a78ab', bface: '#ffffff' }
  };
  const BOARDS = {
    blush:    { n: 'Blush',    l: '#fff0f6', d: '#f4b6cd', b: '#f5aac8' },
    mint:     { n: 'Mint',     l: '#f1fbf5', d: '#a9dcc0', b: '#8fd0ae' },
    lavender: { n: 'Lavender', l: '#f6f1ff', d: '#cbbbf0', b: '#b8a3ea' },
    sky:      { n: 'Sky',      l: '#eff8ff', d: '#a9cdee', b: '#8fbbe4' },
    peach:    { n: 'Peach',    l: '#fff5ee', d: '#f5c7aa', b: '#f0b490' }
  };

  /* ---------- MODES ---------- */
  const MODES = [
    { id: 'bullet', name: 'Bullet', time: 60, inc: 0, label: '1 minute', desc: 'Fast and frantic', icon: 'p' },
    { id: 'blitz', name: 'Blitz', time: 180, inc: 2, label: '3 min + 2 sec', desc: 'A little extra per move', icon: 'n' },
    { id: 'rapid', name: 'Rapid', time: 600, inc: 0, label: '10 minutes', desc: 'Time to think', icon: 'r' },
    { id: 'relaxed', name: 'Relaxed', time: 0, inc: 0, label: 'No clock', desc: 'Undo allowed', icon: 'q' }
  ];

  /* ---------- SCREENS, ART, SETTINGS ---------- */
  const $ = id => document.getElementById(id);
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { b.dataset.go === 'game' ? enterGame() : show(b.dataset.go); }));

  function refreshArt() {
    $('heroArt').innerHTML =
      pc('k', 'w', 'width:42%;left:4%;top:6%') + pc('q', 'b', 'width:42%;right:2%;top:0%') +
      pc('n', 'w', 'width:34%;left:16%;bottom:0%') + pc('r', 'b', 'width:34%;right:12%;bottom:4%');
    $('legend').innerHTML = ['k', 'q', 'r', 'b', 'n', 'p'].map(t =>
      `<button class="lg-card" data-t="${t}">${pc(t, 'w')}<strong>${NAMES[t]}</strong><small>${MOVES[t]}</small></button>`).join('');
    buildSetup();
    $('avWhite').innerHTML = pc('k', 'w');
    $('avBlack').innerHTML = pc('k', 'b');
  }
  function applyTheme() {
    const c = PCOLORS[pieceColor], b = BOARDS[boardTheme], r = document.documentElement.style;
    r.setProperty('--wf', c.wf); r.setProperty('--ws', c.ws); r.setProperty('--bf', c.bf); r.setProperty('--bs', c.bs); r.setProperty('--bface', c.bface);
    r.setProperty('--lsq', b.l); r.setProperty('--dsq', b.d); r.setProperty('--bd', b.b);
  }
  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('pcSettings') || '{}');
      if (SETS[s.style]) pieceStyle = s.style;
      if (PCOLORS[s.color]) pieceColor = s.color;
      if (BOARDS[s.board]) boardTheme = s.board;
    } catch (e) {}
  }
  function saveSettings() {
    try { localStorage.setItem('pcSettings', JSON.stringify({ style: pieceStyle, color: pieceColor, board: boardTheme })); } catch (e) {}
  }
  function buildSettings() {
    const act = (a, b) => (a === b ? ' active' : '');
    $('optStyle').innerHTML = [['classic', 'Classic'], ['royal', 'Royal'], ['cat', 'Cat'], ['glossy', 'Glossy']].map(([k, n]) =>
      `<button class="opt${act(pieceStyle, k)}" data-k="style" data-v="${k}">${pc('k', 'w', '', k)}<small>${n}</small></button>`).join('');
    $('optColor').innerHTML = Object.entries(PCOLORS).map(([k, c]) =>
      `<button class="opt${act(pieceColor, k)}" data-k="color" data-v="${k}"><span class="sw"><i style="background:${c.wf};border-color:${c.ws}"></i><i style="background:${c.bf};border-color:${c.bs}"></i></span><small>${c.n}</small></button>`).join('');
    $('optBoard').innerHTML = Object.entries(BOARDS).map(([k, b]) =>
      `<button class="opt${act(boardTheme, k)}" data-k="board" data-v="${k}"><span class="mini"><b style="background:${b.l}"></b><b style="background:${b.d}"></b><b style="background:${b.d}"></b><b style="background:${b.l}"></b></span><small>${b.n}</small></button>`).join('');
  }
  function changeSetting(k, v) {
    if (k === 'style') pieceStyle = v; else if (k === 'color') pieceColor = v; else boardTheme = v;
    saveSettings(); applyTheme(); refreshArt(); buildSettings();
    if ($('game').classList.contains('active')) render();
  }
  $('setModal').addEventListener('click', e => {
    const b = e.target.closest('.opt');
    if (b) changeSetting(b.dataset.k, b.dataset.v);
    else if (e.target.id === 'setModal') $('setModal').classList.remove('open');
  });
  $('setDone').onclick = () => $('setModal').classList.remove('open');
  document.querySelectorAll('[data-settings]').forEach(b => b.addEventListener('click', () => { buildSettings(); $('setModal').classList.add('open'); }));

  /* ---------- GAME ---------- */
  const game = new Chess();
  const files = 'abcdefgh';
  const BOTS = [
    { id: 'kitty', name: 'Kitty', rating: 400, tag: 'Beginner', icon: 'p' },
    { id: 'bunny', name: 'Bunny', rating: 800, tag: 'Developing beginner', icon: 'n' },
    { id: 'mochi', name: 'Mochi', rating: 1100, tag: 'Intermediate', icon: 'b' },
    { id: 'blossom', name: 'Blossom', rating: 1400, tag: 'Advanced intermediate', icon: 'r' },
    { id: 'queenie', name: 'Queenie', rating: 1700, tag: 'Advanced', icon: 'q' }
  ];
  let mode = MODES[1], opp = 'human', bot = BOTS[0], sidePick = 'w', humanColor = 'w', flip = false;
  let thinking = false, botToken = 0, started = false;
  let times = { w: 0, b: 0 }, tick = null, lastTs = 0, over = false;
  let selected = null, legal = [], lastMove = null, premove = null, viewPly = null, manualFlip = false;

  function who(c) { return opp === 'bot' ? (c === humanColor ? 'You' : bot.name) : (c === 'w' ? 'White' : 'Black'); }
  function wins(c) { const w = who(c); return w + (w === 'You' ? ' win.' : ' wins.'); }

  /* ----- setup panel ----- */
  function buildSetup() {
    $('modeList').innerHTML = MODES.map(m =>
      `<button class="mopt${m.id === mode.id ? ' active' : ''}" data-mode="${m.id}">${pc(m.icon, 'w')}<span><b>${m.name}</b><small>${m.label}</small></span></button>`).join('');
    $('botList').innerHTML = BOTS.map(x =>
      `<button class="mopt${x.id === bot.id ? ' active' : ''}" data-bot="${x.id}">${pc(x.icon, 'b')}<span><b>${x.name}</b><small>${x.tag}</small></span><span class="rt">${x.rating}</span></button>`).join('');
    document.querySelectorAll('#oppSeg button').forEach(b => b.classList.toggle('active', b.dataset.opp === opp));
    document.querySelectorAll('#sideSeg button').forEach(b => b.classList.toggle('active', b.dataset.side === sidePick));
    $('botBox').hidden = opp !== 'bot'; $('sideBox').hidden = opp !== 'bot';
  }
  function setupClick(e) {
    const t = e.target.closest('button'); if (!t) return;
    if (t.id === 'startBtn') { started = true; startGame(); return; }
    if (t.dataset.mode) mode = MODES.find(m => m.id === t.dataset.mode);
    else if (t.dataset.bot) bot = BOTS.find(x => x.id === t.dataset.bot);
    else if (t.dataset.opp) opp = t.dataset.opp;
    else if (t.dataset.side) sidePick = t.dataset.side;
    else return;
    buildSetup();
    if (!game.history().length || over) { started = true; startGame(); }
  }
  document.querySelector('.setup').addEventListener('click', setupClick);
  $('quick').addEventListener('click', setupClick);

  function enterGame() {
    show('game');
    if (!started || over) { started = true; startGame(); } else render();
  }

  function setNames() {
    let w = ['White', 'Player 1'], k = ['Black', 'Player 2'];
    if (opp === 'bot') {
      const me = ['You', 'Player'], cpu = [bot.name, 'Computer · ' + bot.rating];
      w = humanColor === 'w' ? me : cpu; k = humanColor === 'w' ? cpu : me;
    }
    $('nmWhite').textContent = w[0]; $('sbWhite').textContent = w[1];
    $('nmBlack').textContent = k[0]; $('sbBlack').textContent = k[1];
  }

  function startGame() {
    botToken++; thinking = false;
    game.reset(); selected = null; legal = []; lastMove = null; over = false; premove = null; viewPly = null; manualFlip = false;
    humanColor = opp === 'bot' ? (sidePick === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : sidePick) : 'w';
    flip = opp === 'bot' && humanColor === 'b';
    times = { w: mode.time * 1000, b: mode.time * 1000 };
    $('modeLabel').textContent = mode.name + (mode.time ? ' · ' + mode.label : '') + (opp === 'bot' ? ' · vs ' + bot.name : '');
    { const lbl = opp === 'bot' ? 'Undo' : 'Request takeback'; $('undoBtn').title = lbl; $('undoBtn').setAttribute('aria-label', lbl); }
    document.querySelector('.board-col').classList.toggle('flip', flip);
    stopConfetti(); $('overModal').classList.remove('open'); $('promoModal').classList.remove('open'); $('tbModal').hidden = true; $('rsCard').hidden = true;
    setNames(); buildSetup(); runClock(); render(); maybeBot();
  }

  /* ----- clocks ----- */
  function runClock() {
    clearInterval(tick);
    if (!mode.time) return;
    lastTs = Date.now();
    tick = setInterval(() => {
      const now = Date.now(), dt = now - lastTs; lastTs = now;
      if (over || !$('game').classList.contains('active') || !$('tbModal').hidden || !$('rsCard').hidden || game.history().length === 0) return;
      const t = game.turn();
      times[t] -= dt;
      if (times[t] <= 0) { times[t] = 0; timeout(t); }
      renderClocks();
    }, 100);
  }
  function lonely(color) {
    return game.board().flat().filter(p => p && p.color === color && p.type !== 'k').length === 0;
  }
  function timeout(loser) {
    const winner = loser === 'w' ? 'b' : 'w';
    if (lonely(winner)) finish('Draw', 'Time ran out, but there is not enough material to checkmate.');
    else finish('Time out', wins(winner), winner);
  }
  function fmt(ms) {
    if (!mode.time) return '∞';
    if (ms < 10000) return (Math.max(ms, 0) / 1000).toFixed(1);
    const s = Math.ceil(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function renderClocks() {
    ['w', 'b'].forEach(c => {
      const el = $(c === 'w' ? 'clockWhite' : 'clockBlack');
      el.textContent = fmt(times[c]);
      el.classList.toggle('low', mode.time > 0 && times[c] < 10000 && !over);
    });
  }

  /* ----- board ----- */
  function render() {
    if (viewPly !== null && viewPly >= game.history().length) viewPly = null;
    const view = viewPly !== null;
    let src = game, lm = lastMove;
    if (view) {
      const hv = game.history({ verbose: true });
      src = new Chess(); for (let i = 0; i < viewPly; i++) src.move(hv[i].san);
      lm = viewPly > 0 ? { from: hv[viewPly - 1].from, to: hv[viewPly - 1].to } : null;
    }
    const fl = flip !== manualFlip;
    document.querySelector('.board-col').classList.toggle('flip', fl);
    const b = $('board'), board = src.board(), chk = src.in_check(), turn = src.turn();
    b.innerHTML = '';
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const r = fl ? 7 - i : i, c = fl ? 7 - j : j;
      const sq = files[c] + (8 - r), p = board[r][c], el = document.createElement('div');
      el.className = 'sq ' + ((r + c) % 2 ? 'd' : 'l');
      if (sq === selected) el.classList.add('sel');
      if (!view && premove && (sq === premove.from || sq === premove.to)) el.classList.add('pre');
      if (lm && (sq === lm.from || sq === lm.to)) el.classList.add('last');
      const h = legal.find(m => m.to === sq);
      if (h) { el.classList.add('hint'); if (p || h.flags.includes('e')) el.classList.add('cap'); }
      if (chk && p && p.type === 'k' && p.color === turn) el.classList.add('chk');
      if (p) el.insertAdjacentHTML('beforeend', pc(p.type, p.color === 'w' ? 'w' : 'b'));
      if (j === 0) el.insertAdjacentHTML('beforeend', `<span class="co" style="top:2px;left:3px">${8 - r}</span>`);
      if (i === 7) el.insertAdjacentHTML('beforeend', `<span class="co" style="bottom:1px;right:3px">${files[c]}</span>`);
      el.addEventListener('click', () => onSquare(sq));
      b.appendChild(el);
    }
    info(); renderClocks();
  }

  /* ----- premove (against the computer): queue your next move while it thinks ----- */
  function premoveTargets(sq) {
    const p = game.get(sq), out = [];
    const f = files.indexOf(sq[0]), r = +sq[1] - 1;
    const at = (nf, nr) => (nf < 0 || nf > 7 || nr < 0 || nr > 7) ? null : files[nf] + (nr + 1);
    const own = t => { const o = game.get(t); return o && o.color === p.color; };
    const step = (df, dr) => { const t = at(f + df, r + dr); if (t && !own(t)) out.push(t); };
    const slide = dirs => dirs.forEach(([df, dr]) => { for (let k = 1; k < 8; k++) { const t = at(f + df * k, r + dr * k); if (!t || own(t)) break; out.push(t); } });
    const D = [[1, 0], [-1, 0], [0, 1], [0, -1]], G = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    if (p.type === 'n') [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([a, b]) => step(a, b));
    else if (p.type === 'k') { D.concat(G).forEach(([a, b]) => step(a, b)); if (sq === 'e1' || sq === 'e8') { step(2, 0); step(-2, 0); } }
    else if (p.type === 'b') slide(G);
    else if (p.type === 'r') slide(D);
    else if (p.type === 'q') slide(D.concat(G));
    else { const dir = p.color === 'w' ? 1 : -1; step(0, dir); if (r === (p.color === 'w' ? 1 : 6)) step(0, 2 * dir); step(1, dir); step(-1, dir); }
    return out;
  }
  function premoveClick(sq) {
    const p = game.get(sq);
    if (selected && legal.find(m => m.to === sq)) { premove = { from: selected, to: sq }; selected = null; legal = []; render(); return; }
    if (p && p.color === humanColor) { premove = null; selected = sq; legal = premoveTargets(sq).map(t => ({ to: t, flags: '' })); render(); return; }
    premove = null; selected = null; legal = []; render();
  }
  function runPremove() {
    if (!premove) return;
    const pm = premove, tok = botToken; premove = null;
    const mv = game.moves({ square: pm.from, verbose: true }).find(m => m.to === pm.to);
    if (!mv) { render(); return; }
    setTimeout(() => {
      if (over || tok !== botToken || game.turn() !== humanColor) return;
      play(pm.from, pm.to, mv.flags.includes('p') ? 'q' : undefined);
    }, 150);
  }

  function onSquare(sq) {
    if (viewPly !== null) { goPly(game.history().length); return; }
    if (over) return;
    if (opp === 'bot' && (thinking || game.turn() !== humanColor)) { premoveClick(sq); return; }
    if (thinking) return;
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
    if (m) after(m, mover);
  }

  function after(m, mover) {
    if (mode.time && game.history().length > 1) times[mover] += mode.inc * 1000;
    lastMove = { from: m.from, to: m.to }; selected = null; legal = [];
    lastTs = Date.now();
    render();
    if (game.in_checkmate()) finish('Checkmate', wins(mover), mover);
    else if (game.in_stalemate()) finish('Stalemate', 'No legal moves. It is a draw.');
    else if (game.in_draw()) finish('Draw', 'The game is a draw.');
    else { maybeBot(); if (opp === 'bot' && !over && game.turn() === humanColor) runPremove(); }
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

  function finish(title, msg, winner) {
    over = true; thinking = false; premove = null; botToken++; clearInterval(tick);
    $('rsCard').hidden = true; $('tbModal').hidden = true;
    if (opp === 'bot' && window.PinkAccount) { try { window.PinkAccount.recordResult(!winner ? 'draw' : winner === humanColor ? 'win' : 'loss', { bot: bot.name, rating: bot.rating, mode: mode.name, moves: game.history().length }); } catch (e) {} }
    $('overTitle').textContent = title; $('overMsg').textContent = msg;
    const win = !!winner && (opp !== 'bot' || winner === humanColor);
    $('overBox').classList.toggle('celebrate', win);
    $('winCat').toggleAttribute('hidden', !win); $('overHead').hidden = !win;
    if (win) $('overHead').textContent = opp === 'bot' ? 'You win!' : (winner === 'w' ? 'White' : 'Black') + ' wins!';
    $('overModal').classList.add('open');
    if (win) celebrate(); else stopConfetti();
    renderClocks(); info();
  }

  function info() {
    const t = game.turn();
    $('barWhite').classList.toggle('turn', t === 'w' && !over);
    $('barBlack').classList.toggle('turn', t === 'b' && !over);
    let s;
    if (over) s = $('overTitle').textContent + ' · ' + $('overMsg').textContent;
    else if (opp === 'bot') s = t === humanColor ? 'Your turn' : bot.name + ' is thinking...';
    else s = (t === 'w' ? "White's" : "Black's") + ' turn';
    if (!over && game.in_check()) s += ' · check!';
    if (viewPly !== null && viewPly < game.history().length) s = 'Viewing move ' + viewPly + ' of ' + game.history().length;
    $('status').textContent = s;
    const hist = game.history(), h = $('history');
    const cur = viewPly === null ? hist.length : viewPly;
    document.querySelectorAll('#navRow [data-nav]').forEach(b => { const k = b.dataset.nav; b.disabled = (k === 'first' || k === 'prev') ? cur <= 0 : cur >= hist.length; });
    $('startBtn').textContent = hist.length && !over ? 'Start new game' : 'Start game';
    if (!hist.length) { h.innerHTML = '<p class="empty">No moves yet. White starts.</p>'; return; }
    h.innerHTML = '';
    const mvEl = i => hist[i] ? `<span class="mv${cur === i + 1 ? ' cur' : ''}" data-ply="${i + 1}">${hist[i]}</span>` : '<span></span>';
    for (let i = 0; i < hist.length; i += 2) h.insertAdjacentHTML('beforeend', `<span class="n">${i / 2 + 1}.</span>${mvEl(i)}${mvEl(i + 1)}`);
    if (viewPly === null) h.scrollTop = h.scrollHeight;
  }

  /* ----- computer opponent: see bots.js (custom engine, no Stockfish) ----- */
  function maybeBot() {
    if (opp !== 'bot' || over || game.turn() === humanColor) return;
    thinking = true;
    const tok = ++botToken;
    info();
    setTimeout(() => {
      if (tok !== botToken || over) return;
      let mv = null;
      try { mv = PinkBots.choose(game.fen(), bot.rating); } catch (e) { mv = null; }
      if (tok !== botToken || over) return;
      thinking = false;
      const mover = game.turn();
      let m = mv && game.move({ from: mv.from, to: mv.to, promotion: mv.promotion || 'q' });
      if (!m) { const all = game.moves(); m = all.length ? game.move(all[Math.floor(Math.random() * all.length)]) : null; }
      if (m) after(m, mover);
    }, 450 + Math.random() * 450);
  }

  /* ----- look back through the moves, flip the board ----- */
  function goPly(n) {
    const len = game.history().length;
    n = Math.max(0, Math.min(n, len));
    viewPly = n >= len ? null : n;
    selected = null; legal = [];
    render();
  }
  $('navRow').addEventListener('click', e => {
    const b = e.target.closest('[data-nav]'); if (!b) return;
    const len = game.history().length, cur = viewPly === null ? len : viewPly, k = b.dataset.nav;
    goPly(k === 'first' ? 0 : k === 'prev' ? cur - 1 : k === 'next' ? cur + 1 : len);
  });
  $('history').addEventListener('click', e => { const m = e.target.closest('.mv'); if (m) goPly(+m.dataset.ply); });
  $('flipBtn').onclick = () => { manualFlip = !manualFlip; render(); };
  document.addEventListener('keydown', e => {
    if (!$('game').classList.contains('active') || (e.target.closest && e.target.closest('input,textarea,select'))) return;
    if (document.querySelector('.overlay.open, #pcDrawer.open') || !$('tbModal').hidden || !$('rsCard').hidden) return;
    const len = game.history().length, cur = viewPly === null ? len : viewPly;
    if (e.key === 'ArrowLeft') goPly(cur - 1);
    else if (e.key === 'ArrowRight') goPly(cur + 1);
    else if (e.key === 'ArrowUp' || e.key === 'Home') goPly(0);
    else if (e.key === 'ArrowDown' || e.key === 'End') goPly(len);
    else return;
    e.preventDefault();
  });

  /* ----- buttons ----- */
  function takeBack(plies) {
    for (let i = 0; i < plies && game.history().length; i++) game.undo();
    selected = null; legal = []; premove = null; viewPly = null;
    const hv = game.history({ verbose: true }); lastMove = hv.length ? hv[hv.length - 1] : null;
    lastTs = Date.now();
    render(); maybeBot();
  }
  $('undoBtn').onclick = () => {
    if (over || thinking || !game.history().length) return;
    if (opp === 'bot') { // against the computer: undo freely (takes back the computer's reply and your move)
      if (game.history().length >= 2) takeBack(2);
      return;
    }
    // two players on one screen: the other player has to agree
    const mover = game.turn() === 'w' ? 'Black' : 'White', other = game.turn() === 'w' ? 'White' : 'Black';
    $('tbText').textContent = mover + ' would like to take back their last move. ' + other + ', do you accept?';
    $('rsCard').hidden = true; $('tbModal').hidden = false;
  };
  $('tbYes').onclick = () => { $('tbModal').hidden = true; takeBack(1); };
  $('tbNo').onclick = () => { $('tbModal').hidden = true; };
  $('resignBtn').onclick = () => {
    if (over) return;
    const loser = opp === 'bot' ? humanColor : game.turn();
    $('rsText').textContent = opp === 'bot' ? 'Resign this game?' : (loser === 'w' ? 'White' : 'Black') + ' resigns?';
    $('tbModal').hidden = true; $('rsCard').hidden = false;
  };
  $('rsNo').onclick = () => { $('rsCard').hidden = true; };
  $('rsYes').onclick = () => {
    $('rsCard').hidden = true;
    if (over) return;
    const loser = opp === 'bot' ? humanColor : game.turn(), winner = loser === 'w' ? 'b' : 'w';
    finish('Resigned', wins(winner), winner);
  };
  $('restartBtn').onclick = () => { started = true; startGame(); };
  $('rematchBtn').onclick = () => { started = true; startGame(); };
  $('menuBtn').onclick = () => show('home');
  $('overViewBtn').onclick = () => { stopConfetti(); $('overModal').classList.remove('open'); };

  /* ----- win celebration: pink confetti ----- */
  const cv = $('confetti'), cx = cv.getContext('2d');
  const CONFETTI = ['#f28db7', '#e0679b', '#ffb3d1', '#ffd6e7', '#ffffff', '#ff8fb0', '#f9a8c9'];
  let parts = [], raf = null, cTimers = [];
  function sizeCanvas() { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  window.addEventListener('resize', () => { if (cv.style.display === 'block') sizeCanvas(); });
  function burst(x, y, n, base, spread, power) {
    for (let i = 0; i < n; i++) {
      const a = base + (Math.random() - 0.5) * spread, v = power * (0.4 + Math.random() * 0.8), q = Math.random();
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 4 + Math.random() * 5, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, c: CONFETTI[Math.floor(Math.random() * CONFETTI.length)], shape: q < 0.22 ? 'circle' : q < 0.4 ? 'heart' : 'rect', life: 0 });
    }
  }
  function frame() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.y < innerHeight + 30 && p.life < 340);
    for (const p of parts) {
      p.vy += 0.2; p.vx *= 0.985; p.vy *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, (340 - p.life) / 50);
      if (p.shape === 'circle') { cx.beginPath(); cx.arc(0, 0, p.r * 0.6, 0, 6.28); cx.fill(); }
      else if (p.shape === 'heart') { const s = p.r * 0.55; cx.beginPath(); cx.moveTo(0, s); cx.bezierCurveTo(-s * 2, -s * 0.4, -s, -s * 2, 0, -s * 0.8); cx.bezierCurveTo(s, -s * 2, s * 2, -s * 0.4, 0, s); cx.fill(); }
      else cx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      cx.restore();
    }
    if (parts.length || cTimers.length) raf = requestAnimationFrame(frame); else { raf = null; cv.style.display = 'none'; }
  }
  function stopConfetti() {
    cTimers.forEach(clearTimeout); cTimers = []; parts = [];
    if (raf) cancelAnimationFrame(raf); raf = null;
    cv.style.display = 'none';
  }
  function celebrate() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopConfetti(); sizeCanvas(); cv.style.display = 'block';
    const w = innerWidth, h = innerHeight, up = -Math.PI / 2;
    const sides = () => { burst(w * 0.1, h * 0.95, 70, up + 0.45, 1.0, 17); burst(w * 0.9, h * 0.95, 70, up - 0.45, 1.0, 17); };
    const pop = () => burst(w / 2, h * 0.33, 80, 0, 6.28, 9);
    sides(); pop();
    cTimers.push(setTimeout(pop, 650), setTimeout(sides, 1100), setTimeout(pop, 1700));
    cTimers.push(setTimeout(() => { cTimers = []; }, 2000));
    raf = requestAnimationFrame(frame);
  }

  /* ----- full screen ----- */
  const fsBtn = $('fsBtn'), root = document.documentElement;
  const fsOn = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fsBtn.style.display = 'none';
  fsBtn.onclick = () => {
    if (fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
  };
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev =>
    document.addEventListener(ev, () => { fsBtn.textContent = fsOn() ? '⛶ Exit full screen' : '⛶ Full screen'; }));

  /* ----- animated piece demos (Meet the pieces) ----- */
  const DEMO = {
    k: { from: [4, 4], to: [[3, 4], [3, 5], [4, 5], [4, 4]], t: 'The king steps one square in any direction.' },
    q: { from: [4, 3], to: [[1, 3], [1, 6], [4, 6], [7, 3], [4, 3]], t: 'The queen slides any distance in any direction.' },
    r: { from: [4, 4], to: [[4, 0], [1, 0], [1, 4], [4, 4]], t: 'The rook slides in straight lines.' },
    b: { from: [6, 2], to: [[3, 5], [1, 3], [4, 0], [6, 2]], t: 'The bishop slides along diagonals.' },
    n: { from: [5, 1], to: [[3, 2], [1, 3], [2, 5], [4, 6], [5, 1]], t: 'The knight jumps in an L shape and can hop over other pieces.' },
    p: { from: [6, 4], to: [[4, 4], [3, 4], [6, 4]], t: 'The pawn moves forward, and captures one step diagonally.' }
  };
  let demoTimer = null;
  function openDemo(t) {
    const d = DEMO[t], b = $('demoBoard');
    clearTimeout(demoTimer);
    b.innerHTML = '';
    const stops = new Set(d.to.map(m => m[0] * 8 + m[1])); stops.delete(d.from[0] * 8 + d.from[1]);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      sq.className = ((r + c) % 2 ? 'dd' : 'dl') + (stops.has(r * 8 + c) ? ' tgt' : '');
      b.appendChild(sq);
    }
    const p = document.createElement('div');
    p.className = 'dp'; p.innerHTML = pc(t, 'w');
    p.style.top = d.from[0] * 12.5 + '%'; p.style.left = d.from[1] * 12.5 + '%';
    b.appendChild(p);
    $('demoTitle').textContent = NAMES[t]; $('demoText').textContent = d.t;
    $('demoModal').classList.add('open');
    let i = 0;
    const step = () => {
      const m = d.to[i % d.to.length]; i++;
      p.style.top = m[0] * 12.5 + '%'; p.style.left = m[1] * 12.5 + '%';
      demoTimer = setTimeout(step, 1000);
    };
    demoTimer = setTimeout(step, 700);
  }
  function closeDemo() { clearTimeout(demoTimer); $('demoModal').classList.remove('open'); }
  $('legend').addEventListener('click', e => { const b = e.target.closest('.lg-card'); if (b) openDemo(b.dataset.t); });
  $('demoClose').onclick = closeDemo;
  $('demoModal').addEventListener('click', e => { if (e.target.id === 'demoModal') closeDemo(); });

  loadSettings(); applyTheme(); refreshArt();
})();

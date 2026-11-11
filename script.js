(function () {
  const game = new Chess();
  const boardEl = document.getElementById('chessboard');
  const statusEl = document.getElementById('gameStatus');
  const files = 'abcdefgh';

  const SKINS = {
    classic: { name: 'Classic', w: { p:'♙', n:'♘', b:'♗', r:'♖', q:'♕', k:'♔' }, b: { p:'♟', n:'♞', b:'♝', r:'♜', q:'♛', k:'♚' } },
    cat:     { name: 'Cat collection', all: { p:'🐾', n:'🐈', b:'😺', r:'🐱', q:'😻', k:'😼' } },
    bunny:   { name: 'Bunny collection', all: { p:'🥕', n:'🐇', b:'🐰', r:'🌸', q:'🎀', k:'👑' } }
  };

  let skin = 'classic';
  try { skin = localStorage.getItem('chessSkin') || 'classic'; } catch (e) {}
  if (!SKINS[skin]) skin = 'classic';

  let selected = null, legal = [], lastMove = null, pendingPromo = null;

  function glyph(piece) {
    const s = SKINS[skin];
    return s.all ? s.all[piece.type] : s[piece.color][piece.type];
  }

  function render() {
    boardEl.className = 'chessboard skin-' + skin;
    boardEl.innerHTML = '';
    const board = game.board();
    const inCheck = game.in_check();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = files[c] + (8 - r);
        const piece = board[r][c];
        const el = document.createElement('div');
        el.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
        el.dataset.square = sq;
        if (sq === selected) el.classList.add('selected');
        if (lastMove && (sq === lastMove.from || sq === lastMove.to)) el.classList.add('last');
        const hint = legal.find(m => m.to === sq);
        if (hint) { el.classList.add('hint'); if (piece || hint.flags.includes('e')) el.classList.add('capture'); }
        if (inCheck && piece && piece.type === 'k' && piece.color === game.turn()) el.classList.add('check');
        if (piece) {
          const p = document.createElement('span');
          p.className = 'piece ' + (piece.color === 'w' ? 'white' : 'black');
          p.textContent = glyph(piece);
          el.appendChild(p);
        }
        if (c === 0) { const n = document.createElement('span'); n.className = 'coord'; n.style.left = '3px'; n.style.right = 'auto'; n.style.top = '1px'; n.style.bottom = 'auto'; n.textContent = 8 - r; el.appendChild(n); }
        if (r === 7) { const n = document.createElement('span'); n.className = 'coord'; n.textContent = files[c]; el.appendChild(n); }
        el.addEventListener('click', () => onSquare(sq));
        boardEl.appendChild(el);
      }
    }
    updateInfo();
  }

  function onSquare(sq) {
    if (game.game_over()) return;
    const move = legal.find(m => m.to === sq);
    if (selected && move) {
      if (move.flags.includes('p')) { askPromotion(move.from, move.to); return; }
      makeMove(move.from, move.to);
      return;
    }
    const piece = game.get(sq);
    if (piece && piece.color === game.turn()) {
      selected = sq;
      legal = game.moves({ square: sq, verbose: true });
    } else { selected = null; legal = []; }
    render();
  }

  function makeMove(from, to, promotion) {
    const m = game.move({ from, to, promotion: promotion || 'q' });
    if (m) lastMove = { from: m.from, to: m.to };
    selected = null; legal = [];
    render();
  }

  function askPromotion(from, to) {
    const color = game.turn();
    const box = document.getElementById('promotionChoices');
    box.innerHTML = '';
    ['q', 'r', 'b', 'n'].forEach(t => {
      const b = document.createElement('button');
      b.textContent = glyph({ type: t, color });
      b.setAttribute('aria-label', t);
      b.onclick = () => { closeModal('promotionModal'); makeMove(from, to, t); };
      box.appendChild(b);
    });
    openModal('promotionModal');
  }

  function updateInfo() {
    const turn = game.turn();
    document.getElementById('whiteTurn').classList.toggle('active', turn === 'w' && !game.game_over());
    document.getElementById('blackTurn').classList.toggle('active', turn === 'b' && !game.game_over());
    let msg = (turn === 'w' ? "White's" : "Black's") + ' turn ♡';
    if (game.in_checkmate()) msg = 'Checkmate! ' + (turn === 'w' ? 'Black' : 'White') + ' wins ♡';
    else if (game.in_stalemate()) msg = 'Stalemate — it\'s a draw ♡';
    else if (game.in_draw()) msg = 'Draw ♡';
    else if (game.in_check()) msg = msg.replace(' ♡', '') + ' — check!';
    statusEl.textContent = msg;
    document.getElementById('currentSkin').textContent = SKINS[skin].name;
    const hist = game.history();
    document.getElementById('moveCount').textContent = hist.length;
    const h = document.getElementById('moveHistory');
    h.innerHTML = '';
    if (!hist.length) { h.innerHTML = '<p class="empty-history">Your story starts here...</p>'; return; }
    for (let i = 0; i < hist.length; i += 2) {
      h.insertAdjacentHTML('beforeend', `<span class="num">${i / 2 + 1}.</span><span>${hist[i]}</span><span>${hist[i + 1] || ''}</span>`);
    }
    h.scrollTop = h.scrollHeight;
  }

  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  document.getElementById('undoBtn').onclick = () => {
    game.undo(); lastMove = null; selected = null; legal = [];
    const h = game.history({ verbose: true }); if (h.length) lastMove = h[h.length - 1];
    render();
  };
  document.getElementById('restartBtn').onclick = () => {
    game.reset(); lastMove = null; selected = null; legal = []; render();
  };

  document.getElementById('settingsBtn').onclick = () => openModal('settingsModal');
  document.getElementById('closeSettings').onclick = () => closeModal('settingsModal');
  document.getElementById('saveSettings').onclick = () => closeModal('settingsModal');
  document.getElementById('settingsModal').addEventListener('click', e => { if (e.target.id === 'settingsModal') closeModal('settingsModal'); });

  const options = document.querySelectorAll('.skin-option');
  function markActive() { options.forEach(o => o.classList.toggle('active', o.dataset.skin === skin)); }
  options.forEach(o => o.addEventListener('click', () => {
    skin = o.dataset.skin;
    try { localStorage.setItem('chessSkin', skin); } catch (e) {}
    markActive(); render();
  }));

  markActive();
  render();
})();

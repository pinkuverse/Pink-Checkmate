/* Pink Checkmate: custom chess bots (no Stockfish). Five different "players", one per rating. */
(function (root) {
  'use strict';
  const VAL = [0, 100, 320, 330, 500, 900, 0];
  const KN = [33, 31, 18, 14, -33, -31, -18, -14], KD = [1, -1, 16, -16, 17, 15, -17, -15], BD = [17, 15, -17, -15], RD = [1, -1, 16, -16];
  const CR = new Int8Array(128).fill(15); CR[0] = 13; CR[7] = 14; CR[4] = 12; CR[112] = 7; CR[119] = 11; CR[116] = 3;
  const MATE = 30000, PROMO = ['', '', 'n', 'b', 'r', 'q'];

  /* ================= board + rules ================= */
  function Pos() { this.b = new Int8Array(128); this.side = 1; this.cast = 0; this.ep = -1; this.hm = 0; this.full = 1; this.ks = [0, 0]; this.st = []; }
  function fromFen(fen) {
    const p = new Pos(), a = fen.split(' ');
    let r = 7, f = 0;
    for (const ch of a[0]) {
      if (ch === '/') { r--; f = 0; }
      else if (ch >= '1' && ch <= '8') f += +ch;
      else { const lo = ch.toLowerCase(), t = 'pnbrqk'.indexOf(lo) + 1, sq = r * 16 + f; p.b[sq] = ch === lo ? -t : t; if (t === 6) p.ks[ch === lo ? 1 : 0] = sq; f++; }
    }
    p.side = a[1] === 'w' ? 1 : -1;
    const cs = a[2] || '-';
    p.cast = (cs.includes('K') ? 1 : 0) | (cs.includes('Q') ? 2 : 0) | (cs.includes('k') ? 4 : 0) | (cs.includes('q') ? 8 : 0);
    p.ep = a[3] && a[3] !== '-' ? (a[3].charCodeAt(1) - 49) * 16 + (a[3].charCodeAt(0) - 97) : -1;
    p.hm = +a[4] || 0; p.full = +a[5] || 1;
    return p;
  }
  function attacked(p, sq, by) {
    const b = p.b; let s;
    if (by > 0) { s = sq - 15; if (!(s & 0x88) && b[s] === 1) return true; s = sq - 17; if (!(s & 0x88) && b[s] === 1) return true; }
    else { s = sq + 15; if (!(s & 0x88) && b[s] === -1) return true; s = sq + 17; if (!(s & 0x88) && b[s] === -1) return true; }
    for (let i = 0; i < 8; i++) {
      s = sq + KN[i]; if (!(s & 0x88) && b[s] === by * 2) return true;
      s = sq + KD[i]; if (!(s & 0x88) && b[s] === by * 6) return true;
    }
    for (let i = 0; i < 4; i++) {
      let d = BD[i]; s = sq + d;
      while (!(s & 0x88)) { const v = b[s]; if (v) { if (v === by * 3 || v === by * 5) return true; break; } s += d; }
      d = RD[i]; s = sq + d;
      while (!(s & 0x88)) { const v = b[s]; if (v) { if (v === by * 4 || v === by * 5) return true; break; } s += d; }
    }
    return false;
  }
  function cheapest(p, sq, by) { // type of the cheapest piece of `by` attacking sq (0 = none)
    const b = p.b; let s;
    if (by > 0) { s = sq - 15; if (!(s & 0x88) && b[s] === 1) return 1; s = sq - 17; if (!(s & 0x88) && b[s] === 1) return 1; }
    else { s = sq + 15; if (!(s & 0x88) && b[s] === -1) return 1; s = sq + 17; if (!(s & 0x88) && b[s] === -1) return 1; }
    for (let i = 0; i < 8; i++) { s = sq + KN[i]; if (!(s & 0x88) && b[s] === by * 2) return 2; }
    let m = 9;
    for (let i = 0; i < 4; i++) {
      let d = BD[i]; s = sq + d;
      while (!(s & 0x88)) { const v = b[s]; if (v) { if (v === by * 3) m = Math.min(m, 3); else if (v === by * 5) m = Math.min(m, 5); break; } s += d; }
      d = RD[i]; s = sq + d;
      while (!(s & 0x88)) { const v = b[s]; if (v) { if (v === by * 4) m = Math.min(m, 4); else if (v === by * 5) m = Math.min(m, 5); break; } s += d; }
    }
    if (m < 9) return m;
    for (let i = 0; i < 8; i++) { s = sq + KD[i]; if (!(s & 0x88) && b[s] === by * 6) return 6; }
    return 0;
  }
  const mv = (f, t, p, c, pr, fl) => ({ f, t, p, c, pr, fl, s: 0 });
  function gen(p, caps) {
    const b = p.b, side = p.side, out = [];
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const v = b[sq]; if (!v || (v > 0) !== (side > 0)) continue;
      const t = v * side;
      if (t === 1) {
        const fw = side * 16, r = sq >> 4, pr7 = side > 0 ? 6 : 1, st = side > 0 ? 1 : 6;
        let to = sq + fw;
        if (!b[to]) {
          if (r === pr7) out.push(mv(sq, to, 1, 0, 5, 0), mv(sq, to, 1, 0, 2, 0), mv(sq, to, 1, 0, 4, 0), mv(sq, to, 1, 0, 3, 0));
          else if (!caps) { out.push(mv(sq, to, 1, 0, 0, 0)); if (r === st && !b[to + fw]) out.push(mv(sq, to + fw, 1, 0, 0, 4)); }
        }
        for (let k = 0; k < 2; k++) {
          to = sq + (k ? side * 17 : side * 15); if (to & 0x88) continue;
          const tv = b[to];
          if (tv && (tv > 0) !== (side > 0)) {
            const c = tv < 0 ? -tv : tv;
            if (r === pr7) out.push(mv(sq, to, 1, c, 5, 0), mv(sq, to, 1, c, 2, 0), mv(sq, to, 1, c, 4, 0), mv(sq, to, 1, c, 3, 0));
            else out.push(mv(sq, to, 1, c, 0, 0));
          } else if (!tv && to === p.ep && b[to - fw] === -side) out.push(mv(sq, to, 1, 1, 0, 1));
        }
      } else if (t === 2 || t === 6) {
        const D = t === 2 ? KN : KD;
        for (let i = 0; i < 8; i++) {
          const to = sq + D[i]; if (to & 0x88) continue;
          const tv = b[to];
          if (!tv) { if (!caps) out.push(mv(sq, to, t, 0, 0, 0)); }
          else if ((tv > 0) !== (side > 0)) out.push(mv(sq, to, t, tv < 0 ? -tv : tv, 0, 0));
        }
        if (t === 6 && !caps) {
          if (side > 0 && sq === 4) {
            if ((p.cast & 1) && !b[5] && !b[6] && b[7] === 4 && !attacked(p, 4, -1) && !attacked(p, 5, -1)) out.push(mv(4, 6, 6, 0, 0, 2));
            if ((p.cast & 2) && !b[3] && !b[2] && !b[1] && b[0] === 4 && !attacked(p, 4, -1) && !attacked(p, 3, -1)) out.push(mv(4, 2, 6, 0, 0, 2));
          } else if (side < 0 && sq === 116) {
            if ((p.cast & 4) && !b[117] && !b[118] && b[119] === -4 && !attacked(p, 116, 1) && !attacked(p, 117, 1)) out.push(mv(116, 118, 6, 0, 0, 2));
            if ((p.cast & 8) && !b[115] && !b[114] && !b[113] && b[112] === -4 && !attacked(p, 116, 1) && !attacked(p, 115, 1)) out.push(mv(116, 114, 6, 0, 0, 2));
          }
        }
      } else {
        const D = t === 3 ? BD : t === 4 ? RD : KD;
        for (let i = 0; i < D.length; i++) {
          let to = sq + D[i];
          while (!(to & 0x88)) {
            const tv = b[to];
            if (!tv) { if (!caps) out.push(mv(sq, to, t, 0, 0, 0)); }
            else { if ((tv > 0) !== (side > 0)) out.push(mv(sq, to, t, tv < 0 ? -tv : tv, 0, 0)); break; }
            to += D[i];
          }
        }
      }
    }
    return out;
  }
  function make(p, m) {
    const b = p.b, s = p.side;
    p.st.push({ cast: p.cast, ep: p.ep, hm: p.hm, v: b[m.t] });
    const pc = b[m.f]; b[m.f] = 0;
    if (m.fl & 1) b[m.t - s * 16] = 0;
    b[m.t] = m.pr ? s * m.pr : pc;
    if (m.fl & 2) { if (m.t > m.f) { b[m.f + 3] = 0; b[m.f + 1] = s * 4; } else { b[m.f - 4] = 0; b[m.f - 1] = s * 4; } }
    if (m.p === 6) p.ks[s > 0 ? 0 : 1] = m.t;
    p.cast &= CR[m.f] & CR[m.t];
    p.ep = (m.fl & 4) ? (m.f + m.t) >> 1 : -1;
    p.hm = (m.p === 1 || m.c) ? 0 : p.hm + 1;
    p.side = -s; if (s < 0) p.full++;
  }
  function undo(p, m) {
    const st = p.st.pop(), b = p.b; p.side = -p.side; const s = p.side; if (s < 0) p.full--;
    b[m.f] = m.pr ? s : b[m.t]; b[m.t] = st.v;
    if (m.fl & 1) b[m.t - s * 16] = -s;
    if (m.fl & 2) { if (m.t > m.f) { b[m.f + 3] = s * 4; b[m.f + 1] = 0; } else { b[m.f - 4] = s * 4; b[m.f - 1] = 0; } }
    if (m.p === 6) p.ks[s > 0 ? 0 : 1] = m.f;
    p.cast = st.cast; p.ep = st.ep; p.hm = st.hm;
  }
  function inCheck(p) { return attacked(p, p.ks[p.side > 0 ? 0 : 1], -p.side); }
  function legal(p, caps) {
    const ms = gen(p, caps), out = [], s = p.side, ki = s > 0 ? 0 : 1;
    for (let i = 0; i < ms.length; i++) { const m = ms[i]; make(p, m); if (!attacked(p, p.ks[ki], -s)) out.push(m); undo(p, m); }
    return out;
  }
  function perft(p, d) { if (!d) return 1; let n = 0; for (const m of legal(p, false)) { make(p, m); n += perft(p, d - 1); undo(p, m); } return n; }

  /* ================= evaluation (features switch on by rating) ================= */
  const PB = [0, 6, 12, 22, 40, 70, 120, 0];
  const WC = new Int8Array(8), BC = new Int8Array(8), WP = new Int16Array(9), BP = new Int16Array(9), RK = new Int16Array(9);
  function kingSafety(p, ksq, w, own, mgw) {
    const b = p.b, kf = ksq & 7, rr = w ? ksq >> 4 : 7 - (ksq >> 4), sd = w ? 1 : -1, pawn = w ? 1 : -1;
    let s = 0;
    if (rr === 0 && (kf <= 2 || kf >= 6)) s += 22;
    else if (rr === 0 && (kf === 3 || kf === 4) && !(p.cast & (w ? 3 : 12))) s -= 22;
    for (let df = -1; df <= 1; df++) {
      const f2 = kf + df; if (f2 < 0 || f2 > 7) continue;
      const s1 = ksq + df + sd * 16, s2 = s1 + sd * 16;
      if (!(s1 & 0x88) && b[s1] === pawn) s += 9; else if (!(s2 & 0x88) && b[s2] === pawn) s += 5;
      if (!own[f2]) s -= 10;
    }
    return s * mgw;
  }
  function evaluate(p, F) {
    const b = p.b; WC.fill(0); BC.fill(0);
    let sc = 0, np = 0, wb = 0, bb = 0, wk = 0, bk = 0, wn = 0, bn = 0, rn = 0;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const v = b[sq]; if (!v) continue;
      const w = v > 0, t = w ? v : -v, f = sq & 7, r = sq >> 4, rr = w ? r : 7 - r, cen = Math.min(f, 7 - f) + Math.min(r, 7 - r);
      let s = VAL[t];
      if (t === 1) {
        if (w) { WC[f]++; WP[wn++] = sq; } else { BC[f]++; BP[bn++] = sq; }
        if (F.pst) { s += rr * 5; if (f === 3 || f === 4) s += rr < 5 ? 7 : 2; else if (f === 2 || f === 5) s += 2; else if (f === 0 || f === 7) s -= 3; }
      } else if (t === 6) { if (w) wk = sq; else bk = sq; s = 0; }
      else {
        np += VAL[t];
        if (F.pst) { if (t === 2) s += (cen - 3) * 9; else if (t === 3) s += (cen - 3) * 4; else if (t === 4) { if (rr === 6) s += 16; if (f === 3 || f === 4) s += 3; } else s += (cen - 3) * 2; }
        if (t === 3) { if (w) wb++; else bb++; }
        if (t === 4 && rn < 8) RK[rn++] = sq;
        if (F.dev && p.full <= 14) { if ((t === 2 || t === 3) && rr === 0) s -= 11; if (t === 5 && rr >= 2 && p.full <= 8) s -= 8; }
      }
      sc += w ? s : -s;
    }
    const mgw = Math.min(1, np / 3600), egw = F.end ? 1 - mgw : 0, kw = F.end ? mgw : 1;
    if (F.pair) { if (wb >= 2) sc += 25; if (bb >= 2) sc -= 25; }
    if (F.rook) for (let i = 0; i < rn; i++) { const sq = RK[i], w = b[sq] > 0, f = sq & 7, own = w ? WC[f] : BC[f], opp = w ? BC[f] : WC[f]; if (!own) sc += (w ? 1 : -1) * (opp ? 9 : 18); }
    if (F.pawn) {
      for (let f = 0; f < 8; f++) {
        if (WC[f] > 1) sc -= 12 * (WC[f] - 1); if (BC[f] > 1) sc += 12 * (BC[f] - 1);
        if (WC[f] && !(f > 0 && WC[f - 1]) && !(f < 7 && WC[f + 1])) sc -= 10 * WC[f];
        if (BC[f] && !(f > 0 && BC[f - 1]) && !(f < 7 && BC[f + 1])) sc += 10 * BC[f];
      }
      for (let i = 0; i < wn; i++) { const sq = WP[i], f = sq & 7, r = sq >> 4; let pass = true;
        for (let j = 0; j < bn && pass; j++) { const q = BP[j]; if (Math.abs((q & 7) - f) <= 1 && (q >> 4) > r) pass = false; }
        if (pass) sc += PB[r] * (1 + egw); }
      for (let i = 0; i < bn; i++) { const sq = BP[i], f = sq & 7, r = sq >> 4; let pass = true;
        for (let j = 0; j < wn && pass; j++) { const q = WP[j]; if (Math.abs((q & 7) - f) <= 1 && (q >> 4) < r) pass = false; }
        if (pass) sc -= PB[7 - r] * (1 + egw); }
    }
    if (F.king) {
      sc += kingSafety(p, wk, true, WC, kw) - kingSafety(p, bk, false, BC, kw);
      if (F.end) { const cw = Math.min(wk & 7, 7 - (wk & 7)) + Math.min(wk >> 4, 7 - (wk >> 4)), cb = Math.min(bk & 7, 7 - (bk & 7)) + Math.min(bk >> 4, 7 - (bk >> 4)); sc += (cw - cb) * 6 * egw; }
    }
    return p.side > 0 ? sc : -sc;
  }

  /* ================= alpha-beta search (used by 1100, 1400, 1700) ================= */
  let S = null;
  function order(p, ms, ply) {
    const k = S.kill ? S.k1[ply] : -1;
    for (const m of ms) m.s = m.c ? 10000 + VAL[m.c] * 10 - VAL[m.p] + (m.pr ? VAL[m.pr] : 0) : (m.pr ? 9000 : (m.f * 128 + m.t === k ? 5000 : 0));
    ms.sort((a, b) => b.s - a.s);
  }
  function qs(p, alpha, beta, qd) {
    if (S.abort) return 0;
    if (++S.nodes > S.max) { S.abort = true; return 0; }
    const stand = evaluate(p, S.F);
    if (stand >= beta || qd <= 0) return stand;
    if (stand > alpha) alpha = stand;
    const ms = legal(p, true); order(p, ms, 0);
    for (const m of ms) {
      make(p, m); const v = -qs(p, -beta, -alpha, qd - 1); undo(p, m);
      if (S.abort) return 0;
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }
  function search(p, d, alpha, beta, ply) {
    if (S.abort) return 0;
    if (++S.nodes > S.max) { S.abort = true; return 0; }
    if (p.hm >= 100) return 0;
    const chk = inCheck(p);
    if (chk && S.ext && ply < 12) d++;
    if (d <= 0) return qs(p, alpha, beta, S.qd);
    const ms = legal(p, false);
    if (!ms.length) return chk ? -MATE + ply : 0;
    order(p, ms, ply);
    let best = -MATE - 1;
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i];
      if (S.blind && ply === 1 && !chk && i > 2 && !m.c && !m.pr && Math.random() < S.blind) continue; // overlooks a quiet reply
      make(p, m); const v = -search(p, d - 1, -beta, -alpha, ply + 1); undo(p, m);
      if (S.abort) return 0;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) { if (S.kill && !m.c) S.k1[ply] = m.f * 128 + m.t; break; }
    }
    return best;
  }
  const F800 = { dev: 1 }, F1100 = { pst: 1, dev: 1, king: 1 }, F1400 = { pst: 1, dev: 1, king: 1, pawn: 1, pair: 1, rook: 1 }, F1700 = { pst: 1, dev: 1, king: 1, pawn: 1, pair: 1, rook: 1, end: 1 };
  const CFG = {
    1100: { F: F1100, depth: 2, qd: 4, nodes: 13000, blind: 0.09, lapse: 0.13, margin: 50, within: 42, T: 15, jit: 13 },
    1400: { F: F1400, depth: 3, qd: 4, nodes: 40000, blind: 0.07, lapse: 0.12, margin: 40, within: 34, T: 13, jit: 12, kill: true },
    1700: { F: F1700, depth: 4, qd: 6, nodes: 100000, blind: 0.035, lapse: 0.10, margin: 35, within: 30, T: 10, jit: 8, kill: true, ext: true }
  };
  function thinkSearch(p, c) {
    if (c.lapse && Math.random() < c.lapse) c = Object.assign({}, c, { depth: 1, qd: 2, nodes: 4000, blind: 0, ext: false }); // hasty move
    S = { nodes: 0, max: c.nodes, abort: false, F: c.F, qd: c.qd, blind: c.blind, ext: c.ext, kill: c.kill, k1: new Int32Array(64).fill(-1) };
    const ms = legal(p, false);
    if (ms.length <= 1) return ms[0] || null;
    order(p, ms, 0);
    let cur = ms.map(m => ({ m, v: 0 })), fin = null;
    for (let d = 1; d <= c.depth; d++) {
      const res = []; let best = -MATE - 1;
      for (let i = 0; i < cur.length; i++) {
        const m = cur[i].m; make(p, m);
        const v = -search(p, d - 1, -(MATE + 1), -(best - c.margin), 1);
        undo(p, m);
        if (S.abort) break;
        res.push({ m, v }); if (v > best) best = v;
      }
      if (S.abort) { if (!fin) fin = res.length ? res : cur; break; }
      res.sort((a, b) => b.v - a.v); cur = res; fin = res;
      if (best > MATE - 100) break;
    }
    const top = fin.map(r => ({ m: r.m, v: r.v + (Math.random() - 0.5) * c.jit })).sort((a, b) => b.v - a.v);
    const best = top[0].v, pool = top.filter(r => r.v >= best - c.within);
    let tot = 0; const w = pool.map(r => { const x = Math.exp(-(best - r.v) / c.T); tot += x; return x; });
    let x = Math.random() * tot;
    for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i].m; }
    return pool[0].m;
  }

  /* ================= 400 and 800: human-style "attention" players ================= */
  function givesMate(p, m) { make(p, m); const r = inCheck(p) && legal(p, false).length === 0; undo(p, m); return r; }
  function hangVal(p, sq, side) {
    const t = Math.abs(p.b[sq]); if (t === 6) return 0;
    const a = cheapest(p, sq, -side); if (!a) return 0;
    if (!cheapest(p, sq, side)) return VAL[t];
    return VAL[a] < VAL[t] ? VAL[t] - VAL[a] : 0;
  }
  function see(p, m, depth) {
    if (!m.c && !m.pr) return 0;
    make(p, m); let best = 0;
    if (depth < 6) { const recs = legal(p, true).filter(r => r.t === m.t && r.c); if (recs.length) { recs.sort((a, b) => VAL[a.p] - VAL[b.p]); best = Math.max(0, see(p, recs[0], depth + 1)); } }
    undo(p, m);
    return VAL[m.c] + (m.pr ? VAL[m.pr] - 100 : 0) - best;
  }
  function softPick(ms, sc, T) {
    let mx = -1e9; for (const s of sc) if (s > mx) mx = s;
    let tot = 0; const w = sc.map(s => { const x = Math.exp((s - mx) / T); tot += x; return x; });
    let x = Math.random() * tot;
    for (let i = 0; i < ms.length; i++) { x -= w[i]; if (x <= 0) return ms[i]; }
    return ms[ms.length - 1];
  }
  const ply = p => p.full * 2 - (p.side > 0 ? 2 : 1);
  function ownPieces(p, side) { const o = []; for (let sq = 0; sq < 128; sq++) { if (sq & 0x88) { sq += 7; continue; } const v = p.b[sq]; if (v && (v > 0) === (side > 0) && Math.abs(v) !== 6) o.push(sq); } return o; }
  function developBonus(p, m, early, strength) {
    let s = 0; const rr = p.side > 0 ? m.f >> 4 : 7 - (m.f >> 4), tf = m.t & 7;
    if (early) {
      if ((m.p === 2 || m.p === 3) && rr === 0) s += 14 * strength;
      else if ((m.p === 2 || m.p === 3) && ply(p) < 16) s -= 6 * strength;
      if (m.p === 1 && (tf === 3 || tf === 4) && rr <= 1) s += 10 * strength;
      if (m.p === 1 && (m.f & 7) === 0 || m.p === 1 && (m.f & 7) === 7) s -= 6 * strength;
      if (m.p === 5 && ply(p) < 10) s -= 10 * strength;
      if (m.p === 4 && ply(p) < 14) s -= 6 * strength;
      if (m.p === 6 && !(m.fl & 2)) s -= 14 * strength;
    }
    if (m.fl & 2) s += 30 * strength;
    return s;
  }
  function think400(p) {
    const ms = legal(p, false); if (ms.length <= 1) return ms[0] || null;
    const side = p.side, early = ply(p) < 24;
    if (Math.random() < 0.55) for (const m of ms) if (givesMate(p, m)) return m;
    let flee = -1;
    if (Math.random() < 0.45) for (const sq of ownPieces(p, side)) if (hangVal(p, sq, side) > 0 && Math.random() < 0.6) { flee = sq; break; }
    const sc = ms.map(m => {
      let s = Math.random() * 25;
      if (m.c && Math.random() < 0.9) s += VAL[m.c] * 0.9;
      if (m.pr && Math.random() < 0.7) s += VAL[m.pr] * 0.7;
      if (m.p === 1) s += 10 + Math.random() * 10;
      else if (early && (m.p === 2 || m.p === 3) && Math.random() < 0.5) s += 10;
      else if (early && m.p === 5) s += 8;
      if (m.fl & 2) s += 10;
      if (flee >= 0 && m.f === flee) s += VAL[m.p] * 0.5;
      if (Math.random() < 0.6) { make(p, m); if (hangVal(p, m.t, side) > 0) s -= 0.8 * VAL[m.p]; undo(p, m); }
      return s;
    });
    return softPick(ms, sc, 14);
  }
  function think800(p) {
    const ms = legal(p, false); if (ms.length <= 1) return ms[0] || null;
    const side = p.side, early = ply(p) < 24;
    const attMine = Math.random() < 0.95, attMoved = Math.random() < 0.92, attOther = Math.random() < 0.65, attMate = Math.random() < 0.5, attDef = Math.random() < 0.85;
    if (attMine) for (const m of ms) if (givesMate(p, m)) return m;
    const sc = ms.map(m => {
      let s = Math.random() * 8 + developBonus(p, m, early, 1);
      if (m.c) s += attDef ? see(p, m, 0) : VAL[m.c] * 0.8;
      if (m.pr) s += VAL[m.pr] - 100;
      if (m.p === 1) s += 3;
      make(p, m);
      if (inCheck(p)) s += 12;
      if (attMoved) s -= hangVal(p, m.t, side);
      if (attOther) { let mx = 0; for (const sq of ownPieces(p, side)) if (sq !== m.t) mx = Math.max(mx, hangVal(p, sq, side)); s -= mx * 0.8; }
      if (attMate) for (const r of legal(p, false)) if (givesMate(p, r)) { s -= 5000; break; }
      undo(p, m);
      return s;
    });
    return softPick(ms, sc, 12);
  }

  /* ================= public API ================= */
  function think(p, rating) {
    if (rating <= 400) return think400(p);
    if (rating <= 800) return think800(p);
    return thinkSearch(p, CFG[rating <= 1100 ? 1100 : rating <= 1400 ? 1400 : 1700]);
  }
  const sqName = s => 'abcdefgh'[s & 7] + ((s >> 4) + 1);
  function choose(fen, rating) {
    const p = fromFen(fen), m = think(p, rating);
    return m ? { from: sqName(m.f), to: sqName(m.t), promotion: m.pr ? PROMO[m.pr] : undefined } : null;
  }
  const api = { choose, think, fromFen, legal, make, undo, inCheck, perft, evaluate, Pos };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PinkBots = api;
})(typeof window !== 'undefined' ? window : this);

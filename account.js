/* Pink Checkmate accounts, simple version: username + password, saved in this browser only.
   (No server yet. When real online accounts are added later, only the storage part of this file changes.) */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'pcUsers', SESS = 'pcSession';
  let tab = 'login';

  /* ---------- storage ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const save = u => { try { localStorage.setItem(KEY, JSON.stringify(u)); return true; } catch (e) { return false; } };
  const getSess = () => { try { return localStorage.getItem(SESS) || ''; } catch (e) { return ''; } };
  const setSess = k => { try { if (k) localStorage.setItem(SESS, k); else localStorage.removeItem(SESS); } catch (e) {} };
  const me = () => { const k = getSess(); return k ? load()[k] || null : null; };
  function update(fn) { const k = getSess(), u = load(); if (!k || !u[k]) return false; fn(u[k]); return save(u); }

  const rand = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
  async function hash(salt, pass) {
    try {
      if (window.crypto && crypto.subtle) {
        const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pass));
        return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {}
    let h = 5381; const s = salt + ':' + pass;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'x' + (h >>> 0).toString(16);
  }

  /* ---------- modal ---------- */
  function show(view) { ['acctAuth', 'acctProfile'].forEach(v => { $(v).hidden = v !== view; }); }
  function openModal(view) { show(view); $('acctModal').classList.add('open'); }
  function closeModal() { $('acctModal').classList.remove('open'); }
  function setTab(t) {
    tab = t;
    document.querySelectorAll('#acctTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
    $('acctPass').autocomplete = t === 'signup' ? 'new-password' : 'current-password';
    $('acctSubmit').textContent = t === 'signup' ? 'Create account' : 'Log in';
    $('acctErr').textContent = '';
  }
  function openAuth(t) { setTab(t); openModal('acctAuth'); }
  function openProfile() { drawProfile(); $('pfErr').textContent = ''; openModal('acctProfile'); }

  /* ---------- drawing ---------- */
  const initial = n => ((n || '?').trim().charAt(0) || '?').toUpperCase();
  function setAvatar(el, photo, name) { el.style.backgroundImage = photo ? 'url("' + photo + '")' : ''; el.textContent = photo ? '' : initial(name); }
  function drawAcct() {
    const u = me();
    document.querySelectorAll('.acct').forEach(box => {
      box.textContent = '';
      if (!u) {
        const a = document.createElement('button'); a.className = 'btn small ghost'; a.dataset.acct = 'login'; a.textContent = 'Log in';
        const b = document.createElement('button'); b.className = 'btn small'; b.dataset.acct = 'signup'; b.textContent = 'Sign up';
        box.append(a, b);
      } else {
        const c = document.createElement('button'); c.className = 'chip'; c.dataset.acct = 'profile'; c.title = 'Your profile';
        const av = document.createElement('span'); av.className = 'mini-av'; setAvatar(av, u.photo, u.name);
        const nm = document.createElement('b'); nm.textContent = u.name;
        c.append(av, nm); box.append(c);
      }
    });
  }
  function drawProfile() {
    const u = me(); if (!u) return;
    setAvatar($('pfAvatar'), u.photo, u.name);
    $('pfBanner').style.backgroundImage = u.banner ? 'url("' + u.banner + '")' : '';
    $('pfName').textContent = u.name;
    $('pfSince').textContent = 'Joined ' + new Date(u.created || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    $('stGames').textContent = u.games || 0; $('stWins').textContent = u.wins || 0;
    $('stDraws').textContent = u.draws || 0; $('stLosses').textContent = u.losses || 0;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-acct]'); if (!b) return;
    if (b.dataset.acct === 'profile') openProfile(); else openAuth(b.dataset.acct);
  });
  document.querySelectorAll('#acctTabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('acctClose').onclick = closeModal; $('acctGuest').onclick = closeModal;
  $('acctModal').addEventListener('click', e => { if (e.target.id === 'acctModal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  $('acctForm').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('acctErr'), btn = $('acctSubmit');
    const name = $('acctName').value.trim(), pass = $('acctPass').value, key = name.toLowerCase();
    err.textContent = '';
    if (!/^[\p{L}\p{N}_ .-]{2,20}$/u.test(name)) { err.textContent = 'Username: 2 to 20 letters or numbers.'; return; }
    if (tab === 'signup' && pass.length < 6) { err.textContent = 'Use at least 6 characters for the password.'; return; }
    if (!pass) { err.textContent = 'Please type your password.'; return; }
    btn.disabled = true;
    try {
      const users = load();
      if (tab === 'signup') {
        if (users[key]) { err.textContent = 'That username is taken. Try another one.'; }
        else {
          const salt = rand();
          users[key] = { name, salt, hash: await hash(salt, pass), photo: '', banner: '', games: 0, wins: 0, draws: 0, losses: 0, created: Date.now() };
          if (!save(users)) err.textContent = 'Could not save on this device. Is private browsing on?';
          else { setSess(key); $('acctForm').reset(); closeModal(); drawAcct(); }
        }
      } else {
        const u = users[key];
        if (!u || u.hash !== await hash(u.salt, pass)) err.textContent = 'Wrong username or password.';
        else { setSess(key); $('acctForm').reset(); closeModal(); drawAcct(); }
      }
    } catch (x) { err.textContent = 'Something went wrong. Please try again.'; }
    btn.disabled = false;
  });
  $('pfLogout').onclick = () => { setSess(''); closeModal(); drawAcct(); };

  /* profile pictures are shrunk in the browser first */
  function toData(file, w, h) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const s = Math.max(w / img.width, h / img.height), dw = img.width * s, dh = img.height * s;
        c.getContext('2d').drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => rej(new Error('bad image'));
      img.src = url;
    });
  }
  async function pick(input, w, h, field) {
    const f = input.files[0]; input.value = '';
    if (!f || !me()) return;
    $('pfErr').textContent = '';
    try {
      const data = await toData(f, w, h);
      if (!update(u => { u[field] = data; })) throw new Error('save');
      drawProfile(); drawAcct();
    } catch (x) { $('pfErr').textContent = 'Could not save that picture. Try a different image.'; }
  }
  $('pfPhotoIn').addEventListener('change', e => pick(e.target, 256, 256, 'photo'));
  $('pfBannerIn').addEventListener('change', e => pick(e.target, 960, 240, 'banner'));

  /* ---------- game results (against the computer) ---------- */
  function recordResult(r) {
    update(u => {
      u.games = (u.games || 0) + 1;
      if (r === 'win') u.wins = (u.wins || 0) + 1; else if (r === 'loss') u.losses = (u.losses || 0) + 1; else u.draws = (u.draws || 0) + 1;
    });
    drawProfile();
  }
  window.PinkAccount = { recordResult };
  drawAcct();
})();

/* Pink Checkmate accounts (simple version): username + password saved in this browser only.
   This file builds its own drawer and styles, so it looks right on its own. No server or Firebase yet. */
(function () {
  'use strict';
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

  /* ---------- styles ---------- */
  const css = `
.acct{display:inline-flex;gap:10px;align-items:center}
.acct .chip{font:inherit;display:inline-flex;align-items:center;gap:8px;background:#fff;border:2px solid #fcd6e5;border-radius:999px;padding:3px 14px 3px 3px;cursor:pointer;color:#6a3a53;font-weight:700}
.acct .chip:hover{border-color:#e0679b}
.mini-av{width:28px;height:28px;border-radius:50%;background:#e0679b center/cover;color:#fff;display:grid;place-items:center;font-size:.85rem;flex:none}
#pcDrawer{position:fixed;inset:0;z-index:80;visibility:hidden;pointer-events:none;transition:visibility 0s .3s;font-family:"Nunito",system-ui,sans-serif;color:#6a3a53}
#pcDrawer.open{visibility:visible;pointer-events:auto;transition-delay:0s}
#pcDrawer [hidden]{display:none!important}
#pcDrawer *{box-sizing:border-box}
#pcDrawer .pcd-back{position:absolute;inset:0;background:rgba(106,58,83,.35);backdrop-filter:blur(2px);opacity:0;transition:opacity .3s}
#pcDrawer.open .pcd-back{opacity:1}
#pcDrawer .pcd-panel{position:absolute;top:0;right:0;height:100%;width:min(430px,94vw);background:#fff8fb;box-shadow:-14px 0 44px rgba(224,103,155,.3);border-radius:28px 0 0 28px;overflow-y:auto;transform:translateX(105%);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
#pcDrawer.open .pcd-panel{transform:none}
#pcDrawer .pcd-close{position:absolute;top:14px;right:14px;z-index:3;width:38px;height:38px;border-radius:50%;border:0;background:#fff;color:#e0679b;font-size:1.5rem;line-height:1;cursor:pointer;box-shadow:0 4px 12px rgba(224,103,155,.25)}
#pcDrawer .pcd-close:hover{transform:scale(1.06)}
#pcDrawer h2,#pcDrawer h3{font-family:"Fraunces",Georgia,serif;font-weight:600;margin:0}
#pcDrawer .pcd-hero{text-align:center;padding:42px 28px 22px;background:linear-gradient(165deg,#ffd3e5,#ffe9f2 70%,#fff8fb)}
#pcDrawer .pcd-logo{width:62px;height:62px;filter:drop-shadow(0 6px 8px rgba(224,103,155,.3))}
#pcDrawer .pcd-hero h2{font-size:1.9rem;font-style:italic;color:#e0679b;margin-top:4px}
#pcDrawer .pcd-hero p{margin:6px 0 0;opacity:.8}
#pcDrawer .pcd-body{padding:22px 28px 34px;display:grid;gap:16px}
#pcDrawer .pcd-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#ffeef5;border-radius:999px;padding:5px}
#pcDrawer .pcd-tabs button{font:inherit;font-weight:700;border:0;background:transparent;color:#6a3a53;border-radius:999px;padding:10px;cursor:pointer}
#pcDrawer .pcd-tabs button.on{background:linear-gradient(135deg,#f28db7,#e0679b);color:#fff;box-shadow:0 4px 10px rgba(224,103,155,.3)}
#pcDrawer form{display:grid;gap:14px;margin:0}
#pcDrawer .pcd-field{display:grid;gap:6px}
#pcDrawer .pcd-field>span{font-weight:700;font-size:.85rem}
#pcDrawer .pcd-in{font:inherit;width:100%;padding:12px 14px;border:2px solid #fcd6e5;border-radius:14px;background:#fff;color:#6a3a53}
#pcDrawer .pcd-in:focus{outline:none;border-color:#e0679b;box-shadow:0 0 0 4px rgba(224,103,155,.15)}
#pcDrawer .pcd-pw{position:relative;display:block}
#pcDrawer .pcd-pw .pcd-in{padding-right:64px}
#pcDrawer .pcd-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);font:inherit;font-weight:700;font-size:.8rem;border:0;background:none;color:#e0679b;cursor:pointer;padding:6px 8px}
#pcDrawer .pcd-err{margin:0;min-height:1.3em;color:#d6334f;font-size:.9rem}
#pcDrawer .pcd-err.ok{color:#2d8a62}
#pcDrawer .pcd-btn{font:inherit;font-weight:700;width:100%;border:2px solid #e0679b;background:linear-gradient(135deg,#f28db7,#e0679b);color:#fff;border-radius:999px;padding:12px 20px;cursor:pointer;transition:transform .15s}
#pcDrawer .pcd-btn:hover{transform:translateY(-2px)}
#pcDrawer .pcd-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
#pcDrawer .pcd-btn.ghost{background:transparent;color:#e0679b}
#pcDrawer .pcd-btn.small{width:auto;padding:8px 16px;font-size:.88rem}
#pcDrawer .pcd-or{display:flex;align-items:center;gap:12px;opacity:.6;font-size:.85rem}
#pcDrawer .pcd-or::before,#pcDrawer .pcd-or::after{content:"";flex:1;height:1px;background:#f5aac8}
#pcDrawer .pcd-note{margin:0;text-align:center;opacity:.65;font-size:.85rem}
#pcDrawer button:focus-visible,#pcDrawer label:focus-visible{outline:3px solid #e0679b;outline-offset:2px}
#pcDrawer .pcd-banner{height:150px;position:relative;background:linear-gradient(135deg,#f9b4cf,#f28db7) center/cover;border-radius:0 0 0 0}
#pcDrawer .pcd-chipbtn{position:absolute;right:14px;bottom:12px;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.92);color:#e0679b;font-weight:700;font-size:.8rem;border-radius:999px;padding:6px 12px;cursor:pointer}
#pcDrawer .pcd-avrow{display:flex;align-items:flex-end;gap:14px;padding:0 28px;margin-top:-46px;position:relative}
#pcDrawer .pcd-av{position:relative;flex:none;width:94px;height:94px;border-radius:50%;border:5px solid #fff8fb;background:#e0679b center/cover;color:#fff;display:grid;place-items:center;font-size:2.2rem;font-weight:700;cursor:pointer;box-shadow:0 6px 16px rgba(224,103,155,.3)}
#pcDrawer .pcd-cam{position:absolute;right:-2px;bottom:-2px;width:30px;height:30px;border-radius:50%;background:#e0679b;border:3px solid #fff8fb;display:grid;place-items:center}
#pcDrawer .pcd-who{padding-bottom:8px;min-width:0}
#pcDrawer .pcd-who h2{font-size:1.5rem;overflow-wrap:anywhere}
#pcDrawer .pcd-who small{opacity:.7}
#pcDrawer .pcd-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
#pcDrawer .pcd-stat{background:#fff;border-radius:16px;text-align:center;padding:12px 4px;box-shadow:0 6px 16px rgba(224,103,155,.12)}
#pcDrawer .pcd-stat b{display:block;font-size:1.4rem;color:#e0679b}
#pcDrawer .pcd-stat small{opacity:.7}
#pcDrawer .pcd-rate{background:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 6px 16px rgba(224,103,155,.12)}
#pcDrawer .pcd-ratetop{display:flex;justify-content:space-between;margin-bottom:8px;font-weight:700}
#pcDrawer .pcd-track{height:10px;border-radius:999px;background:#ffeef5;overflow:hidden}
#pcDrawer .pcd-track i{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#f28db7,#e0679b);transition:width .5s}
#pcDrawer .pcd-card{background:#fff;border-radius:18px;padding:16px;display:grid;gap:12px;box-shadow:0 6px 16px rgba(224,103,155,.12)}
#pcDrawer .pcd-card h3{color:#e0679b;font-size:1.1rem}
#pcDrawer .pcd-row{display:flex;flex-wrap:wrap;gap:8px}
@media(prefers-reduced-motion:reduce){#pcDrawer .pcd-panel,#pcDrawer .pcd-back,#pcDrawer .pcd-track i{transition:none}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- drawer markup ---------- */
  const old = document.getElementById('acctModal'); if (old) old.remove();
  const CAM = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  const root = document.createElement('div'); root.id = 'pcDrawer';
  root.innerHTML = `
<div class="pcd-back" data-close></div>
<aside class="pcd-panel" role="dialog" aria-modal="true" aria-label="Account">
  <button class="pcd-close" data-close aria-label="Close" type="button">\u00d7</button>

  <section id="pcdAuth" hidden>
    <div class="pcd-hero">
      <svg class="pcd-logo" viewBox="0 0 100 100" aria-hidden="true"><g fill="#f06fa0" stroke="#b83c73" stroke-width="5" stroke-linejoin="round"><circle cx="50" cy="29" r="14"/><path d="M41 44h18l-3 9q11 9 13 27H31q2-18 13-27z"/><path d="M22 88h56v-6q0-5-5-5H27q-5 0-5 5z"/></g></svg>
      <h2 id="pcdTitle">Welcome back</h2>
      <p id="pcdSub">Log in to see your profile and stats.</p>
    </div>
    <div class="pcd-body">
      <div class="pcd-tabs"><button type="button" data-tab="login" class="on">Log in</button><button type="button" data-tab="signup">Sign up</button></div>
      <form id="pcdForm" novalidate>
        <label class="pcd-field"><span>Username</span><input id="pcdUser" class="pcd-in" autocomplete="username" maxlength="20" placeholder="e.g. pinkqueen"></label>
        <label class="pcd-field"><span>Password</span><span class="pcd-pw"><input id="pcdPass" type="password" class="pcd-in" autocomplete="current-password" placeholder="At least 6 characters"><button type="button" class="pcd-eye" id="pcdEye">Show</button></span></label>
        <label class="pcd-field" id="pcdConfWrap" hidden><span>Confirm password</span><input id="pcdConf" type="password" class="pcd-in" autocomplete="new-password" placeholder="Type it again"></label>
        <p class="pcd-err" id="pcdErr" role="alert"></p>
        <button class="pcd-btn" id="pcdSubmit" type="submit">Log in</button>
      </form>
      <div class="pcd-or"><span>or</span></div>
      <button class="pcd-btn ghost" type="button" data-close>Keep playing as guest</button>
      <p class="pcd-note">Your account is saved on this device for now.</p>
    </div>
  </section>

  <section id="pcdProfile" hidden>
    <div class="pcd-banner" id="pcdBanner"><label class="pcd-chipbtn" for="pcdBannerIn">${CAM}Change banner</label></div>
    <div class="pcd-avrow">
      <label class="pcd-av" id="pcdAv" for="pcdPhotoIn" title="Change photo"><span id="pcdAvTxt"></span><span class="pcd-cam" style="color:#fff">${CAM}</span></label>
      <div class="pcd-who"><h2 id="pcdName"></h2><small id="pcdSince"></small></div>
    </div>
    <div class="pcd-body">
      <div class="pcd-stats">
        <div class="pcd-stat"><b id="pcdG">0</b><small>Games</small></div>
        <div class="pcd-stat"><b id="pcdW">0</b><small>Wins</small></div>
        <div class="pcd-stat"><b id="pcdD">0</b><small>Draws</small></div>
        <div class="pcd-stat"><b id="pcdL">0</b><small>Losses</small></div>
      </div>
      <div class="pcd-rate"><div class="pcd-ratetop"><span>Win rate</span><b id="pcdRate">0%</b></div><div class="pcd-track"><i id="pcdFill"></i></div></div>
      <div class="pcd-card">
        <h3>Edit profile</h3>
        <label class="pcd-field"><span>Display name</span><input id="pcdDisp" class="pcd-in" maxlength="20"></label>
        <p class="pcd-err" id="pcdPErr" role="alert"></p>
        <div class="pcd-row">
          <button class="pcd-btn small" id="pcdSave" type="button">Save name</button>
          <button class="pcd-btn ghost small" id="pcdRmPhoto" type="button">Remove photo</button>
          <button class="pcd-btn ghost small" id="pcdRmBanner" type="button">Remove banner</button>
        </div>
      </div>
      <button class="pcd-btn ghost" id="pcdOut" type="button">Log out</button>
    </div>
    <input type="file" id="pcdPhotoIn" accept="image/*" hidden>
    <input type="file" id="pcdBannerIn" accept="image/*" hidden>
  </section>
</aside>`;
  document.body.appendChild(root);
  const $ = id => document.getElementById(id);

  /* make sure the nav has a place for the Log in / Sign up buttons */
  document.querySelectorAll('.navbtns').forEach(n => { if (!n.querySelector('.acct')) { const s = document.createElement('span'); s.className = 'acct'; n.prepend(s); } });

  /* ---------- open / close ---------- */
  function openDrawer(view) {
    $('pcdAuth').hidden = view !== 'auth'; $('pcdProfile').hidden = view !== 'profile';
    root.classList.add('open');
    root.querySelector('.pcd-panel').scrollTop = 0;
    setTimeout(() => { const f = view === 'auth' ? $('pcdUser') : root.querySelector('.pcd-close'); if (f) f.focus(); }, 320);
  }
  function closeDrawer() { root.classList.remove('open'); }
  function setTab(t) {
    tab = t;
    root.querySelectorAll('.pcd-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    $('pcdTitle').textContent = t === 'signup' ? 'Join Pink Checkmate' : 'Welcome back';
    $('pcdSub').textContent = t === 'signup' ? 'Make an account to save your stats and customize your profile.' : 'Log in to see your profile and stats.';
    $('pcdSubmit').textContent = t === 'signup' ? 'Create account' : 'Log in';
    $('pcdConfWrap').hidden = t !== 'signup';
    $('pcdPass').autocomplete = t === 'signup' ? 'new-password' : 'current-password';
    $('pcdErr').textContent = '';
  }
  function openAuth(t) { setTab(t); openDrawer('auth'); }
  function openProfile() { drawProfile(); $('pcdPErr').textContent = ''; openDrawer('profile'); }

  /* ---------- drawing ---------- */
  const initial = n => ((n || '?').trim().charAt(0) || '?').toUpperCase();
  function setAvatar(el, photo, name, txtEl) { el.style.backgroundImage = photo ? 'url("' + photo + '")' : ''; (txtEl || el).textContent = photo ? '' : initial(name); }
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
    setAvatar($('pcdAv'), u.photo, u.name, $('pcdAvTxt'));
    $('pcdBanner').style.backgroundImage = u.banner ? 'url("' + u.banner + '")' : '';
    $('pcdName').textContent = u.name;
    $('pcdSince').textContent = 'Joined ' + new Date(u.created || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const g = u.games || 0, w = u.wins || 0, rate = g ? Math.round(w / g * 100) : 0;
    $('pcdG').textContent = g; $('pcdW').textContent = w; $('pcdD').textContent = u.draws || 0; $('pcdL').textContent = u.losses || 0;
    $('pcdRate').textContent = rate + '%'; $('pcdFill').style.width = rate + '%';
    if (document.activeElement !== $('pcdDisp')) $('pcdDisp').value = u.name;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-acct]'); if (!b) return;
    if (b.dataset.acct === 'profile') openProfile(); else openAuth(b.dataset.acct);
  });
  root.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDrawer(); });
  root.querySelectorAll('.pcd-tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('open')) closeDrawer(); });
  $('pcdEye').onclick = () => {
    const show = $('pcdPass').type === 'password';
    $('pcdPass').type = show ? 'text' : 'password'; $('pcdConf').type = show ? 'text' : 'password';
    $('pcdEye').textContent = show ? 'Hide' : 'Show';
  };

  $('pcdForm').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('pcdErr'), btn = $('pcdSubmit');
    const name = $('pcdUser').value.trim(), pass = $('pcdPass').value, key = name.toLowerCase();
    err.textContent = '';
    if (!/^[\p{L}\p{N}_ .-]{2,20}$/u.test(name)) { err.textContent = 'Username: 2 to 20 letters or numbers.'; return; }
    if (!pass) { err.textContent = 'Please type your password.'; return; }
    if (tab === 'signup') {
      if (pass.length < 6) { err.textContent = 'Use at least 6 characters for the password.'; return; }
      if (pass !== $('pcdConf').value) { err.textContent = 'The two passwords do not match.'; return; }
    }
    btn.disabled = true;
    try {
      const users = load();
      if (tab === 'signup') {
        if (users[key]) err.textContent = 'That username is taken. Try another one.';
        else {
          const salt = rand();
          users[key] = { name, salt, hash: await hash(salt, pass), photo: '', banner: '', games: 0, wins: 0, draws: 0, losses: 0, created: Date.now() };
          if (!save(users)) err.textContent = 'Could not save on this device. Is private browsing on?';
          else { setSess(key); $('pcdForm').reset(); drawAcct(); openProfile(); }
        }
      } else {
        const u = users[key];
        if (!u || u.hash !== await hash(u.salt, pass)) err.textContent = 'Wrong username or password.';
        else { setSess(key); $('pcdForm').reset(); drawAcct(); closeDrawer(); }
      }
    } catch (x) { err.textContent = 'Something went wrong. Please try again.'; }
    btn.disabled = false;
  });

  $('pcdOut').onclick = () => { setSess(''); closeDrawer(); drawAcct(); };
  $('pcdSave').onclick = () => {
    const v = $('pcdDisp').value.trim(), err = $('pcdPErr');
    err.className = 'pcd-err';
    if (!/^[\p{L}\p{N}_ .-]{2,20}$/u.test(v)) { err.textContent = 'Name: 2 to 20 letters or numbers.'; return; }
    if (update(u => { u.name = v; })) { drawAcct(); drawProfile(); err.className = 'pcd-err ok'; err.textContent = 'Saved!'; }
    else err.textContent = 'Could not save on this device.';
  };
  $('pcdRmPhoto').onclick = () => { update(u => { u.photo = ''; }); drawAcct(); drawProfile(); };
  $('pcdRmBanner').onclick = () => { update(u => { u.banner = ''; }); drawProfile(); };

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
    const err = $('pcdPErr'); err.className = 'pcd-err'; err.textContent = '';
    if (!f || !me()) return;
    try {
      const data = await toData(f, w, h);
      if (!update(u => { u[field] = data; })) throw new Error('save');
      drawProfile(); drawAcct();
    } catch (x) { err.textContent = 'Could not save that picture. Try a different image.'; }
  }
  $('pcdPhotoIn').addEventListener('change', e => pick(e.target, 256, 256, 'photo'));
  $('pcdBannerIn').addEventListener('change', e => pick(e.target, 960, 240, 'banner'));

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

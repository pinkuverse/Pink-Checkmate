/* Pink Checkmate accounts (simple version): username + password, saved in this browser only.
   Log in / Sign up open in a side drawer; your profile is a full page. Builds its own markup and styles. No server or Firebase yet. */
(function () {
  'use strict';
  const KEY = 'pcUsers', SESS = 'pcSession';
  let tab = 'login', repo = false;
  const dims = {};

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

  /* ---------- art ---------- */
  const BASE = '<path d="M24 92h52v-7q0-5-5-5H29q-5 0-5 5z"/>';
  const P = {
    k: '<path d="M46 5h8v7h7v8h-7v7h-8v-7h-7v-8h7z"/><path d="M36 56Q34 34 50 31Q66 34 64 56z"/><path d="M36 56h28v6H36zM40 62h20l5 18H35z"/>' + BASE,
    r: '<path d="M32 18h9v8h6v-8h6v8h6v-8h9v22l-6 6 3 26H35l3-26-6-6z"/>' + BASE,
    n: '<path d="M28 82C30 62 36 54 46 46L30 52C26 52 24 48 28 44L44 26 46 14 54 22C72 26 78 48 74 66L74 82z"/>' + BASE
  };
  const piece = (t, cls, extra) => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round">${P[t]}</g>${extra || ''}</svg>`;
  const KNIGHT = `<svg viewBox="0 0 100 100" aria-hidden="true">
    <g fill="#f9a8c9" stroke="#e0679b" stroke-width="3" stroke-linejoin="round">${P.n}</g>
    <g fill="url(#shade)">${P.n}</g><g fill="url(#gloss)">${P.n}</g>
    <circle cx="55" cy="35" r="3" fill="#a82b66"/>
    <path d="M50 24 49 7 56 14 61 4 66 14 73 7 72 24z" fill="#ffe08a" stroke="#e0a93b" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="49" cy="6" r="2" fill="#ffd36e"/><circle cx="61" cy="3" r="2" fill="#ffd36e"/><circle cx="73" cy="6" r="2" fill="#ffd36e"/></svg>`;
  const LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#f06fa0" stroke="#b83c73" stroke-width="5" stroke-linejoin="round"><circle cx="50" cy="29" r="14"/><path d="M41 44h18l-3 9q11 9 13 27H31q2-18 13-27z"/><path d="M22 88h56v-6q0-5-5-5H27q-5 0-5 5z"/></g></svg>';
  const CAT = '<svg viewBox="12 4 116 112" aria-hidden="true"><g stroke="#e07aa3" stroke-width="3" stroke-linejoin="round"><path d="M26 52 22 12 58 34z" fill="#fff5f9"/><path d="M114 52 118 12 82 34z" fill="#fff5f9"/><ellipse cx="70" cy="70" rx="52" ry="42" fill="#fff5f9"/></g><path d="M31 44 29 22 48 34z" fill="#f9b4cf"/><path d="M109 44 111 22 92 34z" fill="#f9b4cf"/><circle cx="34" cy="82" r="7" fill="#ffb3cf" opacity=".75"/><circle cx="106" cy="82" r="7" fill="#ffb3cf" opacity=".75"/><ellipse cx="48" cy="68" rx="7" ry="9" fill="#5a2d45"/><circle cx="50.5" cy="64" r="2.8" fill="#fff"/><path d="M83 71Q92 59 101 71" fill="none" stroke="#5a2d45" stroke-width="4.5" stroke-linecap="round"/><path d="M66 78h8l-4 5z" fill="#f06fa0"/><path d="M70 83Q64 92 57 86M70 83Q76 92 83 86" fill="none" stroke="#5a2d45" stroke-width="2.5" stroke-linecap="round"/></svg>';
  const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    home: ic('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    games: ic('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 12h18M12 3v18"/>'),
    gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'),
    help: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>'),
    out: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    bars: ic('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
    trophy: ic('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    pct: ic('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
    user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    cal: ic('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    pen: ic('<path d="M4 20l4-1L19 8l-3-3L5 16z"/>'),
    cam: ic('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>')
  };

  /* ---------- styles ---------- */
  const css = `
.acct{display:inline-flex;gap:10px;align-items:center}
.acct .chip{font:inherit;display:inline-flex;align-items:center;gap:8px;background:#fff;border:2px solid #fcd6e5;border-radius:999px;padding:3px 14px 3px 3px;cursor:pointer;color:#6a3a53;font-weight:700}
.acct .chip:hover{border-color:#e0679b}
.mini-av{width:28px;height:28px;border-radius:50%;background:#e0679b center/cover;color:#fff;display:grid;place-items:center;font-size:.85rem;flex:none}
.pcx{display:none;min-height:100vh;position:relative;overflow:hidden;background:linear-gradient(165deg,#ffd3e5 0%,#ffe9f2 50%,#fff6fa 100%);color:#6a3a53;font-family:"Nunito",system-ui,sans-serif}
.pcx.active{display:block}
.pcx *{box-sizing:border-box}
.pcx [hidden]{display:none!important}
.pcx h1,.pcx h2,.pcx h3{font-family:"Fraunces",Georgia,serif;font-weight:600;margin:0}
.pcx button:focus-visible,.pcx label:focus-visible,.pcx input:focus-visible{outline:3px solid #e0679b;outline-offset:2px}
.pcx-nav{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 32px;background:rgba(255,248,251,.7);backdrop-filter:blur(8px);border-bottom:1px solid rgba(245,170,200,.5)}
.pcx-brand{display:flex;align-items:center;gap:10px;font-family:"Fraunces",Georgia,serif;font-style:italic;font-size:1.35rem;color:#e0679b;cursor:pointer;background:none;border:0;padding:0}
.pcx-brand svg{width:34px;height:34px}
.pcx-navr{display:flex;align-items:center;gap:10px}
.pcx-link{font:inherit;font-weight:700;background:none;border:0;color:#6a3a53;cursor:pointer;padding:8px 10px}
.pcx-pill{font:inherit;font-weight:700;border:0;border-radius:999px;padding:10px 20px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#f28db7,#e0679b);box-shadow:0 6px 14px rgba(224,103,155,.3)}
.pcx-pill:hover{transform:translateY(-1px)}
.pcx-user{display:inline-flex;align-items:center;gap:8px;font-weight:700}
.pcx-deco{position:absolute;inset:0;pointer-events:none;z-index:0}
.pcx-deco .pz{position:absolute;color:#ffc9de;opacity:.55}
.pcx-deco .sp{position:absolute;color:#f7b5cf;animation:pcxtw 3.2s ease-in-out infinite}
@keyframes pcxtw{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
.pcx-welcome{position:relative;z-index:2;max-width:520px;margin:0 auto;padding:18px 24px 56px;text-align:center}
.pcx-art svg{width:min(210px,52vw);filter:drop-shadow(0 12px 14px rgba(224,103,155,.35))}
.pcx-welcome h1{font-size:clamp(2.1rem,6vw,3rem);line-height:1.1;color:#e0679b;margin-top:6px}
.pcx-tag{margin:10px 0 6px;font-size:1.1rem}
.pcx-div{display:flex;align-items:center;gap:10px;justify-content:center;color:#e0679b;margin:8px auto 20px;max-width:300px}
.pcx-div::before,.pcx-div::after{content:"";flex:1;height:1.5px;background:linear-gradient(90deg,transparent,#f5aac8)}
.pcx-div::after{background:linear-gradient(270deg,transparent,#f5aac8)}
.pcx-stack{display:grid;gap:14px;max-width:400px;margin:0 auto}
.pcx-btn{font:inherit;font-weight:700;font-size:1.05rem;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border:2px solid #f28db7;border-radius:999px;padding:15px 22px;cursor:pointer;background:rgba(255,255,255,.75);color:#e0679b;transition:transform .15s}
.pcx-btn:hover{transform:translateY(-2px)}
.pcx-btn.primary{background:linear-gradient(135deg,#f28db7,#e0679b);color:#fff;border-color:#e0679b;box-shadow:0 8px 18px rgba(224,103,155,.3)}
.pcx-btn.small{width:auto;font-size:.9rem;padding:9px 18px}
.pcx-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.pcx-or{display:flex;align-items:center;gap:12px;opacity:.6}
.pcx-or::before,.pcx-or::after{content:"";flex:1;height:1px;background:#f5aac8}
.pcx-chip{font:inherit;justify-self:center;background:rgba(255,255,255,.6);border:1.5px solid rgba(245,170,200,.7);color:#e0679b;border-radius:999px;padding:8px 20px;cursor:pointer;font-size:.9rem}
.pcx-form{text-align:left}
.pcx-form h2{font-size:1.6rem;color:#e0679b;text-align:center}
.pcx-field{display:grid;gap:6px}
.pcx-field>span{font-weight:700;font-size:.85rem}
.pcx-in{font:inherit;width:100%;padding:13px 16px;border:2px solid #fcd6e5;border-radius:16px;background:#fff;color:#6a3a53}
.pcx-in:focus{outline:none;border-color:#e0679b;box-shadow:0 0 0 4px rgba(224,103,155,.15)}
.pcx-pw{position:relative;display:block}
.pcx-pw .pcx-in{padding-right:66px}
.pcx-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);font:inherit;font-weight:700;font-size:.8rem;border:0;background:none;color:#e0679b;cursor:pointer;padding:6px 8px}
.pcx-err{margin:0;min-height:1.3em;color:#d6334f;font-size:.9rem}
.pcx-err.ok{color:#2d8a62}
.pcx-note{margin:0;text-align:center;opacity:.65;font-size:.85rem}
.pcx-shell{position:relative;z-index:2;display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px;max-width:1120px;margin:0 auto;padding:24px 24px 50px}
.pcx-side{display:grid;gap:6px;align-content:start;background:rgba(255,255,255,.55);border:1.5px solid rgba(245,170,200,.45);border-radius:24px;padding:14px;position:sticky;top:20px;height:fit-content}
.pcx-sb{font:inherit;font-weight:700;display:flex;align-items:center;gap:12px;border:0;background:transparent;color:#6a3a53;padding:13px 16px;border-radius:16px;cursor:pointer;text-align:left}
.pcx-sb svg{width:22px;height:22px;color:#e0679b;flex:none}
.pcx-sb:hover{background:rgba(255,255,255,.75)}
.pcx-sb.on{background:#ffe3ee;color:#e0679b}
.pcx-main{display:grid;gap:16px;min-width:0;align-content:start}
.pcx-view{display:grid;gap:16px}
.pcx-card{background:rgba(255,255,255,.72);backdrop-filter:blur(6px);border:1.5px solid rgba(245,170,200,.45);border-radius:24px;padding:18px 22px;box-shadow:0 10px 30px rgba(224,103,155,.13)}
.pcx-hero{position:relative;overflow:hidden;display:flex;align-items:center;gap:28px;padding:26px;min-height:210px;background:linear-gradient(135deg,#ffe3ee,#ffd0e2) center/cover}
.pcx-hero.checker::before{content:"";position:absolute;inset:0;background:repeating-conic-gradient(rgba(255,255,255,.38) 0 25%,transparent 0 50%) 0 0/72px 72px}
.pcx-hero>*{position:relative}
.pcx-hero .hh{position:absolute;color:#f28db7;opacity:.7}
.pcx-avwrap{position:relative;flex:none;width:158px;height:158px}
.pcx-av{width:100%;height:100%;border-radius:50%;border:6px solid #fff;background:#ffd0e2 center/cover;display:grid;place-items:center;overflow:hidden;box-shadow:0 10px 24px rgba(224,103,155,.3)}
.pcx-av svg{width:90%;height:90%}
.pcx-pen{position:absolute;right:4px;bottom:6px;width:40px;height:40px;border-radius:50%;background:#e0679b;border:3px solid #fff;color:#fff;display:grid;place-items:center;cursor:pointer}
.pcx-pen svg{width:18px;height:18px}
.pcx-who{min-width:0}
.pcx-who h2{font-size:2.1rem;color:#e0679b;overflow-wrap:anywhere;line-height:1.15}
.pcx-handle{margin:4px 0 14px;font-size:1.1rem;opacity:.85}
.pcx-edit{display:grid;gap:12px}
.pcx-edit h3{color:#e0679b}
.pcx-row{display:flex;flex-wrap:wrap;gap:10px}
.pcx-info{display:grid;grid-template-columns:1fr 1fr;gap:0}
.pcx-info>div{display:flex;align-items:center;gap:14px;padding:6px 8px}
.pcx-info>div+div{border-left:1.5px solid rgba(245,170,200,.5);padding-left:22px}
.pcx-info svg{width:30px;height:30px;color:#f28db7;flex:none}
.pcx-info small{display:block;opacity:.7}
.pcx-info b{font-size:1.1rem;overflow-wrap:anywhere}
.pcx-acth{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.pcx-acth h3{display:flex;align-items:center;gap:10px;color:#e0679b;font-size:1.3rem}
.pcx-acth h3 svg{width:24px;height:24px}
.pcx-all{font:inherit;font-weight:700;background:none;border:0;color:#e0679b;cursor:pointer}
.pcx-stats{display:grid;grid-template-columns:repeat(3,1fr)}
.pcx-stats>div{text-align:center;padding:8px}
.pcx-stats>div+div{border-left:1.5px solid rgba(245,170,200,.5)}
.pcx-stats svg{width:36px;height:36px;color:#f28db7}
.pcx-stats small{display:block;opacity:.75;margin-top:2px}
.pcx-stats b{font-size:1.9rem;color:#6a3a53;font-family:"Fraunces",Georgia,serif}
.pcx-quote{display:flex;align-items:center;gap:14px;font-family:"Fraunces",Georgia,serif;font-style:italic}
.pcx-quote .hv{color:#f06fa0;font-size:1.5rem}
.pcx-quote .paw{margin-left:auto;color:#f9a8c9;font-style:normal}
.pcx-list{display:grid;gap:10px}
.pcx-game{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.7);border-radius:16px;padding:12px 14px}
.pcx-game .res{font-size:.8rem;font-weight:700;border-radius:999px;padding:3px 12px;flex:none}
.pcx-game .res.win{background:#d9f3e6;color:#1f6b49}
.pcx-game .res.loss{background:#fbdada;color:#8a2b2b}
.pcx-game .res.draw{background:#ffe9c9;color:#8a5a14}
.pcx-game .dt{margin-left:auto;opacity:.65;font-size:.85rem;flex:none}
.pcx-empty{text-align:center;padding:18px;opacity:.85}
.pcx-help li{margin:8px 0}
@media(max-width:860px){
  .pcx-nav{padding:12px 16px}
  .pcx-shell{grid-template-columns:1fr;padding:14px 14px 40px}
  .pcx-side{grid-auto-flow:column;overflow-x:auto;position:static;padding:8px}
  .pcx-sb{padding:10px 14px;white-space:nowrap}
  .pcx-hero{flex-direction:column;text-align:center;padding:22px}
  .pcx-info{grid-template-columns:1fr;gap:10px}
  .pcx-info>div+div{border-left:0;padding-left:8px}
}
@media(prefers-reduced-motion:reduce){.pcx-deco .sp{animation:none}}
`;
  const css2 = `
#pcDrawer{position:fixed;inset:0;z-index:80;visibility:hidden;pointer-events:none;transition:visibility 0s .3s;font-family:"Nunito",system-ui,sans-serif;color:#6a3a53}
#pcDrawer.open{visibility:visible;pointer-events:auto;transition-delay:0s}
#pcDrawer [hidden]{display:none!important}
#pcDrawer *{box-sizing:border-box}
#pcDrawer .pcd-back{position:absolute;inset:0;background:rgba(106,58,83,.35);backdrop-filter:blur(2px);opacity:0;transition:opacity .3s}
#pcDrawer.open .pcd-back{opacity:1}
#pcDrawer .pcd-panel{position:absolute;top:0;right:0;height:100%;width:min(430px,94vw);background:#fff8fb;box-shadow:-14px 0 44px rgba(224,103,155,.3);border-radius:28px 0 0 28px;overflow-y:auto;transform:translateX(105%);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
#pcDrawer.open .pcd-panel{transform:none}
#pcDrawer .pcd-close{position:absolute;top:14px;right:14px;z-index:3;width:38px;height:38px;border-radius:50%;border:0;background:#fff;color:#e0679b;font-size:1.5rem;line-height:1;cursor:pointer;box-shadow:0 4px 12px rgba(224,103,155,.25)}
#pcDrawer h2{font-family:"Fraunces",Georgia,serif;font-weight:600;margin:0}
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
#pcDrawer .pcd-btn{font:inherit;font-weight:700;width:100%;border:2px solid #e0679b;background:linear-gradient(135deg,#f28db7,#e0679b);color:#fff;border-radius:999px;padding:12px 20px;cursor:pointer;transition:transform .15s}
#pcDrawer .pcd-btn:hover{transform:translateY(-2px)}
#pcDrawer .pcd-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
#pcDrawer .pcd-btn.ghost{background:transparent;color:#e0679b}
#pcDrawer .pcd-or{display:flex;align-items:center;gap:12px;opacity:.6;font-size:.85rem}
#pcDrawer .pcd-or::before,#pcDrawer .pcd-or::after{content:"";flex:1;height:1px;background:#f5aac8}
#pcDrawer .pcd-note{margin:0;text-align:center;opacity:.65;font-size:.85rem}
#pcDrawer button:focus-visible{outline:3px solid #e0679b;outline-offset:2px}
.pcx-quote #pcxBioText{flex:1;overflow-wrap:anywhere;line-height:1.4}
.pcx-bioedit{margin-left:auto;flex:none;width:36px;height:36px;border-radius:50%;border:0;background:#ffe3ee;color:#e0679b;display:grid;place-items:center;cursor:pointer}
.pcx-bioedit svg{width:16px;height:16px}
.pcx-bioedit:hover{background:#ffd0e2}
.pcx-hint{margin:0;color:#e0679b;font-weight:700;font-size:.9rem}
.pcx-hero .pcx-editfab{position:absolute;top:14px;right:14px;z-index:3;width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#e0679b;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 12px rgba(224,103,155,.3)}
.pcx-hero .pcx-editfab:hover{background:#fff;transform:scale(1.06)}
.pcx-editfab svg{width:18px;height:18px}
.pcx-hero .pcx-who h2{text-shadow:0 0 3px #fff,0 0 8px #fff,0 0 16px #fff}
.pcx-hero .pcx-handle{color:#6a3a53;opacity:1;font-weight:700;text-shadow:0 0 3px #fff,0 0 8px #fff,0 0 14px #fff}
.pcx.repo .hasimg{cursor:grab;touch-action:none}
.pcx.repo .hasimg:active{cursor:grabbing}
.pcx.repo .pcx-hero.hasimg{outline:3px dashed #e0679b;outline-offset:-8px}
.pcx.repo .pcx-av.hasimg{outline:3px dashed #e0679b;outline-offset:3px}
@media(prefers-reduced-motion:reduce){#pcDrawer .pcd-panel,#pcDrawer .pcd-back{transition:none}}
`;
  const st = document.createElement('style'); st.textContent = css + css2; document.head.appendChild(st);

  /* ---------- pages ---------- */
  ['acctModal', 'pcDrawer'].forEach(id => { const o = document.getElementById(id); if (o) o.remove(); });
  const HEARTS = '<span class="sp" style="left:8%;top:18%;font-size:26px">\u2726</span><span class="sp" style="left:86%;top:12%;font-size:22px;animation-delay:-1s">\u2726</span><span class="sp" style="left:18%;top:62%;font-size:20px;animation-delay:-2s">\u2726</span><span class="sp" style="left:90%;top:50%;font-size:24px;animation-delay:-.5s">\u2726</span><span class="sp" style="left:72%;top:30%;font-size:28px;animation-delay:-1.6s">\u2661</span><span class="sp" style="left:26%;top:34%;font-size:30px;animation-delay:-2.4s">\u2665</span><span class="sp" style="left:80%;top:72%;font-size:24px;animation-delay:-.8s">\u2661</span>';
  const root = document.createElement('div'); root.id = 'pcDrawer';
  root.innerHTML = `
<div class="pcd-back" data-close></div>
<aside class="pcd-panel" role="dialog" aria-modal="true" aria-label="Log in or sign up">
  <button class="pcd-close" data-close aria-label="Close" type="button">\u00d7</button>
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
</aside>`;
  document.body.appendChild(root);

  const profile = document.createElement('section');
  profile.className = 'screen pcx'; profile.id = 'profilePage';
  profile.innerHTML = `
  <div class="pcx-deco" aria-hidden="true">${HEARTS}</div>
  <header class="pcx-nav">
    <button class="pcx-brand" type="button" data-home>${LOGO}<span>Pink Checkmate <span style="font-style:normal">\u2661</span></span></button>
    <div class="pcx-navr"><button class="pcx-pill" type="button" data-play>Play</button><span class="pcx-user"><span class="mini-av" id="pcxNavAv"></span><span id="pcxNavName"></span></span></div>
  </header>
  <div class="pcx-shell">
    <nav class="pcx-side" aria-label="Account">
      <button class="pcx-sb on" type="button" data-pv="profile">${I.home}Profile</button>
      <button class="pcx-sb" type="button" data-pv="games">${I.games}My Games</button>
      <button class="pcx-sb" type="button" data-pv="settings">${I.gear}Settings</button>
      <button class="pcx-sb" type="button" data-pv="help">${I.help}Help</button>
      <button class="pcx-sb" type="button" data-pv="logout">${I.out}Log Out</button>
    </nav>
    <div class="pcx-main">
      <div class="pcx-view" id="pv-profile">
        <div class="pcx-card pcx-hero checker" id="pcxHero">
          <span class="hh" style="right:82px;top:24px;font-size:26px">\u2665</span><span class="hh" style="right:44px;top:74px;font-size:20px">\u2661</span>
          <button class="pcx-editfab" type="button" id="pcxEditBtn" title="Edit profile" aria-label="Edit profile">${I.pen}</button>
          <div class="pcx-avwrap"><div class="pcx-av" id="pcxAv"></div><label class="pcx-pen" for="pcxPhotoIn" title="Change photo">${I.pen}</label></div>
          <div class="pcx-who"><h2><span id="pcxName"></span> <span style="font-style:normal">\u2661</span></h2><p class="pcx-handle" id="pcxHandle"></p></div>
        </div>
        <div class="pcx-card pcx-edit" id="pcxEdit" hidden>
          <h3>Edit profile</h3>
          <label class="pcx-field"><span>Display name</span><input id="pcxDisp" class="pcx-in" maxlength="20"></label>
          <label class="pcx-field"><span>Bio <small id="pcxBioCount" style="opacity:.6"></small></span><textarea id="pcxBio" class="pcx-in" rows="3" maxlength="120" placeholder="Write something about you..."></textarea></label>
          <p class="pcx-hint" id="pcxRepoHint" hidden>Drag your photo or banner to move it, then press Done adjusting.</p>
          <p class="pcx-err" id="pcxPErr" role="alert"></p>
          <div class="pcx-row">
            <button class="pcx-btn primary small" type="button" id="pcxSave">Save</button>
            <label class="pcx-btn small" for="pcxPhotoIn" style="cursor:pointer">Change photo</label>
            <label class="pcx-btn small" for="pcxBannerIn" style="cursor:pointer">Change banner</label>
            <button class="pcx-btn small" type="button" id="pcxRepo">Adjust position</button>
            <button class="pcx-btn small" type="button" id="pcxRmPhoto">Remove photo</button>
            <button class="pcx-btn small" type="button" id="pcxRmBanner">Remove banner</button>
          </div>
        </div>
        <div class="pcx-card pcx-info">
          <div>${I.user}<span><small>Username</small><b id="pcxUname"></b></span></div>
          <div>${I.cal}<span><small>Member Since</small><b id="pcxSince"></b></span></div>
        </div>
        <div class="pcx-card">
          <div class="pcx-acth"><h3>${I.bars}My Activity</h3><button class="pcx-all" type="button" data-pv="games">View All \u2192</button></div>
          <div class="pcx-stats">
            <div>${I.games}<small>Games Played</small><b id="pcxG">0</b></div>
            <div>${I.trophy}<small>Wins</small><b id="pcxW">0</b></div>
            <div>${I.pct}<small>Win Rate</small><b id="pcxR">0%</b></div>
          </div>
        </div>
        <div class="pcx-card pcx-quote"><span class="hv">\u2665</span><span id="pcxBioText"></span><button class="pcx-bioedit" type="button" id="pcxBioBtn" title="Edit bio" aria-label="Edit bio">${I.pen}</button></div>
      </div>
      <div class="pcx-view" id="pv-games" hidden>
        <div class="pcx-card"><div class="pcx-acth"><h3>${I.games}My Games</h3><span id="pcxCount" style="opacity:.7"></span></div><div class="pcx-list" id="pcxList"></div></div>
      </div>
      <div class="pcx-view" id="pv-help" hidden>
        <div class="pcx-card pcx-help"><h3 style="color:#e0679b;font-size:1.3rem">Quick help</h3>
          <ul>
            <li><b>Play the computer:</b> press Play, choose Vs computer, pick a bot and press Start game.</li>
            <li><b>Premove:</b> while the computer thinks, tap a piece and a square to line up your next move.</li>
            <li><b>Undo and takeback:</b> the arrow button takes a move back. In two-player games the other player has to accept.</li>
            <li><b>Look back:</b> use the arrows above the move list (or your keyboard arrows) to see earlier positions.</li>
            <li><b>Your stats:</b> games you finish against the computer are counted here while you are logged in.</li>
            <li><b>Saved on this device:</b> accounts live in this browser for now, so they will not follow you to another device.</li>
          </ul></div>
      </div>
    </div>
  </div>
  <input type="file" id="pcxPhotoIn" accept="image/*" hidden>
  <input type="file" id="pcxBannerIn" accept="image/*" hidden>`;
  document.body.append(profile);
  const $ = id => document.getElementById(id);

  /* make sure the nav has a place for the Log in / Sign up buttons */
  document.querySelectorAll('.navbtns').forEach(n => {
    let s = n.querySelector('.acct'); if (!s) { s = document.createElement('span'); s.className = 'acct'; }
    const st = n.querySelector('[data-settings]'); if (st) st.after(s); else n.prepend(s);
  });

  /* ---------- navigation ---------- */
  function goto(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); window.scrollTo(0, 0); try { history.replaceState(null, '', '#' + id); } catch (e) {} }
  function playNow() { const b = document.querySelector('#home [data-go="game"]') || document.querySelector('[data-go="game"]'); if (b) b.click(); }
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
  function openAuth(t) { setTab(t); root.classList.add('open'); setTimeout(() => $('pcdUser').focus(), 320); }
  function closeDrawer() { root.classList.remove('open'); }
  function setPV(v) {
    if (v === 'logout') { setSess(''); drawAcct(); goto('home'); return; }
    if (v === 'settings') { const s = document.querySelector('[data-settings]'); if (s) s.click(); return; }
    ['profile', 'games', 'help'].forEach(k => { $('pv-' + k).hidden = k !== v; });
    profile.querySelectorAll('.pcx-sb').forEach(b => b.classList.toggle('on', b.dataset.pv === v));
    if (v === 'games') drawGames();
  }
  function showProfile(v) { if (!me()) { openAuth('login'); return; } drawProfile(); setPV(v || 'profile'); goto('profilePage'); }

  /* ---------- drawing ---------- */
  const initial = n => ((n || '?').trim().charAt(0) || '?').toUpperCase();
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
        const av = document.createElement('span'); av.className = 'mini-av';
        av.style.backgroundImage = u.photo ? 'url("' + u.photo + '")' : ''; av.textContent = u.photo ? '' : initial(u.name);
        { const q = u.photoPos || { x: 50, y: 50 }; av.style.backgroundPosition = q.x + '% ' + q.y + '%'; }
        const nm = document.createElement('b'); nm.textContent = u.name;
        c.append(av, nm); box.append(c);
      }
    });
  }
  function drawProfile() {
    const u = me(); if (!u) return;
    const av = $('pcxAv');
    av.style.backgroundImage = u.photo ? 'url("' + u.photo + '")' : '';
    if (u.photo) av.textContent = ''; else av.innerHTML = CAT;
    const pp = u.photoPos || { x: 50, y: 50 }, bp = u.bannerPos || { x: 50, y: 50 };
    av.style.backgroundPosition = pp.x + '% ' + pp.y + '%'; av.classList.toggle('hasimg', !!u.photo);
    $('pcxNavAv').style.backgroundPosition = pp.x + '% ' + pp.y + '%';
    [u.photo, u.banner].forEach(src => { if (src && !dims[src]) { const im = new Image(); im.onload = () => { dims[src] = { w: im.naturalWidth, h: im.naturalHeight }; }; im.src = src; } });
    $('pcxNavAv').style.backgroundImage = u.photo ? 'url("' + u.photo + '")' : ''; $('pcxNavAv').textContent = u.photo ? '' : initial(u.name);
    $('pcxNavName').textContent = u.name;
    const hero = $('pcxHero');
    hero.style.backgroundImage = u.banner ? 'url("' + u.banner + '")' : '';
    hero.classList.toggle('checker', !u.banner);
    hero.style.backgroundPosition = bp.x + '% ' + bp.y + '%'; hero.classList.toggle('hasimg', !!u.banner);
    $('pcxName').textContent = u.name; $('pcxHandle').textContent = '@' + getSess(); $('pcxUname').textContent = '@' + getSess();
    $('pcxSince').textContent = new Date(u.created || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const g = u.games || 0, w = u.wins || 0;
    $('pcxG').textContent = g; $('pcxW').textContent = w; $('pcxR').textContent = (g ? Math.round(w / g * 100) : 0) + '%';
    $('pcxBioText').textContent = '\u201c' + (u.bio || 'Checkmate is just the beginning \u2661') + '\u201d';
    if (document.activeElement !== $('pcxDisp')) $('pcxDisp').value = u.name;
    if (document.activeElement !== $('pcxBio')) { $('pcxBio').value = u.bio || ''; $('pcxBioCount').textContent = ($('pcxBio').value.length) + '/120'; }
  }
  function drawGames() {
    const u = me(), list = $('pcxList'); list.textContent = '';
    const h = (u && u.history) || [];
    $('pcxCount').textContent = h.length ? h.length + ' recent' : '';
    if (!h.length) {
      const d = document.createElement('div'); d.className = 'pcx-empty';
      d.append('No games yet. Play the computer and your games will show up here.');
      const b = document.createElement('div'); b.style.marginTop = '12px';
      const pb = document.createElement('button'); pb.className = 'pcx-pill'; pb.type = 'button'; pb.textContent = 'Play now'; pb.onclick = playNow;
      b.append(pb); d.append(b); list.append(d); return;
    }
    h.forEach(g => {
      const row = document.createElement('div'); row.className = 'pcx-game';
      const r = document.createElement('span'); r.className = 'res ' + g.result; r.textContent = g.result === 'win' ? 'Won' : g.result === 'loss' ? 'Lost' : 'Draw';
      const t = document.createElement('span'); t.textContent = 'vs ' + g.bot + ' (' + g.rating + ') \u00b7 ' + g.mode + ' \u00b7 ' + g.moves + ' moves';
      const d = document.createElement('span'); d.className = 'dt'; d.textContent = new Date(g.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      row.append(r, t, d); list.append(row);
    });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-acct]');
    if (a) { if (a.dataset.acct === 'profile') showProfile(); else openAuth(a.dataset.acct); }
  });
  profile.addEventListener('click', e => {
    if (e.target.closest('[data-home]')) goto('home');
    else if (e.target.closest('[data-play]')) playNow();
    const pv = e.target.closest('[data-pv]'); if (pv) setPV(pv.dataset.pv);
  });
  $('pcxEditBtn').onclick = () => { $('pcxEdit').hidden = !$('pcxEdit').hidden; $('pcxPErr').textContent = ''; if ($('pcxEdit').hidden) setRepo(false); };
  function setRepo(on) {
    repo = on; profile.classList.toggle('repo', on);
    $('pcxRepo').textContent = on ? 'Done adjusting' : 'Adjust position'; $('pcxRepoHint').hidden = !on;
  }
  $('pcxRepo').onclick = () => setRepo(!repo);
  /* drag a picture inside its frame to choose which part shows */
  function makeDraggable(el, field, skip) {
    el.addEventListener('pointerdown', e => {
      if (!repo || !el.classList.contains('hasimg') || (skip && e.target.closest(skip))) return;
      const u = me(); if (!u || !u[field]) return;
      const d = dims[u[field]]; if (!d) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      const start = Object.assign({ x: 50, y: 50 }, u[field + 'Pos']);
      const fw = el.clientWidth, fh = el.clientHeight, sc = Math.max(fw / d.w, fh / d.h);
      const ox = d.w * sc - fw, oy = d.h * sc - fh, sx = e.clientX, sy = e.clientY;
      let cur = { x: start.x, y: start.y };
      const clamp = v => Math.max(0, Math.min(100, v));
      const move = ev => {
        cur = { x: ox > 1 ? clamp(start.x - (ev.clientX - sx) / ox * 100) : start.x, y: oy > 1 ? clamp(start.y - (ev.clientY - sy) / oy * 100) : start.y };
        el.style.backgroundPosition = cur.x + '% ' + cur.y + '%';
      };
      const up = () => {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        update(x => { x[field + 'Pos'] = cur; }); drawAcct();
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }
  makeDraggable($('pcxAv'), 'photo');
  makeDraggable($('pcxHero'), 'banner', '.pcx-avwrap,button,label,input,textarea');
  $('pcxBioBtn').onclick = () => { $('pcxEdit').hidden = false; $('pcxEdit').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('pcxBio').focus(), 250); };
  $('pcxBio').addEventListener('input', () => { $('pcxBioCount').textContent = $('pcxBio').value.length + '/120'; });

  /* log in / sign up drawer */
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
          users[key] = { name, salt, hash: await hash(salt, pass), photo: '', banner: '', bio: '', games: 0, wins: 0, draws: 0, losses: 0, history: [], created: Date.now() };
          if (!save(users)) err.textContent = 'Could not save on this device. Is private browsing on?';
          else { setSess(key); $('pcdForm').reset(); closeDrawer(); drawAcct(); playNow(); }
        }
      } else {
        const u = users[key];
        if (!u || u.hash !== await hash(u.salt, pass)) err.textContent = 'Wrong username or password.';
        else { setSess(key); $('pcdForm').reset(); closeDrawer(); drawAcct(); playNow(); }
      }
    } catch (x) { err.textContent = 'Something went wrong. Please try again.'; }
    btn.disabled = false;
  });

  $('pcxSave').onclick = () => {
    const v = $('pcxDisp').value.trim(), bio = $('pcxBio').value.trim().replace(/\s+/g, ' ').slice(0, 120), err = $('pcxPErr'); err.className = 'pcx-err';
    if (!/^[\p{L}\p{N}_ .-]{2,20}$/u.test(v)) { err.textContent = 'Name: 2 to 20 letters or numbers.'; return; }
    if (update(u => { u.name = v; u.bio = bio; })) { drawAcct(); drawProfile(); err.className = 'pcx-err ok'; err.textContent = 'Saved!'; }
    else err.textContent = 'Could not save on this device.';
  };
  $('pcxRmPhoto').onclick = () => { update(u => { u.photo = ''; }); drawAcct(); drawProfile(); };
  $('pcxRmBanner').onclick = () => { update(u => { u.banner = ''; }); drawProfile(); };

  /* pictures are shrunk in the browser first (shape kept, so they can be moved around in their frame) */
  function toData(file, max) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => rej(new Error('bad image'));
      img.src = url;
    });
  }
  async function pick(input, max, field) {
    const f = input.files[0]; input.value = '';
    const err = $('pcxPErr'); err.className = 'pcx-err'; err.textContent = '';
    if (!f || !me()) return;
    try {
      const data = await toData(f, max);
      if (!update(u => { u[field] = data; u[field + 'Pos'] = { x: 50, y: 50 }; })) throw new Error('save');
      drawProfile(); drawAcct(); $('pcxEdit').hidden = false; setRepo(true);
    } catch (x) { $('pcxEdit').hidden = false; err.textContent = 'Could not save that picture. Try a different image.'; }
  }
  $('pcxPhotoIn').addEventListener('change', e => pick(e.target, 640, 'photo'));
  $('pcxBannerIn').addEventListener('change', e => pick(e.target, 1400, 'banner'));

  /* ---------- game results (against the computer) ---------- */
  function recordResult(r, info) {
    update(u => {
      u.games = (u.games || 0) + 1;
      if (r === 'win') u.wins = (u.wins || 0) + 1; else if (r === 'loss') u.losses = (u.losses || 0) + 1; else u.draws = (u.draws || 0) + 1;
      if (info) { u.history = u.history || []; u.history.unshift({ t: Date.now(), result: r, bot: info.bot, rating: info.rating, mode: info.mode, moves: info.moves }); u.history = u.history.slice(0, 30); }
    });
    drawProfile();
  }
  function restoreProfile() { if (me()) showProfile('profile'); else goto('home'); }
  window.PinkAccount = { recordResult, restoreProfile };
  drawAcct();
})();

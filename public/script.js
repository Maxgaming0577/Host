// ─── CONFIG ───────────────────────────────────────────────────
const API = window.API || {};

// REWARDS CONFIG
const REWARDS = {
  mc:         { name:'Minecraft Reward',     icon:'⚔️',  cost:5000000,  value:'₹899',     desc:'Server exclusive Minecraft reward.', tag:'MINECRAFT', tagClass:'tag-mc' },
  rb:         { name:'Roblox $50 Plan',      icon:'🎮',  cost:8000000,  value:'₹1,499',   desc:'$50 plan credits added to your account.', tag:'ROBLOX $50', tagClass:'tag-rb' },
  rb100:      { name:'Roblox $100 Plan',     icon:'🎯',  cost:12000000, value:'₹2,499',   desc:'$100 plan credits for your account.', tag:'ROBLOX $100', tagClass:'tag-rb100' },
  xbox:       { name:'Xbox Game Pass',       icon:'🎮',  cost:7000000,  value:'₹1,999',   desc:'Ultimate activation for your account.', tag:'XBOX', tagClass:'tag-xbox' },
  nitro:      { name:'Nitro Basic',          icon:'💎',  cost:6000000,  value:'₹1,199/yr', desc:'Nitro Basic yearly plan gifted to account.', tag:'BASIC YEARLY', tagClass:'tag-nitro' },
  nitroboost: { name:'Nitro Boost',          icon:'🚀',  cost:20000000, value:'₹5,999/yr', desc:'Nitro Boost yearly + 2 server boosts gifted.', tag:'BOOST YEARLY', tagClass:'tag-nitroboost' }
};

// ─── AUTH STATE ───────────────────────────────────────────────
let authUser = null;

async function loadAuthUser() {
  try {
    const res = await fetch('/auth/me', { credentials: 'include' });
    const d = await res.json();
    if (d.loggedIn) {
      authUser = d;
      Session.userId = d.userId;
      renderNavAuth(d);
    } else {
      authUser = null;
      renderNavLoggedOut();
    }
  } catch(e) {
    authUser = null;
    renderNavLoggedOut();
  }
}

function renderNavAuth(user) {
  const right = document.getElementById('nav-right');
  if (!right) return;

  const coinBadge = document.getElementById('nav-coin-badge');
  if (coinBadge) {
    coinBadge.querySelector('.coin-amt').textContent = Number(user.balance||0).toLocaleString();
    coinBadge.style.display = 'flex';
  }

  const authArea = document.getElementById('nav-auth-area');
  if (authArea) {
    const avatarSrc = user.avatar || '';
    authArea.innerHTML = `
      <div class="nav-avatar" title="${user.username}" onclick="toggleUserMenu()">
        ${avatarSrc ? `<img src="${avatarSrc}" alt="${user.username}">` : user.username.charAt(0).toUpperCase()}
      </div>
      <div id="user-dropdown" style="display:none;position:absolute;top:calc(var(--nav-h));right:1.5rem;background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:0.75rem;min-width:180px;box-shadow:var(--shadow-lg);z-index:300;">
        <div style="padding:0.5rem 0.75rem;font-weight:700;font-size:0.85rem;border-bottom:1px solid var(--border);margin-bottom:0.5rem">${user.username}</div>
        <a href="/profile" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;color:var(--text);text-decoration:none;border-radius:8px;font-size:0.85rem;transition:var(--transition)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">👤 Profile</a>
        <a href="/profile" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;color:var(--text);text-decoration:none;border-radius:8px;font-size:0.85rem;transition:var(--transition)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">📦 Track Order</a>
        <a href="/auth/logout" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;color:var(--red);text-decoration:none;border-radius:8px;font-size:0.85rem;border-top:1px solid var(--border);margin-top:0.5rem;transition:var(--transition)" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">🚪 Sign Out</a>
      </div>`;
  }
}

function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', e => {
  const dd = document.getElementById('user-dropdown');
  if (dd && !dd.contains(e.target) && !e.target.closest('.nav-avatar')) dd.style.display = 'none';
});

function renderNavLoggedOut() {
  const coinBadge = document.getElementById('nav-coin-badge');
  if (coinBadge) coinBadge.style.display = 'none';
  const authArea = document.getElementById('nav-auth-area');
  if (authArea) {
    authArea.innerHTML = `<a href="/auth/discord" class="nav-auth-btn"><svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0045.7.4a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0 37.4 37.4 0 00-1.8-3.7.2.2 0 00-.2-.1 58.4 58.4 0 00-14.4 4.5.2.2 0 00-.1.1C1.6 18.9-.9 32.5.3 45.9a.2.2 0 00.1.2 58.8 58.8 0 0017.7 8.9.2.2 0 00.2-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36 36 0 01-5.5 2.6.2.2 0 00-.1.3c1 2.1 2.3 4 3.6 5.9a.2.2 0 00.2.1 58.7 58.7 0 0017.8-9 .2.2 0 00.1-.1c1.5-15.5-2.5-29-10.6-40.9a.2.2 0 00-.1-.1z"/></svg> Login with Discord</a>`;
  }
}

// ─── SESSION ──────────────────────────────────────────────────
const Session = {
  get userId() { return localStorage.getItem('nx_userId') || ''; },
  set userId(v) { v ? localStorage.setItem('nx_userId', v) : localStorage.removeItem('nx_userId'); }
};

// ─── TOAST ────────────────────────────────────────────────────
const Toast = {
  _wrap: null,
  _get() { if (!this._wrap) { this._wrap = document.getElementById('toast-wrap') || (() => { const el = document.createElement('div'); el.className='toast-wrap'; el.id='toast-wrap'; document.body.appendChild(el); return el; })(); } return this._wrap; },
  show(msg, type='info', ms=4000) {
    const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
    this._get().appendChild(el);
    setTimeout(() => { el.classList.add('toast-out'); setTimeout(() => el.remove(), 300); }, ms);
    return el;
  }
};

// ─── HTTP ─────────────────────────────────────────────────────
async function apiFetch(method, path, body) {
  const opts = { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(path, opts);
    const data = await res.json();
    if (res.status === 429) Toast.show(data.error || 'Too many requests. Please slow down.', 'warning', 6000);
    return { ok: res.ok, status: res.status, data };
  } catch(e) { Toast.show('Network error. Check your connection.', 'error'); return { ok:false, status:0, data:{error:'Network error'} }; }
}
const apiGet = p => apiFetch('GET', p);
const apiPost = (p, b) => apiFetch('POST', p, b);

// ─── UTILS ────────────────────────────────────────────────────
function fmtNum(n) { if(n>=1000000) return (n/1000000).toFixed(1)+'M'; if(n>=1000) return (n/1000).toFixed(0)+'K'; return n.toLocaleString(); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function setBtn(btn, state, orig) {
  if(!btn) return;
  if(state==='loading') { btn.disabled=true; btn.innerHTML=`<span class="spinner"></span> Processing…`; }
  else if(state==='success') { btn.disabled=true; btn.innerHTML='✓ Done!'; btn.style.background='#16a34a'; }
  else if(state==='error') { btn.disabled=true; btn.innerHTML='✗ Failed'; btn.style.background='#dc2626'; }
  else { btn.disabled=false; btn.innerHTML=orig; btn.style.background=''; }
}

// Code input auto-formatter
function setupCodeInput(el) {
  if(!el) return;
  el.addEventListener('input', e => {
    let v = e.target.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,25);
    let out = '';
    for(let i=0;i<v.length;i++) { if(i&&i%5===0) out+='-'; out+=v[i]; }
    e.target.value = out;
  });
}

// Active nav
function setActiveNav() {
  const p = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === p || (p==='/' && a.getAttribute('href')==='/'));
  });
}

// Hamburger
function setupHamburger() {
  const btn = document.getElementById('nav-hamburger');
  const links = document.querySelector('.nav-links');
  if(btn && links) btn.onclick = () => links.classList.toggle('open');
}

// Login modal
function openLoginModal() {
  const m = document.getElementById('login-modal');
  if(m) m.classList.add('open');
}
function closeLoginModal() {
  const m = document.getElementById('login-modal');
  if(m) m.classList.remove('open');
}

// Check auth callback
function checkAuthCallback() {
  const p = new URLSearchParams(window.location.search);
  if(p.get('auth')==='success') { Toast.show('Welcome! You\'re now signed in. 🎉', 'success', 5000); window.history.replaceState({}, '', '/'); loadAuthUser(); }
  else if(p.get('auth')==='failed') { Toast.show('Login failed. Please try again.', 'error'); window.history.replaceState({}, '', '/'); }
}

// Animated counter
function animCount(el, target, dur=1600) {
  const start = performance.now();
  const update = now => {
    const p = Math.min((now-start)/dur, 1);
    const eased = 1-Math.pow(1-p,3);
    el.textContent = fmtNum(Math.floor(eased*target));
    if(p<1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Countdown
function countdown(targetDate, el, onComplete) {
  if(!el) return;
  const tick = () => {
    const diff = new Date(targetDate) - new Date();
    if(diff<=0) { el.textContent=''; if(onComplete) onComplete(); return; }
    const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
    el.textContent = `Next claim: ${h}h ${m}m ${s}s`;
  };
  tick(); return setInterval(tick, 1000);
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  setupHamburger();
  setupCodeInput(document.getElementById('code-input'));
  checkAuthCallback();
  loadAuthUser();
});

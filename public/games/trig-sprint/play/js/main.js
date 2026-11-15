/* Trig Sprint — game loop, input, menus, persistence. */
(function () {
  const TS = globalThis.TS;
  const K = TS.K, A = TS.Audio;
  const { W, H, PX } = TS.R;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const params = new URLSearchParams(location.search);

  /* ------------------------------ save data ------------------------------ */
  const KEY = 'trigsprint.v1';
  const defaults = () => ({ best: {}, coins: {}, scores: {}, attempts: {}, icon: { c1: '#37f2c9', c2: '#ff4fd8' }, music: 0.8, sfx: 0.9, shake: true, lite: false, touch: null });
  let save = defaults();
  try { Object.assign(save, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ignore */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } };
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  /* ------------------------------ setup ------------------------------ */
  const cv = $('#cv');
  const stage = $('#stage');
  const renderer = new TS.Renderer(cv);
  renderer.icon = save.icon;
  renderer.quality = save.lite ? 0.35 : 1;
  A.musicVol = save.music; A.sfxVol = save.sfx;

  function layout() {
    stage.style.setProperty('--u', stage.clientWidth / 960 + 'px');
    renderer.resize();
  }
  window.addEventListener('resize', layout);
  layout();

  const G = {
    mode: 'title', L: null, def: null, sim: null, attempt: 1, practice: false, checkpoints: [], acc: 0, time: 0,
    deadT: 0, winT: 0, camX: 0, bg: true, demo: false, demoTog: null, demoIdx: 0, demoHeld: false, freeze: false,
    hidePlayer: false, last: 0, screenStack: [], from: 'title',
  };
  const input = { jump: false, pending: false, fire: false, pointers: new Set() };
  window.__TS = { G, renderer, save, input };

  /* ------------------------------ screens ------------------------------ */
  function show(name) {
    $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + name));
    G.screen = name;
    updateHudButtons();
  }
  function go(name) {
    if (name === 'back') { const prev = G.screenStack.pop() || 'title'; A.sfx('back'); show(prev); return; }
    if (G.screen && name !== G.screen && G.screen !== 'pause') G.screenStack.push(G.screen);
    A.sfx('click');
    if (name === 'select') buildCards();
    if (name === 'icon') buildIcon();
    if (name === 'settings') syncSettings();
    show(name);
  }
  function updateHudButtons() {
    const playing = G.mode === 'play' && !G.demoOnly;
    const touch = save.touch == null ? isTouch : save.touch;
    $('#hudbtns').classList.toggle('on', playing && touch);
    $('#pauseBtn').classList.toggle('on', playing && touch);
  }
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => { ensureAudio(); go(b.dataset.go); }));

  function fade(fn) {
    const f = $('#fade');
    f.style.opacity = 1;
    setTimeout(() => { fn(); f.style.opacity = 0; }, 260);
  }

  /* ------------------------------ level select ------------------------------ */
  function buildCards() {
    const box = $('#cards'); box.innerHTML = '';
    TS.DEFS.forEach((d) => {
      const best = Math.round((save.best[d.id] || 0) * 100);
      const coins = (save.coins[d.id] || []).filter(Boolean).length;
      const c = document.createElement('div');
      c.className = 'card'; c.style.setProperty('--cc', d.color); c.tabIndex = 0;
      c.innerHTML = `<h3>${d.name}</h3><div class="stars">${'★'.repeat(d.stars)}<span style="opacity:.25">${'★'.repeat(6 - d.stars)}</span></div>
        <div class="tag">${d.tag}</div><div class="tag">${d.bpm} BPM</div>
        <div class="bar"><i style="width:${best}%"></i></div>
        <div class="meta"><span>Best ${best}%</span><span class="coins">π ${coins}/3</span></div>`;
      const run = () => { ensureAudio(); A.sfx('select'); startLevel(d.id, $('#practiceChk').checked); };
      c.addEventListener('click', run);
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } });
      box.appendChild(c);
    });
  }

  /* ------------------------------ settings & icon ------------------------------ */
  function syncSettings() {
    $('#setMusic').value = save.music; $('#setSfx').value = save.sfx;
    $('#setShake').checked = save.shake; $('#setLite').checked = save.lite;
    $('#setTouch').checked = save.touch == null ? isTouch : save.touch;
  }
  $('#setMusic').addEventListener('input', (e) => { save.music = +e.target.value; A.setVolumes(save.music, save.sfx); persist(); });
  $('#setSfx').addEventListener('input', (e) => { save.sfx = +e.target.value; A.setVolumes(save.music, save.sfx); persist(); A.sfx('coin'); });
  $('#setShake').addEventListener('change', (e) => { save.shake = e.target.checked; persist(); });
  $('#setLite').addEventListener('change', (e) => { save.lite = e.target.checked; renderer.quality = save.lite ? 0.35 : 1; persist(); });
  $('#setTouch').addEventListener('change', (e) => { save.touch = e.target.checked; persist(); });

  const COLORS = ['#37f2c9', '#ff4fd8', '#ffd84d', '#4db8ff', '#ff6a6a', '#9d6bff', '#7dff5c', '#ffa24d', '#ffffff', '#ff8fb1'];
  const iconR = Object.create(TS.Renderer.prototype);
  iconR.ctx = $('#iconPrev').getContext('2d');
  function drawIcon() {
    const ctx = iconR.ctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 240, 240);
    ctx.save(); ctx.translate(120, 120); ctx.scale(2.6, 2.6);
    iconR.cube(0, 0, 36, save.icon.c1, save.icon.c2, 1); ctx.restore();
  }
  function buildIcon() {
    ['c1', 'c2'].forEach((k, i) => {
      const box = $(i ? '#sw2' : '#sw1'); box.innerHTML = '';
      COLORS.forEach((c) => {
        const d = document.createElement('div'); d.className = 'sw' + (save.icon[k] === c ? ' on' : ''); d.style.background = c;
        d.addEventListener('click', () => { save.icon[k] = c; renderer.icon = save.icon; persist(); A.sfx('click'); buildIcon(); });
        box.appendChild(d);
      });
    });
    drawIcon();
  }

  /* ------------------------------ audio unlock ------------------------------ */
  let audioReady = false;
  function ensureAudio() {
    if (audioReady) return;
    if (!A.init()) return;
    audioReady = true;
    A.setVolumes(save.music, save.sfx);
    if (G.mode === 'title') A.playMenu();
  }
  ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, ensureAudio, { passive: true }));

  /* ------------------------------ fullscreen ------------------------------ */
  // Touch devices go fullscreen (and landscape, where the browser allows it) on the first tap, which hides the browser bars.
  // iPhone Safari has no Fullscreen API for pages, so there it only works when the page is added to the Home Screen.
  const fsRoot = document.documentElement;
  const fsReq = fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen;
  const fsExit = document.exitFullscreen || document.webkitExitFullscreen;
  const canFS = !!fsReq;
  const inFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  let fsWas = false, fsLeft = false;
  function enterFS() {
    if (!canFS || inFS()) return;
    const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (err) { /* ignore */ } };
    try {
      const p = fsReq.call(fsRoot, { navigationUI: 'hide' });
      if (p && p.then) p.then(lock, () => {}); else lock();
    } catch (err) { /* ignore */ }
  }
  function toggleFS() { if (inFS()) { fsLeft = true; try { fsExit.call(document); } catch (err) { /* ignore */ } } else { fsLeft = false; enterFS(); } }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, () => {
    if (inFS()) fsWas = true;
    else if (fsWas) { fsLeft = true; try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (err) { /* ignore */ } }
  }));
  // pointerup/click carry the user activation a fullscreen request needs on touch screens
  ['pointerup', 'click'].forEach((ev) => window.addEventListener(ev, (e) => {
    if (!canFS || fsLeft || inFS() || e.pointerType === 'mouse') return;
    if (isTouch && save.touch !== false) enterFS();
  }, { passive: true }));
  const btnFS = $('#btnFS');
  if (btnFS) { if (!canFS) btnFS.style.display = 'none'; else btnFS.addEventListener('click', () => { ensureAudio(); toggleFS(); }); }

  /* ------------------------------ level flow ------------------------------ */
  function newSim() { return new TS.Sim(G.L); }

  function startLevel(id, practice) {
    fade(() => {
      G.def = TS.DEFS.find((d) => d.id === id);
      G.L = TS.getLevel(id);
      G.practice = !!practice;
      G.checkpoints = [];
      G.attempt = (save.attempts[id] || 0) + 1;
      G.bg = false; G.demo = false; G.demoOnly = false;
      G.mode = 'play'; G.paused = false;
      resetRun(true);
      show('none');
      updateHudButtons();
    });
  }

  function resetRun(fromStart) {
    if (G.practice && G.checkpoints.length && !fromStart) {
      const c = G.checkpoints[G.checkpoints.length - 1];
      G.sim.copyFrom(c.sim);
    } else {
      G.sim = newSim();
      G.checkpoints = fromStart || !G.practice ? G.checkpoints.slice(0, 0) : G.checkpoints;
    }
    G.camX = G.sim.p.x;
    G.acc = 0; G.deadT = 0; G.winT = 0; G.hidePlayer = false;
    G.stats = G.stats || {};
    renderer.trail.length = 0;
    input.pending = false;
    if (G.mode === 'play') {
      A.playLevel(G.L, G.sim.p.x / G.L.speed);
    }
  }

  function onDeath() {
    if (G.bg) { G.deadT = 0.8; G.hidePlayer = true; return; }
    A.stop(0.02);
    A.sfx('death');
    G.deadT = 0.85;
    G.hidePlayer = true;
    if (!G.practice && !G.demo && !G.bg) {
      const pct = Math.min(0.99, G.sim.p.x / G.L.end);
      if (pct > (save.best[G.L.id] || 0)) save.best[G.L.id] = pct;
      save.attempts[G.L.id] = (save.attempts[G.L.id] || 0) + 1;
      persist();
    }
  }

  function onWin() {
    if (G.bg) { G.winT = 1.2; return; }
    G.winT = 1.8;
    A.stop(0.4);
    A.sfx('win');
  }

  function showComplete() {
    const L = G.L, sim = G.sim;
    G.mode = 'complete';
    const first = !G.practice;
    if (first) {
      save.best[L.id] = 1;
      const cs = save.coins[L.id] || (save.coins[L.id] = [0, 0, 0]);
      sim.coinGot.forEach((v, i) => { if (v) cs[i] = 1; });
      save.scores[L.id] = Math.max(save.scores[L.id] || 0, Math.floor(sim.score));
      save.attempts[L.id] = (save.attempts[L.id] || 0) + 1;
      persist();
    }
    $('#cName').textContent = L.name;
    const secs = (sim.time).toFixed(1);
    $('#cStats').innerHTML = [
      ['Attempt', G.attempt], ['Time', secs + 's'], ['Jumps', sim.jumps], ['Enemies shot', sim.kills],
      ['π coins', sim.coinCount + '/3'], ['Score', Math.floor(sim.score).toLocaleString()],
      ['Mode', G.practice ? 'Practice' : 'Normal'],
    ].map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join('');
    const idx = TS.DEFS.findIndex((d) => d.id === L.id);
    $('#btnNext').style.display = idx < TS.DEFS.length - 1 ? '' : 'none';
    show('complete');
    updateHudButtons();
    A.playMenu();
  }

  function quitToMenu() {
    if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
    fade(() => {
      G.mode = 'title'; G.paused = false;
      startBg();
      show('select'); buildCards();
      G.screenStack = ['title'];
      A.playMenu();
      updateHudButtons();
    });
  }

  function pause(on) {
    if (G.mode !== 'play' && G.mode !== 'pause') return;
    if (on && G.mode === 'play' && !G.sim.dead && !G.sim.won) {
      G.mode = 'pause'; show('pause');
      if (A.ctx) A.ctx.suspend();
    } else if (!on && G.mode === 'pause') {
      G.mode = 'play'; show('none');
      if (A.ctx) A.ctx.resume();
    }
    updateHudButtons();
  }
  $('#btnResume').addEventListener('click', () => pause(false));
  $('#btnRestart').addEventListener('click', () => { if (A.ctx) A.ctx.resume(); G.mode = 'play'; show('none'); G.attempt++; resetRun(true); updateHudButtons(); });
  $('#btnPractice').addEventListener('click', () => { G.practice = !G.practice; G.checkpoints = []; if (A.ctx) A.ctx.resume(); G.mode = 'play'; show('none'); resetRun(true); updateHudButtons(); });
  $('#btnQuit').addEventListener('click', quitToMenu);
  $('#pauseBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); pause(true); });
  $('#btnReplay').addEventListener('click', () => startLevel(G.L.id, G.practice));
  $('#btnMenu').addEventListener('click', quitToMenu);
  $('#btnNext').addEventListener('click', () => {
    const idx = TS.DEFS.findIndex((d) => d.id === G.L.id);
    startLevel(TS.DEFS[Math.min(TS.DEFS.length - 1, idx + 1)].id, G.practice);
  });

  /* ------------------------------ background demo ------------------------------ */
  function startBg(levelId) {
    const id = levelId || ['boot', 'sine', 'tangent'][Math.floor(Math.random() * 3)];
    const sol = TS.SOLUTIONS && TS.SOLUTIONS[id];
    if (!sol) { G.sim = null; return; }
    G.L = TS.getLevel(id); G.def = TS.DEFS.find((d) => d.id === id);
    G.bg = true; G.demo = true; G.demoOnly = true;
    G.demoTog = sol; G.demoIdx = 0; G.demoHeld = false;
    G.sim = newSim(); G.camX = 0; G.checkpoints = []; G.hidePlayer = false; G.practice = false; G.deadT = 0; G.winT = 0;
    G.attempt = 1;
    renderer.trail.length = 0;
  }

  /* ------------------------------ input ------------------------------ */
  const JUMP = new Set(['Space', 'ArrowUp', 'KeyW']);
  const FIRE = new Set(['KeyX', 'ShiftLeft', 'ShiftRight', 'KeyF', 'ArrowRight', 'KeyD']);
  window.addEventListener('keydown', (e) => {
    if (e.repeat) { if (G.mode === 'play' && (JUMP.has(e.code) || FIRE.has(e.code))) e.preventDefault(); return; }
    if (G.mode === 'play') {
      if (JUMP.has(e.code)) { input.jump = true; input.pending = true; e.preventDefault(); }
      else if (FIRE.has(e.code)) { input.fire = true; e.preventDefault(); }
      else if (e.code === 'Escape' || e.code === 'KeyP') pause(true);
      else if (e.code === 'KeyR') { G.attempt++; resetRun(true); }
      else if (e.code === 'KeyZ' && G.practice && !G.sim.dead && !G.sim.won) {
        G.checkpoints.push({ sim: G.sim.clone(), x: G.sim.p.x }); A.sfx('checkpoint');
      } else if (e.code === 'Backspace' && G.practice) { G.checkpoints.pop(); e.preventDefault(); }
    } else if (G.mode === 'pause') {
      if (e.code === 'Escape' || e.code === 'KeyP') pause(false);
    } else if (e.code === 'Escape' && G.screenStack.length && G.screen !== 'title' && G.screen !== 'complete') go('back');
  });
  window.addEventListener('keyup', (e) => {
    if (JUMP.has(e.code)) input.jump = false;
    if (FIRE.has(e.code)) input.fire = false;
  });
  window.addEventListener('blur', () => { input.jump = false; input.fire = false; input.pointers.clear(); if (G.mode === 'play' && !G.sim.dead && !G.sim.won && !G.demo) pause(true); });

  const jumpHint = $('#jumpHint');
  stage.addEventListener('pointerdown', (e) => {
    if (G.mode !== 'play') return;
    if (e.target.closest('.round') || e.target.closest('#fireBtn')) return;
    if (e.button === 2) { input.fire = true; return; }
    input.pointers.add(e.pointerId); input.jump = true; input.pending = true; jumpHint.classList.add('down');
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  const up = (e) => {
    if (e.button === 2) { input.fire = false; return; }
    input.pointers.delete(e.pointerId);
    if (!input.pointers.size) { input.jump = false; jumpHint.classList.remove('down'); }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('contextmenu', (e) => e.preventDefault());
  // FIRE zone: the whole right-hand strip. Tracks its own pointers so jump + fire can be held together (multi-touch).
  const fireBtn = $('#fireBtn'), firePtrs = new Set();
  const fireSync = () => { input.fire = firePtrs.size > 0; fireBtn.classList.toggle('down', input.fire); };
  fireBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); firePtrs.add(e.pointerId); fireSync();
    try { fireBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((n) => fireBtn.addEventListener(n, (e) => { firePtrs.delete(e.pointerId); fireSync(); }));
  window.addEventListener('blur', () => { firePtrs.clear(); fireSync(); jumpHint.classList.remove('down'); });
  // Letterbox bars (wide phones): taps out there count too. Left of the FIRE boundary = jump, right of it = fire.
  const outside = new Map();
  document.addEventListener('pointerdown', (e) => {
    if (G.mode !== 'play' || e.pointerType === 'mouse' || stage.contains(e.target) || e.target.closest('#rotate')) return;
    if (!$('#hudbtns').classList.contains('on')) return;
    const r = stage.getBoundingClientRect();
    if (e.clientX >= r.left + r.width * 0.64) { outside.set(e.pointerId, 'fire'); firePtrs.add(e.pointerId); fireSync(); }
    else { outside.set(e.pointerId, 'jump'); input.pointers.add(e.pointerId); input.jump = true; input.pending = true; jumpHint.classList.add('down'); }
  });
  const outsideUp = (e) => {
    const k = outside.get(e.pointerId); if (!k) return;
    outside.delete(e.pointerId);
    if (k === 'fire') { firePtrs.delete(e.pointerId); fireSync(); }
    else { input.pointers.delete(e.pointerId); if (!input.pointers.size) { input.jump = false; jumpHint.classList.remove('down'); } }
  };
  document.addEventListener('pointerup', outsideUp);
  document.addEventListener('pointercancel', outsideUp);

  /* ------------------------------ sim stepping ------------------------------ */
  const SFX_MAP = { jump: 'jump', orb: 'orb', pad: 'pad', portal: 'portal', flip: 'flip', shoot: 'shoot', enemyshot: 'enemyshot', hit: 'hit', bulletpop: 'bulletpop', kill: 'kill', coin: 'coin', spawn: 'spawn' };
  let sfxBudget = 0;

  function drain(sim, quiet) {
    const ev = sim.events;
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (!quiet) {
        const n = G.bg ? null : SFX_MAP[e.t];
        if (n) { if (n === 'shoot' || n === 'spawn') { if (sfxBudget > 0) { sfxBudget--; A.sfx(n); } } else A.sfx(n); }
        renderer.onEvent(e, G.camX);
      }
      if (e.t === 'death') onDeath();
      else if (e.t === 'win') onWin();
    }
    ev.length = 0;
  }

  function stepOnce(quiet) {
    const sim = G.sim;
    if (sim.dead || sim.won) return;
    let held, fire;
    if (G.demo) {
      while (G.demoIdx < G.demoTog.length && G.demoTog[G.demoIdx] <= sim.tick) { G.demoHeld = !G.demoHeld; G.demoIdx++; }
      held = G.demoHeld;
      const p = sim.p;
      fire = sim.enemies.some((en) => en.x > p.x && en.x < p.x + 14 && Math.abs(en.y - p.y) < 1.4);
    } else {
      held = input.jump || input.pending; input.pending = false;
      fire = input.fire;
    }
    sim.step(held, fire);
    G.camX = sim.p.x;
    if (sim.events.length) drain(sim, quiet);
  }

  function runSim(dt) {
    sfxBudget = Math.min(3, sfxBudget + dt * 14);
    G.acc += dt;
    let n = 0;
    while (G.acc >= K.DT && n < 60) { stepOnce(false); G.acc -= K.DT; n++; if (G.sim.dead || G.sim.won) break; }
    if (n >= 60) G.acc = 0;
  }

  /* ------------------------------ main loop ------------------------------ */
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (ts - (G.last || ts)) / 1000);
    G.last = ts; G.time += dt;
    const sim = G.sim;
    if (sim) {
      const running = (G.mode === 'play' || (G.mode === 'title' && G.bg) || G.mode === 'complete') && !G.freeze;
      if (G.mode === 'play' || G.mode === 'title') {
        if (running) runSim(dt);
      }
      if (G.mode === 'play') {
        if (sim.dead) { G.deadT -= dt; if (G.deadT <= 0) { G.attempt++; resetRun(false); } }
        else if (sim.won && G.winT > 0) { G.winT -= dt; if (G.winT <= 0) showComplete(); }
      } else if (G.mode === 'title' && G.bg) {
        if (sim.dead) { G.deadT -= dt; if (G.deadT <= 0) startBg(); }
        else if (sim.won) { G.winT -= dt; if (G.winT <= 0) startBg(); }
      }
    }
    if (G.mode !== 'pause') renderer.update(dt);
    if (!save.shake) renderer.shake = 0;
    if (sim) {
      const best = G.L ? (save.best[G.L.id] || 0) : 0;
      renderer.render({
        sim, L: G.L, camX: G.camX, time: G.time, checkpoints: G.practice ? G.checkpoints : null, practice: G.practice && G.mode !== 'title',
        demo: G.demo && !G.demoOnly, noHud: G.demoOnly && G.mode !== 'play', hidePlayer: G.hidePlayer, sampleTrail: G.mode !== 'pause', dtFrame: dt,
        attemptText: G.demoOnly ? '' : 'ATTEMPT ' + G.attempt, bestPct: G.demoOnly ? 0 : best,
        coinsKept: G.L ? save.coins[G.L.id] : null,
        touchUI: $('#hudbtns').classList.contains('on'),
        hintFire: !G.demoOnly && G.attempt <= 2 && sim.p.x > 12 && sim.p.x < 70 && save.attempts.boot == null,
      });
    } else {
      const ctx = renderer.ctx; ctx.setTransform(renderer.scale, 0, 0, renderer.scale, 0, 0);
      ctx.fillStyle = '#070a14'; ctx.fillRect(0, 0, W, H);
    }
  }

  /* ------------------------------ title wave ------------------------------ */
  (function wave() {
    const el = $('#sinePath'); let t = 0;
    function tick() {
      t += 0.03; let d = '';
      for (let x = 0; x <= 400; x += 5) d += (x ? 'L' : 'M') + x + ' ' + (20 + 13 * Math.sin(x / 28 + t) * Math.cos(x / 90 - t * 0.5)).toFixed(1);
      el.setAttribute('d', d); requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ------------------------------ boot ------------------------------ */
  $('#loading').remove();
  const auto = params.get('autoplay');
  if (auto) {
    // developer / screenshot mode: ?autoplay=<levelId>&seek=<seconds>&freeze=1
    G.def = TS.DEFS.find((d) => d.id === auto) || TS.DEFS[0];
    G.L = TS.getLevel(G.def.id);
    G.mode = 'play'; G.bg = false; G.demo = true; G.demoOnly = false; G.attempt = 1;
    G.demoTog = (TS.SOLUTIONS && TS.SOLUTIONS[G.def.id]) || []; G.demoIdx = 0; G.demoHeld = false;
    G.sim = newSim(); G.camX = 0;
    show('none');
    const seek = +(params.get('seek') || 0);
    for (let i = 0; i < seek * 240 && !G.sim.dead && !G.sim.won; i++) stepOnce(true);
    G.sim.events.length = 0;
    G.freeze = params.get('freeze') === '1';
    document.title = 'Trig Sprint — ' + (G.sim.dead ? 'dead@' : 'ok@') + G.sim.p.x.toFixed(1) + ' ' + G.sim.p.mode + ' g' + G.sim.p.gdir;
  } else {
    show('title');
    startBg();
  }
  requestAnimationFrame(frame);
  if (params.get('selftest')) { // developer UI self-test (see tools/selftest.js)
    const s = document.createElement('script'); s.src = 'tools/selftest.js'; document.body.appendChild(s);
  }
})();

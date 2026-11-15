/* Lock Buster — rendering, touch input and the game loop. */
(function () {
  'use strict';

  const LB = window.LB;
  const { core, audio, content } = LB;
  const C = core.CONFIG;
  const { clamp, mod } = core;

  const $ = (id) => document.getElementById(id);
  const canvas = $('stage');
  const ctx = canvas.getContext('2d');

  const TAU = Math.PI * 2;
  const NUM = C.DIAL_SIZE;
  const STEP = TAU / NUM; // radians per dial number

  const COL = {
    ink: '#1a0b3d',
    cream: '#fff4d6',
    yellow: '#ffd23f',
    pink: '#ff4f9a',
    teal: '#2ee6d0',
    green: '#3ddc84',
    red: '#ff4455',
    purple: '#2b1560',
    lcd: '#7cffb2',
  };
  const FONT = '"Arial Rounded MT Bold","Trebuchet MS","Segoe UI",system-ui,sans-serif';
  const MONO = 'ui-monospace,Consolas,Menlo,"Courier New",monospace';

  let W = 0, H = 0, dpr = 1;
  const L = {}; // layout, recomputed on resize

  // ---- State -----------------------------------------------------------------
  const params = new URLSearchParams(location.search);
  const fixedSeed = params.get('seed');

  const G = {
    mode: 'menu', // menu | playing | over
    t: 0, // animation clock (always running)
    timeLeft: C.startTime,
    score: 0,
    dispScore: 0,
    streak: 0,
    bestStreak: 0,
    locks: 0,
    fastest: Infinity,
    loot: [],
    n: 0,
    rng: null,
    cur: null,
    leaving: [],
    parts: [],
    pops: [],
    shake: 0,
    redFlash: 0,
    hbT: 0,
    overT: 0,
    overShown: false,
    hist: { dials: 0, last: [] }, // run history handed to core.makeLock
    best: loadBest(),
  };

  function loadBest() {
    try { return +localStorage.getItem('lockbuster.best') || 0; } catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem('lockbuster.best', String(v)); } catch (e) {}
  }

  // ---- Helpers ---------------------------------------------------------------
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);

  let lastBuzz = 0;
  function buzz(p) {
    try {
      if (!navigator.vibrate) return;
      const now = performance.now();
      if (Array.isArray(p) || now - lastBuzz > 28) {
        navigator.vibrate(p);
        lastBuzz = now;
      }
    } catch (e) {}
  }

  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(str, x, y, size, fill, opts) {
    opts = opts || {};
    ctx.font = (opts.font || '900 ' + size + 'px ' + FONT).replace('{s}', size);
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.base || 'middle';
    if (opts.stroke !== false) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = opts.lw || Math.max(3, size / 6);
      ctx.strokeStyle = opts.stroke || COL.ink;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
  }

  // Circular arrow: 'R' = clockwise, 'L' = counter-clockwise.
  function circArrow(x, y, r, dir, color, lw) {
    ctx.save();
    ctx.translate(x, y);
    if (dir === 'L') ctx.scale(-1, 1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    const a0 = -Math.PI * 0.9;
    const a1 = Math.PI * 0.25;
    ctx.beginPath();
    ctx.arc(0, 0, r, a0, a1, false);
    ctx.stroke();
    const tx = Math.cos(a1) * r, ty = Math.sin(a1) * r;
    const gx = -Math.sin(a1), gy = Math.cos(a1);
    const nx = Math.cos(a1), ny = Math.sin(a1);
    const hl = lw * 2.4, hw = lw * 2;
    ctx.beginPath();
    ctx.moveTo(tx + gx * hl, ty + gy * hl);
    ctx.lineTo(tx + nx * hw, ty + ny * hw);
    ctx.lineTo(tx - nx * hw, ty - ny * hw);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---- Layout ----------------------------------------------------------------
  function layout() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const hudBottom = $('hud').getBoundingClientRect().bottom;
    L.noteY = hudBottom + 6;
    L.areaTop = hudBottom + 120;
    L.areaBottom = H - 14;
    const avail = Math.max(220, L.areaBottom - L.areaTop);
    L.cx = W / 2;
    L.cy = L.areaTop + avail / 2;

    // dial
    L.dialR = Math.max(90, Math.min((W - 28) / 2, (avail - 24) / 2, 225));

    // keypad
    L.bh = Math.min(avail, 480);
    L.bw = Math.min(W - 28, L.bh * 0.8, 380);
    L.bx = L.cx - L.bw / 2;
    L.by = L.cy - L.bh / 2;
    const p = L.bw * 0.07;
    const gap = L.bw * 0.04;
    const dispH = L.bh * 0.15;
    const ky0 = L.by + p + dispH + p;
    const kb = L.by + L.bh - p;
    const kw = (L.bw - 2 * p - 2 * gap) / 3;
    const kh = (kb - ky0 - 3 * gap) / 4;
    const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', ''];
    L.kp = {
      p, gap,
      dispX: L.bx + p, dispY: L.by + p, dispW: L.bw - 2 * p, dispH,
      keys: labels.map((label, i) => ({
        label,
        x: L.bx + p + (i % 3) * (kw + gap),
        y: ky0 + Math.floor(i / 3) * (kh + gap),
        w: kw,
        h: kh,
      })),
    };
  }

  // ---- Locks -----------------------------------------------------------------
  // Barrel-lock geometry: a row of vertical digit wheels, 3 digits visible per wheel.
  function barrelGeom(count) {
    const bw = Math.min(W - 28, 380);
    const p = bw * 0.06;
    const gap = bw * 0.025;
    const ww = (bw - 2 * p - (count - 1) * gap) / count;
    const maxH = L.areaBottom - L.areaTop - 2 * p - 6;
    const cell = Math.max(40, Math.min(ww * 1.25, 110, maxH / 3));
    const wh = cell * 3;
    const bh = wh + 2 * p;
    const bx = L.cx - bw / 2;
    const by = L.cy - bh / 2;
    return {
      bx, by, bw, bh, p, cell,
      cols: Array.from({ length: count }, (_, i) => ({ x: bx + p + i * (ww + gap), y: by + p, w: ww, h: wh })),
    };
  }

  function spawnLock() {
    const spec = core.makeLock(G.rng, G.n, G.hist);
    G.n++;
    G.cur = {
      spec,
      type: spec.type,
      born: G.t,
      startT: G.t + 0.15,
      mistakes: 0,
      lockedUntil: 0,
      done: false,
      doneT: 0,
      // keypad
      entered: [],
      pressed: null,
      wrongT: 0,
      // dial
      pos: 0,
      step: 0,
      drag: null,
      lastDir: null,
      inZone: false,
      stepT: -9,
      // barrel
      wheels: spec.type === 'barrel' ? spec.start.map((d) => ({ v: d, vel: 0, drag: null })) : null,
    };

    // Onboarding: never change the rules silently.
    if (spec.type === 'dial' && spec.dialIndex === 0) {
      pop('Line the green dot up', L.cx, L.cy - L.dialR * 0.62, { size: 22, color: '#fff', life: 3, vy: -6 });
      pop('with the red marker!', L.cx, L.cy - L.dialR * 0.62 + 26, { size: 22, color: '#fff', life: 3, vy: -6 });
    } else if (spec.type === 'dial' && spec.dialIndex === 3) {
      pop('TRAINING WHEELS OFF!', L.cx, L.cy - L.dialR * 0.62, { size: 30, color: COL.pink, life: 2.4, vy: -6 });
      pop('(the green dot is gone. good luck)', L.cx, L.cy - L.dialR * 0.62 + 28, { size: 16, color: '#fff', life: 2.4, vy: -6 });
    }
  }

  function inputActive(lk) {
    return G.mode === 'playing' && lk && !lk.done && G.t - lk.born > 0.15 && G.t >= lk.lockedUntil;
  }

  function wrongEntry(lk, penalty, msg) {
    lk.mistakes++;
    G.streak = 0;
    G.timeLeft = Math.max(0, G.timeLeft - penalty);
    G.shake = 14;
    G.redFlash = 0.55;
    audio.wrong();
    buzz([40, 30, 50]);
    pop(msg, L.cx, L.cy - 10, { size: 30, color: '#ff8a96', life: 1.1 });
    pop('-' + penalty + 's', L.cx, L.cy + 28, { size: 26, color: COL.red, life: 1.0 });
  }

  function unlock(lk) {
    const spec = lk.spec;
    const elapsed = Math.max(0.2, G.t - lk.startT);
    const clean = lk.mistakes === 0;
    const bonus = core.timeBonus(spec.par, elapsed, spec.n);
    if (clean) G.streak++;
    G.bestStreak = Math.max(G.bestStreak, G.streak);
    const sc = core.scoreLock(spec, elapsed, clean, G.streak);

    G.timeLeft = Math.min(C.maxTime, G.timeLeft + bonus.total);
    G.score += sc.points;
    G.locks++;
    G.fastest = Math.min(G.fastest, elapsed);
    G.loot.push(spec.loot);

    lk.done = true;
    lk.doneT = G.t;
    G.leaving.push(lk);

    // juice
    audio.unlock(G.streak);
    buzz([20, 40, 30]);
    confetti(L.cx, L.cy, 34 + Math.min(G.streak, 10) * 3);
    const streakMsg = clean && content.STREAK[G.streak];
    const quip = streakMsg || (sc.speedMult > 2.2 ? rand(content.UNLOCK_FAST) : rand(content.UNLOCK));
    pop(quip, L.cx, L.cy - 24, { size: 38, color: COL.yellow, life: 0.95 });
    pop('LOOT: ' + spec.loot, L.cx, L.cy + 14, { size: 17, color: '#fff', life: 0.95, vy: -30 });
    pop('+' + bonus.total.toFixed(1) + 's', L.cx - W * 0.22, L.cy + 52, { size: 24, color: COL.teal, life: 0.95 });
    pop('+' + sc.points, L.cx + W * 0.22, L.cy + 52, { size: 24, color: COL.yellow, life: 0.95 });
    bumpEl($('score'));
    bumpEl($('time'));
    if (clean && G.streak % 3 === 0) bumpEl($('combo'));

    spawnLock();
  }

  // ---- Keypad input ------------------------------------------------------------
  function keypadDown(lk, p) {
    const kp = L.kp;
    const slop = kp.gap / 2;
    for (let i = 0; i < kp.keys.length; i++) {
      const k = kp.keys[i];
      if (!k.label) continue;
      if (p.x >= k.x - slop && p.x <= k.x + k.w + slop && p.y >= k.y - slop && p.y <= k.y + k.h + slop) {
        lk.pressed = { i, t: G.t };
        if (k.label === 'DEL') {
          if (lk.entered.length) {
            lk.entered.pop();
            audio.key(2);
            buzz(8);
          }
        } else {
          const d = +k.label;
          lk.entered.push(d);
          audio.key(d);
          buzz(10);
          if (lk.entered.length === lk.spec.code.length) submitKeypad(lk);
        }
        return;
      }
    }
  }

  function submitKeypad(lk) {
    const ok = lk.spec.code.every((d, i) => d === lk.entered[i]);
    if (ok) {
      unlock(lk);
    } else {
      lk.wrongT = G.t;
      lk.lockedUntil = G.t + 0.3;
      wrongEntry(lk, C.wrongPenalty, rand(content.WRONG));
    }
  }

  // ---- Dial input ----------------------------------------------------------------
  function dialDown(lk, p, id) {
    const dx = p.x - L.cx, dy = p.y - L.cy;
    if (Math.hypot(dx, dy) > L.dialR * 1.35) return;
    lk.drag = { id, ang: Math.atan2(dy, dx), startPos: lk.pos };
    try { canvas.setPointerCapture(id); } catch (e) {}
  }

  function dialMove(lk, p) {
    const d = lk.drag;
    if (!d) return;
    const dx = p.x - L.cx, dy = p.y - L.cy;
    if (Math.hypot(dx, dy) < L.dialR * 0.12) return; // too close to the middle to read an angle
    const ang = Math.atan2(dy, dx);
    let da = ang - d.ang;
    if (da > Math.PI) da -= TAU;
    else if (da < -Math.PI) da += TAU;
    d.ang = ang;

    const prev = lk.pos;
    lk.pos += da / STEP;
    if (Math.floor(prev) !== Math.floor(lk.pos)) {
      audio.tick();
      buzz(5);
    }

    const st = lk.spec.steps[lk.step];
    const inZone = core.circDist(lk.pos, st.n) <= lk.spec.tol;
    if (inZone && !lk.inZone) {
      audio.zone();
      buzz([12, 20, 12]);
    }
    lk.inZone = inZone;
  }

  function dialUp(lk) {
    const d = lk.drag;
    if (!d) return;
    lk.drag = null;
    const net = lk.pos - d.startPos;
    if (Math.abs(net) >= 4) lk.lastDir = net > 0 ? 'R' : 'L';

    const st = lk.spec.steps[lk.step];
    if (core.circDist(lk.pos, st.n) > lk.spec.tol) return; // lifted off-target: just re-grip, no penalty

    if (lk.lastDir && lk.lastDir !== st.dir) {
      lk.lastDir = null;
      wrongEntry(lk, C.wrongWayPenalty, rand(content.WRONG_WAY));
      return;
    }
    // locked in!
    lk.step++;
    lk.stepT = G.t;
    lk.lastDir = null;
    lk.inZone = false;
    audio.step();
    buzz(28);
    if (lk.step >= lk.spec.steps.length) unlock(lk);
  }

  // ---- Barrel input ---------------------------------------------------------------
  // Each wheel follows a finger 1:1 (two thumbs can work two wheels at once),
  // then coasts a little and snaps to the nearest digit.
  const BD = C.BARREL_DIGITS;

  function barrelDown(lk, p, id) {
    const g = barrelGeom(lk.wheels.length);
    if (p.y < g.by - 10 || p.y > g.by + g.bh + 10) return;
    for (let i = 0; i < g.cols.length; i++) {
      const c = g.cols[i];
      const slop = g.p * 0.5;
      if (p.x >= c.x - slop && p.x <= c.x + c.w + slop) {
        const w = lk.wheels[i];
        if (w.drag) return;
        w.drag = { id, lastY: p.y, samples: [{ t: performance.now(), v: w.v }] };
        w.vel = 0;
        try { canvas.setPointerCapture(id); } catch (e) {}
        return;
      }
    }
  }

  function barrelMove(lk, id, p) {
    const w = lk.wheels.find((w) => w.drag && w.drag.id === id);
    if (!w) return;
    const g = barrelGeom(lk.wheels.length);
    const prev = w.v;
    w.v += -(p.y - w.drag.lastY) / g.cell; // drag up => higher digits scroll into view
    w.drag.lastY = p.y;
    if (Math.floor(prev) !== Math.floor(w.v)) {
      audio.tick();
      buzz(5);
    }
    const now = performance.now();
    w.drag.samples.push({ t: now, v: w.v });
    while (w.drag.samples.length > 2 && now - w.drag.samples[0].t > 100) w.drag.samples.shift();
  }

  function barrelUp(lk, id) {
    const w = lk.wheels.find((w) => w.drag && w.drag.id === id);
    if (!w) return;
    const s = w.drag.samples;
    const now = performance.now();
    const dt = (now - s[0].t) / 1000;
    w.vel = dt > 0.02 && now - s[s.length - 1].t < 80 ? clamp((w.v - s[0].v) / dt, -30, 30) : 0;
    w.drag = null;
  }

  function updateBarrel(lk, dt) {
    const target = lk.spec.code;
    lk.wheels.forEach((w) => {
      if (w.drag) return;
      const prev = w.v;
      if (Math.abs(w.vel) > 2.5) {
        w.v += w.vel * dt; // coast
        w.vel *= Math.exp(-9 * dt);
      } else {
        w.vel = 0;
        w.v += (Math.round(w.v) - w.v) * Math.min(1, dt * 22); // settle onto a digit
        if (Math.abs(Math.round(w.v) - w.v) < 0.01) w.v = Math.round(w.v);
      }
      if (Math.floor(prev) !== Math.floor(w.v)) {
        audio.tick();
        buzz(5);
      }
    });
    // opens as soon as every wheel is settled on its digit
    const ok = lk.wheels.every(
      (w, i) => !w.drag && w.vel === 0 && Math.abs(w.v - Math.round(w.v)) < 0.08 && mod(Math.round(w.v), BD) === target[i]
    );
    if (ok && inputActive(lk)) unlock(lk);
  }

  // ---- Pointer wiring ------------------------------------------------------------
  const pt = (e) => ({ x: e.clientX, y: e.clientY });

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    audio.resume();
    const lk = G.cur;
    if (!inputActive(lk)) return;
    if (lk.type === 'keypad') keypadDown(lk, pt(e));
    else if (lk.type === 'barrel') barrelDown(lk, pt(e), e.pointerId);
    else dialDown(lk, pt(e), e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    e.preventDefault();
    const lk = G.cur;
    if (!lk || !inputActive(lk)) return;
    if (lk.type === 'dial' && lk.drag) dialMove(lk, pt(e));
    else if (lk.type === 'barrel') barrelMove(lk, e.pointerId, pt(e));
  });
  const up = (e) => {
    e.preventDefault();
    const lk = G.cur;
    if (!lk) return;
    if (lk.type === 'dial' && lk.drag) {
      if (inputActive(lk)) dialUp(lk);
      else lk.drag = null;
    } else if (lk.type === 'barrel') {
      barrelUp(lk, e.pointerId);
    }
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- Particles & pops -------------------------------------------------------------
  function confetti(x, y, n) {
    const cols = [COL.yellow, COL.pink, COL.teal, '#ffffff', COL.green];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = 150 + Math.random() * 450;
      G.parts.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 260,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 16,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 5,
        c: cols[i % cols.length],
        life: 0.8 + Math.random() * 0.6,
        age: 0,
      });
    }
  }

  function pop(str, x, y, o) {
    o = o || {};
    G.pops.push({
      text: str, x, y,
      size: o.size || 26,
      color: o.color || COL.yellow,
      life: o.life || 0.9,
      vy: o.vy === undefined ? -55 : o.vy,
      age: 0,
    });
  }

  function bumpEl(el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  // ---- Drawing: note + owner ------------------------------------------------------
  function drawNote(lk) {
    const spec = lk.spec;
    const nw = Math.min(W - 28, 360);
    const nh = 64;
    const ny = L.noteY + 24;

    // owner label, shrunk to fit
    let size = 16;
    ctx.font = '900 ' + size + 'px ' + FONT;
    const maxW = W - 28;
    const label = spec.owner;
    const wMeasured = ctx.measureText(label).width;
    if (wMeasured > maxW) size = Math.max(11, Math.floor((size * maxW) / wMeasured));
    text(label, W / 2, L.noteY + 11, size, '#fff', { lw: 4 });

    ctx.save();
    ctx.translate(W / 2, ny + nh / 2);
    ctx.rotate(-0.022);
    ctx.fillStyle = 'rgba(15,0,50,.35)';
    rr(-nw / 2 + 3, -nh / 2 + 6, nw, nh, 8);
    ctx.fill();
    ctx.fillStyle = '#ffe55c';
    rr(-nw / 2, -nh / 2, nw, nh, 8);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = COL.ink;
    ctx.stroke();
    // tape
    ctx.save();
    ctx.rotate(0.05);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillRect(-28, -nh / 2 - 9, 56, 16);
    ctx.restore();

    if (lk.type === 'keypad' || lk.type === 'barrel') {
      const len = spec.code.length;
      const spacing = Math.min(50, (nw - 30) / len);
      const fs = Math.min(46, spacing * 0.95);
      for (let i = 0; i < len; i++) {
        const x = (i - (len - 1) / 2) * spacing;
        // keypad: dim digits you've already typed. barrel: dim digits whose wheel already matches.
        const done =
          lk.type === 'keypad' ? i < lk.entered.length : mod(Math.round(lk.wheels[i].v), BD) === spec.code[i];
        const cursor = lk.type === 'keypad' && i === lk.entered.length && !lk.done;
        ctx.font = '900 ' + fs + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = done ? 'rgba(26,11,61,.28)' : COL.ink;
        ctx.fillText(String(spec.code[i]), x, 2);
        if (cursor) {
          ctx.fillStyle = COL.pink;
          ctx.fillRect(x - fs * 0.3, nh / 2 - 12, fs * 0.6, 5);
        }
      }
    } else {
      const steps = spec.steps;
      const cell = (nw - 16) / steps.length;
      steps.forEach((st, i) => {
        const cx = (i - (steps.length - 1) / 2) * cell;
        const isDone = i < lk.step;
        const isCur = i === lk.step && !lk.done;
        const fs = isCur ? 34 : 28;
        const col = isDone ? '#1f9d55' : COL.ink;
        ctx.save();
        ctx.globalAlpha = isDone ? 0.55 : isCur ? 1 : 0.7;
        ctx.font = '900 ' + fs + 'px ' + FONT;
        const tw = ctx.measureText(String(st.n)).width;
        const arrowW = 24;
        const total = tw + 6 + arrowW;
        const x0 = cx - total / 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = col;
        ctx.fillText(String(st.n), x0, 2);
        circArrow(x0 + tw + 6 + arrowW / 2, 2, 8, st.dir, isCur ? COL.pink : col, 3.2);
        if (isDone) {
          ctx.strokeStyle = '#1f9d55';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(cx - total / 2 - 2, 4);
          ctx.lineTo(cx + total / 2 + 2, 4);
          ctx.stroke();
        }
        ctx.restore();
        if (isCur) {
          ctx.fillStyle = COL.pink;
          ctx.fillRect(cx - total / 2, nh / 2 - 11, total, 4);
        }
      });
    }
    ctx.restore();

    if (!lk.done) drawBonusMeter(lk, nw, ny + nh);
  }

  // Live "time you'd earn if you finished right now". It drains while you dither,
  // so every single lock has its own little deadline.
  function drawBonusMeter(lk, nw, noteBottom) {
    const elapsed = Math.max(0, G.t - lk.startT);
    const b = core.timeBonus(lk.spec.par, elapsed, lk.spec.n);
    const frac = clamp((b.total - C.minBonus) / Math.max(0.01, b.max - C.minBonus), 0, 1);
    const empty = frac <= 0.001;
    const col = frac > 0.5 ? COL.teal : frac > 0.2 ? COL.yellow : COL.red;
    const bw = Math.min(nw * 0.62, 220), bh = 9;
    const y = noteBottom + 15;
    const x = L.cx - (bw + 62) / 2;
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    rr(x, y - bh / 2, bw, bh, 5);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = COL.ink;
    ctx.stroke();
    if (!empty) {
      ctx.fillStyle = col;
      rr(x + 1, y - bh / 2 + 1, Math.max(6, (bw - 2) * frac), bh - 2, 4);
      ctx.fill();
    }
    const pulse = empty ? 1 + Math.sin(G.t * 16) * 0.06 : 1;
    text('+' + b.total.toFixed(1) + 's', x + bw + 8, y + 1, 15 * pulse, empty ? COL.red : '#fff', { align: 'left', lw: 4 });
  }

  // ---- Drawing: keypad --------------------------------------------------------------
  function drawKeypad(lk) {
    const { bx, by, bw, bh, kp } = L;
    ctx.fillStyle = 'rgba(15,0,50,.4)';
    rr(bx, by + 10, bw, bh, 28);
    ctx.fill();

    const g = ctx.createLinearGradient(0, by, 0, by + bh);
    g.addColorStop(0, '#35e0d0');
    g.addColorStop(1, '#0f9fb5');
    ctx.fillStyle = g;
    rr(bx, by, bw, bh, 28);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = COL.ink;
    ctx.stroke();
    // glossy highlight
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    rr(bx + 8, by + 8, bw - 16, bh * 0.12, 18);
    ctx.fill();

    // LCD
    ctx.fillStyle = '#0d2a22';
    rr(kp.dispX, kp.dispY, kp.dispW, kp.dispH, 12);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.stroke();

    const len = lk.spec.code.length;
    let str = '';
    if (lk.done) {
      str = 'OPEN';
    } else {
      for (let i = 0; i < len; i++) str += (i < lk.entered.length ? lk.entered[i] : '_') + (i < len - 1 ? ' ' : '');
    }
    let fs = kp.dispH * 0.62;
    ctx.font = '900 ' + fs + 'px ' + MONO;
    const tw = ctx.measureText(str).width;
    if (tw > kp.dispW - 24) fs = (fs * (kp.dispW - 24)) / tw;
    const wrong = lk.wrongT && G.t - lk.wrongT < 0.3;
    ctx.font = '900 ' + fs + 'px ' + MONO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = wrong ? '#ff6b6b' : COL.lcd;
    ctx.shadowColor = wrong ? '#ff6b6b' : COL.lcd;
    ctx.shadowBlur = 10;
    ctx.fillText(str, kp.dispX + kp.dispW / 2, kp.dispY + kp.dispH / 2 + 2);
    ctx.shadowBlur = 0;

    // keys
    kp.keys.forEach((k, i) => {
      if (!k.label) {
        // little blinking LED where the 12th key would be
        const on = Math.floor(G.t * 2) % 2 === 0;
        ctx.fillStyle = on ? COL.red : '#7a1e2b';
        ctx.beginPath();
        ctx.arc(k.x + k.w / 2, k.y + k.h / 2, Math.min(k.w, k.h) * 0.12, 0, TAU);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
        return;
      }
      const pressed = lk.pressed && lk.pressed.i === i && G.t - lk.pressed.t < 0.1;
      const off = pressed ? 5 : 0;
      ctx.fillStyle = COL.ink;
      rr(k.x, k.y + 6, k.w, k.h, 14);
      ctx.fill();
      ctx.fillStyle = k.label === 'DEL' ? '#ff8cc0' : pressed ? '#ffe08a' : COL.cream;
      rr(k.x, k.y + off, k.w, k.h, 14);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = COL.ink;
      ctx.stroke();

      const cx = k.x + k.w / 2, cy = k.y + k.h / 2 + off;
      if (k.label === 'DEL') {
        const s = Math.min(k.w, k.h) * 0.22;
        ctx.strokeStyle = COL.ink;
        ctx.fillStyle = COL.ink;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + s, cy);
        ctx.lineTo(cx - s, cy);
        ctx.moveTo(cx - s * 0.1, cy - s * 0.9);
        ctx.lineTo(cx - s, cy);
        ctx.lineTo(cx - s * 0.1, cy + s * 0.9);
        ctx.stroke();
      } else {
        ctx.font = '900 ' + Math.min(k.h * 0.6, 40) + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COL.ink;
        ctx.fillText(k.label, cx, cy + 2);
      }
    });

    if (lk.done) {
      ctx.fillStyle = 'rgba(61,220,132,.38)';
      rr(bx, by, bw, bh, 28);
      ctx.fill();
    }
  }

  // ---- Drawing: barrel wheels ---------------------------------------------------------
  function drawBarrel(lk) {
    const g = barrelGeom(lk.wheels.length);
    const { bx, by, bw, bh, cell } = g;

    ctx.fillStyle = 'rgba(15,0,50,.4)';
    rr(bx, by + 10, bw, bh, 26);
    ctx.fill();
    const bg = ctx.createLinearGradient(0, by, 0, by + bh);
    bg.addColorStop(0, '#ff8a5b');
    bg.addColorStop(1, '#e0482b');
    ctx.fillStyle = bg;
    rr(bx, by, bw, bh, 26);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = COL.ink;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    rr(bx + 8, by + 6, bw - 16, g.p * 0.5, 8);
    ctx.fill();

    g.cols.forEach((c, i) => {
      const w = lk.wheels[i];
      const code = lk.spec.code[i];
      const match = mod(Math.round(w.v), BD) === code;
      const midY = c.y + c.h / 2;

      ctx.save();
      rr(c.x, c.y, c.w, c.h, 14);
      ctx.clip();
      // cylinder shading: bright in the middle, dark toward the top/bottom edges
      const cg = ctx.createLinearGradient(0, c.y, 0, c.y + c.h);
      cg.addColorStop(0, '#b9a98a');
      cg.addColorStop(0.28, COL.cream);
      cg.addColorStop(0.5, match ? '#d4ffe4' : '#ffffff');
      cg.addColorStop(0.72, COL.cream);
      cg.addColorStop(1, '#b9a98a');
      ctx.fillStyle = cg;
      ctx.fillRect(c.x, c.y, c.w, c.h);

      const base = Math.floor(w.v);
      const fs = Math.min(cell * 0.72, c.w * 0.85);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let k = base - 2; k <= base + 3; k++) {
        const off = k - w.v; // in cells, 0 = centered
        const y = midY + off * cell;
        const near = Math.abs(off);
        if (near > 1.8) continue;
        const sc = 1 - Math.min(0.35, near * 0.22);
        ctx.save();
        ctx.translate(c.x + c.w / 2, y);
        ctx.scale(1, sc); // squash toward the edges like a rolling drum
        ctx.font = '900 ' + fs + 'px ' + FONT;
        const centered = near < 0.5;
        ctx.fillStyle = centered && match ? '#1f9d55' : COL.ink;
        ctx.globalAlpha = Math.max(0.25, 1 - near * 0.55);
        ctx.fillText(String(mod(k, BD)), 0, 2);
        ctx.restore();
      }
      ctx.restore();

      // window frame + center band
      ctx.lineWidth = 4;
      ctx.strokeStyle = COL.ink;
      rr(c.x, c.y, c.w, c.h, 14);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = match ? COL.green : COL.pink;
      ctx.beginPath();
      ctx.moveTo(c.x + 4, midY - cell / 2);
      ctx.lineTo(c.x + c.w - 4, midY - cell / 2);
      ctx.moveTo(c.x + 4, midY + cell / 2);
      ctx.lineTo(c.x + c.w - 4, midY + cell / 2);
      ctx.stroke();
    });

    if (lk.done) {
      ctx.fillStyle = 'rgba(61,220,132,.38)';
      rr(bx, by, bw, bh, 26);
      ctx.fill();
    }
  }

  // ---- Drawing: dial ------------------------------------------------------------------
  function drawDial(lk) {
    const cx = L.cx, cy = L.cy, R = L.dialR;
    const spec = lk.spec;
    const fr = R * 0.86; // rotating face radius
    const st = spec.steps[Math.min(lk.step, spec.steps.length - 1)];

    // shadow
    ctx.fillStyle = 'rgba(15,0,50,.4)';
    ctx.beginPath();
    ctx.arc(cx, cy + 10, R, 0, TAU);
    ctx.fill();

    // brass body
    const bg = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    bg.addColorStop(0, '#fff2ad');
    bg.addColorStop(0.5, '#f7b92e');
    bg.addColorStop(1, '#c4801a');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = COL.ink;
    ctx.stroke();

    // face
    ctx.fillStyle = COL.cream;
    ctx.beginPath();
    ctx.arc(cx, cy, fr, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.stroke();

    // rotating numbers + ticks
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(lk.pos * STEP);
    ctx.fillStyle = COL.ink;
    ctx.strokeStyle = COL.ink;
    for (let n = 0; n < NUM; n++) {
      ctx.save();
      ctx.rotate(-n * STEP);
      const major = n % 5 === 0;
      ctx.lineWidth = major ? 3.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -fr + 5);
      ctx.lineTo(0, -fr + (major ? 22 : 12));
      ctx.stroke();
      if (major) {
        ctx.font = '900 ' + fr * 0.13 + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n), 0, -fr + 38);
      }
      ctx.restore();
    }
    // assist: the target number glows green on the dial face (early locks only)
    if (spec.assist && !lk.done) {
      ctx.save();
      ctx.rotate(-st.n * STEP);
      ctx.fillStyle = COL.green;
      ctx.strokeStyle = COL.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -fr + 62, fr * 0.055, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // in-zone glow
    if (lk.inZone && !lk.done) {
      ctx.strokeStyle = COL.green;
      ctx.lineWidth = 7 + Math.sin(G.t * 18) * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, fr + 2, 0, TAU);
      ctx.stroke();
    }

    // marker (fixed, at the top)
    ctx.fillStyle = COL.red;
    ctx.strokeStyle = COL.ink;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - R - 12);
    ctx.lineTo(cx + 15, cy - R - 12);
    ctx.lineTo(cx, cy - fr + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // center cap with live readout
    const capR = R * 0.42;
    ctx.fillStyle = COL.purple;
    ctx.beginPath();
    ctx.arc(cx, cy, capR, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = COL.yellow;
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = COL.ink;
    ctx.beginPath();
    ctx.arc(cx, cy, capR + 4, 0, TAU);
    ctx.stroke();

    if (lk.done) {
      text('OPEN!', cx, cy, capR * 0.62, COL.green, { lw: 5 });
    } else {
      const val = mod(Math.round(lk.pos), NUM);
      text(String(val), cx, cy - capR * 0.14, capR * 0.9, lk.inZone ? COL.green : '#fff', { lw: 6 });
      circArrow(cx, cy + capR * 0.52, capR * 0.2, st.dir, COL.yellow, 4);
    }

    // brief flash when a step locks in
    const since = G.t - lk.stepT;
    if (since < 0.25 && !lk.done) {
      ctx.fillStyle = 'rgba(61,220,132,' + 0.35 * (1 - since / 0.25) + ')';
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
    }
    if (lk.done) {
      ctx.fillStyle = 'rgba(61,220,132,.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
    }
  }

  function drawEntity(lk) {
    let ox = 0, rot = 0, alpha = 1;
    if (lk.done) {
      const u = clamp((G.t - lk.doneT) / 0.42, 0, 1);
      const e = u * u;
      ox = -e * W * 1.1;
      rot = -e * 0.35;
      alpha = 1 - u * 0.6;
    } else {
      const p = clamp((G.t - lk.born) / 0.22, 0, 1);
      ox = (1 - easeOutCubic(p)) * W * 0.8;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(L.cx + ox, L.cy);
    ctx.rotate(rot);
    ctx.translate(-L.cx, -L.cy);
    drawNote(lk);
    if (lk.type === 'keypad') drawKeypad(lk);
    else if (lk.type === 'barrel') drawBarrel(lk);
    else drawDial(lk);
    ctx.restore();
  }

  // ---- Frame ----------------------------------------------------------------------------
  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (G.mode === 'menu') return;

    ctx.save();
    if (G.shake > 0) ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);

    G.leaving.forEach(drawEntity);
    if (G.cur) drawEntity(G.cur);

    // particles
    G.parts.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = clamp(1 - p.age / p.life, 0, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    // floating text
    G.pops.forEach((p) => {
      const k = p.age / p.life;
      ctx.save();
      ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      const s = p.size * (k < 0.12 ? 0.6 + (k / 0.12) * 0.55 : 1.15 - Math.min(0.15, (k - 0.12) * 0.3));
      text(p.text, p.x, p.y + p.vy * p.age, s, p.color);
      ctx.restore();
    });
    ctx.restore();

    // red flash on mistakes
    if (G.redFlash > 0) {
      ctx.fillStyle = 'rgba(255,30,70,' + G.redFlash * 0.5 + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function updateHud(dt) {
    G.dispScore += (G.score - G.dispScore) * Math.min(1, dt * 10);
    if (Math.abs(G.score - G.dispScore) < 1) G.dispScore = G.score;
    const tl = Math.max(0, G.timeLeft);
    const timeEl = $('time');
    timeEl.textContent = tl.toFixed(1);
    timeEl.className = 'value' + (tl < 10 ? ' low' : tl < 20 ? ' warn' : '');
    const fill = $('barfill');
    fill.style.transform = 'scaleX(' + clamp(tl / C.maxTime, 0, 1) + ')';
    fill.className = tl < 10 ? 'low' : tl < 20 ? 'warn' : '';
    $('score').textContent = Math.round(G.dispScore).toLocaleString();
    const mult = core.comboMult(G.streak);
    $('combo').textContent = 'x' + mult;
    $('combo').classList.toggle('hot', mult > 1);
    $('streak').textContent = 'STREAK ' + G.streak;
  }

  function update(dt) {
    G.t += dt;

    if (G.mode === 'playing') {
      G.timeLeft -= dt;
      const lk = G.cur;
      if (lk && lk.wrongT && G.t - lk.wrongT > 0.3) {
        lk.entered = [];
        lk.wrongT = 0;
      }
      if (lk && lk.type === 'barrel' && !lk.done) updateBarrel(lk, dt);
      // heartbeat gets faster as the clock runs down
      if (G.timeLeft < 10 && G.timeLeft > 0) {
        G.hbT -= dt;
        if (G.hbT <= 0) {
          audio.heartbeat();
          buzz([35, 70, 22]);
          G.hbT = 0.45 + 0.55 * (G.timeLeft / 10);
        }
      }
      document.body.classList.toggle('danger', G.timeLeft < 10);
      if (G.timeLeft <= 0) {
        G.timeLeft = 0;
        gameOver();
      }
    }

    if (G.mode === 'over' && !G.overShown && G.t - G.overT > 0.7) showOver();

    G.leaving = G.leaving.filter((lk) => G.t - lk.doneT < 0.5);
    G.parts.forEach((p) => {
      p.age += dt;
      p.vy += 1100 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    });
    G.parts = G.parts.filter((p) => p.age < p.life);
    G.pops.forEach((p) => (p.age += dt));
    G.pops = G.pops.filter((p) => p.age < p.life);
    G.shake = Math.max(0, G.shake - 60 * dt);
    G.redFlash = Math.max(0, G.redFlash - dt * 2.2);
    updateHud(dt);
  }

  let last = 0;
  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;
    try {
      update(dt);
      render();
    } catch (e) {
      // one bad frame must never freeze a whole run
      LB.lastError = e;
      if (window.console) console.error(e);
    }
    requestAnimationFrame(frame);
  }

  // ---- Flow: start / over / share ------------------------------------------------------------
  function newSeed() {
    return fixedSeed ? core.hashSeed(fixedSeed) : (Math.random() * 4294967296) >>> 0;
  }

  function startGame() {
    audio.resume();
    G.mode = 'playing';
    G.rng = core.makeRng(newSeed());
    G.n = 0;
    G.hist = { dials: 0, last: [] };
    G.timeLeft = C.startTime;
    G.score = 0;
    G.dispScore = 0;
    G.streak = 0;
    G.bestStreak = 0;
    G.locks = 0;
    G.fastest = Infinity;
    G.loot = [];
    G.leaving = [];
    G.parts = [];
    G.pops = [];
    G.shake = 0;
    G.redFlash = 0;
    G.hbT = 0;
    G.overShown = false;
    $('menu').classList.add('hidden');
    $('over').classList.add('hidden');
    document.body.classList.remove('menu');
    layout();
    spawnLock();
  }

  function gameOver() {
    G.mode = 'over';
    G.overT = G.t;
    audio.over();
    document.body.classList.remove('danger');
    if (G.cur && G.cur.drag) G.cur.drag = null;
  }

  function showOver() {
    G.overShown = true;
    const isBest = G.score > G.best;
    if (isBest) {
      G.best = G.score;
      saveBest(G.best);
    }
    $('over-title').textContent = rand(content.BUSTED_TITLES);
    $('over-quip').textContent = rand(content.BUSTED_QUIPS);
    $('over-score').textContent = G.score.toLocaleString();
    $('over-new').classList.toggle('hidden', !(isBest && G.score > 0));
    $('st-locks').textContent = G.locks;
    $('st-streak').textContent = G.bestStreak;
    $('st-fast').textContent = isFinite(G.fastest) ? G.fastest.toFixed(1) + 's' : '-';
    $('over-rank').textContent = core.rankFor(G.locks);
    $('over-haul').textContent = G.loot.length
      ? 'Haul: ' + shuffled(G.loot).slice(0, 3).join(', ') + (G.loot.length > 3 ? ' + ' + (G.loot.length - 3) + ' more' : '')
      : content.NO_HAUL;
    $('over').classList.remove('hidden');
    const retry = $('retry');
    retry.disabled = true; // so frantic last-second tapping doesn't instantly restart
    setTimeout(() => (retry.disabled = false), 650);
  }

  function shuffled(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  function showMenu() {
    G.mode = 'menu';
    G.cur = null;
    G.leaving = [];
    $('over').classList.add('hidden');
    $('menu').classList.remove('hidden');
    document.body.classList.add('menu');
    $('best-menu').textContent = G.best ? 'Best: ' + G.best.toLocaleString() : '';
  }

  async function share() {
    // when embedded at /games/lock-buster/play/, share the friendly page instead
    const url = location.origin + location.pathname.replace(/\/play\/(index\.html)?$/, '');
    const msg =
      'LOCK BUSTER: I cracked ' + G.locks + ' locks for ' + G.score.toLocaleString() +
      ' pts. Rank: ' + core.rankFor(G.locks) + '. Think you can beat me?';
    const btn = $('share');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Lock Buster', text: msg, url });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(msg + ' ' + url);
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = 'Share'), 1500);
    } catch (e) {
      window.prompt('Copy this:', msg + ' ' + url);
    }
  }

  function syncSoundBtn() {
    $('snd').textContent = 'Sound: ' + (audio.isMuted() ? 'OFF' : 'ON');
  }

  $('play').addEventListener('click', startGame);
  $('retry').addEventListener('click', startGame);
  $('to-menu').addEventListener('click', showMenu);
  $('share').addEventListener('click', share);
  $('snd').addEventListener('click', () => {
    audio.resume();
    audio.setMuted(!audio.isMuted());
    syncSoundBtn();
  });
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', () => setTimeout(layout, 100));

  layout();
  syncSoundBtn();
  showMenu();
  requestAnimationFrame(frame);

  // exposed for the dev self-test (index.html?selftest)
  LB.game = { G, L, startGame, STEP, barrelGeom };
})();

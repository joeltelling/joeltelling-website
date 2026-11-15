/* Trig Sprint — deterministic simulation core.
 * Pure logic (no DOM / audio / canvas) so it can be driven by the game loop,
 * the level-verification bot and the demo/autoplay system alike.
 *
 * Units: 1 world unit = 1 block. y = 0 is the ground, y grows upward.
 * The player's x is advanced at a constant per-level speed (blocks/second).
 */
(function () {
  const TS = (globalThis.TS = globalThis.TS || {});

  const K = {
    DT: 1 / 240,
    CEIL: 10,
    // cube
    CUBE_G: 140, CUBE_JUMP: 24.2, CUBE_FALL: 32,
    // ship
    SHIP_UP: 58, SHIP_DN: 48, SHIP_MAX: 12,
    // ball
    BALL_G: 120, BALL_FALL: 26, BALL_FLIP_V: 3,
    // ufo
    UFO_G: 90, UFO_JUMP: 17, UFO_FALL: 18,
    // orbs / pads
    ORB_Y: 23, ORB_P: 16.5, ORB_B_V: 6,
    PAD_Y: 29, PAD_P: 20, PAD_B_V: 12,
    EPS: 1e-4, TOL: 0.04,
    HB: { cube: 0.5, ship: 0.45, ball: 0.5, ufo: 0.5, wave: 0.22 }, // vs solids
    HZ: { cube: 0.28, ship: 0.25, ball: 0.28, ufo: 0.28, wave: 0.12 }, // vs hazards
    PR: { cube: 0.3, ship: 0.3, ball: 0.3, ufo: 0.3, wave: 0.2 }, // vs enemies
    SPAWN_AHEAD: 17.6,
    SPAWN_ANIM: 0.3,
    BUF: 0.1,
    BOLT_SPEED: 30,
    ORB_R: 0.85,
  };
  TS.K = K;

  /* ------------------------------------------------------------------ *
   * Level indexing (column buckets so queries are O(local objects))
   * ------------------------------------------------------------------ */
  function indexLevel(L) {
    if (L._indexed) return L;
    const n = Math.ceil(L.end) + 48;
    const mk = () => new Array(n).fill(null);
    L.solidCols = mk(); L.hazCols = mk(); L.orbCols = mk(); L.padCols = mk();
    L.coinCols = mk(); L.portalCols = mk();
    const add = (cols, i, o) => {
      if (i < 0 || i >= n) return;
      (cols[i] || (cols[i] = [])).push(o);
    };
    const span = (cols, o, x0, x1) => {
      for (let c = Math.floor(x0); c <= Math.floor(x1); c++) add(cols, c, o);
    };
    L.solids.forEach((s) => span(L.solidCols, s, s.x, s.x + s.w - 1e-6));
    L.hazards.forEach((h, i) => {
      h.id = i;
      if (h.type === 'saw') {
        h.hr = h.r * 0.82;
        span(L.hazCols, h, h.cx - h.r, h.cx + h.r);
      } else {
        // spikes: precompute AABB hit boxes
        const small = h.type === 'mini';
        const hw = small ? 0.2 : 0.15;
        const hh = small ? 0.2 : 0.3;
        h.bx = h.x + 0.5; h.hw = hw; h.hh = hh;
        h.by = h.flip ? h.y + 1 - hh : h.y + hh;
        span(L.hazCols, h, h.x, h.x + 0.999);
      }
    });
    L.orbs.forEach((o, i) => { o.id = i; span(L.orbCols, o, o.cx - 1, o.cx + 1); });
    L.pads.forEach((o, i) => { o.id = i; span(L.padCols, o, o.x, o.x + 0.999); });
    L.coins.forEach((o, i) => { o.id = i; span(L.coinCols, o, o.cx - 1, o.cx + 1); });
    L.portals.forEach((o, i) => { o.id = i; span(L.portalCols, o, o.x - 1, o.x + 1); });
    L.spawns.sort((a, b) => a.trig - b.trig);
    L._indexed = true;
    return L;
  }
  TS.indexLevel = indexLevel;

  /* ------------------------------------------------------------------ */
  class Sim {
    constructor(L, opts) {
      this.L = indexLevel(L);
      this.opts = opts || {};
      this.reset();
    }

    reset() {
      const L = this.L;
      this.tick = 0;
      this.time = 0;
      this.p = {
        x: L.startX || 0, y: 0.5, vy: 0, mode: 'cube', gdir: -1,
        onGround: true, rot: 0, spin: 0, flipT: 0,
      };
      this.dead = false;
      this.won = false;
      this.prevHeld = false;
      this.buf = 0;
      this.usedOrb = new Uint8Array(L.orbs.length);
      this.usedPad = new Uint8Array(L.pads.length);
      this.coinGot = new Uint8Array(L.coins.length);
      this.enemies = [];
      this.bolts = [];
      this.bullets = [];
      this.spawnIdx = 0;
      // skip spawns already behind the start
      while (this.spawnIdx < L.spawns.length && L.spawns[this.spawnIdx].trig < this.p.x) this.spawnIdx++;
      this.fireCd = 0; this.exIdx = 0;
      this.score = 0; this.kills = 0; this.combo = 0; this.comboT = 0;
      this.jumps = 0; this.coinCount = 0; this.shots = 0;
      this.events = [];
      this.deathCause = null;
    }

    clone() {
      const s = Object.create(Sim.prototype);
      s.L = this.L; s.opts = this.opts;
      s.copyFrom(this);
      return s;
    }

    copyFrom(o) {
      this.tick = o.tick; this.time = o.time;
      this.p = Object.assign({}, o.p);
      this.dead = o.dead; this.won = o.won;
      this.prevHeld = o.prevHeld; this.buf = o.buf;
      this.usedOrb = o.usedOrb.slice(); this.usedPad = o.usedPad.slice(); this.coinGot = o.coinGot.slice();
      this.enemies = o.enemies.map((e) => Object.assign({}, e));
      this.bolts = o.bolts.map((e) => Object.assign({}, e));
      this.bullets = o.bullets.map((e) => Object.assign({}, e));
      this.spawnIdx = o.spawnIdx; this.fireCd = o.fireCd; this.exIdx = o.exIdx;
      this.score = o.score; this.kills = o.kills; this.combo = o.combo; this.comboT = o.comboT;
      this.jumps = o.jumps; this.coinCount = o.coinCount; this.shots = o.shots;
      this.events = [];
      this.deathCause = o.deathCause;
    }

    /** Cheap key for beam-search de-duplication. */
    key() {
      const p = this.p;
      return ((p.y * 20) | 0) + '|' + ((p.vy * 2) | 0) + '|' + p.mode + p.gdir + (p.onGround ? 'g' : 'a') + (this.prevHeld ? 'h' : 'r') + (this.buf > 0 ? 'b' : '');
    }

    ev(t, extra) {
      const e = extra || {};
      e.t = t;
      this.events.push(e);
    }

    kill(cause) {
      if (this.dead) return;
      this.dead = true;
      this.deathCause = cause || 'hazard';
      this.ev('death', { x: this.p.x, y: this.p.y, mode: this.p.mode, cause: this.deathCause });
    }

    /* -------------------------------------------------------------- */
    step(held, fire) {
      if (this.dead || this.won) return;
      const L = this.L, p = this.p, dt = K.DT;
      this.tick++;
      this.time = this.tick * dt;

      const pressed = held && !this.prevHeld;
      this.prevHeld = held;
      if (pressed) this.buf = K.BUF;
      else if (this.buf > 0) this.buf = Math.max(0, this.buf - dt);
      const hasPress = this.buf > 0;

      // ---------- orbs & pads (use pre-move position)
      this.interact(hasPress);

      // ---------- per-mode velocity
      const gd = p.gdir;
      const wasGround = p.onGround;
      switch (p.mode) {
        case 'cube':
          if (p.onGround && (held || hasPress)) {
            p.vy = -gd * K.CUBE_JUMP; p.onGround = false; this.buf = 0; this.jumps++;
            this.ev('jump', { x: p.x, y: p.y });
          }
          p.vy += gd * K.CUBE_G * dt;
          if (gd < 0 ? p.vy < -K.CUBE_FALL : p.vy > K.CUBE_FALL) p.vy = gd * K.CUBE_FALL;
          break;
        case 'ball':
          if (p.onGround && hasPress) {
            p.gdir = -gd; p.vy = p.gdir * K.BALL_FLIP_V; p.onGround = false; this.buf = 0; this.jumps++;
            this.ev('flip', { x: p.x, y: p.y });
          }
          p.vy += p.gdir * K.BALL_G * dt;
          if (p.gdir < 0 ? p.vy < -K.BALL_FALL : p.vy > K.BALL_FALL) p.vy = p.gdir * K.BALL_FALL;
          break;
        case 'ufo':
          if (hasPress) {
            p.vy = -gd * K.UFO_JUMP; this.buf = 0; this.jumps++;
            this.ev('jump', { x: p.x, y: p.y, ufo: true });
          }
          p.vy += gd * K.UFO_G * dt;
          if (gd < 0 ? p.vy < -K.UFO_FALL : p.vy > K.UFO_FALL) p.vy = gd * K.UFO_FALL;
          break;
        case 'ship': {
          const a = held ? -gd * K.SHIP_UP : gd * K.SHIP_DN;
          p.vy += a * dt;
          if (p.vy > K.SHIP_MAX) p.vy = K.SHIP_MAX; else if (p.vy < -K.SHIP_MAX) p.vy = -K.SHIP_MAX;
          break;
        }
        case 'wave':
          p.vy = (held ? -gd : gd) * L.speed;
          break;
      }

      // ---------- integrate
      const ox = p.x, oy = p.y;
      p.x += L.speed * dt;
      p.y += p.vy * dt;
      p.onGround = false;
      if (!this.collide(ox, oy)) return;
      if (!this.hazards()) return;
      this.portals(ox);
      this.coins();
      if (this.opts.expect) { // solver-only: the run must pass through the intended vehicle sequence
        const ex = L.expect;
        while (this.exIdx < ex.length && p.x >= ex[this.exIdx].x) {
          const e = ex[this.exIdx++];
          if (p.mode !== e.mode || (e.gdir && p.gdir !== e.gdir)) { this.kill('wrong-mode:' + e.mode); return; }
        }
      }

      // ---------- visuals state
      if (p.mode === 'cube') {
        if (!p.onGround) p.spin += (p.gdir < 0 ? 1 : -1) * 520 * dt;
      } else if (p.mode === 'ball') {
        p.spin += (L.speed / 0.5) * dt * (180 / Math.PI) * (p.gdir < 0 ? 1 : -1);
      }
      if (!wasGround && p.onGround) this.ev('land', { x: p.x, y: p.y, vy: p.vy, mode: p.mode });

      // ---------- enemies / weapons
      this.enemyStep(dt, fire);

      if (p.x >= L.end) {
        this.won = true;
        this.ev('win', { x: p.x, y: p.y });
      }
    }

    /* -------------------------------------------------------------- */
    interact(hasPress) {
      const L = this.L, p = this.p;
      const c0 = Math.floor(p.x - 1.2), c1 = Math.floor(p.x + 1.2);
      const hb = K.HB[p.mode];
      for (let c = c0; c <= c1; c++) {
        // pads
        const pads = L.padCols[c];
        if (pads && p.mode !== 'wave') {
          for (let i = 0; i < pads.length; i++) {
            const d = pads[i];
            if (this.usedPad[d.id]) continue;
            const y0 = d.flip ? d.y + 0.7 : d.y, y1 = d.flip ? d.y + 1 : d.y + 0.3;
            if (p.x + hb > d.x + 0.05 && p.x - hb < d.x + 0.95 && p.y + hb > y0 && p.y - hb < y1) {
              this.usedPad[d.id] = 1;
              this.applyPad(d);
            }
          }
        }
        // orbs
        const orbs = L.orbCols[c];
        if (orbs && hasPress && p.mode !== 'ship' && p.mode !== 'wave') {
          for (let i = 0; i < orbs.length; i++) {
            const o = orbs[i];
            if (this.usedOrb[o.id]) continue;
            const dx = p.x - o.cx, dy = p.y - o.cy;
            if (dx * dx + dy * dy < K.ORB_R * K.ORB_R) {
              this.usedOrb[o.id] = 1;
              this.applyOrb(o);
              return;
            }
          }
        }
      }
    }

    applyPad(d) {
      const p = this.p;
      if (d.type === 'yellow') p.vy = -p.gdir * K.PAD_Y;
      else if (d.type === 'pink') p.vy = -p.gdir * K.PAD_P;
      else if (d.type === 'blue') { p.gdir = -p.gdir; p.vy = p.gdir * K.PAD_B_V; this.ev('flip', { x: p.x, y: p.y }); }
      p.onGround = false;
      this.ev('pad', { x: d.x + 0.5, y: d.y + (d.flip ? 1 : 0), type: d.type, flip: !!d.flip });
    }

    applyOrb(o) {
      const p = this.p;
      if (o.type === 'yellow') p.vy = -p.gdir * K.ORB_Y;
      else if (o.type === 'pink') p.vy = -p.gdir * K.ORB_P;
      else if (o.type === 'blue') { p.gdir = -p.gdir; p.vy = p.gdir * K.ORB_B_V; this.ev('flip', { x: p.x, y: p.y }); }
      p.onGround = false;
      this.buf = 0;
      this.jumps++;
      this.ev('orb', { x: o.cx, y: o.cy, type: o.type });
    }

    /* -------------------------------------------------------------- */
    collide(ox, oy) {
      const L = this.L, p = this.p;
      const hb = K.HB[p.mode];
      const E = K.EPS, TOL = K.TOL;
      const gd = p.gdir;
      const c0 = Math.floor(p.x - hb), c1 = Math.floor(p.x + hb);
      for (let c = c0; c <= c1; c++) {
        const col = L.solidCols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const s = col[i];
          const l = s.x, r = s.x + s.w, b = s.y, t = s.y + s.h;
          if (!(p.x + hb > l + E && p.x - hb < r - E && p.y + hb > b + E && p.y - hb < t - E)) continue;
          const prevBottom = oy - hb, prevTop = oy + hb;
          if (gd < 0) {
            if (p.vy <= 0 && prevBottom >= t - TOL) { p.y = t + hb; p.vy = 0; p.onGround = true; }
            else if (p.vy > 0 && prevTop <= b + TOL) { p.y = b - hb; p.vy = 0; }
            else { this.kill('block'); return false; }
          } else {
            if (p.vy >= 0 && prevTop <= b + TOL) { p.y = b - hb; p.vy = 0; p.onGround = true; }
            else if (p.vy < 0 && prevBottom >= t - TOL) { p.y = t + hb; p.vy = 0; }
            else { this.kill('block'); return false; }
          }
        }
      }
      // ground slab
      if (p.y - hb < 0) {
        p.y = hb;
        if (p.vy < 0) p.vy = 0;
        if (gd < 0) p.onGround = true;
      }
      // ceiling slab (only in modes / gravity that need one)
      if (p.mode !== 'cube' || gd > 0) {
        if (p.y + hb > K.CEIL) {
          p.y = K.CEIL - hb;
          if (p.vy > 0) p.vy = 0;
          if (gd > 0) p.onGround = true;
        }
      }
      return true;
    }

    hazards() {
      const L = this.L, p = this.p;
      const hz = K.HZ[p.mode];
      const c0 = Math.floor(p.x - hz - 0.2), c1 = Math.floor(p.x + hz + 0.2);
      for (let c = c0; c <= c1; c++) {
        const col = L.hazCols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const h = col[i];
          if (h.type === 'saw') {
            // circle vs box
            const nx = Math.max(p.x - hz, Math.min(h.cx, p.x + hz));
            const ny = Math.max(p.y - hz, Math.min(h.cy, p.y + hz));
            const dx = nx - h.cx, dy = ny - h.cy;
            if (dx * dx + dy * dy < h.hr * h.hr) { this.kill('saw'); return false; }
          } else {
            if (Math.abs(p.x - h.bx) < hz + h.hw && Math.abs(p.y - h.by) < hz + h.hh) {
              this.kill('spike'); return false;
            }
          }
        }
      }
      return true;
    }

    portals(ox) {
      const L = this.L, p = this.p;
      const hb = K.HB[p.mode];
      const c0 = Math.floor(p.x - 1), c1 = Math.floor(p.x + 1);
      for (let c = c0; c <= c1; c++) {
        const col = L.portalCols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const o = col[i];
          if (ox < o.x && p.x >= o.x && Math.abs(p.y - o.cy) < (o.h || 3) / 2 + hb) {
            if (o.type === 'grav_up') { p.gdir = 1; this.ev('portal', { x: o.x, y: o.cy, type: o.type }); }
            else if (o.type === 'grav_down') { p.gdir = -1; this.ev('portal', { x: o.x, y: o.cy, type: o.type }); }
            else {
              p.mode = o.type;
              if (o.type === 'ship') p.vy = Math.max(-6, Math.min(6, p.vy * 0.5));
              if (o.type === 'wave') p.vy = 0;
              p.spin = 0;
              this.ev('portal', { x: o.x, y: o.cy, type: o.type });
            }
          }
        }
      }
    }

    coins() {
      const L = this.L, p = this.p;
      const c0 = Math.floor(p.x - 1), c1 = Math.floor(p.x + 1);
      for (let c = c0; c <= c1; c++) {
        const col = L.coinCols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const o = col[i];
          if (this.coinGot[o.id]) continue;
          const dx = p.x - o.cx, dy = p.y - o.cy;
          if (dx * dx + dy * dy < 0.8 * 0.8) {
            this.coinGot[o.id] = 1; this.coinCount++; this.score += 1000;
            this.ev('coin', { x: o.cx, y: o.cy, id: o.id });
          }
        }
      }
    }

    /* -------------------------------------------------------------- *
     * Enemies, bolts, bullets
     * -------------------------------------------------------------- */
    spawnEnemy(sp) {
      const e = {
        kind: sp.kind, x0: sp.x, y0: sp.y, vx: sp.vx || 0, amp: sp.amp || 0, per: sp.per || 1,
        ph: sp.ph || 0, R: sp.R || 0, hp: sp.hp || 1, maxhp: sp.hp || 1, r: sp.r || 0.5,
        age: 0, x: sp.x, y: sp.y, alive: true, flash: 0, fireT: (sp.delay != null ? sp.delay : (sp.per || 1) * 0.5),
        bspd: sp.bspd || 7, ang: sp.ang || 0, flip: !!sp.flip, val: sp.val || 100,
      };
      this.enemyPos(e);
      this.enemies.push(e);
      this.ev('spawn', { x: e.x, y: e.y, kind: e.kind });
    }

    enemyPos(e) {
      const T = Math.PI * 2;
      if (e.kind === 'drone') {
        e.x = e.x0 + e.vx * e.age;
        e.y = e.y0 + e.amp * Math.sin((T * e.age) / e.per + e.ph);
      } else if (e.kind === 'orbiter') {
        const a = (T * e.age) / e.per + e.ph;
        e.x = e.x0 + e.vx * e.age + e.R * Math.cos(a);
        e.y = e.y0 + e.R * Math.sin(a);
      } else {
        e.x = e.x0 + e.vx * e.age;
        e.y = e.y0;
      }
    }

    enemyStep(dt, fire) {
      const L = this.L, p = this.p;
      while (this.spawnIdx < L.spawns.length && L.spawns[this.spawnIdx].trig <= p.x) {
        this.spawnEnemy(L.spawns[this.spawnIdx++]);
      }
      const pr = K.PR[p.mode];
      // combo decay
      if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }

      let anyDead = false;
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        e.age += dt;
        if (e.flash > 0) e.flash -= dt;
        if (!e.alive) continue;
        this.enemyPos(e);
        if (e.kind === 'turret' && e.age >= K.SPAWN_ANIM) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT += e.per;
            const a = Math.PI + e.ang;
            this.bullets.push({ x: e.x - 0.5, y: e.y, vx: Math.cos(a) * e.bspd, vy: Math.sin(a) * e.bspd, hp: 1, age: 0 });
            this.ev('enemyshot', { x: e.x, y: e.y });
          }
        }
        if (e.age >= K.SPAWN_ANIM) {
          const dx = p.x - e.x, dy = p.y - e.y, rr = e.r + pr;
          if (dx * dx + dy * dy < rr * rr) { this.kill('enemy'); return; }
        }
        if (e.x < p.x - 9) { e.alive = false; e.gone = true; anyDead = true; }
      }
      // bullets
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.age += dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        const dx = p.x - b.x, dy = p.y - b.y, rr = 0.17 + pr;
        if (dx * dx + dy * dy < rr * rr) { this.kill('bullet'); return; }
        if (b.x < p.x - 9 || b.y < -1 || b.y > 12) this.bullets.splice(i, 1);
      }

      if (this.opts.noWeapons) {
        if (anyDead) this.enemies = this.enemies.filter((e) => e.alive || !e.gone);
        return;
      }

      // weapon
      if (this.fireCd > 0) this.fireCd -= dt;
      const auto = p.mode === 'ship';
      if ((fire || auto) && this.fireCd <= 0 && this.enemies.length + this.bullets.length >= 0) {
        this.fireCd = auto ? L.fireRate || 0.2 : 0.16;
        this.bolts.push({ x: p.x + 0.6, y: p.y, age: 0 });
        this.shots++;
        this.ev('shoot', { x: p.x + 0.6, y: p.y });
      }
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.age += dt;
        b.x += K.BOLT_SPEED * dt;
        let gone = b.age > 0.9;
        // solids
        if (!gone) {
          const col = L.solidCols[Math.floor(b.x)];
          if (col) {
            for (let k = 0; k < col.length; k++) {
              const s = col[k];
              if (b.x > s.x && b.x < s.x + s.w && b.y > s.y && b.y < s.y + s.h) { gone = true; this.ev('bolthit', { x: b.x, y: b.y }); break; }
            }
          }
        }
        // enemy bullets
        if (!gone) {
          for (let k = this.bullets.length - 1; k >= 0; k--) {
            const q = this.bullets[k];
            const dx = b.x - q.x, dy = b.y - q.y;
            if (dx * dx + dy * dy < 0.4 * 0.4) {
              this.bullets.splice(k, 1); gone = true;
              this.ev('bulletpop', { x: q.x, y: q.y });
              this.score += 25;
              break;
            }
          }
        }
        // enemies
        if (!gone) {
          for (let k = 0; k < this.enemies.length; k++) {
            const e = this.enemies[k];
            if (!e.alive || e.age < K.SPAWN_ANIM) continue;
            const dx = b.x - e.x, dy = b.y - e.y, rr = e.r + 0.15;
            if (dx * dx + dy * dy < rr * rr) {
              gone = true;
              e.hp--; e.flash = 0.1;
              if (e.hp <= 0) {
                e.alive = false; e.gone = true; anyDead = true;
                this.kills++;
                this.combo = Math.min(this.combo + 1, 8);
                this.comboT = 2.5;
                this.score += e.val * Math.max(1, Math.min(this.combo, 5));
                this.ev('kill', { x: e.x, y: e.y, kind: e.kind, combo: this.combo });
              } else {
                this.ev('hit', { x: b.x, y: b.y, kind: e.kind });
              }
              break;
            }
          }
        }
        if (gone) this.bolts.splice(i, 1);
      }
      if (anyDead) this.enemies = this.enemies.filter((e) => e.alive || !e.gone);
    }
  }

  TS.Sim = Sim;
})();

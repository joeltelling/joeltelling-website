/* Trig Sprint — level builder + the three campaign levels.
 *
 * Levels are authored on the music grid: 1 beat = 4 blocks, 1 bar = 16 blocks.
 * The player's speed is bpm/15 blocks per second, so every beat of the track
 * lines up with 4 blocks of level. The composer assembles hand-designed
 * "motifs" (cube) and procedural corridors (ship / wave / ball / ufo / gravity)
 * from a seeded RNG; tools/verify.html proves each one is completable.
 */
(function () {
  const TS = (globalThis.TS = globalThis.TS || {});
  const K = TS.K;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------------------------------------------ */
  class Builder {
    constructor(def) {
      this.def = def;
      this.speed = def.bpm / 15;
      this.beatT = 60 / def.bpm;
      this.L = {
        id: def.id, name: def.name, speed: this.speed, bpm: def.bpm,
        solids: [], hazards: [], orbs: [], pads: [], portals: [], coins: [], spawns: [],
        sections: [], expect: [], fireRate: 30 / def.bpm,
      };
    }
    block(x, y, w = 1, h = 1) { if (w > 0 && h > 0) this.L.solids.push({ x, y, w, h }); }
    spike(x, y = 0, flip = false) { this.L.hazards.push({ type: 'spike', x, y, flip }); }
    mini(x, y = 0, flip = false) { this.L.hazards.push({ type: 'mini', x, y, flip }); }
    saw(cx, cy, r = 0.6) { this.L.hazards.push({ type: 'saw', cx, cy, r }); }
    orb(type, cx, cy) { this.L.orbs.push({ type, cx, cy }); }
    pad(type, x, y = 0, flip = false) { this.L.pads.push({ type, x, y, flip }); }
    portal(type, x, cy, h) { this.L.portals.push({ type, x, cy, h: h || 3 }); }
    coin(cx, cy) { this.L.coins.push({ cx, cy }); }

    /** Spawn an enemy so that it meets the player at world-x `X` (given drift vx). */
    enemy(kind, X, y, o) {
      o = o || {};
      const s = this.speed, A = K.SPAWN_AHEAD;
      const vx = o.vx != null ? o.vx : 0;
      const trig = X - (s * A) / (s - vx);
      this.L.spawns.push(Object.assign({ kind, trig, x: trig + A, y, vx }, o));
    }
    drone(X, y, o) {
      o = Object.assign({ vx: -2, amp: 0.6, per: this.beatT, ph: 0, hp: 1, r: 0.5, val: 100 }, o);
      this.enemy('drone', X, y, o);
    }
    orbiter(X, y, o) {
      o = Object.assign({ vx: 0, R: 1.4, per: this.beatT * 2, ph: 0, hp: 2, r: 0.45, val: 200 }, o);
      this.enemy('orbiter', X, y, o);
    }
    turret(X, y, o) {
      o = Object.assign({ vx: 0, per: this.beatT, bspd: 8, ang: 0, hp: 4, r: 0.5, val: 300 }, o);
      this.enemy('turret', X, y, o);
    }
  }

  /* ------------------------------------------------------------------ *
   * CUBE motifs. Every motif keeps its geometry in [x+6, x+15] so there is
   * always a clear lead-in, and starts/ends in the plain "cube on ground"
   * state, so motifs can be chained freely.
   * ------------------------------------------------------------------ */
  const CUBE_MOTIFS = [
    { n: 's1', t: 0, f: (b, x) => b.spike(x + 8) },
    { n: 's2', t: 0, f: (b, x) => { b.spike(x + 8); b.spike(x + 9); } },
    { n: 'pair', t: 0, f: (b, x) => { b.spike(x + 6); b.spike(x + 12); } },
    { n: 'block', t: 0, f: (b, x) => b.block(x + 8, 0, 1, 1) },
    { n: 'plat', t: 0, f: (b, x) => b.block(x + 7, 0, 3, 1) },
    { n: 'hop', t: 1, f: (b, x) => { b.block(x + 7, 0, 2, 1); b.spike(x + 10); } },
    { n: 'tower', t: 1, f: (b, x) => { b.block(x + 8, 0, 1, 1); b.spike(x + 8, 1); } },
    { n: 'stairs', t: 1, f: (b, x) => { b.block(x + 6, 0, 2, 1); b.block(x + 8, 0, 2, 2); b.block(x + 10, 0, 2, 1); } },
    { n: 'saw', t: 1, f: (b, x) => b.saw(x + 9, 0.6, 0.6) },
    { n: 'pad', t: 1, f: (b, x) => { b.pad('yellow', x + 7); b.spike(x + 9); b.spike(x + 10); } },
    { n: 'gapblk', t: 1, f: (b, x) => { b.spike(x + 7); b.block(x + 9, 0, 1, 1); b.spike(x + 11); } },
    { n: 'turret', t: 1, f: (b, x) => b.turret(x + 10, 0.5, { per: b.beatT * 2, bspd: 7, hp: 3, delay: b.beatT }) },
    { n: 'turret2', t: 2, f: (b, x) => { b.turret(x + 11, 0.5, { per: b.beatT * 2, bspd: 8, hp: 4, delay: b.beatT }); b.spike(x + 7); } },
    { n: 's3', t: 2, minS: 10, f: (b, x) => { b.spike(x + 8); b.spike(x + 9); b.spike(x + 10); } },
    { n: 'dbl', t: 2, f: (b, x) => { b.spike(x + 6); b.spike(x + 7); b.spike(x + 12); b.spike(x + 13); } },
    { n: 'orbgap', t: 2, f: (b, x) => { for (let i = 9; i <= 12; i++) b.spike(x + i); b.orb('yellow', x + 10.5, 1.9); } },
    { n: 'hop2', t: 2, f: (b, x) => { b.block(x + 6, 0, 1, 1); b.spike(x + 7); b.spike(x + 8); b.block(x + 10, 0, 1, 1); b.spike(x + 11); } },
    { n: 'sawpair', t: 2, f: (b, x) => { b.saw(x + 7, 0.6, 0.6); b.saw(x + 12.5, 0.6, 0.6); } },
    { n: 'padhigh', t: 3, f: (b, x) => { b.pad('yellow', x + 7); b.saw(x + 10.5, 0.6, 0.7); b.spike(x + 12); } },
    { n: 'orbs2', t: 3, f: (b, x) => { for (let i = 8; i <= 13; i++) b.spike(x + i); b.orb('yellow', x + 9.5, 1.9); b.orb('yellow', x + 13, 1.9); } },
    { n: 'triple2', t: 3, minS: 10.5, f: (b, x) => { b.spike(x + 6); b.spike(x + 7); b.spike(x + 8); b.spike(x + 13); } },
  ];

  function composeCube(b, bar0, nBars, o) {
    const rng = o.rng, tier = o.tier, S = b.speed;
    const pool = CUBE_MOTIFS.filter((m) => m.t <= tier && m.t >= Math.max(0, tier - 2) && (!m.minS || S >= m.minS) && !(o.ban && o.ban.includes(m.n)));
    const mk = () => Array.from({ length: 4 }, () => pool[Math.floor(rng() * pool.length)]);
    let phrase = mk();
    let last = null;
    for (let i = 0; i < nBars; i++) {
      if (i > 0 && i % 8 === 0) phrase = mk();
      let m = phrase[i % 4];
      if (m === last && pool.length > 1) m = pool[(pool.indexOf(m) + 1) % pool.length];
      if (o.fixed && o.fixed[i]) m = CUBE_MOTIFS.find((q) => q.n === o.fixed[i]);
      last = m;
      const x = (bar0 + i) * 16;
      m.f(b, x);
      if (o.coinBars && o.coinBars.includes(i) && o.coinAt) o.coinAt(b, x, m);
      // enemy dressing
      if (o.enemies && i % 2 === 1 && !o.noEnemyBars?.includes(i)) {
        const kind = o.enemies[(i >> 1) % o.enemies.length];
        const X = x + 8;
        if (kind === 'drone') b.drone(X + 4, 3.8, { vx: -1.5, amp: 0.5 });
        else if (kind === 'orbiter') b.orbiter(X + 4, 4.4, { R: 1.0 });
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Ship / UFO corridor
   * ------------------------------------------------------------------ */
  function corridor(b, x0, len, o) {
    const amp = o.amp, lam = o.lam, G0 = o.G, base = o.base || 4.6, ramp = o.ramp || 8;
    const phi = o.phi || 0, amp2 = o.amp2 || 0, lam2 = o.lam2 || 9;
    const yc = (c) => {
      const e = smooth(c / ramp) * smooth((len - c) / ramp);
      const mid = lerp(2.6, base, e);
      return mid + e * (amp * Math.sin((2 * Math.PI * c) / lam + phi) + amp2 * Math.sin((2 * Math.PI * c) / lam2));
    };
    let prev = null;
    const path = [];
    for (let c = 0; c < len; c++) {
      const e = smooth(c / ramp) * smooth((len - c) / ramp);
      let G = lerp(5.2, G0, e);
      if (o.gates && c % 16 >= 11 && c % 16 <= 12 && c > ramp + 8 && c < len - ramp - 8) G = Math.min(G, o.gates);
      const y = yc(c + 0.5);
      path.push(y);
      const f = Math.max(0, Math.floor(y - G / 2 + 1e-6));
      const cb = Math.min(K.CEIL, Math.ceil(y + G / 2 - 1e-6));
      if (prev && prev.f === f && prev.cb === cb) { prev.w++; }
      else {
        if (prev) flush(prev);
        prev = { x: x0 + c, f, cb, w: 1 };
      }
    }
    if (prev) flush(prev);
    function flush(r) {
      if (r.f > 0) b.block(r.x, 0, r.w, r.f);
      if (r.cb < K.CEIL) b.block(r.x, r.cb, r.w, K.CEIL - r.cb);
    }
    return { yc, path };
  }

  function composeFlyer(b, bar0, nBars, o) {
    const x0 = bar0 * 16;
    const mode = o.mode;
    const rng = o.rng;
    b.portal(mode, x0 + 4, 3, 6);
    const c0 = x0 + 8, len = nBars * 16 - 16;
    const co = Object.assign({ phi: rng() * 6.28 }, o.cor);
    const cor = corridor(b, c0, len, co);
    b.portal('cube', c0 + len, 3.1, 6.2);
    // enemies
    if (o.enemies) {
      const every = o.enemyEvery || 16;
      for (let c = 24; c < len - 20; c += every) {
        const yy = cor.yc(c + 10);
        const side = (Math.floor(c / every) % 2 === 0) ? 1 : -1;
        const X = c0 + c + 10;
        const kind = o.enemies[Math.floor(c / every) % o.enemies.length];
        if (kind === 'drone') b.drone(X, yy + side * (o.droneOff || 1.5), { vx: -1.5, amp: 0.5 });
        else if (kind === 'orbiter') b.orbiter(X, yy + side * 1.6, { R: 0.9 });
        else if (kind === 'wall') { // vertical line of drones with a gap
          for (let k = -2; k <= 2; k++) if (k !== 0) b.drone(X, yy + k * 1.0, { vx: -1, amp: 0.2, ph: k });
        }
      }
    }
    if (o.coinAt != null) b.coin(c0 + o.coinAt, cor.yc(o.coinAt) + (o.coinDy || 0));
    return cor;
  }

  /* ------------------------------------------------------------------ *
   * Wave corridor — 45° zig-zags with matching stair-stepped walls
   * ------------------------------------------------------------------ */
  function composeWave(b, bar0, nBars, o) {
    const x0 = bar0 * 16, rng = o.rng;
    b.portal('wave', x0 + 4, 3, 6);
    const c0 = x0 + 8, len = nBars * 16 - 16;
    const G = o.G || 4.6, lo = 2.4, hi = o.hi || 7;
    const opts = o.segs || [2, 3, 4, 6];
    // knots of piecewise linear path
    const knots = [[0, 2.5]];
    let x = 0, y = 2.5, dir = 1;
    while (x < len - 12) {
      let L = opts[Math.floor(rng() * opts.length)];
      if (y + dir * L > hi) dir = -1;
      if (y + dir * L < lo) dir = 1;
      if (y + dir * L > hi) L = hi - y;
      if (y + dir * L < lo) L = y - lo;
      if (L < 1) { dir = -dir; continue; }
      x += L; y += dir * L; knots.push([x, y]); dir = -dir;
    }
    // come back to 2.5 with a 45° descent
    if (y > 2.5) { x += y - 2.5; y = 2.5; knots.push([x, y]); }
    knots.push([len, 2.5]);
    const yc = (c) => {
      for (let i = 1; i < knots.length; i++) {
        if (c <= knots[i][0]) {
          const [xa, ya] = knots[i - 1], [xb, yb] = knots[i];
          return xb === xa ? ya : ya + ((yb - ya) * (c - xa)) / (xb - xa);
        }
      }
      return 2.5;
    };
    let prev = null;
    for (let c = 0; c < len; c++) {
      const ya = yc(c), yb = yc(c + 1);
      const lo2 = Math.min(ya, yb) - G / 2, hi2 = Math.max(ya, yb) + G / 2;
      const f = Math.max(0, Math.floor(lo2 + 1e-6));
      const cb = Math.min(K.CEIL, Math.ceil(hi2 - 1e-6));
      if (prev && prev.f === f && prev.cb === cb) prev.w++;
      else { if (prev) fl(prev); prev = { x: c0 + c, f, cb, w: 1 }; }
    }
    if (prev) fl(prev);
    function fl(r) {
      if (r.f > 0) b.block(r.x, 0, r.w, r.f);
      if (r.cb < K.CEIL) b.block(r.x, r.cb, r.w, K.CEIL - r.cb);
    }
    b.portal('cube', c0 + len, 2.6, 5.2);
    if (o.enemies) {
      for (let c = 28; c < len - 24; c += 24) {
        const yy = yc(c + 6);
        b.drone(c0 + c + 6, yy + ((c / 24) % 2 === 0 ? 1.7 : -1.7), { vx: -1, amp: 0.0, hp: 1 });
      }
    }
    return { yc };
  }

  /* ------------------------------------------------------------------ *
   * Ball tunnel: floor = ground, ceiling blocks at y=5. Spikes on whichever
   * side the ball is on force a flip on every beat-ish.
   * ------------------------------------------------------------------ */
  function composeBall(b, bar0, nBars, o) {
    const x0 = bar0 * 16, rng = o.rng;
    b.portal('ball', x0 + 4, 3, 6);
    const c0 = x0 + 8, len = nBars * 16 - 16;
    const CB = o.cb || 5;
    b.block(c0, CB, len + 2, K.CEIL - CB);
    let side = 0; // 0 floor, 1 ceiling
    const dens = o.dens || 0.8;
    for (let beat = 2; beat * 4 < len - 8; beat++) {
      const bx = c0 + beat * 4;
      if (rng() < dens) {
        const n = rng() < (o.dbl || 0.2) ? 2 : 1;
        for (let k = 0; k < n; k++) {
          if (side === 0) b.spike(bx + k, 0, false); else b.spike(bx + k, CB - 1, true);
        }
        side = 1 - side;
      }
    }
    // park the ball: make sure we finish on the floor side
    if (side === 1) { /* ball ends on the ceiling: exit portal at ceiling */ }
    b.portal('cube', c0 + len, 2.5, 5);
    // cube after ceiling-portal drops to the floor naturally
    if (o.enemies) for (let c = 16; c < len - 16; c += 32) b.drone(c0 + c + 6, CB - 2.2, { vx: -1, amp: 0, hp: 1 });
  }

  /* ------------------------------------------------------------------ *
   * Gravity: cube in a 6-tall tunnel, blue pads flip gravity.
   * ------------------------------------------------------------------ */
  function composeGrav(b, bar0, nBars, o) {
    const x0 = bar0 * 16, rng = o.rng;
    const c0 = x0 + 4, len = nBars * 16 - 8;
    const CB = 6;
    b.block(c0, CB, len, K.CEIL - CB);
    let side = 0;
    for (let bar = 1; bar < nBars - 1; bar++) {
      const x = x0 + bar * 16;
      const kind = rng();
      const pf = side === 0 ? false : true;
      // flip pad then a spike on the new side
      b.pad('blue', x + 2, side === 0 ? 0 : CB - 1, side === 1);
      side = 1 - side;
      if (kind < 0.7) { b.spike(x + 8, side === 0 ? 0 : CB - 1, side === 1); }
      if (o.dbl && kind < 0.35) { b.spike(x + 9, side === 0 ? 0 : CB - 1, side === 1); }
    }
    // final: flip back to floor if needed
    if (side === 1) b.pad('blue', x0 + (nBars - 1) * 16 + 2, CB - 1, true);
    // tidy: portal back not needed
  }

  /* ------------------------------------------------------------------ */
  function build(def) {
    const b = new Builder(def);
    const rng = mulberry32(def.seed);
    let bar = 0;
    for (const seg of def.plan) {
      b.L.sections.push({ b0: bar, b1: bar + seg.bars, music: seg.music, hue: seg.hue, mode: seg.mode });
      // intended vehicle sequence (used by the solver to reject "skipped the portal" cheats)
      if (seg.mode !== 'rest' && seg.mode !== 'grav') b.L.expect.push({ x: bar * 16 + 10, mode: seg.mode });
      b.L.expect.push({ x: (bar + seg.bars) * 16 + 2, mode: 'cube', gdir: -1 });
      const o = Object.assign({ rng }, seg);
      switch (seg.mode) {
        case 'cube': composeCube(b, bar, seg.bars, o); break;
        case 'ship': case 'ufo': composeFlyer(b, bar, seg.bars, o); break;
        case 'wave': composeWave(b, bar, seg.bars, o); break;
        case 'ball': composeBall(b, bar, seg.bars, o); break;
        case 'grav': composeGrav(b, bar, seg.bars, o); break;
        default: break; // rest
      }
      bar += seg.bars;
    }
    const L = b.L;
    L.bars = bar;
    L.end = bar * 16 - 4;
    L.def = def;
    L.hue0 = def.plan[0].hue;
    return L;
  }

  /* ------------------------------------------------------------------ *
   * The campaign
   * ------------------------------------------------------------------ */
  const DEFS = [
    {
      id: 'boot', name: 'Boot Sequence', tag: 'Warm up your reflexes', diff: 1, stars: 2,
      bpm: 135, seed: 7, color: '#37f2c9',
      music: { root: 45, scale: 'minor', prog: [0, 5, 3, 6], arpOct: 1, swing: 0, lead: 'saw', bassStyle: 'roll' },
      plan: [
        { mode: 'rest', bars: 2, music: 'intro', hue: 170 },
        { mode: 'cube', bars: 6, tier: 0, music: 'build', hue: 170, coinBars: [3], coinAt: (b, x) => b.coin(x + 9, 3.0) },
        { mode: 'cube', bars: 8, tier: 1, music: 'drop', hue: 190, enemies: ['drone'], fixed: { 3: 'turret', 6: 'turret' }, coinBars: [5], coinAt: (b, x) => b.coin(x + 10, 3.1) },
        { mode: 'rest', bars: 1, music: 'drop', hue: 190 },
        { mode: 'ship', bars: 8, music: 'drop', hue: 210, enemies: ['drone'], enemyEvery: 20, cor: { amp: 1.2, lam: 22, G: 5.2 }, coinAt: 52, coinDy: 1.3 },
        { mode: 'rest', bars: 1, music: 'break', hue: 230 },
        { mode: 'cube', bars: 4, tier: 0, music: 'break', hue: 240 },
        { mode: 'cube', bars: 8, tier: 1, music: 'drop', hue: 280, enemies: ['drone', 'orbiter'] },
        { mode: 'rest', bars: 2, music: 'outro', hue: 300 },
      ],
    },
    {
      id: 'sine', name: 'Sine Wave', tag: 'Ride the curve', diff: 3, stars: 4,
      bpm: 150, seed: 31, color: '#ff4fd8',
      music: { root: 50, scale: 'phrygian', prog: [0, 0, 5, 6], arpOct: 1, swing: 0, lead: 'square', bassStyle: 'drive' },
      plan: [
        { mode: 'rest', bars: 2, music: 'intro', hue: 300 },
        { mode: 'cube', bars: 6, tier: 1, music: 'build', hue: 300, enemies: ['drone'] },
        { mode: 'cube', bars: 8, tier: 2, music: 'drop', hue: 320, enemies: ['drone', 'orbiter'], fixed: { 2: 'turret', 5: 'turret2' } },
        { mode: 'rest', bars: 1, music: 'drop', hue: 330 },
        { mode: 'ship', bars: 8, music: 'drop', hue: 340, enemies: ['drone', 'orbiter'], enemyEvery: 16, cor: { amp: 1.7, lam: 18, G: 4.8, gates: 3.8 } },
        { mode: 'rest', bars: 1, music: 'break', hue: 250 },
        { mode: 'wave', bars: 6, music: 'break', hue: 250, G: 5.2, segs: [3, 4, 6] },
        { mode: 'rest', bars: 1, music: 'build', hue: 220 },
        { mode: 'cube', bars: 6, tier: 2, music: 'drop', hue: 200, enemies: ['drone'] },
        { mode: 'rest', bars: 1, music: 'drop', hue: 200 },
        { mode: 'ball', bars: 6, music: 'drop', hue: 180, dens: 0.8 },
        { mode: 'rest', bars: 1, music: 'drop', hue: 160 },
        { mode: 'cube', bars: 4, tier: 3, music: 'drop', hue: 140 },
        { mode: 'rest', bars: 2, music: 'outro', hue: 120 },
      ],
    },
    {
      id: 'tangent', name: 'Tangent Rush', tag: 'Approach infinity', diff: 5, stars: 6,
      bpm: 165, seed: 99, color: '#ffb23f',
      music: { root: 43, scale: 'harmonic', prog: [0, 5, 0, 4], arpOct: 2, swing: 0, lead: 'saw', bassStyle: 'gallop' },
      plan: [
        { mode: 'rest', bars: 2, music: 'intro', hue: 20 },
        { mode: 'cube', bars: 6, tier: 2, music: 'build', hue: 20, enemies: ['drone'] },
        { mode: 'cube', bars: 8, tier: 3, music: 'drop', hue: 10, enemies: ['drone', 'orbiter'], fixed: { 1: 'turret2', 4: 'turret', 6: 'turret2' } },
        { mode: 'rest', bars: 1, music: 'drop', hue: 0 },
        { mode: 'ship', bars: 8, music: 'drop', hue: 350, enemies: ['drone', 'orbiter', 'wall'], enemyEvery: 16, cor: { amp: 2.0, lam: 16, G: 4.6, gates: 3.6, amp2: 0.5 } },
        { mode: 'rest', bars: 1, music: 'break', hue: 320 },
        { mode: 'wave', bars: 8, music: 'break', hue: 300, G: 4.6, segs: [2, 3, 4], enemies: true },
        { mode: 'rest', bars: 1, music: 'build', hue: 270 },
        { mode: 'grav', bars: 6, music: 'drop', hue: 260, dbl: true },
        { mode: 'rest', bars: 1, music: 'drop', hue: 240 },
        { mode: 'ufo', bars: 8, music: 'drop', hue: 220, enemies: ['drone'], enemyEvery: 20, cor: { amp: 1.1, lam: 24, G: 5.4 } },
        { mode: 'rest', bars: 1, music: 'drop', hue: 200 },
        { mode: 'ball', bars: 6, music: 'drop', hue: 180, dens: 0.9, dbl: 0.3, enemies: true },
        { mode: 'rest', bars: 1, music: 'drop', hue: 160 },
        { mode: 'cube', bars: 6, tier: 3, music: 'drop', hue: 140, enemies: ['drone', 'orbiter'] },
        { mode: 'rest', bars: 2, music: 'outro', hue: 120 },
      ],
    },
  ];

  TS.DEFS = DEFS;
  TS.buildLevel = build;
  TS.mulberry32 = mulberry32;
  const cache = {};
  TS.getLevel = (id) => cache[id] || (cache[id] = build(DEFS.find((d) => d.id === id)));
})();

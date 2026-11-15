/*
 * Lock Buster — deterministic game core.
 * No DOM, no rendering, no Math.random: given a seed, the same locks come out.
 * That is what makes seeded dailies, replay verification and tests possible.
 */
(function (g) {
  'use strict';
  const LB = (g.LB = g.LB || {});
  const content = LB.content;

  // ---- Tunables (all the "feel" numbers live here) -------------------------
  const CONFIG = {
    startTime: 30, // seconds on the clock at the start
    maxTime: 45, // clock cap (low, so you can't bank a huge cushion)
    wrongPenalty: 2, // seconds lost for a wrong keypad code
    wrongWayPenalty: 1, // seconds lost for landing a dial number going the wrong way
    DIAL_SIZE: 40, // numbers on the dial: 0..39
    BARREL_DIGITS: 10, // digits on each barrel wheel: 0..9

    // Clock economy. Net clock change per lock = (1 + bonusGain) * (parEff - elapsed):
    // beat the (shrinking) par time and you gain seconds, miss it and you bleed.
    bonusGain: 0.6, // extra seconds earned per second faster than par
    minBonus: 0.5, // even a slow crack earns this much
    maxBonus: 8, // cap on a single lock's bonus
    parTighten: 0.025, // par shrinks this fraction per lock cracked...
    parFloor: 0.4, // ...down to this fraction of the original
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mod = (v, n) => ((v % n) + n) % n;

  // mulberry32
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // FNV-1a string -> 32-bit seed
  function hashSeed(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  const int = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  // shortest distance between two numbers on the circular dial
  function circDist(a, b) {
    const n = CONFIG.DIAL_SIZE;
    const d = Math.abs(mod(a, n) - mod(b, n));
    return Math.min(d, n - d);
  }

  // ---- Lock generation -----------------------------------------------------
  const LOCK_TYPES = ['keypad', 'barrel', 'dial'];

  function makeCode(rng, len) {
    let code;
    do {
      code = Array.from({ length: len }, () => int(rng, 0, 9));
    } while (new Set(code).size === 1); // no 7-7-7 gimmes
    return code;
  }

  // n = 0-based index of the lock within the run. Difficulty rises with n.
  // hist = run history the caller keeps and passes back each time (mutated here):
  //   { dials: how many dial locks so far, last: recent lock types }
  function makeLock(rng, n, hist) {
    hist = hist || { dials: 0, last: [] };

    let type;
    if (n < 2) type = 'keypad';
    else if (n === 2) type = 'barrel';
    else if (n === 3) type = 'dial';
    else {
      // random, but never the same type three times running
      const l = hist.last;
      const banned = l.length >= 2 && l[l.length - 1] === l[l.length - 2] ? l[l.length - 1] : null;
      type = pick(rng, LOCK_TYPES.filter((t) => t !== banned));
    }

    const spec = {
      n,
      type,
      owner: pick(rng, content.OWNERS),
      loot: pick(rng, content.LOOT),
    };

    if (type === 'keypad') {
      const len = n < 10 ? 3 : n < 22 ? 4 : 5;
      spec.code = makeCode(rng, len);
      spec.par = 1.6 + 0.55 * len;
      spec.base = 100 * len;
    } else if (type === 'barrel') {
      const len = n < 12 ? 3 : n < 24 ? 4 : 5;
      spec.code = makeCode(rng, len);
      // starting digits: always at least 2 clicks away from the answer
      const D = CONFIG.BARREL_DIGITS;
      spec.start = spec.code.map((c) => {
        let s;
        do {
          s = int(rng, 0, D - 1);
        } while (Math.min(mod(s - c, D), mod(c - s, D)) < 2);
        return s;
      });
      spec.par = 1.2 + 0.9 * len;
      spec.base = 120 * len;
    } else {
      const d = hist.dials; // difficulty follows how many dials you've seen, not lock number
      const count = d < 10 ? 3 : 4;
      const steps = [];
      let pos = 0; // dial starts at 0
      for (let i = 0; i < count; i++) {
        const dir = i % 2 === 0 ? 'R' : 'L';
        const travel = int(rng, 10, 28); // always a decent spin, never a nudge
        pos = mod(pos + (dir === 'R' ? travel : -travel), CONFIG.DIAL_SIZE);
        steps.push({ n: pos, dir });
      }
      spec.steps = steps;
      spec.dialIndex = d;
      // how many numbers wide the "sweet spot" is (smaller = harder)
      spec.tol = d < 3 ? 1.4 : d < 6 ? 1.0 : d < 10 ? 0.7 : 0.5;
      spec.assist = d < 3; // the first 3 dials show the target dot on the dial face
      spec.par = 2 + 1.4 * count;
      spec.base = 150 * count;
      hist.dials++;
    }
    hist.last.push(type);
    if (hist.last.length > 4) hist.last.shift();
    return spec;
  }

  // ---- Rewards ---------------------------------------------------------------
  // Par tightens as the run goes on, so the same skill earns less time later.
  const parScale = (n) => Math.max(CONFIG.parFloor, 1 - CONFIG.parTighten * n);

  // Seconds this lock would add to the clock if cracked after `elapsed` seconds.
  // Break-even is exactly par: faster gains time, slower bleeds it.
  function timeBonus(par, elapsed, n) {
    const pe = par * parScale(n);
    const raw = pe + CONFIG.bonusGain * (pe - elapsed);
    const total = clamp(raw, CONFIG.minBonus, CONFIG.maxBonus);
    const max = clamp(pe * (1 + CONFIG.bonusGain), CONFIG.minBonus, CONFIG.maxBonus);
    return { total, max, parEff: pe };
  }

  const comboMult = (streak) => Math.min(5, 1 + Math.floor(streak / 3));

  // `streak` = clean-lock streak INCLUDING this lock (0 if this lock was messy)
  function scoreLock(spec, elapsed, clean, streak) {
    const pe = spec.par * parScale(spec.n);
    const speedMult = 1 + 1.5 * clamp((1.5 * pe - elapsed) / pe, 0, 1);
    const combo = clean ? comboMult(streak) : 1;
    const perfect = clean ? 50 : 0;
    const points = Math.round(spec.base * speedMult * combo + perfect);
    return { points, speedMult, combo, perfect };
  }

  function rankFor(locks) {
    let title = content.RANKS[0][1];
    for (const [min, name] of content.RANKS) if (locks >= min) title = name;
    return title;
  }

  LB.core = {
    CONFIG,
    clamp,
    mod,
    makeRng,
    hashSeed,
    int,
    pick,
    circDist,
    makeLock,
    parScale,
    timeBonus,
    comboMult,
    scoreLock,
    rankFor,
  };
})(typeof window !== 'undefined' ? window : globalThis);

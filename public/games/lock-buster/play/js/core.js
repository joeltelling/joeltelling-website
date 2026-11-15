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
    maxTime: 60, // clock cap
    wrongPenalty: 2, // seconds lost for a wrong keypad code
    wrongWayPenalty: 1, // seconds lost for landing a dial number going the wrong way
    DIAL_SIZE: 40, // numbers on the dial: 0..39
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
  // n = 0-based index of the lock within the run. Difficulty rises with n.
  function makeLock(rng, n) {
    const type = n < 3 ? 'keypad' : n === 3 ? 'dial' : rng() < 0.5 ? 'dial' : 'keypad';
    const spec = {
      n,
      type,
      owner: pick(rng, content.OWNERS),
      loot: pick(rng, content.LOOT),
    };

    if (type === 'keypad') {
      const len = n < 10 ? 3 : n < 22 ? 4 : 5;
      let code;
      do {
        code = Array.from({ length: len }, () => int(rng, 0, 9));
      } while (new Set(code).size === 1); // no 7-7-7 gimmes
      spec.code = code;
      spec.par = 1.6 + 0.55 * len;
      spec.base = 100 * len;
    } else {
      const count = n < 28 ? 3 : 4;
      const steps = [];
      let pos = 0; // dial starts at 0
      for (let i = 0; i < count; i++) {
        const dir = i % 2 === 0 ? 'R' : 'L';
        const travel = int(rng, 10, 28); // always a decent spin, never a nudge
        pos = mod(pos + (dir === 'R' ? travel : -travel), CONFIG.DIAL_SIZE);
        steps.push({ n: pos, dir });
      }
      spec.steps = steps;
      // how many numbers wide the "sweet spot" is (smaller = harder)
      spec.tol = n < 8 ? 1.4 : n < 16 ? 1.0 : n < 26 ? 0.7 : 0.5;
      spec.assist = n < 8; // early dials show the target on the dial face
      spec.par = 2 + 1.4 * count;
      spec.base = 150 * count;
    }
    return spec;
  }

  // ---- Rewards ---------------------------------------------------------------
  // Seconds added to the clock for cracking a lock in `elapsed` seconds.
  // Base shrinks as the run goes on so the clock eventually wins.
  function timeBonus(par, elapsed, n) {
    const base = Math.max(0.8, 2.6 - 0.05 * n);
    const speed = 2.5 * clamp((1.5 * par - elapsed) / par, 0, 1);
    return { base, speed, total: base + speed };
  }

  const comboMult = (streak) => Math.min(5, 1 + Math.floor(streak / 3));

  // `streak` = clean-lock streak INCLUDING this lock (0 if this lock was messy)
  function scoreLock(spec, elapsed, clean, streak) {
    const speedMult = 1 + 1.5 * clamp((1.5 * spec.par - elapsed) / spec.par, 0, 1);
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
    timeBonus,
    comboMult,
    scoreLock,
    rankFor,
  };
})(typeof window !== 'undefined' ? window : globalThis);

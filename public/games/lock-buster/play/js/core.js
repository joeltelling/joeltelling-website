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
  // CONFIG is the NORMAL difficulty baseline. Newb and Ultra-Stress are built from it below.
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

    // Levels: a level is a short run of locks. The clock carries over between levels.
    levelBonus: 3, // seconds added to the clock for clearing a level
    levelPoints: 250, // points for clearing a level, times the level number (x2 if flawless)
    checkpointEvery: 3, // you can start a run at level 1, 4, 7... once you have reached it

    // Boss locks: the last lock of every level from level 2 on is a gauntlet of mini-locks.
    bossPoints: 300, // points for beating a boss, times the level number
    bossBonus: 2, // seconds added to the clock for beating a boss
  };

  // ---- Difficulty tiers --------------------------------------------------------
  // Everything a tier can change. Locks remember their tier (spec.diff) so scoring and
  // clock rewards stay consistent.
  const NORMAL = {
    key: 'normal',
    name: 'Normal',
    startTime: CONFIG.startTime,
    maxTime: CONFIG.maxTime,
    wrongPenalty: CONFIG.wrongPenalty,
    wrongWayPenalty: CONFIG.wrongWayPenalty,
    peekCost: 1.5, // seconds it costs to look at a hidden note again
    parMult: 1, // multiplies every lock's par time (bigger = more generous)
    parTighten: CONFIG.parTighten,
    parFloor: CONFIG.parFloor,
    levelBonus: CONFIG.levelBonus,
    bossBonus: CONFIG.bossBonus,
    modChance: 1, // multiplies how often curveballs show up
    peekMult: 1, // multiplies how long a peek note stays readable
    tolMult: 1, // multiplies dial / slider sweet-spot sizes
    assistDials: 3, // the first N dials show the green target dot
    scoreMult: 1,
  };
  const DIFFICULTY = {
    newb: Object.assign({}, NORMAL, {
      key: 'newb',
      name: 'Newb',
      startTime: 40,
      maxTime: 60,
      wrongPenalty: 1,
      wrongWayPenalty: 0.5,
      peekCost: 1,
      parMult: 1.35,
      parTighten: 0.012,
      parFloor: 0.55,
      levelBonus: 5,
      bossBonus: 3,
      modChance: 0.6,
      peekMult: 1.4,
      tolMult: 1.35,
      assistDials: 6,
      scoreMult: 0.7,
    }),
    normal: NORMAL,
    ultra: Object.assign({}, NORMAL, {
      key: 'ultra',
      name: 'Ultra-Stress',
      startTime: 25,
      maxTime: 38,
      wrongPenalty: 3,
      wrongWayPenalty: 2,
      peekCost: 2.5,
      parMult: 0.88,
      parTighten: 0.032,
      parFloor: 0.35,
      levelBonus: 2,
      bossBonus: 1.5,
      modChance: 1.4,
      peekMult: 0.75,
      tolMult: 0.85,
      assistDials: 2,
      scoreMult: 1.5,
    }),
  };
  const DIFFICULTY_KEYS = ['newb', 'normal', 'ultra'];
  const diffOf = (key) => DIFFICULTY[key] || NORMAL;

  // ---- Levels ----------------------------------------------------------------
  // Levels are derived from the lock number, so a seeded run always has the same shape.
  const LEVEL_SIZES = [5, 6, 6, 7]; // locks in levels 1..4; every level after that has LEVEL_MAX
  const LEVEL_MAX = 8;
  const levelSize = (level) => (level < LEVEL_SIZES.length ? LEVEL_SIZES[level] : LEVEL_MAX);
  function levelStart(level) {
    let n = 0;
    for (let l = 0; l < level; l++) n += levelSize(l);
    return n;
  }
  // 0-based lock number n -> { level (0-based), pos (0-based lock within it), size, start }
  function levelOf(n) {
    let level = 0, start = 0;
    for (;;) {
      const size = levelSize(level);
      if (n < start + size) return { level, pos: n - start, size, start };
      start += size;
      level++;
    }
  }
  // Each level introduces at most one new thing, announced on the level card: first the boss
  // lock, then the curveballs. A new curveball is guaranteed once in its debut level (from lock
  // MOD_INTRO_AT on), then both can show up at a rising rate.
  const MOD_INTRO_LEVEL = { peek: 2, shuffle: 3 }; // 0-based level where each first appears
  const BOSS_FROM_LEVEL = 1; // 0-based: level 2 is the first with a boss
  const NEW_AT = { boss: BOSS_FROM_LEVEL, peek: MOD_INTRO_LEVEL.peek, shuffle: MOD_INTRO_LEVEL.shuffle };
  const MOD_INTRO_AT = 2;
  const levelModChance = (level) => (level < MOD_INTRO_LEVEL.peek ? 0 : Math.min(0.45, 0.1 + 0.07 * (level - 1)));
  // what's new when this level starts? (for the level card)
  const levelNewMod = (level) => Object.keys(NEW_AT).find((k) => NEW_AT[k] === level) || null;
  const isBossLevel = (level) => level >= BOSS_FROM_LEVEL;
  const bossStageCount = (level) => (level < 3 ? 2 : level < 7 ? 3 : 4);

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
  const LOCK_TYPES = ['keypad', 'barrel', 'dial', 'slider'];

  function makeCode(rng, len) {
    let code;
    do {
      code = Array.from({ length: len }, () => int(rng, 0, 9));
    } while (new Set(code).size === 1); // no 7-7-7 gimmes
    return code;
  }

  // The first five locks are a fixed tour. After that: random, never the same type three times
  // running (o.noRepeat also forbids the same type twice running, for boss stages).
  function pickType(rng, n, hist, o) {
    o = o || {};
    if (n < 2) return 'keypad';
    if (n === 2) return 'barrel';
    if (n === 3) return 'dial';
    if (n === 4) return 'slider';
    const l = hist.last;
    const banned = [];
    if (l.length >= 2 && l[l.length - 1] === l[l.length - 2]) banned.push(l[l.length - 1]);
    if (o.noRepeat && l.length) banned.push(l[l.length - 1]);
    if (o.keypad && banned.indexOf('keypad') < 0) return 'keypad'; // shuffle needs a keypad
    return pick(rng, LOCK_TYPES.filter((t) => banned.indexOf(t) < 0));
  }

  // One lock of a given type. o: { shrink, modBoost, baseMult, introMod }
  function buildLock(rng, n, hist, D, lv, type, o) {
    const shrink = o.shrink || 0;
    const spec = {
      n,
      level: lv.level,
      pos: lv.pos,
      levelSize: lv.size,
      type,
      diff: D.key,
      owner: pick(rng, content.OWNERS),
      loot: pick(rng, content.LOOT),
    };

    if (type === 'keypad') {
      const len = Math.max(3, (n < 10 ? 3 : n < 22 ? 4 : 5) - shrink);
      spec.code = makeCode(rng, len);
      spec.par = 1.6 + 0.55 * len;
      spec.base = 100 * len;
    } else if (type === 'barrel') {
      const len = Math.max(3, (n < 12 ? 3 : n < 24 ? 4 : 5) - shrink);
      spec.code = makeCode(rng, len);
      // starting digits: always at least 2 clicks away from the answer
      const BD = CONFIG.BARREL_DIGITS;
      spec.start = spec.code.map((c) => {
        let s;
        do {
          s = int(rng, 0, BD - 1);
        } while (Math.min(mod(s - c, BD), mod(c - s, BD)) < 2);
        return s;
      });
      spec.par = 1.2 + 0.9 * len;
      spec.base = 120 * len;
    } else if (type === 'slider') {
      // Sliders are matched by sight: drag each handle onto its notch (0 = bottom, 1 = top).
      const len = Math.max(3, (n < 12 ? 3 : n < 24 ? 4 : 5) - shrink);
      spec.targets = Array.from({ length: len }, () => int(rng, 2, 18) / 20);
      spec.start = spec.targets.map((t) => {
        let s;
        do {
          s = int(rng, 0, 20) / 20;
        } while (Math.abs(s - t) < 0.3);
        return s;
      });
      // half-width of the sweet spot, as a fraction of the track
      spec.tol = (n < 12 ? 0.05 : n < 24 ? 0.035 : 0.025) * D.tolMult;
      spec.par = 1.2 + 0.8 * len;
      spec.base = 110 * len;
    } else {
      const d = hist.dials; // difficulty follows how many dials you've seen, not lock number
      const count = Math.max(2, (d < 10 ? 3 : 4) - shrink);
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
      spec.tol = (d < 3 ? 1.4 : d < 6 ? 1.0 : d < 10 ? 0.7 : 0.5) * D.tolMult;
      spec.assist = d < D.assistDials; // the first few dials show the target dot on the dial face
      spec.par = 2 + 1.4 * count;
      spec.base = 150 * count;
      hist.dials++;
    }

    // Modifiers ("make it worse"): peek from level 3, shuffle from level 4, rising to ~45%.
    spec.mod = null;
    spec.peekCost = D.peekCost;
    const allowed = [];
    if (lv.level >= MOD_INTRO_LEVEL.peek) allowed.push('peek');
    if (lv.level >= MOD_INTRO_LEVEL.shuffle && type === 'keypad') allowed.push('shuffle');
    if (o.introMod && allowed.indexOf(o.introMod) >= 0) {
      spec.mod = o.introMod;
      hist.intro[lv.level] = true;
    } else if (allowed.length && rng() < Math.min(0.6, levelModChance(lv.level) * D.modChance * (o.modBoost || 1))) {
      spec.mod = pick(rng, allowed);
    }
    if (spec.mod) {
      if (spec.mod === 'peek') {
        // the code disappears after a few seconds; tap the note to peek again (costs time)
        const size = spec.code ? spec.code.length : spec.targets ? spec.targets.length : spec.steps.length;
        spec.peek = (type === 'dial' ? 3.5 + 0.9 * size : 1.5 + 0.4 * size) * D.peekMult;
        spec.par *= 1.2;
      } else {
        spec.shuffleSeed = int(rng, 1, 1000000000); // keys rearrange after every tap (deterministic per lock)
        spec.par *= 1.5;
      }
    }
    spec.par *= D.parMult;
    if (o.baseMult) spec.base = Math.round(spec.base * o.baseMult);
    return spec;
  }

  // A boss is a gauntlet: several mini-locks (a different type each time) back to back, all
  // standing in for the last lock of the level. The game plays the stages one after another.
  function makeBoss(rng, n, hist, lv, D) {
    const name = content.BOSSES[lv.level % content.BOSSES.length];
    const of = bossStageCount(lv.level);
    const stages = [];
    for (let i = 0; i < of; i++) {
      const type = pickType(rng, n, hist, { noRepeat: i > 0 });
      const spec = buildLock(rng, n, hist, D, lv, type, { shrink: 1, modBoost: 1.5, baseMult: 1.25 });
      spec.owner = name;
      spec.bossStage = { i, of, name };
      hist.last.push(type);
      if (hist.last.length > 4) hist.last.shift();
      stages.push(spec);
    }
    return {
      n,
      level: lv.level,
      pos: lv.pos,
      levelSize: lv.size,
      type: 'boss',
      boss: true,
      diff: D.key,
      name,
      taunt: pick(rng, content.BOSS_TAUNTS),
      loot: pick(rng, content.BOSS_LOOT),
      stages,
    };
  }

  // n = 0-based index of the lock within the run. Difficulty rises with n.
  // hist = run history the caller keeps and passes back each time (mutated here):
  //   { dials: how many dial locks so far, last: recent lock types, diff: difficulty key }
  // Returns one lock spec, or (for the last lock of a boss level) a boss: { boss: true, stages: [spec...] }.
  function makeLock(rng, n, hist) {
    hist = hist || { dials: 0, last: [] };
    hist.last = hist.last || [];
    hist.intro = hist.intro || {};
    const D = diffOf(hist.diff);
    const lv = levelOf(n);
    if (isBossLevel(lv.level) && lv.pos === lv.size - 1) return makeBoss(rng, n, hist, lv, D);

    // is this level's brand-new curveball still waiting to be introduced?
    const introMod = Object.keys(MOD_INTRO_LEVEL).find((k) => MOD_INTRO_LEVEL[k] === lv.level) || null;
    const introPending = !!introMod && !hist.intro[lv.level] && lv.pos >= MOD_INTRO_AT;

    const type = pickType(rng, n, hist, { keypad: introPending && introMod === 'shuffle' });
    const spec = buildLock(rng, n, hist, D, lv, type, { introMod: introPending ? introMod : null });
    hist.last.push(type);
    if (hist.last.length > 4) hist.last.shift();
    return spec;
  }

  // ---- Rewards ---------------------------------------------------------------
  // Par tightens as the run goes on, so the same skill earns less time later.
  const parScale = (n, key) => {
    const D = diffOf(key);
    return Math.max(D.parFloor, 1 - D.parTighten * n);
  };

  // Seconds this lock would add to the clock if cracked after `elapsed` seconds.
  // Break-even is exactly par: faster gains time, slower bleeds it.
  function timeBonus(par, elapsed, n, key) {
    const pe = par * parScale(n, key);
    const raw = pe + CONFIG.bonusGain * (pe - elapsed);
    const total = clamp(raw, CONFIG.minBonus, CONFIG.maxBonus);
    const max = clamp(pe * (1 + CONFIG.bonusGain), CONFIG.minBonus, CONFIG.maxBonus);
    return { total, max, parEff: pe };
  }

  const comboMult = (streak) => Math.min(5, 1 + Math.floor(streak / 3));

  // `streak` = clean-lock streak INCLUDING this lock (0 if this lock was messy)
  function scoreLock(spec, elapsed, clean, streak) {
    const pe = spec.par * parScale(spec.n, spec.diff);
    const speedMult = 1 + 1.5 * clamp((1.5 * pe - elapsed) / pe, 0, 1);
    const combo = clean ? comboMult(streak) : 1;
    const perfect = clean ? 50 : 0;
    const points = Math.round((spec.base * speedMult * combo + perfect) * diffOf(spec.diff).scoreMult);
    return { points, speedMult, combo, perfect };
  }

  function rankFor(locks) {
    let title = content.RANKS[0][1];
    for (const [min, name] of content.RANKS) if (locks >= min) title = name;
    return title;
  }

  LB.core = {
    CONFIG,
    DIFFICULTY,
    DIFFICULTY_KEYS,
    diffOf,
    clamp,
    mod,
    makeRng,
    hashSeed,
    int,
    pick,
    circDist,
    makeLock,
    levelSize,
    levelStart,
    levelOf,
    levelNewMod,
    isBossLevel,
    bossStageCount,
    MOD_INTRO_LEVEL,
    parScale,
    timeBonus,
    comboMult,
    scoreLock,
    rankFor,
  };
})(typeof window !== 'undefined' ? window : globalThis);

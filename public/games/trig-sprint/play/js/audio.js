/* Trig Sprint — procedural soundtrack + SFX (pure Web Audio, no samples).
 *
 * Each level has its own track: kick / clap / hats / sidechained bass / saw lead /
 * arpeggio / supersaw pad / risers / crashes, arranged by the level's sections
 * (intro → build → drop → break → drop → outro) and locked to the level grid
 * (1 beat = 4 blocks), so the geometry and the music hit together.
 */
(function () {
  const TS = (globalThis.TS = globalThis.TS || {});

  const SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    major: [0, 2, 4, 5, 7, 9, 11],
  };
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const degMidi = (mus, d) => {
    const sc = SCALES[mus.scale] || SCALES.minor;
    const oct = Math.floor(d / 7);
    return mus.root + sc[((d % 7) + 7) % 7] + 12 * oct;
  };

  const A = {
    ctx: null, master: null, sfxBus: null, musicVol: 0.8, sfxVol: 0.9, muted: false,
    session: null, noiseBuf: null, irBuf: null, timer: null,

    init(override) {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return true; }
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return false;
      const ctx = (this.ctx = override || new AC({ latencyHint: 'interactive' }));
      this.master = ctx.createGain();
      this.master.gain.value = 0.7;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
      const lim = ctx.createDynamicsCompressor();
      lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.06;
      this.master.connect(comp); comp.connect(lim); lim.connect(ctx.destination);
      this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = this.sfxVol;
      this.sfxBus.connect(this.master);
      // noise buffer
      const len = ctx.sampleRate * 2;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // reverb impulse
      const irLen = ctx.sampleRate * 1.6;
      this.irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const ch = this.irBuf.getChannelData(c);
        for (let i = 0; i < irLen; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.6);
      }
      if (!override && ctx.state === 'suspended') ctx.resume();
      return true;
    },

    setVolumes(music, sfx) {
      this.musicVol = music; this.sfxVol = sfx;
      if (this.sfxBus) this.sfxBus.gain.value = sfx;
      if (this.session) this.session.out.gain.value = music;
    },

    /* ============================ MUSIC ============================ */
    /** Start the track for a built level. `fromSec` = seconds into the level. */
    playLevel(L, fromSec) {
      if (!this.init()) return;
      this.stop(0.03);
      const def = L.def || {};
      const mus = def.music || { root: 45, scale: 'minor', prog: [0, 5, 3, 6] };
      const sections = L.sections;
      const sectionAt = (bar) => {
        for (const s of sections) if (bar >= s.b0 && bar < s.b1) return { name: s.music, idx: bar - s.b0, len: s.b1 - s.b0, next: nextName(s) };
        return null;
      };
      const nextName = (s) => { const i = sections.indexOf(s); return sections[i + 1] ? sections[i + 1].music : null; };
      this._start(L.bpm, mus, def.seed || 1, sectionAt, fromSec || 0, L.bars);
    },

    /** Looping menu music built from level 1's palette. */
    playMenu() {
      if (!this.init()) return;
      this.stop(0.05);
      const def = TS.DEFS[0];
      const cyc = ['intro', 'build', 'drop', 'drop', 'break', 'drop', 'drop', 'drop'];
      const sectionAt = (bar) => {
        const i = bar % 8;
        return { name: cyc[i], idx: (i % 2), len: 2, next: cyc[(i + 1) % 8] };
      };
      this._start(def.bpm, Object.assign({}, def.music, { root: 45 }), 3, sectionAt, 0, Infinity);
    },

    stop(fade) {
      const s = this.session;
      if (!s) return;
      this.session = null;
      clearInterval(s.timer);
      const t = this.ctx.currentTime;
      try {
        s.out.gain.cancelScheduledValues(t);
        s.out.gain.setValueAtTime(s.out.gain.value, t);
        s.out.gain.linearRampToValueAtTime(0, t + (fade == null ? 0.25 : fade));
      } catch (e) { /* ignore */ }
      setTimeout(() => { try { s.out.disconnect(); } catch (e) { /* ignore */ } }, 1200);
    },

    /** Current beat phase (0..1) of the running track, for visual pulse. */
    beatPhase() {
      const s = this.session;
      if (!s) return 0;
      const t = this.ctx.currentTime - s.t0;
      return (((t / s.beat) % 1) + 1) % 1;
    },

    _start(bpm, mus, seed, sectionAt, fromSec, totalBars) {
      const ctx = this.ctx;
      const stepDur = 60 / bpm / 4;
      const out = ctx.createGain();
      out.gain.value = this.musicVol * (this.muted ? 0 : 1);
      out.connect(this.master);
      // Buses with sidechain-style ducking
      const duck = ctx.createGain(); duck.connect(out);        // pad / arp / lead
      const bassBus = ctx.createGain(); bassBus.connect(out);
      const drumBus = ctx.createGain(); drumBus.gain.value = 1; drumBus.connect(out);
      // FX: dotted-8th delay + reverb
      const delay = ctx.createDelay(2); delay.delayTime.value = stepDur * 3;
      const fb = ctx.createGain(); fb.gain.value = 0.38;
      const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2800;
      delay.connect(dlp); dlp.connect(fb); fb.connect(delay);
      const dOut = ctx.createGain(); dOut.gain.value = 0.55; dlp.connect(dOut); dOut.connect(duck);
      const conv = ctx.createConvolver(); conv.buffer = this.irBuf;
      const rOut = ctx.createGain(); rOut.gain.value = 0.35; conv.connect(rOut); rOut.connect(out);
      const delaySend = ctx.createGain(); delaySend.gain.value = 0.5; delaySend.connect(delay);
      const revSend = ctx.createGain(); revSend.gain.value = 0.5; revSend.connect(conv);

      const rng = TS.mulberry32(seed * 7919 + 13);
      // ---- melody (4 bars, per chord) & arpeggio shape
      const RH = [
        [1,0,0,1,0,0,1,0, 1,0,0,1,0,1,0,0],
        [1,0,1,0,0,1,0,0, 1,0,1,0,0,1,1,0],
        [1,0,0,0,1,0,0,1, 0,0,1,0,0,0,1,0],
        [1,0,1,1,0,0,1,0, 0,1,0,0,1,0,1,0],
      ];
      const prog = mus.prog;
      const melody = prog.map((chord, bi) => {
        const rh = RH[Math.floor(rng() * RH.length)];
        let deg = chord + 7 + [0, 2, 4][Math.floor(rng() * 3)];
        return rh.map((h) => {
          if (!h) return -99;
          const mv = [-2, -1, -1, 0, 1, 1, 2, 3][Math.floor(rng() * 8)];
          deg = Math.max(chord + 4, Math.min(chord + 12, deg + mv));
          return deg;
        });
      });
      const arpShapes = [[0, 1, 2, 1], [0, 2, 1, 2], [0, 1, 2, 3]];
      const arpShape = arpShapes[seed % arpShapes.length];

      const sess = {
        out, duck, bassBus, drumBus, delaySend, revSend, stepDur, beat: stepDur * 4, timer: null,
        t0: 0, step: 0, nextTime: 0, mus, sectionAt, melody, arpShape, totalBars, bpm, rng,
      };
      // align start
      const step0 = Math.ceil(fromSec / stepDur - 1e-6);
      sess.step = step0;
      const now = ctx.currentTime;
      sess.nextTime = now + 0.06 + (step0 * stepDur - fromSec);
      sess.t0 = sess.nextTime - step0 * stepDur;
      this.session = sess;
      this._pump(sess);
      sess.timer = setInterval(() => this._pump(sess), 25);
    },

    _pump(s) {
      if (this.session !== s) return;
      const ctx = this.ctx;
      while (s.nextTime < ctx.currentTime + 0.18) {
        const bar = Math.floor(s.step / 16), st = s.step % 16;
        if (bar >= s.totalBars) { clearInterval(s.timer); break; }
        this._scheduleStep(s, bar, st, s.nextTime);
        s.step++;
        s.nextTime += s.stepDur;
      }
    },

    _scheduleStep(s, bar, st, t) {
      const sec = s.sectionAt(bar);
      if (!sec) return;
      const mus = s.mus, name = sec.name;
      const chord = mus.prog[bar % mus.prog.length];
      const last = sec.idx === sec.len - 1;
      const first = sec.idx === 0;
      const isDrop = name === 'drop';
      const isBuild = name === 'build';
      const isBreak = name === 'break';
      const isIntro = name === 'intro';
      const isOutro = name === 'outro';
      const beat = (st % 4 === 0);

      // ---------------- drums
      if (isDrop || isBuild || isOutro) {
        if (beat) this._kick(s, t, 1);
      } else if (isIntro && (st === 0 || st === 8)) this._kick(s, t, 0.7);
      if ((isDrop || isOutro) && (st === 4 || st === 12)) this._clap(s, t, 0.8);
      if (isBuild && last) { // snare roll
        if (st % 2 === 0 || bar % 2) this._clap(s, t, 0.25 + 0.5 * (st / 16));
      } else if (isBuild && (st === 4 || st === 12)) this._clap(s, t, 0.5);
      if (isDrop) {
        const open = st % 4 === 2;
        this._hat(s, t, open, open ? 0.5 : st % 2 ? 0.18 : 0.28);
      } else if (isBuild || isOutro) {
        if (st % 2 === 0) this._hat(s, t, st % 4 === 2, 0.3);
      } else if (isIntro && st % 4 === 2) this._hat(s, t, true, 0.25);
      // crash on first bar of drop / start of level
      if (first && st === 0 && (isDrop || isBuild)) this._crash(s, t, isDrop ? 0.9 : 0.5);
      // riser in the last bar of build/break before a drop
      if (last && st === 0 && (isBuild || isBreak) && sec.next === 'drop') this._riser(s, t, s.stepDur * 16);

      // ---------------- bass (sidechained, on drops/build/outro)
      if (isDrop || isBuild || isOutro) {
        const root = degMidi(mus, chord) - 24;
        const style = mus.bassStyle;
        let hit = false, oct = 0;
        if (style === 'roll') { hit = st % 4 === 2; if (st === 14) oct = 12; }
        else if (style === 'drive') { hit = st % 4 !== 0; oct = st % 8 === 7 ? 12 : 0; }
        else { hit = [0, 3, 6, 8, 11, 14].includes(st); oct = st === 14 ? 12 : 0; if (st % 4 === 0) hit = false; }
        if (isBuild && last && st >= 8) hit = false;
        if (hit) this._bass(s, t, root + oct, s.stepDur * (style === 'drive' ? 1.2 : 1.7));
      }

      // ---------------- pad (all but drop-lite) — one chord per bar
      if (st === 0) {
        const notes = [0, 2, 4].map((k) => degMidi(mus, chord + k) - 12 + (k === 0 ? 0 : 0));
        this._pad(s, t, notes, s.stepDur * 16, isDrop ? 0.14 : 0.2);
      }

      // ---------------- arpeggio (builds, breaks, drops)
      if (!isIntro || bar % 2 === 1) {
        if (isBreak || isBuild || isDrop || isOutro) {
          const ch = [chord, chord + 2, chord + 4, chord + 7];
          const idx = s.arpShape[st % s.arpShape.length];
          const m = degMidi(mus, ch[idx % 4]) + 12 * (mus.arpOct || 1);
          const v = isBreak ? 0.2 : isDrop ? 0.11 : 0.14;
          if (!(isBuild && last && st > 11)) this._pluck(s, t, m, v);
        }
      }

      // ---------------- lead (drops + breaks, 2nd half of build)
      if (isDrop || isBreak || (isBuild && sec.idx >= sec.len - 2)) {
        const d = s.melody[bar % s.melody.length][st];
        if (d > -50) {
          let dd = d;
          if (isBreak) dd = d - 0; // same hook, softer
          const dur = s.stepDur * (isBreak ? 3.2 : 2.2);
          this._lead(s, t, degMidi(mus, dd), dur, isBreak ? 0.2 : 0.17, mus.lead);
        }
      }
    },

    /* ---------------- instruments ---------------- */
    _env(g, t, a, peak, d, sus, rel, dur) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + d);
      g.gain.setTargetAtTime(0.0001, t + dur, rel);
    },

    _duckAt(s, t, depth, rel) {
      const g = s.duck.gain, b = s.bassBus.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(depth, t); g.linearRampToValueAtTime(1, t + rel);
      b.cancelScheduledValues(t); b.setValueAtTime(depth * 0.5, t); b.linearRampToValueAtTime(1, t + rel * 0.9);
    },

    _kick(s, t, v) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(170, t);
      o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(1.0 * v, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      o.connect(g); g.connect(s.drumBus);
      o.start(t); o.stop(t + 0.4);
      // click
      const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.25 * v, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      n.connect(f); f.connect(ng); ng.connect(s.drumBus); n.start(t, Math.random()); n.stop(t + 0.03);
      this._duckAt(s, t, 0.18, 0.22);
    },

    _clap(s, t, v) {
      const ctx = this.ctx;
      for (let i = 0; i < 3; i++) {
        const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.9;
        const g = ctx.createGain();
        const tt = t + i * 0.011;
        g.gain.setValueAtTime(0.0001, tt);
        g.gain.linearRampToValueAtTime(0.55 * v, tt + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, tt + (i === 2 ? 0.2 : 0.03));
        n.connect(f); f.connect(g); g.connect(s.drumBus); g.connect(s.revSend);
        n.start(tt, Math.random()); n.stop(tt + 0.25);
      }
      const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.1);
      const og = ctx.createGain(); og.gain.setValueAtTime(0.22 * v, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(og); og.connect(s.drumBus); o.start(t); o.stop(t + 0.15);
    },

    _hat(s, t, open, v) {
      const ctx = this.ctx;
      const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = open ? 6500 : 8500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.35 * v, t + 0.001);
      g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.16 : 0.04));
      n.connect(f); f.connect(g); g.connect(s.drumBus);
      n.start(t, Math.random()); n.stop(t + 0.2);
    },

    _crash(s, t, v) {
      const ctx = this.ctx;
      const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5 * v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      n.connect(f); f.connect(g); g.connect(s.drumBus); g.connect(s.revSend);
      n.start(t, 0); n.stop(t + 1.7);
      // sub impact
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.7);
      const og = ctx.createGain(); og.gain.setValueAtTime(0.7 * v, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      o.connect(og); og.connect(s.drumBus); o.start(t); o.stop(t + 1);
    },

    _riser(s, t, dur) {
      const ctx = this.ctx;
      const n = ctx.createBufferSource(); n.buffer = this.noiseBuf; n.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5;
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.98); g.gain.linearRampToValueAtTime(0, t + dur);
      n.connect(f); f.connect(g); g.connect(s.drumBus); g.connect(s.revSend);
      n.start(t); n.stop(t + dur + 0.05);
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(900, t + dur);
      const of = ctx.createBiquadFilter(); of.type = 'lowpass'; of.frequency.value = 1800;
      const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.09, t + dur);
      og.gain.linearRampToValueAtTime(0, t + dur + 0.01);
      o.connect(of); of.connect(og); og.connect(s.duck); o.start(t); o.stop(t + dur + 0.05);
    },

    _bass(s, t, midi, dur) {
      const ctx = this.ctx;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
      f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(220, t + 0.16);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.006);
      g.gain.setTargetAtTime(0.0001, t + dur, 0.03);
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(midi);
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = hz(midi) * 1.004;
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = hz(midi);
      const sg = ctx.createGain(); sg.gain.value = 0.9;
      const g2 = ctx.createGain(); g2.gain.value = 0.3;
      o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); sub.connect(sg); sg.connect(g);
      g.connect(s.bassBus);
      const end = t + dur + 0.2;
      o.start(t); o2.start(t); sub.start(t); o.stop(end); o2.stop(end); sub.stop(end);
    },

    _pluck(s, t, midi, v) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = hz(midi);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass';
      f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(700, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.connect(f); f.connect(g); g.connect(s.duck); g.connect(s.delaySend);
      o.start(t); o.stop(t + 0.2);
    },

    _lead(s, t, midi, dur, v, type) {
      const ctx = this.ctx;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3;
      f.frequency.setValueAtTime(5200, t); f.frequency.exponentialRampToValueAtTime(1600, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.008);
      g.gain.setTargetAtTime(0.0001, t + dur * 0.7, 0.06);
      const end = t + dur + 0.4;
      [-9, 9].forEach((det) => {
        const o = ctx.createOscillator(); o.type = type === 'square' ? 'square' : 'sawtooth';
        o.frequency.value = hz(midi); o.detune.value = det;
        const og = ctx.createGain(); og.gain.value = 0.5;
        o.connect(og); og.connect(f);
        o.start(t); o.stop(end);
      });
      f.connect(g); g.connect(s.duck); g.connect(s.delaySend); g.connect(s.revSend);
    },

    _pad(s, t, notes, dur, v) {
      const ctx = this.ctx;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(1500, t + dur * 0.6);
      f.frequency.linearRampToValueAtTime(600, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.35); g.gain.setTargetAtTime(0.0001, t + dur - 0.1, 0.18);
      notes.forEach((m) => {
        [-12, 0, 12].forEach((det) => {
          const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = det;
          const og = ctx.createGain(); og.gain.value = 0.18;
          o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + 0.8);
        });
      });
      f.connect(g); g.connect(s.duck); g.connect(s.revSend);
    },

    /* ============================ SFX ============================ */
    sfx(name, a) {
      if (!this.ctx || this.ctx.state !== 'running') return;
      a = a || {};
      const ctx = this.ctx, t = ctx.currentTime + 0.001;
      const out = this.sfxBus;
      const tone = (type, f0, f1, dur, vol, delay) => {
        const tt = t + (delay || 0);
        const o = ctx.createOscillator(); o.type = type;
        o.frequency.setValueAtTime(f0, tt);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, tt + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(vol, tt + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
        o.connect(g); g.connect(out); o.start(tt); o.stop(tt + dur + 0.02);
      };
      const noise = (type, f0, f1, dur, vol, q, delay) => {
        const tt = t + (delay || 0);
        const n = ctx.createBufferSource(); n.buffer = this.noiseBuf;
        const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q || 1;
        f.frequency.setValueAtTime(f0, tt); f.frequency.exponentialRampToValueAtTime(f1, tt + dur);
        const g = ctx.createGain(); g.gain.setValueAtTime(vol, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
        n.connect(f); f.connect(g); g.connect(out); n.start(tt, Math.random()); n.stop(tt + dur + 0.02);
      };
      switch (name) {
        case 'jump': tone('square', 330, 620, 0.09, 0.07); break;
        case 'orb': tone('sine', 700, 1500, 0.18, 0.2); tone('triangle', 1400, 2200, 0.12, 0.08, 0.03); break;
        case 'pad': noise('bandpass', 500, 3500, 0.25, 0.3, 2); tone('sine', 300, 900, 0.2, 0.15); break;
        case 'flip': tone('triangle', 260, 800, 0.16, 0.18); tone('sine', 800, 260, 0.14, 0.1, 0.05); break;
        case 'portal': tone('sawtooth', 120, 1400, 0.45, 0.1); noise('bandpass', 400, 6000, 0.45, 0.18, 3); break;
        case 'shoot': tone('sawtooth', 1100, 260, 0.08, 0.035); break;
        case 'enemyshot': tone('square', 300, 110, 0.12, 0.05); break;
        case 'hit': noise('highpass', 3000, 1500, 0.05, 0.18); tone('square', 400, 200, 0.05, 0.05); break;
        case 'bulletpop': tone('triangle', 900, 1800, 0.06, 0.07); break;
        case 'kill': noise('lowpass', 4000, 300, 0.3, 0.35); tone('square', 520, 90, 0.26, 0.1); tone('sine', 880, 1760, 0.12, 0.06, 0.05); break;
        case 'spawn': tone('sine', 200, 500, 0.12, 0.03); break;
        case 'coin': tone('triangle', 1318, 1318, 0.12, 0.16); tone('triangle', 1760, 1760, 0.3, 0.16, 0.09); tone('sine', 3520, 3520, 0.3, 0.05, 0.09); break;
        case 'land': noise('lowpass', 800, 200, 0.05, a.vol || 0.06); break;
        case 'death':
          noise('lowpass', 5000, 150, 0.6, 0.9, 1);
          tone('sine', 220, 38, 0.5, 0.8);
          tone('sawtooth', 600, 60, 0.35, 0.12);
          noise('highpass', 6000, 2000, 0.25, 0.3);
          break;
        case 'win':
          [0, 4, 7, 12, 16, 19, 24].forEach((st, i) => {
            tone('square', hz(69 + st), hz(69 + st), 0.5, 0.09, i * 0.09);
            tone('triangle', hz(57 + st), hz(57 + st), 0.5, 0.12, i * 0.09);
          });
          noise('highpass', 6000, 3000, 1.2, 0.2, 1, 0.6);
          break;
        case 'click': tone('square', 520, 780, 0.05, 0.07); break;
        case 'select': tone('triangle', 660, 990, 0.1, 0.12); tone('triangle', 990, 1320, 0.12, 0.1, 0.06); break;
        case 'back': tone('triangle', 520, 330, 0.1, 0.1); break;
        case 'checkpoint': tone('sine', 880, 880, 0.1, 0.15); tone('sine', 1320, 1320, 0.14, 0.15, 0.08); break;
        default: break;
      }
    },
  };

  TS.Audio = A;
})();

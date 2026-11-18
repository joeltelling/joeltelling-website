/* Lock Buster — synthesized sound effects (no audio files needed). */
(function (g) {
  'use strict';
  const LB = (g.LB = g.LB || {});

  let ac = null;
  let master = null;
  let muted = false;
  try {
    muted = localStorage.getItem('lockbuster.muted') === '1';
  } catch (e) {}

  function init() {
    if (ac) return;
    const AC = g.AudioContext || g.webkitAudioContext;
    if (!AC) return;
    try {
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 0.6;
      master.connect(ac.destination);
    } catch (e) {
      ac = null;
    }
  }

  // Must be called from a user gesture (tap) to unlock audio on phones.
  function resume() {
    init();
    if (ac && ac.state === 'suspended') ac.resume();
  }

  function tone(o) {
    if (!ac) return;
    const t0 = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.03);
  }

  let noiseBuf = null;
  function noise(o) {
    if (!ac) return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.5), ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = ac.currentTime + (o.delay || 0);
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = o.lp || 2000;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(o.vol || 0.3, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(master);
    src.start(t0);
    src.stop(t0 + o.dur + 0.03);
  }

  LB.audio = {
    resume,
    isMuted: () => muted,
    setMuted(m) {
      muted = !!m;
      try {
        localStorage.setItem('lockbuster.muted', muted ? '1' : '0');
      } catch (e) {}
      if (master) master.gain.value = muted ? 0 : 0.6;
    },

    // a dial number clicking past the marker
    tick() {
      tone({ f: 1900 + Math.random() * 300, f2: 1400, dur: 0.02, vol: 0.05, type: 'square' });
    },
    // keypad button; pitch climbs with the digit
    key(d) {
      tone({ f: 420 + (d || 0) * 38, f2: 360 + (d || 0) * 30, dur: 0.07, vol: 0.2, type: 'triangle' });
    },
    // dial number locked in: chunky clunk
    step() {
      noise({ lp: 800, dur: 0.09, vol: 0.5 });
      tone({ f: 190, f2: 90, dur: 0.11, vol: 0.28, type: 'square' });
    },
    // entered the sweet spot
    zone() {
      tone({ f: 1320, dur: 0.06, vol: 0.14, type: 'sine' });
      tone({ f: 1760, dur: 0.07, vol: 0.12, type: 'sine', delay: 0.05 });
    },
    unlock(streak) {
      noise({ lp: 700, dur: 0.1, vol: 0.45 });
      const notes = [523, 659, 784, 1047];
      if (streak >= 3) notes.push(1568);
      notes.forEach((f, i) => tone({ f, dur: 0.12, vol: 0.2, type: 'triangle', delay: 0.04 + i * 0.07 }));
    },
    wrong() {
      tone({ f: 150, f2: 80, dur: 0.3, vol: 0.25, type: 'sawtooth' });
      tone({ f: 95, f2: 60, dur: 0.3, vol: 0.2, type: 'square' });
    },
    // a boss appears: low ominous rumble climbing to a stab
    boss() {
      noise({ lp: 300, dur: 0.5, vol: 0.4 });
      tone({ f: 80, f2: 140, dur: 0.45, vol: 0.3, type: 'sawtooth' });
      tone({ f: 233, dur: 0.14, vol: 0.18, type: 'square', delay: 0.3 });
      tone({ f: 220, dur: 0.3, vol: 0.2, type: 'square', delay: 0.46 });
    },
    // a boss falls: big fanfare
    bossWin() {
      noise({ lp: 900, dur: 0.18, vol: 0.5 });
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
        tone({ f, dur: 0.16, vol: 0.2, type: 'triangle', delay: 0.05 + i * 0.09 })
      );
    },
    // lub-dub, played faster as the clock runs low
    heartbeat() {
      tone({ f: 75, f2: 45, dur: 0.13, vol: 0.7, type: 'sine' });
      tone({ f: 70, f2: 42, dur: 0.12, vol: 0.5, type: 'sine', delay: 0.17 });
    },
    // sad trombone
    over() {
      [[311, 0], [294, 0.32], [277, 0.64]].forEach(([f, d]) => {
        tone({ f, f2: f * 0.97, dur: 0.3, vol: 0.14, type: 'sawtooth', delay: d });
        tone({ f, f2: f * 0.97, dur: 0.3, vol: 0.1, type: 'triangle', delay: d });
      });
      tone({ f: 262, f2: 205, dur: 0.85, vol: 0.14, type: 'sawtooth', delay: 0.96 });
      tone({ f: 262, f2: 205, dur: 0.85, vol: 0.1, type: 'triangle', delay: 0.96 });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);

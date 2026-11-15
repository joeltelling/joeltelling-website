/* Trig Sprint — canvas renderer, particles, HUD.
 * Logical resolution 960x540. 1 block = 40px. Player sits at screen x = 270, ground at y = 420.
 */
(function () {
  const TS = (globalThis.TS = globalThis.TS || {});
  const K = TS.K;
  const W = 960, H = 540, B = 40, PX = 270, GY = 420;
  const TAU = Math.PI * 2;
  const hsl = (h, s, l, a) => `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a == null ? 1 : a})`;

  const ORB_COL = { yellow: '#ffe14d', pink: '#ff69c8', blue: '#4db8ff' };
  const PORTAL_COL = { cube: '#5cff7a', ship: '#ff5cf0', ball: '#ffa24d', wave: '#4dffea', ufo: '#ffe14d', grav_up: '#4db8ff', grav_down: '#ffd24d' };

  class Renderer {
    constructor(canvas) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.parts = [];
      this.shake = 0;
      this.flash = 0;
      this.hue = 190;
      this.trail = [];
      this.dustT = 0;
      this.icon = { c1: '#37f2c9', c2: '#ff4fd8' };
      this.quality = 1;
      this.shapes = Array.from({ length: 9 }, (_, i) => ({ x: (i * 173) % 1100, y: 40 + ((i * 97) % 300), s: 30 + ((i * 53) % 70), k: i % 3, ph: i }));
      this.resize();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = this.cv.clientWidth || W, ch = this.cv.clientHeight || H;
      this.cv.width = Math.round(cw * dpr);
      this.cv.height = Math.round(ch * dpr);
      this.scale = (cw * dpr) / W;
    }

    /* ---------------- events → particles ---------------- */
    wx(x, camX) { return (x - camX) * B + PX; }
    onEvent(e, camX) {
      const P = this.parts;
      const col = this.icon.c1;
      switch (e.t) {
        case 'death': {
          this.shake = 14; this.flash = 0.5;
          for (let i = 0; i < 30 * this.quality; i++) {
            const a = Math.random() * TAU, sp = 3 + Math.random() * 11;
            P.push({ k: 'sq', x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 3, g: 22, life: 0.9 + Math.random() * 0.5, max: 1.3, s: 4 + Math.random() * 9, c: Math.random() < 0.5 ? this.icon.c1 : this.icon.c2, r: Math.random() * 6 });
          }
          P.push({ k: 'ring', x: e.x, y: e.y, life: 0.5, max: 0.5, s: 90, c: '#fff' });
          P.push({ k: 'ring', x: e.x, y: e.y, life: 0.7, max: 0.7, s: 160, c: this.icon.c2 });
          break;
        }
        case 'jump': this.ring(e.x, e.y - 0.4, col, 26, 0.25); break;
        case 'orb': this.ring(e.x, e.y, ORB_COL[e.type] || '#fff', 70, 0.4); this.burst(e.x, e.y, ORB_COL[e.type] || '#fff', 8, 6); break;
        case 'pad': this.ring(e.x, e.y + (e.flip ? -0.1 : 0.1), ORB_COL[e.type] || '#fff', 60, 0.35); this.burst(e.x, e.y, ORB_COL[e.type] || '#fff', 8, 7); break;
        case 'portal': this.ring(e.x, e.y, PORTAL_COL[e.type] || '#fff', 110, 0.5); this.burst(e.x, e.y, PORTAL_COL[e.type] || '#fff', 16, 9); break;
        case 'flip': this.ring(e.x, e.y, '#4db8ff', 50, 0.3); break;
        case 'coin':
          this.ring(e.x, e.y, '#ffd84d', 90, 0.6); this.burst(e.x, e.y, '#ffd84d', 18, 8);
          P.push({ k: 'txt', x: e.x, y: e.y + 0.8, vy: 2, life: 1, max: 1, c: '#ffd84d', txt: '+1000' });
          break;
        case 'land': if (Math.abs(e.vy) > 5 || true) this.dust(e.x, e.y - 0.45, 3); break;
        case 'shoot': P.push({ k: 'glow', x: e.x, y: e.y, life: 0.08, max: 0.08, s: 18, c: '#7ff' }); break;
        case 'bolthit': this.burst(e.x, e.y, '#7ff', 4, 4); break;
        case 'hit': this.burst(e.x, e.y, '#fff', 5, 5); break;
        case 'bulletpop': this.burst(e.x, e.y, '#ffa24d', 6, 5); this.ring(e.x, e.y, '#ffa24d', 30, 0.2); break;
        case 'kill':
          this.shake = Math.max(this.shake, 4);
          this.ring(e.x, e.y, '#ff6a6a', 90, 0.4);
          for (let i = 0; i < 14 * this.quality; i++) {
            const a = Math.random() * TAU, sp = 3 + Math.random() * 8;
            P.push({ k: 'tri', x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 12, life: 0.6 + Math.random() * 0.4, max: 1, s: 4 + Math.random() * 6, c: Math.random() < 0.5 ? '#ff6a6a' : '#ffd0d0', r: Math.random() * 6 });
          }
          P.push({ k: 'txt', x: e.x, y: e.y + 0.7, vy: 2.5, life: 0.9, max: 0.9, c: '#fff', txt: e.combo > 1 ? '+' + (e.combo) + 'x' : '+100' });
          break;
        case 'spawn': this.ring(e.x, e.y, '#ff6a9a', 50, 0.3); break;
        case 'win':
          for (let k = 0; k < 6; k++) setTimeout(() => this.firework(e.x + (Math.random() - 0.3) * 8, 3 + Math.random() * 5), k * 220);
          break;
        default: break;
      }
    }
    ring(x, y, c, s, life) { this.parts.push({ k: 'ring', x, y, life, max: life, s, c }); }
    burst(x, y, c, n, sp) {
      for (let i = 0; i < n * this.quality; i++) {
        const a = Math.random() * TAU, v = sp * (0.4 + Math.random());
        this.parts.push({ k: 'sp', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0, life: 0.4 + Math.random() * 0.3, max: 0.7, s: 2 + Math.random() * 3, c });
      }
    }
    dust(x, y, n) {
      for (let i = 0; i < n; i++) this.parts.push({ k: 'sq', x, y, vx: -1 - Math.random() * 3, vy: 1 + Math.random() * 2, g: 3, life: 0.35, max: 0.35, s: 3 + Math.random() * 3, c: '#ffffff55', r: 0 });
    }
    firework(x, y) {
      const c = ['#37f2c9', '#ff4fd8', '#ffd84d', '#4db8ff'][Math.floor(Math.random() * 4)];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * TAU, v = 5 + Math.random() * 3;
        this.parts.push({ k: 'sp', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 6, life: 1.1, max: 1.1, s: 3, c });
      }
    }

    update(dt) {
      const P = this.parts;
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.life -= dt;
        if (p.life <= 0) { P[i] = P[P.length - 1]; P.pop(); continue; }
        if (p.vx != null) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy -= p.g * dt; }
        else if (p.vy != null) p.y += p.vy * dt;
        if (p.r != null) p.r += dt * 5;
      }
      if (P.length > 900) P.splice(0, P.length - 900);
      this.shake *= Math.pow(0.001, dt);
      if (this.shake < 0.1) this.shake = 0;
      if (this.flash > 0) this.flash -= dt;
    }

    /* ---------------- helpers ---------------- */
    glow(x, y, r, c, a) {
      const ctx = this.ctx;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = a == null ? 1 : a;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    hueAt(L, bar) {
      const S = L.sections;
      for (let i = 0; i < S.length; i++) {
        if (bar >= S[i].b0 && bar < S[i].b1) {
          const prev = S[Math.max(0, i - 1)].hue;
          const t = Math.min(1, (bar - S[i].b0) / 1.5);
          let d = ((S[i].hue - prev + 540) % 360) - 180;
          return prev + d * t * t * (3 - 2 * t);
        }
      }
      return S[S.length - 1].hue;
    }

    /* ================= main draw ================= */
    render(g) {
      const ctx = this.ctx, sim = g.sim, L = g.L, p = sim.p;
      const camX = g.camX;
      const t = g.time;
      const bar = camX / 16;
      const hue = this.hue += (this.hueAt(L, Math.max(0, bar)) - this.hue) * 0.08;
      const phase = (((camX / 4) % 1) + 1) % 1;
      const pulse = Math.pow(1 - phase, 3);
      ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
      ctx.clearRect(0, 0, W, H);

      this.drawBackground(hue, pulse, camX, t);

      ctx.save();
      if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
      const pal = {
        edge: hsl(hue, 95, 62), fill: hsl(hue, 45, 11), inner: hsl(hue, 80, 55, 0.22),
        haz: hsl(hue + 160, 100, 66), hazFill: hsl(hue + 160, 60, 14),
      };
      this.drawGround(hue, pulse, camX, p, pal);
      this.drawWorld(g, camX, pal, pulse, t);
      this.drawEntities(g, camX, t);
      this.drawPlayer(g, camX, t);
      this.drawParticles(camX);
      ctx.restore();

      if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.6, this.flash)})`; ctx.fillRect(0, 0, W, H); }
      if (!g.noHud) this.drawHUD(g, hue);
    }

    drawBackground(hue, pulse, camX, t) {
      const ctx = this.ctx;
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, hsl(hue, 70, 9 + pulse * 3));
      gr.addColorStop(0.7, hsl(hue + 25, 65, 19 + pulse * 4));
      gr.addColorStop(1, hsl(hue + 40, 60, 12));
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      // perspective-ish grid
      ctx.strokeStyle = hsl(hue, 80, 60, 0.07 + pulse * 0.05); ctx.lineWidth = 1;
      ctx.beginPath();
      const off = -((camX * B * 0.25) % 80);
      for (let x = off; x < W; x += 80) { ctx.moveTo(x, 0); ctx.lineTo(x, GY); }
      for (let y = 20; y < GY; y += 80) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      // floating geometry
      for (const s of this.shapes) {
        const sx = (((s.x - camX * B * (0.08 + s.k * 0.05)) % 1100) + 1100) % 1100 - 70;
        const sy = s.y + Math.sin(t * 0.6 + s.ph) * 12;
        const sz = s.s * (1 + pulse * 0.08);
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.2 * (s.k - 1) + s.ph);
        ctx.strokeStyle = hsl(hue + 30 * s.k, 90, 70, 0.14); ctx.lineWidth = 2;
        ctx.beginPath();
        if (s.k === 0) ctx.rect(-sz / 2, -sz / 2, sz, sz);
        else if (s.k === 1) { ctx.moveTo(0, -sz / 2); ctx.lineTo(sz / 2, sz / 2); ctx.lineTo(-sz / 2, sz / 2); ctx.closePath(); }
        else ctx.arc(0, 0, sz / 2, 0, TAU);
        ctx.stroke(); ctx.restore();
      }
      // trig: layered sine / cosine curves
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        const amp = 26 + k * 14 + pulse * 14, lam = 150 + k * 70, ph = -camX * B * (0.12 + k * 0.05) / lam * TAU + t * (0.6 + k * 0.2);
        for (let x = 0; x <= W; x += 8) {
          const y = 120 + k * 52 + amp * (k % 2 ? Math.cos(x / lam * TAU + ph) : Math.sin(x / lam * TAU + ph));
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = hsl(hue + k * 25, 95, 68, 0.13 + k * 0.03 + pulse * 0.06);
        ctx.lineWidth = 2 + k; ctx.stroke();
      }
      // equalizer skyline
      const n = 28, bw = W / n;
      for (let i = 0; i < n; i++) {
        const hgt = 30 + (Math.sin(i * 1.7 + t * 2) * 0.5 + 0.5) * 60 * (0.4 + pulse * 0.8);
        ctx.fillStyle = hsl(hue + i * 2, 80, 55, 0.07);
        ctx.fillRect(i * bw + 3, GY - hgt, bw - 6, hgt);
      }
    }

    drawGround(hue, pulse, camX, p, pal) {
      const ctx = this.ctx;
      const gr = ctx.createLinearGradient(0, GY, 0, H);
      gr.addColorStop(0, hsl(hue, 55, 16 + pulse * 6)); gr.addColorStop(1, hsl(hue, 60, 6));
      ctx.fillStyle = gr; ctx.fillRect(-10, GY, W + 20, H - GY + 10);
      ctx.strokeStyle = hsl(hue, 80, 55, 0.25); ctx.lineWidth = 2;
      ctx.beginPath();
      const off = -((camX * B) % 80);
      for (let x = off; x < W + 80; x += 80) { ctx.moveTo(x, GY); ctx.lineTo(x - 40, H); }
      ctx.stroke();
      ctx.strokeStyle = pal.edge; ctx.lineWidth = 4 + pulse * 3;
      ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();
      this.glow(PX, GY, 220, hsl(hue, 90, 50, 0.5), 0.35 + pulse * 0.3);
      const ceilOn = p.mode !== 'cube' || p.gdir > 0;
      if (ceilOn) {
        const cy = GY - K.CEIL * B;
        ctx.fillStyle = hsl(hue, 55, 9); ctx.fillRect(-10, cy - 120, W + 20, 120);
        ctx.strokeStyle = pal.edge; ctx.lineWidth = 4 + pulse * 3;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
      }
    }

    drawWorld(g, camX, pal, pulse, t) {
      const ctx = this.ctx, L = g.L, sim = g.sim;
      const x0 = camX - PX / B - 2, x1 = camX + (W - PX) / B + 2;
      const sx = (x) => (x - camX) * B + PX;
      const sy = (y) => GY - y * B;
      // solids
      for (const s of L.solids) {
        if (s.x + s.w < x0 || s.x > x1) continue;
        const px = sx(s.x), py = sy(s.y + s.h), w = s.w * B, h = s.h * B;
        ctx.fillStyle = pal.fill; ctx.fillRect(px, py, w, h);
        ctx.strokeStyle = pal.inner; ctx.lineWidth = 1;
        ctx.beginPath();
        const cx0 = Math.max(0, Math.floor(x0 - s.x)), cx1 = Math.min(s.w, Math.ceil(x1 - s.x));
        for (let i = cx0; i < cx1; i++) for (let j = 0; j < s.h; j++) ctx.rect(px + i * B + 4, py + j * B + 4, B - 8, B - 8);
        ctx.stroke();
        ctx.strokeStyle = pal.edge; ctx.lineWidth = 2.5; ctx.strokeRect(px + 1, py + 1, w - 2, h - 2);
        // top highlight
        ctx.fillStyle = hsl(0, 0, 100, 0.06 + pulse * 0.05); ctx.fillRect(px, py, w, 3);
      }
      // hazards
      for (const h of L.hazards) {
        if (h.type === 'saw') {
          if (h.cx + h.r < x0 || h.cx - h.r > x1) continue;
          this.drawSaw(sx(h.cx), sy(h.cy), h.r * B, t, pal);
        } else {
          if (h.x + 1 < x0 || h.x > x1) continue;
          const px = sx(h.x), py = sy(h.y), mini = h.type === 'mini';
          const hh = mini ? 22 : 38;
          ctx.beginPath();
          if (!h.flip) { ctx.moveTo(px + 2, py); ctx.lineTo(px + B / 2, py - hh); ctx.lineTo(px + B - 2, py); }
          else { ctx.moveTo(px + 2, py - B); ctx.lineTo(px + B / 2, py - B + hh); ctx.lineTo(px + B - 2, py - B); }
          ctx.closePath();
          ctx.fillStyle = pal.hazFill; ctx.fill();
          ctx.strokeStyle = pal.haz; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
          ctx.lineJoin = 'miter';
        }
      }
      // pads
      for (const d of L.pads) {
        if (d.x + 1 < x0 || d.x > x1) continue;
        const c = ORB_COL[d.type], px = sx(d.x), py = d.flip ? sy(d.y + 1) : sy(d.y);
        ctx.fillStyle = c; ctx.globalAlpha = 0.9;
        if (d.flip) ctx.fillRect(px + 4, py, B - 8, 8); else ctx.fillRect(px + 4, py - 8, B - 8, 8);
        ctx.globalAlpha = 1;
        this.glow(px + B / 2, d.flip ? py + 4 : py - 4, 34, c, 0.55 + pulse * 0.3);
        ctx.strokeStyle = c; ctx.lineWidth = 2;
        ctx.beginPath();
        const dir = d.flip ? 1 : -1, by = d.flip ? py + 8 : py - 8;
        for (let k = 0; k < 2; k++) { const yy = by + dir * (6 + k * 7); ctx.moveTo(px + 10, yy); ctx.lineTo(px + B / 2, yy + dir * 7); ctx.lineTo(px + B - 10, yy); }
        ctx.stroke();
      }
      // orbs
      for (const o of L.orbs) {
        if (o.cx + 1 < x0 || o.cx - 1 > x1) continue;
        const c = ORB_COL[o.type], px = sx(o.cx), py = sy(o.cy), used = sim.usedOrb[o.id];
        const r = 14 + pulse * 3 + Math.sin(t * 4 + o.cx) * 1.2;
        this.glow(px, py, 44, c, used ? 0.2 : 0.7);
        ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, r + 5, 0, TAU); ctx.stroke();
        ctx.fillStyle = used ? '#ffffff55' : c; ctx.beginPath(); ctx.arc(px, py, r - 3, 0, TAU); ctx.fill();
      }
      // portals
      for (const o of L.portals) {
        if (o.x + 1 < x0 || o.x - 1 > x1) continue;
        this.drawPortal(sx(o.x), sy(o.cy), PORTAL_COL[o.type], o.type, t, (o.h || 3) * B / 2);
      }
      // coins
      for (const o of L.coins) {
        if (sim.coinGot[o.id] || o.cx + 1 < x0 || o.cx - 1 > x1) continue;
        const px = sx(o.cx), py = sy(o.cy) + Math.sin(t * 3 + o.cx) * 3;
        this.glow(px, py, 40, '#ffd84d', 0.5);
        const sc = Math.abs(Math.cos(t * 2.2 + o.cx));
        ctx.fillStyle = '#ffcf3a'; ctx.beginPath(); ctx.ellipse(px, py, 14 * (0.35 + 0.65 * sc), 14, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#7a5200'; ctx.font = 'bold 16px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (sc > 0.5) ctx.fillText('π', px, py + 1);
      }
      // checkpoints (practice)
      if (g.checkpoints) for (const c of g.checkpoints) {
        const px = sx(c.x); if (px < -20 || px > W + 20) continue;
        ctx.fillStyle = '#5cff7a'; ctx.beginPath();
        ctx.moveTo(px, GY - 62); ctx.lineTo(px + 12, GY - 48); ctx.lineTo(px, GY - 34); ctx.lineTo(px - 12, GY - 48); ctx.closePath(); ctx.fill();
        ctx.fillRect(px - 1, GY - 34, 2, 34);
      }
      // finish gate
      const ex = sx(L.end);
      if (ex < W + 40) {
        for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#000'; ctx.fillRect(ex, GY - (i + 1) * 30, 14, 30); ctx.fillStyle = i % 2 ? '#000' : '#fff'; ctx.fillRect(ex + 14, GY - (i + 1) * 30, 14, 30); }
        const gg = ctx.createLinearGradient(ex, 0, ex + 400, 0);
        gg.addColorStop(0, hsl(this.hue, 100, 70, 0.35)); gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg; ctx.fillRect(ex, 0, 400, GY);
      }
      // world text: attempt
      if (g.attemptText) {
        const px = sx(6); if (px > -300) {
          ctx.font = '900 44px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText(g.attemptText, px, GY - 260);
          ctx.fillStyle = hsl(this.hue, 100, 70, 0.9); ctx.font = '700 18px "Segoe UI", system-ui'; ctx.fillText(g.L.name.toUpperCase(), px + 2, GY - 230);
        }
      }
    }

    drawSaw(px, py, r, t, pal) {
      const ctx = this.ctx;
      ctx.save(); ctx.translate(px, py); ctx.rotate(t * 7);
      ctx.beginPath();
      const n = 10;
      for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU, rr = i % 2 ? r * 0.72 : r * 1.08; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fillStyle = pal.hazFill; ctx.fill();
      ctx.strokeStyle = pal.haz; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.stroke();
      ctx.restore();
      this.glow(px, py, r * 2, pal.haz, 0.25);
    }

    drawPortal(px, py, c, type, t, hh) {
      hh = hh || 60;
      const ctx = this.ctx;
      this.glow(px, py, 90 + hh * 0.5, c, 0.4);
      ctx.strokeStyle = c; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(px, py, 20, hh + 2, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = 2; ctx.globalAlpha = 0.7;
      const span = hh * 2 - 10;
      for (let i = 0; i < Math.round(hh / 12); i++) {
        const yy = ((t * 80 + i * 26) % span) - span / 2;
        const w = 20 * Math.sqrt(Math.max(0, 1 - (yy / hh) * (yy / hh)));
        ctx.beginPath(); ctx.moveTo(px - w, py + yy); ctx.lineTo(px + w, py + yy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = c; ctx.font = '800 11px "Segoe UI", system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lab = { cube: 'CUBE', ship: 'SHIP', ball: 'BALL', wave: 'WAVE', ufo: 'UFO', grav_up: '▲ GRAV', grav_down: '▼ GRAV' }[type];
      ctx.fillText(lab, px, py - hh - 16);
    }

    drawEntities(g, camX, t) {
      const ctx = this.ctx, sim = g.sim;
      const sx = (x) => (x - camX) * B + PX, sy = (y) => GY - y * B;
      // enemies
      for (const e of sim.enemies) {
        const px = sx(e.x), py = sy(e.y);
        if (px < -60 || px > W + 60) continue;
        const sp = Math.min(1, e.age / K.SPAWN_ANIM);
        const sc = sp < 1 ? sp * (1.4 - 0.4 * sp) : 1;
        const flash = e.flash > 0;
        ctx.save(); ctx.translate(px, py); ctx.scale(sc, sc);
        this.glow(0, 0, 50, '#ff3a7a', 0.45 * sc);
        if (e.kind === 'drone') {
          ctx.rotate(t * 2 + e.ph);
          const r = 20;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, rr = i % 2 ? r * 0.7 : r * 1.15; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          ctx.closePath(); ctx.fillStyle = flash ? '#fff' : '#2a0a1c'; ctx.fill();
          ctx.strokeStyle = '#ff4f8a'; ctx.lineWidth = 3; ctx.stroke();
          ctx.rotate(-(t * 2 + e.ph));
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
          const lx = Math.max(-3, Math.min(3, (g.sim.p.x - e.x) * 0.6)), ly = Math.max(-3, Math.min(3, -(g.sim.p.y - e.y) * 0.6));
          ctx.fillStyle = '#d0004a'; ctx.beginPath(); ctx.arc(-lx, ly, 4, 0, TAU); ctx.fill();
        } else if (e.kind === 'orbiter') {
          ctx.fillStyle = flash ? '#fff' : '#1f0a2a'; ctx.strokeStyle = '#c06bff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill(); ctx.stroke();
          for (let i = 0; i < 3; i++) {
            const a = t * 4 + (i / 3) * TAU;
            ctx.fillStyle = '#c06bff'; ctx.beginPath(); ctx.arc(Math.cos(a) * 19, Math.sin(a) * 19, 4.5, 0, TAU); ctx.fill();
          }
          ctx.fillStyle = '#e9c7ff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
          if (e.maxhp > 1) { ctx.fillStyle = '#fff'; ctx.fillRect(-12, -30, 24 * (e.hp / e.maxhp), 3); }
        } else if (e.kind === 'turret') {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.52; ctx.lineTo(Math.cos(a) * 21, Math.sin(a) * 21); }
          ctx.closePath(); ctx.fillStyle = flash ? '#fff' : '#2a1608'; ctx.fill();
          ctx.strokeStyle = '#ffa24d'; ctx.lineWidth = 3; ctx.stroke();
          ctx.save(); ctx.rotate(-e.ang); ctx.fillStyle = '#ffa24d'; ctx.fillRect(-30, -5, 26, 10); ctx.restore();
          ctx.fillStyle = '#ffd9a8'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.fillRect(-14, 27, 28 * (e.hp / e.maxhp), 3);
        }
        ctx.restore();
      }
      // enemy bullets
      for (const b of sim.bullets) {
        const px = sx(b.x), py = sy(b.y);
        this.glow(px, py, 24, '#ff9a3a', 0.9);
        ctx.fillStyle = '#fff2d0'; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#ff9a3a'; ctx.lineWidth = 2; ctx.stroke();
      }
      // player bolts
      for (const b of sim.bolts) {
        const px = sx(b.x), py = sy(b.y);
        this.glow(px, py, 22, '#6ff', 0.8);
        ctx.strokeStyle = '#eaffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px - 16, py); ctx.lineTo(px + 6, py); ctx.stroke(); ctx.lineCap = 'butt';
      }
    }

    /* ---------------- player ---------------- */
    drawPlayer(g, camX, t) {
      const ctx = this.ctx, sim = g.sim, p = sim.p;
      if (g.hidePlayer) return;
      const px = (p.x - camX) * B + PX, py = GY - p.y * B;
      const c1 = this.icon.c1, c2 = this.icon.c2;
      // wave / ship trail
      if (p.mode === 'wave') {
        if (g.sampleTrail) { this.trail.push([p.x, p.y]); if (this.trail.length > 90) this.trail.shift(); }
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        for (let pass = 0; pass < 2; pass++) {
          ctx.beginPath();
          this.trail.forEach((q, i) => { const x = (q[0] - camX) * B + PX, y = GY - q[1] * B; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
          ctx.strokeStyle = pass ? '#fff' : c1; ctx.lineWidth = pass ? 3 : 9; ctx.globalAlpha = pass ? 0.9 : 0.5; ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
      } else {
        if (g.sampleTrail) this.trail.length = 0;
        if (g.sampleTrail && !sim.dead) {
          this.dustT -= g.dtFrame;
          if (this.dustT <= 0) {
            this.dustT = 0.03;
            if (p.mode === 'ship' || p.mode === 'ufo') this.parts.push({ k: 'sq', x: p.x - 0.5, y: p.y - 0.1, vx: -4, vy: (Math.random() - 0.5) * 2, g: 0, life: 0.35, max: 0.35, s: 5, c: Math.random() < 0.5 ? '#ffb23f' : '#ff5c3f', r: 0 });
            else if (p.onGround) this.parts.push({ k: 'sq', x: p.x - 0.4, y: p.gdir < 0 ? p.y - 0.45 : p.y + 0.45, vx: -3, vy: p.gdir < 0 ? 1.5 : -1.5, g: 0, life: 0.3, max: 0.3, s: 3, c: c1 + 'aa', r: 0 });
          }
        }
      }
      this.glow(px, py, 52, c1, 0.35);
      ctx.save(); ctx.translate(px, py);
      const flip = p.gdir > 0 ? -1 : 1;
      if (p.mode === 'cube') {
        let rot = p.spin;
        if (p.onGround) { rot = Math.round(rot / 90) * 90; p.spin = rot; }
        ctx.rotate((rot * Math.PI) / 180);
        this.cube(0, 0, 36, c1, c2, flip);
      } else if (p.mode === 'ship') {
        ctx.scale(1, flip); ctx.rotate(-flip * Math.atan2(p.vy, sim.L.speed) * 0.9);
        this.ship(c1, c2);
      } else if (p.mode === 'ball') {
        ctx.rotate((p.spin * Math.PI) / 180); this.ball(c1, c2);
      } else if (p.mode === 'ufo') {
        ctx.scale(1, flip); ctx.rotate(Math.max(-0.3, Math.min(0.3, -p.vy * 0.015 * flip)) * flip); this.ufo(c1, c2);
      } else if (p.mode === 'wave') {
        ctx.rotate(p.vy > 0 ? -Math.PI / 4 : Math.PI / 4); this.wave(c1, c2);
      }
      ctx.restore();
    }

    cube(x, y, s, c1, c2, flip) {
      const ctx = this.ctx, h = s / 2;
      const gr = ctx.createLinearGradient(-h, -h, h, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      ctx.fillStyle = gr; ctx.fillRect(x - h, y - h, s, s);
      ctx.lineWidth = 3; ctx.strokeStyle = '#06121a'; ctx.strokeRect(x - h, y - h, s, s);
      ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 2; ctx.strokeRect(x - h + 4, y - h + 4, s - 8, s - 8);
      // face
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 11, y - 8, 9, 9); ctx.fillRect(x + 2, y - 8, 9, 9);
      ctx.fillStyle = '#06121a';
      ctx.fillRect(x - 6, y - 5, 4, 5); ctx.fillRect(x + 7, y - 5, 4, 5);
      ctx.fillRect(x - 9, y + 6, 18, 4);
    }
    ship(c1, c2) {
      const ctx = this.ctx;
      ctx.beginPath(); ctx.moveTo(-24, 10); ctx.lineTo(-30, -2); ctx.lineTo(-14, 4); ctx.lineTo(26, 0); ctx.lineTo(18, 12); ctx.closePath();
      ctx.fillStyle = c2; ctx.fill(); ctx.strokeStyle = '#06121a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-18, 3); ctx.lineTo(-12, 14); ctx.lineTo(10, 14); ctx.lineTo(20, 3); ctx.closePath();
      ctx.fillStyle = c1; ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(-2, -9); ctx.scale(0.6, 0.6); this.cube(0, 0, 30, c1, c2, 1); ctx.restore();
    }
    ball(c1, c2) {
      const ctx = this.ctx;
      ctx.beginPath(); ctx.arc(0, 0, 19, 0, TAU); ctx.fillStyle = '#0b1a24'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = c1; ctx.stroke();
      ctx.strokeStyle = c2; ctx.lineWidth = 4;
      ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI; ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15); ctx.lineTo(-Math.cos(a) * 15, -Math.sin(a) * 15); } ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
    }
    ufo(c1, c2) {
      const ctx = this.ctx;
      ctx.save(); ctx.translate(0, -6); ctx.scale(0.62, 0.62); this.cube(0, 0, 30, c1, c2, 1); ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, 8, 26, 10, 0, 0, TAU); ctx.fillStyle = c2; ctx.fill(); ctx.strokeStyle = '#06121a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = c1; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 12, 9, 2.8, 0, TAU); ctx.fill(); }
    }
    wave(c1, c2) {
      const ctx = this.ctx;
      ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(18, 0); ctx.lineTo(-14, 12); ctx.lineTo(-7, 0); ctx.closePath();
      ctx.fillStyle = c1; ctx.fill(); ctx.strokeStyle = '#06121a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(2, 0, 3.5, 0, TAU); ctx.fill();
    }

    /* ---------------- particles ---------------- */
    drawParticles(camX) {
      const ctx = this.ctx;
      const sx = (x) => (x - camX) * B + PX, sy = (y) => GY - y * B;
      for (const p of this.parts) {
        const a = Math.max(0, p.life / p.max);
        const x = sx(p.x), y = sy(p.y);
        switch (p.k) {
          case 'ring':
            ctx.strokeStyle = p.c; ctx.globalAlpha = a; ctx.lineWidth = 3 * a + 1;
            ctx.beginPath(); ctx.arc(x, y, p.s * (1 - a) + 4, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; break;
          case 'sq': ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.save(); ctx.translate(x, y); ctx.rotate(p.r || 0); ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); ctx.restore(); ctx.globalAlpha = 1; break;
          case 'tri': ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.save(); ctx.translate(x, y); ctx.rotate(p.r || 0); ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.lineTo(p.s, p.s); ctx.lineTo(-p.s, p.s); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; break;
          case 'sp': ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(x, y, p.s * a + 0.5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; break;
          case 'glow': this.glow(x, y, p.s * 2, p.c, a); break;
          case 'txt':
            ctx.globalAlpha = Math.min(1, a * 1.5); ctx.fillStyle = p.c; ctx.font = '800 20px "Segoe UI", system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(p.txt, x, y); ctx.fillText(p.txt, x, y); ctx.globalAlpha = 1; break;
          default: break;
        }
      }
    }

    /* ---------------- HUD ---------------- */
    drawHUD(g, hue) {
      const ctx = this.ctx, sim = g.sim, L = g.L;
      const pct = Math.max(0, Math.min(1, sim.p.x / L.end));
      // progress bar
      const bw = 420, bx = (W - bw) / 2, by = 16;
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(bx, by, bw, 10);
      const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, hsl(hue, 100, 60)); gr.addColorStop(1, hsl(hue + 80, 100, 65));
      ctx.fillStyle = gr; ctx.fillRect(bx, by, bw * pct, 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, 10);
      if (g.bestPct > 0) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(bx + bw * g.bestPct - 1, by - 3, 2, 16); }
      ctx.fillStyle = '#fff'; ctx.font = '800 18px "Segoe UI", system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.floor(pct * 100) + '%', bx + bw + 12, by + 5);
      // score + combo
      ctx.textAlign = 'left';
      ctx.font = '800 22px "Segoe UI", system-ui'; ctx.fillStyle = '#fff';
      ctx.fillText(String(Math.floor(sim.score)).padStart(6, '0'), 18, 24);
      ctx.font = '700 11px "Segoe UI", system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('SCORE', 18, 44);
      if (sim.combo > 1) {
        const sc = 1 + Math.min(0.5, sim.comboT * 0.1);
        ctx.save(); ctx.translate(18, 70); ctx.scale(sc, sc);
        ctx.font = '900 26px "Segoe UI", system-ui'; ctx.fillStyle = '#ffd84d'; ctx.fillText('x' + Math.min(sim.combo, 5) + ' COMBO', 0, 0); ctx.restore();
      }
      // coins
      ctx.textAlign = 'right';
      for (let i = 0; i < L.coins.length; i++) {
        const cx = W - 24 - (L.coins.length - 1 - i) * 30, got = sim.coinGot[i] || (g.coinsKept && g.coinsKept[i]);
        ctx.beginPath(); ctx.arc(cx, 24, 10, 0, TAU);
        ctx.fillStyle = got ? '#ffcf3a' : 'rgba(255,255,255,0.12)'; ctx.fill();
        ctx.strokeStyle = got ? '#fff6b0' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
      }
      if (g.practice) {
        ctx.textAlign = 'right'; ctx.font = '800 14px "Segoe UI", system-ui'; ctx.fillStyle = '#5cff7a';
        ctx.fillText('PRACTICE  ·  Z checkpoint  ·  Bksp remove', W - 16, 54);
      }
      if (g.demo) {
        ctx.textAlign = 'center'; ctx.font = '800 16px "Segoe UI", system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('AUTOPLAY DEMO — press any key to play', W / 2, 50);
      }
      // mode hint on shooting
      if (g.hintFire) {
        ctx.textAlign = 'center'; ctx.font = '700 15px "Segoe UI", system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText(g.touchUI ? 'Hold the FIRE side to shoot' : 'X / right-click / FIRE button to shoot', g.touchUI ? W * 0.32 : W / 2, g.touchUI ? 100 : H - 16);
      }
    }
  }

  TS.Renderer = Renderer;
  TS.R = { W, H, B, PX, GY };
})();

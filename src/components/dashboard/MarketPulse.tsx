import { useEffect, useRef } from "react";

const CSS = `
.mp-seg{display:inline-flex;border:0.5px solid rgba(255,255,255,0.1);border-radius:9px;overflow:hidden;background:var(--mk-surface-2)}
.mp-seg>div{font-family:var(--font-mono);font-size:12px;padding:6px 15px;color:var(--mk-fg-dim);cursor:pointer;transition:color .2s ease,background .25s ease;user-select:none}
.mp-seg>div:hover{color:#c4c4cb}
.mp-seg>div.on{color:#06080A;background:#09B1BA}
.mp-tf .tfc{font-family:var(--font-mono);font-size:11px;padding:4px 10px;border-radius:6px;color:var(--mk-fg-dim);border:0.5px solid rgba(255,255,255,0.08);cursor:pointer;transition:all .2s ease;user-select:none}
.mp-tf .tfc:hover{color:#c4c4cb}
.mp-tf .tfc.on{color:#34D0D8;background:rgba(9,177,186,0.12);border-color:rgba(9,177,186,0.25)}
.mp-lg{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:11px;padding:5px 11px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.07);cursor:pointer;transition:opacity .2s ease,border-color .2s ease;color:#c4c4cb;user-select:none}
.mp-lg:hover{opacity:1 !important}
.mp-lg .d{width:9px;height:9px;border-radius:3px;display:inline-block;box-sizing:border-box;transition:all .2s ease}
.mp-tile{position:absolute;box-sizing:border-box;border-radius:6px;display:flex;flex-direction:column;justify-content:center;padding:6px 8px;overflow:hidden;opacity:0;transform:scale(.95);transition:opacity .45s ease,transform .45s ease,filter .15s ease;cursor:default}
.mp-tile.in{opacity:1;transform:scale(1)}
.mp-tile:hover{filter:brightness(1.18)}
`;

export function MarketPulse() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root: HTMLDivElement = rootRef.current;
    const ac = new AbortController();
    const sig = { signal: ac.signal } as AddEventListenerOptions;
    const NS = "http://www.w3.org/2000/svg";
    const S = (t: string, a?: Record<string, string | number>): SVGElement => {
      const e = document.createElementNS(NS, t);
      if (a) for (const k in a) e.setAttribute(k, String(a[k]));
      return e;
    };

    const SER = [
      { n: "Indice", c: "#09B1BA", d: 0.14, v: 0.9 },
      { n: "GPU", c: "#3B82F6", d: 0.24, v: 1.9 },
      { n: "CPU", c: "#F59E0B", d: -0.06, v: 1.3 },
      { n: "RAM", c: "#8B5CF6", d: 0.05, v: 1.0 },
      { n: "SSD", c: "#10B981", d: -0.13, v: 1.5 },
      { n: "MOBO", c: "#F472B6", d: 0.1, v: 0.85 },
      { n: "PSU", c: "#FB923C", d: 0.03, v: 0.6 },
    ];
    const TF: Record<string, number> = { "7J": 0.5, "30J": 1, "90J": 1.7 };
    const XL: Record<string, string[]> = {
      "7J": ["J\u20117", "J\u20115", "J\u20112", "Auj."],
      "30J": ["J\u201130", "J\u201120", "J\u201110", "Auj."],
      "90J": ["J\u201190", "J\u201160", "J\u201130", "Auj."],
    };
    const N = 30, W = 660, H = 250, PADL = 12, PADR = 30, PADT = 16, PADB = 40;
    const PW = W - PADL - PADR, PH = H - PADT - PADB, BASE = PADT + PH / 2;

    const rng = (s: number) => () => {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const hash = (str: string) => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    };
    const findS = (n: string) => SER.find((x) => x.n === n)!;
    const gen = (name: string, tf: string) => {
      const p = findS(name), f = TF[tf], r = rng(hash(name + tf));
      const a: number[] = []; let val = 100;
      for (let i = 0; i < N; i++) { val += p.d * f + (r() - 0.5) * p.v * f; a.push(val); }
      const b = a[0]; for (let i = 0; i < N; i++) a[i] = 100 + (a[i] - b);
      return a;
    };
    const cache: Record<string, Record<string, number[]>> = {};
    const dataFor = (tf: string) => {
      if (!cache[tf]) { cache[tf] = {}; SER.forEach((s) => { cache[tf][s.n] = gen(s.n, tf); }); }
      return cache[tf];
    };

    const state = {
      view: "chart", tf: "30J",
      vis: { Indice: true, GPU: true, CPU: true, RAM: false, SSD: false, MOBO: false, PSU: false } as Record<string, boolean>,
    };
    const xs: number[] = []; for (let i = 0; i < N; i++) xs.push(PADL + (i / (N - 1)) * PW);
    const timers: number[] = [];

    const q = (sel: string) => root.querySelector(sel) as Element;
    const Lgrid = q('[data-l="grid"]'), Larea = q('[data-l="area"]'), Lline = q('[data-l="line"]'),
      Ldot = q('[data-l="dot"]'), Lcross = q('[data-l="cross"]');
    const numEl = q(".mp-idxn") as HTMLElement, deltaEl = q(".mp-idxd") as HTMLElement,
      legendEl = q(".mp-legend") as HTMLElement, chartView = q(".mp-chart") as HTMLElement,
      mapView = q(".mp-map-view") as HTMLElement, svg = q(".mp-svg"),
      ctip = q(".mp-tip") as HTMLElement, mkmap = q(".mp-map") as HTMLElement;

    const area = S("path", { fill: "none", opacity: 0 }); Larea.appendChild(area);

    type Obj = {
      s: (typeof SER)[number]; glow: SVGElement; line: SVGElement; dot: SVGElement;
      cur: number[][] | null; op: number; wasVis: boolean;
      tgt?: number[][]; tOp?: number; sCur?: number[][]; sOp?: number;
    };
    const objs: Record<string, Obj> = {};
    SER.forEach((s) => {
      const glow = S("path", { fill: "none", stroke: s.c, "stroke-width": 4.5, opacity: 0, "stroke-linecap": "round", "stroke-linejoin": "round" });
      const line = S("path", { fill: "none", stroke: s.c, "stroke-width": 2, opacity: 0, "stroke-linecap": "round", "stroke-linejoin": "round" });
      Lline.appendChild(glow); Lline.appendChild(line);
      const dot = S("circle", { r: 2.8, fill: s.c, opacity: 0 }); Ldot.appendChild(dot);
      objs[s.n] = { s, glow, line, dot, cur: null, op: 0, wasVis: false };
    });
    const ring = S("circle", { r: 5, fill: "none", stroke: "#09B1BA", "stroke-width": 1.5, opacity: 0 });
    ring.appendChild(S("animate", { attributeName: "r", values: "5;15", dur: "2.1s", repeatCount: "indefinite" }));
    ring.appendChild(S("animate", { attributeName: "opacity", values: "0.55;0", dur: "2.1s", repeatCount: "indefinite" }));
    Ldot.appendChild(ring);

    const glines: SVGElement[] = [], glabels: SVGElement[] = [];
    for (let k = 0; k < 4; k++) {
      const ln = S("line", { x1: PADL, x2: PADL + PW, stroke: "rgba(255,255,255,0.05)", "stroke-width": 1 });
      Lgrid.appendChild(ln); glines.push(ln);
      const tx = S("text", { x: W - PADR + 6, "text-anchor": "start", "font-size": 12, fill: "#4A4A52" });
      tx.setAttribute("font-family", "var(--font-mono)"); Lgrid.appendChild(tx); glabels.push(tx);
    }
    const xlabels: SVGElement[] = [], xlx = [PADL, PADL + PW * 0.34, PADL + PW * 0.67, PADL + PW], xan = ["start", "middle", "middle", "end"];
    for (let k = 0; k < 4; k++) {
      const tx = S("text", { x: xlx[k], y: H - PADB + 22, "text-anchor": xan[k], "font-size": 12, fill: "#52525b" });
      tx.setAttribute("font-family", "var(--font-mono)"); Lgrid.appendChild(tx); xlabels.push(tx);
    }
    const vline = S("line", { stroke: "rgba(255,255,255,0.18)", "stroke-width": 1, opacity: 0 }); Lcross.appendChild(vline);
    const cdots: Record<string, SVGElement> = {};
    SER.forEach((s) => { const c = S("circle", { r: 3.4, fill: "#0A0A0B", stroke: s.c, "stroke-width": 2, opacity: 0 }); Lcross.appendChild(c); cdots[s.n] = c; });

    SER.forEach((s) => {
      const chip = document.createElement("div");
      chip.className = "mp-lg"; chip.setAttribute("data-s", s.n); chip.setAttribute("role", "button"); chip.tabIndex = 0;
      chip.innerHTML = '<span class="d"></span><span>' + s.n + "</span>";
      legendEl.appendChild(chip);
      chip.addEventListener("click", () => toggle(s.n), sig);
    });
    const chipStyle = (n: string) => {
      const chip = legendEl.querySelector('[data-s="' + n + '"]') as HTMLElement; if (!chip) return;
      const s = findS(n); const dot = chip.querySelector(".d") as HTMLElement;
      if (state.vis[n]) { chip.style.opacity = "1"; chip.style.borderColor = s.c + "66"; dot.style.background = s.c; dot.style.border = "none"; }
      else { chip.style.opacity = ".42"; chip.style.borderColor = "rgba(255,255,255,0.07)"; dot.style.background = "transparent"; dot.style.border = "1.5px solid #52525b"; }
    };
    SER.forEach((s) => chipStyle(s.n));

    const visList = () => SER.filter((s) => state.vis[s.n]).map((s) => s.n);
    const bounds = () => {
      const d = dataFor(state.tf), vis = visList(); if (!vis.length) return [96, 104];
      let mn = 1e9, mx = -1e9;
      vis.forEach((n) => { const a = d[n]; for (let i = 0; i < N; i++) { if (a[i] < mn) mn = a[i]; if (a[i] > mx) mx = a[i]; } });
      let pad = (mx - mn) * 0.18; if (pad < 1) pad = 1; return [mn - pad, mx + pad];
    };
    const ymap = (v: number, lo: number, hi: number) => PADT + (1 - (v - lo) / (hi - lo)) * PH;
    const pstr = (c: number[][]) => { let s = "M" + c[0][0].toFixed(1) + "," + c[0][1].toFixed(1); for (let i = 1; i < c.length; i++) s += " L" + c[i][0].toFixed(1) + "," + c[i][1].toFixed(1); return s; };
    const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let tStart = 0; const DUR = 700; let raf: number | null = null;
    let sNum = 100, tNum = 100, curNum = 100, curLo = 96, curHi = 104;

    function render(grow: boolean) {
      const d = dataFor(state.tf), b = bounds(); const lo = b[0], hi = b[1]; curLo = lo; curHi = hi;
      SER.forEach((s) => {
        const o = objs[s.n], vis = state.vis[s.n];
        const tgt: number[][] = []; for (let i = 0; i < N; i++) tgt.push([xs[i], ymap(d[s.n][i], lo, hi)]);
        o.tgt = tgt; o.tOp = vis ? 1 : 0;
        const became = vis && !o.wasVis;
        if (!o.cur || became || (grow && vis)) { o.cur = []; for (let i = 0; i < N; i++) o.cur.push([xs[i], BASE]); if (became || (grow && vis)) o.op = 0; }
        o.sCur = o.cur.map((p) => [p[0], p[1]]); o.sOp = o.op; o.wasVis = vis;
      });
      for (let k = 0; k < 4; k++) {
        const val = lo + (hi - lo) * (k / 3), yy = PADT + (1 - k / 3) * PH;
        glines[k].setAttribute("y1", String(yy)); glines[k].setAttribute("y2", String(yy));
        glabels[k].setAttribute("y", String(yy + 3)); glabels[k].textContent = val.toFixed(1);
      }
      const xl = XL[state.tf]; for (let k = 0; k < 4; k++) xlabels[k].textContent = xl[k];
      const idx = d["Indice"]; sNum = curNum; tNum = idx[N - 1];
      const dl = idx[N - 1] - idx[0];
      deltaEl.textContent = (dl >= 0 ? "\u25B2 +" : "\u25BC \u2212") + Math.abs(dl).toFixed(1) + "%";
      if (dl >= 0) { deltaEl.style.color = "#34D399"; deltaEl.style.background = "rgba(16,185,129,0.10)"; deltaEl.style.borderColor = "rgba(16,185,129,0.22)"; }
      else { deltaEl.style.color = "#F87171"; deltaEl.style.background = "rgba(239,68,68,0.10)"; deltaEl.style.borderColor = "rgba(239,68,68,0.22)"; }
      tStart = performance.now(); if (raf == null) raf = requestAnimationFrame(frame);
    }

    function frame(now: number) {
      const t = Math.min(1, (now - tStart) / DUR), e = easeIO(t), vis = visList();
      SER.forEach((s) => {
        const o = objs[s.n]; if (!o.tgt || !o.cur || !o.sCur) return;
        for (let i = 0; i < N; i++) o.cur[i] = [o.tgt[i][0], o.sCur[i][1] + (o.tgt[i][1] - o.sCur[i][1]) * e];
        o.op = (o.sOp ?? 0) + ((o.tOp ?? 0) - (o.sOp ?? 0)) * e;
        const ds = pstr(o.cur);
        o.glow.setAttribute("d", ds); o.line.setAttribute("d", ds);
        o.glow.setAttribute("opacity", (o.op * 0.17).toFixed(3)); o.line.setAttribute("opacity", o.op.toFixed(3));
        const lp = o.cur[N - 1]; o.dot.setAttribute("cx", String(lp[0])); o.dot.setAttribute("cy", String(lp[1])); o.dot.setAttribute("opacity", o.op.toFixed(3));
      });
      if (vis.length === 1) {
        const o = objs[vis[0]];
        if (o.cur) {
          let a = "M" + o.cur[0][0].toFixed(1) + "," + o.cur[0][1].toFixed(1);
          for (let i = 1; i < N; i++) a += " L" + o.cur[i][0].toFixed(1) + "," + o.cur[i][1].toFixed(1);
          a += " L" + o.cur[N - 1][0].toFixed(1) + "," + (PADT + PH) + " L" + o.cur[0][0].toFixed(1) + "," + (PADT + PH) + " Z";
          area.setAttribute("d", a); area.setAttribute("fill", "url(#grad-" + vis[0] + ")"); area.setAttribute("opacity", o.op.toFixed(3));
        }
      } else area.setAttribute("opacity", "0");
      if (state.vis["Indice"]) {
        const oi = objs["Indice"];
        if (oi.cur) { const l2 = oi.cur[N - 1]; ring.setAttribute("cx", String(l2[0])); ring.setAttribute("cy", String(l2[1])); ring.setAttribute("opacity", oi.op.toFixed(3)); }
      } else ring.setAttribute("opacity", "0");
      curNum = sNum + (tNum - sNum) * e; numEl.textContent = curNum.toFixed(1);
      if (t < 1) raf = requestAnimationFrame(frame); else raf = null;
    }

    function toggle(n: string) { state.vis[n] = !state.vis[n]; chipStyle(n); render(false); }

    svg.addEventListener("mousemove", (ev: Event) => {
      const e = ev as MouseEvent; const vis = visList();
      if (!vis.length) { vline.setAttribute("opacity", "0"); ctip.style.display = "none"; return; }
      const rect = (svg as SVGGraphicsElement).getBoundingClientRect(); const mx = ((e.clientX - rect.left) / rect.width) * W;
      let i = Math.round(((mx - PADL) / PW) * (N - 1)); if (i < 0) i = 0; if (i > N - 1) i = N - 1;
      const d = dataFor(state.tf), xx = xs[i];
      vline.setAttribute("x1", String(xx)); vline.setAttribute("x2", String(xx)); vline.setAttribute("y1", String(PADT)); vline.setAttribute("y2", String(PADT + PH)); vline.setAttribute("opacity", "1");
      let rows = "";
      SER.forEach((s) => {
        const cd = cdots[s.n];
        if (state.vis[s.n]) {
          const yy = ymap(d[s.n][i], curLo, curHi);
          cd.setAttribute("cx", String(xx)); cd.setAttribute("cy", String(yy)); cd.setAttribute("opacity", "1");
          rows += '<div style="display:flex;align-items:center;gap:7px;margin-top:3px"><span style="width:8px;height:8px;border-radius:2px;background:' + s.c + '"></span><span style="color:#a1a1aa;min-width:46px">' + s.n + '</span><span style="color:#fafafa">' + d[s.n][i].toFixed(1) + "</span></div>";
        } else cd.setAttribute("opacity", "0");
      });
      ctip.innerHTML = '<div style="color:#52525b;margin-bottom:2px">' + XL[state.tf][0].replace("\u2011", "-") + " \u2192 Auj.</div>" + rows;
      ctip.style.display = "block";
      const cvRect = chartView.getBoundingClientRect(); let lx = e.clientX - cvRect.left + 14;
      if (lx + 150 > cvRect.width) lx = e.clientX - cvRect.left - 150;
      ctip.style.left = lx + "px"; ctip.style.top = e.clientY - cvRect.top - 10 + "px";
    }, sig);
    svg.addEventListener("mouseleave", () => { vline.setAttribute("opacity", "0"); ctip.style.display = "none"; SER.forEach((s) => cdots[s.n].setAttribute("opacity", "0")); }, sig);

    const col = (ch: number): [string, string] => {
      if (ch >= 4) return ["#047857", "#D1FAE5"]; if (ch >= 1.5) return ["#065F46", "#A7F3D0"];
      if (ch >= 0.3) return ["#0E4D3A", "#6EE7B7"]; if (ch > -0.3) return ["#1C1C20", "#a1a1aa"];
      if (ch > -1.5) return ["#3D1414", "#FCA5A5"]; if (ch > -4) return ["#7A1D1D", "#FCA5A5"];
      return ["#991B1B", "#FECACA"];
    };
    const MD: [string, number][] = [["RTX 3060", 320], ["RTX 4070", 180], ["Ryzen 5 5600", 165], ["RX 580", 160], ["GTX 1660 Super", 150], ["RTX 3070", 150], ["i5-12400F", 140], ["RX 6700 XT", 140], ["Ryzen 5 3600", 130], ["RTX 4060", 130], ["RTX 3080", 120], ["i5-10400F", 120], ["RTX 2060", 110], ["DDR4 16GB", 110], ["RX 7600", 95], ["990 Pro 1TB", 90], ["i7-12700K", 85], ["870 EVO 1TB", 80], ["Ryzen 7 5800X", 75], ["DDR4 32GB", 70], ["B550", 65], ["DDR5 32GB", 60], ["SN850X 2TB", 55], ["RM750", 45]];

    function buildMap(tf: string) {
      mkmap.innerHTML = "";
      const Wm = mkmap.offsetWidth || 636, Hm = 300; let tot = 0; MD.forEach((d) => (tot += d[1]));
      const arr = MD.map((d) => { const r = rng(hash(d[0] + tf + "v")); const ch = r() * 12 - 6; return { name: d[0], ch: Math.round(ch * 10) / 10, a: (d[1] / tot) * Wm * Hm }; });
      arr.sort((a, b) => b.a - a.a);
      type R = { d: (typeof arr)[number]; x: number; y: number; w: number; h: number };
      const out: R[] = [];
      const worst = (rowv: number[], L: number) => { let s = 0, mx = -1e9, mn = 1e9; for (let i = 0; i < rowv.length; i++) { s += rowv[i]; if (rowv[i] > mx) mx = rowv[i]; if (rowv[i] < mn) mn = rowv[i]; } return Math.max((L * L * mx) / (s * s), (s * s) / (L * L * mn)); };
      let rect = { x: 0, y: 0, w: Wm, h: Hm }, i = 0;
      while (i < arr.length) {
        const vert = rect.w >= rect.h, L = vert ? rect.h : rect.w; const row: typeof arr = [], vals: number[] = [];
        while (i < arr.length) { const nv = vals.concat(arr[i].a); if (row.length === 0 || worst(vals, L) >= worst(nv, L)) { row.push(arr[i]); vals.push(arr[i].a); i++; } else break; }
        let s = 0; vals.forEach((v) => (s += v));
        if (vert) { const sw = s / rect.h; let cy = rect.y; row.forEach((n, j) => { const hh = vals[j] / sw; out.push({ d: n, x: rect.x, y: cy, w: sw, h: hh }); cy += hh; }); rect = { x: rect.x + sw, y: rect.y, w: rect.w - sw, h: rect.h }; }
        else { const sh = s / rect.w; let cx = rect.x; row.forEach((n, j) => { const ww = vals[j] / sh; out.push({ d: n, x: cx, y: rect.y, w: ww, h: sh }); cx += ww; }); rect = { x: rect.x, y: rect.y + sh, w: rect.w, h: rect.h - sh }; }
      }
      out.forEach((r, idx) => {
        const c = col(r.d.ch); const el = document.createElement("div"); el.className = "mp-tile";
        el.style.left = r.x + 2 + "px"; el.style.top = r.y + 2 + "px"; el.style.width = Math.max(0, r.w - 4) + "px"; el.style.height = Math.max(0, r.h - 4) + "px"; el.style.background = c[0]; el.style.color = c[1];
        const fs = Math.max(11, Math.min(20, Math.round(Math.sqrt(r.w * r.h) / 6))); let html = "";
        if (r.w > 44 && r.h > 26) {
          html += '<span style="font-family:var(--font-mono);font-weight:500;font-size:' + Math.min(fs, 15) + 'px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + r.d.name + "</span>";
          if (r.h > 44) { const sg = (r.d.ch > 0 ? "+" : "") + r.d.ch.toFixed(1) + "%"; html += '<span style="font-family:var(--font-mono);font-size:' + Math.min(fs + 2, 21) + 'px;font-weight:600;margin-top:3px">' + sg + "</span>"; }
        }
        el.innerHTML = html; mkmap.appendChild(el);
        const to = window.setTimeout(() => el.classList.add("in"), idx * 26); timers.push(to);
      });
    }

    function fadeIn(el: HTMLElement) {
      el.style.opacity = "0"; el.style.transform = "translateY(8px)";
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = "opacity .45s ease,transform .45s ease"; el.style.opacity = "1"; el.style.transform = "none"; }));
    }
    function showView(v: string) {
      if (v === state.view) return; state.view = v;
      root.querySelectorAll(".mp-seg > div").forEach((b) => b.classList.toggle("on", b.getAttribute("data-view") === v));
      if (v === "chart") { mapView.style.display = "none"; chartView.style.display = "block"; fadeIn(chartView); render(true); }
      else { chartView.style.display = "none"; mapView.style.display = "block"; fadeIn(mapView); buildMap(state.tf); }
    }
    root.querySelectorAll(".mp-seg > div").forEach((b) => b.addEventListener("click", () => showView(b.getAttribute("data-view") as string), sig));
    root.querySelectorAll(".mp-tf .tfc").forEach((c) => c.addEventListener("click", () => {
      const tf = c.getAttribute("data-tf") as string; if (tf === state.tf) return; state.tf = tf;
      root.querySelectorAll(".mp-tf .tfc").forEach((x) => x.classList.toggle("on", x.getAttribute("data-tf") === tf));
      if (state.view === "chart") render(false); else buildMap(tf);
    }, sig));

    render(true);

    return () => { ac.abort(); if (raf != null) cancelAnimationFrame(raf); timers.forEach((t) => clearTimeout(t)); };
  }, []);

  return (
    <div ref={rootRef} style={{ background: "var(--mk-surface-1)", border: "0.5px solid var(--mk-divider)", borderRadius: 16, padding: "18px 20px", color: "var(--mk-fg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h2 className="sr-only">Marché : bascule entre courbes superposables et carte du marché</h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div className="mp-seg">
          <div data-view="chart" className="on" role="button" tabIndex={0}>Tendances</div>
          <div data-view="map" role="button" tabIndex={0}>Carte</div>
        </div>
        <div className="mp-tf" style={{ display: "flex", gap: 6 }}>
          <span className="tfc" data-tf="7J" role="button" tabIndex={0}>7J</span>
          <span className="tfc on" data-tf="30J" role="button" tabIndex={0}>30J</span>
          <span className="tfc" data-tf="90J" role="button" tabIndex={0}>90J</span>
        </div>
      </div>

      <div className="mp-chart" style={{ position: "relative", marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 13, flexWrap: "wrap" }}>
          <span className="mp-idxn" style={{ fontFamily: "var(--font-mono)", fontSize: 42, fontWeight: 600, lineHeight: 1, color: "var(--mk-fg)" }}>100.0</span>
          <span className="mp-idxd" style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "4px 10px", borderRadius: 7, color: "#34D399", background: "rgba(16,185,129,0.10)", border: "0.5px solid rgba(16,185,129,0.22)" }}>{"\u25B2 +0.0%"}</span>
          <span style={{ fontSize: 12, color: "var(--mk-fg-faint)" }}>Indice Monark · base 100</span>
        </div>

        <svg className="mp-svg" viewBox="0 0 660 250" width="100%" style={{ display: "block", marginTop: 10, height: "auto", overflow: "visible" }} role="img" aria-label="Courbes superposables par catégorie, base 100">
          <defs>
            <linearGradient id="grad-Indice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#09B1BA" stopOpacity="0.32" /><stop offset="60%" stopColor="#09B1BA" stopOpacity="0.07" /><stop offset="100%" stopColor="#09B1BA" stopOpacity="0" /></linearGradient>
            <linearGradient id="grad-GPU" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.32" /><stop offset="60%" stopColor="#3B82F6" stopOpacity="0.07" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></linearGradient>
            <linearGradient id="grad-CPU" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" /><stop offset="60%" stopColor="#F59E0B" stopOpacity="0.07" /><stop offset="100%" stopColor="#F59E0B" stopOpacity="0" /></linearGradient>
            <linearGradient id="grad-RAM" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.32" /><stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.07" /><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" /></linearGradient>
            <linearGradient id="grad-SSD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity="0.32" /><stop offset="60%" stopColor="#10B981" stopOpacity="0.07" /><stop offset="100%" stopColor="#10B981" stopOpacity="0" /></linearGradient>
            <linearGradient id="grad-MOBO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F472B6" stopOpacity="0.32" /><stop offset="60%" stopColor="#F472B6" stopOpacity="0.07" /><stop offset="100%" stopColor="#F472B6" stopOpacity="0" /></linearGradient>
            <linearGradient id="grad-PSU" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FB923C" stopOpacity="0.32" /><stop offset="60%" stopColor="#FB923C" stopOpacity="0.07" /><stop offset="100%" stopColor="#FB923C" stopOpacity="0" /></linearGradient>
          </defs>
          <g data-l="grid" />
          <g data-l="area" />
          <g data-l="cross" />
          <g data-l="line" />
          <g data-l="dot" />
        </svg>
        <div className="mp-tip" style={{ position: "absolute", display: "none", pointerEvents: "none", background: "#141417", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#e4e4e7", zIndex: 5, whiteSpace: "nowrap" }} />
        <div className="mp-legend" style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }} />
      </div>

      <div className="mp-map-view" style={{ display: "none", marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--mk-fg-faint)" }}>Top volumes</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mk-fg-faint)" }}>{"\u22126%"}</span>
            <div style={{ display: "flex", gap: 3 }}>
              {["#991B1B", "#7A1D1D", "#3D1414", "#1C1C20", "#0E4D3A", "#065F46", "#047857"].map((c) => (<span key={c} style={{ width: 15, height: 10, borderRadius: 2, background: c }} />))}
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mk-fg-faint)" }}>+6%</span>
            <span style={{ fontSize: 11, color: "var(--mk-fg-faint)", marginLeft: 8 }}>taille = volume</span>
          </div>
        </div>
        <div className="mp-map" style={{ position: "relative", width: "100%", height: 300, overflow: "hidden" }} />
      </div>
    </div>
  );
}

export default MarketPulse;

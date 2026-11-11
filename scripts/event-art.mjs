/**
 * Generates the illustrated event artworks in public/events/<slug>.jpg.
 * Each artwork is an SVG scene in the flyer palette (umber, parchment, gold)
 * with the event's own evidence motif, rendered to JPG with Playwright.
 *
 *   node scripts/event-art.mjs            # needs `playwright` resolvable (npx playwright works)
 *
 * Replace any artwork later by uploading a poster in Admin → Events.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const W = 1600;
const H = 900;
const C = {
  night: "#0e0a07", mid: "#17110c", umber: "#2a1e14", bark: "#3a2a1b", olive: "#7a6440", moss: "#a68d5f",
  gold: "#cfa96b", goldSoft: "#e6cc98", parchment: "#f3e8d2", ember: "#b9652f", emberHot: "#e08a45",
};

// ---------- helpers ----------
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;

/** Smooth closed (or open) path through points (Catmull-Rom → cubic Bézier). */
function smooth(pts, closed = true) {
  const n = pts.length;
  const p = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? "Z" : "");
}

function paw(cx, cy, s, rot = 0, fill = C.night, extra = "") {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(-16 -16)" fill="${fill}" ${extra}>
    <ellipse cx="16" cy="21.5" rx="7" ry="6"/>
    <ellipse cx="7.5" cy="13" rx="2.6" ry="3.4" transform="rotate(-18 7.5 13)"/>
    <ellipse cx="12.8" cy="8" rx="2.6" ry="3.6" transform="rotate(-6 12.8 8)"/>
    <ellipse cx="19.2" cy="8" rx="2.6" ry="3.6" transform="rotate(6 19.2 8)"/>
    <ellipse cx="24.5" cy="13" rx="2.6" ry="3.4" transform="rotate(18 24.5 13)"/></g>`;
}

function fingerprint(cx, cy, scale, color, seed, opacity = 1) {
  const r = rng(seed);
  let out = `<g transform="translate(${cx} ${cy}) scale(${scale})" fill="none" stroke="${color}" stroke-linecap="round" opacity="${opacity}">`;
  for (let i = 0; i < 17; i++) {
    const rx = 8 + i * 5.4;
    const ry = 11 + i * 6.6;
    const c = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
    const gap = 6 + r() * 24;
    out += `<ellipse rx="${f(rx)}" ry="${f(ry)}" stroke-width="2.4" stroke-dasharray="${f(c * (0.2 + r() * 0.5))} ${f(gap)} ${f(c * 0.25)} ${f(gap * 1.6)}" stroke-dashoffset="${f(r() * c)}" transform="rotate(${f(-8 + r() * 16)})" opacity="${f(0.55 + r() * 0.45)}"/>`;
  }
  return out + "</g>";
}

function treeline(baseY, maxH, color, seed, density = 26, opacity = 1) {
  const r = rng(seed);
  let d = `M0 ${H}L0 ${baseY}`;
  let x = -40;
  while (x < W + 60) {
    const w = 50 + r() * 70;
    const h = maxH * (0.45 + r() * 0.55);
    const tiers = 3 + Math.floor(r() * 3);
    const cx = x + w / 2;
    d += `L${f(x)} ${baseY}`;
    for (let t = 0; t < tiers; t++) {
      const ty = baseY - (h * t) / tiers;
      const tw = (w / 2) * (1 - t / (tiers + 0.6));
      d += `L${f(cx - tw)} ${f(ty)}L${f(cx - tw * 0.45)} ${f(ty - h / tiers + 4)}`;
    }
    d += `L${f(cx)} ${f(baseY - h - 12)}`;
    for (let t = tiers - 1; t >= 0; t--) {
      const ty = baseY - (h * t) / tiers;
      const tw = (w / 2) * (1 - t / (tiers + 0.6));
      d += `L${f(cx + tw * 0.45)} ${f(ty - h / tiers + 4)}L${f(cx + tw)} ${f(ty)}`;
    }
    x += w * (0.55 + r() * 0.4) * (26 / density);
  }
  d += `L${W} ${baseY}L${W} ${H}Z`;
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

function topo(color, opacity) {
  let out = `<g fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.4">`;
  for (let i = 0; i < 9; i++) {
    const y = 80 + i * 90;
    out += `<path d="M-50 ${y}c180-90 360 60 560-15s340-130 520-45 240 90 620 10"/>`;
  }
  return out + "</g>";
}

function fireflies(seed, n = 18, area = [0, 0, W, H * 0.7]) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * area[2];
    const y = area[1] + r() * area[3];
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + r() * 2.5)}" fill="${C.goldSoft}" opacity="${f(0.35 + r() * 0.6)}" filter="url(#glow)"/>`;
  }
  return out;
}

function tape(x1, y1, x2, y2, text, color = C.gold) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  let words = "";
  for (let x = 30; x < len - 200; x += 640) words += `<text x="${x}" y="11" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="26" letter-spacing="6" fill="${C.night}">${text}</text>`;
  return `<g transform="translate(${x1} ${y1}) rotate(${f(ang)})" filter="url(#shadow)">
    <rect x="0" y="-26" width="${f(len)}" height="52" fill="${color}"/>
    <rect x="0" y="-26" width="${f(len)}" height="7" fill="url(#stripes)"/><rect x="0" y="19" width="${f(len)}" height="7" fill="url(#stripes)"/>
    ${words}</g>`;
}

function marker(x, y, s, n) {
  return `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#shadow)">
    <path d="M-34 30L0 -34L34 30Z" fill="${C.gold}"/><path d="M-34 30L0 -34L6 -22L-24 30Z" fill="#fff" opacity=".18"/>
    <text x="0" y="22" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="30" fill="${C.night}">${n}</text></g>`;
}

const defs = `<defs>
  <filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="bigglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .35  0 0 0 .55 0"/></filter>
  <pattern id="stripes" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="11" height="22" fill="${C.night}"/></pattern>
  <radialGradient id="vignette" cx="50%" cy="48%" r="75%"><stop offset="55%" stop-color="${C.night}" stop-opacity="0"/><stop offset="100%" stop-color="${C.night}" stop-opacity=".92"/></radialGradient>
  <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="60%" stop-color="${C.night}" stop-opacity="0"/><stop offset="100%" stop-color="${C.night}" stop-opacity=".85"/></linearGradient>
</defs>`;

/** Shared scene: sky glow at (gx, gy), topo lines, two treelines. */
function scene({ gx = 0.7, gy = 0.3, glow = C.gold, seed = 1, trees = true, sky = [C.bark, C.mid] }, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
  <radialGradient id="sky" cx="${gx * 100}%" cy="${gy * 100}%" r="85%"><stop offset="0%" stop-color="${sky[0]}"/><stop offset="100%" stop-color="${sky[1]}"/></radialGradient>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${gx * W}" cy="${gy * H}" r="320" fill="${glow}" opacity=".16" filter="url(#bigglow)"/>
  ${topo(C.gold, 0.07)}
  ${trees ? treeline(H * 0.66, 260, C.umber, seed, 30, 0.9) + treeline(H * 0.8, 200, "#1d150e", seed + 7, 24) : ""}
  ${body}
  <rect width="${W}" height="${H}" fill="url(#fadeBottom)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".16"/>
</svg>`;
}

// ---------- the artworks ----------
const ART = {
  // 1 · Crime scene in the forest: pugmark, evidence markers, magnifier, tape.
  "the-last-trace": () =>
    scene({ gx: 0.62, gy: 0.35, seed: 3 }, `
      <ellipse cx="760" cy="760" rx="760" ry="190" fill="${C.bark}"/>
      <ellipse cx="760" cy="760" rx="600" ry="140" fill="#46331f" opacity=".7"/>
      ${paw(700, 700, 9.5, -12, "#1a120b")}
      ${paw(708, 692, 9.5, -12, "none", `stroke="${C.goldSoft}" stroke-opacity=".25" stroke-width=".35"`)}
      ${paw(1040, 820, 5, -18, "#1a120b", 'opacity=".8"')}
      ${paw(430, 860, 4.2, -8, "#1a120b", 'opacity=".7"')}
      ${marker(470, 650, 1.6, 1)}${marker(980, 640, 1.35, 2)}${marker(1180, 760, 1.6, 3)}
      <g transform="translate(1220 420) rotate(-35)" filter="url(#shadow)">
        <rect x="-18" y="120" width="36" height="230" rx="14" fill="${C.umber}" stroke="${C.gold}" stroke-width="3"/>
        <circle r="135" fill="${C.goldSoft}" opacity=".12"/><circle r="135" fill="none" stroke="${C.gold}" stroke-width="18"/>
        <path d="M-80 -60 A100 100 0 0 1 -20 -105" stroke="#fff" stroke-opacity=".5" stroke-width="10" fill="none" stroke-linecap="round"/>
      </g>
      ${tape(-80, 250, 1000, -20, "CRIME SCENE · DO NOT CROSS")}
      ${fireflies(3, 14, [0, 80, W, 380])}`),

  // 2 · Forensic bench: fingerprint scan, colour-change test tubes, soil dish.
  "trace-evidence-relay": () =>
    scene({ gx: 0.68, gy: 0.4, seed: 5, glow: C.goldSoft }, `
      <rect x="0" y="640" width="${W}" height="260" fill="${C.umber}"/><rect x="0" y="640" width="${W}" height="6" fill="${C.gold}" opacity=".35"/>
      <g filter="url(#shadow)"><circle cx="1070" cy="380" r="250" fill="${C.mid}" stroke="${C.gold}" stroke-opacity=".5" stroke-width="3"/></g>
      ${fingerprint(1070, 395, 1.85, C.gold, 11)}
      <rect x="820" y="372" width="500" height="8" fill="${C.emberHot}" opacity=".85" filter="url(#glow)"/>
      <g fill="none" stroke="${C.gold}" stroke-width="5" opacity=".6"><path d="M800 140h-40v40M1340 140h40v40M800 640h-40v-40M1340 640h40v-40"/></g>
      ${[["#7a8a3a", "#a8b04a"], ["#a8923a", "#d9b14a"], [C.ember, C.emberHot]].map(([a, b], i) => `
        <g transform="translate(${250 + i * 130} 300)" filter="url(#shadow)">
          <rect x="-34" y="0" width="68" height="330" rx="34" fill="${C.parchment}" fill-opacity=".1" stroke="${C.parchment}" stroke-opacity=".6" stroke-width="4"/>
          <rect x="-30" y="${150 - i * 30}" width="60" height="${176 + i * 30}" rx="30" fill="${b}" opacity=".85"/>
          <rect x="-30" y="${150 - i * 30}" width="60" height="18" rx="9" fill="${a}"/>
          <rect x="-44" y="-12" width="88" height="20" rx="6" fill="${C.bark}" stroke="${C.gold}" stroke-width="2"/>
          <rect x="-18" y="40" width="8" height="200" rx="4" fill="#fff" opacity=".25"/></g>`).join("")}
      <rect x="180" y="610" width="440" height="30" rx="8" fill="${C.bark}" stroke="${C.gold}" stroke-opacity=".6" stroke-width="3"/>
      <g transform="translate(420 760)" filter="url(#shadow)"><ellipse rx="190" ry="62" fill="${C.parchment}" fill-opacity=".14" stroke="${C.parchment}" stroke-opacity=".55" stroke-width="4"/>
        ${Array.from({ length: 60 }, (_, i) => { const r = rng(i + 9); return `<circle cx="${f((r() - 0.5) * 300)}" cy="${f((r() - 0.5) * 80)}" r="${f(3 + r() * 6)}" fill="${["#6b4a2b", "#8a6a44", "#4a3420"][i % 3]}"/>`; }).join("")}</g>
      ${paw(1360, 780, 4, 20, "none", `stroke="${C.gold}" stroke-width=".5" opacity=".7"`)}`),

  // 3 · Shark below a dusk horizon; a sprout-shaped sun and rising chart dots above.
  "wild-shark-tank": () => {
    const shark = smooth([
      [700, 70], [640, 48], [540, 32], [450, 26], [400, -70], [395, -70], [350, 28], [250, 38], [140, 52], [60, 62], [-10, -20], [-18, -20], [15, 66], [-6, 128], [0, 130], [62, 78], [150, 88], [300, 102], [400, 104], [350, 180], [358, 182], [470, 100], [600, 96], [680, 84],
    ]);
    return scene({ gx: 0.5, gy: 0.3, seed: 8, trees: false, glow: C.emberHot }, `
      <rect y="420" width="${W}" height="480" fill="#120f0c"/>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2a22"/><stop offset="1" stop-color="#0b0a08"/></linearGradient>
      <rect y="430" width="${W}" height="470" fill="url(#sea)"/>
      ${Array.from({ length: 7 }, (_, i) => `<path d="M${620 + i * 60} 440 L${380 + i * 140} 900" stroke="${C.goldSoft}" stroke-opacity=".05" stroke-width="40"/>`).join("")}
      <circle cx="800" cy="300" r="110" fill="${C.goldSoft}" opacity=".9"/><circle cx="800" cy="300" r="170" fill="${C.emberHot}" opacity=".25" filter="url(#bigglow)"/>
      <path d="M800 410V250M800 300c-40-10-70-40-80-90 50 5 75 35 80 90zM800 280c30-12 55-40 60-85-40 8-60 35-60 85z" stroke="${C.umber}" stroke-width="10" fill="${C.olive}" stroke-linejoin="round"/>
      <g fill="none" stroke="${C.gold}" stroke-width="3" opacity=".55"><path d="M180 360L360 300L520 320L700 230"/><path d="M900 230L1080 180L1240 200L1420 110"/></g>
      ${[[180, 360], [360, 300], [520, 320], [1080, 180], [1240, 200], [1420, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${C.goldSoft}" filter="url(#glow)"/>`).join("")}
      <rect y="425" width="${W}" height="10" fill="${C.goldSoft}" opacity=".35"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${120 + i * 150} ${470 + (i % 3) * 30}h${60 + (i % 4) * 25}" stroke="${C.goldSoft}" stroke-opacity=".2" stroke-width="3"/>`).join("")}
      <g transform="translate(440 560) scale(1.05)"><path d="${shark}" fill="#050403" opacity=".95"/><circle cx="640" cy="62" r="5" fill="${C.goldSoft}" opacity=".6"/></g>
      <path d="M1180 432 L1240 330 L1290 432Z" fill="#050403"/><path d="M1150 434 q70 -12 170 0" stroke="${C.goldSoft}" stroke-opacity=".5" stroke-width="3" fill="none"/>
      ${Array.from({ length: 14 }, (_, i) => { const r = rng(i + 30); return `<circle cx="${f(300 + r() * 1100)}" cy="${f(520 + r() * 330)}" r="${f(2 + r() * 5)}" fill="none" stroke="${C.goldSoft}" stroke-opacity=".3"/>`; }).join("")}`);
  },

  // 4 · Campfire council at night: fire, tents, a hat-wearing silhouette, eyes in the dark.
  "the-poachers-tale": () => {
    const figure = smooth([
      [0, 0], [26, -6], [40, 4], [70, 8], [70, 16], [36, 18], [36, 40], [56, 60], [70, 120], [66, 200], [60, 300], [48, 410], [28, 410], [22, 300], [10, 300], [0, 410], [-20, 410], [-22, 300], [-30, 200], [-48, 140], [-60, 70], [-34, 46], [-24, 18], [-62, 16], [-62, 8], [-36, 4], [-24, -6],
    ]);
    const flame = (s, c, o) => `<path transform="translate(800 690) scale(${s})" d="${smooth([[0, -170], [40, -90], [70, -40], [60, 10], [20, 30], [-20, 30], [-60, 10], [-70, -40], [-30, -80], [-10, -60]])}" fill="${c}" opacity="${o}"/>`;
    return scene({ gx: 0.5, gy: 0.75, seed: 13, glow: C.emberHot, sky: ["#3a2412", "#0e0a07"] }, `
      <circle cx="800" cy="680" r="420" fill="${C.emberHot}" opacity=".22" filter="url(#bigglow)"/>
      <path d="M0 900V760q400-60 800-50t800 50V900Z" fill="#1a110a"/>
      <path d="M180 760 L330 560 L480 760Z" fill="#0b0805"/><path d="M330 560 L330 760" stroke="${C.ember}" stroke-opacity=".35" stroke-width="4"/>
      <path d="M1250 770 L1360 610 L1470 770Z" fill="#0b0805"/>
      ${flame(1.6, C.ember, 0.9)}${flame(1.2, C.emberHot, 0.95)}${flame(0.75, C.goldSoft, 1)}
      <g stroke="#2a1a0e" stroke-width="26" stroke-linecap="round"><path d="M690 740L910 690"/><path d="M700 690L910 745"/></g>
      ${Array.from({ length: 26 }, (_, i) => { const r = rng(i + 70); return `<circle cx="${f(700 + r() * 200)}" cy="${f(250 + r() * 380)}" r="${f(1.5 + r() * 2.5)}" fill="${C.goldSoft}" opacity="${f(0.4 + r() * 0.6)}" filter="url(#glow)"/>`; }).join("")}
      <g transform="translate(1080 360) scale(1.05)"><path d="${figure}" fill="#070504"/></g>
      ${[[180, 470], [1450, 450], [560, 430]].map(([x, y], i) => `<g filter="url(#glow)" opacity="${0.9 - i * 0.2}"><ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="${C.emberHot}"/><ellipse cx="${x + 30}" cy="${y}" rx="9" ry="5" fill="${C.emberHot}"/></g>`).join("")}`);
  },

  // 5 · Flood crossing: rising water, stepping platforms with tracks, rain, moon reflection.
  "flood-zone": () =>
    scene({ gx: 0.72, gy: 0.18, seed: 21, glow: C.parchment }, `
      <circle cx="1150" cy="160" r="70" fill="${C.parchment}" opacity=".85"/>
      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2a20"/><stop offset="1" stop-color="#0d0b08"/></linearGradient>
      <rect y="520" width="${W}" height="380" fill="url(#water)"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${1110 - (i % 4) * 14}" y="${540 + i * 22}" width="${60 + (i % 3) * 40}" height="4" fill="${C.parchment}" opacity="${f(0.45 - i * 0.025)}"/>`).join("")}
      ${Array.from({ length: 22 }, (_, i) => { const r = rng(i + 100); return `<path d="M${f(r() * W)} ${f(560 + r() * 320)}h${f(40 + r() * 120)}" stroke="${C.goldSoft}" stroke-opacity=".12" stroke-width="3"/>`; }).join("")}
      ${[[230, 820, 1], [470, 720, 0.9], [700, 790, 0.95], [930, 690, 0.85], [1160, 760, 0.9], [1390, 660, 0.8]].map(([x, y, s], i) => `
        <g transform="translate(${x} ${y}) scale(${s})" filter="url(#shadow)">
          <ellipse rx="120" ry="34" fill="#3d2c1c"/><ellipse cy="-8" rx="120" ry="30" fill="${C.olive}"/><ellipse cy="-8" rx="120" ry="30" fill="none" stroke="${C.goldSoft}" stroke-opacity=".35" stroke-width="3"/>
          ${i < 4 ? paw(0, -10, 1.9, 75, C.umber) : ""}
          <ellipse cy="22" rx="150" ry="16" fill="none" stroke="${C.goldSoft}" stroke-opacity=".2" stroke-width="3"/></g>`).join("")}
      <g stroke="${C.parchment}" stroke-opacity=".18" stroke-width="2">${Array.from({ length: 70 }, (_, i) => { const r = rng(i + 400); const x = r() * W; const y = r() * 600; return `<path d="M${f(x)} ${f(y)}l-14 44"/>`; }).join("")}</g>`),

  // 6 · Seven pugmarks climbing a path towards a numbered tag.
  "7-steps": () =>
    scene({ gx: 0.5, gy: 0.22, seed: 34 }, `
      <path d="M520 900 L760 330 L840 330 L1080 900Z" fill="#3a2a1b"/><path d="M560 900 L770 340 L830 340 L1040 900Z" fill="#46331f"/>
      ${Array.from({ length: 7 }, (_, i) => { const t = i / 6; const y = 840 - t * 470; const x = 800 + (i % 2 ? 1 : -1) * (70 - t * 45); const s = 4.6 - t * 3; return paw(x, y, s, 180 + (i % 2 ? 8 : -8), "#160f09") + `<text x="${f(x + (i % 2 ? 1 : -1) * (60 - t * 30))}" y="${f(y + 6)}" text-anchor="middle" font-family="DejaVu Serif, serif" font-weight="700" font-size="${f(34 - t * 18)}" fill="${C.goldSoft}" opacity=".8">${i + 1}</text>`; }).join("")}
      <g transform="translate(1150 300) rotate(8)" filter="url(#shadow)"><rect x="-70" y="-80" width="140" height="160" rx="10" fill="${C.parchment}"/><rect x="-60" y="-70" width="120" height="140" rx="6" fill="none" stroke="${C.umber}" stroke-width="4"/>
        <text y="52" text-anchor="middle" font-family="DejaVu Serif, serif" font-weight="700" font-size="130" fill="${C.umber}">7</text></g>
      <path d="M1150 220 v-60" stroke="${C.umber}" stroke-width="6"/>
      ${fireflies(34, 16)}`),

  // 7 · Camera lens with an aperture iris reflecting a wild cat's eye; viewfinder brackets; birds.
  "shutter-safari": () => {
    const blades = Array.from({ length: 8 }, (_, i) => `<path d="M0 0 L190 -40 L150 90Z" transform="rotate(${i * 45})" fill="${i % 2 ? "#1b140e" : "#231a12"}" stroke="${C.gold}" stroke-opacity=".25" stroke-width="2"/>`).join("");
    return scene({ gx: 0.5, gy: 0.5, seed: 55, glow: C.goldSoft }, `
      <g transform="translate(800 450)" filter="url(#shadow)">
        <circle r="360" fill="#0b0806"/><circle r="350" fill="none" stroke="#3a2a1b" stroke-width="22"/>
        ${Array.from({ length: 90 }, (_, i) => `<path d="M0 -360v14" transform="rotate(${i * 4})" stroke="${C.gold}" stroke-opacity=".35" stroke-width="3"/>`).join("")}
        <circle r="300" fill="#140f0b" stroke="${C.gold}" stroke-opacity=".5" stroke-width="4"/><circle r="250" fill="none" stroke="${C.goldSoft}" stroke-opacity=".2" stroke-width="2"/>
        <g clip-path="url(#lensClip)">${blades}</g>
        <clipPath id="lensClip"><circle r="240"/></clipPath>
        <radialGradient id="iris"><stop offset="0" stop-color="#3a2a10"/><stop offset=".5" stop-color="${C.gold}"/><stop offset="1" stop-color="#6b4a1a"/></radialGradient>
        <circle r="120" fill="url(#iris)"/>
        ${Array.from({ length: 48 }, (_, i) => `<path d="M0 -40 L0 -118" transform="rotate(${i * 7.5})" stroke="#4a3010" stroke-opacity=".5" stroke-width="2"/>`).join("")}
        <ellipse rx="22" ry="88" fill="#050403"/>
        <path d="M-150 -170 A230 230 0 0 1 60 -225" stroke="#fff" stroke-opacity=".35" stroke-width="16" fill="none" stroke-linecap="round"/>
        <circle cx="-60" cy="-60" r="14" fill="#fff" opacity=".7"/>
      </g>
      <g fill="none" stroke="${C.parchment}" stroke-opacity=".7" stroke-width="5"><path d="M120 120h80M120 120v80M1480 120h-80M1480 120v80M120 780h80M120 780v-80M1480 780h-80M1480 780v-80"/></g>
      <g fill="none" stroke="${C.parchment}" stroke-opacity=".55" stroke-width="5" stroke-linecap="round">${[[1290, 210, 1], [1360, 260, 0.7], [1230, 280, 0.6]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-40 0q20-24 40 0q20-24 40 0"/>`).join("")}</g>
      <circle cx="160" cy="160" r="10" fill="${C.ember}" filter="url(#glow)"/>`);
  },

  // 8 · Painted coaster: leaf + pugmark design, brushes and paint dabs on a work table.
  "strokes-of-wild": () =>
    scene({ gx: 0.5, gy: 0.45, seed: 61, trees: false, sky: ["#3d2b1b", "#140e09"] }, `
      ${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${80 + i * 100} H${W}" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`).join("")}
      <g transform="translate(800 450)" filter="url(#shadow)">
        <circle r="290" fill="#b08a5a"/>${Array.from({ length: 180 }, (_, i) => { const r = rng(i + 7); const a = r() * Math.PI * 2; const d = r() * 280; return `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(1 + r() * 3)}" fill="#7a5a36" opacity=".5"/>`; }).join("")}
        <circle r="250" fill="${C.parchment}"/><circle r="250" fill="none" stroke="${C.umber}" stroke-width="6"/><circle r="232" fill="none" stroke="${C.gold}" stroke-width="3" stroke-dasharray="10 12"/>
        <path d="M-40 170 C-200 90 -190 -110 -20 -190 C 40 -60 30 80 -40 170Z" fill="#5f7a3a"/><path d="M-40 170 C-40 40 -40 -60 -20 -190" stroke="#3e5222" stroke-width="6" fill="none"/>
        ${[-120, -60, 0, 60].map((y) => `<path d="M-38 ${y + 60} q-50 -30 -80 -80" stroke="#3e5222" stroke-width="4" fill="none"/>`).join("")}
        ${paw(80, 40, 5, 20, C.ember)}
        <path d="M-60 215 q60 -18 130 0" stroke="${C.ember}" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="translate(1250 300) rotate(35)" filter="url(#shadow)"><rect x="-10" y="-260" width="20" height="300" rx="10" fill="${C.ember}"/><rect x="-13" y="40" width="26" height="60" fill="#c9c2b4"/><path d="M-13 100 Q0 190 13 100Z" fill="#2a1e14"/><path d="M-6 150 Q0 185 6 150" fill="#5f7a3a"/></g>
      <g transform="translate(1360 560) rotate(60)" filter="url(#shadow)"><rect x="-8" y="-240" width="16" height="260" rx="8" fill="${C.gold}"/><rect x="-10" y="20" width="20" height="50" fill="#c9c2b4"/><path d="M-10 70 Q0 140 10 70Z" fill="#2a1e14"/></g>
      ${[[260, 300, C.ember], [340, 420, C.gold], [230, 560, "#5f7a3a"], [370, 640, C.parchment], [470, 520, "#3a6a7a"]].map(([x, y, c]) => `<path transform="translate(${x} ${y})" d="${smooth([[0, -40], [34, -20], [40, 18], [10, 40], [-30, 32], [-42, -6]])}" fill="${c}" filter="url(#shadow)"/>`).join("")}
      ${Array.from({ length: 24 }, (_, i) => { const r = rng(i + 300); return `<circle cx="${f(560 + r() * 520)}" cy="${f(120 + r() * 680)}" r="${f(2 + r() * 6)}" fill="${[C.ember, C.gold, "#5f7a3a"][i % 3]}" opacity=".7"/>`; }).join("")}`),

  // ---------- mini events ----------
  "wildlife-pictionary": () =>
    scene({ gx: 0.5, gy: 0.4, seed: 71 }, `
      <g transform="translate(800 440) rotate(-4)" filter="url(#shadow)"><rect x="-420" y="-270" width="840" height="540" fill="${C.parchment}"/>
        ${Array.from({ length: 12 }, (_, i) => `<path d="M-420 ${-230 + i * 44}H420" stroke="#9fb3c8" stroke-opacity=".35" stroke-width="2"/>`).join("")}
        <g fill="none" stroke="${C.umber}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="40" cy="10" rx="190" ry="115"/>
          <circle cx="-170" cy="-40" r="82"/>
          <path d="M-150 -100 C -60 -150 -20 -60 -60 10 C -90 40 -140 20 -150 -10"/>
          <path d="M-238 -10 C -270 60 -250 150 -205 175 C -185 185 -170 165 -185 150"/>
          <path d="M-200 -20 q-30 40 -20 70"/>
          <path d="M-90 110 v80 h45 v-70M10 120 v70 h45 v-70M100 120 v70 h45 v-70M170 100 v90 h45 v-110"/>
          <path d="M228 -10 q45 20 35 70"/><path d="M258 60 l-12 18 m12 -18 l14 14"/>
          <circle cx="-196" cy="-60" r="8" fill="${C.umber}"/>
        </g>
        <text x="300" y="-120" font-family="DejaVu Serif, serif" font-weight="700" font-size="150" fill="${C.ember}" opacity=".85">?</text></g>
      <g transform="translate(1260 650) rotate(-40)" filter="url(#shadow)"><rect x="-16" y="-300" width="32" height="300" fill="${C.gold}"/><path d="M-16 0 L0 50 L16 0Z" fill="#e8d2a8"/><path d="M-5 34 L0 50 L5 34Z" fill="${C.umber}"/><rect x="-16" y="-330" width="32" height="34" fill="${C.ember}"/></g>`),

  "wild-aim": () =>
    scene({ gx: 0.5, gy: 0.45, seed: 77 }, `
      <g transform="translate(800 430)" filter="url(#shadow)">
        ${[300, 240, 180, 120, 60].map((r, i) => `<circle r="${r}" fill="${i % 2 ? C.parchment : C.ember}"/>`).join("")}<circle r="22" fill="${C.umber}"/>
        <path d="M-300 0H300M0 -300V300" stroke="${C.umber}" stroke-opacity=".25" stroke-width="3"/></g>
      <g transform="translate(830 400) rotate(-28)" filter="url(#shadow)"><rect x="0" y="-12" width="300" height="24" rx="12" fill="${C.gold}"/><path d="M300 -12 L360 -40 L360 40 L300 12Z" fill="${C.goldSoft}"/><circle cx="-6" cy="0" r="20" fill="${C.ember}"/></g>
      <g stroke="${C.goldSoft}" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"><path d="M1230 190l90-50M1260 260l110-40M1240 330l100-10"/></g>`),

  "wild-eye": () =>
    scene({ gx: 0.5, gy: 0.45, seed: 83, glow: C.goldSoft }, `
      <g transform="translate(800 440)">
        <path d="M-520 0 Q0 -330 520 0 Q0 330 -520 0Z" fill="${C.parchment}" opacity=".95" filter="url(#shadow)"/>
        <radialGradient id="iris2"><stop offset="0" stop-color="#2a1a08"/><stop offset=".55" stop-color="${C.gold}"/><stop offset=".85" stop-color="#7a5a1a"/><stop offset="1" stop-color="#2a1a08"/></radialGradient>
        <circle r="190" fill="url(#iris2)"/>
        ${Array.from({ length: 60 }, (_, i) => `<path d="M0 -70 L0 -185" transform="rotate(${i * 6})" stroke="#3a2408" stroke-opacity=".45" stroke-width="2.5"/>`).join("")}
        <ellipse rx="36" ry="140" fill="#050403"/><circle cx="-60" cy="-70" r="26" fill="#fff" opacity=".85"/>
        <path d="M-520 0 Q0 -330 520 0" fill="none" stroke="${C.umber}" stroke-width="18"/><path d="M-520 0 Q0 330 520 0" fill="none" stroke="${C.umber}" stroke-width="10"/>
      </g>`),

  "fingerprint-paintings": () =>
    scene({ gx: 0.5, gy: 0.45, seed: 89, trees: false, sky: ["#3d2b1b", "#140e09"] }, `
      <rect x="220" y="140" width="1160" height="620" fill="${C.parchment}" filter="url(#shadow)" transform="rotate(-2 800 450)"/>
      <g transform="rotate(-2 800 450)">
        ${[[420, 520, "#5f7a3a"], [540, 480, "#7a9a4a"], [660, 500, "#5f7a3a"], [780, 460, "#7a9a4a"], [900, 480, "#5f7a3a"]].map(([x, y, c], i) => `<ellipse cx="${x}" cy="${y}" rx="62" ry="72" fill="${c}"/>${fingerprint(x, y, 0.55, "#2e3d1a", 200 + i, 0.6)}`).join("")}
        <circle cx="950" cy="430" r="66" fill="${C.ember}"/>${fingerprint(950, 430, 0.55, "#5a2a10", 210, 0.6)}
        <circle cx="930" cy="410" r="8" fill="#140e09"/><circle cx="975" cy="405" r="8" fill="#140e09"/><path d="M930 445 q20 18 40 0" stroke="#140e09" stroke-width="5" fill="none"/>
        <path d="M940 370 q-20 -60 -50 -70M975 368 q20 -60 50 -66" stroke="#140e09" stroke-width="5" fill="none"/>
        ${[420, 540, 660, 780, 900].map((x) => `<path d="M${x - 20} 585 v40M${x + 20} 585 v40" stroke="#140e09" stroke-width="5"/>`).join("")}
        <circle cx="1170" cy="300" r="70" fill="${C.ember}"/>${fingerprint(1170, 300, 0.6, "#5a2a10", 220, 0.55)}<path d="M1170 232 V368" stroke="#140e09" stroke-width="6"/>
        ${[[1140, 280], [1200, 270], [1150, 330], [1195, 335]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#140e09"/>`).join("")}
        <circle cx="400" cy="270" r="54" fill="${C.gold}"/>${fingerprint(400, 270, 0.48, "#7a5a1a", 230, 0.6)}
        <path d="M352 300 q-50 10 -70 60M448 300 q50 10 70 60" stroke="${C.gold}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".7"/>
      </g>`),

  "who-am-i": () =>
    scene({ gx: 0.5, gy: 0.45, seed: 97 }, `
      <clipPath id="zoom"><circle cx="760" cy="430" r="260"/></clipPath>
      <g clip-path="url(#zoom)"><rect x="480" y="150" width="560" height="560" fill="${C.gold}"/>
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${470 + i * 70} 140 q${40 + (i % 3) * 20} 140 ${-10 - (i % 2) * 30} 280 q30 120 ${10 + (i % 3) * 15} 300" stroke="#140e09" stroke-width="${26 + (i % 3) * 12}" fill="none" stroke-linecap="round"/>`).join("")}</g>
      <circle cx="760" cy="430" r="260" fill="none" stroke="${C.parchment}" stroke-width="26" filter="url(#shadow)"/>
      <path d="M950 620 L1180 850" stroke="${C.umber}" stroke-width="58" stroke-linecap="round"/><path d="M950 620 L1180 850" stroke="${C.gold}" stroke-width="10" stroke-opacity=".5" stroke-linecap="round"/>
      <path d="M600 260 A200 200 0 0 1 740 200" stroke="#fff" stroke-opacity=".35" stroke-width="14" fill="none" stroke-linecap="round"/>
      <text x="1200" y="420" font-family="DejaVu Serif, serif" font-weight="700" font-size="260" fill="${C.goldSoft}" opacity=".9" filter="url(#shadow)">?</text>`),

  "memory-game": () =>
    scene({ gx: 0.5, gy: 0.45, seed: 101, trees: false, sky: ["#3d2b1b", "#140e09"] }, `
      ${Array.from({ length: 20 }, (_, i) => {
        const c = i % 5, r = Math.floor(i / 5);
        const x = 330 + c * 240, y = 160 + r * 165;
        const up = i === 6 || i === 13;
        return `<g transform="translate(${x} ${y}) rotate(${((i * 37) % 9) - 4})" filter="url(#shadow)">
          <rect x="-95" y="-70" width="190" height="140" rx="14" fill="${up ? C.parchment : C.umber}" stroke="${C.gold}" stroke-opacity="${up ? 0.9 : 0.5}" stroke-width="4"/>
          ${up ? paw(0, 0, 3.2, 0, C.ember) : `<rect x="-78" y="-53" width="156" height="106" rx="8" fill="none" stroke="${C.gold}" stroke-opacity=".3" stroke-width="2"/>${paw(0, 0, 1.6, 0, C.gold, 'opacity=".35"')}`}</g>`;
      }).join("")}
      <path d="M570 325 C 700 260, 900 420, 1050 490" stroke="${C.goldSoft}" stroke-width="4" stroke-dasharray="10 12" fill="none" opacity=".7"/>`),
};

// ---------- render ----------
const outDir = path.resolve("public/events");
mkdirSync(outDir, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [slug, make] of Object.entries(ART)) {
  if (process.argv[2] && process.argv[2] !== slug) continue;
  await page.setContent(`<html><body style="margin:0;background:#000">${make()}</body></html>`);
  await page.screenshot({ path: path.join(outDir, `${slug}.jpg`), type: "jpeg", quality: 84 });
  if (process.env.SAVE_SVG) writeFileSync(path.join(outDir, `${slug}.svg`), make());
  console.log("✓", slug);
}
await browser.close();

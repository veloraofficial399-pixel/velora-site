#!/usr/bin/env node
/**
 * Records a short looping preview video for every design:
 * the invitation is opened automatically, then scrolled slowly to the bottom.
 *
 *   node scripts/record-previews.mjs          # record all designs
 *   node scripts/record-previews.mjs A1 C3    # record only these codes
 *   node scripts/record-previews.mjs --local  # record the demo sites running on this Mac (ports from
 *                                             # <TEMPLATES_DIR>/_review/rows.json) instead of the URLs in templates.ts
 *
 * Needs Google Chrome and ffmpeg. Output: public/previews/<CODE>.mp4 (540×960, for the grid cards)
 * and <CODE>.jpg (poster of the closed invitation).
 * Re-run it whenever a design is added or changed in src/data/templates.ts.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'previews');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const W = 390;
const H = 693; // 9:16 story
const SCALE = 2; // device pixel ratio → sharp 780×1386 frames, downscaled to 540×960
// Loop: closed invitation → it opens → a short scroll → (video loops back to the closed invitation).
const SCROLL_MS = 3500; // only a little scroll, not the whole page
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Per-design tweaks for sites the automatic "open" detection gets wrong.
// tap: [x, y] as fractions of the screen (where the real opening target is). wait: extra settle time (ms).
const OVERRIDES = {
  B4: { screencast: true, afterOpen: 4500 }, // heavy Next.js page (long intro): screenshot polling is too slow (choppy video)
  C3: { screencast: true },
  A2: { tap: [0.5, 0.47] }, // envelope with wax seal
  A6: { tap: [0.5, 0.45] }, // green envelope
  C1: { tap: [0.5, 0.5] }, // navy envelope (whole card is the button)
  E3: { tap: [0.5, 0.5] }, // DA monogram envelope
  B1: { wait: 6000 }, // heavy background image; the button ignores taps until it has loaded
  B3: { wait: 6000 }, // long fade-in intro
  B8: { jsClick: '.ribbon-btn' }, // the ribbon bow button: a real touch doesn't reach it, a DOM click does
  D7: { tap: [0.5, 0.44] }, // the wax seal
  E2: { wait: 5000 }, // ticket page wires its click handler late
  E5: { wait: 4000 },
  A5: { tap: [0.5, 0.64] }, // the temple door's touch icon
  A1: { hide: ['.skip-intro', 'button[aria-label*="sound" i]', 'button[aria-label*="skip" i]'] },
  C2: { hide: ['button[aria-label*="skip" i]', '.skip', '.skip-opening', '.music-toggle', '.music-btn'] },
};

// Static stylesheet added to every page (no timers / scripts running while recording): hides music / sound / skip controls.
// Per-design extra selectors: OVERRIDES[code].hide = ['.some-css-selector'].
const HIDE_SELECTORS = [
  'button[aria-label*="music" i]', 'button[aria-label*="sound" i]', 'button[aria-label*="mute" i]', 'button[aria-label*="audio" i]',
  '[role=button][aria-label*="music" i]', '[role=button][aria-label*="sound" i]',
  '#music-toggle', '#musicBtn', '#music-btn', '#musicToggle', '.music-toggle', '.music-fab', '.music-btn', '.music-button', '#rv-mute', '.mute-btn', '#mute-btn',
  '.skip-intro', '.skip-btn', '#skip-btn', '#skipBtn', '#skip', '.skip', '.skip-button', '#skipIntro', '.intro-skip', '#audio-toggle', '.audio-toggle', '.sound-toggle',
];
const STYLE_SRC = (extra) => `(() => {
  const css = ${JSON.stringify([...HIDE_SELECTORS].join(',\n'))} + ${JSON.stringify('')} + (${JSON.stringify(extra)}.length ? ',' + ${JSON.stringify(extra)}.join(',') : '');
  const add = () => { if (!document.documentElement || document.getElementById('__rec_hide')) return; const st = document.createElement('style'); st.id = '__rec_hide'; st.textContent = css + '{visibility:hidden!important}'; document.documentElement.appendChild(st); };
  add(); document.addEventListener('DOMContentLoaded', add);
})();`;

// (older approach, unused) Runs inside every page: hides small floating controls (music toggles, "Sound on", "Skip intro", "Pause music"...).
// Never touches the big "open invitation" buttons. Per-design extra selectors: OVERRIDES[code].hide = ['.some-css-selector'].
const CLEANUP = (extra) => `(() => {
  const BAD = /^(skip( [a-z]+)?|sound( on| off)?|music( on| off)?|mute|unmute|pause music|play music|pause|play)\\s*[↗›>▶⏵]?$/i;
  const LABEL = /(music|sound|mute|audio|skip)/i;
  const extra = ${JSON.stringify(extra)};
  const hide = () => {
    for (const el of document.querySelectorAll('button, a, [role=button], div, span')) {
      const r = el.getBoundingClientRect();
      if (r.width > 190 || r.height > 90 || r.width < 8) continue;
      const cs = getComputedStyle(el);
      const floating = cs.position === 'fixed' || cs.position === 'absolute' || cs.position === 'sticky' || el.matches('button, [role=button], a');
      const text = (el.innerText || '').trim();
      if (/(open|begin|enter|start|unveil|reveal|untie|tap to|click to|view)/i.test(text) && !BAD.test(text)) continue;
      const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
      if (floating && ((text.length < 22 && BAD.test(text)) || (label && LABEL.test(label) && el.matches('button, [role=button], a')))) el.style.setProperty('visibility', 'hidden', 'important');
    }
    for (const sel of extra) document.querySelectorAll(sel).forEach((e) => e.style.setProperty('visibility', 'hidden', 'important'));
  };
  hide();
})();`;

// Read [code, name, url] rows from the template data file.
const source = readFileSync(join(ROOT, 'src', 'data', 'templates.ts'), 'utf8');
let designs = [...source.matchAll(/\['([A-Z]\d+)',\s*'[^']*',\s*'(https?:\/\/[^']+)'/g)].map((m) => ({ code: m[1], url: m[2] }));
const only = process.argv.slice(2).filter((s) => !s.startsWith('--')).map((s) => s.toUpperCase());
if (process.argv.includes('--local')) {
  const dir = process.env.TEMPLATES_DIR || join(ROOT, '..', '..', 'templates');
  const rows = JSON.parse(readFileSync(join(dir, '_review', 'rows.json'), 'utf8'));
  const port = Object.fromEntries(rows.map((r) => [r.code, r.port]));
  designs = designs.map((d) => ({ ...d, url: `http://127.0.0.1:${port[d.code]}/` }));
}
if (only.length) designs = designs.filter((d) => only.includes(d.code));
if (!designs.length) throw new Error('No designs found to record');
mkdirSync(OUT, { recursive: true });

// ---- Chrome DevTools Protocol helpers ----
const profile = mkdtempSync(join(tmpdir(), 'velora-rec-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
for (let i = 0; i < 50; i++) {
  try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(200); }
}

async function openTab() {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
    else if (m.method && listeners.has(m.method)) listeners.get(m.method)(m.params);
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const close = () => fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`);
  return { send, on: (ev, fn) => listeners.set(ev, fn), close };
}

// Finds the "open invitation" style button and returns its centre, or null.
const FIND_OPEN_BUTTON = `(() => {
  const re = /(open|tap|begin|enter|start|view|unveil|click|reveal|explore|break the seal|invitation)/i;
  const els = [...document.querySelectorAll('button, a, [role=button], [onclick], div, span, p')];
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 20 && r.height > 12 && r.bottom > 0 && r.top < innerHeight && s.visibility !== 'hidden' && s.opacity !== '0'; };
  const score = (el) => (el.matches('button, a, [role=button]') ? 2 : 0) + (getComputedStyle(el).cursor === 'pointer' ? 1 : 0);
  const hits = els.filter((el) => visible(el) && re.test(el.innerText || '') && (el.innerText || '').length < 60)
    .sort((a, b) => score(b) - score(a) || (a.innerText.length - b.innerText.length));
  const el = hits[0];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2, text: el.innerText.trim().slice(0, 40) });
})()`;

async function tap(send, x, y) {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  // Some sites only listen for mouse clicks.
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
  }
}

async function record({ code, url }) {
  const { send, on, close } = await openTab();
  const frames = [];
  const dir = mkdtempSync(join(tmpdir(), `velora-${code}-`));
  try {
    // Render at a phone viewport with a high pixel ratio for crisp frames.
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: true });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await send('Page.enable');
    // Hide the template's own floating controls (music / sound / skip buttons) so the card shows only the invitation.
    const clean = () => null; if (OVERRIDES[code]?.hide?.length) await send('Page.addScriptToEvaluateOnNewDocument', { source: STYLE_SRC(OVERRIDES[code].hide) });
    const _unused = () => send('Runtime.evaluate', { expression: process.argv.includes('--clean-noop') ? '0' : CLEANUP(OVERRIDES[code]?.hide || []) });
    await send('Page.navigate', { url });
    // wait for every image/video/script to finish loading (big templates need >6 s), then let intro animations settle
    for (let i = 0; i < 60; i++) {
      const ready = (await send('Runtime.evaluate', { expression: "document.readyState === 'complete'", returnByValue: true })).result?.value;
      if (ready) break;
      await sleep(500);
    }
    await sleep(4500 + (OVERRIDES[code]?.wait ?? 0));

    // Capture fixed-size frames continuously, stamped with wall-clock time.
    let capturing = true;
    let paused = false; // capture stops while we retry a tap, so a heavy page gets the CPU it needs
    // screencast mode (heavy pages): Chrome pushes every painted frame instead of us polling slow screenshots
    const cast = OVERRIDES[code]?.screencast !== false; // default: screencast (smooth); set screencast:false to use screenshot polling
    if (cast) {
      on('Page.screencastFrame', (p) => {
        if (capturing && !paused) frames.push({ data: p.data, t: p.metadata.timestamp });
        send('Page.screencastFrameAck', { sessionId: p.sessionId });
      });
      await send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W * SCALE, maxHeight: H * SCALE, everyNthFrame: 1 });
    }
    const capture = (async () => {
      while (capturing && !cast) {
        if (paused) { await sleep(25); continue; }
        const t = Date.now() / 1000;
        const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, optimizeForSpeed: true });
        if (shot.data) frames.push({ data: shot.data, t });
      }
    })();

    await clean();
    await sleep(1500); // show the closed invitation first
    const btn = (await send('Runtime.evaluate', { expression: FIND_OPEN_BUTTON, returnByValue: true })).result?.value;
    let manual = OVERRIDES[code]?.tap;
    if (OVERRIDES[code]?.tapSelector) {
      const c = (await send('Runtime.evaluate', { returnByValue: true, expression: `(() => { const e = document.querySelector(${JSON.stringify(OVERRIDES[code].tapSelector)}); if (!e) return null; const r = e.getBoundingClientRect(); return JSON.stringify([(r.left + r.width / 2) / innerWidth, (r.top + r.height / 2) / innerHeight]); })()` })).result?.value;
      if (c) manual = JSON.parse(c);
    }
    const target = manual
      ? { x: W * manual[0], y: H * manual[1], text: '(manual tap point)' }
      : btn ? JSON.parse(btn) : { x: W / 2, y: H * 0.75, text: '(centre tap)' };
    const sizeBefore = frames.length ? frames[frames.length - 1].data.length : 0;
    if (OVERRIDES[code]?.jsClick) {
      await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(OVERRIDES[code].jsClick)})?.click()` });
    } else {
      await tap(send, target.x, target.y);
    }
    // Some pages wire their click handler late: if the invitation is still closed, pause capture and tap again (max 4 times)
    const stillClosed = async () => {
      if (manual) { const n = frames.length ? frames[frames.length - 1].data.length : 0; return Math.abs(n - sizeBefore) / Math.max(1, sizeBefore) < 0.012; }
      const again = (await send('Runtime.evaluate', { expression: FIND_OPEN_BUTTON, returnByValue: true })).result?.value;
      const op = (await send('Runtime.evaluate', { returnByValue: true, expression: `(() => { const els=[...document.querySelectorAll('button,a,[role=button],div,span,p')].filter(e=>/(open|tap|begin|enter|click|untie)/i.test(e.innerText||'')&&(e.innerText||'').length<60); return els.length? Math.max(...els.map(e=>+getComputedStyle(e).opacity||0)) : 0 })()` })).result?.value;
      return again && op >= 0.9 ? JSON.parse(again) : false;
    };
    await sleep(1200);
    let closed = OVERRIDES[code]?.jsClick ? false : await stillClosed();
    if (closed) {
      paused = true;
      for (let retry = 0; retry < 4 && closed; retry++) {
        console.log(`  ${code}: still closed, tapping again`);
        const p = manual ? target : closed;
        await sleep(500);
        await tap(send, p.x, p.y);
        await sleep(1400);
        closed = await stillClosed();
      }
      paused = false;
    }
    for (const wait of [800, 1200, 1000]) { await sleep(wait); await clean(); } // opening animation; controls appear after the tap
    if (OVERRIDES[code]?.afterOpen) await sleep(OVERRIDES[code].afterOpen); // long opening animations: let the page unlock scrolling first

    // Smooth wheel scrolling (works for window and inner scroll containers), paced by elapsed time.
    await clean();
    const start = Date.now();
    let last = start;
    while (Date.now() - start < SCROLL_MS) {
      await sleep(40);
      const now = Date.now();
      const deltaY = Math.round((now - last) * 0.35); // ≈350px per second
      last = now;
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: W / 2, y: H / 2, deltaX: 0, deltaY });
    }
    await sleep(1200);
    capturing = false;
    await capture;
    if (cast) await send('Page.stopScreencast');
    console.log(`  ${code}: tapped "${target.text}", ${frames.length} frames`);

    // Write frames with their real durations, then encode.
    if (frames.length < 2) throw new Error('no frames captured');
    let list = '';
    frames.forEach((f, i) => {
      const file = join(dir, `${String(i).padStart(5, '0')}.jpg`);
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      const next = frames[i + 1]?.t ?? f.t + 0.5;
      const gap = next - f.t;
      list += `file '${file}'\nduration ${Math.max(0.02, gap > 0.6 ? 0.08 : gap).toFixed(3)}\n`;
    });
    list += `file '${join(dir, `${String(frames.length - 1).padStart(5, '0')}.jpg`)}'\n`;
    writeFileSync(join(dir, 'list.txt'), list);

    // 1) Near-lossless master, 30 fps.
    const master = join(dir, 'master.mp4');
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'),
      '-vf', 'scale=540:960:force_original_aspect_ratio=increase:flags=lanczos,crop=540:960,fps=30,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-an', master]);

    // 2) Cut out black stretches (some sites fade to black while opening). A black opening screen is kept short.
    const blacks = await blackRanges(master);
    const cuts = blacks.map(([s, e]) => (s < 0.05 ? [0.6, e] : [s + 0.08, e - 0.08])).filter(([s, e]) => e - s > 0.1);
    const select = cuts.length
      ? `select='not(${cuts.map(([s, e]) => `between(t,${s.toFixed(2)},${e.toFixed(2)})`).join('+')})',setpts=N/30/TB,`
      : '';
    if (cuts.length) console.log(`  ${code}: trimmed black ${cuts.map(([s, e]) => `${s.toFixed(1)}–${e.toFixed(1)}s`).join(', ')}`);

    // 3) Final grid-card video.
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', master, '-vf', `${select}format=yuv420p`, '-r', '30',
      '-c:v', 'libx264', '-preset', 'slower', '-crf', '31', '-movflags', '+faststart', '-an', join(OUT, `${code}.mp4`)]);
    // Poster = the closed invitation (first frame).
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(OUT, `${code}.mp4`), '-frames:v', '1', '-q:v', '4', join(OUT, `${code}.jpg`)]);
  } finally {
    await close();
    rmSync(dir, { recursive: true, force: true });
  }
}

function run(cmd, args) {
  return new Promise((res, rej) => spawn(cmd, args, { stdio: 'inherit' }).on('exit', (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`)))));
}

/** [start, end] seconds of near-black stretches longer than 0.25s. */
function blackRanges(file) {
  return new Promise((res) => {
    let log = '';
    const p = spawn('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=0.25:pix_th=0.12', '-an', '-f', 'null', '-']);
    p.stderr.on('data', (d) => (log += d));
    p.on('exit', () => res([...log.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => [+m[1], +m[2]])));
  });
}

console.log(`Recording ${designs.length} design preview(s) → public/previews/`);
const failed = [];
// One at a time so each site gets full CPU and bandwidth (keeps animations smooth).
for (const d of designs) {
  try { await record(d); } catch (e) { failed.push(d.code); console.error(`  ${d.code}: FAILED — ${e.message}`); }
}
chrome.kill();
await sleep(800);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still be closing */ }
if (failed.length) { console.error(`Failed: ${failed.join(', ')}`); process.exit(1); }
console.log('Done.');

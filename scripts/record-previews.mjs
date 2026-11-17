#!/usr/bin/env node
/**
 * Records a short looping preview video for every design:
 * the invitation is opened automatically, then scrolled slowly to the bottom.
 *
 *   node scripts/record-previews.mjs          # record all designs
 *   node scripts/record-previews.mjs A1 C3    # record only these codes
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
  B1: { wait: 6000 }, // heavy background image; the button ignores taps until it has loaded
  B2: { wait: 6000 }, // long fade-in intro
  B6: { tap: [0.5, 0.6] }, // the ribbon, not the hint text below it
  D5: { tap: [0.5, 0.44] }, // the wax seal
};

// Read [code, name, url] rows from the template data file.
const source = readFileSync(join(ROOT, 'src', 'data', 'templates.ts'), 'utf8');
let designs = [...source.matchAll(/\['([A-Z]\d+)',\s*'[^']*',\s*'(https?:\/\/[^']+)'/g)].map((m) => ({ code: m[1], url: m[2] }));
const only = process.argv.slice(2).map((s) => s.toUpperCase());
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
    await send('Page.navigate', { url });
    await sleep(6000 + (OVERRIDES[code]?.wait ?? 0)); // let fonts, images and intro animations settle

    // Capture fixed-size frames continuously, stamped with wall-clock time.
    let capturing = true;
    const capture = (async () => {
      while (capturing) {
        const t = Date.now() / 1000;
        const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, optimizeForSpeed: true });
        if (shot.data) frames.push({ data: shot.data, t });
      }
    })();

    await sleep(1500); // show the closed invitation first
    const btn = (await send('Runtime.evaluate', { expression: FIND_OPEN_BUTTON, returnByValue: true })).result?.value;
    const manual = OVERRIDES[code]?.tap;
    const target = manual
      ? { x: W * manual[0], y: H * manual[1], text: '(manual tap point)' }
      : btn ? JSON.parse(btn) : { x: W / 2, y: H * 0.75, text: '(centre tap)' };
    await tap(send, target.x, target.y);
    await sleep(3000); // opening animation

    // Smooth wheel scrolling (works for window and inner scroll containers), paced by elapsed time.
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
    console.log(`  ${code}: tapped "${target.text}", ${frames.length} frames`);

    // Write frames with their real durations, then encode.
    if (frames.length < 2) throw new Error('no frames captured');
    let list = '';
    frames.forEach((f, i) => {
      const file = join(dir, `${String(i).padStart(5, '0')}.jpg`);
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      const next = frames[i + 1]?.t ?? f.t + 0.5;
      list += `file '${file}'\nduration ${Math.max(0.02, next - f.t).toFixed(3)}\n`;
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

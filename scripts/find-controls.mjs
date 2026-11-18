#!/usr/bin/env node
// Finds the music / sound / skip controls floating over each demo (after it is opened) and prints CSS selectors for them.
// usage: node scripts/find-controls.mjs <code> <url>
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [code, url] = process.argv.slice(2);
const PORT = 9800 + Math.floor(Math.random() * 190);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ctl-'))}`, '--no-first-run', '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(200); } }
const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? {}); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 693, deviceScaleFactor: 1, mobile: true });
await send('Page.enable'); await send('Page.navigate', { url }); await sleep(9000);
const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value;
const open = `(() => { const re=/(open|tap|begin|enter|start|view|unveil|click|reveal|explore|untie)/i; const h=[...document.querySelectorAll('button,a,[role=button],div,span,p')].filter(e=>{const r=e.getBoundingClientRect();return r.width>20&&r.height>12&&r.bottom>0&&r.top<innerHeight&&re.test(e.innerText||'')&&(e.innerText||'').length<60}).sort((a,b)=>a.innerText.length-b.innerText.length)[0]; if(!h) return 'none'; h.click(); return h.innerText.slice(0,20); })()`;
await ev(open); await sleep(7000);
await ev(open); await sleep(3000); // some pages need a second tap
const scan = `(() => {
  const BAD=/(music|sound|mute|audio|skip|volume|speaker|pause|play|song)/i; const out=[];
  const sel=(e)=>{ if(e.id) return '#'+CSS.escape(e.id); const c=[...e.classList].filter(x=>!/^(is-|active|show|visible)/.test(x)); if(c.length) return e.tagName.toLowerCase()+'.'+c.map(CSS.escape).join('.'); const a=e.getAttribute('aria-label'); if(a) return e.tagName.toLowerCase()+'[aria-label="'+a.replace(/"/g,'\\\\"')+'"]'; return null; };
  for (const e of document.querySelectorAll('button,a,[role=button],div,span')) {
    const r=e.getBoundingClientRect(); if(r.width<8||r.width>200||r.height>90||r.bottom<0||r.top>innerHeight) continue;
    const cs=getComputedStyle(e); if(!(cs.position==='fixed'||cs.position==='absolute'||cs.position==='sticky')) continue; if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity<0.1) continue;
    const txt=(e.innerText||'').trim(); const lab=(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('title')||'')+' '+e.id+' '+(typeof e.className==='string'?e.className:'');
    if ((txt.length<24 && BAD.test(txt)) || BAD.test(lab)) { const s=sel(e); if(s) out.push([s,txt.slice(0,18),Math.round(r.x),Math.round(r.y)]); }
  }
  return JSON.stringify(out);
})()`;
console.log(code, await ev(scan));
ws.close(); chrome.kill(); process.exit(0);

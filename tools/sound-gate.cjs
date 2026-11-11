const pptr = require('puppeteer-core');
const { spawn } = require('child_process');
(async () => {
  const s = spawn('python3', ['-m', 'http.server', '8803', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const b = await pptr.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844 });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('http://127.0.0.1:8803/');
  await p.waitForSelector('.park-card', { timeout: 15000 });
  // onboarding may overlay; dismiss if present
  const wb = await p.$('.welcome-text');
  if (wb) await wb.click().catch(() => {});
  const before = await p.evaluate(() => !!window.__soundscape);
  // open Mammoth Cave (cave scene)
  await p.evaluate(() => [...document.querySelectorAll('.park-card h3')].find(h => h.textContent === 'Mammoth Cave').closest('.park-card').click());
  await p.waitForSelector('#park-detail-screen.visible');
  await p.click('#park-sound-toggle');
  await new Promise(r => setTimeout(r, 1200));
  const cave = await p.evaluate(() => ({ engine: !!window.__soundscape, state: window.__soundscape?.context?.state, pressed: document.querySelector('#park-sound-toggle').getAttribute('aria-pressed') }));
  await p.screenshot({ path: '/tmp/np-cave-390.png' });
  // close -> sound must stop
  await p.click('.close-button');
  await new Promise(r => setTimeout(r, 500));
  const closed = await p.evaluate(() => ({ engine: !!window.__soundscape }));
  // open Yellowstone -> volcanic scene
  await p.evaluate(() => [...document.querySelectorAll('.park-card h3')].find(h => h.textContent === 'Yellowstone').closest('.park-card').click());
  await p.waitForSelector('#park-detail-screen.visible');
  await p.click('#park-sound-toggle');
  await new Promise(r => setTimeout(r, 1200));
  const yello = await p.evaluate(() => ({ state: window.__soundscape?.context?.state }));
  await p.click('#park-sound-toggle');
  await new Promise(r => setTimeout(r, 400));
  const muted = await p.evaluate(() => ({ engine: !!window.__soundscape, pressed: document.querySelector('#park-sound-toggle').getAttribute('aria-pressed') }));
  console.log(JSON.stringify({ before, cave, closed, yello, muted, errors }, null, 1));
  await b.close(); s.kill();
})();

const pptr = require('puppeteer-core');
const fs = require('fs');
const { spawn } = require('child_process');
(async () => {
  const s = spawn('python3', ['-m', 'http.server', '8803', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const b = await pptr.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.error('PAGEERROR', String(e)));
  await p.goto('http://127.0.0.1:8803/');
  await p.waitForSelector('.park-card');
  await p.click('.welcome-text').catch(() => {});
  const openPark = (name) => p.evaluate((n) => [...document.querySelectorAll('.park-card h3')].find(h => h.textContent === n).closest('.park-card').click(), name);
  const chunksB64 = [];
  for (const park of ['Mammoth Cave', 'Acadia', 'Yellowstone']) {
    await openPark(park);
    await p.waitForSelector('#park-detail-screen.visible');
    await p.click('#park-sound-toggle');
    await p.waitForFunction(() => !!window.__soundscape);
    const b64 = await p.evaluate(async () => {
      const { context, master } = window.__soundscape;
      const dest = context.createMediaStreamDestination();
      master.connect(dest);
      const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
      const chunks = []; rec.ondataavailable = e => chunks.push(e.data);
      const done = new Promise(res => { rec.onstop = res; });
      rec.start();
      await new Promise(r => setTimeout(r, 12000));
      rec.stop(); await done;
      const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
      let s2 = ''; for (let i = 0; i < bytes.length; i += 8192) s2 += String.fromCharCode(...bytes.subarray(i, i + 8192));
      return btoa(s2);
    });
    fs.writeFileSync(`/tmp/np-${park.replace(/\W/g, '')}.webm`, Buffer.from(b64, 'base64'));
    console.log('recorded', park);
    await p.click('#park-sound-toggle');
    await p.click('.close-button');
    await new Promise(r => setTimeout(r, 400));
  }
  await b.close(); s.kill();
})();

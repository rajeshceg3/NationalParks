// Guided-tour verification: drives the full five-step journey at 320/390/1440
// and asserts the tooltip, the spotlight hole and the highlighted target all
// stay on screen and aligned with each other.
//
// Regression coverage: the final-step target (.close-button) is position:fixed.
// The highlight class used to force position:relative on every target, which
// moved the close button into the scrolled flow of the detail screen and off
// screen, dead-ending the tour on "Click highlighted area to continue" with
// nothing highlighted and no visible close button.
const pptr = require('puppeteer-core');
const { spawn } = require('child_process');
const assert = require('assert');

(async () => {
    let server, browser;
    try {
        server = spawn('python3', ['-m', 'http.server', '8799', '--bind', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore' });
        await new Promise(r => setTimeout(r, 300));
        browser = await pptr.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
        const titles = ['Find Your Sanctuary', 'Discover Places', 'The Essence', 'Immersive Gallery', 'Return to Explore'];
        for (const width of [320, 390, 1440]) {
            const height = 844;
            const page = await browser.newPage();
            await page.setViewport({ width, height });
            await page.goto('http://127.0.0.1:8799');
            await page.waitForSelector('.park-card');
            await page.click('#start-tour-btn');
            for (const title of titles) {
                await page.waitForFunction(t => document.querySelector('#tour-title').textContent === t, {}, title);
                await new Promise(r => setTimeout(r, 700)); // let the step transition settle
                const m = await page.evaluate(() => {
                    const rect = el => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, bottom: r.bottom }; };
                    const target = document.querySelector('.tour-target-active');
                    return {
                        tooltip: rect(document.querySelector('#tour-tooltip')),
                        spotlight: rect(document.querySelector('#tour-spotlight')),
                        target: target ? { ...rect(target), position: getComputedStyle(target).position, cls: target.className } : null
                    };
                });
                // The tooltip stays inside the viewport.
                assert(m.tooltip.left >= 0 && m.tooltip.top >= 0 && m.tooltip.right <= width && m.tooltip.bottom <= height,
                    `tooltip off screen at ${width} (${title}): ${JSON.stringify(m.tooltip)}`);
                // The highlighted target exists and is fully visible in the viewport.
                assert(m.target, `no highlighted target at ${width} (${title})`);
                assert(m.target.left >= 0 && m.target.top >= 0 && m.target.right <= width && m.target.bottom <= height,
                    `highlighted target off screen at ${width} (${title}): ${JSON.stringify(m.target)}`);
                // The spotlight hole encloses the highlighted target.
                assert(m.spotlight.left <= m.target.left && m.spotlight.top <= m.target.top &&
                       m.spotlight.right >= m.target.right && m.spotlight.bottom >= m.target.bottom,
                    `spotlight misses target at ${width} (${title}): ${JSON.stringify(m)}`);
                // A fixed target must stay fixed while highlighted.
                if (title === 'Return to Explore') {
                    assert.strictEqual(m.target.position, 'fixed',
                        `close-button must stay fixed when highlighted, got ${m.target.position}`);
                }
                if (title === 'Discover Places') await page.click('.park-card');
                else if (title === 'Return to Explore') await page.click('.close-button');
                else await page.click('#tour-next-btn');
            }
            await page.waitForFunction(() => document.querySelector('#tour-tooltip').classList.contains('hidden'));
            console.log('tour five steps', width, 'pass');
            await page.close();
        }
    } finally {
        await browser?.close();
        server?.kill();
    }
})().catch(e => { console.error(e); process.exit(1); });

# Verify NationalParks
Terra - U.S. National Parks explorer (static, soundscape layers, puppeteer verification scripts).
## Launch
Any static file server from the repo root; npm test runs the full puppeteer suite.
## Doctor
`python3 .cursor/skills/verify-national-parks/verify.py`
## Drive
Syntax-checks script.js, serves the static site, and renders it in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-national-parks/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites not exercised here.

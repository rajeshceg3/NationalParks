# Terra: U.S. National Parks

A static photo guide to 63 U.S. national parks. Search by park or state, open park notes, switch between light and dark themes, or use the five-step interface tour. Reset clears the search and returns to the catalog. No account, keys or paid services.

## Run

Serve this directory with `python3 -m http.server 8799` and open localhost:8799. GitHub Pages serves the same static files, without a build step.

## Verify

`npm ci && npm test` uses local Chromium (`CHROME_PATH`, default `/usr/bin/google-chrome`). It traverses all 63 detail panels in both themes at 320, 390 and 1440 CSS pixels, with normal and reduced motion. It tests real clicks, keyboard close/focus return, detail scroll reset, search/no-results/reset, and the entire five-step tour. Test images are deterministic stubs so the repeatable test does not scrape Wikimedia. Current screenshots are ignored by git and uploaded as CI artifacts.

`node verification/capture-glyphs.cjs && python3 verification/measure-glyphs.py` measures actual solid glyph-core pixels against same-scene backdrop pixels (Python requires Pillow and NumPy). The checked result contains 72 samples, minimum 5.482:1. Controls and labels are at least 14px; body text is 16px. Photos have opaque captions rather than text over variable imagery.

## Sources and limits

- `parks.json` and its Wikimedia photo references are inherited catalog data, not a new content or licensing audit. Every park's image availability and description have not been independently verified. Failed hero photos show a clear unavailable message; failed gallery thumbnails are hidden.
- Original image URLs are linked in each gallery. No generic stock photos have been substituted.
- The [National Park Service](https://www.nps.gov/findapark/index.htm) owns current closures, permits, access, safety and trip planning. The guide does not claim current fees, opening times or availability.
- This is a photo catalog, not a 3D scene or a 360 panorama. There is no audio feature and no autoplay media.

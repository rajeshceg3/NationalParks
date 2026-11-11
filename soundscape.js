/* National Parks soundscape: each park's opt-in ambience matches its
 * environment - cave drips and close dark air, shore lap and gulls, desert
 * wind and rock whistle, alpine wind, swamp frogs, volcanic steam, and so
 * on. All synthesis, no samples, no voice, nothing tied to park names.
 * Classic script; requires soundscape-layers-classic.js loaded first. */
(() => {
    const SEED = 1864;

    const LAYER_DEFS = {
        caveAir:     { seconds: 10, seed: SEED + 1,  render: (c) => windNoise(c, { color: 0.004, gustDepth: 0.3,  base: 0.35, seed: SEED + 1 }) },
        caveDrips:   { seconds: 10, seed: SEED + 2,  render: (c) => bloops(c, { count: 14, fLo: 900, fHi: 1900, gain: 0.14, seed: SEED + 2 }) },
        caveRumble:  { seconds: 10, seed: SEED + 3,  render: (c) => rumble(c, { gain: 0.2, swellSec: 9, seed: SEED + 3 }) },
        shoreLap:    { seconds: 10, seed: SEED + 4,  render: (c) => lapping(c, { gain: 0.42, period: 2.8, depth: 0.55, seed: SEED + 4 }) },
        coastWind:   { seconds: 10, seed: SEED + 5,  render: (c) => windNoise(c, { color: 0.03, gustDepth: 0.55, base: 0.4, seed: SEED + 5 }) },
        gulls:       { seconds: 10, seed: SEED + 6,  render: (c) => birdChirps(c, { count: 5, fLo: 1100, fHi: 2100, durLo: 0.2, durHi: 0.5, gain: 0.2, minGap: 1.2, syllables: 2, seed: SEED + 6 }) },
        swampWater:  { seconds: 10, seed: SEED + 7,  render: (c) => lapping(c, { gain: 0.2, period: 4.2, depth: 0.4, seed: SEED + 7 }) },
        frogs:       { seconds: 10, seed: SEED + 8,  render: (c) => croaks(c, { count: 7, f: 620, gain: 0.16, seed: SEED + 8 }) },
        nightInsects:{ seconds: 10, seed: SEED + 9,  render: (c) => insects(c, { f: 4600, pulseHz: 21, gain: 0.05, q: 20, seed: SEED + 9 }) },
        volcanoRumble:{ seconds: 10, seed: SEED + 10, render: (c) => rumble(c, { gain: 0.34, swellSec: 6, seed: SEED + 10 }) },
        steam:       { seconds: 10, seed: SEED + 11, render: (c) => steam(c, { count: 3, gain: 0.26, floor: 0.08, seed: SEED + 11 }) },
        hotSpring:   { seconds: 10, seed: SEED + 12, render: (c) => bloops(c, { count: 18, fLo: 190, fHi: 400, gain: 0.18, seed: SEED + 12 }) },
        alpineWind:  { seconds: 10, seed: SEED + 13, render: (c) => windNoise(c, { color: 0.045, gustDepth: 0.6, base: 0.42, seed: SEED + 13 }) },
        rockWhistle: { seconds: 10, seed: SEED + 14, render: (c) => whistleWind(c, { fMin: 380, fMax: 1250, gain: 0.3, seed: SEED + 14 }) },
        alpineBirds: { seconds: 10, seed: SEED + 15, render: (c) => birdChirps(c, { count: 4, fLo: 2400, fHi: 3600, gain: 0.16, minGap: 1.4, seed: SEED + 15 }) },
        lakeLap:     { seconds: 10, seed: SEED + 16, render: (c) => lapping(c, { gain: 0.36, period: 3.1, depth: 0.5, seed: SEED + 16 }) },
        softWind:    { seconds: 10, seed: SEED + 17, render: (c) => windNoise(c, { color: 0.02, gustDepth: 0.45, base: 0.42, seed: SEED + 17 }) },
        river:       { seconds: 10, seed: SEED + 18, render: (c) => streamBed(c, { gain: 0.4, period: 0.27, depth: 0.5, seed: SEED + 18 }) },
        desertWind:  { seconds: 10, seed: SEED + 19, render: (c) => windNoise(c, { color: 0.03, gustDepth: 0.6, base: 0.45, seed: SEED + 19 }) },
        heatShimmer: { seconds: 10, seed: SEED + 20, render: (c) => insects(c, { f: 5600, pulseHz: 30, gain: 0.04, q: 26, seed: SEED + 20 }) },
        canopyWind:  { seconds: 10, seed: SEED + 21, render: (c) => windNoise(c, { color: 0.014, gustDepth: 0.5, base: 0.45, seed: SEED + 21 }) },
        canopyRustle:{ seconds: 10, seed: SEED + 22, render: (c) => rustle(c, { gain: 0.16, seed: SEED + 22 }) },
        forestBirds: { seconds: 10, seed: SEED + 23, render: (c) => birdChirps(c, { count: 10, fLo: 2000, fHi: 3600, gain: 0.24, trill: 14, syllables: 2, minGap: 0.7, seed: SEED + 23 }) },
        cityHum:     { seconds: 10, seed: SEED + 24, render: (c) => distantEngine(c, { f: 66, gain: 0.09, periodSec: 24, seed: SEED + 24 }) },
    };

    const SCENES = {
        cave:     [['caveAir', 0.8], ['caveDrips', 0.9], ['caveRumble', 0.6]],
        coast:    [['shoreLap', 0.9], ['coastWind', 0.7], ['gulls', 0.8]],
        wetland:  [['swampWater', 0.8], ['frogs', 0.9], ['nightInsects', 0.9]],
        volcanic: [['volcanoRumble', 0.85], ['steam', 0.9], ['hotSpring', 0.8]],
        alpine:   [['alpineWind', 0.9], ['rockWhistle', 0.55], ['alpineBirds', 0.8]],
        water:    [['lakeLap', 0.9], ['softWind', 0.6], ['alpineBirds', 0.8]],
        river:    [['river', 0.9], ['softWind', 0.55], ['forestBirds', 0.6]],
        desert:   [['desertWind', 0.9], ['rockWhistle', 0.5], ['heatShimmer', 0.8]],
        forest:   [['canopyWind', 0.85], ['canopyRustle', 0.9], ['forestBirds', 0.9]],
        urban:    [['cityHum', 0.9], ['softWind', 0.5], ['forestBirds', 0.4]],
    };

    /* Every park mapped to the environment that defines it. */
    const PARK_SCENES = {
        'Acadia': 'coast', 'American Samoa': 'coast', 'Arches': 'desert',
        'Badlands': 'desert', 'Big Bend': 'desert', 'Biscayne': 'coast',
        'Black Canyon of the Gunnison': 'desert', 'Bryce Canyon': 'desert',
        'Canyonlands': 'desert', 'Capitol Reef': 'desert',
        'Carlsbad Caverns': 'cave', 'Channel Islands': 'coast',
        'Congaree': 'wetland', 'Crater Lake': 'water', 'Cuyahoga Valley': 'forest',
        'Death Valley': 'desert', 'Denali': 'alpine', 'Dry Tortugas': 'coast',
        'Everglades': 'wetland', 'Gates of the Arctic': 'alpine',
        'Gateway Arch': 'urban', 'Glacier': 'alpine', 'Glacier Bay': 'coast',
        'Grand Canyon': 'desert', 'Grand Teton': 'alpine', 'Great Basin': 'desert',
        'Great Sand Dunes': 'desert', 'Great Smoky Mountains': 'forest',
        'Guadalupe Mountains': 'desert', 'Haleakalā': 'volcanic',
        'Hawaiʻi Volcanoes': 'volcanic', 'Hot Springs': 'water',
        'Indiana Dunes': 'desert', 'Isle Royale': 'water', 'Joshua Tree': 'desert',
        'Katmai': 'river', 'Kenai Fjords': 'coast', 'Kings Canyon': 'forest',
        'Kobuk Valley': 'alpine', 'Lake Clark': 'water',
        'Lassen Volcanic': 'volcanic', 'Mammoth Cave': 'cave',
        'Mesa Verde': 'desert', 'Mount Rainier': 'alpine',
        'New River Gorge': 'river', 'North Cascades': 'alpine',
        'Olympic': 'forest', 'Petrified Forest': 'desert', 'Pinnacles': 'desert',
        'Redwood': 'forest', 'Rocky Mountain': 'alpine', 'Saguaro': 'desert',
        'Sequoia': 'forest', 'Shenandoah': 'forest',
        'Theodore Roosevelt': 'desert', 'Virgin Islands': 'coast',
        'Voyageurs': 'water', 'White Sands': 'desert', 'Wind Cave': 'cave',
        'Wrangell–St. Elias': 'alpine', 'Yellowstone': 'volcanic',
        'Yosemite': 'alpine', 'Zion': 'desert',
    };

    function sceneForPark(name) {
        return SCENES[PARK_SCENES[name]] || SCENES.forest;
    }

    function createSoundscape() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const context = new Ctx();
        const master = context.createGain();
        master.gain.value = 0.22;
        master.connect(context.destination);
        const buffers = new Map();
        let current = [];
        let alive = true;

        const bufferFor = (id) => {
            if (!buffers.has(id)) {
                const def = LAYER_DEFS[id];
                const c = makeCtx(context.sampleRate, def.seconds, def.seed);
                const out = def.render(c) || c;
                const b = context.createBuffer(2, out.L.length, context.sampleRate);
                b.getChannelData(0).set(out.L);
                b.getChannelData(1).set(out.R);
                buffers.set(id, b);
            }
            return buffers.get(id);
        };

        const engine = {
            context,
            master,
            setPark(name) {
                const t = context.currentTime;
                const next = sceneForPark(name).map(([layer, gain]) => {
                    const source = context.createBufferSource();
                    source.buffer = bufferFor(layer);
                    source.loop = true;
                    const g = context.createGain();
                    g.gain.value = 0;
                    g.gain.setTargetAtTime(gain, t, 0.8);
                    source.connect(g);
                    g.connect(master);
                    source.start();
                    return { source, g };
                });
                const old = current;
                current = next;
                old.forEach(({ source, g }) => {
                    g.gain.setTargetAtTime(0, t, 0.5);
                    setTimeout(() => {
                        if (!alive) return;
                        try { source.stop(); source.disconnect(); g.disconnect(); } catch { /* stopped */ }
                    }, 3000);
                });
            },
            dispose() {
                alive = false;
                current.forEach(({ source }) => { try { source.stop(); } catch { /* stopped */ } });
                void context.close();
            },
        };
        return engine;
    }

    window.ParkSoundscape = { createSoundscape, sceneForPark, LAYER_DEFS, SCENES, PARK_SCENES };
})();

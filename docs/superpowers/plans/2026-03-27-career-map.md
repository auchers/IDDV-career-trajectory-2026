# Career Trajectory Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dual-projection overlay world map showing career locations connected by flight-path arcs, styled after Warhol dance diagrams, rendered with D3.js on canvas.

**Architecture:** Single HTML page loads D3 + d3-geo-projection + d3-geo-polygon + topojson-client from CDN. A canvas element renders two map projections overlaid via `multiply` blend mode (red + blue = black where they agree). Flight paths and city markers are drawn on top after the composite pass. URL params control which projections are active and whether controls are visible.

**Tech Stack:** D3.js v7, d3-geo-projection v4, d3-geo-polygon v2, topojson-client v3, Canvas 2D API, vanilla HTML/CSS/JS. No build step.

---

## File Structure

```
career-trajectory/
├── index.html          # HTML shell — canvas, control UI, script tags
├── style.css           # Layout, controls, typography
├── projections.js      # Projection registry, presets, URL param parsing
├── map.js              # Rendering pipeline: land, graticules, compositing, paths, markers
```

- **index.html** — the page shell. Loads CDN scripts, contains the `<canvas>`, optional controls div, and loads `projections.js` then `map.js`.
- **style.css** — page layout (centering, 16:9 aspect), control styling, font choices.
- **projections.js** — exports a registry of available projections (name → D3 factory function), the four curated presets, and a function to read URL params and return the active red/blue projection pair + controls visibility.
- **map.js** — the main rendering module. Loads world data, builds the rendering pipeline, handles re-rendering on projection change.

---

### Task 1: HTML Shell + CSS Layout

**Files:**
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Trajectory</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="controls" class="controls hidden">
    <div class="control-row">
      <label for="red-select">red</label>
      <select id="red-select"></select>
    </div>
    <div class="control-row">
      <label for="blue-select">blue</label>
      <select id="blue-select"></select>
    </div>
    <div class="preset-row" id="preset-buttons"></div>
  </div>
  <canvas id="map-canvas"></canvas>

  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-geo-projection@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-geo-polygon@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/topojson-client@3"></script>
  <script src="projections.js"></script>
  <script src="map.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

#map-canvas {
  display: block;
  width: 100vw;
  max-width: 1600px;
  aspect-ratio: 16 / 9;
}

.controls {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px 24px;
  font-size: 14px;
}

.controls.hidden {
  display: none;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-row label {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}

.control-row label[for="red-select"] {
  color: #f00;
}

.control-row label[for="blue-select"] {
  color: #00f;
}

.control-row select {
  font-family: inherit;
  font-size: 14px;
  padding: 4px 8px;
  border: 2px solid #000;
  background: #fff;
}

.preset-row {
  display: flex;
  gap: 8px;
}

.preset-row button {
  font-family: inherit;
  font-size: 12px;
  padding: 4px 12px;
  border: 2px solid #000;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preset-row button:hover {
  background: #000;
  color: #fff;
}
```

- [ ] **Step 3: Open in browser and verify**

Run: `open index.html` from the `career-trajectory/` directory.
Expected: White page with a blank canvas area (16:9 aspect ratio). Controls are hidden. No console errors (CDN scripts load successfully).

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: add HTML shell and CSS layout"
```

---

### Task 2: Projection Registry + URL Params

**Files:**
- Create: `projections.js`

- [ ] **Step 1: Create `projections.js`**

This file defines the projection registry, presets, and URL param parsing.

```js
// projections.js — projection registry, presets, URL param parsing

const PROJECTIONS = {
  // Core d3-geo (in d3@7)
  naturalEarth1: { name: "Natural Earth", fn: () => d3.geoNaturalEarth1() },
  equalEarth: { name: "Equal Earth", fn: () => d3.geoEqualEarth() },
  equirectangular: { name: "Equirectangular", fn: () => d3.geoEquirectangular() },
  mercator: { name: "Mercator", fn: () => d3.geoMercator() },
  orthographic: { name: "Orthographic", fn: () => d3.geoOrthographic() },

  // d3-geo-projection
  winkel3: { name: "Winkel Tripel", fn: () => d3.geoWinkel3() },
  kavrayskiy7: { name: "Kavrayskiy VII", fn: () => d3.geoKavrayskiy7() },
  robinson: { name: "Robinson", fn: () => d3.geoRobinson() },
  polyconic: { name: "American Polyconic", fn: () => d3.geoPolyconic() },
  rectangularPolyconic: { name: "Rectangular Polyconic", fn: () => d3.geoRectangularPolyconic() },
  aitoff: { name: "Aitoff", fn: () => d3.geoAitoff() },
  hammer: { name: "Hammer", fn: () => d3.geoHammer() },
  mollweide: { name: "Mollweide", fn: () => d3.geoMollweide() },
  vanDerGrinten: { name: "Van der Grinten", fn: () => d3.geoVanDerGrinten() },

  // d3-geo-polygon (butterfly projections)
  polyhedralButterfly: { name: "Butterfly (gnomonic)", fn: () => d3.geoPolyhedralButterfly() },
  polyhedralCollignon: { name: "Butterfly (Collignon)", fn: () => d3.geoPolyhedralCollignon() },
  polyhedralWaterman: { name: "Waterman Butterfly", fn: () => d3.geoPolyhedralWaterman() },
};

const PRESETS = {
  compromise: {
    name: "Every projection is a compromise",
    red: "naturalEarth1",
    blue: "winkel3",
  },
  subtle: {
    name: "Same story, different emphasis",
    red: "kavrayskiy7",
    blue: "robinson",
  },
  polyconic: {
    name: "Two branches, same family",
    red: "polyconic",
    blue: "rectangularPolyconic",
  },
  butterfly: {
    name: "Butterfly wings",
    red: "polyhedralButterfly",
    blue: "polyhedralCollignon",
  },
};

function parseParams() {
  const params = new URLSearchParams(window.location.search);

  const showControls = params.get("controls") === "true";

  // Check for preset first
  const presetKey = params.get("preset");
  if (presetKey && PRESETS[presetKey]) {
    return {
      red: PRESETS[presetKey].red,
      blue: PRESETS[presetKey].blue,
      showControls,
    };
  }

  // Check for explicit red/blue params
  const red = params.get("red") || PRESETS.compromise.red;
  const blue = params.get("blue") || PRESETS.compromise.blue;

  return {
    red: PROJECTIONS[red] ? red : PRESETS.compromise.red,
    blue: PROJECTIONS[blue] ? blue : PRESETS.compromise.blue,
    showControls,
  };
}
```

- [ ] **Step 2: Verify projections load**

Open browser console on `index.html` and type:
```js
console.log(Object.keys(PROJECTIONS).length); // should be 17
console.log(parseParams()); // { red: "naturalEarth1", blue: "winkel3", showControls: false }
```

Then try `index.html?preset=butterfly&controls=true` and verify:
```js
console.log(parseParams()); // { red: "polyhedralButterfly", blue: "polyhedralCollignon", showControls: true }
```

- [ ] **Step 3: Commit**

```bash
git add projections.js
git commit -m "feat: add projection registry, presets, and URL param parsing"
```

---

### Task 3: Basic Map Rendering (Single Projection)

**Files:**
- Create: `map.js`

Get a single red projection rendering on canvas before adding the composite layer.

- [ ] **Step 1: Create `map.js` with single-projection rendering**

```js
// map.js — main rendering pipeline

const WORLD_DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

async function loadWorldData() {
  const response = await fetch(WORLD_DATA_URL);
  const world = await response.json();
  return {
    land: topojson.feature(world, world.objects.land),
    borders: topojson.mesh(world, world.objects.countries, (a, b) => a !== b),
  };
}

function fitProjection(projectionFn, width, height) {
  const projection = projectionFn();
  projection.fitSize([width, height], { type: "Sphere" });
  return projection;
}

function renderProjection(ctx, path, land, graticule, outline, color) {
  // Land
  ctx.beginPath();
  path(land);
  ctx.fillStyle = color;
  ctx.fill();

  // Graticule
  ctx.beginPath();
  path(graticule);
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Outline (sphere border)
  ctx.beginPath();
  path(outline);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

async function init() {
  const canvas = document.getElementById("map-canvas");
  const ctx = canvas.getContext("2d");
  const config = parseParams();

  // Set canvas resolution to match display size
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  const worldData = await loadWorldData();
  const graticule = d3.geoGraticule().precision(2.5)();
  const outline = { type: "Sphere" };

  // Render red projection only (for now)
  const projRed = fitProjection(PROJECTIONS[config.red].fn, width, height);
  const pathRed = d3.geoPath(projRed, ctx);

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  renderProjection(ctx, pathRed, worldData.land, graticule, outline, "#f00");
}

init();
```

- [ ] **Step 2: Open in browser and verify**

Open `index.html` in the browser.
Expected: Red landmasses on white background with a red graticule grid and sphere outline. Natural Earth projection by default.

Try `index.html?red=robinson` — should show Robinson projection in red.

- [ ] **Step 3: Commit**

```bash
git add map.js
git commit -m "feat: render single projection on canvas with land and graticule"
```

---

### Task 4: Dual-Projection Multiply Composite

**Files:**
- Modify: `map.js`

Add the blue projection with `multiply` blend mode.

- [ ] **Step 1: Add dual-projection rendering to `init()` in `map.js`**

Replace the rendering section in `init()` (everything after the `const outline` line) with:

```js
  function render() {
    const projRed = fitProjection(PROJECTIONS[config.red].fn, width, height);
    const pathRed = d3.geoPath(projRed, ctx);

    const projBlue = fitProjection(PROJECTIONS[config.blue].fn, width, height);
    const pathBlue = d3.geoPath(projBlue, ctx);

    // Clear
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    // Red projection
    renderProjection(ctx, pathRed, worldData.land, graticule, outline, "#f00");

    // Multiply blend
    ctx.globalCompositeOperation = "multiply";

    // Blue projection
    renderProjection(ctx, pathBlue, worldData.land, graticule, outline, "#00f");

    // Reset composite
    ctx.globalCompositeOperation = "source-over";
  }

  render();

  // Expose render + config for controls (Task 5)
  window._map = { render, config, width, height, worldData, ctx };
```

- [ ] **Step 2: Open in browser and verify**

Open `index.html`.
Expected: Red and blue landmasses overlaid. Where they overlap → near-black (dark purple/black from red * blue multiply). Red fringe where only red projection has land, blue fringe where only blue does. Graticules in red and blue at low opacity.

Try `index.html?preset=butterfly` — should show dramatic butterfly shapes.

- [ ] **Step 3: Commit**

```bash
git add map.js
git commit -m "feat: add dual-projection multiply composite rendering"
```

---

### Task 5: Controls UI (Dropdowns + Presets)

**Files:**
- Modify: `map.js`

Wire up the dropdown selectors and preset buttons.

- [ ] **Step 1: Add control initialization to `init()` in `map.js`**

Add this after the `window._map = ...` line at the end of `init()`:

```js
  // Controls
  if (config.showControls) {
    document.getElementById("controls").classList.remove("hidden");

    const redSelect = document.getElementById("red-select");
    const blueSelect = document.getElementById("blue-select");

    // Populate dropdowns
    Object.entries(PROJECTIONS).forEach(([key, { name }]) => {
      redSelect.add(new Option(name, key));
      blueSelect.add(new Option(name, key));
    });
    redSelect.value = config.red;
    blueSelect.value = config.blue;

    const onProjectionChange = () => {
      config.red = redSelect.value;
      config.blue = blueSelect.value;
      render();
    };
    redSelect.addEventListener("change", onProjectionChange);
    blueSelect.addEventListener("change", onProjectionChange);

    // Preset buttons
    const presetRow = document.getElementById("preset-buttons");
    Object.entries(PRESETS).forEach(([key, preset]) => {
      const btn = document.createElement("button");
      btn.textContent = preset.name;
      btn.addEventListener("click", () => {
        config.red = preset.red;
        config.blue = preset.blue;
        redSelect.value = config.red;
        blueSelect.value = config.blue;
        render();
      });
      presetRow.appendChild(btn);
    });
  }
```

- [ ] **Step 2: Verify controls**

Open `index.html?controls=true`.
Expected: Two dropdowns (red / blue labels) and four preset buttons visible above the canvas. Changing a dropdown re-renders the map. Clicking a preset button updates both dropdowns and re-renders.

Open `index.html` (no params).
Expected: No controls visible — clean presentation mode.

- [ ] **Step 3: Commit**

```bash
git add map.js
git commit -m "feat: wire up projection dropdowns and preset buttons"
```

---

### Task 6: Flight Paths (Dashed Great-Circle Arcs + Arrowheads)

**Files:**
- Modify: `map.js`

- [ ] **Step 1: Add city data and flight path rendering to `map.js`**

Add these constants at the top of `map.js`, after the `WORLD_DATA_URL` line:

```js
const CITIES = [
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Berkeley", lat: 37.87, lon: -122.27 },
  { name: "Tel Aviv", lat: 32.08, lon: 34.78 },
  { name: "Brooklyn", lat: 40.68, lon: -73.94 },
  { name: "Boston", lat: 42.36, lon: -71.06 },
];

function renderFlightPaths(ctx, projection) {
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([12, 6]);

  for (let i = 0; i < CITIES.length - 1; i++) {
    const from = [CITIES[i].lon, CITIES[i].lat];
    const to = [CITIES[i + 1].lon, CITIES[i + 1].lat];
    const interpolate = d3.geoInterpolate(from, to);

    // Generate points along the great circle
    const numPoints = 100;
    const points = Array.from({ length: numPoints + 1 }, (_, j) => {
      const t = j / numPoints;
      return projection(interpolate(t));
    }).filter((p) => p != null);

    if (points.length < 2) continue;

    // Draw the dashed arc
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let j = 1; j < points.length; j++) {
      ctx.lineTo(points[j][0], points[j][1]);
    }
    ctx.stroke();

    // Draw arrowhead at destination
    const tip = points[points.length - 1];
    const prev = points[points.length - 2];
    const angle = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
    const arrowLen = 14;
    const arrowWidth = Math.PI / 6;

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(
      tip[0] - arrowLen * Math.cos(angle - arrowWidth),
      tip[1] - arrowLen * Math.sin(angle - arrowWidth)
    );
    ctx.lineTo(
      tip[0] - arrowLen * Math.cos(angle + arrowWidth),
      tip[1] - arrowLen * Math.sin(angle + arrowWidth)
    );
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.setLineDash([12, 6]);
  }

  ctx.restore();
}
```

- [ ] **Step 2: Call `renderFlightPaths` in `render()`**

In the `render()` function inside `init()`, add after `ctx.globalCompositeOperation = "source-over";`:

```js
    // Flight paths (use red projection for positioning)
    const projRedForPaths = fitProjection(PROJECTIONS[config.red].fn, width, height);
    renderFlightPaths(ctx, projRedForPaths);
```

- [ ] **Step 3: Verify in browser**

Open `index.html`.
Expected: Black dashed arcs connecting LA → Berkeley → Tel Aviv → Brooklyn → Boston, with filled arrowheads at each destination. The Berkeley→Tel Aviv arc should cross the Atlantic as a great circle. Paths sit on top of the red/blue landmasses.

- [ ] **Step 4: Commit**

```bash
git add map.js
git commit -m "feat: add dashed great-circle flight paths with arrowheads"
```

---

### Task 7: City Markers + Labels

**Files:**
- Modify: `map.js`

- [ ] **Step 1: Add marker rendering function to `map.js`**

Add after the `renderFlightPaths` function:

```js
function formatCoord(lat, lon) {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}\u00B0${latDir}, ${Math.abs(lon).toFixed(2)}\u00B0${lonDir}`;
}

// Manual label offsets to avoid overlap [dx, dy] from center of circle
const LABEL_OFFSETS = [
  [-20, 25],   // LA — below-left
  [-20, -18],  // Berkeley — above-left
  [20, -10],   // Tel Aviv — above-right
  [20, 25],    // Brooklyn — below-right
  [20, -10],   // Boston — above-right
];

function renderMarkers(ctx, projection) {
  const radius = 14;

  CITIES.forEach((city, i) => {
    const [x, y] = projection([city.lon, city.lat]) || [0, 0];
    const [dx, dy] = LABEL_OFFSETS[i];

    // White stroke ring (Warhol style)
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Black filled circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();

    // White number
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), x, y + 1);

    // City name — white stroke behind black text (Warhol knockout)
    const labelX = x + dx;
    const labelY = y + dy;

    ctx.font = "bold 14px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = dx > 0 ? "left" : "right";
    ctx.textBaseline = "top";

    // White stroke for legibility
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeText(city.name, labelX, labelY);
    ctx.fillStyle = "#000";
    ctx.fillText(city.name, labelX, labelY);

    // Lat/lon coordinates
    const coordStr = formatCoord(city.lat, city.lon);
    ctx.font = "11px 'Helvetica Neue', Arial, sans-serif";

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeText(coordStr, labelX, labelY + 17);
    ctx.fillStyle = "#000";
    ctx.fillText(coordStr, labelX, labelY + 17);
  });
}
```

- [ ] **Step 2: Call `renderMarkers` in `render()`**

In `render()`, add after the `renderFlightPaths` call:

```js
    renderMarkers(ctx, projRedForPaths);
```

- [ ] **Step 3: Verify in browser**

Open `index.html`.
Expected: Numbered black circles at each city with white halos. City names in bold black with white stroke for legibility. Lat/lon coordinates in smaller text below each city name. Labels positioned to avoid overlap with each other and with flight paths.

Try `index.html?preset=butterfly&controls=true` — verify markers appear correctly on the butterfly projections too. Some label offsets may need tweaking for different projections (this is a known trade-off; offsets are tuned for the default pairing).

- [ ] **Step 4: Commit**

```bash
git add map.js
git commit -m "feat: add city markers with numbered circles, names, and coordinates"
```

---

### Task 8: Polish + Responsive Canvas

**Files:**
- Modify: `map.js`
- Modify: `style.css`

- [ ] **Step 1: Add resize handler to `map.js`**

Add at the end of `init()`, after the controls block:

```js
  // Resize handler
  const onResize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Update dimensions used by render
    Object.assign(window._map, {
      width: rect.width,
      height: rect.height,
    });

    render();
  };

  window.addEventListener("resize", onResize);
```

Also update `render()` to read width/height dynamically — change the fitProjection calls in `render()` to use `window._map.width` and `window._map.height` instead of the closed-over `width` and `height`. Replace the `render()` function's projection lines:

```js
  function render() {
    const w = window._map?.width || width;
    const h = window._map?.height || height;

    const projRed = fitProjection(PROJECTIONS[config.red].fn, w, h);
    const pathRed = d3.geoPath(projRed, ctx);

    const projBlue = fitProjection(PROJECTIONS[config.blue].fn, w, h);
    const pathBlue = d3.geoPath(projBlue, ctx);

    // Clear
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    // Red projection
    renderProjection(ctx, pathRed, worldData.land, graticule, outline, "#f00");

    // Multiply blend
    ctx.globalCompositeOperation = "multiply";

    // Blue projection
    renderProjection(ctx, pathBlue, worldData.land, graticule, outline, "#00f");

    // Reset composite
    ctx.globalCompositeOperation = "source-over";

    // Flight paths (use red projection for positioning)
    const projRedForPaths = fitProjection(PROJECTIONS[config.red].fn, w, h);
    renderFlightPaths(ctx, projRedForPaths);
    renderMarkers(ctx, projRedForPaths);
  }
```

- [ ] **Step 2: Add print-friendly styles to `style.css`**

Append to `style.css`:

```css
@media print {
  .controls {
    display: none !important;
  }

  #map-canvas {
    width: 100%;
    max-width: none;
  }
}
```

- [ ] **Step 3: Verify**

Resize the browser window — map should re-render smoothly at new dimensions. Open print preview — controls should be hidden, canvas fills the page.

- [ ] **Step 4: Commit**

```bash
git add map.js style.css
git commit -m "feat: add responsive resize handler and print styles"
```

---

### Task 9: Final Integration Verification

- [ ] **Step 1: Test default mode (no params)**

Open `index.html`.
Verify:
- Natural Earth (red) + Winkel Tripel (blue) overlay
- Black where projections agree, red/blue fringe at edges
- Dashed flight paths with arrowheads: LA → Berkeley → Tel Aviv → Brooklyn → Boston
- Numbered city markers with names and lat/lon coordinates
- White halos around markers and text for legibility
- No controls visible
- No console errors

- [ ] **Step 2: Test all presets**

Open each:
- `index.html?preset=compromise&controls=true`
- `index.html?preset=subtle&controls=true`
- `index.html?preset=polyconic&controls=true`
- `index.html?preset=butterfly&controls=true`

Verify each renders without errors and the dropdown values match the preset.

- [ ] **Step 3: Test explicit params**

Open `index.html?red=hammer&blue=mollweide&controls=true`
Verify: Hammer (red) + Mollweide (blue) render correctly.

- [ ] **Step 4: Test clean presentation mode**

Open `index.html?preset=butterfly`
Verify: Butterfly pairing renders, no controls visible, clean for screenshots.

- [ ] **Step 5: Final commit with any fixes**

If any adjustments were needed:
```bash
git add -A
git commit -m "fix: polish and integration fixes"
```

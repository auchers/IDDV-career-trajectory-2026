# Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the career trajectory visualization to fit a single viewport, soften the color palette to rose/sage, restyle markers and timeline for a bolder Warhol-inspired aesthetic, and default to the butterfly projection.

**Architecture:** Six independent visual changes applied across 5 files. A swappable theme object abstracts projection colors. Layout shifts from fixed-aspect-ratio to height-first flex. Timeline bars become ultra-minimal lines. All changes on an experimental branch.

**Tech Stack:** Vanilla HTML/CSS/JS, D3.js v7, Canvas 2D API

---

### Task 1: Create Experimental Branch

**Files:** none (git only)

- [ ] **Step 1: Create and switch to branch**

```bash
git checkout -b visual-refinement
```

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `visual-refinement`

---

### Task 2: Height-First Viewport Layout

**Files:**
- Modify: `style.css` (lines 1-15, lines 129-137)
- Modify: `map.js` (lines 224-228, lines 254-267)

- [ ] **Step 1: Update body and canvas CSS**

In `style.css`, change the body to fill the viewport and make the canvas flex:

```css
body {
  background: #fff;
  font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}
```

Remove the `aspect-ratio` from `#map-canvas` and add flex:

```css
#map-canvas {
  display: block;
  width: 100%;
  max-width: 1600px;
  flex: 1;
  min-height: 0;
}
```

- [ ] **Step 2: Constrain fitProjection to show full projection**

In `map.js`, update `fitProjection` to use `fitSize` with a sphere and ensure the projection is fully contained (D3's `fitSize` already does this — it scales to fit within the bounding box without clipping):

```js
function fitProjection(projectionFn, width, height) {
  const projection = projectionFn();
  projection.fitSize([width, height], { type: "Sphere" });
  return projection;
}
```

This is already correct — `fitSize` constrains to the smaller dimension. No change needed to this function.

- [ ] **Step 3: Update the resize handler to read flex-computed size**

The existing resize handler in `map.js` (line 368) already reads `getBoundingClientRect()` which will reflect the flex-computed size. No change needed.

- [ ] **Step 4: Prevent timeline from being squished by flex**

In `style.css`, add `flex-shrink: 0` to `#timeline` so it keeps its natural height:

```css
#timeline {
  width: 100vw;
  max-width: 1600px;
  position: relative;
  padding: 16px 40px 32px;
  overflow: hidden;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Verify in browser**

Run: `python3 -m http.server 8080`

Open `http://localhost:8080?controls=true` — the entire page (header + map + timeline) should fit in one viewport height. The map should be fully visible with no clipping. Resize the window to confirm it adapts.

- [ ] **Step 6: Commit**

```bash
git add style.css map.js
git commit -m "feat: height-first viewport layout, map fills available space"
```

---

### Task 3: Color Theme Abstraction

**Files:**
- Modify: `map.js` (top of file, and lines 288-295)

- [ ] **Step 1: Add theme definitions at top of map.js**

Add after line 1 (after the `WORLD_DATA_URL` constant):

```js
const THEMES = {
  roseSage: {
    projA: '#D4878F',
    projB: '#8BAF9E',
  },
  classic: {
    projA: '#f00',
    projB: '#00f',
  },
};

let currentTheme = THEMES.roseSage;
```

- [ ] **Step 2: Update renderProjection calls to use theme**

In the `render()` function inside `init()` (around line 288), replace the hardcoded color strings:

Change:
```js
renderProjection(ctx, pathRed, worldData.land, graticule, outline, "#f00");
```
To:
```js
renderProjection(ctx, pathRed, worldData.land, graticule, outline, currentTheme.projA);
```

Change:
```js
renderProjection(ctx, pathBlue, worldData.land, graticule, outline, "#00f");
```
To:
```js
renderProjection(ctx, pathBlue, worldData.land, graticule, outline, currentTheme.projB);
```

- [ ] **Step 3: Update control label colors**

In the `init()` function, after controls are set up, set the label colors to match the theme. Add after `updateActivePreset()` (around line 363):

```js
document.querySelector('.projection-label.red').style.color = currentTheme.projA;
document.querySelector('.projection-label.blue').style.color = currentTheme.projB;
```

- [ ] **Step 4: Verify in browser**

Reload the page — map should now render in dusty rose and sage green. The multiply overlap should produce a warm earthy mauve. To test theme switching, temporarily change `currentTheme = THEMES.classic` and verify the old red/blue returns.

- [ ] **Step 5: Commit**

```bash
git add map.js
git commit -m "feat: swappable color themes, default to rose/sage"
```

---

### Task 4: Remove Sphere Outline

**Files:**
- Modify: `map.js` (lines 230-252)

- [ ] **Step 1: Remove outline rendering from renderProjection**

In `renderProjection`, remove the outline block (last 5 lines of the function):

```js
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
}
```

- [ ] **Step 2: Clean up the outline parameter**

Update the function signature to remove `outline`:

```js
function renderProjection(ctx, path, land, graticule, color) {
```

Update both call sites in `render()`:

```js
renderProjection(ctx, pathRed, worldData.land, graticule, currentTheme.projA);
```

```js
renderProjection(ctx, pathBlue, worldData.land, graticule, currentTheme.projB);
```

Remove the `outline` variable from `render()`:

```js
// Remove this line:
// const outline = { type: "Sphere" };
```

Also remove `outline` from the `init()` function scope (line 271):
```js
// Remove:
// const outline = { type: "Sphere" };
```

- [ ] **Step 3: Verify in browser**

Reload — the outer sphere border should be gone. Graticules should still be visible at low opacity.

- [ ] **Step 4: Commit**

```bash
git add map.js
git commit -m "feat: remove sphere outline border"
```

---

### Task 5: Restyle City Markers & Labels

**Files:**
- Modify: `map.js` (lines 96-213)

- [ ] **Step 1: Simplify the renderMarkers function**

Replace the entire `renderMarkers` function. Remove the backing panel, connector lines, and coordinates. Add white text stroke for legibility:

```js
const LABEL_OFFSETS = [
  { dx: -14, dy: 18, align: "right" },   // LA — below-left
  { dx: -14, dy: -18, align: "right" },  // Berkeley — above-left
  { dx: 14, dy: -14, align: "left" },    // Tel Aviv — above-right
  { dx: 14, dy: 18, align: "left" },     // Brooklyn — below-right
  { dx: 14, dy: -18, align: "left" },    // Boston — above-right
];

const CITY_FONT = "bold 13px 'DM Sans', 'Helvetica Neue', Arial, sans-serif";

function renderMarkers(ctx, projRed, projBlue) {
  const radius = 9;

  CITIES.forEach((city, i) => {
    const projection = i % 2 === 0 ? projRed : projBlue;
    const projected = projection([city.lon, city.lat]);
    if (!projected) return;
    const [x, y] = projected;
    const { dx, dy, align } = LABEL_OFFSETS[i];

    // City name with white stroke for legibility
    const labelX = x + dx;
    const labelY = y + dy;
    ctx.font = CITY_FONT;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";

    // White outline stroke
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeText(city.name, labelX, labelY);

    // Black fill
    ctx.fillStyle = "#000";
    ctx.fillText(city.name, labelX, labelY);

    // White halo ring
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Black filled circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();

    // White number centered in circle
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px 'DM Sans', 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), x, y);
  });
}
```

- [ ] **Step 2: Remove unused helpers**

Delete these functions and constants that are no longer needed:
- `formatCoord` (line 96)
- `DOT_NUDGES` (line 113)
- `COORD_FONT` (line 122)
- `measureLabel` (line 124)

- [ ] **Step 3: Verify in browser**

Reload — city labels should appear as bold text with white stroke directly on the map, no backing panels. Numbered circles should look the same as before.

- [ ] **Step 4: Commit**

```bash
git add map.js
git commit -m "feat: bold marker labels, remove backing panels and coordinates"
```

---

### Task 6: Ultra-Minimal Timeline

**Files:**
- Modify: `style.css` (timeline section, lines 156-317)
- Modify: `timeline.js` (lines 51-108)

- [ ] **Step 1: Update timeline CSS**

Replace the timeline bar and point styles in `style.css`:

```css
/* ── Timeline ─────────────────────────────────── */

#timeline {
  width: 100%;
  max-width: 1600px;
  position: relative;
  padding: 12px 40px 20px;
  overflow: hidden;
  flex-shrink: 0;
}

.timeline-axis {
  position: relative;
  height: 20px;
  margin-left: 56px;
  margin-right: 8px;
  border-bottom: 1px solid #ddd;
}

.timeline-axis .tick {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 9px;
  font-weight: 400;
  color: #bbb;
  letter-spacing: 0;
  line-height: 1;
  padding-bottom: 5px;
}

.timeline-axis .tick::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 1px;
  height: 3px;
  background: #ddd;
}

.timeline-tracks {
  position: relative;
  margin-left: 56px;
  margin-right: 8px;
}

.timeline-track {
  position: relative;
  height: 26px;
  margin-top: 4px;
}

.timeline-track-label {
  position: absolute;
  left: -56px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  text-align: right;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #999;
}

.timeline-bar {
  position: absolute;
  top: 50%;
  height: 1.5px;
  background: #000;
  display: flex;
  align-items: center;
  overflow: visible;
  white-space: nowrap;
}

.timeline-bar::before,
.timeline-bar::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 1.5px;
  height: 9px;
  background: #000;
}

.timeline-bar::before {
  left: 0;
}

.timeline-bar::after {
  right: 0;
}

.timeline-bar.ongoing::after {
  display: none;
}

.timeline-bar .bar-label {
  color: #555;
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
  line-height: 1;
  position: absolute;
  top: -14px;
  left: 0;
  overflow: visible;
  white-space: nowrap;
}

.timeline-bar.label-below .bar-label {
  top: auto;
  bottom: -14px;
}

.timeline-point {
  position: absolute;
  top: 50%;
  width: 5px;
  height: 5px;
  background: #000;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.timeline-point .point-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
  font-size: 8px;
  font-weight: 500;
  color: #555;
  letter-spacing: 0.3px;
}

.city-line {
  position: absolute;
  top: -8px;
  bottom: 0;
  width: 1px;
  background: rgba(0, 0, 0, 0.08);
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 1;
}

.city-marker {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
  font-size: 8px;
  font-weight: 700;
}
```

- [ ] **Step 2: Update timeline.js renderTracks for thin-line bars**

In `timeline.js`, update the `renderTracks` function. The bar elements stay the same structurally but we simplify the class logic since all labels now sit above or below:

```js
function renderTracks() {
  const container = document.getElementById('timeline-tracks');
  container.innerHTML = '';

  TRACKS.forEach(trackName => {
    const row = document.createElement('div');
    row.className = 'timeline-track';

    const label = document.createElement('div');
    label.className = 'timeline-track-label';
    label.textContent = trackName;
    row.appendChild(label);

    const trackEvents = EVENTS.filter(e => e.track === trackName);

    let barCount = 0;
    trackEvents.forEach(event => {
      if (event.end !== undefined) {
        const endYear = event.end === null ? TIMELINE_END : event.end;
        const leftPct = yearToPercent(event.start);
        const widthPct = yearToPercent(endYear) - leftPct;

        const bar = document.createElement('div');
        bar.className = 'timeline-bar';
        if (event.end === null) bar.classList.add('ongoing');
        if (barCount % 2 === 1) bar.classList.add('label-below');
        barCount++;
        bar.style.left = `${leftPct}%`;
        bar.style.width = `${widthPct}%`;

        const barLabel = document.createElement('span');
        barLabel.className = 'bar-label';
        barLabel.textContent = event.name;
        bar.appendChild(barLabel);

        row.appendChild(bar);
      } else {
        const point = document.createElement('div');
        point.className = 'timeline-point';
        point.style.left = `${yearToPercent(event.start)}%`;

        const pointLabel = document.createElement('span');
        pointLabel.className = 'point-label';
        pointLabel.textContent = event.name;
        point.appendChild(pointLabel);

        row.appendChild(point);
      }
    });

    container.appendChild(row);
  });
}
```

- [ ] **Step 3: Verify in browser**

Reload — timeline bars should now be thin lines with start/end tick marks. Labels sit above/below the line. Point events are small dots. Overall should feel like a minimal caption.

- [ ] **Step 4: Commit**

```bash
git add style.css timeline.js
git commit -m "feat: ultra-minimal timeline with thin lines and ticks"
```

---

### Task 7: Default to Butterfly Projection + Update Title

**Files:**
- Modify: `projections.js` (lines 66-68)
- Modify: `index.html` (lines 15-16)

- [ ] **Step 1: Change default preset in parseParams**

In `projections.js`, update the fallback defaults (around line 67-68):

Change:
```js
const red = params.get("red") || PRESETS.compromise.red;
const blue = params.get("blue") || PRESETS.compromise.blue;
```
To:
```js
const red = params.get("red") || PRESETS.butterfly.red;
const blue = params.get("blue") || PRESETS.butterfly.blue;
```

Also update the validation fallbacks (around line 71-72):

Change:
```js
red: PROJECTIONS[red] ? red : PRESETS.compromise.red,
blue: PROJECTIONS[blue] ? blue : PRESETS.compromise.blue,
```
To:
```js
red: PROJECTIONS[red] ? red : PRESETS.butterfly.red,
blue: PROJECTIONS[blue] ? blue : PRESETS.butterfly.blue,
```

- [ ] **Step 2: Update title and subtitle in index.html**

Change the h1 (line 15):
```html
<h1>Dissolve to transform</h1>
```

Change the subtitle (line 16):
```html
<p class="subtitle">Five cities, two projections, one career. A caterpillar must dissolve completely before becoming a butterfly — and so must a career, each time it transforms.</p>
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8080` (no params) — should show butterfly projections by default. Title should read "Dissolve to transform." With `?controls=true`, the butterfly preset button should show as active.

- [ ] **Step 4: Commit**

```bash
git add projections.js index.html
git commit -m "feat: default to butterfly projection, update title"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Test all views**

Verify in browser:
- `http://localhost:8080` — butterfly default, rose/sage colors, everything in viewport
- `http://localhost:8080?controls=true` — controls visible, theme colors on labels
- `http://localhost:8080?preset=compromise` — Natural Earth + Winkel Tripel still works
- `http://localhost:8080?preset=subtle` — Kavrayskiy + Robinson still works
- Resize window — layout adapts, map stays fully visible

- [ ] **Step 2: Test classic theme (manual)**

Temporarily change `let currentTheme = THEMES.classic;` in `map.js`, reload, verify red/blue renders correctly. Change it back to `THEMES.roseSage`.

- [ ] **Step 3: Done**

Branch `visual-refinement` is ready for review.

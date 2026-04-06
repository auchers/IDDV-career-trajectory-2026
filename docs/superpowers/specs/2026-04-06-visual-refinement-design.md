# Visual Refinement — Design Spec

## Overview

A set of visual refinements to the career trajectory map to achieve three goals: fit everything in a single viewport, bring the aesthetic closer to the Warhol dance-step inspiration, and soften the color palette for a springtime feel. All work happens on a separate experimental branch.

## 1. Layout — Height-First Single Viewport

Replace the current `aspect-ratio: 16/9` canvas with a flex layout that fills exactly `100vh`:

```
body (100vh, flex column)
├── header          — auto height
├── canvas#map      — flex: 1 (fills remaining space)
└── div#timeline    — fixed height (~100-110px)
```

- The canvas stretches to fill available space after header and timeline are placed.
- `fitProjection` must constrain to the smaller dimension so the full projection is visible (no clipping). Letterbox with white if the available rectangle doesn't match the projection's natural aspect ratio.
- Remove `aspect-ratio: 16/9` from the canvas CSS.

## 2. Map Styling — Remove Outer Border

- Remove the sphere outline stroke (`path(outline)` call in `renderProjection`). The graticules provide enough shape context.
- Keep graticules at current low opacity (0.3), rendered in projection colors.

## 3. Colors — Rose + Sage with Swappable Themes

Define a color theme abstraction so palettes can be swapped with a single variable change.

### Theme structure

```js
const THEMES = {
  roseSage: {
    projA: '#D4878F',   // dusty rose
    projB: '#8BAF9E',   // muted sage
  },
  classic: {
    projA: '#f00',      // red
    projB: '#00f',      // blue
  },
};

let currentTheme = THEMES.roseSage;
```

### Color application

- Projection A land, graticule, outline → `currentTheme.projA`
- Projection B land, graticule, outline → `currentTheme.projB`
- Multiply overlap → product of the two theme colors (automatic via blend mode)
- Flight paths, markers, labels → **always black**, independent of theme
- Background → **always white**
- Control labels (`.projection-label.red`, `.projection-label.blue`) → update to match theme colors via CSS custom properties or inline styles

### Design constraint

Rose/sage colors carry the meaning "two projection lenses." They must not appear in the timeline or any other element — this preserves the metaphor's clarity.

## 4. Markers & Labels — Bold, No Panel

Restyle city markers to feel like graphic annotations rather than data callouts:

- **Numbered circles**: unchanged — black fill, white number, white halo ring
- **Remove**: white backing panel, black border, connector lines to label
- **Remove**: lat/lon coordinate text
- **City name**: bold text drawn directly on canvas with a white stroke/shadow (2-3px) for legibility against the map
- **Label offsets**: keep per-city manual nudges, adjust as needed

## 5. Timeline — Ultra-Minimal

Replace heavy filled bars with a minimal caption-like treatment:

- **Duration events**: thin horizontal lines (1-2px, black) with small vertical start/end ticks. Text labels above or below the line.
- **Point events**: small dots (4-5px), labels positioned as now
- **City arrival markers**: keep numbered circles matching map markers
- **Track labels** (STUDY, BUILD, LOVE): keep in JetBrains Mono, same position
- **Axis**: lighten tick marks and year labels slightly
- **Color**: entirely black/gray — no rose/sage

The timeline reads as a footnote to the map, present but not competing.

## 6. Default Projection — Butterfly

- Change `parseParams()` defaults from `compromise` to `butterfly` preset
- Update header title from "Every projection is a compromise" to "Dissolve to transform"
- Update subtitle to reflect the butterfly/transformation metaphor

## 7. Branch Strategy

All changes on a new branch (e.g. `visual-refinement`) off `main` for experimentation.

## Files Affected

| File | Changes |
|---|---|
| `style.css` | Remove aspect-ratio, add 100vh flex layout, update timeline bar styles, update control label colors |
| `map.js` | Add theme abstraction, remove sphere outline, restyle markers/labels, update render pipeline |
| `projections.js` | Change default preset to butterfly |
| `timeline.js` | Replace filled bars with thin lines + ticks |
| `index.html` | Update title and subtitle text |

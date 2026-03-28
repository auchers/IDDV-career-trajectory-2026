# Career Trajectory Map — Design Spec

## Overview

A 16:9 landscape card for a panel presentation. The top ~60% is a Warhol-dance-diagram-styled world map showing career locations connected by flight-path arcs. The bottom ~40% (future work) holds three chronological timeline tracks: LEARN, WORK, LOVE.

This spec covers the **map portion only**.

## Visual Style

Inspired directly by Andy Warhol dance step diagrams:

- **Pure black and white** — no grays, no color
- **Dashed directional lines with arrowheads** for flight paths between locations
- **Bold graphic shapes** — solid black landmasses on white background
- **Thick stroke weights** — 2-4px for paths, 1-2px for country borders
- **High contrast, print-like aesthetic**

## Tech Stack

- Single HTML page
- D3.js v7 for geo projections and SVG rendering
- TopoJSON (Natural Earth 110m) for world country boundaries
- Vanilla CSS for styling
- No build step — open the HTML file directly

## Map Projections

Two projections available, toggled via URL parameter:

| Projection | D3 Function | Notes |
|---|---|---|
| Waterman Butterfly | `d3.geoPolyhedralWaterman()` | Default. Surprising, low-distortion butterfly shape |
| Conic Equal-Area | `d3.geoConicEqualArea()` | Centered ~40°N, -20°W to frame US + Middle East. Fits 16:9 naturally |

### URL Parameters

- `?projection=waterman` (default) or `?projection=conic` — selects the active projection
- `?controls=true` — shows a small toggle control at the bottom of the map to switch between projections interactively

When `controls` is not `true`, no UI chrome is visible — the map is presentation-ready.

## City Stops

Five locations, numbered chronologically:

| # | City | Lat | Lon |
|---|---|---|---|
| 1 | Los Angeles | 34.05°N | 118.24°W |
| 2 | Berkeley | 37.87°N | 122.27°W |
| 3 | Tel Aviv | 32.08°N | 34.78°E |
| 4 | Brooklyn | 40.68°N | 73.94°W |
| 5 | Boston | 42.36°N | 71.06°W |

### Marker Design

Each stop is annotated with:
- **Bold numbered circle** — black fill, white number
- **City name** — bold sans-serif, positioned near the circle
- **Lat/lon coordinates** — smaller text below the city name (e.g. `34.05°N, 118.24°W`)

Labels are positioned to avoid overlap with paths and landmasses. Manual nudge offsets per city if needed.

## Flight Paths

Great-circle arcs between consecutive stops:

1. Los Angeles → Berkeley
2. Berkeley → Tel Aviv
3. Tel Aviv → Brooklyn
4. Brooklyn → Boston

### Path Styling

- **Dashed stroke**: `stroke-dasharray` with thick dashes and visible gaps (e.g. `12,6`)
- **Arrowhead markers**: SVG `<marker>` elements at the destination end of each path
- **Stroke width**: 2-3px
- **Black only**

D3's `d3.geoPath` with `d3.geoInterpolate` handles great-circle interpolation natively.

## SVG Structure

```
<svg>
  <defs>
    <marker id="arrowhead"> ... </marker>
  </defs>
  <g class="land">         <!-- country boundaries, filled black -->
  <g class="flight-paths">  <!-- dashed great-circle arcs with arrows -->
  <g class="markers">       <!-- numbered circles + labels for each city -->
</svg>
```

## Layout

- Map SVG fills the top portion of the viewport
- Aspect ratio of the SVG adapts to the chosen projection
- For Waterman: scale and translate to emphasize the N. America + Europe/Middle East wings, clipping the southern hemisphere wings if they extend beyond the viewport
- For Conic: natural 16:9 fit, centered on the Atlantic

## Rendering Details

- Land: `fill: black`, `stroke: none`
- Country borders: `stroke: white`, `stroke-width: 0.5px` (subtle separation within black land)
- Ocean/background: white
- Graticule (optional): thin dashed gray lines for the lat/lon grid — adds to the cartographic/technical feel

## File Structure

```
career-trajectory/
├── index.html          # Main page
├── style.css           # Warhol-style CSS
├── map.js              # D3 map rendering logic
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-03-27-career-map-design.md
```

## Future Work (not in this spec)

- Bottom section: three horizontal timeline tracks (LEARN, WORK, LOVE) with JS for accurate date spacing
- Export to Figma or SVG for final presentation polish
- Possible hand-drawn SVG filter for organic texture

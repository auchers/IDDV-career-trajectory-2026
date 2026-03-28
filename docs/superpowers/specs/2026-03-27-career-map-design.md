# Career Trajectory Map — Design Spec

## Overview

A 16:9 landscape card for a panel presentation. The top ~60% is a dual-projection overlay world map showing career locations connected by flight-path arcs. The bottom ~40% (future work) holds three chronological timeline tracks: LEARN, WORK, LOVE.

The dual-projection overlay serves as a visual metaphor: the same career journey rendered through two different lenses, where agreement shows as solid black and divergence bleeds out as red and blue fringe — mirroring the ambiguity inherent in any career narrative.

This spec covers the **map portion only**.

## Visual Style

Black, red, and blue — inspired by:
- **Andy Warhol dance step diagrams**: bold graphic shapes, dashed directional arrows, high contrast
- **D3 projection comparison**: two projections overlaid via canvas `multiply` blend mode

Key properties:
- **Three-color palette**: black (overlap), red (projection A), blue (projection B), white (background)
- **Dashed directional lines with arrowheads** for flight paths between locations
- **Bold graphic shapes** — solid filled landmasses
- **Thick stroke weights** — 2-4px for paths
- **High contrast, print-like aesthetic**
- **Graticules** for each projection in their respective colors at low opacity

## Tech Stack

- Single HTML page
- D3.js v7 + d3-geo-projection for extended projection support
- **Canvas 2D** rendering (not SVG) — required for `globalCompositeOperation: "multiply"` blend mode
- TopoJSON (Natural Earth 110m) for world country boundaries
- Vanilla CSS for page layout and controls
- No build step — open the HTML file directly

## Dual-Projection Rendering

### How It Works

1. Render projection A (red) landmasses and graticule to canvas
2. Set `globalCompositeOperation = "multiply"`
3. Render projection B (blue) landmasses and graticule to canvas
4. Where both projections agree → red * blue = **black**
5. Where only A has land → **red** fringe
6. Where only B has land → **blue** fringe

Both projections are centered and scaled to the same canvas, fitted to the viewport.

### Projection Pairings

Dropdowns allow selecting any D3 projection for red and blue channels. The following curated pairings are highlighted as presets:

| Preset Name | Red (Projection A) | Blue (Projection B) | Why |
|---|---|---|---|
| **"Every projection is a compromise"** (default) | Natural Earth | Winkel Tripel | Natural Earth was designed for data visualization; Winkel Tripel is Nat Geo's choice. Two authoritative compromises. Most overlap in mid-latitudes where career cities live. |
| "Same story, different emphasis" | Kavrayskiy VII | Robinson | Near-identical pseudocylindrical projections. Subtle fringe — like two people telling the same story slightly differently. |
| "Two branches, same family" | American Polyconic | Rectangular Polyconic | Same mathematical family, different parameters. Sibling projections. |
| "Butterfly wings" | Butterfly (gnomonic) | Butterfly (Collignon) | Angular diamond/butterfly shapes. Dramatic visual divergence. Bold graphic energy — most Warhol-like. |

### URL Parameters

- `?red=naturalEarth1&blue=winkelTripel` — selects projections by D3 function name (defaults to Natural Earth + Winkel Tripel)
- `?preset=butterfly` — shorthand to load a curated pairing (`compromise`, `subtle`, `polyconic`, `butterfly`)
- `?controls=true` — shows dropdown selectors and preset buttons

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

Each stop is annotated with: // i'd like to add in the white stroke around the dot and text (as in the warhal diagrams)
- **Bold numbered circle** — black fill, white number
- **City name** — bold sans-serif, positioned near the circle
- **Lat/lon coordinates** — smaller text below the city name (e.g. `34.05°N, 118.24°W`)

Markers are rendered as an SVG overlay on top of the canvas (or drawn on canvas after the multiply pass), using projection A's coordinates for positioning. Labels have manual nudge offsets per city to avoid overlap.

## Flight Paths

Great-circle arcs between consecutive stops:

1. Los Angeles → Berkeley
2. Berkeley → Tel Aviv
3. Tel Aviv → Brooklyn
4. Brooklyn → Boston

### Path Styling

- **Dashed stroke**: thick dashes with visible gaps (canvas `setLineDash([12, 6])`)
- **Arrowhead**: drawn manually at the destination end of each path
- **Stroke width**: 2-3px
- **Black** — paths sit on top of both projections, in the "agreement" color
- Rendered after the multiply composite pass so they appear on top

D3's `d3.geoInterpolate` generates points along the great-circle arc; drawn as a path on the canvas.

## Layout

- Canvas fills the top ~60% of a 16:9 viewport
- Both projections centered and scaled to fit the same bounding box
- Controls (when visible) appear above the canvas as dropdown selectors

## Rendering Pipeline

```
1. Clear canvas (white)
2. Draw projection A land (red fill)
3. Draw projection A graticule (red stroke, low opacity)
4. Draw projection A outline (red stroke)
5. Set globalCompositeOperation = "multiply"
6. Draw projection B land (blue fill)
7. Draw projection B graticule (blue stroke, low opacity)
8. Draw projection B outline (blue stroke)
9. Reset composite to "source-over"
10. Draw flight paths (black dashed + arrowheads)
11. Draw city markers + labels (black circles, white numbers, black text)
```

## File Structure

```
career-trajectory/
├── index.html          # Main page — canvas + controls
├── style.css           # Layout and control styling
├── map.js              # D3 projection rendering, compositing, flight paths
├── projections.js      # Projection registry, presets, URL param parsing
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-03-27-career-map-design.md
```

## Future Work (not in this spec)

- Bottom section: three horizontal timeline tracks (LEARN, WORK, LOVE) with JS for accurate date spacing
- Export to Figma or high-res PNG for final presentation
- Possible hand-drawn canvas filter for organic texture

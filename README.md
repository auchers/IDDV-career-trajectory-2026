# IDDV-career-trajectory-2026

Career trajectory visualization for IDDV panel talk at Northeastern, 2026.

## What This Is

An interactive career trajectory card that overlays two map projections of the world using canvas `multiply` blend mode. Where both projections agree, the land renders as solid black. Where they diverge, red and blue fringe appears — a visual metaphor for the ambiguity inherent in any career narrative.

Five cities are annotated (Los Angeles, Berkeley, Tel Aviv, Brooklyn, Boston) with dashed great-circle flight paths connecting them. Below the map sit three chronological timeline tracks: LEARN, WORK, and LOVE.

## Running It

No build step. Serve locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

### URL Parameters

- `?controls=true` — show projection selectors and preset buttons
- `?preset=compromise` — "Every projection is a compromise" (Natural Earth + Winkel Tripel)
- `?preset=subtle` — "Same story, different emphasis" (Kavrayskiy VII + Robinson)
- `?preset=polyconic` — "Two branches, same family" (American Polyconic + Rectangular Polyconic)
- `?preset=butterfly` — "Dissolve to transform" (Butterfly gnomonic + Butterfly Collignon)
- `?red=naturalEarth1&blue=winkel3` — select projections directly by D3 function name

## Tech Stack

- [D3.js v7](https://d3js.org/) — geo projections and path rendering
- [d3-geo-projection v4](https://github.com/d3/d3-geo-projection) — extended projection library
- [d3-geo-polygon v2](https://github.com/d3/d3-geo-polygon) — polyhedral/butterfly projections
- [TopoJSON Client v3](https://github.com/topojson/topojson-client) — world geometry parsing
- [Natural Earth 110m](https://github.com/topojson/world-atlas) — world country boundaries
- Canvas 2D API with `globalCompositeOperation: "multiply"`

## Visual References

- [D3 Projection Comparison](https://observablehq.com/@d3/projection-comparison) — the Observable notebook that inspired the dual-projection overlay
- Andy Warhol dance step diagrams — the bold graphic style, dashed directional arrows, high contrast aesthetic

## Project Structure

```
index.html          — page shell, canvas, header, timeline, CDN scripts
style.css           — layout, typography (DM Serif Display / DM Sans / JetBrains Mono)
projections.js      — projection registry, 4 curated presets, URL param parsing
map.js              — rendering pipeline: land, graticules, compositing, flight paths, markers
timeline.js         — LEARN/WORK/LOVE chronological tracks
docs/
  talking-points.md — panel talking points and metaphor explorations
  superpowers/
    specs/          — design spec and discussion notes
    plans/          — implementation plan
```

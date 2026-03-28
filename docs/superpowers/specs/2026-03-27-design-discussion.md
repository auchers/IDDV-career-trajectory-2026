# Design Discussion — Career Trajectory Map

## The Brief

Create a card for a panel presentation with:
- **Top**: A world map annotated with career locations, connected by flight-path arcs
- **Bottom** (future): Three chronological tracks — LEARN (academics), WORK (jobs), LOVE (family)
- Style inspired by Andy Warhol dance step diagrams (bold, graphic, dashed arrows)
- "Surprising but accurate" map projection

## Career Locations

1. Los Angeles
2. Berkeley, CA
3. Tel Aviv, Israel
4. Brooklyn, NY
5. Boston, MA

## Projection Exploration

### Initial Candidates

Four "surprising" projections considered:

| Projection | Vibe | Notes |
|---|---|---|
| **Dymaxion (Fuller)** | Futurist, systems-thinker | Unfolded icosahedron. Cool geometry but hard to draw a Berkeley→Tel Aviv flight path across the seams. |
| **Peirce Quincuncial** | Cerebral, art-meets-math | Square projection that tiles like wallpaper. Mathematically elegant. |
| **Waterman Butterfly** | Organic, transformation | Butterfly-wing lobes. Low distortion. Dramatic silhouette. |
| **Werner (Heart-Shaped)** | Poetic, warm | Cordiform projection from the 1500s. Thematic fit with LEARN/WORK/LOVE. |

Initial pick was **Waterman Butterfly** — good geometry, unbroken view of US + Middle East on the same wing, flight paths can arc naturally.

**Conic Equal-Area** was also considered for its natural 16:9 fit, but deemed too conventional for the "surprising" brief.

### The Pivot: Dual-Projection Overlay

Inspired by the [D3 Projection Comparison](https://observablehq.com/@d3/projection-comparison) Observable notebook.

**Core idea:** Overlay two projections using canvas `multiply` blend mode:
- Where both agree → **black**
- Where only projection A has land → **red** fringe
- Where only projection B has land → **blue** fringe

**The metaphor:** The same career journey rendered through two different lenses. Agreement is solid; divergence bleeds at the edges — mirroring the ambiguity in any career narrative. "Every projection is a compromise — so is every career narrative."

### Curated Projection Pairings

#### 1. "Every projection is a compromise" (default)
**Natural Earth** (red) + **Winkel Tripel** (blue)

- Natural Earth was literally *designed for data visualization* (by Tom Patterson). Winkel Tripel is National Geographic's choice.
- Two authoritative compromises — neither preserves any single property perfectly, but both try to look "right."
- Most overlap in mid-latitudes where the career cities live → solid black where it matters, ambiguity at the margins.
- Perfect resonance with a career in data visualization.

#### 2. "Same story, different emphasis"
**Kavrayskiy VII** (red) + **Robinson** (blue)

- Near-identical pseudocylindrical projections beloved by textbooks.
- Subtle fringe — like two people telling the same story with slightly different emphasis.
- Metaphor: careers look nearly the same from the outside but feel different from within.

#### 3. "Two branches, same family"
**American Polyconic** (red) + **Rectangular Polyconic** (blue)

- Same mathematical family, different parameters. Sibling projections.
- The divergence *is* the interesting part.

#### 4. "Butterfly wings"
**Butterfly (gnomonic)** (red) + **Butterfly (Collignon)** (blue)

- Angular diamond/butterfly shapes. Dramatic visual divergence.
- Most Warhol-like of all the pairings — bold graphic energy.
- Butterfly = transformation metaphor. Apt for a career journey, though perhaps let the audience discover that rather than calling it out.

## Style Evolution

Started with pure black-and-white Warhol dance diagram aesthetic. Evolved to **black + red + blue** three-color palette to support the dual-projection overlay, which actually *strengthens* the Warhol energy — bold, graphic, high-contrast, limited palette.

Key style decisions:
- Very literal Warhol: bold shapes, dashed arrow flight paths, high contrast
- Numbered city markers with city name + lat/lon coordinates (technical/cartographic feel)
- Graticules in red/blue at low opacity for each projection
- Flight paths in black (the "agreement" color) on top of everything

## Technical Decisions

- **Canvas** (not SVG) — required for `globalCompositeOperation: "multiply"` blend mode
- **D3.js v7 + d3-geo-projection** — extended projection library has all the exotic projections
- **URL params** for projection control (`?red=...&blue=...`, `?preset=butterfly`, `?controls=true`)
- Controls hidden by default for clean presentation mode
- HTML page in a standalone repo — fast iteration, no build step

## Format

16:9 landscape. Map in the top ~60%, timeline tracks below (future work).

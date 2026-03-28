# Talking Points — Career Trajectory Panel

## The Core Metaphor: Projections as Compromise

- Every map projection sacrifices something to preserve something else. So does every career choice. So does every visualization.
- The dual-projection overlay makes this visible: where two reasonable projections agree, the land is solid black. Where they diverge, the ambiguity bleeds out as red and blue fringe.
- "Every projection is a compromise" — applies to cartography, career narratives, and the act of visualization itself.

## Visualization as Shared Ground Truth

- The black overlap zone is the **town square** — the part both views agree on. It's the shared reality that people can align around.
- The red/blue fringe is the ambiguity that exists *before* people converge on a shared view. Visualization's job is to shrink that fringe — to help people find the black.
- A career in dataviz is a career of building these town squares: visual standards of truth that groups can navigate by.

## Navigating Ambiguity

- Visualization doesn't eliminate ambiguity — it makes it *visible* and *navigable*.
- The map literally shows this: the same five cities, the same journey, but the shape of the path depends on the lens. Both views are valid. Neither is complete.
- This is what dataviz practitioners do daily: choose a projection (a framing, a chart type, a scale) knowing it's a compromise, and being honest about what it distorts.

## Language Creates Meaning (Verbal and Visual)

- Every projection is a *language* for describing the globe. Each one emphasizes different truths and hides different distortions.
- Visual language is not neutral — the choice of projection, color, layout *creates* meaning, it doesn't just convey it.
- The dual-overlay makes this tangible: the same data (landmasses) told in two visual dialects produces two different shapes. The meaning shifts with the medium.

## The Projection Pairings (and What They Say)

### "Every projection is a compromise" (Natural Earth + Winkel Tripel)
- Natural Earth was designed *for data visualization*. Winkel Tripel is National Geographic's standard.
- Two authoritative compromises from different traditions — the dataviz worldview vs. the geographic establishment.
- They agree beautifully in the mid-latitudes where the career cities live. The ambiguity is at the margins.
- **Talking point:** Two well-intentioned, well-designed frameworks that agree on the center but disagree on the edges. The question isn't which is right — it's which distortions you're willing to accept.

### "Same story, different emphasis" (Kavrayskiy VII + Robinson)
- Near-identical pseudocylindrical projections. The fringe between them is *subtle*.
- Like two people telling the same story with slightly different emphasis.
- **Talking point:** Careers look nearly the same from the outside but feel different from within. The fine-grained ambiguity is the most personal kind.

### "Two branches, same family" (American Polyconic + Rectangular Polyconic)
- Same mathematical family, different parameters. Sibling projections.
- **Talking point:** Same roots, different unfolding. The divergence *is* the interesting part — the kind of difference only you would notice.

### "Dissolve to transform" (Butterfly gnomonic + Butterfly Collignon)
- Angular diamond/butterfly shapes. The most visually dramatic pairing.
- Named for the biological fact: a caterpillar must completely disintegrate into mush before it can become a butterfly. The old form has to dissolve for the new one to emerge.
- **Talking point:** Transformation isn't gradual. Sometimes you have to completely unmake yourself to become what's next. Multiple career pivots — LA to Berkeley to Tel Aviv to Brooklyn to Boston — each one required dissolving the previous version.
- The visual literally does it: landmasses dissolve at the edges into red and blue fringe. The butterfly shape *is* the transformed form.
- Let the audience discover the butterfly = transformation metaphor rather than calling it out directly. The visual does the talking.

## The Alternating Markers

- Each city dot alternates between the two projections: LA on red, Berkeley on blue, Tel Aviv on red, Brooklyn on blue, Boston on red.
- The career path *crosses between* the two views rather than belonging entirely to one.
- Flight paths lerp between the two projected coordinate spaces — literally bridging worldviews.
- **Talking point:** No single framework contains the whole journey. You move between perspectives.

## The Five Cities

| # | City | Coordinates |
|---|---|---|
| 1 | Los Angeles | 34.05°N, 118.24°W |
| 2 | Berkeley | 37.87°N, 122.27°W |
| 3 | Tel Aviv | 32.08°N, 34.78°E |
| 4 | Brooklyn | 40.68°N, 73.94°W |
| 5 | Boston | 42.36°N, 71.06°W |

All five sit in the mid-latitudes spanning the Atlantic — the zone where most projections agree. The career lived in the ground truth; the ambiguity is at the edges.

## Design Decisions Worth Mentioning

- **Warhol dance diagram inspiration**: The bold graphic style, dashed directional arrows, and high contrast came from Andy Warhol's dance step diagrams. Career as choreography.
- **Canvas multiply blend mode**: The red + blue = black overlap is achieved with `globalCompositeOperation: "multiply"` — a compositing technique, not a visual trick. The math *produces* the metaphor.
- **D3.js projection comparison**: Directly inspired by the Observable notebook. The tool built for exploring projections became the medium for exploring careers.
- **Three-font hierarchy**: DM Serif Display (poetic title) → DM Sans (informational body) → JetBrains Mono (technical/cartographic labels). Three voices: reflective, explanatory, precise.

## Timeline Tracks (Below the Map)

Three chronological tracks that sit under the map:
- **LEARN** — academics, education
- **WORK** — jobs, roles, companies
- **LOVE** — kids, family events, personal milestones

The map shows *where*. The timeline shows *when* and *what*. Together they're the full picture — geography and chronology, space and time.

## Potential Panel Hooks

- "I built a map of my career and the most interesting part was what the two projections *disagreed* about."
- "In dataviz we talk about choosing the right chart type. But there's no right projection — only useful ones."
- "The places where both views agree — that's where you are sure. The fringe is where you're still figuring it out."
- "Visualization doesn't just show data. It creates a shared language for navigating ambiguity together."

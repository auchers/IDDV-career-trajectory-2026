# Timeline Tracks Design Spec

## Overview

Three parallel chronological timeline tracks displayed below the map canvas, showing life events across education, career, and personal milestones. Part of a 16:9 landscape card for a career trajectory panel presentation.

## Track Names

- **STUDY** — academic programs
- **BUILD** — career/jobs
- **LOVE** — personal milestones

## Layout

The page splits vertically:
- **Top ~70%**: dual-projection map canvas (built separately)
- **Bottom ~30%**: timeline HTML section

The timeline section contains:
1. **Time axis** — thin horizontal line at the top with year ticks (2010, 2012, 2014, ... 2026)
2. **Three track rows** stacked vertically, each with:
   - Bold track label in a fixed left gutter (~80px)
   - Proportionally-positioned bars for duration events
   - Point markers (dots) for single-moment events
   - Event labels (name + years)
3. **Vertical city-arrival lines** — solid black lines at each city-arrival year, cutting through all three tracks, with numbered circle markers at the top (on the time axis)

## Rendering Approach

HTML/CSS below the canvas (not drawn on canvas). The map stays on canvas; the timeline is a separate HTML structure using `div` elements with CSS positioning.

**Rationale**: The timeline is fundamentally typographic — track labels, event names, years. CSS handles typography (Helvetica Neue, letter-spacing, weight) far better than canvas `fillText`. Easy to iterate on styling. Naturally print-friendly.

## Visual Styling

Matches the map's Warhol-inspired aesthetic:

- **Track labels**: Bold Helvetica Neue, uppercase, left-aligned in fixed gutter
- **Duration bars**: Solid black fill, ~20px height. Event name in white knockout text inside the bar. If bar is too narrow for text (< ~2 years), label goes above the bar in black.
- **Point events** (marriage, kids): Solid black circle (~8px diameter), label above in small caps
- **Time axis**: Thin black line (1px), year ticks as small text. Subtle — reference, not the star.
- **City vertical lines**: Solid black, 1px, full height of timeline section. Numbered circle at top matches map's city markers exactly (black circle, white number inside).
- **Spacing**: Generous white space between tracks
- **Background**: White
- **Palette**: Monochrome (black on white) — the map owns the color

No borders, no grid lines, no decorative elements. Bars and verticals do all the visual work.

## Data Model

Two separate data structures:

### Events

```js
const events = [
  // STUDY
  { track: 'STUDY', name: 'UC Berkeley', start: 2010, end: 2014 },
  { track: 'STUDY', name: 'Parsons', start: 2017, end: 2018 },

  // BUILD
  { track: 'BUILD', name: 'Riskified', start: 2014, end: 2017 },
  { track: 'BUILD', name: 'Federal Reserve Bank', start: 2018, end: 2019 },
  { track: 'BUILD', name: 'Two-N', start: 2019, end: 2021 },
  { track: 'BUILD', name: 'Atlassian', start: 2021, end: 2024 },
  { track: 'BUILD', name: 'Netflix', start: 2024, end: null }, // null = ongoing

  // LOVE
  { track: 'LOVE', name: 'Marriage', start: 2018 },           // point event (no end)
  { track: 'LOVE', name: 'Leni', start: 2021 },               // point event
  { track: 'LOVE', name: 'Yuval', start: 2023 },              // point event
];
```

Point events have no `end` field (or `end: undefined`). Duration events with `end: null` indicate "ongoing" and render to the current date.

### City Arrivals

```js
const cityArrivals = [
  { city: 'Los Angeles', number: 1, year: null },  // origin / before timeline
  { city: 'Berkeley', number: 2, year: 2010 },
  { city: 'Tel Aviv', number: 3, year: 2014 },
  { city: 'Brooklyn', number: 4, year: 2017 },
  { city: 'Boston', number: 5, year: 2022 },
];
```

City arrivals produce the vertical lines independently of events. LA (number 1) has `year: null` since it's the origin point before the timeline range — it may appear as a marker at the left edge or be omitted.

## Layout Mechanics

- Container: `position: relative` div below the canvas
- Time range: 2010–2026
- Bars and markers placed via percentage-based `left` and `width` calculated from the time range
- The timeline section sits directly below the canvas with no gap, so vertical city lines visually connect the two halves

## Integration

- New file: `timeline.js` — contains data and rendering logic
- Loaded in `index.html` after the map scripts
- Shares the same typography (Helvetica Neue) and visual language as the map
- Responds to existing `?controls=true` URL param for future interactivity

## Tech Stack

Same as the map:
- Vanilla HTML/CSS/JS
- No build step
- D3 optional (may use for scale calculations, but CSS positioning may suffice)

## Open Questions / Iteration Points

- May pivot from Gantt bars to connected dots (data model supports both)
- LA marker positioning (before timeline range)
- Exact proportions of map vs timeline (70/30 is a starting point)
- Whether "now" arrow or fade treatment is needed for Netflix's open-ended bar

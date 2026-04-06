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
    name: "Dissolve to transform",
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
  const red = params.get("red") || PRESETS.butterfly.red;
  const blue = params.get("blue") || PRESETS.butterfly.blue;

  return {
    red: PROJECTIONS[red] ? red : PRESETS.butterfly.red,
    blue: PROJECTIONS[blue] ? blue : PRESETS.butterfly.blue,
    showControls,
  };
}

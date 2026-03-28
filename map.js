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

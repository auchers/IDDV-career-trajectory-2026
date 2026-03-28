// map.js — main rendering pipeline

const WORLD_DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CITIES = [
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Berkeley", lat: 37.87, lon: -122.27 },
  { name: "Tel Aviv", lat: 32.08, lon: 34.78 },
  { name: "Brooklyn", lat: 40.68, lon: -73.94 },
  { name: "Boston", lat: 42.36, lon: -71.06 },
];

function renderFlightPaths(ctx, projection) {
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([12, 6]);

  for (let i = 0; i < CITIES.length - 1; i++) {
    const from = [CITIES[i].lon, CITIES[i].lat];
    const to = [CITIES[i + 1].lon, CITIES[i + 1].lat];
    const interpolate = d3.geoInterpolate(from, to);

    // Generate points along the great circle
    const numPoints = 100;
    const points = Array.from({ length: numPoints + 1 }, (_, j) => {
      const t = j / numPoints;
      return projection(interpolate(t));
    }).filter((p) => p != null);

    if (points.length < 2) continue;

    // Draw the dashed arc
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let j = 1; j < points.length; j++) {
      ctx.lineTo(points[j][0], points[j][1]);
    }
    ctx.stroke();

    // Draw arrowhead at destination
    const tip = points[points.length - 1];
    const prev = points[points.length - 2];
    const angle = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
    const arrowLen = 14;
    const arrowWidth = Math.PI / 6;

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(
      tip[0] - arrowLen * Math.cos(angle - arrowWidth),
      tip[1] - arrowLen * Math.sin(angle - arrowWidth)
    );
    ctx.lineTo(
      tip[0] - arrowLen * Math.cos(angle + arrowWidth),
      tip[1] - arrowLen * Math.sin(angle + arrowWidth)
    );
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.setLineDash([12, 6]);
  }

  ctx.restore();
}

function formatCoord(lat, lon) {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}\u00B0${latDir}, ${Math.abs(lon).toFixed(2)}\u00B0${lonDir}`;
}

// Manual label offsets to avoid overlap [dx, dy] from center of circle
const LABEL_OFFSETS = [
  [-20, 25],   // LA — below-left
  [-20, -18],  // Berkeley — above-left
  [20, -10],   // Tel Aviv — above-right
  [20, 25],    // Brooklyn — below-right
  [20, -10],   // Boston — above-right
];

function renderMarkers(ctx, projection) {
  const radius = 14;

  CITIES.forEach((city, i) => {
    const [x, y] = projection([city.lon, city.lat]) || [0, 0];
    const [dx, dy] = LABEL_OFFSETS[i];

    // White stroke ring (Warhol style)
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Black filled circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();

    // White number
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), x, y + 1);

    // City name — white stroke behind black text (Warhol knockout)
    const labelX = x + dx;
    const labelY = y + dy;

    ctx.font = "bold 14px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = dx > 0 ? "left" : "right";
    ctx.textBaseline = "top";

    // White stroke for legibility
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeText(city.name, labelX, labelY);
    ctx.fillStyle = "#000";
    ctx.fillText(city.name, labelX, labelY);

    // Lat/lon coordinates
    const coordStr = formatCoord(city.lat, city.lon);
    ctx.font = "11px 'Helvetica Neue', Arial, sans-serif";

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeText(coordStr, labelX, labelY + 17);
    ctx.fillStyle = "#000";
    ctx.fillText(coordStr, labelX, labelY + 17);
  });
}

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

  let width = rect.width;
  let height = rect.height;

  const worldData = await loadWorldData();
  const graticule = d3.geoGraticule().precision(2.5)();
  const outline = { type: "Sphere" };

  function render() {
    const w = width;
    const h = height;

    const projRed = fitProjection(PROJECTIONS[config.red].fn, w, h);
    const pathRed = d3.geoPath(projRed, ctx);

    const projBlue = fitProjection(PROJECTIONS[config.blue].fn, w, h);
    const pathBlue = d3.geoPath(projBlue, ctx);

    // Clear
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    // Red projection
    renderProjection(ctx, pathRed, worldData.land, graticule, outline, "#f00");

    // Multiply blend
    ctx.globalCompositeOperation = "multiply";

    // Blue projection
    renderProjection(ctx, pathBlue, worldData.land, graticule, outline, "#00f");

    // Reset composite
    ctx.globalCompositeOperation = "source-over";

    // Flight paths and markers (use red projection for positioning)
    const projRedForPaths = fitProjection(PROJECTIONS[config.red].fn, w, h);
    renderFlightPaths(ctx, projRedForPaths);
    renderMarkers(ctx, projRedForPaths);
  }

  render();

  // Expose render + config for controls (Task 5)
  window._map = { render, config, width, height, worldData, ctx };

  // Controls
  if (config.showControls) {
    document.getElementById("controls").classList.remove("hidden");

    const redSelect = document.getElementById("red-select");
    const blueSelect = document.getElementById("blue-select");

    // Populate dropdowns
    Object.entries(PROJECTIONS).forEach(([key, { name }]) => {
      redSelect.add(new Option(name, key));
      blueSelect.add(new Option(name, key));
    });
    redSelect.value = config.red;
    blueSelect.value = config.blue;

    const onProjectionChange = () => {
      config.red = redSelect.value;
      config.blue = blueSelect.value;
      render();
    };
    redSelect.addEventListener("change", onProjectionChange);
    blueSelect.addEventListener("change", onProjectionChange);

    // Preset buttons
    const presetRow = document.getElementById("preset-buttons");
    Object.entries(PRESETS).forEach(([key, preset]) => {
      const btn = document.createElement("button");
      btn.textContent = preset.name;
      btn.addEventListener("click", () => {
        config.red = preset.red;
        config.blue = preset.blue;
        redSelect.value = config.red;
        blueSelect.value = config.blue;
        render();
      });
      presetRow.appendChild(btn);
    });
  }

  // Resize handler
  window.addEventListener("resize", () => {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    width = r.width;
    height = r.height;
    render();
  });
}

init();

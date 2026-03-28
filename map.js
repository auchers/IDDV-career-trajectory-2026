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

    // Build the arc path as a reusable function
    const drawArc = () => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let j = 1; j < points.length; j++) {
        ctx.lineTo(points[j][0], points[j][1]);
      }
    };

    // Black solid outline behind white dashes
    ctx.setLineDash([]);
    drawArc();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();

    // White dashed arc on top
    ctx.setLineDash([12, 6]);
    drawArc();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrowhead at destination
    const tip = points[points.length - 1];
    const prev = points[points.length - 2];
    const angle = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
    const arrowLen = 12;
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
    // Black outline arrow
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  ctx.restore();
}

function formatCoord(lat, lon) {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}\u00B0${latDir}, ${Math.abs(lon).toFixed(2)}\u00B0${lonDir}`;
}

// Label offsets [dx, dy] from center of circle, and text alignment
const LABEL_OFFSETS = [
  { dx: -16, dy: 20, align: "right" },   // LA — below-left
  { dx: -16, dy: -44, align: "right" },   // Berkeley — above-left
  { dx: 16, dy: -16, align: "left" },     // Tel Aviv — above-right
  { dx: 16, dy: 20, align: "left" },      // Brooklyn — below-right
  { dx: 16, dy: -44, align: "left" },     // Boston — above-right
];

// Pixel nudges to separate overlapping dot pairs (applied to projected coords)
const DOT_NUDGES = [
  { nx: -10, ny: 12 },   // LA — push down-left from Berkeley
  { nx: 10, ny: -12 },   // Berkeley — push up-right from LA
  { nx: 0, ny: 0 },      // Tel Aviv — no nudge
  { nx: -10, ny: 12 },   // Brooklyn — push down-left from Boston
  { nx: 10, ny: -12 },   // Boston — push up-right from Brooklyn
];

const CITY_FONT = "bold 13px 'Helvetica Neue', Arial, sans-serif";
const COORD_FONT = "10px 'Courier New', 'Courier', monospace";

function measureLabel(ctx, city, coordStr) {
  ctx.font = CITY_FONT;
  const nameW = ctx.measureText(city.name).width;
  ctx.font = COORD_FONT;
  const coordW = ctx.measureText(coordStr).width;
  return { width: Math.max(nameW, coordW), nameH: 15, coordH: 13 };
}

function renderMarkers(ctx, projection) {
  const radius = 9;
  const pad = 5;

  CITIES.forEach((city, i) => {
    const projected = projection([city.lon, city.lat]);
    if (!projected) return;
    const [px, py] = projected;
    const { nx, ny } = DOT_NUDGES[i];
    const x = px + nx;
    const y = py + ny;
    const { dx, dy, align } = LABEL_OFFSETS[i];
    const coordStr = formatCoord(city.lat, city.lon);
    const m = measureLabel(ctx, city, coordStr);
    const totalH = m.nameH + m.coordH;

    // Label anchor point
    const labelX = x + dx;
    const labelY = y + dy;

    // Compute backing rect position
    const rectX = align === "left" ? labelX - pad : labelX - m.width - pad;
    const rectY = labelY - pad;
    const rectW = m.width + pad * 2;
    const rectH = totalH + pad * 2;

    // Draw connector line from dot to label
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(labelX, labelY + totalH / 2);
    ctx.stroke();
    ctx.restore();

    // White backing panel with black border
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rectX, rectY, rectW, rectH, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // City name
    ctx.font = CITY_FONT;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000";
    ctx.fillText(city.name, labelX, labelY);

    // Lat/lon coordinates
    ctx.font = COORD_FONT;
    ctx.fillStyle = "#000";
    ctx.fillText(coordStr, labelX, labelY + m.nameH);

    // White halo ring (Warhol style)
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Black filled circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();

    // White number centered in circle
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px 'Helvetica Neue', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), x, y);
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

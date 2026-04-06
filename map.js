// map.js — main rendering pipeline

const WORLD_DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const THEMES = {
  roseSage: {
    projA: '#D4878F',
    projB: '#8BAF9E',
  },
  classic: {
    projA: '#f00',
    projB: '#00f',
  },
};

let currentTheme = THEMES.roseSage;

const CITIES = [
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Berkeley", lat: 37.87, lon: -122.27 },
  { name: "Tel Aviv", lat: 32.08, lon: 34.78 },
  { name: "Brooklyn", lat: 40.68, lon: -73.94 },
  { name: "Boston", lat: 42.36, lon: -71.06 },
];

function renderFlightPaths(ctx, projRed, projBlue) {
  ctx.save();

  for (let i = 0; i < CITIES.length - 1; i++) {
    const from = [CITIES[i].lon, CITIES[i].lat];
    const to = [CITIES[i + 1].lon, CITIES[i + 1].lat];
    const interpolate = d3.geoInterpolate(from, to);

    // Alternate: even cities use red proj, odd use blue
    const projFrom = i % 2 === 0 ? projRed : projBlue;
    const projTo = (i + 1) % 2 === 0 ? projRed : projBlue;

    // Generate points along the great circle, interpolating between projections
    const numPoints = 100;
    const points = Array.from({ length: numPoints + 1 }, (_, j) => {
      const t = j / numPoints;
      const geoPoint = interpolate(t);
      const pFrom = projFrom(geoPoint);
      const pTo = projTo(geoPoint);
      if (!pFrom || !pTo) return null;
      // Lerp between the two projected positions
      return [
        pFrom[0] * (1 - t) + pTo[0] * t,
        pFrom[1] * (1 - t) + pTo[1] * t,
      ];
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

// Label offsets [dx, dy] from center of circle, and text alignment
const LABEL_OFFSETS = [
  { dx: -14, dy: 18, align: "right" },   // LA — below-left
  { dx: -14, dy: -18, align: "right" },  // Berkeley — above-left
  { dx: 14, dy: -14, align: "left" },    // Tel Aviv — above-right
  { dx: 14, dy: 18, align: "left" },     // Brooklyn — below-right
  { dx: 14, dy: -18, align: "left" },    // Boston — above-right
];

const CITY_FONT = "bold 13px 'DM Sans', 'Helvetica Neue', Arial, sans-serif";

function renderMarkers(ctx, projRed, projBlue) {
  const radius = 9;

  CITIES.forEach((city, i) => {
    const projection = i % 2 === 0 ? projRed : projBlue;
    const projected = projection([city.lon, city.lat]);
    if (!projected) return;
    const [x, y] = projected;
    const { dx, dy, align } = LABEL_OFFSETS[i];

    // City name with white stroke for legibility
    const labelX = x + dx;
    const labelY = y + dy;
    ctx.font = CITY_FONT;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";

    // White outline stroke
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeText(city.name, labelX, labelY);

    // Black fill
    ctx.fillStyle = "#000";
    ctx.fillText(city.name, labelX, labelY);

    // White halo ring
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
    ctx.font = "bold 11px 'DM Sans', 'Helvetica Neue', Arial, sans-serif";
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
  // Fit to a taller virtual canvas and shift upward so the southern hemisphere
  // spikes extend below the visible wrapper and get clipped by overflow:hidden.
  const overflowY = height * 0.35;
  const pad = 16;
  projection.fitExtent(
    [[pad, pad - overflowY], [width - pad, height - pad]],
    { type: "Sphere" }
  );
  return projection;
}

function renderProjection(ctx, path, land, graticule, color) {
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
}

async function init() {
  const wrap = document.getElementById("map-wrap");
  const canvas = document.getElementById("map-canvas");
  const ctx = canvas.getContext("2d");
  const config = parseParams();

  // Size canvas to match wrapper (wrapper is flex-sized, canvas is absolute-positioned)
  function syncCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { w, h };
  }

  let { w: width, h: height } = syncCanvasSize();

  const worldData = await loadWorldData();
  const graticule = d3.geoGraticule().precision(2.5)();

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
    renderProjection(ctx, pathRed, worldData.land, graticule, currentTheme.projA);

    // Multiply blend
    ctx.globalCompositeOperation = "multiply";

    // Blue projection
    renderProjection(ctx, pathBlue, worldData.land, graticule, currentTheme.projB);

    // Reset composite
    ctx.globalCompositeOperation = "source-over";

    // Flight paths and markers (alternate between projections)
    renderFlightPaths(ctx, projRed, projBlue);
    renderMarkers(ctx, projRed, projBlue);
  }

  render();

  // Expose render + config for controls (Task 5)
  window._map = { render, config, width, height, worldData, ctx };

  // Spacebar toggle: unified (both projections identical) ↔ split (actual pair)
  let unified = true;
  const splitRed = config.red;
  const splitBlue = config.blue;
  // Start unified: both projections use red's value
  config.blue = config.red;
  render();

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.target.tagName === "SELECT") return;
    e.preventDefault();
    unified = !unified;
    if (unified) {
      config.blue = config.red;
    } else {
      config.red = splitRed;
      config.blue = splitBlue;
    }
    render();
    // Sync dropdowns if controls are visible
    const redSelect = document.getElementById("red-select");
    const blueSelect = document.getElementById("blue-select");
    if (redSelect) redSelect.value = config.red;
    if (blueSelect) blueSelect.value = config.blue;
  });

  // Controls
  if (config.showControls) {
    document.getElementById("projection-doc").classList.remove("hidden");

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
    const presetButtons = [];

    const updateActivePreset = () => {
      presetButtons.forEach(({ btn, preset }) => {
        const isActive = config.red === preset.red && config.blue === preset.blue;
        btn.classList.toggle("active", isActive);
      });
    };

    Object.entries(PRESETS).forEach(([key, preset]) => {
      const btn = document.createElement("button");
      btn.textContent = preset.name;
      btn.addEventListener("click", () => {
        config.red = preset.red;
        config.blue = preset.blue;
        redSelect.value = config.red;
        blueSelect.value = config.blue;
        render();
        updateActivePreset();
      });
      presetRow.appendChild(btn);
      presetButtons.push({ btn, preset });
    });

    // Also clear active state when dropdowns change manually
    redSelect.addEventListener("change", updateActivePreset);
    blueSelect.addEventListener("change", updateActivePreset);

    // Set initial active state
    updateActivePreset();

    document.querySelector('.projection-label.red').style.color = currentTheme.projA;
    document.querySelector('.projection-label.blue').style.color = currentTheme.projB;
  }

  // Resize handler
  window.addEventListener("resize", () => {
    const size = syncCanvasSize();
    width = size.w;
    height = size.h;
    render();
  });
}

init();

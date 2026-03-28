// timeline.js — timeline data and rendering

const TIMELINE_START = 2010;
const TIMELINE_END = 2026;

const EVENTS = [
  // STUDY
  { track: 'STUDY', name: 'UC Berkeley', start: 2010, end: 2014 },
  { track: 'STUDY', name: 'Parsons', start: 2017, end: 2018 },

  // BUILD
  { track: 'BUILD', name: 'Riskified', start: 2014, end: 2017 },
  { track: 'BUILD', name: 'Federal Reserve Bank', start: 2018, end: 2019 },
  { track: 'BUILD', name: 'Two-N', start: 2019, end: 2021 },
  { track: 'BUILD', name: 'Atlassian', start: 2021, end: 2024 },
  { track: 'BUILD', name: 'Netflix', start: 2024, end: null },

  // LOVE
  { track: 'LOVE', name: 'Marriage', start: 2018 },
  { track: 'LOVE', name: 'Leni', start: 2021 },
  { track: 'LOVE', name: 'Yuval', start: 2023 },
];

const CITY_ARRIVALS = [
  { city: 'Los Angeles', number: 1, year: null },
  { city: 'Berkeley', number: 2, year: 2010 },
  { city: 'Tel Aviv', number: 3, year: 2014 },
  { city: 'Brooklyn', number: 4, year: 2017 },
  { city: 'Boston', number: 5, year: 2022 },
];

const TRACKS = ['STUDY', 'BUILD', 'LOVE'];

function yearToPercent(year) {
  return ((year - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}

function renderAxis() {
  const axis = document.getElementById('timeline-axis');
  axis.innerHTML = '';

  for (let year = TIMELINE_START; year <= TIMELINE_END; year += 2) {
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = `${yearToPercent(year)}%`;
    tick.textContent = year;
    axis.appendChild(tick);
  }
}

function renderTracks() {
  const container = document.getElementById('timeline-tracks');
  container.innerHTML = '';

  TRACKS.forEach(trackName => {
    const row = document.createElement('div');
    row.className = 'timeline-track';

    const label = document.createElement('div');
    label.className = 'timeline-track-label';
    label.textContent = trackName;
    row.appendChild(label);

    const trackEvents = EVENTS.filter(e => e.track === trackName);

    trackEvents.forEach(event => {
      if (event.end !== undefined) {
        // Duration bar
        const endYear = event.end === null ? TIMELINE_END : event.end;
        const leftPct = yearToPercent(event.start);
        const widthPct = yearToPercent(endYear) - leftPct;

        const bar = document.createElement('div');
        bar.className = 'timeline-bar';
        if (event.end === null) bar.classList.add('ongoing');
        if (widthPct < 15) bar.classList.add('narrow');
        bar.style.left = `${leftPct}%`;
        bar.style.width = `${widthPct}%`;

        const barLabel = document.createElement('span');
        barLabel.className = 'bar-label';
        barLabel.textContent = event.name;
        bar.appendChild(barLabel);

        row.appendChild(bar);
      } else {
        // Point event
        const point = document.createElement('div');
        point.className = 'timeline-point';
        point.style.left = `${yearToPercent(event.start)}%`;

        const pointLabel = document.createElement('span');
        pointLabel.className = 'point-label';
        pointLabel.textContent = event.name;
        point.appendChild(pointLabel);

        row.appendChild(point);
      }
    });

    container.appendChild(row);
  });
}

function renderCityLines() {
  const container = document.getElementById('timeline-tracks');

  CITY_ARRIVALS.forEach(arrival => {
    if (arrival.year === null) return; // skip LA (before timeline range)

    const line = document.createElement('div');
    line.className = 'city-line';
    line.style.left = `${yearToPercent(arrival.year)}%`;

    const marker = document.createElement('div');
    marker.className = 'city-marker';
    marker.textContent = arrival.number;
    line.appendChild(marker);

    container.appendChild(line);
  });
}

function renderTimeline() {
  renderAxis();
  renderTracks();
  renderCityLines();
}

window.addEventListener('resize', () => {
  renderTimeline();
});

renderTimeline();

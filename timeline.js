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

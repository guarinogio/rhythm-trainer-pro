export const MIN_LENGTH = 1;
export const MAX_LENGTH = 40;

export const STUDY_MODES = {
  clapping: {
    id: 'clapping',
    label: 'Clapping',
    description: 'Short, percussive rhythms for hands or table tapping.',
  },
  voice: {
    id: 'voice',
    label: 'Voice / Ta',
    description: 'Singable rhythm syllables with sustained notes when appropriate.',
  },
};

export const DIFFICULTIES = {
  basic: {
    id: 'basic',
    label: 'Basic',
    description: 'Quarters, rests, and eighth notes.',
  },
  developing: {
    id: 'developing',
    label: 'Developing',
    description: 'Adds sixteenths and simple two-beat cells.',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Adds triplets and dotted rhythms.',
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    description: 'More syncopation, internal rests, and longer vocal phrases.',
  },
};

export const RHYTHMS = {
  rest1: {
    id: 'rest1',
    symbol: '—',
    label: 'Rest',
    clap: 'Rest',
    voice: '—',
    beats: 1,
    events: [],
  },
  quarter: {
    id: 'quarter',
    symbol: '♩',
    label: 'Quarter',
    clap: 'Clap',
    voice: 'Ta',
    beats: 1,
    events: [{ at: 0, duration: 0.12, accent: 1 }],
  },
  eighths: {
    id: 'eighths',
    symbol: '♫',
    label: 'Two eighths',
    clap: 'Clap-clap',
    voice: 'Ta-ka',
    beats: 1,
    events: [
      { at: 0, duration: 0.08, accent: 1 },
      { at: 0.5, duration: 0.08, accent: 0.78 },
    ],
  },
  fourSixteenths: {
    id: 'fourSixteenths',
    symbol: '♬♬',
    label: 'Four sixteenths',
    clap: 'Clap-clap-clap-clap',
    voice: 'Ta-ka-di-mi',
    beats: 1,
    events: [
      { at: 0, duration: 0.055, accent: 1 },
      { at: 0.25, duration: 0.055, accent: 0.62 },
      { at: 0.5, duration: 0.055, accent: 0.78 },
      { at: 0.75, duration: 0.055, accent: 0.62 },
    ],
  },
  eighthTwoSixteenths: {
    id: 'eighthTwoSixteenths',
    symbol: '♪♬',
    label: 'Eighth + two sixteenths',
    clap: 'Clap — clap-clap',
    voice: 'Ta — ka-di',
    beats: 1,
    events: [
      { at: 0, duration: 0.08, accent: 1 },
      { at: 0.5, duration: 0.055, accent: 0.78 },
      { at: 0.75, duration: 0.055, accent: 0.68 },
    ],
  },
  twoSixteenthsEighth: {
    id: 'twoSixteenthsEighth',
    symbol: '♬♪',
    label: 'Two sixteenths + eighth',
    clap: 'Clap-clap — clap',
    voice: 'Ta-ka — di',
    beats: 1,
    events: [
      { at: 0, duration: 0.055, accent: 1 },
      { at: 0.25, duration: 0.055, accent: 0.68 },
      { at: 0.5, duration: 0.08, accent: 0.78 },
    ],
  },
  triplet: {
    id: 'triplet',
    symbol: '♬₃',
    label: 'Triplet',
    clap: 'Clap-clap-clap',
    voice: 'Ta-ki-da',
    beats: 1,
    events: [
      { at: 0, duration: 0.06, accent: 1 },
      { at: 1 / 3, duration: 0.06, accent: 0.72 },
      { at: 2 / 3, duration: 0.06, accent: 0.72 },
    ],
  },
  dottedEighthSixteenth: {
    id: 'dottedEighthSixteenth',
    symbol: '♪.♬',
    label: 'Dotted eighth + sixteenth',
    clap: 'Clap — — clap',
    voice: 'Taa-ka',
    beats: 1,
    events: [
      { at: 0, duration: 0.32, accent: 1 },
      { at: 0.75, duration: 0.055, accent: 0.78 },
    ],
  },
  sixteenthDottedEighth: {
    id: 'sixteenthDottedEighth',
    symbol: '♬♪.',
    label: 'Sixteenth + dotted eighth',
    clap: 'Clap-clap — —',
    voice: 'Ta-kaa',
    beats: 1,
    events: [
      { at: 0, duration: 0.055, accent: 1 },
      { at: 0.25, duration: 0.32, accent: 0.82 },
    ],
  },
  eighthRestEighth: {
    id: 'eighthRestEighth',
    symbol: '♪𝄾♪',
    label: 'Eighth rest eighth',
    clap: 'Clap — clap',
    voice: 'Ta — ka',
    beats: 1,
    events: [
      { at: 0, duration: 0.08, accent: 1 },
      { at: 0.5, duration: 0.08, accent: 0.78 },
    ],
  },
  half: {
    id: 'half',
    symbol: '𝅗𝅥',
    label: 'Half note',
    clap: 'Hold',
    voice: 'Taa',
    beats: 2,
    voiceOnly: true,
    events: [{ at: 0, duration: 1.75, accent: 1 }],
  },
  whole: {
    id: 'whole',
    symbol: '𝅝',
    label: 'Whole note',
    clap: 'Hold',
    voice: 'Taaaa',
    beats: 4,
    voiceOnly: true,
    events: [{ at: 0, duration: 3.72, accent: 1 }],
  },
  quarterEighths: {
    id: 'quarterEighths',
    symbol: '♩♫',
    label: 'Quarter + eighths',
    clap: 'Clap, clap-clap',
    voice: 'Ta, ta-ka',
    beats: 2,
    events: [
      { at: 0, duration: 0.12, accent: 1 },
      { at: 1, duration: 0.08, accent: 0.85 },
      { at: 1.5, duration: 0.08, accent: 0.72 },
    ],
  },
  eighthsQuarter: {
    id: 'eighthsQuarter',
    symbol: '♫♩',
    label: 'Eighths + quarter',
    clap: 'Clap-clap, clap',
    voice: 'Ta-ka, ta',
    beats: 2,
    events: [
      { at: 0, duration: 0.08, accent: 1 },
      { at: 0.5, duration: 0.08, accent: 0.72 },
      { at: 1, duration: 0.12, accent: 0.85 },
    ],
  },
  halfQuarter: {
    id: 'halfQuarter',
    symbol: '𝅗𝅥♩',
    label: 'Half + quarter',
    clap: 'Hold, clap',
    voice: 'Taa, ta',
    beats: 3,
    voiceOnly: true,
    events: [
      { at: 0, duration: 1.75, accent: 1 },
      { at: 2, duration: 0.12, accent: 0.84 },
    ],
  },
  quarterHalf: {
    id: 'quarterHalf',
    symbol: '♩𝅗𝅥',
    label: 'Quarter + half',
    clap: 'Clap, hold',
    voice: 'Ta, taa',
    beats: 3,
    voiceOnly: true,
    events: [
      { at: 0, duration: 0.12, accent: 1 },
      { at: 1, duration: 1.75, accent: 0.84 },
    ],
  },
};

const byDifficulty = {
  clapping: {
    basic: ['rest1', 'quarter', 'quarter', 'quarter', 'eighths'],
    developing: ['rest1', 'quarter', 'quarter', 'eighths', 'fourSixteenths', 'eighthTwoSixteenths', 'twoSixteenthsEighth'],
    intermediate: ['rest1', 'quarter', 'eighths', 'fourSixteenths', 'triplet', 'dottedEighthSixteenth', 'sixteenthDottedEighth', 'eighthTwoSixteenths', 'twoSixteenthsEighth'],
    advanced: ['rest1', 'quarter', 'eighths', 'fourSixteenths', 'triplet', 'dottedEighthSixteenth', 'sixteenthDottedEighth', 'eighthRestEighth', 'quarterEighths', 'eighthsQuarter'],
  },
  voice: {
    basic: ['rest1', 'quarter', 'quarter', 'eighths', 'half'],
    developing: ['rest1', 'quarter', 'eighths', 'half', 'whole', 'quarterEighths', 'eighthsQuarter'],
    intermediate: ['rest1', 'quarter', 'eighths', 'fourSixteenths', 'triplet', 'dottedEighthSixteenth', 'sixteenthDottedEighth', 'half', 'whole', 'quarterEighths', 'eighthsQuarter'],
    advanced: ['rest1', 'quarter', 'eighths', 'fourSixteenths', 'triplet', 'dottedEighthSixteenth', 'sixteenthDottedEighth', 'eighthRestEighth', 'half', 'whole', 'quarterEighths', 'eighthsQuarter', 'halfQuarter', 'quarterHalf'],
  },
};

function choose(ids) {
  return ids[Math.floor(Math.random() * ids.length)];
}

function canPlace(item, remaining) {
  return item.beats <= remaining;
}

export function generatePattern({ length, studyMode, difficulty }) {
  const pool = byDifficulty[studyMode][difficulty]
    .map((id) => RHYTHMS[id])
    .filter(Boolean);

  const pattern = [];
  let remaining = length;
  let previousRest = false;
  let guard = 0;

  while (remaining > 0 && guard < 300) {
    guard += 1;
    let candidates = pool.filter((item) => canPlace(item, remaining));

    if (previousRest) candidates = candidates.filter((item) => item.id !== 'rest1');
    if (pattern.length === 0) candidates = candidates.filter((item) => item.id !== 'rest1');
    if (!candidates.length) candidates = [RHYTHMS.quarter];

    let item = candidates.find((candidate) => candidate.beats === remaining && candidate.id !== 'rest1');
    if (!item || Math.random() > 0.55) item = RHYTHMS[choose(candidates.map((candidate) => candidate.id))];

    pattern.push(item);
    remaining -= item.beats;
    previousRest = item.id === 'rest1';
  }

  return pattern;
}

export function getTotalBeats(pattern) {
  return pattern.reduce((total, item) => total + item.beats, 0);
}

export function getCellSpan(item) {
  if (item.beats >= 4) return 4;
  if (item.beats >= 3) return 3;
  if (item.beats >= 2) return 2;
  return 1;
}

export function getSyllable(item, studyMode) {
  return studyMode === 'voice' ? item.voice : item.clap;
}

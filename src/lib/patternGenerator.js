import { POOLS, RHYTHMS } from "./rhythmCatalog.js";

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

const COMPLEX_IDS = new Set([
  "fourSixteenths",
  "eighthTwoSixteenths",
  "twoSixteenthsEighth",
  "triplet",
  "dottedEighthSixteenth",
  "eighthRestEighth",
]);

function isComplex(cell) {
  return COMPLEX_IDS.has(cell.id);
}

function isRest(cell) {
  return cell.id === "rest";
}

function isGoodCandidate(pattern, candidate, difficulty) {
  if (pattern.length === 0) {
    return !isRest(candidate);
  }

  const last = pattern.at(-1);
  const prev = pattern.at(-2);

  if (isRest(candidate) && isRest(last)) return false;

  if (candidate.id === last.id && prev?.id === candidate.id && candidate.id !== "quarter") {
    return false;
  }

  if (difficulty === "level5") {
    const recent = pattern.slice(-2);
    const recentComplexCount = recent.filter(isComplex).length;

    if (isComplex(candidate) && recentComplexCount >= 2) {
      return false;
    }
  }

  return true;
}

function forcePhraseShape(pattern) {
  if (pattern.length >= 4) {
    const lastOfFirstMeasure = pattern[3];
    if (lastOfFirstMeasure?.id === "rest") {
      pattern[3] = { ...RHYTHMS.quarter, beatIndex: 3 };
    }
  }

  if (pattern.length >= 8) {
    const finalIndex = pattern.length - 1;
    if (pattern[finalIndex]?.id !== "quarter") {
      pattern[finalIndex] = { ...RHYTHMS.quarter, beatIndex: finalIndex };
    }
  }
}

export function generatePattern({ length, studyMode, difficulty }) {
  const pool = POOLS[studyMode][difficulty]
    .map((id) => RHYTHMS[id])
    .filter(Boolean);

  const pattern = [];

  while (pattern.length < length) {
    let candidate = choose(pool);
    let attempts = 0;

    while (!isGoodCandidate(pattern, candidate, difficulty) && attempts < 30) {
      candidate = choose(pool);
      attempts += 1;
    }

    pattern.push({
      ...candidate,
      beatIndex: pattern.length,
    });
  }

  forcePhraseShape(pattern);

  return pattern.map((cell, index) => ({
    ...cell,
    beatIndex: index,
  }));
}

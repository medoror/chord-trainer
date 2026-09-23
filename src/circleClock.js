export const CLOCK_KEYS = [
  { major: "C", minor: "Am" },
  { major: "G", minor: "Em" },
  { major: "D", minor: "Bm" },
  { major: "A", minor: "F♯m" },
  { major: "E", minor: "C♯m" },
  { major: "B", minor: "G♯m" },
  { major: "F♯", minor: "D♯m" },
  { major: "D♭", minor: "B♭m" },
  { major: "A♭", minor: "Fm" },
  { major: "E♭", minor: "Cm" },
  { major: "B♭", minor: "Gm" },
  { major: "F", minor: "Dm" },
];

export const clockHour = index => index === 0 ? 12 : index;

export function buildClockRound(mode, previousIndex = null, random = Math.random) {
  const candidates = CLOCK_KEYS.map((_, index) => index).filter(index => index !== previousIndex);
  const targetIndex = candidates[Math.floor(random() * candidates.length)];
  const askMinor = mode === "minor" || (mode === "mixed" && random() >= 0.65);
  return { targetIndex, askMinor };
}

export function mostMissedKeys(misses) {
  return CLOCK_KEYS.map((key, index) => ({ ...key, index, count: misses[index] || 0 }))
    .filter(key => key.count > 0)
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .slice(0, 3);
}

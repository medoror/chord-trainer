import { describe, expect, it } from "vitest";
import { BARI_CHORDS } from "./App.jsx";

const OPEN = [2, 7, 11, 4]; // D G B E
const ROOTS = {
  C: 0, "B#": 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, Fb: 4, "E#": 5, F: 5, "F#": 6, Gb: 6, G: 7,
  "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11,
};

const notePitch = note => {
  const match = note.match(/^([A-G])([#b]*)$/);
  if (!match) return null;
  const natural = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  let pitch = natural[match[1]];
  for (const accidental of match[2]) pitch += accidental === "#" ? 1 : -1;
  return (pitch + 120) % 12;
};

const intervalsFor = quality => quality === "m"
  ? [0, 3, 7]
  : quality === "dim"
    ? [0, 3, 6]
    : quality === "7"
      ? [0, 4, 7, 10]
      : [0, 4, 7];

function renderedPitches(chord) {
  return chord.frets
    .map((fret, string) => fret < 0 ? null : (OPEN[string] + (chord.baseFret > 1 ? chord.baseFret + fret - 1 : fret)) % 12)
    .filter(pitch => pitch !== null);
}

describe("BARI_CHORDS", () => {
  it("contains all required chord tones and matching note labels", () => {
    for (const [name, chord] of Object.entries(BARI_CHORDS)) {
      const [, rootName, quality] = name.match(/^([A-G](?:#|b)?)(.*)$/);
      const pitches = new Set(renderedPitches(chord));
      const required = intervalsFor(quality).map(interval => (ROOTS[rootName] + interval) % 12);
      const stored = new Set(chord.notes.split(/\s+/).map(notePitch));

      expect(required.every(pitch => pitches.has(pitch)), `${name} is missing a chord tone`).toBe(true);
      expect([...pitches].every(pitch => stored.has(pitch)), `${name} has a stale notes label`).toBe(true);
      expect([...stored].every(pitch => pitches.has(pitch)), `${name} has an incorrect notes label`).toBe(true);
    }
  });
});

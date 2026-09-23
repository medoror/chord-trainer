import { describe, expect, it } from "vitest";
import { CLOCK_KEYS, buildClockRound, clockHour, mostMissedKeys } from "./circleClock";

describe("clock rounds", () => {
  it("maps C to 12 and each remaining key to its clock hour", () => {
    expect(CLOCK_KEYS.map((key, index) => [key.major, clockHour(index)])).toEqual([
      ["C", 12], ["G", 1], ["D", 2], ["A", 3], ["E", 4], ["B", 5],
      ["F♯", 6], ["D♭", 7], ["A♭", 8], ["E♭", 9], ["B♭", 10], ["F", 11],
    ]);
    expect(CLOCK_KEYS[6].minor).toBe("D♯m");
  });
  it("can choose every other position, but never the previous position", () => {
    for (let previous = 0; previous < 12; previous++) {
      const indices = Array.from({ length: 11 }, (_, index) =>
        buildClockRound("major", previous, () => (index + 0.5) / 11).targetIndex);
      expect(new Set(indices).size).toBe(11);
      expect(indices).not.toContain(previous);
    }
  });
  it("honors fixed modes and the independent 65/35 mixed split", () => {
    expect(buildClockRound("major", null, () => 0.99).askMinor).toBe(false);
    expect(buildClockRound("minor", null, () => 0).askMinor).toBe(true);
    let minor = 0;
    for (let i = 0; i < 100; i++) {
      const values = [0, (i + 0.5) / 100];
      const round = buildClockRound("mixed", null, () => values.shift());
      expect(round.targetIndex).toBe(0);
      minor += Number(round.askMinor);
    }
    expect(minor).toBe(35);
  });
  it("ranks only misses, breaking ties by circle order, with three at most", () => {
    expect(mostMissedKeys({})).toEqual([]);
    expect(mostMissedKeys({ 8: 3, 1: 2, 0: 2, 11: 1 }).map(key => key.major)).toEqual(["A♭", "C", "G"]);
  });
});

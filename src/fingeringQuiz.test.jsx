import { afterEach, describe, expect, it, vi } from "vitest";
import { BARI_CHORDS, buildFingeringQuestion } from "./App.jsx";

const names = Object.keys(BARI_CHORDS);
const shape = name => JSON.stringify([BARI_CHORDS[name].baseFret, BARI_CHORDS[name].frets]);
afterEach(() => vi.restoreAllMocks());

describe("buildFingeringQuestion", () => {
  it("offers four distinct playable shapes, with the answer exactly once, for every chord", () => {
    // Force each chord to be the target; use a seeded stream for subsequent shuffles.
    let seed = 12345;
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    });
    const original = [...names];
    for (let pass = 0; pass < 20; pass++) {
      names.forEach((name, index) => {
        random.mockReturnValueOnce((index + 0.5) / names.length);
        const question = buildFingeringQuestion(names);
        expect(question.correct).toBe(name);
        expect(question.choices).toHaveLength(4);
        expect(question.choices.filter(choice => choice === name)).toHaveLength(1);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choices.every(choice => names.includes(choice))).toBe(true);
        expect(new Set(question.choices.map(shape)).size).toBe(4);
      });
    }
    expect(names).toEqual(original);
  });

  it("varies the target and answer position across questions", () => {
    let seed = 9876;
    vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    });
    const questions = Array.from({ length: 100 }, () => buildFingeringQuestion(names));
    expect(new Set(questions.map(q => q.correct)).size).toBeGreaterThan(1);
    expect(new Set(questions.map(q => q.choices.indexOf(q.correct))).size).toBe(4);
  });
});

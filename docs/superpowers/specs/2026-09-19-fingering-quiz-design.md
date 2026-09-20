# Fingering Quiz — Design

## Context

chord-trainer already has a "Chord Quiz" mode that shows a scale-degree
prompt and asks the player to pick the correct chord *name* from text
choices. That tests recall of music theory (which chord goes where), not
whether the player can actually recognize a chord's *fingering* on the
fretboard.

This adds a new quiz mode modeled on a "Which one of these is the F chord?"
style quiz (reference: Kala Ukulele's built-in Chord Quiz screen) — given a
chord name, the player picks the correct fretboard diagram out of several
candidates. This tests fingering recognition directly, complementing the
existing name-recall quiz.

## Approach

Add a new top-level tab, **Fingering Quiz**, alongside the existing Key
Explorer / Chord Quiz / Theory Quiz tabs in `src/App.jsx`. It reuses
existing infrastructure rather than introducing new chord data or a new
diagram renderer:

- `BARI_CHORDS` — source of truth for every playable chord and its shape
- `ChordDiagram` — existing SVG fretboard renderer, used unmodified
- `buildDistractors(correct, allChordNames)` — existing "musically tricky"
  wrong-answer generator (same root/different quality, semitone neighbors),
  reused as-is to pick 3 decoy chords
- `shuffle` — existing array shuffle helper

### Question generation

New pure function, `buildFingeringQuestion(allChordNames)`:

1. Pick a random chord name from `allChordNames` as the correct answer.
2. Call `buildDistractors(correct, allChordNames)` to get exactly 3 decoy
   chord names.
3. Shuffle `[correct, ...distractors]` into a 4-item `choices` array.
4. Return `{ correct, choices }`.

This function is pure (no state, no DOM) and is the one piece of new logic
covered by unit tests (see Testing below).

### Rendering

- Heading: `Which one of these is the {correct} chord?"` — mirrors the
  reference screenshot's phrasing.
- Each entry in `choices` renders as a tappable button wrapping a
  `<ChordDiagram chordName={choice} size="md" />` (existing component,
  unmodified).
- Layout: a responsive row/wrap of 4 diagram buttons (existing mobile-first
  styles already handle small screens; no new layout system needed).

### Interaction model

Follows the existing Chord Quiz interaction pattern exactly (not the
screenshot's checkbox+Submit flow):

- Tapping a choice immediately answers the question (`handleAnswer`-style:
  `if (selected) return;` guards against double-answer).
- The tapped choice is highlighted green (correct) or red (wrong); if wrong,
  the actually-correct choice is also highlighted green so the player sees
  the right shape immediately.
- A short feedback banner shows "✓ Correct!" or "✗ It's {correct}".
- A "Next →" button appears (matching the existing Chord Quiz's `nextBtn`
  pattern), which the player taps to generate a new question. No automatic
  timer-based advance for v1 (the existing codebase only auto-advances on a
  timed-mode timeout, which is out of scope here per "no timed mode for
  v1" below).

### Scope for v1

- Session-only score/streak counter (matches the simplest existing
  quiz-scoring pattern). No persistent weak-spot tracking in v1.
- No timed mode for v1 (existing Chord Quiz already has one; can be added
  here later using the existing `CountdownBar` component if desired).
- Covers all chords in `BARI_CHORDS` (57 chords) — no filtering by
  major/minor key for v1, since the point is shape recognition across the
  whole chord vocabulary, not key-scoped drilling.

### Non-goals

- No new chord data, no new diagram rendering logic, no new distractor
  algorithm — this is purely a new presentation/interaction layer over
  existing pieces.
- No persistence/weak-spot integration in v1 (explicitly deferred, not
  forgotten — the existing `loadProgress`/`saveProgress` keys are
  generic enough to extend later if wanted).

## Testing

No test framework exists in this repo yet (`package.json` has no
vitest/jest, no `*.test.*` files). This adds `vitest` as a dev dependency
only — no runtime dependency added, consistent with the project's "Runtime
deps: None" philosophy in the README.

Tests cover the one new pure function, written test-first:

- `buildFingeringQuestion` always returns exactly 4 choices.
- The `correct` chord always appears exactly once in `choices`.
- No duplicate chord names within `choices`.
- Repeated calls produce varied `correct` values (not always the same
  chord) — a basic randomness sanity check.

No UI/interaction tests — the existing codebase has none, and retrofitting
a component-testing setup for one small feature is out of scope here.
Manual verification (`npm run dev`, click through a handful of questions)
covers the rendering/interaction layer.

## Verification

1. `npx vitest run` — new unit tests pass.
2. `npm run dev` — manually open the new Fingering Quiz tab, confirm:
   - Every question shows exactly 4 distinct chord diagrams.
   - Tapping the correct diagram shows "✓ Correct!" and advances.
   - Tapping a wrong diagram highlights it red, highlights the correct one
     green, shows "✗ It's {correct}", and advances.
   - Chord diagrams render correctly for chords requiring a barre
     (e.g. F, Bb) and chords with `baseFret > 1` (e.g. C#) — these are the
     trickiest cases for `ChordDiagram` and worth eyeballing explicitly.
3. `npm run build` — production build still succeeds (no new runtime
   dependency was introduced).

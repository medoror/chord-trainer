# Baritone Chord Data Audit

Status: source-backed corrections implemented; pre-repair findings retained for review history.

Date: 2026-09-21

## Purpose

`BARI_CHORDS` is the source of truth for the chord diagrams. This document records the pre-repair audit and the source-backed targets used to correct entries whose rendered notes did not agree with either the stored `notes` label or the named chord.

## Audit method

The audit checked all 57 entries in `src/App.jsx`.

- Tuning was treated as D–G–B–E, with pitch classes D=2, G=7, B=11, E=4.
- The calculation followed the current renderer exactly.
- For `baseFret: 1`, a fret value is treated as an absolute fret.
- For `baseFret > 1`, the renderer displays a fret value relative to `baseFret`; the effective fret is `baseFret + fret - 1`.
- Stored note labels were compared by pitch class, so enharmonic spellings such as G♯/A♭ were treated as equivalent.
- A chord was marked as failing the identity check when one of its required tones was absent. Extra tones were allowed, since some entries may intentionally be extended voicings.

## Summary

| Result | Count |
|---|---:|
| Entries audited | 57 |
| Entries with rendered-note/label disagreement | 24 |
| Entries missing at least one required chord tone | 21 |
| Entries with at least one issue | 27 |
| Entries passing both checks | 30 |

The counts overlap. For example, an entry can have both a wrong stored note label and a wrong chord identity.

## Flagged entries for review

The flagged-entry tables below document the **pre-repair data**, including incorrect entries. `Pre-repair` describes what the app showed before the correction; it is not the current implementation. Reference targets are the source-backed values used for the repair.

### Major chords

| Chord | Pre-repair | Reference target | Finding |
|---|---|---|---|
| C# | `1-1-1-4`, base 4<br>renders F# B D# B | `3-1-2-1`; fingers 3-1-2-1<br>F-Ab-Db-F | Wrong rendered shape and label |
| Db | `1-1-1-4`, base 4<br>renders F# B D# B | `3-1-2-1`; fingers 3-1-2-1<br>F-Ab-Db-F | Wrong rendered shape and label |
| G# | `1-1-3-1`, base 4<br>renders F# B F Ab | `1-1-1-4`; fingers 1-1-1-4<br>Eb-Ab-C-Ab | Wrong rendered shape and label |
| Ab | `1-1-3-1`, base 4<br>renders F# B F Ab | `1-1-1-4`; fingers 1-1-1-4<br>Eb-Ab-C-Ab | Wrong rendered shape and label |

These four entries use the same two underlying shapes as enharmonic pairs, so they should be reviewed together.

### Minor chords

| Chord | Pre-repair | Reference target | Finding |
|---|---|---|---|
| Cm | `3-5-5-3`, base 1<br>renders F C E G | `1-0-1-3`; fingers 1-0-2-4<br>Eb-G-C-G | Missing E♭; wrong label |
| C#m | `1-3-2-1`, base 4<br>renders F# C# E Ab | `2-1-2-0`; fingers 2-1-3-0<br>E-Ab-Db-E | Extra F#; label disagrees |
| Dbm | `1-3-2-1`, base 4<br>renders F# C# E Ab | `2-1-2-0`; fingers 2-1-3-0<br>E-Ab-Db-E | Extra F#; label disagrees |
| Ebm | `1-3-2-1`, base 6<br>renders Ab Eb F# Bb | `4-3-4-2`; fingers 3-2-4-1<br>Gb-Bb-Eb-Gb | Extra Ab; label disagrees |
| D#m | `1-3-2-1`, base 6<br>renders Ab Eb F# Bb | `4-3-4-2`; fingers 3-2-4-1<br>Gb-Bb-Eb-Gb | Extra Ab; label disagrees |
| G#m | `1-3-2-1`, base 4<br>renders F# C# E Ab | `1-1-0-x`; fingers 1-2-0-0<br>Eb-Ab-B-X | Missing B and D#; wrong label |
| Abm | `1-3-2-1`, base 4<br>renders F# C# E Ab | `1-1-0-x`; fingers 1-2-0-0<br>Eb-Ab-B-X | Missing B and Eb; wrong label |
| Bbm | `3-4-3-1`, base 1<br>renders F B D F | `3-3-2-1`; fingers 3-4-2-1<br>F-Bb-Db-F | Missing Bb and Db; wrong label |
| A#m | `3-4-3-1`, base 1<br>renders F B D F | `3-3-2-1`; fingers 3-4-2-1<br>F-Bb-Db-F | Missing Bb and Db; wrong label |

The C#m/Dbm, Ebm/D#m, G#m/Abm, and Bbm/A#m pairs should be reviewed as shared shapes rather than corrected independently.

### Diminished chords

| Chord | Pre-repair | Reference target | Finding |
|---|---|---|---|
| C#dim | `1-2-1-2`, base 1<br>renders Eb A C F# | `2-0-2-0`; fingers 1-0-2-0<br>E-G-Db-E | Missing C#, E, and G; wrong label |
| Ddim | `0-3-0-3`, base 1<br>renders D Bb B G | `0-1-3-1`; fingers 0-1-3-2<br>D-Ab-D-F | Missing F and Ab; wrong label |
| F#dim | `0-1-3-1`, base 1<br>renders D Ab D F | `4-2-1-2`; fingers 4-2-1-3<br>Gb-A-C-Gb | Missing F#, A, and C; wrong label |
| G#dim | `1-2-1-2`, base 2<br>renders E Bb C# G | `0-1-0-4`; fingers 0-1-0-4<br>D-Ab-B-Ab | Missing Ab, B, and D; wrong label |
| A#dim | `1-2-1-2`, base 3<br>renders F B D Ab | `2-3-2-0`; fingers 2-1-3-0<br>E-Bb-Db-E | Missing Bb, C#, and E; wrong label |
| Cdim | `0-1-0-1`, base 2<br>renders Eb A C F# | `1-x-1-2`; fingers 1-0-2-3<br>Eb-X-C-Gb | Chord tones pass, but stored label disagrees |
| Fdim | `1-2-1-2`, base 1<br>renders Eb A C F# | `3-1-0-1`; fingers 3-1-0-2<br>F-Ab-B-F | Missing F, Ab, and B; wrong label |
| Bbdim | `1-2-1-2`, base 3<br>renders F B D Ab | `2-3-2-0`; fingers 2-1-3-0<br>E-Bb-Db-E | Missing Bb, C#, and E; wrong label |
| E#dim | `1-2-1-2`, base 1<br>renders Eb A C F# | `3-1-0-1`; fingers 3-1-0-2<br>F-Ab-B-F | Missing F, Ab, and B; wrong label |
| B#dim | `0-1-0-1`, base 2<br>renders Eb A C F# | `1-x-1-2`; fingers 1-0-2-3<br>Eb-X-C-Gb | Chord tones pass enharmonically, but stored label disagrees |
| D#dim | `0-3-0-3`, base 2<br>renders Eb B C Ab | `1-2-x-2`; fingers 1-2-0-3<br>Eb-A-X-Gb | Missing F# and A; wrong label |

The diminished entries have the strongest evidence of copied or incorrectly transposed shapes. They should be reviewed against a trusted reference one chord at a time.

### Dominant seventh chords

| Chord | Pre-repair | Reference target | Finding |
|---|---|---|---|
| A7 | `0-2-0-0`, base 1<br>renders D A B E | `2-2-2-3`; fingers 1-1-1-2<br>E-A-Db-G | Missing C# and G |
| B7 | `0-2-0-2`, base 1<br>renders D A B F# | `1-2-0-2`; fingers 1-2-0-3<br>Eb-A-B-Gb | Missing D# |
| C7 | `0-3-1-0`, base 1<br>renders D Bb C E | `2-3-1-3`<br>E–Bb–C–G | Missing G; not the reference 2313 voicing |

The C7 row intentionally records the incorrect pre-repair value. The reviewed reference used for the repair is:

```text
C7: frets [2, 3, 1, 3], fingers [2, 3, 1, 4]
Rendered notes: E–B♭–C–G
```

Before repair, the app had `frets [0, 3, 1, 0]`, which rendered D–B♭–C–E.

The C7 reference is [Ukulele-Chords.com — C7 baritone](https://ukulele-chords.com/baritone/C7). It specifies `2313` in DGBE, notes E–B♭–C–G, and fingering 2–3–1–4.

The B7 reference is [Ukulele-Chords.com — B7 baritone](https://ukulele-chords.com/baritone/B7). It specifies `1202` in DGBE, notes E♭–A–B–G♭, and fingering 1–2–0–2. This confirms that the app’s current `0202` entry is incorrect.

## Reference pages used

The target fingerings above were taken from the primary baritone pages on Ukulele-Chords.com. Enharmonic aliases use the same source page: C#/Db → Db, G#/Ab → Ab, C#m/Dbm → Dbm, D#m/Ebm → Ebm, G#m/Abm → Abm, A#m/Bbm → Bbm, and equivalent diminished spellings use the available flat page.

- [Db](https://ukulele-chords.com/baritone/Db) · [Ab](https://ukulele-chords.com/baritone/Ab) · [Cm](https://ukulele-chords.com/baritone/Cm)
- [Dbm](https://ukulele-chords.com/baritone/Dbm) · [Ebm](https://ukulele-chords.com/baritone/Ebm) · [Abm](https://ukulele-chords.com/baritone/Abm) · [Bbm](https://ukulele-chords.com/baritone/Bbm)
- [Dbdim](https://ukulele-chords.com/baritone/Dbdim) · [Ddim](https://ukulele-chords.com/baritone/Ddim) · [Gbdim](https://ukulele-chords.com/baritone/Gbdim) · [Abdim](https://ukulele-chords.com/baritone/Abdim)
- [Bbdim](https://ukulele-chords.com/baritone/Bbdim) · [Cdim](https://ukulele-chords.com/baritone/Cdim) · [Fdim](https://ukulele-chords.com/baritone/Fdim) · [Ebdim](https://ukulele-chords.com/baritone/Ebdim)
- [A7](https://ukulele-chords.com/baritone/A7) · [B7](https://ukulele-chords.com/baritone/B7) · [C7](https://ukulele-chords.com/baritone/C7)

## Previously uncertain entries — now sourced

These entries were previously listed as “worth confirming.” The source provides a primary baritone voicing for each. The pre-repair app shapes were not all unusable, but several were extended voicings while the app labeled them as plain chords.

| Chord | Pre-repair | Source target | Interpretation |
|---|---|---|---|
| Bm | `2-4-3-2`<br>E-B-D-F# | `0-4-3-2`; fingers 0-3-2-1<br>D-B-D-Gb | Current shape is Bm7; source gives plain Bm |
| Bdim | `0-1-0-1`<br>D-Ab-B-F | `0-4-0-1`; fingers 0-4-0-1<br>D-B-B-F | Current shape is Bdim7; source gives plain Bdim |
| Edim | `2-3-2-3`<br>E-Bb-C#-G | `2-3-5-3`; fingers 1-2-4-3<br>E-Bb-E-G | Current shape includes the diminished seventh; source gives plain Edim |
| Adim | `1-2-1-2`<br>Eb-A-C-F# | `1-2-1-x`; fingers 1-3-2-0<br>Eb-A-C-X | Current shape includes the diminished seventh; source gives plain Adim |
| Gdim | `0-3-2-3`<br>D-Bb-C#-G | `x-3-2-3`; fingers 0-2-1-3<br>X-Bb-Db-G | Current shape adds D; source gives plain Gdim |

Sources: [Bm](https://ukulele-chords.com/baritone/Bm), [Bdim](https://ukulele-chords.com/baritone/Bdim), [Edim](https://ukulele-chords.com/baritone/Edim), [Adim](https://ukulele-chords.com/baritone/Adim), and [Gdim](https://ukulele-chords.com/baritone/Gdim).

Several enharmonic entries also use spelling variants such as A♭/G# or D♭/C#; those should be standardized intentionally, not changed accidentally.

## Post-repair verification

- `npm test` passes the all-entry chord-tone and note-label validation.
- The validator confirms all 57 entries contain their required chord tones.
- `npm run build` succeeds.
- The source-backed target values remain documented above for review and future maintenance.

## Repair checklist

Before editing `BARI_CHORDS`:

1. Confirm the intended reference fingering for every flagged unique shape.
2. Decide whether the app supports only triads/seventh chords or intentionally includes extended voicings.
3. Decide whether `frets` are absolute or relative when `baseFret > 1`; the current renderer treats them as relative in that case, despite the source comment saying they are absolute.
4. Update `frets`, `fingers`, `baseFret`, and `notes` together.
5. Add data-validation tests that calculate rendered notes and verify each chord’s required tones.
6. Re-audit all 57 entries after the corrections.

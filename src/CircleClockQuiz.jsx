import React, { useEffect, useRef, useState } from "react";
import { CLOCK_KEYS, buildClockRound, clockHour, mostMissedKeys } from "./circleClock";
import "./circleClockQuiz.css";

export default function CircleClockQuiz({ onBack }) {
  const [quizMode, setQuizMode] = useState("major");
  const [round, setRound] = useState(() => buildClockRound("major"));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);
  const [misses, setMisses] = useState({});
  const [roundNumber, setRoundNumber] = useState(0);
  const locked = useRef(false);
  const timer = useRef(null);
  const key = CLOCK_KEYS[round.targetIndex];
  const label = round.askMinor ? key.minor : `${key.major} major`;
  const targetHour = clockHour(round.targetIndex);
  const mostMissed = mostMissedKeys(misses);

  useEffect(() => () => clearTimeout(timer.current), []);

  function changeMode(mode) {
    if (mode === quizMode) return;
    clearTimeout(timer.current);
    locked.current = false;
    setQuizMode(mode);
    setRound(buildClockRound(mode));
    setRoundNumber(number => number + 1);
    setScore(0);
    setStreak(0);
    setBest(0);
    setAttempts(0);
    setMisses({});
    setSelected(null);
    setStatus(null);
  }

  function pick(hour) {
    if (locked.current) return;
    locked.current = true;
    const right = hour === targetHour;
    setSelected(hour);
    setStatus(right ? "correct" : "wrong");
    setAttempts(count => count + 1);
    if (right) {
      setScore(count => count + 1);
      setStreak(streak + 1);
      setBest(previous => Math.max(previous, streak + 1));
    } else {
      setStreak(0);
      setMisses(previous => ({ ...previous, [round.targetIndex]: (previous[round.targetIndex] || 0) + 1 }));
    }
    timer.current = setTimeout(() => {
      setRound(buildClockRound(quizMode, round.targetIndex));
      setRoundNumber(number => number + 1);
      setSelected(null);
      setStatus(null);
      locked.current = false;
    }, right ? 550 : 1100);
  }

  return (
    <section className="clock-quiz" aria-label="Circle of Fifths Clock Quiz">
      <button className="clock-back" onClick={onBack}>← Circle explorer</button>
      <h1>Clock Position Quiz</h1>
      <p className="clock-intro">Where does this key sit on the circle of fifths?</p>
      <div className="clock-modes" aria-label="Quiz mode">
        {[["major", "Major only"], ["minor", "Minor only"], ["mixed", "Mixed"]].map(([mode, text]) => (
          <button key={mode} aria-pressed={quizMode === mode} onClick={() => changeMode(mode)}>{text}</button>
        ))}
      </div>
      <div className="clock-stats">
        <span>Score <strong>{score}/{attempts}</strong></span>
        <span>Accuracy <strong>{attempts ? `${Math.round(score / attempts * 100)}%` : "—"}</strong></span>
        <span>Streak <strong>{streak}</strong></span>
        <span>Best <strong>{best}</strong></span>
      </div>
      <div className="clock-prompt" key={roundNumber}>
        <span>{round.askMinor ? "relative minor" : "major key"}</span>
        <h2>{label}</h2>
      </div>
      <svg className="clock-face" viewBox="0 0 360 360" role="group" aria-label="Choose an hour on the clock">
        <circle className="clock-ring" cx="180" cy="180" r="140" />
        <circle cx="180" cy="180" r="4" fill="#77778e" />
        {Array.from({ length: 12 }, (_, index) => {
          const hour = clockHour(index);
          const angle = hour / 12 * 2 * Math.PI - Math.PI / 2;
          const x = 180 + 140 * Math.cos(angle);
          const y = 180 + 140 * Math.sin(angle);
          const correct = status !== null && hour === targetHour;
          const wrong = status === "wrong" && hour === selected;
          return (
            <g key={hour} transform={`translate(${x}, ${y})`}>
              <g className={`clock-dot${correct ? " is-correct" : ""}${wrong ? " is-wrong" : ""}`}
                role="button" tabIndex={status ? -1 : 0} aria-disabled={status !== null}
                aria-label={`${hour} o'clock${correct ? ", correct answer" : wrong ? ", your incorrect answer" : ""}`}
                onClick={() => pick(hour)} onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pick(hour);
                  }
                }}>
                <circle r="28" />
                <text textAnchor="middle" dy="6">{hour}</text>
                {(correct || wrong) && <text className="clock-mark" textAnchor="middle" y="-31">{correct ? "✓" : "×"}</text>}
              </g>
            </g>
          );
        })}
      </svg>
      <p className={`clock-feedback ${status || ""}`} role="status" aria-live="polite">
        {status === "correct" ? "✓ Correct!" : status === "wrong" ? `That's ${label} at ${targetHour} o'clock.` : "Tap an hour to answer."}
      </p>
      <p className="clock-misses">Most missed: {mostMissed.length ? mostMissed.map(key => `${key.major} (${key.count})`).join(" · ") : "none yet"}</p>
    </section>
  );
}

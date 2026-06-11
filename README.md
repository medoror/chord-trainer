# 🎸 Chord Trainer

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> Mobile-first music theory app for baritone ukulele (DGBE tuning). Chord quizzes, theory quizzes, key explorer, fretboard diagrams, and reference charts — all in one self-hostable web app.

---

## Features

### 🗝️ Key Explorer
Pick any major or minor key and see all 7 chords — Roman numeral position, chord name, popularity badge, and a tap-to-expand DGBE fretboard diagram with finger numbers.

### 🎯 Chord Quiz
Flashcard-style quiz covering all 15 major and 12 minor keys. Wrong answers are musically tricky — same root with different quality (C vs C#m), or semitone neighbors — so you actually have to think about sharps and flats. Tracks weak spots and drills them back automatically.

### 🧠 Theory Quiz
25 questions across 4 categories:
- **Major Key Pattern** — chord qualities for each scale degree (I–vii)
- **Minor Key Pattern** — natural minor chord qualities (i–VII)
- **Progressions** — naming and identifying common progressions
- **Theory Concepts** — V→I resolution, relative minor, harmonic minor trick, and more

Each wrong answer shows a plain-English explanation of why, so every mistake teaches something.

### 🖐️ Chord Diagrams
SVG fretboard diagrams for 57 chords in DGBE tuning — every chord that appears in the major and minor key charts, including enharmonic equivalents (Cb=B, Fb=E, etc.). Finger numbers inside each dot, open string circles, barre bar indicators.

### 📋 Reference Charts
Full major and minor key chord charts with a 🔥 popularity heat map showing which positions are used most in real songs. Tap any row to highlight. Toggle heat map on/off.

### 💡 Theory Cheat Sheet
Collapsible reference cards covering:
- Most-used progressions (Pop 4, 50s, Minor Anthem, 12-bar Blues, Andalusian, Jazz 2-5-1)
- Major key theory
- Minor key theory
- Baritone uke specific tips (DGBE tuning, key-friendly shapes, capo tricks)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 18 |
| Build | Vite 5 |
| Diagrams | SVG (no library) |
| Container | Docker multi-stage |
| Server | nginx alpine |
| Runtime deps | None |

Final Docker image is ~25MB. No database, no backend, no external API calls — pure static React app.

---

## Getting Started

### Option 1 — Docker (recommended for self-hosting)

```bash
git clone https://github.com/YOUR_USERNAME/chord-trainer.git
cd chord-trainer

docker compose up -d
```

Open `http://localhost:3000` or `http://<your-server-ip>:3000` from any device on your network.

### Option 2 — Local dev

```bash
git clone https://github.com/YOUR_USERNAME/chord-trainer.git
cd chord-trainer

npm install
npm run dev
```

App runs at `http://localhost:3001` with hot reload.

### Option 3 — Build and preview

```bash
npm install
npm run build
npm run preview
```

---

## Project Structure

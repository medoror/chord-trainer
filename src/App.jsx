import React, { useState, useEffect, useCallback } from "react";
import "./fingeringQuiz.css";
import CircleClockQuiz from "./CircleClockQuiz";

// ── BARITONE CHORD DATA (DGBE tuning) ────────────────────────────────────────
// Strings: D(0) G(1) B(2) E(3) — left to right
// frets: 0=open, -1=muted, numbers are absolute fret positions
// baseFret: where the diagram window starts (1 = at the nut)
// Verified against DGBE/Chicago tuning reference charts (acousticmusictv.com)
//
// Music theory check for each chord (DGBE open = D,G,B,E):
//   Major = R, 3, 5  |  Minor = R, b3, 5  |  7th = R, 3, 5, b7
//
// D  string open = D  | fret1=Eb | fret2=E  | fret3=F  | fret4=F#
// G  string open = G  | fret1=Ab | fret2=A  | fret3=Bb | fret4=B
// B  string open = B  | fret1=C  | fret2=C# | fret3=D  | fret4=D#
// E  string open = E  | fret1=F  | fret2=F# | fret3=G  | fret4=G#

// ── BARITONE CHORD DATA (DGBE tuning) ────────────────────────────────────────
// Strings left→right: D G B E  |  0=open, -1=muted
// baseFret=1 means diagram starts at nut
// Covers every chord that appears in the major and minor key charts
//
// Reference notes (DGBE open = D G B E):
// D: 0=D 1=Eb 2=E  3=F  4=F# 5=G  6=G# 7=A
// G: 0=G 1=Ab 2=A  3=Bb 4=B  5=C  6=C# 7=D
// B: 0=B 1=C  2=C# 3=D  4=D# 5=E  6=F  7=F#
// E: 0=E 1=F  2=F# 3=G  4=G# 5=A  6=A# 7=B

export const BARI_CHORDS = {
  // ── NATURAL / SHARP KEY MAJORS ──────────────────────────────────────────
  // C: E G C E
  "C":  {frets:[2,0,1,0],fingers:[2,0,1,0],baseFret:1,label:"C",notes:"E G C E"},
  // D: D A D F#
  "D":  {frets:[0,2,3,2],fingers:[0,1,3,2],baseFret:1,label:"D",notes:"D A D F#"},
  // E: E G# B E
  "E":  {frets:[2,1,0,0],fingers:[2,1,0,0],baseFret:1,label:"E",notes:"E G# B E"},
  // F: F A C F  (barre 1)
  "F":  {frets:[3,2,1,1],fingers:[4,3,2,1],baseFret:1,barres:[{fret:1,from:2,to:3}],label:"F",notes:"F A C F"},
  // G: D G B G
  "G":  {frets:[0,0,0,3],fingers:[0,0,0,3],baseFret:1,label:"G",notes:"D G B G"},
  // A: E A C# E
  "A":  {frets:[2,2,2,0],fingers:[1,2,3,0],baseFret:1,label:"A",notes:"E A C# E"},
  // B: F# B D# F#  (barre 2 + extra)
  "B":  {frets:[4,4,4,2],fingers:[3,4,4,1],baseFret:1,barres:[{fret:2,from:3,to:3}],label:"B",notes:"F# B D# F#"},
  // F#/Gb: F# A# C# F#  — same shape as B moved up: barre 2
  "F#": {frets:[4,3,2,2],fingers:[4,3,1,1],baseFret:1,barres:[{fret:2,from:2,to:3}],label:"F#",notes:"F# A# C# F#"},
  // C#/Db: C# F Ab C#  — barre 4, A-shape
  "C#": {frets:[3,1,2,1],fingers:[3,1,2,1],baseFret:1,label:"C#",notes:"F Ab C# F"},
  // G#/Ab: Ab C Eb Ab  — barre 4, E-shape
  "G#": {frets:[1,1,1,4],fingers:[1,1,1,4],baseFret:1,label:"G#",notes:"Eb Ab C Ab"},
  // Bb: F Bb D F  — barre 1 + ring barre 3
  "Bb": {frets:[3,3,3,1],fingers:[3,3,3,1],baseFret:1,barres:[{fret:1,from:3,to:3},{fret:3,from:0,to:2}],label:"Bb",notes:"F Bb D F"},
  // Eb: barre 1, B-shape moved
  "Eb": {frets:[1,3,4,3],fingers:[1,3,4,2],baseFret:1,label:"Eb",notes:"Eb Bb Eb G"},
  // Ab: same as G# — barre 4
  "Ab": {frets:[1,1,1,4],fingers:[1,1,1,4],baseFret:1,label:"Ab",notes:"Eb Ab C Ab"},
  // Db: same as C# — 3121
  "Db": {frets:[3,1,2,1],fingers:[3,1,2,1],baseFret:1,label:"Db",notes:"F Ab Db F"},
  // Gb: same as F# shape
  "Gb": {frets:[4,3,2,2],fingers:[4,3,1,1],baseFret:1,barres:[{fret:2,from:2,to:3}],label:"Gb",notes:"Gb Bb Db Gb"},
  // Cb = B enharmonic
  "Cb": {frets:[4,4,4,2],fingers:[3,4,4,1],baseFret:1,barres:[{fret:2,from:3,to:3}],label:"Cb (=B)",notes:"F# B D# F#"},
  // Fb = E enharmonic
  "Fb": {frets:[2,1,0,0],fingers:[2,1,0,0],baseFret:1,label:"Fb (=E)",notes:"E G# B E"},

  // ── NATURAL / SHARP KEY MINORS ──────────────────────────────────────────
  // Am: E A C E
  "Am": {frets:[2,2,1,0],fingers:[2,3,1,0],baseFret:1,label:"Am",notes:"E A C E"},
  // Bm: E B D F#  (barre 2)
  "Bm": {frets:[0,4,3,2],fingers:[0,3,2,1],baseFret:1,label:"Bm",notes:"D B D F#"},
  // Cm: F C Eb G  (barre 3)
  "Cm": {frets:[1,0,1,3],fingers:[1,0,2,4],baseFret:1,label:"Cm",notes:"Eb G C G"},
  // Dm: D A D F
  "Dm": {frets:[0,2,3,1],fingers:[0,2,3,1],baseFret:1,label:"Dm",notes:"D A D F"},
  // Em: E G B E
  "Em": {frets:[2,0,0,0],fingers:[1,0,0,0],baseFret:1,label:"Em",notes:"E G B E"},
  // Fm: F Ab C F  (barre 1)
  "Fm": {frets:[3,1,1,1],fingers:[4,1,1,1],baseFret:1,barres:[{fret:1,from:1,to:3}],label:"Fm",notes:"F Ab C F"},
  // Gm: D Bb D G
  "Gm": {frets:[0,3,3,3],fingers:[0,1,2,3],baseFret:1,label:"Gm",notes:"D Bb D G"},
  // F#m/G♭m: F# A C# F#  (barre 2)
  "F#m":{frets:[4,2,2,2],fingers:[4,1,2,3],baseFret:1,barres:[{fret:2,from:1,to:3}],label:"F#m",notes:"F# A C# F#"},
  "Gbm":{frets:[4,2,2,2],fingers:[4,1,2,3],baseFret:1,barres:[{fret:2,from:1,to:3}],label:"Gbm (=F#m)",notes:"Gb Bbb Db Gb"},
  // C#m: barre 4, Am-shape
  "C#m":{frets:[2,1,2,0],fingers:[2,1,3,0],baseFret:1,label:"C#m",notes:"E G# C# E"},
  // Ebm: same as D#m, barre 6, Am-shape
  "Ebm":{frets:[4,3,4,2],fingers:[3,2,4,1],baseFret:1,label:"Ebm",notes:"Gb Bb Eb Gb"},
  // G#m/Abm: barre 4, Em-shape offset
  "G#m":{frets:[1,1,0,-1],fingers:[1,2,0,0],baseFret:1,label:"G#m",notes:"D# G# B"},
  "Abm":{frets:[1,1,0,-1],fingers:[1,2,0,0],baseFret:1,label:"Abm (=G#m)",notes:"Eb Ab B"},
  // Bbm: primary 3321 position
  "Bbm":{frets:[3,3,2,1],fingers:[3,4,2,1],baseFret:1,label:"Bbm",notes:"F Bb Db F"},
  // D#m = Ebm (enharmonic)
  "D#m":{frets:[4,3,4,2],fingers:[3,2,4,1],baseFret:1,label:"D#m (=Ebm)",notes:"Gb Bb Eb Gb"},
  // A#m = Bbm (enharmonic)
  "A#m":{frets:[3,3,2,1],fingers:[3,4,2,1],baseFret:1,label:"A#m (=Bbm)",notes:"F Bb Db F"},
  // Dbm = C#m (enharmonic)
  "Dbm":{frets:[2,1,2,0],fingers:[2,1,3,0],baseFret:1,label:"Dbm (=C#m)",notes:"E Ab Db E"},
  // E#m = Fm (enharmonic)
  "E#m":{frets:[3,1,1,1],fingers:[4,1,1,1],baseFret:1,barres:[{fret:1,from:1,to:3}],label:"E#m (=Fm)",notes:"F Ab C F"},
  // B#dim = Cdim (enharmonic)

  // ── DIMINISHED CHORDS ───────────────────────────────────────────────────
  // Bdim: B D F  — [0,1,0,1]: D,Ab,B,F = Bdim7 (close voicing)
  "Bdim": {frets:[0,4,0,1],fingers:[0,4,0,1],baseFret:1,label:"Bdim",notes:"D B B F"},
  // C#dim/Dbdim: primary 2020 position
  "C#dim":{frets:[2,0,2,0],fingers:[1,0,2,0],baseFret:1,label:"C#dim",notes:"E G C# E"},
  "Ddim": {frets:[0,1,3,1],fingers:[0,1,3,2],baseFret:1,label:"Ddim",notes:"D Ab D F"},
  "Edim": {frets:[2,3,5,3],fingers:[1,2,4,3],baseFret:1,label:"Edim",notes:"E Bb E G"},
  "F#dim":{frets:[4,2,1,2],fingers:[4,2,1,3],baseFret:1,label:"F#dim",notes:"F# A C F#"},
  "G#dim":{frets:[0,1,0,4],fingers:[0,1,0,4],baseFret:1,label:"G#dim",notes:"D G# B G#"},
  "A#dim":{frets:[2,3,2,0],fingers:[2,1,3,0],baseFret:1,label:"A#dim",notes:"E A# C# E"},
  "Adim": {frets:[1,2,1,-1],fingers:[1,3,2,0],baseFret:1,label:"Adim",notes:"Eb A C"},
  "Cdim": {frets:[1,-1,1,2],fingers:[1,0,2,3],baseFret:1,label:"Cdim",notes:"Eb C Gb"},
  "Fdim": {frets:[3,1,0,1],fingers:[3,1,0,2],baseFret:1,label:"Fdim",notes:"F Ab B F"},
  "Gdim": {frets:[-1,3,2,3],fingers:[0,2,1,3],baseFret:1,label:"Gdim",notes:"Bb Db G"},
  "Bbdim":{frets:[2,3,2,0],fingers:[2,1,3,0],baseFret:1,label:"Bbdim",notes:"E Bb Db E"},
  "E#dim":{frets:[3,1,0,1],fingers:[3,1,0,2],baseFret:1,label:"E#dim (=Fdim)",notes:"F Ab B F"},
  "B#dim":{frets:[1,-1,1,2],fingers:[1,0,2,3],baseFret:1,label:"B#dim (=Cdim)",notes:"Eb C Gb"},
  "D#dim":{frets:[1,2,-1,2],fingers:[1,2,0,3],baseFret:1,label:"D#dim",notes:"Eb A Gb"},

  // ── 7TH CHORDS ──────────────────────────────────────────────────────────
  "A7": {frets:[2,2,2,3],fingers:[1,1,1,2],baseFret:1,label:"A7",notes:"E A C# G"},
  "B7": {frets:[1,2,0,2],fingers:[1,2,0,3],baseFret:1,label:"B7",notes:"Eb A B Gb"},
  "C7": {frets:[2,3,1,3],fingers:[2,3,1,4],baseFret:1,label:"C7",notes:"E Bb C G"},
  "D7": {frets:[0,2,1,2],fingers:[0,2,1,3],baseFret:1,label:"D7",notes:"D A C F#"},
  "E7": {frets:[0,1,0,0],fingers:[0,1,0,0],baseFret:1,label:"E7",notes:"D G# B E"},
  "F7": {frets:[1,2,1,1],fingers:[1,3,1,1],baseFret:1,barres:[{fret:1,from:0,to:3}],label:"F7",notes:"Eb A C F"},
  "G7": {frets:[0,0,0,1],fingers:[0,0,0,1],baseFret:1,label:"G7",notes:"D G B F"},
};


// ── MUSIC THEORY DATA ─────────────────────────────────────────────────────────
const MAJOR_CHART = {
  C:{I:"C",ii:"Dm",iii:"Em",IV:"F",V:"G",vi:"Am",vii:"Bdim"},
  G:{I:"G",ii:"Am",iii:"Bm",IV:"C",V:"D",vi:"Em",vii:"F#dim"},
  D:{I:"D",ii:"Em",iii:"F#m",IV:"G",V:"A",vi:"Bm",vii:"C#dim"},
  A:{I:"A",ii:"Bm",iii:"C#m",IV:"D",V:"E",vi:"F#m",vii:"G#dim"},
  E:{I:"E",ii:"F#m",iii:"G#m",IV:"A",V:"B",vi:"C#m",vii:"D#dim"},
  B:{I:"B",ii:"C#m",iii:"D#m",IV:"E",V:"F#",vi:"G#m",vii:"A#dim"},
  "F#":{I:"F#",ii:"G#m",iii:"A#m",IV:"B",V:"C#",vi:"D#m",vii:"E#dim"},
  "C#":{I:"C#",ii:"D#m",iii:"E#m",IV:"F#",V:"G#",vi:"A#m",vii:"B#dim"},
  F:{I:"F",ii:"Gm",iii:"Am",IV:"Bb",V:"C",vi:"Dm",vii:"Edim"},
  Bb:{I:"Bb",ii:"Cm",iii:"Dm",IV:"Eb",V:"F",vi:"Gm",vii:"Adim"},
  Eb:{I:"Eb",ii:"Fm",iii:"Gm",IV:"Ab",V:"Bb",vi:"Cm",vii:"Ddim"},
  Ab:{I:"Ab",ii:"Bbm",iii:"Cm",IV:"Db",V:"Eb",vi:"Fm",vii:"Gdim"},
  Db:{I:"Db",ii:"Ebm",iii:"Fm",IV:"Gb",V:"Ab",vi:"Bbm",vii:"Cdim"},
  Gb:{I:"Gb",ii:"Abm",iii:"Bbm",IV:"Cb",V:"Db",vi:"Ebm",vii:"Fdim"},
  Cb:{I:"Cb",ii:"Dbm",iii:"Ebm",IV:"Fb",V:"Gb",vi:"Abm",vii:"Bbdim"},
};
const MINOR_CHART = {
  Am:{i:"Am","ii°":"Bdim",III:"C",iv:"Dm",v:"Em",VI:"F",VII:"G"},
  Em:{i:"Em","ii°":"F#dim",III:"G",iv:"Am",v:"Bm",VI:"C",VII:"D"},
  Bm:{i:"Bm","ii°":"C#dim",III:"D",iv:"Em",v:"F#m",VI:"G",VII:"A"},
  "F#m":{i:"F#m","ii°":"G#dim",III:"A",iv:"Bm",v:"C#m",VI:"D",VII:"E"},
  "C#m":{i:"C#m","ii°":"D#dim",III:"E",iv:"F#m",v:"G#m",VI:"A",VII:"B"},
  "G#m":{i:"G#m","ii°":"A#dim",III:"B",iv:"C#m",v:"D#m",VI:"E",VII:"F#"},
  Dm:{i:"Dm","ii°":"Edim",III:"F",iv:"Gm",v:"Am",VI:"Bb",VII:"C"},
  Gm:{i:"Gm","ii°":"Adim",III:"Bb",iv:"Cm",v:"Dm",VI:"Eb",VII:"F"},
  Cm:{i:"Cm","ii°":"Ddim",III:"Eb",iv:"Fm",v:"Gm",VI:"Ab",VII:"Bb"},
  Fm:{i:"Fm","ii°":"Gdim",III:"Ab",iv:"Bbm",v:"Cm",VI:"Db",VII:"Eb"},
  Bbm:{i:"Bbm","ii°":"Cdim",III:"Db",iv:"Ebm",v:"Fm",VI:"Gb",VII:"Ab"},
  Ebm:{i:"Ebm","ii°":"Fdim",III:"Gb",iv:"Abm",v:"Bbm",VI:"Cb",VII:"Db"},
};
const MAJOR_POS=["I","ii","iii","IV","V","vi","vii"];
const MINOR_POS=["i","ii°","III","iv","v","VI","VII"];
const MAJOR_KEYS=Object.keys(MAJOR_CHART);
const MINOR_KEYS=Object.keys(MINOR_CHART);
const MAJOR_HEAT={I:5,IV:5,V:5,vi:4,ii:3,iii:2,vii:1};
const MINOR_HEAT={i:5,VI:5,III:4,VII:4,iv:3,v:3,"ii°":1};
const HEAT_COLOR=h=>{
  if(h===5)return{bg:"rgba(201,168,76,0.22)",border:"rgba(201,168,76,0.6)",text:"#f5d97a"};
  if(h===4)return{bg:"rgba(201,168,76,0.12)",border:"rgba(201,168,76,0.35)",text:"#d4b96a"};
  if(h===3)return{bg:"rgba(126,184,247,0.10)",border:"rgba(126,184,247,0.25)",text:"#9dc8f0"};
  if(h===2)return{bg:"rgba(126,184,247,0.05)",border:"rgba(126,184,247,0.12)",text:"#8899bb"};
  return{bg:"rgba(100,100,120,0.05)",border:"rgba(100,100,120,0.15)",text:"#666688"};
};
const MAJOR_PC={I:"#c9a84c",ii:"#7eb8f7",iii:"#7eb8f7",IV:"#c9a84c",V:"#c9a84c",vi:"#7eb8f7",vii:"#a78bfa"};
const MINOR_PC={i:"#7eb8f7","ii°":"#a78bfa",III:"#c9a84c",iv:"#7eb8f7",v:"#7eb8f7",VI:"#c9a84c",VII:"#c9a84c"};

// ── PROGRESSION SONG ANCHORS ──────────────────────────────────────────────────
// Static roman-numeral templates — actual chord names get substituted per key at render time
const PROGRESSION_TEMPLATES={
  major:[
    {roman:["I","V","vi","IV"],mood:"Bright, familiar, resolved. The backbone of countless pop songs."},
    {roman:["I","vi","IV","V"],mood:"Warm and nostalgic — the classic 50s doo-wop feel."},
    {roman:["I","IV","V"],mood:"Open and straightforward. Three chords, infinite songs."},
  ],
  minor:[
    {roman:["i","VI","VII"],mood:"A driving minor anthem feel. Dark but singable."},
    {roman:["i","VII","VI","V"],mood:"A descending, dramatic pull — the Andalusian cadence."},
    {roman:["i","iv","v"],mood:"Pure and resolved minor — moody but grounded."},
  ],
};

// ── CIRCLE OF FIFTHS ──────────────────────────────────────────────────────────
// Clockwise order, each minor is the relative minor of the major at the same index
const CIRCLE_MAJORS=["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
const CIRCLE_MINORS=["Am","Em","Bm","F#m","C#m","G#m","Ebm","Bbm","Fm","Cm","Gm","Dm"];
const FAMILY_COLOR={natural:"#c9a84c",sharp:"#a78bfa",flat:"#7eb8f7"};
function keyFamily(k){
  const letter=k.replace("m","");
  if(letter.includes("#")) return "sharp";
  if(letter.includes("b")) return "flat";
  return "natural";
}

function CircleOfFifths({selectedKey,selectedIsMinor,onTapMajor,onTapMinor}){
  const cx=150,cy=150,outerR=118,innerR=72;
  const ring=selectedIsMinor?CIRCLE_MINORS:CIRCLE_MAJORS;
  const selectedIdx=selectedKey==null?-1:ring.indexOf(selectedKey);
  const vIdx=selectedIdx>=0?(selectedIdx+1)%12:-1;
  const ivIdx=selectedIdx>=0?(selectedIdx+11)%12:-1;

  const wedgeStyle=(idx,isMinorRing,name)=>{
    if(selectedIdx<0) return {fill:FAMILY_COLOR[keyFamily(name)],opacity:0.85};
    if(isMinorRing!==selectedIsMinor) return {fill:"#333350",opacity:0.22};
    if(idx===selectedIdx) return {fill:"#c9a84c",stroke:"#f5e6c8",strokeWidth:2.5,opacity:1};
    if(idx===vIdx) return {fill:"#4ade80",opacity:0.9};
    if(idx===ivIdx) return {fill:"#7eb8f7",opacity:0.9};
    return {fill:"#333350",opacity:0.3};
  };

  const pos=(r,idx)=>{
    const angle=(idx*30-90)*Math.PI/180;
    return [cx+r*Math.cos(angle),cy+r*Math.sin(angle)];
  };

  return(
    <svg viewBox="0 0 300 300" style={{width:"100%",maxWidth:"340px",display:"block",margin:"0 auto"}}>
      {CIRCLE_MAJORS.map((_,idx)=>{
        const [ox,oy]=pos(outerR,idx);
        const [ix,iy]=pos(innerR,idx);
        return <line key={"l"+idx} x1={ix} y1={iy} x2={ox} y2={oy} stroke="#2a2a3e" strokeWidth="1"/>;
      })}
      {CIRCLE_MAJORS.map((maj,idx)=>{
        const [x,y]=pos(outerR,idx);
        const st=wedgeStyle(idx,false,maj);
        return(
          <g key={maj} onClick={()=>onTapMajor(maj)} style={{cursor:"pointer"}}>
            <circle cx={x} cy={y} r="24" fill={st.fill} opacity={st.opacity} stroke={st.stroke||"none"} strokeWidth={st.strokeWidth||0}/>
            <text x={x} y={y+6} textAnchor="middle" fontSize="17" fontFamily="Georgia,serif" fontWeight="bold" fill="#0f0f14">{maj}</text>
          </g>
        );
      })}
      {CIRCLE_MINORS.map((min,idx)=>{
        const [x,y]=pos(innerR,idx);
        const st=wedgeStyle(idx,true,min);
        return(
          <g key={min} onClick={()=>onTapMinor(min)} style={{cursor:"pointer"}}>
            <circle cx={x} cy={y} r="19" fill={st.fill} opacity={st.opacity} stroke={st.stroke||"none"} strokeWidth={st.strokeWidth||0}/>
            <text x={x} y={y+5} textAnchor="middle" fontSize="12.5" fontFamily="Georgia,serif" fontWeight="bold" fill="#0f0f14">{min}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── CHEAT SHEET ───────────────────────────────────────────────────────────────
const CHEAT_SECTIONS=[
  {id:"progressions",emoji:"🔥",title:"Most-Used Progressions",color:"#c9a84c",cards:[
    {label:"The Pop 4",tag:"Major · Everywhere",tagColor:"#c9a84c",content:"I – V – vi – IV",sub:"C–G–Am–F in C major. Used in thousands of songs. If you learn one progression, learn this."},
    {label:"50s / Doo-Wop",tag:"Major · Classic",tagColor:"#c9a84c",content:"I – vi – IV – V",sub:"C–Am–F–G. The backbone of early rock & roll, doo-wop, and tons of oldies."},
    {label:"Minor Anthem",tag:"Minor · Emotional",tagColor:"#7eb8f7",content:"i – VI – III – VII",sub:"Am–F–C–G. The most common minor progression in pop and rock. Dark but singable."},
    {label:"12-Bar Blues",tag:"Major · Blues",tagColor:"#c9a84c",content:"I–I–I–I / IV–IV–I–I / V–IV–I–V",sub:"The foundation of blues, early rock, country. Just I, IV, and V."},
    {label:"The Andalusian",tag:"Minor · Dramatic",tagColor:"#7eb8f7",content:"i – VII – VI – V",sub:"Am–G–F–E. A descending bass line — dramatic and instantly recognizable."},
    {label:"2-5-1 (Jazz)",tag:"Major · Jazz",tagColor:"#a78bfa",content:"ii – V – I",sub:"Dm–G–C in C major. The most important jazz progression. Sophisticated resolved feel."},
  ]},
  {id:"major",emoji:"🌞",title:"Major Key Theory",color:"#c9a84c",cards:[
    {label:"The Pattern",tag:"Foundation",tagColor:"#c9a84c",content:"Maj min min Maj Maj min dim°",sub:"Every major key: I ii iii IV V vi vii°. Memorize the pattern once — it applies to all 15 keys."},
    {label:"The Power Three",tag:"I · IV · V",tagColor:"#c9a84c",content:"I – IV – V",sub:"Three chords that cover hundreds of songs. V creates tension, I releases it, IV is the open road."},
    {label:"The Emotional Add",tag:"vi chord",tagColor:"#7eb8f7",content:"vi = relative minor",sub:"The vi chord shares notes with I and IV, making it the perfect emotional detour in any progression."},
    {label:"V → I Resolution",tag:"Tension & Release",tagColor:"#c9a84c",content:"V wants to go home to I",sub:"The V chord creates tension that naturally resolves to I. This is the engine of Western music."},
    {label:"ii chord",tag:"Smooth sub for IV",tagColor:"#7eb8f7",content:"ii can replace IV",sub:"The ii chord shares two notes with IV. Swapping adds a jazzier, slightly darker color."},
    {label:"iii chord",tag:"Passing chord",tagColor:"#7eb8f7",content:"iii bridges I and IV",sub:"iii is rarely a destination — it's a stepping stone between I and IV, or for a descending bass line."},
  ]},
  {id:"minor",emoji:"🌙",title:"Minor Key Theory",color:"#7eb8f7",cards:[
    {label:"Natural Minor Pattern",tag:"Foundation",tagColor:"#7eb8f7",content:"min dim° Maj min min Maj Maj",sub:"i ii° III iv v VI VII. III, VI, and VII are all major — they give minor songs those big emotional lifts."},
    {label:"The Backbone",tag:"i · VI · VII",tagColor:"#7eb8f7",content:"i – VI – VII",sub:"Am–F–G in Am. These three chords are the backbone of minor key music. Loop them for an anthemic feel."},
    {label:"Harmonic Minor Trick",tag:"V → i resolution",tagColor:"#a78bfa",content:"Raise the v to V (major)",sub:"Natural minor's v chord resolves weakly. Raise the 7th degree → V major for a powerful pull back to i."},
    {label:"Relative Major",tag:"Major ↔ Minor",tagColor:"#c9a84c",content:"Every minor key shares a major key",sub:"Am is the relative minor of C major — same notes, different home. Know one, you know the other."},
    {label:"VI chord lift",tag:"Emotional peak",tagColor:"#c9a84c",content:"VI = major chord in minor key",sub:"The VI chord is major — a moment of brightness inside darkness. That's why minor songs can still soar."},
    {label:"i – iv – v Loop",tag:"Pure minor",tagColor:"#7eb8f7",content:"i – iv – v (or V)",sub:"Darker and more resolved than i–VI–VII. Swap v → V (major) for a stronger pull back home."},
  ]},
  {id:"bari",emoji:"🎸",title:"Baritone Uke Tips",color:"#4ade80",cards:[
    {label:"DGBE Tuning",tag:"Standard baritone",tagColor:"#4ade80",content:"D – G – B – E",sub:"Same as the top 4 strings of a guitar. Guitar chord shapes transfer directly — huge advantage if you ever played guitar."},
    {label:"Uke-Friendly Keys",tag:"Start here",tagColor:"#4ade80",content:"G · D · Em · Am · C",sub:"These keys have the most playable open-chord shapes on baritone. G and D especially have very natural fingerings."},
    {label:"Em is Free",tag:"All open strings",tagColor:"#4ade80",content:"Em = 0-0-0-0 (almost)",sub:"Em is just D@2 and all other strings open — basically free. Great first chord on baritone."},
    {label:"G is Wide Open",tag:"3 open strings",tagColor:"#4ade80",content:"G = only 1 finger",sub:"G major only needs one finger — E string at fret 3. The D, G, B strings are all open. Super beginner friendly."},
    {label:"Capo Trick",tag:"Key changes",tagColor:"#4ade80",content:"Capo = same shapes, higher key",sub:"Capo 2nd fret + G shapes = A. Capo 5th fret + G shapes = C. The chord relationships stay identical."},
    {label:"F is the Hurdle",tag:"First barre chord",tagColor:"#4ade80",content:"F requires a barre at fret 1",sub:"Index finger across all 4 strings at fret 1, then ring finger fret 3 (D string), middle fret 2 (G), pinky fret 2 (B)."},
  ]},
];

// ── CHORD DIAGRAM ─────────────────────────────────────────────────────────────
function ChordDiagram({ chordName, size="md", showName=true }) {
  const chord = BARI_CHORDS[chordName];
  if (!chord) return (
    <div style={{textAlign:"center",padding:"16px 8px"}}>
      <div style={{color:"#3a3a55",fontSize:"13px",fontFamily:"'Georgia',serif",fontWeight:"bold"}}>{chordName}</div>
      <div style={{color:"#444460",fontSize:"10px",fontFamily:"sans-serif",marginTop:"4px"}}>diagram coming soon</div>
    </div>
  );

  const isLg = size==="lg";
  const cellW = isLg ? 38 : 28;
  const cellH = isLg ? 34 : 26;
  const dotR  = isLg ? 11 : 8;
  const strings = 4;
  const frets   = 4;
  const totalW  = cellW * (strings-1);
  const totalH  = cellH * frets;
  const padL    = 30;
  const padT    = isLg ? 40 : 32;
  const svgW    = totalW + padL + 18;
  const svgH    = totalH + padT + 18;
  const strNames= ["D","G","B","E"];
  const barres  = chord.barres || [];
  const showNut = chord.baseFret === 1;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
      {showName && <div style={{color:"#f5e6c8",fontSize:isLg?"17px":"13px",fontWeight:"bold",fontFamily:"'Georgia',serif"}}>
        {chord.label}
      </div>}
      {chord.baseFret > 1 && (
        <div style={{color:"#c9a84c",fontSize:"10px",fontFamily:"sans-serif",marginTop:"-2px"}}>
          fret {chord.baseFret}
        </div>
      )}
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{overflow:"visible"}}>
        {/* Nut */}
        {showNut
          ? <rect x={padL} y={padT-5} width={totalW} height={6} rx={2} fill="#d4b96a"/>
          : <line x1={padL} y1={padT} x2={padL+totalW} y2={padT} stroke="#4a4a6a" strokeWidth={1.5}/>
        }
        {/* Fret lines */}
        {Array.from({length:frets+1}).map((_,i)=>(
          <line key={i} x1={padL} y1={padT+cellH*i} x2={padL+totalW} y2={padT+cellH*i}
            stroke={i===0?"transparent":"#3a3a52"} strokeWidth={1}/>
        ))}
        {/* String lines */}
        {Array.from({length:strings}).map((_,i)=>(
          <line key={i} x1={padL+cellW*i} y1={padT} x2={padL+cellW*i} y2={padT+totalH}
            stroke="#3a3a52" strokeWidth={1}/>
        ))}
        {/* String name labels */}
        {strNames.map((n,i)=>(
          <text key={n} x={padL+cellW*i} y={padT-(isLg?10:8)}
            textAnchor="middle" fill="#555575" fontSize={isLg?"11":"9"} fontFamily="sans-serif">
            {n}
          </text>
        ))}
        {/* Fret number labels */}
        {Array.from({length:frets}).map((_,i)=>(
          <text key={i} x={padL-8} y={padT+cellH*i+cellH/2+4}
            textAnchor="middle" fill="#3a3a52" fontSize={isLg?"9":"8"} fontFamily="sans-serif">
            {chord.baseFret+i}
          </text>
        ))}
        {/* Barre bars */}
        {barres.map((b,bi)=>{
          const y=padT+cellH*(b.fret-1)+cellH/2;
          const x1=padL+cellW*b.from;
          const x2=padL+cellW*b.to;
          return(
            <rect key={bi} x={x1-dotR*0.8} y={y-dotR} width={x2-x1+dotR*1.6} height={dotR*2}
              rx={dotR} fill="#c9a84c" opacity={0.85}/>
          );
        })}
        {/* Open/muted/fretted markers */}
        {chord.frets.map((fret,si)=>{
          const x=padL+cellW*si;
          if(fret===0){
            return(
              <circle key={si} cx={x} cy={padT-(isLg?18:14)} r={dotR*0.65}
                fill="none" stroke="#4ade80" strokeWidth={isLg?2:1.5}/>
            );
          }
          if(fret===-1){
            return(
              <text key={si} x={x} y={padT-(isLg?12:9)}
                textAnchor="middle" fill="#f87171" fontSize={isLg?"14":"11"} fontFamily="sans-serif">×</text>
            );
          }
          const y=padT+cellH*(fret-1)+cellH/2;
          const finger=chord.fingers[si];
          return(
            <g key={si}>
              <circle cx={x} cy={y} r={dotR} fill="#c9a84c"/>
              {finger>0&&(
                <text x={x} y={y+dotR*0.38}
                  textAnchor="middle" fill="#0f0f14"
                  fontSize={isLg?"10":"8"} fontWeight="bold" fontFamily="sans-serif">
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Notes label on large */}
      {showName && isLg && chord.notes && (
        <div style={{color:"#555575",fontSize:"10px",fontFamily:"sans-serif",marginTop:"-4px"}}>
          {chord.notes}
        </div>
      )}
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function shuffle(arr){return [...arr].sort(()=>Math.random()-0.5);}
const STREAK_MSGS=[3,5,10,15,20];

// Strip quality suffix from chord name, return [root, quality]
// e.g. "C#m"→["C#","m"]  "F#dim"→["F#","dim"]  "Bb"→["Bb",""]  "Adim"→["A","dim"]
function parseChord(name){
  if(!name) return ["",""];
  const m = name.match(/^([A-G][#b]?)(m7|maj7|dim|m|7)?$/);
  if(!m) return [name,""];
  return [m[1], m[2]||""];
}

// Chromatic scale for semitone neighbors
const CHROMATIC = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const ENHARMONIC = {"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#",
                    "C#":"Db","D#":"Eb","F#":"Gb","G#":"Ab","A#":"Bb"};

function chromaticNeighbors(root){
  const r = ENHARMONIC[root] || root;
  const idx = CHROMATIC.indexOf(r);
  if(idx===-1) return [];
  const up   = CHROMATIC[(idx+1)%12];
  const down = CHROMATIC[(idx+11)%12];
  return [up, ENHARMONIC[up]||up, down, ENHARMONIC[down]||down].filter(Boolean);
}

// Build 3 tricky wrong answers — safe, always returns exactly 3
function buildDistractors(correct, allChordNames){
  if(!correct) return allChordNames.filter(n=>n!==correct).slice(0,3);
  const [root, quality] = parseChord(correct);
  const pool = new Set();

  // 1. Same root, different quality (C#m → C#, C#dim, C#7)
  for(const q of ["","m","dim","7"]){
    const c = root + q;
    if(c !== correct) pool.add(c);
  }
  // 2. Semitone neighbors with same quality (C#m → Cm, Dm)
  for(const neighbor of chromaticNeighbors(root)){
    const c = neighbor + quality;
    if(c !== correct) pool.add(c);
  }
  // 3. Same-quality chords from chart as fallback
  for(const name of allChordNames){
    if(name && name !== correct){
      const [,q] = parseChord(name);
      if(q === quality) pool.add(name);
    }
  }

  pool.delete(correct);
  const result = shuffle([...pool]).slice(0,3);
  // Pad with any chord if we somehow got fewer than 3
  let i=0;
  while(result.length < 3 && i < allChordNames.length){
    const fb = allChordNames[i++];
    if(fb && fb !== correct && !result.includes(fb)) result.push(fb);
  }
  return result;
}

// Keep the existing distractor strategy, but only offer renderable, distinct shapes.
export function buildFingeringQuestion(allChordNames){
  const names=[...new Set(allChordNames)].filter(name=>BARI_CHORDS[name]);
  const correct=names[Math.floor(Math.random()*names.length)];
  const shape=name=>JSON.stringify([BARI_CHORDS[name].baseFret,BARI_CHORDS[name].frets]);
  if(!correct) throw new Error("Fingering Quiz needs at least four distinct chord shapes");
  const choices=[correct];
  const seen=new Set([shape(correct)]);
  const candidates=[...buildDistractors(correct,names),...shuffle(names)];
  for(const name of candidates){
    if(!names.includes(name)||seen.has(shape(name))) continue;
    choices.push(name);
    seen.add(shape(name));
    if(choices.length===4) break;
  }
  if(choices.length<4) throw new Error("Fingering Quiz needs at least four distinct chord shapes");
  return {correct,choices:shuffle(choices)};
}

// Playback begins from a quiz-button press, satisfying mobile browsers'
// requirement for user-initiated audio.
let toneContext=null;
async function playChord(frets){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass) return;
  toneContext??=new AudioContextClass();
  if(toneContext.state==="suspended") await toneContext.resume();

  const now=toneContext.currentTime;
  const filter=toneContext.createBiquadFilter();
  filter.type="lowpass";
  filter.frequency.setValueAtTime(2600,now);
  filter.Q.value=0.7;
  filter.connect(toneContext.destination);

  const makePartial=(midi,start,multiple,level)=>{
    const frequency=440*Math.pow(2,(midi-69)/12);
    const oscillator=toneContext.createOscillator();
    const gain=toneContext.createGain();
    oscillator.type="triangle";
    oscillator.frequency.setValueAtTime(frequency*multiple,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.exponentialRampToValueAtTime(level,start+0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,start+1.15);
    oscillator.connect(gain).connect(filter);
    oscillator.start(start);
    oscillator.stop(start+1.18);
  };
  // DGBE open-string MIDI pitches. Each playable string is brushed in order,
  // producing the actual chord voicing shown by the quiz diagram.
  const openStringMidis=[50,55,59,64];
  frets.forEach((fret,index)=>{
    if(fret<0) return;
    const start=now+index*0.035;
    const midi=openStringMidis[index]+fret;
    makePartial(midi,start,1,0.09);
    makePartial(midi,start,2,0.02);
    makePartial(midi,start,3,0.007);
  });
}

function FingeringQuiz({session,setSession}){
  const {question,selected,score,streak}=session;
  const answered=selected!==null;
  const correct=selected===question.correct;
  const answer=choice=>{
    if(answered) return;
    playChord(BARI_CHORDS[question.correct].frets);
    setSession(previous=>{
      if(previous.selected!==null) return previous;
      const right=choice===previous.question.correct;
      return {...previous,selected:choice,
        score:{correct:previous.score.correct+Number(right),total:previous.score.total+1},
        streak:right?previous.streak+1:0};
    });
  };
  return(
    <div className="fingering-card" style={S.card}>
      <h1 style={{...S.title,fontSize:"24px"}}>Fingering Quiz</h1>
      <p className="fingering-intro" style={S.sub}>Match the chord name to its DGBE fingering.</p>
      <div className="fingering-score" style={{display:"flex",justifyContent:"center",gap:"10px"}}>
        <span style={S.chip}>Score: {score.correct}/{score.total}</span>
        <span style={{...S.chip,color:"#c9a84c"}}>🔥 Streak: {streak}</span>
      </div>
      <h2 style={{...S.qLabel,color:"#f5e6c8",textAlign:"center",marginBottom:"10px"}}>
        Which one of these is the <strong>{question.correct}</strong> chord?
      </h2>
      <div className="fingering-choices">
        {question.choices.map((choice,index)=>{
          const chord=BARI_CHORDS[choice];
          const state=answered?(choice===question.correct?S.cCorrect:choice===selected?S.cWrong:{opacity:0.4}):{};
          return(
            <button className="fingering-choice" key={choice} type="button" disabled={answered}
              aria-label={`Option ${index+1}: ${answered?choice+". ":""}Starting fret ${chord.baseFret}; D G B E string positions: ${chord.frets.map(f=>f===0?"open":f===-1?"muted":f).join(", ")}`}
              style={{...S.choiceBtn,...state,padding:"6px 4px",cursor:answered?"default":"pointer"}}
              onClick={()=>answer(choice)}>
              <div aria-hidden="true"><ChordDiagram chordName={choice} size="md" showName={answered}/></div>
              {answered&&<span style={{display:"block",fontSize:"12px",marginTop:"6px"}}>
                {choice===question.correct?"✓ Correct":choice===selected?"✗ Your answer":""}
              </span>}
            </button>
          );
        })}
      </div>
      <div className="fingering-feedback">
      <div role="status" style={{color:correct?"#4ade80":"#f87171",fontFamily:"sans-serif",fontWeight:"bold"}}>
        {answered?(correct?"✓ Correct!":`✗ It's ${question.correct}`):""}
      </div>
      <div style={{display:"flex",gap:"6px"}}>
        {answered&&<button type="button" style={{...S.peekBtn,minHeight:"44px"}} onClick={()=>playChord(BARI_CHORDS[question.correct].frets)}>▶ Play chord</button>}
        <button type="button" disabled={!answered} style={{...S.nextBtn,minHeight:"44px",opacity:answered?1:0.4}} onClick={()=>setSession(previous=>({
          ...previous,question:buildFingeringQuestion(Object.keys(BARI_CHORDS)),selected:null,
        }))}>Next →</button>
      </div>
      </div>
    </div>
  );
}

// ── SKIP-A-LETTER DRILL ───────────────────────────────────────────────────────
// Chords stack in thirds by skipping one letter of the musical alphabet each time:
// C (skip D) E (skip F) G. This holds for every root — only the accidentals change.
const NOTE_LETTERS=["A","B","C","D","E","F","G"];
const ACCIDENTAL_FOR_DIFF={"-2":"bb","-1":"b","0":"","1":"#","2":"##"};

function pitchClassOf(note){
  const idx=CHROMATIC.indexOf(note);
  if(idx!==-1) return idx;
  const enh=ENHARMONIC[note];
  return enh?CHROMATIC.indexOf(enh):0;
}

function spellNote(letter,targetPc){
  const diff=(((targetPc-pitchClassOf(letter))%12)+18)%12-6; // normalized to [-6,5]
  return letter+(ACCIDENTAL_FOR_DIFF[diff]||"");
}

// 7 natural-letter roots (major + minor) plus the common sharp/flat keys from the Circle of Fifths
const SKIP_ROOTS=["C","D","E","F","G","A","B","F#","Db","Ab","Eb","Bb",
                   "Cm","Dm","Em","Fm","Gm","Am","Bm","F#m","C#m","G#m","Ebm","Bbm"];

function buildSkipItem(root){
  const isMinor=root.endsWith("m");
  const bareRoot=isMinor?root.slice(0,-1):root;
  const rootLetter=bareRoot[0];
  const rootPc=pitchClassOf(bareRoot);
  const li=NOTE_LETTERS.indexOf(rootLetter);
  const thirdLetter=NOTE_LETTERS[(li+2)%7];
  const skippedLetter=NOTE_LETTERS[(li+1)%7];
  const fifthLetter=NOTE_LETTERS[(li+4)%7];
  const third=spellNote(thirdLetter,(rootPc+(isMinor?3:4))%12);
  const fifth=spellNote(fifthLetter,(rootPc+7)%12);
  const wrongQualityThird=spellNote(thirdLetter,(rootPc+(isMinor?4:3))%12);
  return {
    root, label:`${bareRoot} ${isMinor?"minor":"major"}`, isMinor,
    stack:`${bareRoot}-${third}-${fifth}`,
    wrongLetterStack:`${bareRoot}-${skippedLetter}-${fifth}`,
    wrongQualityStack:`${bareRoot}-${wrongQualityThird}-${fifth}`,
    spanLetters:[0,1,2,3,4].map(o=>NOTE_LETTERS[(li+o)%7]),
  };
}
const SKIP_ITEMS=SKIP_ROOTS.map(buildSkipItem);

function buildSkipChoices(item){
  const set=new Set([item.stack,item.wrongLetterStack,item.wrongQualityStack]);
  let guard=0;
  while(set.size<4&&guard<20){
    const other=SKIP_ITEMS[Math.floor(Math.random()*SKIP_ITEMS.length)];
    if(other.root!==item.root) set.add(other.stack);
    guard++;
  }
  return shuffle([...set]).slice(0,4);
}

// ── THEORY QUIZ QUESTIONS ─────────────────────────────────────────────────────
// Each Q: { id, category, prompt, choices:[{text,correct,explain}], explain }
const THEORY_QS = [
  // ── MAJOR PATTERN ──
  {id:"maj-pattern-1",category:"🌞 Major Pattern",
   prompt:"What chord quality is the I chord in a major key?",
   choices:[
     {text:"Major",correct:true},
     {text:"Minor",correct:false},
     {text:"Diminished",correct:false},
     {text:"Dominant 7th",correct:false},
   ],
   explain:"The I chord is always Major — it's the home base of the key. Bright, stable, resolved."},

  {id:"maj-pattern-2",category:"🌞 Major Pattern",
   prompt:"What chord quality is the ii chord in a major key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:true},
     {text:"Diminished",correct:false},
     {text:"Augmented",correct:false},
   ],
   explain:"The ii chord is minor. It's closely related to IV (they share two notes) and often substitutes for it in jazz progressions."},

  {id:"maj-pattern-3",category:"🌞 Major Pattern",
   prompt:"What chord quality is the iii chord in a major key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:true},
     {text:"Diminished",correct:false},
     {text:"Major 7th",correct:false},
   ],
   explain:"The iii chord is minor. It's a passing chord — rarely a destination, more of a bridge between I and IV."},

  {id:"maj-pattern-4",category:"🌞 Major Pattern",
   prompt:"What chord quality is the IV chord in a major key?",
   choices:[
     {text:"Major",correct:true},
     {text:"minor",correct:false},
     {text:"Diminished",correct:false},
     {text:"Suspended",correct:false},
   ],
   explain:"The IV chord is Major. Along with I and V, it's one of the three pillars of most songs."},

  {id:"maj-pattern-5",category:"🌞 Major Pattern",
   prompt:"What chord quality is the V chord in a major key?",
   choices:[
     {text:"Major",correct:true},
     {text:"minor",correct:false},
     {text:"Diminished",correct:false},
     {text:"Augmented",correct:false},
   ],
   explain:"The V chord is Major. It creates tension that wants to resolve back to I — the most powerful move in Western music."},

  {id:"maj-pattern-6",category:"🌞 Major Pattern",
   prompt:"What chord quality is the vi chord in a major key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:true},
     {text:"Diminished",correct:false},
     {text:"Major 7th",correct:false},
   ],
   explain:"The vi chord is minor — it's the relative minor of the key. Adding it to I-IV-V gives you the famous I-V-vi-IV pop progression."},

  {id:"maj-pattern-7",category:"🌞 Major Pattern",
   prompt:"What chord quality is the vii chord in a major key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:false},
     {text:"Diminished",correct:true},
     {text:"Augmented",correct:false},
   ],
   explain:"The vii chord is diminished — tense and unstable. It's rarely used as a destination chord, but powerful as a passing chord leading back to I."},

  {id:"maj-full",category:"🌞 Major Pattern",
   prompt:"What is the full chord quality pattern for a major key? (I through vii)",
   choices:[
     {text:"Maj min min Maj Maj min dim",correct:true},
     {text:"Maj Maj min Maj min min dim",correct:false},
     {text:"min Maj Maj min Maj dim min",correct:false},
     {text:"Maj min Maj min min Maj dim",correct:false},
   ],
   explain:"Maj min min Maj Maj min dim — or: I ii iii IV V vi vii°. The two minor chords in a row (ii and iii) trip people up the most."},

  // ── MINOR PATTERN ──
  {id:"min-pattern-1",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the i chord in a natural minor key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:true},
     {text:"Diminished",correct:false},
     {text:"Dominant 7th",correct:false},
   ],
   explain:"The i chord in minor is always minor (lowercase Roman numeral signals this). It's the home base — darker and more introspective than a major I."},

  {id:"min-pattern-2",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the ii° chord in a natural minor key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:false},
     {text:"Diminished",correct:true},
     {text:"Augmented",correct:false},
   ],
   explain:"The ii° is diminished — the least used chord in minor. The ° symbol always means diminished."},

  {id:"min-pattern-3",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the III chord in a natural minor key?",
   choices:[
     {text:"Major",correct:true},
     {text:"minor",correct:false},
     {text:"Diminished",correct:false},
     {text:"Suspended",correct:false},
   ],
   explain:"The III chord is Major (uppercase = major). It's the relative major — same notes as the whole key. Gives minor songs that uplifting moment."},

  {id:"min-pattern-4",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the iv chord in a natural minor key?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:true},
     {text:"Diminished",correct:false},
     {text:"Augmented",correct:false},
   ],
   explain:"The iv chord is minor (lowercase). This is different from major keys where IV is major — it's one of the things that gives minor keys their darker sound."},

  {id:"min-pattern-5",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the v chord in natural minor?",
   choices:[
     {text:"Major",correct:false},
     {text:"minor",correct:true},
     {text:"Diminished",correct:false},
     {text:"Dominant 7th",correct:false},
   ],
   explain:"In natural minor the v is minor — which is why it resolves weakly back to i. Raise it to V major (harmonic minor) for a stronger pull home."},

  {id:"min-pattern-6",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the VI chord in a natural minor key?",
   choices:[
     {text:"Major",correct:true},
     {text:"minor",correct:false},
     {text:"Diminished",correct:false},
     {text:"Augmented",correct:false},
   ],
   explain:"The VI is Major (uppercase). Together with III and VII, it gives minor keys those soaring major moments. The i–VI–VII progression is everywhere in pop."},

  {id:"min-pattern-7",category:"🌙 Minor Pattern",
   prompt:"What chord quality is the VII chord in a natural minor key?",
   choices:[
     {text:"Major",correct:true},
     {text:"minor",correct:false},
     {text:"Diminished",correct:false},
     {text:"Suspended",correct:false},
   ],
   explain:"The VII is Major. In the i–VI–VII loop (like Am–F–G), VII is the chord that drives back toward i with energy but without the sharpness of a dominant V."},

  {id:"min-full",category:"🌙 Minor Pattern",
   prompt:"What is the full chord quality pattern for a natural minor key? (i through VII)",
   choices:[
     {text:"min dim Maj min min Maj Maj",correct:true},
     {text:"min min Maj min Maj Maj dim",correct:false},
     {text:"min Maj min dim Maj min Maj",correct:false},
     {text:"min dim min Maj min Maj Maj",correct:false},
   ],
   explain:"min dim Maj min min Maj Maj — i ii° III iv v VI VII. Notice III, VI, VII are all Major — those are the bright moments inside a dark key."},

  // ── PROGRESSIONS ──
  {id:"prog-1",category:"🔥 Progressions",
   prompt:"The I–V–vi–IV progression is sometimes called what?",
   choices:[
     {text:"The Pop 4",correct:true},
     {text:"The Blues Loop",correct:false},
     {text:"The Jazz 2-5-1",correct:false},
     {text:"The Andalusian",correct:false},
   ],
   explain:"I–V–vi–IV is 'The Pop 4' — used in thousands of songs across every genre. In C major that's C–G–Am–F."},

  {id:"prog-2",category:"🔥 Progressions",
   prompt:"In the key of C major, what are the I–IV–V chords?",
   choices:[
     {text:"C – F – G",correct:true},
     {text:"C – G – Am",correct:false},
     {text:"Am – F – C",correct:false},
     {text:"C – Dm – G",correct:false},
   ],
   explain:"I=C, IV=F, V=G. These three chords cover a massive amount of songs and are the friendliest shapes on baritone uke."},

  {id:"prog-3",category:"🔥 Progressions",
   prompt:"Which progression is the backbone of most minor key pop songs?",
   choices:[
     {text:"i – VI – VII",correct:true},
     {text:"i – iv – V",correct:false},
     {text:"I – V – vi – IV",correct:false},
     {text:"ii – V – I",correct:false},
   ],
   explain:"i–VI–VII (e.g. Am–F–G) is the minor anthem — the backbone of countless pop and rock songs in minor keys."},

  {id:"prog-4",category:"🔥 Progressions",
   prompt:"What is the ii–V–I progression most associated with?",
   choices:[
     {text:"Jazz",correct:true},
     {text:"Blues",correct:false},
     {text:"Flamenco",correct:false},
     {text:"Folk",correct:false},
   ],
   explain:"ii–V–I is the cornerstone of jazz harmony. The movement creates a smooth, sophisticated resolution back to the I chord."},

  {id:"prog-5",category:"🔥 Progressions",
   prompt:"The i–VII–VI–V descending progression is named after which region?",
   choices:[
     {text:"Andalusia (Spain)",correct:true},
     {text:"Appalachia (USA)",correct:false},
     {text:"Anatolia (Turkey)",correct:false},
     {text:"Amazonia (Brazil)",correct:false},
   ],
   explain:"The Andalusian cadence (i–VII–VI–V, e.g. Am–G–F–E) comes from flamenco music in southern Spain. That descending bass line is unmistakable."},

  // ── THEORY CONCEPTS ──
  {id:"theory-1",category:"🧠 Theory Concepts",
   prompt:"What does the V chord want to do?",
   choices:[
     {text:"Resolve to I",correct:true},
     {text:"Jump to vi",correct:false},
     {text:"Stay on V",correct:false},
     {text:"Drop to IV",correct:false},
   ],
   explain:"V→I is the most fundamental move in Western music. The V chord creates tension; the I chord releases it. Everything else in harmony orbits this relationship."},

  {id:"theory-2",category:"🧠 Theory Concepts",
   prompt:"Am is the relative minor of which major key?",
   choices:[
     {text:"C major",correct:true},
     {text:"G major",correct:false},
     {text:"F major",correct:false},
     {text:"D major",correct:false},
   ],
   explain:"Am and C major share the exact same notes — just different home bases. Every minor key has a relative major, and knowing one means you already know the other."},

  {id:"theory-3",category:"🧠 Theory Concepts",
   prompt:"What is the 'harmonic minor trick'?",
   choices:[
     {text:"Raise the v to V (major) for stronger resolution",correct:true},
     {text:"Lower the III to a minor chord",correct:false},
     {text:"Add a 7th to every chord",correct:false},
     {text:"Replace the i with the VI chord",correct:false},
   ],
   explain:"In natural minor the v is minor (weak pull). Raising the 7th scale degree turns v→V major, creating a powerful pull back to i. This is harmonic minor."},

  {id:"theory-4",category:"🧠 Theory Concepts",
   prompt:"Which chord can often substitute for IV in a major key?",
   choices:[
     {text:"ii",correct:true},
     {text:"iii",correct:false},
     {text:"vi",correct:false},
     {text:"vii°",correct:false},
   ],
   explain:"The ii chord shares two notes with IV, making it a smooth substitute. Swapping IV for ii adds a jazzier, darker color to any progression."},

  {id:"theory-5",category:"🧠 Theory Concepts",
   prompt:"On baritone uke (DGBE), what chord requires zero fingers — all open strings?",
   choices:[
     {text:"Em",correct:false},
     {text:"G",correct:false},
     {text:"Em7 (all 4 open)",correct:true},
     {text:"D",correct:false},
   ],
   explain:"All four open strings on DGBE give you D,G,B,E — which spells Em7. True Em needs just one finger (D string fret 2). G only needs one finger on the E string."},
];

const THEORY_CATEGORIES = [...new Set(THEORY_QS.map(q=>q.category))];

// ── PERSISTENCE ───────────────────────────────────────────────────────────────
const PROGRESS_KEY = "chord-trainer-progress";

function loadProgress(){
  try{
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch{
    return null;
  }
}

function saveProgress(progress){
  try{
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch{
    // localStorage unavailable (private mode, quota, etc.) — state stays in-memory only
  }
}

function todayString(){
  return new Date().toISOString().slice(0,10);
}

// Picks the root of the highest-weighted weak chord entry ("key|position" → key)
function pickDailyKey(weakChordKeys){
  const entries = Object.entries(weakChordKeys||{});
  if(entries.length===0) return "C";
  const [topEntry] = entries.sort(([,a],[,b])=>b-a);
  return topEntry[0].split("|")[0];
}

// ── TIMED REFLEX MODE ─────────────────────────────────────────────────────────
const TIMEOUT_SENTINEL="__timeout__";
const TIMEOUT_CHOICE={text:"(timed out)",correct:false};

// Renders a shrinking bar that fires onTimeout once after `seconds`. The parent
// mounts this only while a question is unanswered — unmounting on answer cancels the timer for free.
function CountdownBar({seconds=8,onTimeout}){
  const [pct,setPct]=useState(100);
  useEffect(()=>{
    const raf=requestAnimationFrame(()=>setPct(0));
    const timer=setTimeout(onTimeout,seconds*1000);
    return ()=>{cancelAnimationFrame(raf);clearTimeout(timer);};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return (
    <div style={S.countdownTrack}>
      <div style={{...S.countdownFill,width:`${pct}%`,transition:`width ${seconds}s linear`}}/>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ChordQuiz(){
  const [fingeringSession,setFingeringSession]=useState(()=>({
    question:buildFingeringQuestion(Object.keys(BARI_CHORDS)),selected:null,
    score:{correct:0,total:0},streak:0,
  }));
  const [tab,setTab]             = useState("circle");
  const [drillSub,setDrillSub]   = useState("chords"); // chords | theory
  const [keysSub,setKeysSub]     = useState("explorer"); // explorer | charts
  const [chartMode,setChartMode] = useState("major");
  const [heatOn,setHeatOn]       = useState(true);
  const [quizMode,setQuizMode]   = useState("major");
  const [question,setQuestion]   = useState(null);
  const [selected,setSelected]   = useState(null);
  const [isCorrect,setIsCorrect] = useState(null);
  const [showFingering,setShowFingering]=useState(false);
  const [score,setScore]         = useState({correct:0,total:0});
  const [streak,setStreak]       = useState(0);
  const [bestStreak,setBestStreak]=useState(0);
  const [weaknessMap,setWeaknessMap]=useState(()=>loadProgress()?.weakChordKeys||{});
  const [weaknesses,setWeaknesses]=useState(()=>{
    const map=loadProgress()?.weakChordKeys||{};
    return Object.entries(map).filter(([,v])=>v>0).sort(([,a],[,b])=>b-a).slice(0,10).map(([k])=>k);
  });
  const [showStreak,setShowStreak]=useState(false);
  const [filter,setFilter]       = useState("all");
  const [highlightKey,setHighlightKey]=useState(null);
  const [openSection,setOpenSection]=useState("progressions");
  // Theory quiz state
  const [theoryQ,setTheoryQ]       = useState(null);
  const [theorySelected,setTheorySelected]=useState(null);
  const [theoryCorrect,setTheoryCorrect]=useState(null);
  const [theoryScore,setTheoryScore]   = useState({correct:0,total:0});
  const [theoryCat,setTheoryCat]   = useState("all");
  const [theoryStreak,setTheoryStreak]=useState(0);
  const [theoryBest,setTheoryBest] = useState(0);
  const [theoryWeakIds,setTheoryWeakIds]=useState(()=>loadProgress()?.weakTheoryIds||[]);
  // Skip-a-Letter drill weakness — persisted now, drill itself lands in a later phase
  const [skipWeakIds,setSkipWeakIds]=useState(()=>loadProgress()?.weakSkipIds||[]);
  // Daily focus key
  const [dailyKey,setDailyKey]=useState(()=>{
    const p=loadProgress();
    return (p?.dailyKeyDate===todayString()) ? p.dailyKey : pickDailyKey(p?.weakChordKeys);
  });
  const [dailyKeyDate,setDailyKeyDate]=useState(()=>{
    const p=loadProgress();
    return (p?.dailyKeyDate===todayString()) ? p.dailyKeyDate : todayString();
  });
  const [sessionCount]=useState(()=>(loadProgress()?.sessionCount||0)+1);
  const [focusKey,setFocusKey]=useState(null);
  // Circle of Fifths state
  const [circleKey,setCircleKey]=useState(null);
  const [circleIsMinor,setCircleIsMinor]=useState(false);
  const [showCircleHelp,setShowCircleHelp]=useState(false);
  const [tooltipDismissed,setTooltipDismissed]=useState(false);
  // Skip-a-Letter drill state
  const [skipQ,setSkipQ]=useState(null);
  const [skipSelected,setSkipSelected]=useState(null);
  const [skipCorrect,setSkipCorrect]=useState(null);
  const [skipScore,setSkipScore]=useState({correct:0,total:0});
  const [skipStreak,setSkipStreak]=useState(0);
  const [skipBest,setSkipBest]=useState(0);
  // Timed reflex mode
  const [timedMode,setTimedMode]=useState(()=>loadProgress()?.timedMode||false);

  useEffect(()=>{
    saveProgress({
      weakChordKeys: weaknessMap,
      weakTheoryIds: theoryWeakIds,
      weakSkipIds: skipWeakIds,
      timedMode,
      dailyKey,
      dailyKeyDate,
      sessionCount,
    });
  },[weaknessMap,theoryWeakIds,skipWeakIds,timedMode,dailyKey,dailyKeyDate,sessionCount]);

  const chart    =quizMode==="major"?MAJOR_CHART:MINOR_CHART;
  const allKeys  =quizMode==="major"?MAJOR_KEYS:MINOR_KEYS;
  const positions=quizMode==="major"?MAJOR_POS:MINOR_POS;

  const filteredKeys=useCallback(()=>{
    if(quizMode==="minor") return allKeys;
    if(filter==="sharps") return allKeys.filter(k=>k.includes("#"));
    if(filter==="flats")  return allKeys.filter(k=>k.includes("b")&&k!=="B");
    if(filter==="naturals")return allKeys.filter(k=>!k.includes("#")&&(!k.includes("b")||k==="B"));
    return allKeys;
  },[filter,quizMode,allKeys]);

  const nextQuestion=useCallback(()=>{
    const keys=focusKey?[focusKey]:filteredKeys();
    let key,position;
    if(!focusKey&&weaknesses.length>0&&Math.random()<0.6){
      const w=weaknesses[Math.floor(Math.random()*weaknesses.length)];
      [key,position]=w.split("|");
      if(!keys.includes(key)) key=keys[Math.floor(Math.random()*keys.length)];
    } else {
      key=keys[Math.floor(Math.random()*keys.length)];
      position=positions[Math.floor(Math.random()*positions.length)];
    }
    const correct=chart[key][position];
    // Build all chord names that appear in this chart as fallback pool
    const allChordNames=[...new Set(allKeys.flatMap(k=>Object.values(chart[k])))];
    const distractors=buildDistractors(correct, allChordNames);
    const choices=shuffle([correct,...distractors]);
    setQuestion({key,position,correct,choices});
    setSelected(null);setIsCorrect(null);setShowFingering(false);
  },[weaknesses,filteredKeys,chart,allKeys,positions,focusKey]);

  useEffect(()=>{if(tab==="drill"&&drillSub==="chords") nextQuestion();},[tab,drillSub,quizMode,focusKey]);

  const handleAnswer=(choice)=>{
    if(selected) return;
    setSelected(choice);
    const correct=choice===question.correct;
    setIsCorrect(correct);
    setScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
    if(correct){
      const ns=streak+1;setStreak(ns);
      if(ns>bestStreak) setBestStreak(ns);
      if(STREAK_MSGS.includes(ns)){setShowStreak(true);setTimeout(()=>setShowStreak(false),1500);}
      const k=`${question.key}|${question.position}`;
      setWeaknessMap(w=>{const u={...w};if(u[k])u[k]=Math.max(0,u[k]-1);return u;});
    } else {
      setStreak(0);
      const k=`${question.key}|${question.position}`;
      setWeaknessMap(w=>{
        const u={...w,[k]:(w[k]||0)+2};
        setWeaknesses(Object.entries(u).filter(([,v])=>v>0).sort(([,a],[,b])=>b-a).slice(0,10).map(([k])=>k));
        return u;
      });
    }
  };

  const accuracy=score.total>0?Math.round(score.correct/score.total*100):0;

  // ── THEORY QUIZ LOGIC ───────────────────────────────────────────────────────
  const nextTheoryQ=useCallback(()=>{
    const pool = theoryCat==="all"
      ? THEORY_QS
      : THEORY_QS.filter(q=>q.category===theoryCat);
    // Weight toward weak questions
    let q;
    if(theoryWeakIds.length>0 && Math.random()<0.6){
      const weakPool=pool.filter(q=>theoryWeakIds.includes(q.id));
      q = weakPool.length>0
        ? weakPool[Math.floor(Math.random()*weakPool.length)]
        : pool[Math.floor(Math.random()*pool.length)];
    } else {
      q = pool[Math.floor(Math.random()*pool.length)];
    }
    // Shuffle choices so correct isn't always in same slot
    const shuffled={...q, choices:shuffle([...q.choices])};
    setTheoryQ(shuffled);
    setTheorySelected(null);
    setTheoryCorrect(null);
  },[theoryCat,theoryWeakIds]);

  useEffect(()=>{if(tab==="drill"&&drillSub==="theory") nextTheoryQ();},[tab,drillSub,theoryCat]);

  const handleTheoryAnswer=(choice)=>{
    if(theorySelected) return;
    setTheorySelected(choice);
    const correct=choice.correct;
    setTheoryCorrect(correct);
    setTheoryScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
    if(correct){
      const ns=theoryStreak+1; setTheoryStreak(ns);
      if(ns>theoryBest) setTheoryBest(ns);
      setTheoryWeakIds(ids=>ids.filter(id=>id!==theoryQ.id));
    } else {
      setTheoryStreak(0);
      setTheoryWeakIds(ids=>ids.includes(theoryQ.id)?ids:[...ids,theoryQ.id]);
    }
  };

  const theoryAccuracy=theoryScore.total>0?Math.round(theoryScore.correct/theoryScore.total*100):0;

  // ── SKIP-A-LETTER DRILL LOGIC ────────────────────────────────────────────────
  const nextSkipQuestion=useCallback(()=>{
    let item;
    if(skipWeakIds.length>0 && Math.random()<0.6){
      const weakPool=SKIP_ITEMS.filter(it=>skipWeakIds.includes(it.root));
      item = weakPool.length>0
        ? weakPool[Math.floor(Math.random()*weakPool.length)]
        : SKIP_ITEMS[Math.floor(Math.random()*SKIP_ITEMS.length)];
    } else {
      item = SKIP_ITEMS[Math.floor(Math.random()*SKIP_ITEMS.length)];
    }
    setSkipQ({...item,choices:buildSkipChoices(item)});
    setSkipSelected(null);
    setSkipCorrect(null);
  },[skipWeakIds]);

  useEffect(()=>{if(tab==="drill"&&drillSub==="skip") nextSkipQuestion();},[tab,drillSub]);

  const handleSkipAnswer=(choice)=>{
    if(skipSelected) return;
    setSkipSelected(choice);
    const correct=choice===skipQ.stack;
    setSkipCorrect(correct);
    setSkipScore(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
    if(correct){
      const ns=skipStreak+1; setSkipStreak(ns);
      if(ns>skipBest) setSkipBest(ns);
      setSkipWeakIds(ids=>ids.filter(id=>id!==skipQ.root));
    } else {
      setSkipStreak(0);
      setSkipWeakIds(ids=>ids.includes(skipQ.root)?ids:[...ids,skipQ.root]);
    }
  };

  const skipAccuracy=skipScore.total>0?Math.round(skipScore.correct/skipScore.total*100):0;

  useEffect(()=>{
    if(selected===TIMEOUT_SENTINEL){const t=setTimeout(nextQuestion,1200);return ()=>clearTimeout(t);}
  },[selected]);
  useEffect(()=>{
    if(theorySelected===TIMEOUT_CHOICE){const t=setTimeout(nextTheoryQ,1200);return ()=>clearTimeout(t);}
  },[theorySelected]);
  useEffect(()=>{
    if(skipSelected===TIMEOUT_SENTINEL){const t=setTimeout(nextSkipQuestion,1200);return ()=>clearTimeout(t);}
  },[skipSelected]);

  // Keys explorer state
  const [keysMode,setKeysMode]   = useState("major"); // major | minor
  const [selectedKey,setSelectedKey] = useState("C");
  const [expandedChord,setExpandedChord] = useState(null);

  const NavBar=()=>(
    <div style={S.navbar}>
      {[["circle","🎵","Circle"],["drill","🎯","Drill"],["fingering","🖐️","Fingering Quiz"],["keys","🗝️","Keys"],["tips","💡","Tips"]].map(([id,icon,label])=>(
        <button key={id} style={{...S.navBtn,...((tab===id||(tab==="clock"&&id==="circle"))?S.navActive:{})}} onClick={()=>setTab(id)}>
          <span style={{fontSize:"16px"}}>{icon}</span>
          <span style={S.navLabel}>{label}</span>
        </button>
      ))}
    </div>
  );

  const DrillSubNav=()=>(
    <>
      <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
        {[["chords","🎯 Chords"],["theory","🧠 Theory"],["skip","🔤 Skip"]].map(([id,label])=>(
          <button key={id} style={{...S.filterBtn,...(drillSub===id?S.filterOn:{}),flex:1,fontSize:"12px",padding:"6px 4px"}} onClick={()=>setDrillSub(id)}>
            {label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"14px"}}>
        <button style={{...S.filterBtn,...(timedMode?S.filterOn:{}),fontSize:"11px"}} onClick={()=>setTimedMode(t=>!t)}>
          ⏱ Timed {timedMode?"ON":"OFF"}
        </button>
      </div>
    </>
  );

  const KeysSubNav=()=>(
    <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
      {[["explorer","🗝️ Explorer"],["charts","📋 Charts"]].map(([id,label])=>(
        <button key={id} style={{...S.filterBtn,...(keysSub===id?S.filterOn:{}),flex:1}} onClick={()=>setKeysSub(id)}>
          {label}
        </button>
      ))}
    </div>
  );

  if(tab==="fingering") return(
    <div className="fingering-page" style={S.page}>
      <FingeringQuiz session={fingeringSession} setSession={setFingeringSession}/>
      <NavBar/>
    </div>
  );

  if(tab==="clock") return(
    <div style={{...S.page,padding:"8px 12px 72px"}}>
      <CircleClockQuiz onBack={()=>setTab("circle")}/>
      <NavBar/>
    </div>
  );

  // CIRCLE OF FIFTHS (home screen)
  if(tab==="circle"){
    const isDailyMinor=MINOR_KEYS.includes(dailyKey);
    const hasWeakData=Object.keys(weaknessMap).length>0;
    const anchorChart=circleKey?(circleIsMinor?MINOR_CHART[circleKey]:MAJOR_CHART[circleKey]):null;
    const anchors=anchorChart
      ? (circleIsMinor?[["i",anchorChart.i],["iv",anchorChart.iv],["v",anchorChart.v]]
                      :[["I",anchorChart.I],["IV",anchorChart.IV],["V",anchorChart.V]])
      : [];
    const tapKey=(key,isMinor)=>{
      setTooltipDismissed(true);
      setCircleKey(prev=>(prev===key&&circleIsMinor===isMinor)?null:key);
      setCircleIsMinor(isMinor);
    };

    return(
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.dailyBanner} onClick={()=>{
            setQuizMode(isDailyMinor?"minor":"major");
            setFocusKey(dailyKey);
            setDrillSub("chords");
            setTab("drill");
          }}>
            <span>Today: <b>{dailyKey} {isDailyMinor?"minor":"major"}</b> — {hasWeakData?"your weakest key":"let's get started"}</span>
            <span style={{opacity:0.6}}>→</span>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"14px",marginBottom:"2px"}}>
            <h1 style={{...S.title,margin:0,fontSize:"22px"}}>🎵 Circle of Fifths</h1>
            <button style={S.helpBtn} onClick={()=>setShowCircleHelp(true)}>❓</button>
          </div>
          <p style={{...S.sub,marginBottom:"10px"}}>Tap a key to see how it connects to its neighbors</p>

          <button style={{...S.outlineBtn,minHeight:"44px"}} onClick={()=>setTab("clock")}>🕒 Clock Position Quiz</button>

          {sessionCount===1&&!tooltipDismissed&&!circleKey&&(
            <div style={S.circleTip} onClick={()=>setTooltipDismissed(true)}>
              💡 Keys next to each other share chords — tap around to see how.
            </div>
          )}

          <CircleOfFifths selectedKey={circleKey} selectedIsMinor={circleIsMinor}
            onTapMajor={(k)=>tapKey(k,false)} onTapMinor={(k)=>tapKey(k,true)}/>

          <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"10px",flexWrap:"wrap"}}>
            <span style={{color:"#c9a84c",fontSize:"11px",fontFamily:"sans-serif"}}>■ Natural</span>
            <span style={{color:"#a78bfa",fontSize:"11px",fontFamily:"sans-serif"}}>■ Sharp</span>
            <span style={{color:"#7eb8f7",fontSize:"11px",fontFamily:"sans-serif"}}>■ Flat</span>
          </div>
        </div>

        <div style={{...S.slideUpPanel,transform:circleKey?"translateY(0)":"translateY(400px)"}}>
          <button style={S.slideUpClose} onClick={()=>setCircleKey(null)}>✕</button>
          {circleKey&&(<>
            <div style={{color:"#f5e6c8",fontSize:"22px",fontWeight:"bold",fontFamily:"'Georgia',serif",marginBottom:"10px"}}>
              {circleKey} {circleIsMinor?"minor":"major"}
            </div>
            <div style={{display:"flex",gap:"10px",marginBottom:"16px"}}>
              {anchors.map(([pos,name])=>(
                <div key={pos} style={S.anchorChip}>
                  <div style={{fontSize:"11px",color:"#6b6b8a"}}>{pos}</div>
                  <div style={{fontSize:"16px",fontWeight:"bold",color:"#f5e6c8"}}>{name}</div>
                </div>
              ))}
            </div>
            <button style={S.startBtn} onClick={()=>{
              setKeysMode(circleIsMinor?"minor":"major");
              setSelectedKey(circleKey);
              setExpandedChord(null);
              setKeysSub("explorer");
              setTab("keys");
            }}>
              Explore this key →
            </button>
          </>)}
        </div>

        {showCircleHelp&&(
          <div style={S.helpOverlay} onClick={()=>setShowCircleHelp(false)}>
            <div style={S.helpCard} onClick={e=>e.stopPropagation()}>
              <h2 style={{...S.title,fontSize:"18px",marginBottom:"10px"}}>Reading the Circle</h2>
              <p style={{color:"#b8b8d0",fontSize:"13px",fontFamily:"sans-serif",lineHeight:1.6,margin:"0 0 10px"}}>
                Each step clockwise raises the key by a perfect fifth. Neighboring keys share most of their notes — that's why chords transfer so easily between them.
              </p>
              <p style={{color:"#b8b8d0",fontSize:"13px",fontFamily:"sans-serif",lineHeight:1.6,margin:0}}>
                Tap any key: the chord one step clockwise lights up as its V, one step counter-clockwise as its IV. The inner ring is each key's relative minor.
              </p>
              <button style={{...S.startBtn,marginTop:"16px",marginBottom:0}} onClick={()=>setShowCircleHelp(false)}>Got it</button>
            </div>
          </div>
        )}

        <NavBar/>
      </div>
    );
  }

  // CHORD QUIZ
  if(tab==="drill"&&drillSub==="chords"&&question){
    const posColor=quizMode==="major"?MAJOR_PC:MINOR_PC;
    return(
      <div style={S.page}>
        {showStreak&&<div style={S.streakBanner}>🔥 {streak} in a row!</div>}
        <div style={S.card}>
          <DrillSubNav/>
          <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
            {["major","minor"].map(m=>(
              <button key={m} style={{...S.filterBtn,...(quizMode===m?S.filterOn:{}),flex:1}} onClick={()=>{setFocusKey(null);setQuizMode(m);}}>
                {m==="major"?"🌞 Major":"🌙 Minor"}
              </button>
            ))}
          </div>
          {focusKey?(
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"10px"}}>
              <span style={S.weakChip}>🎯 Focused on {focusKey}</span>
              <button style={S.peekBtn} onClick={()=>setFocusKey(null)}>Clear focus</button>
            </div>
          ):quizMode==="major"&&(
            <div style={{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}}>
              {["all","naturals","sharps","flats"].map(f=>(
                <button key={f} style={{...S.filterBtn,...(filter===f?S.filterOn:{}),fontSize:"11px",padding:"4px 10px"}} onClick={()=>setFilter(f)}>
                  {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"center",gap:"10px",alignItems:"center",marginBottom:"8px"}}>
            <div style={S.chip}>{score.correct}/{score.total}</div>
            <div style={{...S.chip,color:"#c9a84c"}}>{streak>0?`🔥 ${streak}`:"—"}</div>
          </div>
          <div style={S.progressBar}>
            <div style={{...S.progressFill,width:`${accuracy}%`,background:accuracy>=80?"#4ade80":accuracy>=60?"#facc15":"#f87171"}}/>
          </div>
          {timedMode&&!selected&&(
            <CountdownBar seconds={8} onTimeout={()=>handleAnswer(TIMEOUT_SENTINEL)}/>
          )}
          <div style={{textAlign:"center",marginBottom:"24px"}}>
            <div style={S.qLabel}>What is the</div>
            <div style={{...S.posBadge,color:posColor[question.position]||"#c9a84c",borderColor:posColor[question.position]||"#c9a84c"}}>
              {question.position}
            </div>
            <div style={S.qLabel}>chord in the key of</div>
            <div style={S.keyBig}>{question.key}</div>
            <div style={S.qLabel}>{quizMode} ?</div>
          </div>
          <div style={S.grid2}>
            {question.choices.map(c=>{
              let st=S.choiceBtn;
              if(selected){
                if(c===question.correct) st={...S.choiceBtn,...S.cCorrect};
                else if(c===selected)    st={...S.choiceBtn,...S.cWrong};
                else                     st={...S.choiceBtn,opacity:0.25};
              }
              return <button key={c} style={st} onClick={()=>handleAnswer(c)}>{c}</button>;
            })}
          </div>
          {selected&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
              <div style={{fontSize:"15px",fontWeight:"bold",fontFamily:"sans-serif",color:isCorrect?"#4ade80":"#f87171"}}>
                {isCorrect?"✓ Correct!":selected===TIMEOUT_SENTINEL?`⏳ Time's up — it's ${question.correct}`:`✗ It's ${question.correct}`}
              </div>
              <div style={{display:"flex",gap:"6px"}}>
                {BARI_CHORDS[question.correct]&&(
                  <button style={S.peekBtn} onClick={()=>setShowFingering(f=>!f)}>🖐 {showFingering?"Hide":"Fingering"}</button>
                )}
                <button style={S.peekBtn} onClick={()=>{setHighlightKey(question.key);setChartMode(quizMode);setKeysSub("charts");setTab("keys");}}>See row</button>
                <button style={S.nextBtn} onClick={nextQuestion}>Next →</button>
              </div>
            </div>
          )}

          {showFingering&&BARI_CHORDS[question.correct]&&(
            <div style={{display:"flex",justifyContent:"center",margin:"4px 0 16px"}}>
              <ChordDiagram chordName={question.correct} size="md"/>
            </div>
          )}

          {weaknesses.length>0&&(
            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:"6px",borderTop:"1px solid #2e2e42",paddingTop:"10px"}}>
              <span style={{color:"#6b6b8a",fontSize:"11px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Drilling: </span>
              {weaknesses.slice(0,3).map(w=>{const[k,p]=w.split("|");return<span key={w} style={S.weakChip}>{p} in {k}</span>;})}
            </div>
          )}
        </div>
        <NavBar/>
      </div>
    );
  }

  // THEORY QUIZ
  if(tab==="drill"&&drillSub==="theory"){
    return(
      <div style={S.page}>
        {showStreak&&<div style={S.streakBanner}>🔥 {theoryStreak} in a row!</div>}
        <div style={S.card}>
          <DrillSubNav/>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div style={{...S.chip,fontSize:"11px",color:"#7eb8f7"}}>🧠 Theory</div>
            <div style={S.chip}>{theoryScore.correct}/{theoryScore.total}</div>
            <div style={{...S.chip,color:"#c9a84c"}}>{theoryStreak>0?`🔥 ${theoryStreak}`:"—"}</div>
          </div>

          {/* Accuracy bar */}
          <div style={S.progressBar}>
            <div style={{...S.progressFill,width:`${theoryAccuracy}%`,background:theoryAccuracy>=80?"#4ade80":theoryAccuracy>=60?"#facc15":"#f87171"}}/>
          </div>

          {timedMode&&theoryQ&&!theorySelected&&(
            <CountdownBar seconds={8} onTimeout={()=>handleTheoryAnswer(TIMEOUT_CHOICE)}/>
          )}

          {/* Category filter */}
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
            {["all",...THEORY_CATEGORIES].map(c=>(
              <button key={c}
                style={{...S.filterBtn,...(theoryCat===c?S.filterOn:{}),fontSize:"10px",padding:"4px 10px"}}
                onClick={()=>{setTheoryCat(c);setTheorySelected(null);setTheoryCorrect(null);}}>
                {c==="all"?"All Topics":c}
              </button>
            ))}
          </div>

          {theoryQ&&(<>
            {/* Category badge */}
            <div style={{color:"#6b6b8a",fontSize:"11px",fontFamily:"sans-serif",marginBottom:"8px",textAlign:"center"}}>
              {theoryQ.category}
            </div>

            {/* Question */}
            <div style={{background:"#13131c",borderRadius:"14px",padding:"16px",marginBottom:"16px",border:"1px solid #2a2a3e"}}>
              <p style={{color:"#f5e6c8",fontSize:"16px",fontFamily:"'Georgia',serif",margin:0,lineHeight:1.5,textAlign:"center"}}>
                {theoryQ.prompt}
              </p>
            </div>

            {/* Choices */}
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"14px"}}>
              {theoryQ.choices.map((choice,i)=>{
                let bg="#252533", border="2px solid #3a3a52", color="#f5e6c8";
                if(theorySelected){
                  if(choice.correct){
                    bg="#1a3a2a"; border="2px solid #4ade80"; color="#4ade80";
                  } else if(choice===theorySelected&&!choice.correct){
                    bg="#3a1a1a"; border="2px solid #f87171"; color="#f87171";
                  } else {
                    bg="#1a1a24"; border="2px solid #2a2a3a"; color="#555570";
                  }
                }
                return(
                  <button key={i}
                    style={{background:bg,border,borderRadius:"12px",color,padding:"14px 16px",fontSize:"14px",fontFamily:"sans-serif",cursor:theorySelected?"default":"pointer",textAlign:"left",lineHeight:1.4}}
                    onClick={()=>handleTheoryAnswer(choice)}>
                    {choice.text}
                  </button>
                );
              })}
            </div>

            {/* Explanation + Next */}
            {theorySelected&&(
              <div style={{background:"#13131c",borderRadius:"12px",padding:"14px",marginBottom:"12px",border:`1px solid ${theoryCorrect?"#4ade8044":"#f8717144"}`}}>
                <div style={{fontSize:"15px",fontWeight:"bold",fontFamily:"sans-serif",color:theoryCorrect?"#4ade80":"#f87171",marginBottom:"8px"}}>
                  {theoryCorrect?"✓ Correct!":theorySelected===TIMEOUT_CHOICE?"⏳ Time's up":"✗ Not quite"}
                </div>
                <p style={{color:"#9999bb",fontSize:"13px",fontFamily:"sans-serif",margin:"0 0 12px",lineHeight:1.5}}>
                  {theoryQ.explain}
                </p>
                <button style={S.nextBtn} onClick={nextTheoryQ}>Next →</button>
              </div>
            )}

            {/* Weak spots */}
            {theoryWeakIds.length>0&&(
              <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:"6px",borderTop:"1px solid #2e2e42",paddingTop:"10px"}}>
                <span style={{color:"#6b6b8a",fontSize:"11px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Reviewing: </span>
                <span style={S.weakChip}>{theoryWeakIds.length} question{theoryWeakIds.length>1?"s":""}</span>
              </div>
            )}
          </>)}
        </div>
        <NavBar/>
      </div>
    );
  }

  // SKIP-A-LETTER DRILL
  if(tab==="drill"&&drillSub==="skip"&&skipQ){
    return(
      <div style={S.page}>
        {showStreak&&<div style={S.streakBanner}>🔥 {skipStreak} in a row!</div>}
        <div style={S.card}>
          <DrillSubNav/>
          <div style={{display:"flex",justifyContent:"center",gap:"10px",alignItems:"center",marginBottom:"8px"}}>
            <div style={S.chip}>{skipScore.correct}/{skipScore.total}</div>
            <div style={{...S.chip,color:"#c9a84c"}}>{skipStreak>0?`🔥 ${skipStreak}`:"—"}</div>
          </div>
          <div style={S.progressBar}>
            <div style={{...S.progressFill,width:`${skipAccuracy}%`,background:skipAccuracy>=80?"#4ade80":skipAccuracy>=60?"#facc15":"#f87171"}}/>
          </div>
          {timedMode&&!skipSelected&&(
            <CountdownBar seconds={8} onTimeout={()=>handleSkipAnswer(TIMEOUT_SENTINEL)}/>
          )}
          <div style={{textAlign:"center",marginBottom:"20px"}}>
            <div style={S.qLabel}>Stack this chord in thirds</div>
            <div style={S.keyBig}>{skipQ.label}</div>
          </div>
          <div style={S.grid2}>
            {skipQ.choices.map(c=>{
              let st={...S.choiceBtn,fontSize:"15px"};
              if(skipSelected){
                if(c===skipQ.stack) st={...st,...S.cCorrect};
                else if(c===skipSelected) st={...st,...S.cWrong};
                else st={...st,opacity:0.25};
              }
              return <button key={c} style={st} onClick={()=>handleSkipAnswer(c)}>{c}</button>;
            })}
          </div>
          {skipSelected&&(
            <div style={{marginBottom:"12px"}}>
              <div style={{fontSize:"15px",fontWeight:"bold",fontFamily:"sans-serif",color:skipCorrect?"#4ade80":"#f87171",marginBottom:"10px"}}>
                {skipCorrect?"✓ Correct!":skipSelected===TIMEOUT_SENTINEL?"⏳ Time's up":"✗ Not quite"}
              </div>
              {!skipCorrect&&(
                <div style={{background:"#13131c",borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1px solid #f8717144"}}>
                  <div style={{fontSize:"20px",fontFamily:"'Georgia',serif",textAlign:"center",letterSpacing:"2px",marginBottom:"8px"}}>
                    {skipQ.spanLetters.map((L,i)=>(
                      <span key={i} style={{margin:"0 4px",color:i%2===0?"#4ade80":"#555570",textDecoration:i%2===0?"none":"line-through"}}>{L}</span>
                    ))}
                  </div>
                  <p style={{color:"#9999bb",fontSize:"13px",fontFamily:"sans-serif",margin:0,textAlign:"center"}}>
                    Skip a letter each time: <b style={{color:"#f5e6c8"}}>{skipQ.stack}</b>
                  </p>
                </div>
              )}
              <button style={S.nextBtn} onClick={nextSkipQuestion}>Next →</button>
            </div>
          )}
          {skipWeakIds.length>0&&(
            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:"6px",borderTop:"1px solid #2e2e42",paddingTop:"10px"}}>
              <span style={{color:"#6b6b8a",fontSize:"11px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Drilling: </span>
              <span style={S.weakChip}>{skipWeakIds.length} chord{skipWeakIds.length>1?"s":""}</span>
            </div>
          )}
        </div>
        <NavBar/>
      </div>
    );
  }

  // KEYS EXPLORER
  if(tab==="keys"&&keysSub==="explorer"){
    const isMajor = keysMode==="major";
    const chart   = isMajor ? MAJOR_CHART : MINOR_CHART;
    const keyList = Object.keys(chart);
    const posList = isMajor ? MAJOR_POS : MINOR_POS;
    const posColor= isMajor ? MAJOR_PC  : MINOR_PC;
    const heatMap = isMajor ? MAJOR_HEAT: MINOR_HEAT;
    const keyChords = chart[selectedKey] || {};

    // Ensure selectedKey is valid for current mode
    const validKey = keyList.includes(selectedKey) ? selectedKey : keyList[0];
    if(validKey !== selectedKey) setSelectedKey(validKey);

    return(
      <div style={S.page}>
        <div style={S.card}>
          <KeysSubNav/>
          <div style={{fontSize:"28px",textAlign:"center",marginBottom:"6px"}}>🗝️</div>
          <h1 style={{...S.title,fontSize:"22px",marginBottom:"4px"}}>Key Explorer</h1>
          <p style={{...S.sub,marginBottom:"12px"}}>Pick a key · see every chord + fingering</p>

          {/* Major / Minor toggle */}
          <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
            {["major","minor"].map(m=>(
              <button key={m} style={{...S.modeBtn,...(keysMode===m?S.modeBtnOn:{}),flex:1}}
                onClick={()=>{
                  setKeysMode(m);
                  setExpandedChord(null);
                  setSelectedKey(m==="major"?"C":"Am");
                }}>
                {m==="major"?"🌞 Major":"🌙 Minor"}
              </button>
            ))}
          </div>

          {/* Key selector — scrollable pill row */}
          <div style={{overflowX:"auto",marginBottom:"14px",paddingBottom:"4px"}}>
            <div style={{display:"flex",gap:"6px",width:"max-content"}}>
              {keyList.map(k=>(
                <button key={k}
                  style={{
                    background: k===validKey ? "#c9a84c" : "#252533",
                    color:      k===validKey ? "#0f0f14" : "#8888aa",
                    border:     k===validKey ? "1px solid #c9a84c" : "1px solid #3a3a52",
                    borderRadius:"20px",
                    padding:"6px 14px",
                    fontSize:"13px",
                    fontWeight: k===validKey ? "bold" : "normal",
                    fontFamily:"'Georgia',serif",
                    cursor:"pointer",
                    whiteSpace:"nowrap",
                  }}
                  onClick={()=>{setSelectedKey(k);setExpandedChord(null);}}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Key heading */}
          <div style={{background:"#13131c",borderRadius:"12px",padding:"12px 16px",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{color:"#f5e6c8",fontSize:"22px",fontWeight:"bold",fontFamily:"'Georgia',serif"}}>
                {validKey} {isMajor?"major":"minor"}
              </div>
              <div style={{color:"#6b6b8a",fontSize:"11px",fontFamily:"sans-serif",marginTop:"2px"}}>
                {posList.map((p,i)=>(
                  <span key={p}>
                    <span style={{color:posColor[p]||"#aaa"}}>{p}</span>
                    {i<posList.length-1?" · ":""}
                  </span>
                ))}
              </div>
            </div>
            <div style={{color:"#c9a84c",fontSize:"11px",fontFamily:"sans-serif",textAlign:"right"}}>
              {isMajor ? "I ii iii IV V vi vii°" : "i ii° III iv v VI VII"}
            </div>
          </div>

          {/* Chord cards — one per position */}
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {posList.map(pos=>{
              const chordName = keyChords[pos];
              const heat      = heatMap[pos]||1;
              const hc        = HEAT_COLOR(heat);
              const isExpanded= expandedChord===pos;
              const hasDiag   = !!BARI_CHORDS[chordName];

              return(
                <div key={pos}
                  style={{
                    background: isExpanded ? "#0f0f14" : "#13131c",
                    border:`1px solid ${isExpanded?"#c9a84c55":hc.border}`,
                    borderRadius:"12px",
                    overflow:"hidden",
                    cursor: hasDiag ? "pointer" : "default",
                  }}
                  onClick={()=>hasDiag&&setExpandedChord(isExpanded?null:pos)}
                >
                  {/* Row header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      {/* Position badge */}
                      <div style={{
                        background:"#252533",
                        color:posColor[pos]||"#c9a84c",
                        borderRadius:"8px",
                        padding:"3px 10px",
                        fontSize:"13px",
                        fontFamily:"'Georgia',serif",
                        fontWeight:"bold",
                        minWidth:"36px",
                        textAlign:"center",
                        border:`1px solid ${posColor[pos]||"#c9a84c"}44`,
                      }}>{pos}</div>
                      {/* Chord name */}
                      <div style={{color:"#f5e6c8",fontSize:"18px",fontWeight:"bold",fontFamily:"'Georgia',serif"}}>
                        {chordName}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      {/* Heat badge */}
                      {heat>=4&&<div style={{background:hc.bg,border:`1px solid ${hc.border}`,borderRadius:"10px",padding:"2px 8px",fontSize:"10px",color:hc.text,fontFamily:"sans-serif"}}>
                        {heat===5?"🔥 Essential":"⭐ Common"}
                      </div>}
                      {hasDiag
                        ? <span style={{color:"#555570",fontSize:"14px"}}>{isExpanded?"▲":"▼"}</span>
                        : <span style={{color:"#333350",fontSize:"10px",fontFamily:"sans-serif"}}>no diagram</span>
                      }
                    </div>
                  </div>

                  {/* Expanded chord diagram */}
                  {isExpanded&&hasDiag&&(
                    <div style={{borderTop:"1px solid #2a2a3e",padding:"14px",display:"flex",justifyContent:"center",background:"#0a0a12"}}>
                      <ChordDiagram chordName={chordName} size="lg"/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{marginTop:"18px"}}>
            <div style={S.sectionLabel}>Sounds like</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {(isMajor?PROGRESSION_TEMPLATES.major:PROGRESSION_TEMPLATES.minor).map((tpl,i)=>(
                <div key={i} style={{background:"#13131c",border:"1px solid #2a2a3e",borderRadius:"12px",padding:"12px 14px"}}>
                  <div style={{color:"#c9a84c",fontSize:"13px",fontWeight:"bold",fontFamily:"'Georgia',serif",marginBottom:"4px"}}>
                    {tpl.roman.join("–")} in {validKey} {isMajor?"major":"minor"}
                  </div>
                  <div style={{color:"#8888aa",fontSize:"12px",fontFamily:"sans-serif",marginBottom:"6px"}}>
                    {tpl.roman.map(r=>keyChords[r]).join(" – ")}
                  </div>
                  <div style={{color:"#7777aa",fontSize:"12px",fontFamily:"sans-serif",lineHeight:1.5}}>{tpl.mood}</div>
                </div>
              ))}
            </div>
          </div>

          <p style={{color:"#444460",fontSize:"10px",fontFamily:"sans-serif",textAlign:"center",marginTop:"12px"}}>
            Tap any chord to show fingering · 🔥 = essential chord for this key
          </p>
        </div>
        <NavBar/>
      </div>
    );
  }

  // CHARTS
  if(tab==="keys"&&keysSub==="charts"){
    const isMajor=chartMode==="major";
    const displayChart=isMajor?MAJOR_CHART:MINOR_CHART;
    const displayKeys=isMajor?MAJOR_KEYS:MINOR_KEYS;
    const displayPos=isMajor?MAJOR_POS:MINOR_POS;
    const posColor=isMajor?MAJOR_PC:MINOR_PC;
    const heatMap=isMajor?MAJOR_HEAT:MINOR_HEAT;
    return(
      <div style={S.page}>
        <div style={{...S.card,padding:"16px 10px"}}>
          <KeysSubNav/>
          <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
            {["major","minor"].map(m=>(
              <button key={m} style={{...S.modeBtn,...(chartMode===m?S.modeBtnOn:{}),flex:1}}
                onClick={()=>{setChartMode(m);setHighlightKey(null);}}>
                {m==="major"?"🌞 Major":"🌙 Minor"}
              </button>
            ))}
          </div>
          <h2 style={{color:"#f5e6c8",fontSize:"18px",textAlign:"center",margin:"0 0 4px",fontFamily:"'Georgia',serif"}}>
            {isMajor?"Major":"Natural Minor"} Key Chord Chart
          </h2>
          <p style={{color:"#6b6b8a",fontSize:"11px",textAlign:"center",margin:"0 0 8px",fontFamily:"sans-serif"}}>Tap a row to highlight</p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:"10px"}}>
            <button style={{...S.filterBtn,...(heatOn?S.filterOn:{})}} onClick={()=>setHeatOn(h=>!h)}>
              {heatOn?"🔥 Popularity ON":"🔥 Popularity OFF"}
            </button>
          </div>
          <div style={S.chartRow}>
            <div style={{...S.chartCell,...S.chartKeyCell,color:"#6b6b8a",fontSize:"10px"}}>KEY</div>
            {displayPos.map(p=>(
              <div key={p} style={{...S.chartCell,color:posColor[p]||"#aaa",fontWeight:"bold",fontSize:"10px",fontFamily:"'Georgia',serif"}}>{p}</div>
            ))}
          </div>
          {displayKeys.map(key=>{
            const hl=highlightKey===key;
            const hasWeak=weaknesses.some(w=>w.startsWith(key+"|"));
            return(
              <div key={key}
                style={{...S.chartRow,background:hl?"#1e1e0e":"transparent",borderRadius:"8px",border:hl?"1px solid #c9a84c55":"1px solid transparent",cursor:"pointer",marginBottom:"2px"}}
                onClick={()=>setHighlightKey(hl?null:key)}
              >
                <div style={{...S.chartCell,...S.chartKeyCell,color:hasWeak?"#f87171":"#f5e6c8",fontWeight:"bold"}}>
                  {key}{hasWeak?"⚠":""}
                </div>
                {displayPos.map(p=>{
                  const wk=weaknesses.includes(`${key}|${p}`);
                  const heat=heatMap[p]||1;
                  const hc=HEAT_COLOR(heat);
                  return(
                    <div key={p} style={{...S.chartCell,background:heatOn&&!wk?hc.bg:"transparent",border:heatOn&&!wk?`1px solid ${hc.border}`:"1px solid transparent",borderRadius:"5px",color:wk?"#f87171":hl?(posColor[p]||"#c9a84c"):heatOn?hc.text:"#b8b8d0",fontWeight:hl||heat>=4?"bold":"normal",fontSize:"10px"}}>
                      {displayChart[key][p]}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{marginTop:"12px",display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center"}}>
            {(isMajor?[["#c9a84c","Major"],["#7eb8f7","minor"],["#a78bfa","dim"]]:
                       [["#7eb8f7","minor"],["#c9a84c","Major"],["#a78bfa","dim°"]]).map(([c,l])=>(
              <span key={l} style={{color:c,fontSize:"11px",fontFamily:"sans-serif"}}>■ {l}</span>
            ))}
            <span style={{color:"#f87171",fontSize:"11px",fontFamily:"sans-serif"}}>⚠ weak</span>
          </div>
        </div>
        <NavBar/>
      </div>
    );
  }

  // CHORD DIAGRAMS
  // CHEAT SHEET
  if(tab==="tips") return(
    <div style={S.page}>
      <div style={S.card}>
        <div style={{fontSize:"30px",textAlign:"center",marginBottom:"6px"}}>💡</div>
        <h1 style={{...S.title,fontSize:"24px",marginBottom:"4px"}}>Theory Cheat Sheet</h1>
        <p style={S.sub}>Tap a section to expand</p>
        {CHEAT_SECTIONS.map(section=>{
          const isOpen=openSection===section.id;
          return(
            <div key={section.id} style={{marginBottom:"10px"}}>
              <button style={{width:"100%",background:isOpen?"#1e1e2e":"#13131c",border:`1px solid ${isOpen?section.color+"66":"#2e2e42"}`,borderRadius:"12px",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}
                onClick={()=>setOpenSection(isOpen?null:section.id)}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{fontSize:"20px"}}>{section.emoji}</span>
                  <span style={{color:isOpen?section.color:"#c8c8e0",fontSize:"15px",fontWeight:"bold",fontFamily:"'Georgia',serif"}}>{section.title}</span>
                </div>
                <span style={{color:"#6b6b8a",fontSize:"16px"}}>{isOpen?"▲":"▼"}</span>
              </button>
              {isOpen&&(
                <div style={{marginTop:"8px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {section.cards.map((card,i)=>(
                    <div key={i} style={{background:"#13131c",border:"1px solid #2a2a3e",borderRadius:"12px",padding:"14px 16px",borderLeft:`3px solid ${card.tagColor}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                        <span style={{color:"#f5e6c8",fontSize:"14px",fontWeight:"bold",fontFamily:"'Georgia',serif"}}>{card.label}</span>
                        <span style={{background:card.tagColor+"22",color:card.tagColor,borderRadius:"20px",padding:"2px 8px",fontSize:"10px",fontFamily:"sans-serif",whiteSpace:"nowrap",marginLeft:"8px"}}>{card.tag}</span>
                      </div>
                      <div style={{color:card.tagColor,fontSize:"15px",fontWeight:"bold",fontFamily:"'Georgia',serif",marginBottom:"6px",lineHeight:1.4,whiteSpace:"pre-line"}}>{card.content}</div>
                      <div style={{color:"#7777aa",fontSize:"12px",fontFamily:"sans-serif",lineHeight:1.5}}>{card.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <NavBar/>
    </div>
  );

  return null;
}

const S={
  page:{minHeight:"100vh",background:"#0f0f14",display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 16px 80px",fontFamily:"'Georgia',serif"},
  card:{background:"#1a1a24",borderRadius:"20px",padding:"24px 20px",width:"100%",maxWidth:"480px",border:"1px solid #2e2e42"},
  title:{fontSize:"28px",fontWeight:"bold",color:"#f5e6c8",margin:"0 0 6px",lineHeight:1.2,textAlign:"center"},
  sub:{color:"#6b6b8a",fontSize:"13px",margin:"0 0 20px",fontFamily:"sans-serif",textAlign:"center"},
  sectionLabel:{color:"#6b6b8a",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px",fontFamily:"sans-serif",marginBottom:"8px"},
  modeBtn:{flex:1,background:"#252533",border:"1px solid #3a3a52",borderRadius:"12px",color:"#8888aa",padding:"10px",fontSize:"14px",cursor:"pointer",fontFamily:"sans-serif"},
  modeBtnOn:{background:"#1e2a1e",border:"1px solid #4a7a4a",color:"#c9a84c",fontWeight:"bold"},
  filterRow:{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",marginBottom:"16px"},
  filterBtn:{background:"#252533",border:"1px solid #3a3a52",borderRadius:"20px",color:"#8888aa",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontFamily:"sans-serif"},
  filterOn:{background:"#c9a84c",border:"1px solid #c9a84c",color:"#0f0f14",fontWeight:"bold"},
  startBtn:{width:"100%",background:"#c9a84c",color:"#0f0f14",border:"none",borderRadius:"14px",padding:"17px",fontSize:"18px",fontWeight:"bold",cursor:"pointer",fontFamily:"'Georgia',serif",marginBottom:"10px"},
  outlineBtn:{width:"100%",background:"transparent",color:"#c9a84c",border:"1px solid #c9a84c44",borderRadius:"14px",padding:"12px",fontSize:"14px",cursor:"pointer",fontFamily:"sans-serif",marginBottom:"8px"},
  lastScore:{color:"#6b6b8a",fontSize:"12px",fontFamily:"sans-serif",textAlign:"center"},
  chip:{background:"#252533",color:"#f5e6c8",borderRadius:"20px",padding:"4px 10px",fontSize:"12px",fontFamily:"sans-serif"},
  progressBar:{height:"4px",background:"#252533",borderRadius:"2px",marginBottom:"22px",overflow:"hidden"},
  progressFill:{height:"100%",borderRadius:"2px",transition:"width 0.4s ease"},
  qLabel:{color:"#8888aa",fontSize:"15px",fontFamily:"sans-serif",margin:"3px 0"},
  posBadge:{display:"inline-block",background:"#252533",border:"2px solid",borderRadius:"12px",padding:"8px 24px",fontSize:"26px",fontWeight:"bold",fontFamily:"'Georgia',serif",margin:"7px 0",letterSpacing:"1px"},
  keyBig:{display:"inline-block",color:"#f5e6c8",fontSize:"40px",fontWeight:"bold",fontFamily:"'Georgia',serif",margin:"4px 0"},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"},
  choiceBtn:{background:"#252533",border:"2px solid #3a3a52",borderRadius:"14px",color:"#f5e6c8",padding:"16px 12px",fontSize:"19px",fontWeight:"bold",cursor:"pointer",fontFamily:"'Georgia',serif"},
  cCorrect:{background:"#1a3a2a",border:"2px solid #4ade80",color:"#4ade80"},
  cWrong:{background:"#3a1a1a",border:"2px solid #f87171",color:"#f87171"},
  peekBtn:{background:"#252533",color:"#c9a84c",border:"1px solid #c9a84c44",borderRadius:"10px",padding:"8px 10px",fontSize:"12px",cursor:"pointer",fontFamily:"sans-serif"},
  nextBtn:{background:"#c9a84c",color:"#0f0f14",border:"none",borderRadius:"10px",padding:"10px 18px",fontSize:"14px",fontWeight:"bold",cursor:"pointer",fontFamily:"sans-serif"},
  weakChip:{background:"#2a1f10",border:"1px solid #5a3f1a",color:"#c9a84c",borderRadius:"8px",padding:"2px 8px",fontSize:"11px",fontFamily:"sans-serif"},
  streakBanner:{position:"fixed",top:"20px",left:"50%",transform:"translateX(-50%)",background:"#c9a84c",color:"#0f0f14",borderRadius:"20px",padding:"10px 24px",fontSize:"18px",fontWeight:"bold",fontFamily:"sans-serif",zIndex:100,boxShadow:"0 4px 20px rgba(201,168,76,0.4)"},
  chartRow:{display:"grid",gridTemplateColumns:"34px repeat(7, 1fr)",gap:"2px",padding:"3px 4px"},
  chartCell:{textAlign:"center",padding:"5px 1px",fontSize:"10px",fontFamily:"sans-serif",color:"#b8b8d0"},
  chartKeyCell:{fontFamily:"'Georgia',serif",fontSize:"12px",textAlign:"left",paddingLeft:"2px"},
  navbar:{position:"fixed",bottom:0,left:0,right:0,background:"#13131c",borderTop:"1px solid #2e2e42",display:"flex",justifyContent:"space-around",padding:"6px 0 12px",zIndex:50},
  navBtn:{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"4px 8px",opacity:0.35},
  navActive:{opacity:1},
  navLabel:{fontSize:"9px",color:"#f5e6c8",fontFamily:"sans-serif",letterSpacing:"0.3px"},
  dailyBanner:{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1e1a0e",border:"1px solid #5a4a1a",borderRadius:"12px",padding:"10px 14px",color:"#f5d97a",fontSize:"13px",fontFamily:"sans-serif",cursor:"pointer"},
  helpBtn:{background:"#252533",border:"1px solid #3a3a52",borderRadius:"50%",color:"#c9a84c",width:"30px",height:"30px",fontSize:"14px",cursor:"pointer",fontFamily:"sans-serif"},
  circleTip:{background:"#13202e",border:"1px solid #2a5070",color:"#9dc8f0",fontSize:"12px",fontFamily:"sans-serif",borderRadius:"10px",padding:"10px 12px",marginBottom:"10px",cursor:"pointer",lineHeight:1.4},
  slideUpPanel:{position:"fixed",left:"50%",bottom:"70px",width:"calc(100% - 32px)",maxWidth:"448px",marginLeft:"-224px",background:"#1a1a24",border:"1px solid #c9a84c44",borderRadius:"18px",padding:"20px",boxShadow:"0 -8px 30px rgba(0,0,0,0.5)",transition:"transform 0.25s ease",zIndex:60},
  slideUpClose:{position:"absolute",top:"12px",right:"14px",background:"none",border:"none",color:"#6b6b8a",fontSize:"16px",cursor:"pointer"},
  anchorChip:{flex:1,background:"#13131c",border:"1px solid #2e2e42",borderRadius:"10px",padding:"8px",textAlign:"center"},
  helpOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:80,padding:"20px"},
  helpCard:{background:"#1a1a24",border:"1px solid #2e2e42",borderRadius:"16px",padding:"20px",maxWidth:"360px"},
  countdownTrack:{height:"4px",background:"#252533",borderRadius:"2px",overflow:"hidden",marginBottom:"14px"},
  countdownFill:{height:"100%",background:"#c9a84c"},
};

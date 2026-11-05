// =====================================================================
//  music.js  -  SC-05 "Uber World, Part One": music and sound effects
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    UberSounds.race(seconds)   our own fast 8-bit RACING tune
//    UberSounds.raceOff(s)      fade the racing tune away over s seconds
//    UberSounds.screech()       tyres squealing as a car brakes
//    UberSounds.pop(n)          a passenger pops in (n = 0, 1... each higher)
//    UberSounds.rev()           VROOM VROOM! an engine revving up
//    UberSounds.ding(n)         a bright little "ding" (window lights up)
//    UberSounds.pinball()       pinball machine: ding-ding-ding-DING!
//    UberSounds.lullaby(secs)   Brahms' Lullaby, on a soft music box
//    UberSounds.lullabyOff(s)   fade the lullaby away
//    UberSounds.cafe(secs)      our own bouncy, happy "patisserie" tune
//    UberSounds.cafeOff(s)      fade it away
//    UberSounds.whoosh()        something flying past
//    UberSounds.catchIt()       "thup!" + a happy little "ta-da"
//
//  ABOUT THE TUNES
//    The racing tune and the patisserie tune are our OWN, written for
//    this episode.
//    Brahms' Lullaby ("Wiegenlied") was written in 1868, so it is long
//    out of copyright: anyone may play it. We play it from the notes,
//    so there's no recording involved either.
//
//  TO CHANGE A TUNE: each tune is a list of [note, beats] pairs. Change
//  the notes or the beats; BEAT (seconds per beat) sets the speed.
// =====================================================================

const UberSounds = (() => {
  let ctx = null;          // the audio engine (shared with the other scenes)
  let out = null;          // volume knob for the sound effects
  let raceVol = null;      // volume knob for the racing tune
  let lullVol = null;      // volume knob for the lullaby
  let cafeVol = null;      // volume knob for the patisserie tune

  function wake() {
    // One shared audio engine for the whole page (iPad only lets a tap
    // switch sound on, so "Play all" reuses the one the Play tap started).
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (!out) { out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination); }
  }

  // Note names -> pitch in Hz. Each octave up doubles the number.
  const HZ = {};
  const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
  for (let octave = 1; octave <= 6; octave++) {
    NAMES.forEach((n, i) => { HZ[n + octave] = 440 * Math.pow(2, (octave - 4) + (i - 9) / 12); });
  }

  // ---- One note --------------------------------------------------------
  // when: seconds from now;  length: seconds;  vol: loudness;  to: knob
  function note(name, when, length, type, vol, to) {
    if (name === "-") return;                       // "-" = a rest (silence)
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = HZ[name];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(vol * 0.3, t + length * 0.9);
    g.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(g).connect(to);
    osc.start(t); osc.stop(t + length + 0.02);
  }

  // A tiny burst of hiss = a drum ("tss" for hi-hat, "dum" when low)
  function drum(when, high, vol, to) {
    const t = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buffer;
    const f = ctx.createBiquadFilter();
    f.type = high ? "highpass" : "lowpass"; f.frequency.value = high ? 6000 : 200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (high ? 0.05 : 0.08));
    src.connect(f).connect(g).connect(to);
    src.start(t);
  }

  // ---- THE RACING TUNE (our own) -------------------------------------
  // Fast (150 beats a minute), in A minor, with a bass that jumps up
  // and down an octave on every half-beat: the classic "chase" sound.
  const RACE_BEAT = 0.4;
  // Each bar: the bass note for the bar, then the tune's [note, beats]
  const RACE = [
    ["A2", [["A4", 0.5], ["C5", 0.5], ["E5", 0.5], ["A5", 0.5], ["G5", 1], ["E5", 1]]],
    ["F2", [["F5", 0.5], ["E5", 0.5], ["D5", 0.5], ["C5", 0.5], ["D5", 1], ["A4", 1]]],
    ["G2", [["G4", 0.5], ["B4", 0.5], ["D5", 0.5], ["G5", 0.5], ["F5", 1], ["D5", 1]]],
    ["E2", [["E5", 0.5], ["D5", 0.5], ["C5", 0.5], ["B4", 0.5], ["G#4", 2]]],
    ["A2", [["A4", 0.5], ["C5", 0.5], ["E5", 0.5], ["A5", 0.5], ["B5", 1], ["A5", 1]]],
    ["F2", [["C6", 0.5], ["B5", 0.5], ["A5", 0.5], ["F5", 0.5], ["A5", 1], ["F5", 1]]],
    ["E2", [["E5", 0.5], ["F5", 0.5], ["E5", 0.5], ["D5", 0.5], ["B4", 0.5], ["G#4", 0.5], ["E4", 1]]],
    ["A2", [["A4", 1], ["E5", 0.5], ["A5", 0.5], ["A5", 2]]],
  ];

  function raceBar(t, [bass, tune]) {
    const up = bass.slice(0, -1) + (Number(bass.slice(-1)) + 1);   // same note, an octave up
    for (let i = 0; i < 8; i++) {
      note(i % 2 ? up : bass, t + i * RACE_BEAT / 2, RACE_BEAT / 2 * 0.8, "triangle", 0.3, raceVol);
      drum(t + i * RACE_BEAT / 2, true, 0.12, raceVol);              // tss tss tss
      if (i % 4 === 0) drum(t + i * RACE_BEAT / 2, false, 0.6, raceVol);  // dum on beats 1 and 3
    }
    let x = t;
    for (const [n, beats] of tune) {
      note(n, x, beats * RACE_BEAT * 0.85, "square", 0.07, raceVol);
      x += beats * RACE_BEAT;
    }
    return 4 * RACE_BEAT;
  }

  // ---- BRAHMS' LULLABY (1868) ------------------------------------------
  // In 3/4 time (3 beats a bar), slow and gentle.
  const LULL_BEAT = 0.55;
  const LULLABY = [
    ["E4", 0.5], ["E4", 0.5], ["G4", 2], ["E4", 0.5], ["E4", 0.5], ["G4", 2],
    ["E4", 0.5], ["G4", 0.5], ["C5", 1], ["B4", 1.5], ["A4", 0.5], ["A4", 1], ["G4", 1],
    ["D4", 0.5], ["E4", 0.5], ["F4", 1], ["D4", 1], ["D4", 0.5], ["E4", 0.5], ["F4", 2],
    ["D4", 0.5], ["F4", 0.5], ["B4", 0.5], ["A4", 0.5], ["G4", 1], ["B4", 1], ["C5", 2],
    ["C4", 0.5], ["C4", 0.5], ["C5", 2], ["A4", 0.5], ["F4", 0.5], ["G4", 2],
    ["E4", 0.5], ["C4", 0.5], ["F4", 1], ["G4", 1], ["A4", 1], ["G4", 2],
    ["C4", 0.5], ["C4", 0.5], ["C5", 2], ["A4", 0.5], ["F4", 0.5], ["G4", 2],
    ["E4", 0.5], ["C4", 0.5], ["F4", 1], ["E4", 0.5], ["D4", 0.5], ["C4", 3],
  ];
  // Soft low notes underneath, one per bar (3 beats), following the tune
  const LULL_BASS = ["C3", "C3", "C3", "G2", "G2", "G2", "C3", "F2", "C3", "G2", "C3", "F2", "C3", "G2", "C3", "C3"];

  // ---- THE PATISSERIE TUNE (our own) ---------------------------------
  // Bouncy and happy, in C major: an "oom-pah" bass (low note, then a
  // chord-ish note on the off-beat) and a skipping tune on top.
  const CAFE_BEAT = 0.3;
  const CAFE = [
    [["C3", "G3"], [["E5", 0.5], ["G5", 0.5], ["C6", 1], ["B5", 0.5], ["G5", 0.5], ["E5", 1]]],
    [["F2", "A3"], [["F5", 0.5], ["A5", 0.5], ["C6", 1], ["A5", 1], ["F5", 1]]],
    [["G2", "B3"], [["D5", 0.5], ["G5", 0.5], ["B5", 1], ["A5", 0.5], ["G5", 0.5], ["F5", 1]]],
    [["C3", "G3"], [["E5", 1], ["C5", 1], ["G4", 1], ["-", 1]]],
    [["A2", "E3"], [["C5", 0.5], ["E5", 0.5], ["A5", 1], ["G5", 0.5], ["E5", 0.5], ["C5", 1]]],
    [["D3", "F3"], [["D5", 0.5], ["F5", 0.5], ["A5", 1], ["G5", 1], ["F5", 1]]],
    [["G2", "B3"], [["G5", 0.5], ["F5", 0.5], ["E5", 0.5], ["D5", 0.5], ["B4", 1], ["D5", 1]]],
    [["C3", "G3"], [["C5", 1], ["G5", 0.5], ["E5", 0.5], ["C5", 2]]],
  ];

  function cafeBar(t, [[low, high], tune]) {
    for (let beat = 0; beat < 4; beat++) {
      note(low, t + beat * CAFE_BEAT, CAFE_BEAT * 0.5, "triangle", 0.35, cafeVol);          // oom
      note(high, t + (beat + 0.5) * CAFE_BEAT, CAFE_BEAT * 0.4, "square", 0.04, cafeVol);   // pah
      drum(t + (beat + 0.5) * CAFE_BEAT, true, 0.06, cafeVol);
    }
    let x = t;
    for (const [n, beats] of tune) {
      note(n, x, beats * CAFE_BEAT * 0.8, "square", 0.06, cafeVol);
      x += beats * CAFE_BEAT;
    }
    return 4 * CAFE_BEAT;
  }

  return {
    cafe(seconds = 25) {
      wake();
      if (cafeVol) cafeVol.disconnect();
      cafeVol = ctx.createGain(); cafeVol.gain.value = 0.75; cafeVol.connect(ctx.destination);
      let t = 0.05, i = 0;
      while (t < seconds) t += cafeBar(t, CAFE[i++ % CAFE.length]);
    },

    cafeOff(seconds = 2) {
      if (!cafeVol) return;
      cafeVol.gain.setValueAtTime(cafeVol.gain.value, ctx.currentTime);
      cafeVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // WHOOSH: a puff of hiss that rises then falls, quick
    whoosh() {
      wake();
      const t = ctx.currentTime;
      const n = Math.floor(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2;
      f.frequency.setValueAtTime(400, t);
      f.frequency.exponentialRampToValueAtTime(2500, t + 0.2);
      f.frequency.exponentialRampToValueAtTime(600, t + 0.45);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
      src.connect(f).connect(g).connect(out);
      src.start(t);
    },

    // Caught it! A soft "thup", then a quick happy ta-da
    catchIt() {
      wake();
      drum(0, false, 1.0, out);
      ["C5", "E5", "G5"].forEach((n, i) => note(n, 0.12 + i * 0.08, 0.15, "square", 0.08, out));
      note("C6", 0.4, 0.6, "square", 0.09, out);
      note("C5", 0.4, 0.6, "triangle", 0.3, out);
    },

    race(seconds = 25) {
      wake();
      if (raceVol) raceVol.disconnect();
      raceVol = ctx.createGain(); raceVol.gain.value = 0.7; raceVol.connect(ctx.destination);
      let t = 0.05, i = 0;
      while (t < seconds) t += raceBar(t, RACE[i++ % RACE.length]);
    },

    raceOff(seconds = 2) {
      if (!raceVol) return;
      raceVol.gain.setValueAtTime(raceVol.gain.value, ctx.currentTime);
      raceVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // Tyres squealing: a high whistle that wobbles and slides down
    screech() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.6);
      const wobble = ctx.createOscillator(), depth = ctx.createGain();
      wobble.frequency.value = 30; depth.gain.value = 80;
      wobble.connect(depth).connect(osc.frequency);
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.connect(f).connect(g).connect(out);
      osc.start(t); wobble.start(t); osc.stop(t + 0.7); wobble.stop(t + 0.7);
    },

    // POP: a quick slide up in pitch, each one a little higher
    pop(number = 0) {
      wake();
      const t = ctx.currentTime;
      const start = 300 * Math.pow(1.12, number);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(start, t);
      osc.frequency.exponentialRampToValueAtTime(start * 3.5, t + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(g).connect(out);
      osc.start(t); osc.stop(t + 0.15);
    },

    // VROOM VROOM: a low buzz whose pitch swoops up twice
    rev() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const f = osc.frequency;
      f.setValueAtTime(50, t);
      f.exponentialRampToValueAtTime(140, t + 0.35);   // VROOM
      f.exponentialRampToValueAtTime(60, t + 0.6);
      f.exponentialRampToValueAtTime(180, t + 1.0);    // VROOOM
      f.exponentialRampToValueAtTime(90, t + 1.6);
      const soft = ctx.createBiquadFilter(); soft.type = "lowpass"; soft.frequency.value = 900;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.1);
      g.gain.setValueAtTime(0.35, t + 1.2);
      g.gain.linearRampToValueAtTime(0, t + 1.7);
      osc.connect(soft).connect(g).connect(out);
      osc.start(t); osc.stop(t + 1.75);
    },

    // A bright "ding", like a little bell (each number a step higher)
    ding(number = 0) {
      wake();
      const steps = ["C5", "D5", "E5", "G5", "A5", "C6"];
      note(steps[number % steps.length], 0, 0.6, "triangle", 0.35, out);
      note(steps[number % steps.length], 0, 0.15, "square", 0.05, out);   // a little "tink" on top
    },

    // Pinball machine: ding ding ding DING!
    pinball() {
      wake();
      ["E5", "G5", "C6"].forEach((n, i) => note(n, i * 0.12, 0.12, "square", 0.08, out));
      note("C6", 0.4, 0.5, "square", 0.1, out);
      note("G5", 0.4, 0.5, "triangle", 0.25, out);
    },

    // Brahms' Lullaby on a music box (triangle = soft and round)
    lullaby(seconds = 20) {
      wake();
      if (lullVol) lullVol.disconnect();
      lullVol = ctx.createGain(); lullVol.gain.value = 0.8; lullVol.connect(ctx.destination);
      let t = 0.3, i = 0;
      // the tune...
      while (t < seconds) {
        const [n, beats] = LULLABY[i++ % LULLABY.length];
        note(n, t, beats * LULL_BEAT * 1.1, "triangle", 0.3, lullVol);
        t += beats * LULL_BEAT;
      }
      // ...and a soft low note at the start of each bar (after the
      // first two "pick-up" notes, which come before bar 1)
      for (let bar = 0, b = 0.3 + LULL_BEAT; b < seconds; bar++, b += 3 * LULL_BEAT) {
        note(LULL_BASS[bar % LULL_BASS.length], b, 3 * LULL_BEAT, "sine", 0.18, lullVol);
      }
    },

    lullabyOff(seconds = 2) {
      if (!lullVol) return;
      lullVol.gain.setValueAtTime(lullVol.gain.value, ctx.currentTime);
      lullVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },
  };
})();

// =====================================================================
//  music.js  -  SC-02 "The Transformation": gentle 8-bit gallery music,
//               a drum-roll for the spin, a big TA-DA, and POPs!
// =====================================================================
//
//  The mood is "quiet art gallery on children's telly": slow, dreamy,
//  a bit wistful. The tune is our OWN (written for this scene), so there
//  is nothing to copy and no recording to worry about. No sound files
//  either: every note is made by the browser (USB-stick safe).
//
//  TWO VOICES
//    1. The tune:   a soft square wave (the classic 8-bit beep).
//    2. The ripple: a "triangle" wave (rounder, like a little music box)
//                   playing the chord one note at a time, 8 notes a bar.
//
//  The chords go  F - Dm - Bb - C  (round and round). That pattern is
//  what makes it sound gentle and a little bit sad.
//
//  TO CHANGE THE TUNE: edit TUNE below. Each line is one bar of 4 beats;
//  each pair is [note, how many beats]. The numbers in a bar add up to 4.
//  To make it faster or slower, change BEAT.
// =====================================================================

// (Called GalleryMusic, so it can share a page with other scenes' music.)
const GalleryMusic = (() => {
  let ctx = null;        // the audio engine (iPad: must be started by a tap)
  let master = null;     // volume knob for the gallery music
  let fx = null;         // separate volume knob for the roll and the TA-DA

  const BEAT = 0.7;      // seconds per beat (about 86 beats a minute: relaxed)

  // Note names -> pitch in Hz ("Bb" = B flat)
  const HZ = {
    F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, C3: 130.81, D3: 146.83,
    E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63,
    D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
    C6: 1046.50,
  };

  // The chord under each bar, as the 4 notes the ripple walks through
  // (low, middle, high, middle) - played twice per bar.
  const CHORDS = {
    F:  ["F2", "C3", "A3", "C3"],
    Dm: ["D3", "A3", "F4", "A3"],
    Bb: ["Bb2", "F3", "D4", "F3"],
    C:  ["C3", "G3", "E4", "G3"],
  };

  // Our tune. 8 bars, then it starts again.
  //            chord   tune: [note, beats] ...
  const TUNE = [
    ["F",  [["A4", 1], ["C5", 1], ["F5", 1.5], ["E5", 0.5]]],
    ["Dm", [["D5", 2], ["A4", 1], ["C5", 1]]],
    ["Bb", [["D5", 1], ["C5", 0.5], ["Bb4", 0.5], ["A4", 1], ["G4", 1]]],
    ["C",  [["G4", 1], ["A4", 0.5], ["Bb4", 0.5], ["C5", 2]]],
    ["F",  [["A4", 1], ["C5", 1], ["F5", 1.5], ["G5", 0.5]]],
    ["Dm", [["A5", 2], ["F5", 1], ["D5", 1]]],
    ["Bb", [["D5", 1], ["C5", 1], ["Bb4", 1], ["G4", 1]]],
    ["C",  [["A4", 1], ["G4", 1], ["F4", 2]]],       // ...and home
  ];

  // ---- One note --------------------------------------------------------
  // type:   "square" (beep), "triangle" (music box), "sawtooth" (brassy)
  // when:   seconds from now;  length: seconds;  vol: loudness 0..1
  // out:    which volume knob it goes through
  function note(freq, when, length, type, vol, out) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    // The "envelope": quick start, then fade gently away (soft, not a buzz)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(vol * 0.4, t + length * 0.8);
    gain.gain.linearRampToValueAtTime(0, t + length);

    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + length + 0.02);
  }

  // ---- One bar of music, starting at time t ---------------------------
  function playBar(t, [chordName, tune]) {
    // The ripple: 8 quick music-box notes walking up and down the chord
    const chord = CHORDS[chordName];
    for (let i = 0; i < 8; i++) {
      note(HZ[chord[i % 4]], t + i * BEAT / 2, BEAT * 0.9, "triangle", 0.18, master);
    }
    // The tune on top, a little quieter than in the opening
    let x = t;
    for (const [name, beats] of tune) {
      note(HZ[name], x, beats * BEAT * 0.92, "square", 0.05, master);
      x += beats * BEAT;
    }
    return 4 * BEAT;                                  // a bar is 4 beats
  }

  // ---- Start the audio engine (only allowed after a tap on iPad) ------
  function wake() {
    // One shared audio engine for the whole page. When scenes play one
    // after another ("Play all"), the engine started by the Play tap is
    // reused, because iPad only lets a tap switch sound on.
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (!fx) { fx = ctx.createGain(); fx.gain.value = 0.8; fx.connect(ctx.destination); }
  }

  // ---- A burst of "white noise" (hiss), used for the cymbal crash -----
  function crash(when, length, vol) {
    const t = ctx.currentTime + when;
    const samples = Math.floor(ctx.sampleRate * length);
    const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;  // random = hiss
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hiss = ctx.createBiquadFilter();            // keep only the bright "tsshh"
    hiss.type = "highpass";
    hiss.frequency.value = 5000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    src.connect(hiss).connect(gain).connect(fx);
    src.start(t);
  }

  return {
    // Play the gallery music for about 'totalSeconds'.
    // Call it from inside a tap (iPad Safari only allows sound then).
    start(totalSeconds = 30) {
      wake();
      if (master) master.disconnect();                // silence anything still playing
      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(ctx.destination);
      let t = 0.1, i = 0;
      while (t < totalSeconds) {
        t += playBar(t, TUNE[i % TUNE.length]);
        i++;
      }
    },

    fadeOut(seconds = 2) {
      if (!ctx || !master) return;
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    stop() {
      if (master) master.disconnect();
      master = null;
    },

    // Drum-roll for the spin: beeps that get faster AND higher,
    // building up the excitement for 'seconds'.
    roll(seconds = 5) {
      wake();
      let t = 0, gap = 0.22, pitch = 180;
      while (t < seconds) {
        note(pitch, t, gap * 0.7, "square", 0.06, fx);
        t += gap;
        gap = Math.max(0.045, gap * 0.93);            // each gap a bit shorter
        pitch *= 1.025;                               // each beep a bit higher
      }
    },

    // "Hmm?" - the suspicious dog's sound: a note that slides down,
    // then slides up at the end like a question. Triangle wave = soft.
    suspicious() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(330, t);
      osc.frequency.linearRampToValueAtTime(220, t + 0.35);   // "hmmm..."
      osc.frequency.linearRampToValueAtTime(220, t + 0.5);
      osc.frequency.linearRampToValueAtTime(400, t + 0.8);    // "...?"
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
      gain.gain.setValueAtTime(0.35, t + 0.7);
      gain.gain.linearRampToValueAtTime(0, t + 0.85);
      osc.connect(gain).connect(fx);
      osc.start(t);
      osc.stop(t + 0.9);
    },

    // POP! A quick "bloop" that slides upwards. 'number' 0, 1, 2 ...
    // makes each pop a little higher than the one before.
    pop(number = 0) {
      wake();
      const t = ctx.currentTime;
      const start = 300 * Math.pow(1.06, number);     // each one 6% higher
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(start, t);
      osc.frequency.exponentialRampToValueAtTime(start * 3, t + 0.09);  // the slide up
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain).connect(fx);
      osc.start(t);
      osc.stop(t + 0.13);
    },

    // TA-DA! A short "ta" then a big long "DAAA", like a little brass band:
    // three notes at once (a C major chord) on brassy sawtooth waves,
    // with a cymbal crash on the DAAA.
    tada() {
      wake();
      const chord = ["C4", "E4", "G4", "C5"];
      for (const n of chord) note(HZ[n], 0, 0.14, "sawtooth", 0.07, fx);        // ta
      for (const n of chord) {                                                // DAAA
        note(HZ[n] * 2, 0.2, 1.8, "sawtooth", 0.08, fx);
        note(HZ[n] * 2, 0.2, 1.8, "square", 0.04, fx);
      }
      note(HZ.C3, 0.2, 1.8, "triangle", 0.3, fx);                             // big low note
      crash(0.2, 1.6, 0.35);
    },
  };
})();

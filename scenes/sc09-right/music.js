// =====================================================================
//  music.js  -  EPISODE 9 "Drive on your other Right!": sounds
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    RightSounds.valkyries(secs)  our 8-bit "Ride of the Valkyries" - the
//                                 SAME tune Enda approved for episode 1
//    RightSounds.valkyriesOff(s)  fade it away
//    RightSounds.tada()           "ta-DA!" for the pop-up picture
//    RightSounds.pop()            a quick "bloop" as something pops up
//    RightSounds.engine(secs)     the van's engine ticking over: brrrrm
//    RightSounds.engineOff(s)     the engine fades away
//    RightSounds.whoosh()         something flying in fast
//    RightSounds.boop()           BOOP! a rubbery bounce (the tyre hits)
//    RightSounds.boing()          a springy "boi-oi-oing" as it flies off
//
//  (Called "RightSounds" so it can share a page with the other
//   episodes' sounds on the "Play all" page.)
// =====================================================================

const RightSounds = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let tuneVol = null;      // volume knob for the Valkyries
  let engineVol = null;    // volume knob for the engine

  function wake() {
    // One shared audio engine for the whole page (iPad only lets a tap
    // switch sound on, so "Play all" reuses the one the Play tap started).
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (!out) { out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination); }
  }

  // A plain note: pitch (Hz), when (seconds from now), how long, wave shape, loudness
  function beep(freq, when, length, type, vol, to) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol, t + length * 0.85 - 0.02);
    g.gain.linearRampToValueAtTime(0, t + length * 0.85);       // a little gap after each note
    osc.connect(g).connect(to || out);
    osc.start(t); osc.stop(t + length + 0.02);
  }

  // A burst of hiss (random numbers) through a filter
  function hiss(length) {
    const n = Math.floor(ctx.sampleRate * length);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buffer;
    return src;
  }

  // ---- THE VALKYRIES: exactly the tune from episode 1 -----------------
  // 9/8 time, 3 beats a bar: "da-da-da DAAA DAAA"
  const HZ = { Fs4: 369.99, A4: 440.00, B4: 493.88, D5: 587.33, Fs5: 739.99, A5: 880.00,
               C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5 };
  const BEAT = 0.6;
  const RHYTHM = [0.5, 1 / 6, 1 / 3, 1, 1];
  const TUNE = [
    ["B4",  "Fs4", "B4",  "D5",  "B4"],    // da-da-da  D  B
    ["D5",  "B4",  "D5",  "Fs5", "D5"],    // da-da-da  F# D
    ["Fs5", "D5",  "Fs5", "A5",  "A4"],    // da-da-da  A  A
    ["D5",  "A4",  "D5",  "Fs5", "Fs5"],   // da-da-da  F#——— (held)
  ];
  function playBar(t, [n1, n2, n3, n4, n5]) {
    let x = t;
    beep(HZ[n1], x, RHYTHM[0] * BEAT, "square", 0.12, tuneVol); x += RHYTHM[0] * BEAT;
    beep(HZ[n2], x, RHYTHM[1] * BEAT, "square", 0.12, tuneVol); x += RHYTHM[1] * BEAT;
    beep(HZ[n3], x, RHYTHM[2] * BEAT, "square", 0.12, tuneVol); x += RHYTHM[2] * BEAT;
    if (n4 === n5) beep(HZ[n4], x, 2 * BEAT, "square", 0.12, tuneVol);   // one long note
    else { beep(HZ[n4], x, BEAT, "square", 0.12, tuneVol); beep(HZ[n5], x + BEAT, BEAT, "square", 0.12, tuneVol); }
    return 3 * BEAT;
  }

  return {
    valkyries(seconds = 16) {
      wake();
      if (tuneVol) tuneVol.disconnect();
      tuneVol = ctx.createGain(); tuneVol.gain.value = 0.9; tuneVol.connect(out);
      let t = 0.1, i = 0;
      while (t < seconds) { t += playBar(t, TUNE[i % TUNE.length]); i++; }
    },

    valkyriesOff(seconds = 2) {
      if (!tuneVol) return;
      tuneVol.gain.setValueAtTime(tuneVol.gain.value, ctx.currentTime);
      tuneVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // "ta-DA!": a quick little note, then a big bright chord
    tada() {
      wake();
      beep(HZ.G5, 0, 0.14, "square", 0.08);
      for (const f of [HZ.C5, HZ.E5, HZ.G5, HZ.C6]) beep(f, 0.16, 0.9, "square", 0.05);
    },

    // a "bloop": a note that shoots up quickly
    pop() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.16);
    },

    // The engine ticking over: a low buzzy note, roughened by a fast wobble
    engine(seconds = 15) {
      wake();
      const t = ctx.currentTime;
      if (engineVol) engineVol.disconnect();
      engineVol = ctx.createGain(); engineVol.connect(out);
      engineVol.gain.setValueAtTime(0, t);
      engineVol.gain.linearRampToValueAtTime(0.1, t + 0.5);
      const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 50;
      const rough = ctx.createOscillator(), depth = ctx.createGain();
      rough.frequency.value = 20; depth.gain.value = 0.5;
      const level = ctx.createGain(); level.gain.value = 0.6;
      rough.connect(depth).connect(level.gain);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 450;
      osc.connect(low).connect(level).connect(engineVol);
      osc.start(t); rough.start(t); osc.stop(t + seconds); rough.stop(t + seconds);
    },

    engineOff(seconds = 1.5) {
      if (!engineVol) return;
      engineVol.gain.setValueAtTime(engineVol.gain.value, ctx.currentTime);
      engineVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // Something flying in: a hiss that rises fast
    whoosh() {
      wake();
      const t = ctx.currentTime, src = hiss(0.7);
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2;
      f.frequency.setValueAtTime(500, t);
      f.frequency.exponentialRampToValueAtTime(4000, t + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.55);
      g.gain.linearRampToValueAtTime(0, t + 0.7);
      src.connect(f).connect(g).connect(out); src.start(t);
    },

    // BOOP: a low rubbery bounce (a note that drops) plus a soft thud
    boop() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(260, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.25);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.32);
    },

    // BOI-OI-OING: a wobbling note sliding up as it flies away
    boing() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(700, t + 0.9);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 9; depth.gain.value = 60;
      wob.connect(depth).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.07, t);
      g.gain.linearRampToValueAtTime(0, t + 1);
      o.connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + 1.05); wob.stop(t + 1.05);
    },
  };
})();

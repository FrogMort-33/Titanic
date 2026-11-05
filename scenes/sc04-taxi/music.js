// =====================================================================
//  music.js  -  SC-04 "Le Taxi at Lyon": sound effects
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    TaxiSounds.tick()          one "tick" of the airport clock
//    TaxiSounds.plane()         the plane's drone, high overhead, until stopped
//    TaxiSounds.planeOff(s)     fade the drone away over s seconds
//    TaxiSounds.zap()           ZAP! lightning hits the plane, then thunder
//    TaxiSounds.steps()         a few quick pitter-patter footsteps
//    TaxiSounds.putter()        a taxi's little engine, "putt-putt-putt"
//    TaxiSounds.putterOff(s)    the engine stops
//    TaxiSounds.pop(n)          a bubbly "POP!" (n = 0, 1... each one higher)
//    TaxiSounds.shuffle()       a tiny scuffle of feet on a car roof
//    TaxiSounds.hmm()           a puzzled "hmm?" for the family's question
//
//  Every scene names its sounds differently (OpeningMusic, GalleryMusic,
//  FlightSounds, TaxiSounds) so "Play all" can load them all at once.
// =====================================================================

const TaxiSounds = (() => {
  let ctx = null;          // the audio engine (shared with the other scenes)
  let out = null;          // volume knob for this scene
  let drone = null;        // the plane sound while it's flying
  const engines = [];      // the taxi engines while they run

  function wake() {
    // One shared audio engine for the whole page (iPad only lets a tap
    // switch sound on, so "Play all" reuses the one the Play tap started).
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (!out) { out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination); }
  }

  // A buffer of "noise" (random numbers played as sound: a hiss).
  // 'deep' = true makes a rumbly noise instead (each number wanders a
  // little from the one before, so it changes slowly = low sound).
  function noise(seconds, deep) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const white = Math.random() * 2 - 1;
      if (deep) { last = (last + 0.02 * white) / 1.02; data[i] = last * 3.5; }
      else data[i] = white;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    return src;
  }

  // A short click of noise through a filter: used for ticks and feet.
  // 'pitch' picks which part of the hiss we hear (high = clicky).
  function click(when, pitch, loud, length = 0.04) {
    const n = noise(length + 0.02, false);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = pitch; f.Q.value = 4;
    const v = ctx.createGain();
    v.gain.setValueAtTime(loud, when);
    v.gain.exponentialRampToValueAtTime(0.001, when + length);
    n.connect(f).connect(v).connect(out);
    n.start(when);
  }

  return {
    // The clock: a woody "tock" (a short, low-ish click)
    tick() {
      wake();
      click(ctx.currentTime, 2200, 0.9, 0.05);
    },

    // The plane: like the one in scene 3 but higher and quieter (it's far up)
    plane() {
      wake();
      const t = ctx.currentTime;
      const a = ctx.createOscillator(), b = ctx.createOscillator();
      a.type = b.type = "sawtooth";
      a.frequency.value = 110; b.frequency.value = 113;   // slightly out of tune = "wub wub"
      const soften = ctx.createBiquadFilter();
      soften.type = "lowpass"; soften.frequency.value = 700;
      const vol = ctx.createGain();
      vol.gain.setValueAtTime(0, t);
      vol.gain.linearRampToValueAtTime(0.06, t + 1.5);
      a.connect(soften); b.connect(soften);
      soften.connect(vol).connect(out);
      a.start(t); b.start(t);
      drone = { a, b, vol };
    },

    planeOff(seconds = 2) {
      if (!drone) return;
      const t = ctx.currentTime;
      drone.vol.gain.setValueAtTime(drone.vol.gain.value, t);
      drone.vol.gain.linearRampToValueAtTime(0, t + seconds);
      drone.a.stop(t + seconds + 0.1);
      drone.b.stop(t + seconds + 0.1);
      drone = null;
    },

    // ZAP: an electric buzz that drops in pitch, then a short thunder roll
    zap() {
      wake();
      const t = ctx.currentTime;
      const buzz = ctx.createOscillator();
      buzz.type = "square";
      buzz.frequency.setValueAtTime(1800, t);
      buzz.frequency.exponentialRampToValueAtTime(120, t + 0.25);
      const bv = ctx.createGain();
      bv.gain.setValueAtTime(0.15, t);
      bv.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      buzz.connect(bv).connect(out);
      buzz.start(t); buzz.stop(t + 0.32);

      const rumble = noise(1.8, true);
      const low = ctx.createBiquadFilter();
      low.type = "lowpass"; low.frequency.value = 250;
      const rv = ctx.createGain();
      rv.gain.setValueAtTime(0, t);
      rv.gain.linearRampToValueAtTime(0.9, t + 0.12);
      rv.gain.exponentialRampToValueAtTime(0.001, t + 1.7);
      rumble.connect(low).connect(rv).connect(out);
      rumble.start(t + 0.05);
    },

    // Lots of little feet: 8 soft clicks, quickly, slightly random
    steps() {
      wake();
      const t = ctx.currentTime;
      for (let i = 0; i < 8; i++) click(t + i * 0.13 + Math.random() * 0.03, 500 + Math.random() * 300, 0.6);
    },

    // The taxi's engine: a low buzz switched on and off quickly
    // ("putt-putt-putt"). A second wave (the "chopper") turns the volume
    // up and down 9 times a second.
    putter() {
      wake();
      const t = ctx.currentTime;
      const motor = ctx.createOscillator();
      motor.type = "square"; motor.frequency.value = 55;
      const soften = ctx.createBiquadFilter();
      soften.type = "lowpass"; soften.frequency.value = 400;
      const vol = ctx.createGain(); vol.gain.value = 0.07;      // middle volume...
      const chopper = ctx.createOscillator(), depth = ctx.createGain();
      chopper.frequency.value = 9; depth.gain.value = 0.07;
      chopper.connect(depth).connect(vol.gain);              // ...goes up and down (0 to 0.14)
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, t);
      master.gain.linearRampToValueAtTime(1, t + 0.5);
      motor.connect(soften).connect(vol).connect(master).connect(out);
      motor.start(t); chopper.start(t);
      engines.push({ motor, chopper, master });
    },

    putterOff(seconds = 0.8) {
      const e = engines.shift();
      if (!e) return;
      const t = ctx.currentTime;
      e.master.gain.setValueAtTime(e.master.gain.value, t);
      e.master.gain.linearRampToValueAtTime(0, t + seconds);
      e.motor.stop(t + seconds + 0.1); e.chopper.stop(t + seconds + 0.1);
    },

    // POP: a quick slide up in pitch, like a cork (each one a bit higher)
    pop(number = 0) {
      wake();
      const t = ctx.currentTime;
      const start = 260 * Math.pow(1.25, number);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(start, t);
      osc.frequency.exponentialRampToValueAtTime(start * 4, t + 0.08);
      const v = ctx.createGain();
      v.gain.setValueAtTime(0.5, t);
      v.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(v).connect(out);
      osc.start(t); osc.stop(t + 0.16);
    },

    // Two soft scuffs, like shoes sliding on a car roof
    shuffle() {
      wake();
      const t = ctx.currentTime;
      click(t, 900, 0.35, 0.09);
      click(t + 0.12, 800, 0.3, 0.09);
    },

    // "Hmm?": a soft hum that bends upwards at the end, like a question
    hmm() {
      wake();
      const t = ctx.currentTime;
      const voice = ctx.createOscillator();
      voice.type = "triangle";
      voice.frequency.setValueAtTime(200, t);
      voice.frequency.setValueAtTime(200, t + 0.5);
      voice.frequency.exponentialRampToValueAtTime(300, t + 0.8);    // the "?" goes up
      const v = ctx.createGain();
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.35, t + 0.08);
      v.gain.setValueAtTime(0.35, t + 0.7);
      v.gain.linearRampToValueAtTime(0, t + 0.9);
      voice.connect(v).connect(out);
      voice.start(t); voice.stop(t + 0.95);
    },
  };
})();

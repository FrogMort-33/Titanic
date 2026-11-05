// =====================================================================
//  music.js  -  EPISODE 7 "A Van, A Man & a Plan": sounds
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    VanSounds.engine(secs)     the van's engine ticking over: brrrrm
//    VanSounds.engineOff(s)     the engine stops (dies away)
//    VanSounds.rev(size)        VROOM! size 1 = a rev, 2 = big, 3 = HUGE
//    VanSounds.count()          a countdown "beep" (low)
//    VanSounds.drumroll(secs)   a snare drum roll, getting louder
//    VanSounds.whoosh()         a quick swoosh (for zooming in and out)
//    VanSounds.crash()          CRASH! a bang and a clatter
//    VanSounds.sad()            "wah-wah-wah-waaah": three steps down,
//                               then a long, wobbly sad one
//    VanSounds.sting()          a cheeky "ta-da" for FIVE MINUTES LATER
//    VanSounds.forecast(secs)   our own jolly "weather forecast" tune
//
//  (Called "VanSounds" so it can share a page with the other episodes'.)
// =====================================================================

const VanSounds = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
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
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + length * 0.7);
    g.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(g).connect(to || out);
    osc.start(t); osc.stop(t + length + 0.02);
  }

  // A burst of hiss (random numbers) through a filter
  function hiss(when, length, filterType, freq, vol) {
    const t = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * length);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buffer;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + length);
    src.connect(f).connect(g).connect(out);
    src.start(t);
    return { f, t };
  }

  // Note names -> pitch (Hz), for writing tunes as letters ("-" = rest)
  const HZ = {};
  ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"].forEach((n, i) => {
    for (let octave = 2; octave <= 6; octave++) HZ[n + octave] = 440 * Math.pow(2, octave - 4 + (i - 9) / 12);
  });

  return {
    // The engine ticking over: a low buzzy note (sawtooth), made rough by
    // a fast wobble in its volume (that's the "brrrr")
    engine(seconds = 20) {
      wake();
      const t = ctx.currentTime;
      if (engineVol) engineVol.disconnect();
      engineVol = ctx.createGain(); engineVol.connect(out);
      engineVol.gain.setValueAtTime(0, t);
      engineVol.gain.linearRampToValueAtTime(0.12, t + 0.5);
      const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 48;
      const rough = ctx.createOscillator(), depth = ctx.createGain();
      rough.frequency.value = 22; depth.gain.value = 0.5;
      const level = ctx.createGain(); level.gain.value = 0.6;
      rough.connect(depth).connect(level.gain);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 400;
      osc.connect(low).connect(level).connect(engineVol);
      osc.start(t); rough.start(t); osc.stop(t + seconds); rough.stop(t + seconds);
    },

    // The engine dies: it slows down and fades away
    engineOff(seconds = 1.5) {
      if (!engineVol) return;
      engineVol.gain.setValueAtTime(engineVol.gain.value, ctx.currentTime);
      engineVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // VROOM: the engine note shoots UP in pitch and comes back down.
    // Bigger revs go higher, louder and longer.
    rev(size = 1) {
      wake();
      const t = ctx.currentTime;
      const len = 0.7 + size * 0.35;
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.exponentialRampToValueAtTime(110 + size * 70, t + len * 0.35);
      osc.frequency.exponentialRampToValueAtTime(60, t + len);
      const rough = ctx.createOscillator(), depth = ctx.createGain();    // the growl
      rough.frequency.value = 30; depth.gain.value = 25;
      rough.connect(depth).connect(osc.frequency);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 900 + size * 300;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15 + size * 0.07, t + 0.08);
      g.gain.setValueAtTime(0.15 + size * 0.07, t + len * 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + len);
      osc.connect(low).connect(g).connect(out);
      osc.start(t); rough.start(t); osc.stop(t + len + 0.05); rough.stop(t + len + 0.05);
      if (size >= 2) hiss(0, len * 0.6, "bandpass", 600, 0.1 * size);   // exhaust roar
    },

    // Countdown beep
    count() {
      wake();
      beep(440, 0, 0.35, "square", 0.08);
      beep(220, 0, 0.35, "triangle", 0.3);
    },

    // A snare roll: lots of quick ticks of hiss, getting louder
    drumroll(seconds = 3) {
      wake();
      for (let t = 0; t < seconds; t += 0.05) hiss(t, 0.04, "highpass", 2500, 0.05 + 0.25 * (t / seconds));
    },

    whoosh() {
      wake();
      const w = hiss(0, 0.5, "bandpass", 500, 0.35);
      w.f.frequency.exponentialRampToValueAtTime(3000, w.t + 0.25);
      w.f.frequency.exponentialRampToValueAtTime(800, w.t + 0.5);
    },

    // CRASH: a deep thump, a big burst of hiss, and some clattering bits
    crash() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g).connect(out); osc.start(t); osc.stop(t + 0.62);
      hiss(0, 0.9, "lowpass", 3000, 0.6);
      for (let i = 0; i < 8; i++) hiss(0.1 + Math.random() * 0.6, 0.06, "bandpass", 2000 + Math.random() * 3000, 0.25);
    },

    // Wah-wah-wah-waaaah: three notes stepping down, then a long low one
    // that wobbles. A "lowpass" filter opening and closing makes the "wah".
    sad() {
      wake();
      const NOTES = [[HZ["G3"], 0, 0.45], [HZ["F#3"], 0.5, 0.45], [HZ["F3"], 1.0, 0.45], [HZ["E3"], 1.5, 1.6]];
      for (const [freq, when, length] of NOTES) {
        const t = ctx.currentTime + when;
        const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
        if (length > 1) {                                       // the last one wobbles
          const wob = ctx.createOscillator(), d = ctx.createGain();
          wob.frequency.value = 5; d.gain.value = 6;
          wob.connect(d).connect(osc.frequency); wob.start(t); wob.stop(t + length);
        }
        const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 6;
        f.frequency.setValueAtTime(300, t);
        f.frequency.linearRampToValueAtTime(1200, t + 0.12);    // waa...
        f.frequency.linearRampToValueAtTime(400, t + length);   // ...ah
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.25, t + 0.05);
        g.gain.setValueAtTime(0.25, t + length * 0.8);
        g.gain.linearRampToValueAtTime(0, t + length);
        osc.connect(f).connect(g).connect(out);
        osc.start(t); osc.stop(t + length + 0.05);
      }
    },

    // A cheeky little "ta-da" (our own)
    sting() {
      wake();
      [["C5", 0, 0.1], ["E5", 0.1, 0.1], ["G5", 0.2, 0.1], ["C6", 0.32, 0.12], ["-", 0, 0], ["G5", 0.5, 0.1], ["C6", 0.62, 0.5]]
        .forEach(([n, when, length]) => { if (n !== "-") beep(HZ[n], when, length, "square", 0.07); });
      beep(HZ["C3"], 0.62, 0.5, "triangle", 0.3);
    },

    // Our own bouncy weather-forecast tune
    forecast(seconds = 7) {
      wake();
      const BEAT = 0.25;
      const TUNE = ["E5", "G5", "C6", "G5", "A5", "-", "F5", "-", "D5", "F5", "B5", "F5", "G5", "-", "E5", "-",
                    "C5", "E5", "A5", "E5", "F5", "-", "D5", "-", "B4", "D5", "G5", "B4", "C5", "-", "-", "-"];
      const BASS = ["C3", "C3", "F3", "F3", "G3", "G3", "C3", "C3"];
      for (let i = 0, t = 0.05; t < seconds; i++, t += BEAT) {
        const n = TUNE[i % TUNE.length];
        if (n !== "-") beep(HZ[n], t, BEAT * 0.8, "square", 0.05);
        if (i % 2 === 0) beep(HZ[BASS[Math.floor(i / 4) % BASS.length]], t, BEAT * 0.9, "triangle", 0.22);
      }
    },
  };
})();

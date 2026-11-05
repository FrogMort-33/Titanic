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
//   THE DRIVING FORECAST
//    VanSounds.tickUp(i)        one tick of the dial (i = 0, 1, 2... higher each time)
//    VanSounds.alarm()          the dial hits "French": a wailing alarm
//    VanSounds.grumble()        an angry "grrr" and a horn
//    VanSounds.whistleUp()      a slide whistle going UP
//    VanSounds.valkyries(bars)  our 8-bit Ride of the Valkyries (as in episode 1)
//    VanSounds.bonk()           one van bumping another
//    VanSounds.fire(secs)       crackling flames
//
//   HORROR (Enda's idea: driving in France is SCARY)
//    VanSounds.horror(secs)     our own spooky 8-bit organ tune
//    VanSounds.horrorOff(s)     fade it away
//    VanSounds.drone(secs)      a low, creepy hum (two notes that clash)
//    VanSounds.heartbeat(secs)  lub-dub... lub-dub... getting FASTER
//    VanSounds.thunder()        a crack of thunder and a long rumble
//    VanSounds.scream()         a shriek
//    VanSounds.creak()          a creaky door
//    VanSounds.theremin(secs)   the wobbly "ooo-eee-ooo" of an old horror film
//
//  (Called "VanSounds" so it can share a page with the other episodes'.)
// =====================================================================

const VanSounds = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let engineVol = null;    // volume knob for the engine
  let horrorVol = null;    // volume knob for the spooky tune

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

    // ================= THE DRIVING FORECAST =================

    tickUp(i = 0) {
      wake();
      hiss(0, 0.025, "highpass", 3000, 0.3);
      beep(300 * Math.pow(1.09, i), 0, 0.05, "square", 0.06);
    },

    // A siren going up and down three times
    alarm() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(600, t);
      for (let k = 0; k < 3; k++) {
        o.frequency.linearRampToValueAtTime(1200, t + k * 0.5 + 0.25);
        o.frequency.linearRampToValueAtTime(600, t + k * 0.5 + 0.5);
      }
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t); g.gain.setValueAtTime(0.06, t + 1.4); g.gain.linearRampToValueAtTime(0, t + 1.5);
      o.connect(g).connect(out); o.start(t); o.stop(t + 1.55);
    },

    // Grrr (a low, rough, wobbling buzz) then HONK HONK
    grumble() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = 85;
      const wob = ctx.createOscillator(), d = ctx.createGain();
      wob.frequency.value = 25; d.gain.value = 20;
      wob.connect(d).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + 0.1);
      g.gain.setValueAtTime(0.15, t + 0.9); g.gain.linearRampToValueAtTime(0, t + 1.1);
      o.connect(g).connect(out); o.start(t); wob.start(t); o.stop(t + 1.15); wob.stop(t + 1.15);
      for (const when of [1.3, 1.65]) { beep(349, when, 0.25, "square", 0.08); beep(440, when, 0.25, "square", 0.06); }
    },

    // A slide whistle: a pure note sliding UP
    whistleUp() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(1800, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.05);
      g.gain.setValueAtTime(0.2, t + 0.45); g.gain.linearRampToValueAtTime(0, t + 0.55);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.6);
    },

    // Ride of the Valkyries (Wagner, 1870: long out of copyright), the
    // same 8-bit tune as episode 1's opening. Each bar: da-da-da DAAA DAAA.
    valkyries(bars = 4) {
      wake();
      const BEAT = 0.6;
      const RHYTHM = [0.5, 1 / 6, 1 / 3, 1, 1];
      const TUNE = [["B4", "F#4", "B4", "D5", "B4"], ["D5", "B4", "D5", "F#5", "D5"],
                    ["F#5", "D5", "F#5", "A5", "A4"], ["D5", "A4", "D5", "F#5", "F#5"]];
      let t = 0.05;
      for (let b = 0; b < bars; b++) {
        const [n1, n2, n3, n4, n5] = TUNE[b % TUNE.length];
        let x = t;
        [n1, n2, n3].forEach((n, k) => { beep(HZ[n], x, RHYTHM[k] * BEAT * 0.85, "square", 0.1); x += RHYTHM[k] * BEAT; });
        if (n4 === n5) beep(HZ[n4], x, 2 * BEAT * 0.9, "square", 0.1);
        else { beep(HZ[n4], x, BEAT * 0.85, "square", 0.1); beep(HZ[n5], x + BEAT, BEAT * 0.85, "square", 0.1); }
        beep(HZ["B2"], t, 3 * BEAT * 0.9, "triangle", 0.2);       // a low note under each bar
        t += 3 * BEAT;
      }
    },

    bonk() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.15);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.22);
      hiss(0, 0.1, "lowpass", 1500, 0.3);
    },

    // Fire: lots of tiny random pops (crackle) over a soft roar
    fire(seconds = 4) {
      wake();
      const roar = hiss(0, seconds, "lowpass", 400, 0.15);
      for (let t = 0; t < seconds; t += 0.03 + Math.random() * 0.12) hiss(t, 0.015, "highpass", 2500, 0.1 + Math.random() * 0.25);
    },

    // ================= HORROR =================

    // Our own spooky tune, in a minor key, on a wheezy 8-bit "organ"
    // (two square waves slightly out of tune with each other = wobbly)
    horror(seconds = 8) {
      wake();
      if (horrorVol) horrorVol.disconnect();
      horrorVol = ctx.createGain(); horrorVol.gain.value = 0.9; horrorVol.connect(out);
      const BEAT = 0.32;
      const TUNE = [["D5", 1], ["F5", 1], ["A5", 1], ["G#5", 3], ["G5", 1], ["F5", 1], ["E5", 1], ["C#5", 3],
                    ["D5", 1], ["A4", 1], ["Bb4", 1], ["G4", 2], ["F4", 1], ["E4", 1], ["D4", 4]];
      const BASS = ["D3", "D3", "Bb2", "Bb2", "G2", "G2", "A2", "A2"];
      let t = 0.05, i = 0;
      while (t < seconds) {
        const [n, beats] = TUNE[i % TUNE.length];
        const len = beats * BEAT * 0.95;
        organ(HZ[n], t, len);
        t += beats * BEAT; i++;
      }
      for (let tb = 0.05, b = 0; tb < seconds; tb += 2 * BEAT, b++) {
        const n = HZ[BASS[b % BASS.length]];
        [0, 1].forEach((k) => {                    // "doom... doom"
          const tt = ctx.currentTime + tb + k * BEAT;
          const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = n;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.25, tt); g.gain.exponentialRampToValueAtTime(0.001, tt + BEAT * 0.9);
          o.connect(g).connect(horrorVol); o.start(tt); o.stop(tt + BEAT);
        });
      }
      function organ(freq, when, len) {
        const tt = ctx.currentTime + when;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, tt);
        g.gain.linearRampToValueAtTime(0.035, tt + 0.03);
        g.gain.setValueAtTime(0.035, tt + len * 0.8);
        g.gain.linearRampToValueAtTime(0, tt + len);
        g.connect(horrorVol);
        for (const detune of [-8, 8]) {             // two, slightly apart
          const o = ctx.createOscillator(); o.type = "square";
          o.frequency.value = freq; o.detune.value = detune;
          o.connect(g); o.start(tt); o.stop(tt + len + 0.02);
        }
      }
    },
    horrorOff(seconds = 1.5) {
      if (!horrorVol) return;
      horrorVol.gain.setValueAtTime(horrorVol.gain.value, ctx.currentTime);
      horrorVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // Two low notes very close together "beat" against each other:
    // a slow, sick wobble. Fades in, then out.
    drone(seconds = 10) {
      wake();
      const t = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 2);
      g.gain.setValueAtTime(0.12, t + seconds - 1);
      g.gain.linearRampToValueAtTime(0, t + seconds);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 500;
      low.connect(g).connect(out);
      for (const f of [73.4, 77.8]) {               // D2 and a clashing D#2
        const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
        o.connect(low); o.start(t); o.stop(t + seconds + 0.05);
      }
    },

    // A heart beating: two soft thumps (lub-dub), the gap shrinking
    // as it goes, from 1 beat a second to about 3 a second
    heartbeat(seconds = 10) {
      wake();
      const thump = (when, vol) => {
        const tt = ctx.currentTime + when;
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(70, tt); o.frequency.exponentialRampToValueAtTime(40, tt + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, tt); g.gain.exponentialRampToValueAtTime(0.001, tt + 0.15);
        o.connect(g).connect(out); o.start(tt); o.stop(tt + 0.16);
      };
      for (let t = 0; t < seconds;) {
        thump(t, 0.6); thump(t + 0.16, 0.45);
        t += 1 - 0.65 * (t / seconds);              // faster and faster
      }
    },

    // Thunder: a sharp crack of hiss, then a long low rumble
    thunder() {
      wake();
      hiss(0, 0.35, "highpass", 1500, 0.5);
      const r = hiss(0.05, 3.5, "lowpass", 220, 0.9);
      r.f.frequency.linearRampToValueAtTime(90, r.t + 3.5);
    },

    // A shriek: a high note that slides up, shaking (vibrato)
    scream() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(1200, t + 0.25);
      o.frequency.linearRampToValueAtTime(900, t + 1);
      const shake = ctx.createOscillator(), d = ctx.createGain();
      shake.frequency.value = 9; d.gain.value = 40;
      shake.connect(d).connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1500; f.Q.value = 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.05);
      g.gain.setValueAtTime(0.18, t + 0.7); g.gain.linearRampToValueAtTime(0, t + 1);
      o.connect(f).connect(g).connect(out);
      o.start(t); shake.start(t); o.stop(t + 1.05); shake.stop(t + 1.05);
    },

    // A creaky door: a low buzzy note dragging slowly up and down, in jerks
    creak() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(90, t);
      for (let k = 1; k <= 8; k++) o.frequency.linearRampToValueAtTime(90 + Math.sin(k) * 40 + k * 8, t + k * 0.18);
      const jerk = ctx.createOscillator(), d = ctx.createGain();   // the "rrrr" in the creak
      jerk.frequency.value = 35; d.gain.value = 0.5;
      const level = ctx.createGain(); level.gain.value = 0.5;
      jerk.connect(d).connect(level.gain);
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.1);
      g.gain.setValueAtTime(0.5, t + 1.3); g.gain.linearRampToValueAtTime(0, t + 1.5);
      o.connect(level).connect(f).connect(g).connect(out);
      o.start(t); jerk.start(t); o.stop(t + 1.55); jerk.stop(t + 1.55);
    },

    // Theremin: a pure note gliding smoothly between pitches, wobbling
    theremin(seconds = 8) {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      const NOTES = ["A4", "D5", "C5", "A4", "F4", "E4", "G#4", "A4"];
      o.frequency.setValueAtTime(HZ["A4"], t);
      NOTES.forEach((n, k) => o.frequency.exponentialRampToValueAtTime(HZ[n], t + (k + 1) * seconds / NOTES.length));
      const wob = ctx.createOscillator(), d = ctx.createGain();
      wob.frequency.value = 6; d.gain.value = 8;
      wob.connect(d).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14, t + 0.8);
      g.gain.setValueAtTime(0.14, t + seconds - 1); g.gain.linearRampToValueAtTime(0, t + seconds);
      o.connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + seconds + 0.05); wob.stop(t + seconds + 0.05);
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

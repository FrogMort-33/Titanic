// =====================================================================
//  music.js  -  EPISODE 6 "Uber World, Part Deux": sounds
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    Deux.traffic(secs)    busy city traffic: a low rumble of engines
//    Deux.trafficOff(s)    fade the traffic away
//    Deux.horn()           a car horn: "BEEP BEEP!"
//    Deux.brakes()         a car pulling up
//    Deux.pop(n)           a head pops out (n = 0, 1... each one lower)
//    Deux.ding()           a soft "ding"
//    Deux.cluck()          one chicken: "bok!"
//    Deux.panic(secs)      lots of chickens: bok-bok-BAKAWK!
//    Deux.scurry(secs)     our own quick, silly 8-bit "running away" tune
//
//   THE B TEAM (second half)
//    Deux.warp()           a wibbly-wobbly "another reality" swoop
//    Deux.blip()           one letter typing / one thinking dot
//    Deux.loony(secs)      our own loony 8-bit tune for the B team
//    Deux.loonyOff(s)      fade it away
//    Deux.boom(n)          BIG word impact (n = 0, 1, 2: each one bigger)
//    Deux.putter(secs)     a little car engine, jogging along
//    Deux.zoom()           a car speeding away: NEEEOW
//    Deux.whirr(secs)      the lift's motor
//    Deux.tick()           the clock: tick
//    Deux.waiting(secs)    our own sleepy "waiting room" tune
//    Deux.waitingOff(s)    fade it away
//    Deux.cheer()          everyone: HOORAY!
//
//  (Called "Deux" so it can share a page with the other episodes' sounds.)
// =====================================================================

const Deux = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let trafficVol = null;   // volume knob for the traffic
  let loonyVol = null;     // volume knob for the loony tune
  let waitVol = null;      // volume knob for the waiting-room tune

  function wake() {
    // One shared audio engine for the whole page (iPad only lets a tap
    // switch sound on, so "Play all" reuses the one the Play tap started).
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (!out) { out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination); }
  }

  // A buffer of noise (random numbers = hiss). deep = rumbly instead.
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

  function beep(freq, when, length, type, vol) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + length * 0.7);
    g.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(g).connect(out);
    osc.start(t); osc.stop(t + length + 0.02);
  }

  // Same as beep(), but into a tune's own volume knob ('to'), so the
  // whole tune can be faded out later.
  function beepTo(to, freq, when, length, type, vol) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + length * 0.7);
    g.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(g).connect(to);
    osc.start(t); osc.stop(t + length + 0.02);
  }

  // Note names -> pitch (Hz), for writing tunes as letters.
  // Each octave up doubles the number; "-" is a rest.
  const HZ = {};
  ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"].forEach((n, i) => {
    for (let octave = 2; octave <= 6; octave++) HZ[n + octave] = 440 * Math.pow(2, octave - 4 + (i - 9) / 12);
  });

  // Fade a volume knob to nothing over 'seconds'
  function fadeKnob(knob, seconds) {
    if (!knob) return;
    knob.gain.setValueAtTime(knob.gain.value, ctx.currentTime);
    knob.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
  }

  // A quick burst of hiss through a filter (for drums, crashes, cheers)
  function hiss(when, length, filterType, freq, vol, to) {
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
    src.connect(f).connect(g).connect(to || out);
    src.start(t);
    return { src, f, g, t };
  }

  // One "bok": a buzzy voice that jumps UP in pitch and drops, through a
  // filter that makes it sound like a beak, not a whistle.
  function bok(when, pitch, length) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.8, t + length * 0.25);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.9, t + length);
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.6, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + length);
    osc.connect(f).connect(g).connect(out);
    osc.start(t); osc.stop(t + length + 0.02);
  }

  return {
    // City traffic: deep rumbling noise, swelling up and down a little
    traffic(seconds = 25) {
      wake();
      const t = ctx.currentTime;
      if (trafficVol) trafficVol.disconnect();
      trafficVol = ctx.createGain(); trafficVol.connect(out);
      trafficVol.gain.setValueAtTime(0, t);
      trafficVol.gain.linearRampToValueAtTime(0.5, t + 1.5);
      const rumble = noise(seconds, true);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 350;
      const swell = ctx.createOscillator(), depth = ctx.createGain();    // slow up-and-down
      swell.frequency.value = 0.3; depth.gain.value = 0.2;
      const level = ctx.createGain(); level.gain.value = 0.8;
      swell.connect(depth).connect(level.gain);
      rumble.connect(low).connect(level).connect(trafficVol);
      rumble.start(t); swell.start(t); swell.stop(t + seconds);
    },

    trafficOff(seconds = 2) {
      if (!trafficVol) return;
      trafficVol.gain.setValueAtTime(trafficVol.gain.value, ctx.currentTime);
      trafficVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // BEEP BEEP: two notes together (a slightly sour pair = car horn)
    horn() {
      wake();
      for (const when of [0, 0.28]) {
        beep(392, when, 0.2, "square", 0.08);
        beep(494, when, 0.2, "square", 0.06);
      }
    },

    // Pulling up: a short, soft squeal sliding down
    brakes() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(g).connect(out);
      osc.start(t); osc.stop(t + 0.6);
    },

    // POP (out of existence): a quick slide DOWN, each one a bit lower
    pop(number = 0) {
      wake();
      const t = ctx.currentTime;
      const start = 900 * Math.pow(0.88, number);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(start, t);
      osc.frequency.exponentialRampToValueAtTime(start / 4, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(g).connect(out);
      osc.start(t); osc.stop(t + 0.17);
    },

    ding() {
      wake();
      beep(1047, 0, 0.5, "triangle", 0.3);
    },

    cluck() {
      wake();
      bok(0, 400 + Math.random() * 150, 0.12);
    },

    // A flock in a panic: lots of boks at random, and the odd long BAKAWK
    panic(seconds = 5) {
      wake();
      for (let t = 0; t < seconds; t += 0.09 + Math.random() * 0.15) {
        bok(t, 350 + Math.random() * 300, 0.08 + Math.random() * 0.06);
      }
      for (let t = 0.5; t < seconds; t += 1.3 + Math.random()) {
        bok(t, 300, 0.1); bok(t + 0.12, 320, 0.1); bok(t + 0.26, 380, 0.45);   // bok-bok-BAKAAWK
      }
    },

    // ================= THE B TEAM =================

    // Another reality: a note that wobbles (vibrato) and swoops down
    warp() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = "triangle";
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 2);
      const wob = ctx.createOscillator(), depth = ctx.createGain();   // the wobble
      wob.frequency.value = 7; depth.gain.value = 60;
      wob.connect(depth).connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.2);
      g.gain.linearRampToValueAtTime(0, t + 2.2);
      osc.connect(g).connect(out);
      osc.start(t); wob.start(t); osc.stop(t + 2.3); wob.stop(t + 2.3);
    },

    blip() {
      wake();
      beep(1400 + Math.random() * 200, 0, 0.03, "square", 0.04);
    },

    // The loony tune: a bouncy "oom-pah" bass, and a silly tune that
    // leaps about and slides. Our own, written for this episode.
    loony(seconds = 50) {
      wake();
      if (loonyVol) loonyVol.disconnect();
      loonyVol = ctx.createGain(); loonyVol.gain.value = 0.9; loonyVol.connect(out);
      const BEAT = 0.2;                                  // seconds per beat (fast!)
      const TUNE = ["C5", "-", "E5", "G5", "C6", "-", "B5", "A5", "G5", "-", "E5", "-", "F5", "F#5", "G5", "-",
                    "A5", "-", "F5", "-", "D5", "-", "B4", "C5", "D5", "D#5", "E5", "-", "C5", "-", "-", "-",
                    "C5", "C6", "C5", "C6", "B5", "-", "G5", "-", "A5", "Bb5", "A5", "G5", "E5", "-", "C5", "-",
                    "D5", "-", "G4", "-", "B4", "-", "D5", "F5", "E5", "D5", "C5", "-", "G4", "-", "C5", "-"];
      const BASS = ["C3", "G3", "C3", "G3", "F3", "C4", "F3", "C4", "C3", "G3", "C3", "G3", "G2", "D3", "G2", "D3"];
      for (let i = 0, t = 0.05; t < seconds; i++, t += BEAT) {
        const n = TUNE[i % TUNE.length];
        if (n !== "-") beepTo(loonyVol, HZ[n], t, BEAT * 0.8, "square", 0.045);
        if (i % 2 === 0) beepTo(loonyVol, HZ[BASS[(i / 2) % BASS.length]], t, BEAT * 0.9, "triangle", 0.22);
        if (i % 4 === 2) hiss(t, 0.04, "highpass", 7000, 0.12, loonyVol);    // tss
        if (i % 32 === 31) {                                                // a silly slide-whistle every so often
          const tt = ctx.currentTime + t;
          const o = ctx.createOscillator(); o.type = "sine";
          o.frequency.setValueAtTime(500, tt); o.frequency.exponentialRampToValueAtTime(1600, tt + 0.35);
          const g = ctx.createGain(); g.gain.setValueAtTime(0.08, tt); g.gain.linearRampToValueAtTime(0, tt + 0.4);
          o.connect(g).connect(loonyVol); o.start(tt); o.stop(tt + 0.42);
        }
      }
    },
    loonyOff(seconds = 2) { fadeKnob(loonyVol, seconds); },

    // BOOM: a deep drop in pitch plus a crash of noise
    boom(n = 0) {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(160 - n * 25, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g).connect(out); osc.start(t); osc.stop(t + 0.62);
      hiss(0, 0.4 + n * 0.2, "lowpass", 2500, 0.35 + n * 0.1);
    },

    // A little engine: quick, low "putt-putt-putt"s
    putter(seconds = 4) {
      wake();
      for (let t = 0; t < seconds; t += 0.11) beep(70 + Math.random() * 10, t, 0.06, "sawtooth", 0.06);
    },

    // NEEEOW: a rising then falling engine whine, plus a whoosh
    zoom() {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(250, t + 1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      osc.connect(g).connect(out); osc.start(t); osc.stop(t + 1.12);
      const w = hiss(0, 0.8, "bandpass", 800, 0.3);
      w.f.frequency.exponentialRampToValueAtTime(3000, w.t + 0.4);
    },

    // The lift motor: a low hum that wobbles slightly
    whirr(seconds = 3) {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 55;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 300;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.3);
      g.gain.setValueAtTime(0.18, t + seconds - 0.3);
      g.gain.linearRampToValueAtTime(0, t + seconds);
      osc.connect(f).connect(g).connect(out); osc.start(t); osc.stop(t + seconds + 0.05);
    },

    tick() {
      wake();
      hiss(0, 0.03, "highpass", 3000, 0.35);
      beep(2000, 0, 0.015, "square", 0.05);
    },

    // The waiting-room tune: slow, soft and a bit dreary (on purpose).
    // Our own, written for this episode.
    waiting(seconds = 12) {
      wake();
      if (waitVol) waitVol.disconnect();
      waitVol = ctx.createGain(); waitVol.gain.value = 0.9; waitVol.connect(out);
      const BEAT = 0.42;
      const TUNE = [["E5", 2], ["D5", 1], ["C5", 1], ["D5", 2], ["G4", 2], ["A4", 1], ["B4", 1], ["C5", 1],
                    ["D5", 1], ["E5", 4], ["F5", 2], ["E5", 1], ["D5", 1], ["C5", 2], ["A4", 2], ["B4", 1],
                    ["C5", 1], ["D5", 1], ["B4", 1], ["C5", 4]];
      const CHORDS = [["C3", "E4", "G4"], ["G2", "D4", "G4"], ["A2", "C4", "E4"], ["F2", "C4", "F4"]];
      let t = 0.05, i = 0, bar = 0;
      while (t < seconds) {
        const [n, beats] = TUNE[i % TUNE.length];
        beepTo(waitVol, HZ[n], t, beats * BEAT * 0.9, "triangle", 0.18);
        t += beats * BEAT; i++;
      }
      for (let tb = 0.05; tb < seconds; tb += 4 * BEAT, bar++) {
        for (const n of CHORDS[bar % CHORDS.length]) beepTo(waitVol, HZ[n], tb, 4 * BEAT * 0.95, "sine", 0.05);
      }
    },
    waitingOff(seconds = 2) { fadeKnob(waitVol, seconds); },

    // HOORAY! A crowd is lots of voices: noise shaped like an "ahh",
    // swelling up, with a happy fanfare on top
    cheer() {
      wake();
      for (let v = 0; v < 6; v++) {
        const c = hiss(Math.random() * 0.15, 1.4, "bandpass", 700 + v * 180, 0.25);
        c.g.gain.setValueAtTime(0.02, c.t);
        c.g.gain.linearRampToValueAtTime(0.3, c.t + 0.25);
        c.g.gain.exponentialRampToValueAtTime(0.001, c.t + 1.4);
      }
      ["C5", "E5", "G5", "C6"].forEach((n, i) => beep(HZ[n], 0.1 + i * 0.1, i === 3 ? 0.6 : 0.12, "square", 0.07));
    },

    // Running away! Fast notes zig-zagging up and down (our own tune)
    scurry(seconds = 6) {
      wake();
      const notes = [523, 659, 587, 698, 659, 784, 698, 880, 784, 659, 587, 523];
      for (let i = 0, t = 0; t < seconds; i++, t += 0.12) {
        beep(notes[i % notes.length], t, 0.09, "square", 0.05);
        if (i % 2 === 0) beep(notes[i % notes.length] / 4, t, 0.1, "triangle", 0.2);
      }
    },
  };
})();

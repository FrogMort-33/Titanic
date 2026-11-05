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
//  (Called "Deux" so it can share a page with the other episodes' sounds.)
// =====================================================================

const Deux = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let trafficVol = null;   // volume knob for the traffic

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

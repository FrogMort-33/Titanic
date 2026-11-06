// =====================================================================
//  music.js  -  EPISODE 8 "A Close Encounter": sounds
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    CountrySounds.pastoral(secs)   our own bright, happy 8-bit country tune
//                                   (a flute over a bouncy "oom-pah" bass),
//                                   played round and round for 'secs'
//    CountrySounds.pastoralOff(s)   fade it away
//    CountrySounds.chirp()          one little bird: "tweet-tweet"
//    CountrySounds.birdsong(secs)   birds chirping now and then
//    CountrySounds.step()           a soft, happy "bop" for each step
//    CountrySounds.approach(secs)   the van's engine, far away at first,
//                                   getting LOUDER and LOUDER
//    CountrySounds.rewind()         a tape rewinding: "wheedle-eedle-eep"
//
//   THE NEAR MISS
//    CountrySounds.whisper(level)   Joe's "run..." - a breathy hiss, louder
//                                   for each level (1, 2, 3)
//    CountrySounds.panic(level)     a worried "uh-oh" stab, higher each level
//    CountrySounds.drip()           a drop of sweat: "plip"
//    CountrySounds.scream()         RUNNNN! a big wobbly shriek
//    CountrySounds.whoosh()         the van whizzing past
//
//  (Called "CountrySounds" so it can share a page with the other
//   episodes' sounds on the "Play all" page.)
// =====================================================================

const CountrySounds = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let tuneVol = null;      // volume knob for the country tune

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

  // A FLUTE-ish note: a soft "triangle" wave that fades in gently, with a
  // little wobble in its pitch (vibrato), like a real player's breath.
  function flute(freq, when, length, vol, to) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
    const wobble = ctx.createOscillator(), depth = ctx.createGain();
    wobble.frequency.value = 5.5; depth.gain.value = freq * 0.008;
    wobble.connect(depth).connect(osc.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);        // a breathy start
    g.gain.setValueAtTime(vol, t + length * 0.8);
    g.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(g).connect(to || out);
    osc.start(t); wobble.start(t); osc.stop(t + length + 0.02); wobble.stop(t + length + 0.02);
  }

  // Note names -> pitch (Hz), for writing tunes as letters
  const HZ = {};
  ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"].forEach((n, i) => {
    for (let octave = 2; octave <= 6; octave++) HZ[n + octave] = 440 * Math.pow(2, octave - 4 + (i - 9) / 12);
  });

  // ---- OUR COUNTRY TUNE (original, written for this episode) ----------
  // In G major, in a lilting "6/8" time: each bar has 6 little beats,
  // counted ONE-two-three FOUR-five-six, like a skipping walk.
  // Each note is [name, how many little beats it lasts]. Each bar adds up to 6.
  const MELODY = [
    ["G4", 2], ["B4", 1], ["D5", 2], ["B4", 1],     // bar 1
    ["C5", 2], ["E5", 1], ["D5", 3],                // bar 2
    ["B4", 2], ["G4", 1], ["A4", 2], ["B4", 1],     // bar 3
    ["A4", 3], ["D4", 3],                           // bar 4
    ["G4", 2], ["B4", 1], ["D5", 2], ["G5", 1],     // bar 5
    ["E5", 2], ["C5", 1], ["D5", 2], ["B4", 1],     // bar 6
    ["C5", 2], ["A4", 1], ["B4", 2], ["A4", 1],     // bar 7
    ["G4", 6],                                      // bar 8: home!
  ];
  // The chord for each bar: [bass note, the other notes of the chord]
  const CHORDS = [
    ["G2", ["G4", "B4", "D5"]], ["C3", ["G4", "C5", "E5"]],
    ["G2", ["G4", "B4", "D5"]], ["D3", ["F#4", "A4", "D5"]],
    ["G2", ["G4", "B4", "D5"]], ["C3", ["G4", "C5", "E5"]],
    ["D3", ["F#4", "A4", "D5"]], ["G2", ["G4", "B4", "D5"]],
  ];
  const BEAT = 0.2;                       // one little beat, in seconds
  const LOOP = 8 * 6 * BEAT;              // the whole tune: 8 bars (9.6 seconds)

  // Play the tune once, starting 'start' seconds from now
  function playTune(start, to) {
    // the flute melody
    let t = start;
    for (const [note, beats] of MELODY) {
      flute(HZ[note], t, beats * BEAT * 0.95, 0.11, to);
      t += beats * BEAT;
    }
    // under it, for every bar: OOM (the bass) on beat 1, PAH on beat 4,
    // and quiet "plinks" of the chord on the other beats, like a guitar
    CHORDS.forEach(([bass, notes], bar) => {
      const b = start + bar * 6 * BEAT;
      const fifth = HZ[bass] * 1.5;                     // the bass's "pah" note
      beep(HZ[bass], b, BEAT * 1.6, "square", 0.05, to);
      beep(fifth, b + 3 * BEAT, BEAT * 1.6, "square", 0.04, to);
      [1, 2, 4, 5].forEach((beat, i) =>
        beep(HZ[notes[i % 3]], b + beat * BEAT, BEAT * 0.5, "square", 0.018, to));
    });
  }

  return {
    // The happy country tune, round and round, for 'seconds'
    pastoral(seconds = 60) {
      wake();
      const t = ctx.currentTime;
      if (tuneVol) tuneVol.disconnect();
      tuneVol = ctx.createGain(); tuneVol.connect(out);
      tuneVol.gain.setValueAtTime(0, t);
      tuneVol.gain.linearRampToValueAtTime(1, t + 1);
      for (let start = 0; start < seconds; start += LOOP) playTune(start, tuneVol);
    },

    pastoralOff(seconds = 1.5) {
      if (!tuneVol) return;
      tuneVol.gain.setValueAtTime(tuneVol.gain.value, ctx.currentTime);
      tuneVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // A bird: two or three very quick high whistles that swoop UP
    chirp() {
      wake();
      const n = 2 + Math.floor(Math.random() * 2);
      const base = 2200 + Math.random() * 1200;
      for (let i = 0; i < n; i++) {
        const t = ctx.currentTime + i * 0.11;
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(base, t);
        o.frequency.exponentialRampToValueAtTime(base * 1.6, t + 0.06);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.01);
        g.gain.linearRampToValueAtTime(0, t + 0.07);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.08);
      }
    },

    // Birds chirping every second or two, for 'seconds'
    birdsong(seconds = 20) {
      wake();
      let t = 0.3;
      while (t < seconds) {
        setTimeout(() => this.chirp(), t * 1000);
        t += 0.8 + Math.random() * 1.8;
      }
    },

    // One happy step: a soft, short "bop" (a quick drop in pitch)
    step() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(260, t + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.12);
    },

    // The van coming: a low growl that starts almost silent, far away,
    // and gets LOUDER (and a little higher) as it comes closer.
    // Everything is a curve that speeds up at the end ("exponential").
    approach(seconds = 20) {
      wake();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(40, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + seconds);
      const rough = ctx.createOscillator(), depth = ctx.createGain();   // the "brrrr"
      rough.frequency.value = 18; depth.gain.value = 0.6;
      const level = ctx.createGain(); level.gain.value = 0.6;
      rough.connect(depth).connect(level.gain);
      const low = ctx.createBiquadFilter(); low.type = "lowpass";
      low.frequency.setValueAtTime(200, t);
      low.frequency.exponentialRampToValueAtTime(1200, t + seconds);  // closer = brighter
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.002, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + seconds);
      g.gain.linearRampToValueAtTime(0, t + seconds + 1.5);          // then it fades
      osc.connect(low).connect(level).connect(g).connect(out);
      osc.start(t); rough.start(t); osc.stop(t + seconds + 1.6); rough.stop(t + seconds + 1.6);
    },

    // REWIND: a squeaky tape whizzing backwards (pitch wobbling and rising)
    rewind() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(1800, t + 1.4);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 14; depth.gain.value = 120;
      wob.connect(depth).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.linearRampToValueAtTime(0, t + 1.5);
      o.connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + 1.6); wob.stop(t + 1.6);
    },

    // A burst of hiss (random numbers) through a filter: our "whisper"
    whisper(level = 1) {
      wake();
      const t = ctx.currentTime, len = 0.6 + level * 0.3;
      const n = Math.floor(ctx.sampleRate * len);
      const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2500; f.Q.value = 1.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.04 * level, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + len);
      src.connect(f).connect(g).connect(out);
      src.start(t);
    },

    // Two quick notes going DOWN: "uh-oh". Each level a bit higher and louder.
    panic(level = 1) {
      wake();
      const top = 400 * Math.pow(1.26, level);
      beep(top, 0, 0.12, "square", 0.04 + level * 0.015);
      beep(top * 0.84, 0.14, 0.25, "square", 0.04 + level * 0.015);
    },

    // A drop of sweat: a tiny "plip" (a quick jump UP in pitch)
    drip() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(900, t);
      o.frequency.exponentialRampToValueAtTime(1900, t + 0.06);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.1);
    },

    // RUNNNN! A high note that shoots up and wobbles wildly (8-bit shriek)
    scream() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(500, t);
      o.frequency.exponentialRampToValueAtTime(1300, t + 0.25);
      o.frequency.setValueAtTime(1300, t + 1.2);
      o.frequency.exponentialRampToValueAtTime(700, t + 1.6);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 11; depth.gain.value = 90;
      wob.connect(depth).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.05);
      g.gain.setValueAtTime(0.09, t + 1.3);
      g.gain.linearRampToValueAtTime(0, t + 1.6);
      o.connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + 1.7); wob.stop(t + 1.7);
    },

    // The van whizzing past: a swoosh of hiss that rises then falls
    whoosh() {
      wake();
      const t = ctx.currentTime, len = 0.9;
      const n = Math.floor(ctx.sampleRate * len);
      const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2;
      f.frequency.setValueAtTime(400, t);
      f.frequency.exponentialRampToValueAtTime(3000, t + 0.35);
      f.frequency.exponentialRampToValueAtTime(300, t + len);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.3);
      g.gain.linearRampToValueAtTime(0, t + len);
      src.connect(f).connect(g).connect(out);
      src.start(t);
    },
  };
})();

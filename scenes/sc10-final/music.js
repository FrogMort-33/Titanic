// =====================================================================
//  music.js  -  EPISODE 10 "Final Destination (almost)": sounds
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    FinalSounds.valkyries(secs)  our 8-bit "Ride of the Valkyries" - the
//                                 SAME tune Enda approved for episode 1
//    FinalSounds.valkyriesOff(s)  fade it away
//    FinalSounds.pastoral(secs)   the happy 8-bit country tune from episode 8
//    FinalSounds.pastoralOff(s)   fade it away
//    FinalSounds.tada()           "ta-DA!" for the pop-up picture
//    FinalSounds.pop()            a quick "bloop" as something pops up
//    FinalSounds.engine(secs)     the van's engine ticking over: brrrrm
//    FinalSounds.engineOff(s)     the engine fades away
//    FinalSounds.whoosh()         something flying in fast
//    FinalSounds.boop()           BOOP! a rubbery bounce (the tyre hits)
//    FinalSounds.boing()          a springy "boi-oi-oing" as it flies off
//    FinalSounds.ahem()           a polite little "ah-hem" (two soft notes)
//    FinalSounds.sting()          DUN-DUN! a worried warning
//    FinalSounds.scream()         a big wobbly 8-bit shriek
//
//   THE ROUNDABOUT
//    FinalSounds.honk(pitch)      HONK! a car horn (two notes together)
//    FinalSounds.stall()          the engine coughs and dies: "brr-brr-blub"
//    FinalSounds.rev()            VROOM: the engine revs up again
//    FinalSounds.worry()          a wobbly "uh-oh" for worried Enda
//
//   THE AWARD AND THE WRONG ROAD
//    FinalSounds.fanfare()        a proud trumpety "da-da-da DAAA!" for the award
//    FinalSounds.chatter(s, p)    8-bit "talking" babble for s seconds
//                                 (p = pitch: 1 is normal, higher is squeakier)
//    FinalSounds.haha()           "HA HA HA HA!" - the van laughing
//
//   MEANWHILE... THE GREEN CAR
//    FinalSounds.screech()        tyres squealing as the green car swerves
//    FinalSounds.wilhelm(p)       "AAAH-ah-aaagh!" our own made-up scream in the
//                                 style of the famous film scream (the same one
//                                 as episode 3); p = pitch, so each potato differs
//    FinalSounds.squeeze()        a squeaky creak (Joe squeezing his bag)
//    FinalSounds.sadTrombone()    "wah wah wah waaaah" for the bag's R.I.P.
//
//  (Called "FinalSounds" so it can share a page with the other
//   episodes' sounds on the "Play all" page.)
// =====================================================================

const FinalSounds = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let tuneVol = null;      // volume knob for the Valkyries
  let engineVol = null;    // volume knob for the engine
  let countryVol = null;   // volume knob for the country tune

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

  // Note names -> pitch (Hz) for the country tune (every note, octaves 2-6)
  const HZ2 = {};
  ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"].forEach((n, i) => {
    for (let octave = 2; octave <= 6; octave++) HZ2[n + octave] = 440 * Math.pow(2, octave - 4 + (i - 9) / 12);
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
  const LILT = 0.2;                       // one little beat, in seconds
  const LOOP = 8 * 6 * LILT;              // the whole tune: 8 bars (9.6 seconds)

  // Play the tune once, starting 'start' seconds from now
  function playTune(start, to) {
    // the flute melody
    let t = start;
    for (const [note, beats] of MELODY) {
      flute(HZ2[note], t, beats * LILT * 0.95, 0.11, to);
      t += beats * LILT;
    }
    // under it, for every bar: OOM (the bass) on beat 1, PAH on beat 4,
    // and quiet "plinks" of the chord on the other beats, like a guitar
    CHORDS.forEach(([bass, notes], bar) => {
      const b = start + bar * 6 * LILT;
      const fifth = HZ2[bass] * 1.5;                     // the bass's "pah" note
      beep(HZ2[bass], b, LILT * 1.6, "square", 0.05, to);
      beep(fifth, b + 3 * LILT, LILT * 1.6, "square", 0.04, to);
      [1, 2, 4, 5].forEach((beat, i) =>
        beep(HZ2[notes[i % 3]], b + beat * LILT, LILT * 0.5, "square", 0.018, to));
    });
  }

  return {
    valkyries(seconds = 16) {
      wake();
      if (tuneVol) tuneVol.disconnect();
      tuneVol = ctx.createGain(); tuneVol.gain.value = 0.9; tuneVol.connect(out);
      let t = 0.1, i = 0;
      while (t < seconds) { t += playBar(t, TUNE[i % TUNE.length]); i++; }
    },

    // The happy country tune, round and round, for 'seconds'
    pastoral(seconds = 60) {
      wake();
      const t = ctx.currentTime;
      if (countryVol) countryVol.disconnect();
      countryVol = ctx.createGain(); countryVol.connect(out);
      countryVol.gain.setValueAtTime(0, t);
      countryVol.gain.linearRampToValueAtTime(1, t + 1);
      for (let start = 0; start < seconds; start += LOOP) playTune(start, countryVol);
    },

    pastoralOff(seconds = 1.5) {
      if (!countryVol) return;
      countryVol.gain.setValueAtTime(countryVol.gain.value, ctx.currentTime);
      countryVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
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

    // a polite "ah-HEM": two soft notes, the second higher
    ahem() {
      wake();
      beep(330, 0, 0.18, "triangle", 0.12);
      beep(440, 0.22, 0.3, "triangle", 0.12);
    },

    // DUN-DUN! two low, loud notes, the second one lower
    sting() {
      wake();
      beep(147, 0, 0.25, "square", 0.12);
      beep(139, 0.3, 0.6, "square", 0.12);
    },

    // a shriek: a high note that shoots up and wobbles wildly
    scream() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(500, t);
      o.frequency.exponentialRampToValueAtTime(1400, t + 0.25);
      o.frequency.setValueAtTime(1400, t + 1.4);
      o.frequency.exponentialRampToValueAtTime(700, t + 1.9);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 11; depth.gain.value = 90;
      wob.connect(depth).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.05);
      g.gain.setValueAtTime(0.09, t + 1.5);
      g.gain.linearRampToValueAtTime(0, t + 1.9);
      o.connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + 2); wob.stop(t + 2);
    },

    // HONK: two square-wave notes at once (a real car horn is two notes
    // that clash a little), short and loud. 'pitch' changes the car.
    honk(pitch = 1) {
      wake();
      beep(370 * pitch, 0, 0.28, "square", 0.05);
      beep(466 * pitch, 0, 0.28, "square", 0.05);
    },

    // Stalling: a few low "brrm"s, each lower and further apart, then nothing
    stall() {
      wake();
      [[70, 0], [62, 0.22], [52, 0.5], [44, 0.85]].forEach(([f, when]) =>
        beep(f, when, 0.18, "sawtooth", 0.14));
    },

    // VROOM: the engine note shoots up and comes back down
    rev() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(55, t);
      o.frequency.exponentialRampToValueAtTime(190, t + 0.3);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.8);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 1100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      o.connect(low).connect(g).connect(out); o.start(t); o.stop(t + 0.9);
    },

    // A fanfare: three quick notes, then a long one, with a chord under it
    fanfare() {
      wake();
      [[HZ.G5, 0, 0.12], [HZ.G5, 0.14, 0.12], [HZ.G5, 0.28, 0.12], [HZ.C6, 0.42, 1.1]].forEach(([f, when, len]) =>
        beep(f, when, len, "square", 0.07));
      for (const f of [HZ.C5, HZ.E5, HZ.G5]) beep(f, 0.42, 1.1, "triangle", 0.06);
    },

    // Talking: lots of short random notes close to one pitch (like
    // cartoon characters babbling). Every so often a little gap, like
    // between words.
    chatter(seconds = 2, pitch = 1) {
      wake();
      for (let t = 0; t < seconds; t += 0.09) {
        if (Math.random() < 0.15) continue;                      // a gap between "words"
        const f = (300 + Math.random() * 180) * pitch;
        beep(f, t, 0.07, "square", 0.035);
      }
    },

    // Laughing: "HA HA HA HA" - four bouncy notes, each a bit lower
    haha() {
      wake();
      [523, 494, 466, 440, 415].forEach((f, i) => {
        const t = ctx.currentTime + i * 0.2;
        const o = ctx.createOscillator(); o.type = "square";
        o.frequency.setValueAtTime(f * 1.25, t);                // each "HA" starts high...
        o.frequency.exponentialRampToValueAtTime(f, t + 0.12);  // ...and drops
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.07, t);
        g.gain.linearRampToValueAtTime(0, t + 0.16);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.18);
      });
    },

    // Tyres squealing: a high wobbly whistle, made rough with a filter
    screech() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(1500, t);
      o.frequency.linearRampToValueAtTime(1100, t + 0.9);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 30; depth.gain.value = 120;
      wob.connect(depth).connect(o.frequency);
      const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = 1300; band.Q.value = 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.05);
      g.gain.linearRampToValueAtTime(0, t + 0.95);
      o.connect(band).connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + 1); wob.stop(t + 1);
    },

    // The film-style scream (copied from episode 3), with a pitch knob.
    // A voice is a buzz (sawtooth) shaped by the mouth: two "bandpass"
    // filters make the "aaah" sound. The pitch jumps up, wobbles, drops,
    // jumps again, then falls away.
    wilhelm(pitch = 1) {
      wake();
      const t = ctx.currentTime;
      const voice = ctx.createOscillator();
      voice.type = "sawtooth";
      const f = voice.frequency;
      f.setValueAtTime(420 * pitch, t);
      f.exponentialRampToValueAtTime(980 * pitch, t + 0.08);    // AAAH
      f.linearRampToValueAtTime(900 * pitch, t + 0.42);
      f.exponentialRampToValueAtTime(640 * pitch, t + 0.55);    // -ah
      f.exponentialRampToValueAtTime(880 * pitch, t + 0.66);    // -AA
      f.exponentialRampToValueAtTime(420 * pitch, t + 1.15);    // -aaagh
      const wobble = ctx.createOscillator(), depth = ctx.createGain();
      wobble.frequency.value = 7; depth.gain.value = 25;
      wobble.connect(depth).connect(f);
      const mix = ctx.createGain();
      for (const [formant, q] of [[800, 6], [1250, 7]]) {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = formant * Math.sqrt(pitch); bp.Q.value = q;
        voice.connect(bp).connect(mix);
      }
      const vol = ctx.createGain();
      vol.gain.setValueAtTime(0, t);
      vol.gain.linearRampToValueAtTime(1.3, t + 0.05);
      vol.gain.setValueAtTime(1.3, t + 0.45);
      vol.gain.linearRampToValueAtTime(0.7, t + 0.55);
      vol.gain.linearRampToValueAtTime(1.1, t + 0.66);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      mix.connect(vol).connect(out);
      voice.start(t); wobble.start(t);
      voice.stop(t + 1.25); wobble.stop(t + 1.25);
    },

    // A squeaky creak: a quick wobbly note sliding up
    squeeze() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(500 + Math.random() * 150, t);
      o.frequency.linearRampToValueAtTime(900, t + 0.25);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.linearRampToValueAtTime(0, t + 0.28);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.3);
    },

    // "wah wah wah waaaah": four sad notes going down, the last one wobbles
    sadTrombone() {
      wake();
      [[311, 0, 0.45], [294, 0.5, 0.45], [277, 1.0, 0.45], [262, 1.5, 1.4]].forEach(([f, when, len], i) => {
        const t = ctx.currentTime + when;
        const o = ctx.createOscillator(); o.type = "sawtooth";
        o.frequency.setValueAtTime(f * 1.03, t);
        o.frequency.linearRampToValueAtTime(f, t + 0.1);
        if (i === 3) {                                          // the last note wobbles
          const wob = ctx.createOscillator(), depth = ctx.createGain();
          wob.frequency.value = 5; depth.gain.value = 8;
          wob.connect(depth).connect(o.frequency); wob.start(t); wob.stop(t + len);
        }
        const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 900;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.05);
        g.gain.setValueAtTime(0.12, t + len - 0.1);
        g.gain.linearRampToValueAtTime(0, t + len);
        o.connect(low).connect(g).connect(out); o.start(t); o.stop(t + len + 0.02);
      });
    },

    // a wobbly, sliding-down "uh-ohhh"
    worry() {
      wake();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(440, t);
      o.frequency.exponentialRampToValueAtTime(260, t + 1.2);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 7; depth.gain.value = 12;
      wob.connect(depth).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.linearRampToValueAtTime(0, t + 1.3);
      o.connect(g).connect(out);
      o.start(t); wob.start(t); o.stop(t + 1.35); wob.stop(t + 1.35);
    },
  };
})();

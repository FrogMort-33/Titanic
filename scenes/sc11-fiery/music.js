// =====================================================================
//  music.js  -  EPISODE 11 "Fiery Finale ?": sounds
// =====================================================================
//
//  All made by the browser, so there are no sound files (USB-stick safe):
//
//    FierySounds.valkyries(secs)  our 8-bit "Ride of the Valkyries" - the
//                                 SAME tune Enda approved for episode 1
//    FierySounds.valkyriesOff(s)  fade it away
//    FierySounds.pastoral(secs)   the happy 8-bit country tune from episode 8
//    FierySounds.pastoralOff(s)   fade it away
//    FierySounds.fire(secs, vol)  a roaring, crackling fire
//    FierySounds.siren(secs)      a French "pin-pon" siren
//    FierySounds.heartbeat(s, bpm) a heavy, racing heartbeat
//    FierySounds.horror(secs)     the spooky 8-bit organ tune from episode 7
//    FierySounds.horrorOff(s)     fade it away
//    FierySounds.valkyriesGlitch(s) the Valkyries SLOW and glitchy (pictures 73, 74)
//    FierySounds.glitchOff(s)     fade it away
//    FierySounds.splutter(secs)   a tired engine coughing "put... put-put"
//    FierySounds.crash()          a crunching crash
//    FierySounds.plop()           something light landing
//    FierySounds.yippee()         a happy little "yippee!"
//    FierySounds.sob(secs, pitch) happy crying "hoo-hoo-hoo"
//    FierySounds.marseillaise(s)  the French national anthem, 8-bit (stop it
//                                 with valkyriesOff - it shares that volume knob)
//    FierySounds.tada()           "ta-DA!" for the pop-up picture
//    FierySounds.pop()            a quick "bloop" as something pops up
//    FierySounds.engine(secs)     the van's engine ticking over: brrrrm
//    FierySounds.engineOff(s)     the engine fades away
//    FierySounds.whoosh()         something flying in fast
//    FierySounds.boop()           BOOP! a rubbery bounce (the tyre hits)
//    FierySounds.boing()          a springy "boi-oi-oing" as it flies off
//    FierySounds.ahem()           a polite little "ah-hem" (two soft notes)
//    FierySounds.sting()          DUN-DUN! a worried warning
//    FierySounds.scream()         a big wobbly 8-bit shriek
//
//   THE ROUNDABOUT
//    FierySounds.honk(pitch)      HONK! a car horn (two notes together)
//    FierySounds.stall()          the engine coughs and dies: "brr-brr-blub"
//    FierySounds.rev()            VROOM: the engine revs up again
//    FierySounds.worry()          a wobbly "uh-oh" for worried Enda
//
//   THE AWARD AND THE WRONG ROAD
//    FierySounds.fanfare()        a proud trumpety "da-da-da DAAA!" for the award
//    FierySounds.chatter(s, p)    8-bit "talking" babble for s seconds
//                                 (p = pitch: 1 is normal, higher is squeakier)
//    FierySounds.haha()           "HA HA HA HA!" - the van laughing
//
//   MEANWHILE... THE GREEN CAR
//    FierySounds.screech()        tyres squealing as the green car swerves
//    FierySounds.wilhelm(p)       "AAAH-ah-aaagh!" our own made-up scream in the
//                                 style of the famous film scream (the same one
//                                 as episode 3); p = pitch, so each potato differs
//    FierySounds.squeeze()        a squeaky creak (Joe squeezing his bag)
//    FierySounds.sadTrombone()    "wah wah wah waaaah" for the bag's R.I.P.
//
//  (Called "FierySounds" so it can share a page with the other
//   episodes' sounds on the "Play all" page.)
// =====================================================================

const FierySounds = (() => {
  let ctx = null;          // the audio engine (shared with the other episodes)
  let out = null;          // volume knob for this episode
  let tuneVol = null;      // volume knob for the Valkyries
  let engineVol = null;    // volume knob for the engine
  let countryVol = null;   // volume knob for the country tune
  let horrorVol = null;
  let glitchVol = null;    // volume knob for the glitchy Valkyries    // volume knob for the spooky tune (from episode 7)

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

    // FIRE: a low roar (soft rumbling hiss) with crackles (tiny clicks of
    // hiss at random moments), for 'seconds'
    fire(seconds = 20, vol = 0.12) {
      wake();
      const t = ctx.currentTime;
      // the roar: hiss through a low filter, gently swelling in and out
      const roar = hiss(seconds);
      const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 1.5);
      g.gain.setValueAtTime(vol, t + seconds - 2);
      g.gain.linearRampToValueAtTime(0, t + seconds);
      roar.connect(low).connect(g).connect(out);
      roar.start(t);
      // the crackles: lots of very short, sharp bursts
      for (let x = 0.2; x < seconds - 0.5; x += 0.03 + Math.random() * 0.18) {
        const c = hiss(0.02);
        const high = ctx.createBiquadFilter(); high.type = "highpass"; high.frequency.value = 2000 + Math.random() * 3000;
        const cg = ctx.createGain();
        cg.gain.setValueAtTime(vol * (0.6 + Math.random()), t + x);
        cg.gain.exponentialRampToValueAtTime(0.001, t + x + 0.02);
        c.connect(high).connect(cg).connect(out);
        c.start(t + x);
      }
    },

    // A French "PIN-PON" siren: two notes, high-low, high-low, for 'seconds'
    siren(seconds = 5) {
      wake();
      for (let x = 0; x < seconds - 0.1; x += 0.9) {
        beep(870, x, 0.45, "square", 0.07);         // PIN
        beep(650, x + 0.45, 0.45, "square", 0.07);  // PON
      }
    },

    // ================= HORROR (the same tune as episode 7) =================
    // Our own spooky tune, in a minor key, on a wheezy 8-bit "organ"
    // (two square waves slightly out of tune with each other = wobbly)
    horror(seconds = 8) {
      wake();
      if (horrorVol) horrorVol.disconnect();
      horrorVol = ctx.createGain(); horrorVol.gain.value = 0.9; horrorVol.connect(out);
      const BEAT = 0.32;
      // the notes it uses (Hz)
      const NOTE = { D5: 587.33, F5: 698.46, A5: 880.00, "G#5": 830.61, G5: 783.99, E5: 659.25, "C#5": 554.37,
                     A4: 440.00, Bb4: 466.16, G4: 392.00, F4: 349.23, E4: 329.63, D4: 293.66,
                     D3: 146.83, Bb2: 116.54, G2: 98.00, A2: 110.00 };
      const TUNE = [["D5", 1], ["F5", 1], ["A5", 1], ["G#5", 3], ["G5", 1], ["F5", 1], ["E5", 1], ["C#5", 3],
                    ["D5", 1], ["A4", 1], ["Bb4", 1], ["G4", 2], ["F4", 1], ["E4", 1], ["D4", 4]];
      const BASS = ["D3", "D3", "Bb2", "Bb2", "G2", "G2", "A2", "A2"];
      let t = 0.05, i = 0;
      while (t < seconds) {
        const [n, beats] = TUNE[i % TUNE.length];
        const len = beats * BEAT * 0.95;
        organ(NOTE[n], t, len);
        t += beats * BEAT; i++;
      }
      for (let tb = 0.05, b = 0; tb < seconds; tb += 2 * BEAT, b++) {
        const n = NOTE[BASS[b % BASS.length]];
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

    // A heavy, racing HEARTBEAT: "lub-DUB, lub-DUB" (two low thumps),
    // 'bpm' beats a minute, for 'seconds'
    heartbeat(seconds = 6, bpm = 150) {
      wake();
      const thump = (when, vol, pitch) => {
        const t = ctx.currentTime + when;
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(pitch, t);
        o.frequency.exponentialRampToValueAtTime(pitch * 0.5, t + 0.12);   // a falling "thud"
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.2);
      };
      for (let x = 0; x < seconds; x += 60 / bpm) {
        thump(x, 0.5, 90);           // lub
        thump(x + 0.13, 0.65, 75);   // DUB
      }
    },

    // ---- THE GLITCHY VALKYRIES (pictures 73 and 74) ----------------------
    // The same tune as always, but SLOW (each beat 1.5 times longer), a bit
    // out of tune, and broken up like a scratched CD:
    //   - every note is pushed a little sharp or flat at random ("wonky")
    //   - now and then a note STUTTERS (plays 3 times, quickly, very short)
    //   - now and then a note just DROPS OUT (silence)
    //   - now and then a note jumps up an octave with a crackle of hiss
    // Math.random() makes it different every time it plays.
    valkyriesGlitch(seconds = 30) {
      wake();
      if (glitchVol) glitchVol.disconnect();
      glitchVol = ctx.createGain(); glitchVol.gain.value = 0.9; glitchVol.connect(out);
      const SLOW = 1.5 * BEAT;                     // one (slow) beat, in seconds
      const note = (name, when, length) => {
        const r = Math.random();
        let f = HZ[name] * (1 + (Math.random() - 0.5) * 0.06);    // wonky tuning
        if (r < 0.10) return;                                     // drop out
        if (r < 0.22) {                                           // stutter
          for (let k = 0; k < 3; k++) beep(f, when + k * 0.07, 0.06, "square", 0.1, glitchVol);
          return;
        }
        if (r < 0.30) {                                           // jump up + crackle
          f *= 2;
          const h = hiss(0.08), g = ctx.createGain(); g.gain.value = 0.05;
          h.connect(g).connect(glitchVol); h.start(ctx.currentTime + when);
        }
        beep(f, when, length, "square", 0.11, glitchVol);
      };
      let t = 0.1, i = 0;
      while (t < seconds) {
        const [n1, n2, n3, n4, n5] = TUNE[i % TUNE.length];
        let x = t;
        note(n1, x, RHYTHM[0] * SLOW); x += RHYTHM[0] * SLOW;
        note(n2, x, RHYTHM[1] * SLOW); x += RHYTHM[1] * SLOW;
        note(n3, x, RHYTHM[2] * SLOW); x += RHYTHM[2] * SLOW;
        if (n4 === n5) note(n4, x, 2 * SLOW);
        else { note(n4, x, SLOW); note(n5, x + SLOW, SLOW); }
        t += 3 * SLOW; i++;
      }
    },

    glitchOff(seconds = 2) {
      if (!glitchVol) return;
      glitchVol.gain.setValueAtTime(glitchVol.gain.value, ctx.currentTime);
      glitchVol.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    // A tired engine SPLUTTERING: low coughs ("put... put-put... put")
    // at uneven gaps, for 'seconds'
    splutter(seconds = 8) {
      wake();
      let x = 0;
      while (x < seconds) {
        beep(55 + Math.random() * 25, x, 0.09, "sawtooth", 0.16);
        x += 0.15 + Math.random() * (Math.random() < 0.2 ? 0.9 : 0.3);   // sometimes a long gap
      }
    },

    // A CRASH: a burst of hiss that dies away, with a low thump
    crash() {
      wake();
      const t = ctx.currentTime;
      const h = hiss(0.7), g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      h.connect(g).connect(out); h.start(t);
      beep(70, 0, 0.25, "sine", 0.5);
    },

    // A little "plop" (something light hitting the ground)
    plop() {
      wake();
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.12);
      g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.16);
    },

    // A happy little "yippee!" (two quick rising whistles)
    yippee() {
      wake();
      [0, 0.18].forEach((w, k) => {
        const t = ctx.currentTime + w, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.setValueAtTime(700 + k * 200, t);
        o.frequency.exponentialRampToValueAtTime(1400 + k * 300, t + 0.14);
        g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.17);
      });
    },

    // Happy CRYING: wobbly falling "hoo-hoo-hoo" sobs, for 'seconds'
    sob(seconds = 4, pitch = 1) {
      wake();
      for (let x = 0; x < seconds; x += 0.45 + Math.random() * 0.3) {
        const t = ctx.currentTime + x, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle"; o.frequency.setValueAtTime(520 * pitch, t);
        o.frequency.exponentialRampToValueAtTime(330 * pitch, t + 0.3);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.33);
      }
    },

    // ---- LA MARSEILLAISE, the French national anthem (1792, so free for
    // anyone to use), in 8-bit, for the afterword pages. Each note is
    // [name, length in beats]; "-" is a rest. One beat = 0.5 seconds.
    // A trumpet-ish square wave plays the tune, a soft triangle wave plays
    // each note an octave lower underneath (like a tuba).
    marseillaise(seconds = 25) {
      wake();
      const F = { D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
                  D5: 587.33, E5: 659.25 };
      const TUNE = [
        // "Al-lons en-fants de la pa-tri-e, le jour de gloi-re est ar-ri-vé!"
        ["D4", 0.75], ["D4", 0.25], ["G4", 1], ["G4", 1], ["A4", 1], ["A4", 1], ["D5", 1.5], ["B4", 0.75],
        ["G4", 0.25], ["G4", 0.75], ["B4", 0.25], ["G4", 0.75], ["E4", 0.25], ["C5", 2], ["A4", 0.75],
        ["Fs4", 0.25], ["G4", 2], ["-", 1],
        // "Contre nous de la tyrannie, l'étendard sanglant est levé"
        ["G4", 0.75], ["A4", 0.25], ["B4", 1], ["B4", 1], ["B4", 1], ["C5", 0.75], ["B4", 0.25], ["B4", 1],
        ["A4", 1], ["-", 1], ["A4", 0.75], ["B4", 0.25], ["C5", 1], ["C5", 1], ["C5", 1], ["D5", 0.75],
        ["C5", 0.25], ["B4", 2], ["-", 1],
        // "Aux armes, citoyens! Formez vos bataillons!"
        ["D5", 2], ["B4", 0.75], ["G4", 0.25], ["A4", 3], ["-", 0.5], ["D5", 0.5], ["D5", 1.5], ["B4", 0.5],
        ["G4", 1], ["E4", 1], ["D4", 3], ["-", 1],
        // "Marchons, marchons!"
        ["G4", 1.5], ["A4", 0.5], ["B4", 2], ["C5", 1.5], ["D5", 0.5], ["E5", 2], ["D5", 1], ["G4", 1],
        ["G4", 3], ["-", 2],
      ];
      const BEAT2 = 0.5;
      if (tuneVol) tuneVol.disconnect();
      tuneVol = ctx.createGain(); tuneVol.gain.value = 0.9; tuneVol.connect(out);
      let t = 0.1;
      while (t < seconds) {
        for (const [name, beats] of TUNE) {
          if (t >= seconds) break;
          const len = beats * BEAT2;
          if (name !== "-") {
            beep(F[name], t, len, "square", 0.1, tuneVol);
            beep(F[name] / 2, t, len, "triangle", 0.12, tuneVol);
          }
          t += len;
        }
      }
    },
  };
})();

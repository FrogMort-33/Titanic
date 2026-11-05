// =====================================================================
//  music.js  -  SC-03 "Flights of Fantasy Fun !": sound effects
// =====================================================================
//
//  No tune in this scene (yet) - just sounds, all made by the browser
//  so there are no sound files (USB-stick safe):
//
//    FlightSounds.engine()      the plane's propeller drone, until stopped
//    FlightSounds.engineOff(s)  fade the drone away over s seconds
//    FlightSounds.thunder()     a lightning CRACK, then a long rumble
//    FlightSounds.scream()      "AAAH-ah-aaagh!" - our own made-up scream in
//                               the style of the famous film scream (the real
//                               recording is copyrighted, so we make our own)
//    FlightSounds.boing()       a spring: "doy-oy-oy-oing"
//
//  HOW THUNDER IS MADE
//    "Noise" is random numbers played as sound: it hisses like a TV
//    between channels. A short burst of high hiss = the crack of the
//    lightning. A long, slowly fading burst of LOW hiss (a "filter"
//    takes away the high part) = the rumble rolling away.
// =====================================================================

const FlightSounds = (() => {
  let ctx = null;          // the audio engine (shared with other scenes)
  let out = null;          // volume knob for this scene
  let drone = null;        // the engine sound while it's running

  function wake() {
    // One shared audio engine for the whole page (iPad only lets a tap
    // switch sound on, so "Play all" reuses the one the Play tap started).
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (!out) { out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination); }
  }

  // A buffer of noise, 'seconds' long. 'deep' = true makes "brown" noise:
  // each sample wanders a little from the last, which sounds like a roar.
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

  return {
    engine() {
      wake();
      const t = ctx.currentTime;
      // Two low buzzes, very slightly out of tune with each other = "wub wub"
      const a = ctx.createOscillator(), b = ctx.createOscillator();
      a.type = b.type = "sawtooth";
      a.frequency.value = 70; b.frequency.value = 72;
      const soften = ctx.createBiquadFilter();       // take the harsh edge off
      soften.type = "lowpass"; soften.frequency.value = 500;
      const vol = ctx.createGain();
      vol.gain.setValueAtTime(0, t);
      vol.gain.linearRampToValueAtTime(0.12, t + 1);  // fade in over a second
      a.connect(soften); b.connect(soften);
      soften.connect(vol).connect(out);
      a.start(t); b.start(t);
      drone = { a, b, vol };
    },

    engineOff(seconds = 2) {
      if (!drone) return;
      const t = ctx.currentTime;
      drone.vol.gain.setValueAtTime(drone.vol.gain.value, t);
      drone.vol.gain.linearRampToValueAtTime(0, t + seconds);
      drone.a.stop(t + seconds + 0.1);
      drone.b.stop(t + seconds + 0.1);
      drone = null;
    },

    // ---- The scream --------------------------------------------------
    // A voice is a buzz (sawtooth) shaped by the mouth. The mouth makes
    // some pitches louder than others ("formants"); two "bandpass" filters
    // do that job here, at the pitches that sound like "aaah".
    // The pitch then goes: jump up, wobble, drop, jump again, fall away.
    scream() {
      wake();
      const t = ctx.currentTime;
      const voice = ctx.createOscillator();
      voice.type = "sawtooth";
      const f = voice.frequency;
      f.setValueAtTime(420, t);
      f.exponentialRampToValueAtTime(980, t + 0.08);    // AAAH
      f.linearRampToValueAtTime(900, t + 0.42);
      f.exponentialRampToValueAtTime(640, t + 0.55);    // -ah
      f.exponentialRampToValueAtTime(880, t + 0.66);    // -AA
      f.exponentialRampToValueAtTime(420, t + 1.15);    // -aaagh (falling away)

      // Wobble (vibrato): a slow wave nudging the pitch up and down
      const wobble = ctx.createOscillator(), depth = ctx.createGain();
      wobble.frequency.value = 7; depth.gain.value = 25;
      wobble.connect(depth).connect(f);

      // The "mouth": two formant filters side by side
      const mix = ctx.createGain();
      for (const [pitch, q] of [[800, 6], [1250, 7]]) {
        const formant = ctx.createBiquadFilter();
        formant.type = "bandpass"; formant.frequency.value = pitch; formant.Q.value = q;
        voice.connect(formant).connect(mix);
      }
      const vol = ctx.createGain();
      vol.gain.setValueAtTime(0, t);
      vol.gain.linearRampToValueAtTime(1.6, t + 0.05);
      vol.gain.setValueAtTime(1.6, t + 0.45);
      vol.gain.linearRampToValueAtTime(0.9, t + 0.55);
      vol.gain.linearRampToValueAtTime(1.4, t + 0.66);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      mix.connect(vol).connect(out);
      voice.start(t); wobble.start(t);
      voice.stop(t + 1.25); wobble.stop(t + 1.25);
    },

    // ---- The spring ----------------------------------------------------
    // A soft note whose pitch wobbles fast at first, then slower and
    // smaller, like a spring settling: "doy-oy-oy-oing".
    boing() {
      wake();
      const t = ctx.currentTime;
      const tone = ctx.createOscillator();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(110, t);
      tone.frequency.exponentialRampToValueAtTime(260, t + 0.12);  // up it goes
      const wobble = ctx.createOscillator(), depth = ctx.createGain();
      wobble.frequency.setValueAtTime(16, t);
      wobble.frequency.linearRampToValueAtTime(7, t + 0.7);       // wobbles slow down
      depth.gain.setValueAtTime(90, t);
      depth.gain.exponentialRampToValueAtTime(5, t + 0.7);        // and get smaller
      wobble.connect(depth).connect(tone.frequency);
      const vol = ctx.createGain();
      vol.gain.setValueAtTime(0.5, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      tone.connect(vol).connect(out);
      tone.start(t); wobble.start(t);
      tone.stop(t + 0.8); wobble.stop(t + 0.8);
    },

    thunder() {
      wake();
      const t = ctx.currentTime;

      // 1. CRACK: a quick burst of bright hiss
      const crack = noise(0.4, false);
      const bright = ctx.createBiquadFilter();
      bright.type = "highpass"; bright.frequency.value = 1500;
      const cv = ctx.createGain();
      cv.gain.setValueAtTime(0.5, t);
      cv.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      crack.connect(bright).connect(cv).connect(out);
      crack.start(t);

      // 2. RUMBLE: deep noise that swells a little, then rolls away
      const rumble = noise(3, true);
      const low = ctx.createBiquadFilter();
      low.type = "lowpass"; low.frequency.value = 250;
      const rv = ctx.createGain();
      rv.gain.setValueAtTime(0, t);
      rv.gain.linearRampToValueAtTime(1.2, t + 0.15);
      rv.gain.linearRampToValueAtTime(0.8, t + 0.6);
      rv.gain.linearRampToValueAtTime(1.0, t + 1.0);       // a second roll
      rv.gain.exponentialRampToValueAtTime(0.001, t + 2.9);
      rumble.connect(low).connect(rv).connect(out);
      rumble.start(t + 0.05);
    },
  };
})();

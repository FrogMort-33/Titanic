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

// =====================================================================
//  music.js  -  "Ride of the Valkyries" (Wagner, 1870) as 8-bit beeps
// =====================================================================
//
//  ONE voice only, a "square wave" (the classic video-game beep), so the
//  tune is the only thing you hear. Strings and drums can come back once
//  the melody is right.
//
//  The music itself is out of copyright; we play it ourselves, so there
//  is no recording to worry about and no file to load (USB-stick safe).
//
//  THE RHYTHM (9/8 time, 3 beats per bar)
//    beat 1:  da   (dotted quaver)  da (semiquaver)  da (quaver)
//    beat 2:  DAAA (dotted crotchet)
//    beat 3:  DAAA (dotted crotchet)
//  = "da-da-da DAAA DAAA"
//
//  TO CHANGE THE TUNE: edit the TUNE list below. Each line is one bar.
//  To make it faster or slower, change BEAT.
// =====================================================================

// (Called OpeningMusic, so it can share a page with other scenes' music.)
const OpeningMusic = (() => {
  let ctx = null;        // the audio engine (iPad: must be started by a tap)
  let master = null;     // one volume knob for everything

  const BEAT = 0.6;      // seconds per beat (100 beats a minute)

  // Note names -> pitch in Hz
  const HZ = {
    Fs4: 369.99, A4: 440.00, B4: 493.88, Cs5: 554.37, D5: 587.33,
    Fs5: 739.99, A5: 880.00, B5: 987.77,
  };

  // How long each of the 5 notes in a bar lasts, in beats
  //               da    da     da     DAAA  DAAA
  const RHYTHM = [0.5,  1 / 6, 1 / 3,  1,    1];

  // The tune: one bar per line, 5 notes each (matching RHYTHM).
  // If the last two notes are the same, it is played as one long note.
  const TUNE = [
    ["B4",  "Fs4", "B4",  "D5",  "B4"],    // da-da-da  D  B
    ["D5",  "B4",  "D5",  "Fs5", "D5"],    // da-da-da  F# D
    ["Fs5", "D5",  "Fs5", "A5",  "A4"],    // da-da-da  A  A
    ["D5",  "A4",  "D5",  "Fs5", "Fs5"],   // da-da-da  F#——— (held)
  ];

  // Play one beep, leaving a little silence at the end so each note
  // is separate (otherwise repeated notes blur together).
  function beep(freq, when, length) {
    const t = ctx.currentTime + when;
    const sound = length * 0.85;                     // 15% gap after each note

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.005);   // instant start
    gain.gain.setValueAtTime(0.12, t + sound - 0.02);
    gain.gain.linearRampToValueAtTime(0, t + sound);      // clean stop

    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + sound + 0.01);
  }

  // Schedule one bar starting at time t; return how long it lasts.
  function playBar(t, bar) {
    const [n1, n2, n3, n4, n5] = bar;
    let x = t;
    beep(HZ[n1], x, RHYTHM[0] * BEAT); x += RHYTHM[0] * BEAT;
    beep(HZ[n2], x, RHYTHM[1] * BEAT); x += RHYTHM[1] * BEAT;
    beep(HZ[n3], x, RHYTHM[2] * BEAT); x += RHYTHM[2] * BEAT;
    if (n4 === n5) {
      beep(HZ[n4], x, 2 * BEAT);                     // one long held note
    } else {
      beep(HZ[n4], x, BEAT);
      beep(HZ[n5], x + BEAT, BEAT);
    }
    return 3 * BEAT;                                 // a bar is always 3 beats
  }

  function setUp() {
    // One shared audio engine for the whole page. When scenes play one
    // after another ("Play all"), the engine started by the Play tap is
    // reused, because iPad only lets a tap switch sound on.
    ctx = ctx || (window.AUDIO_ENGINE = window.AUDIO_ENGINE ||
                  new (window.AudioContext || window.webkitAudioContext)());
    ctx.resume();
    if (master) master.disconnect();                 // silence anything still playing
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }

  return {
    // Play the tune over and over for 'totalSeconds'.
    // Call it from inside a tap (iPad Safari only allows sound then).
    start(totalSeconds = 42) {
      setUp();
      let t = 0.1, i = 0;
      while (t < totalSeconds) {
        t += playBar(t, TUNE[i % TUNE.length]);
        i++;
      }
    },

    fadeOut(seconds = 3) {
      if (!ctx || !master) return;
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
    },

    stop() {
      if (master) master.disconnect();
      master = null;
    },
  };
})();

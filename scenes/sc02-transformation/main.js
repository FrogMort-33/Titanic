// =====================================================================
//  main.js  -  SC-02 Interlude: "The Transformation"
//              (uses IMG-004 and the top half of IMG-005)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//    0   Just the text from the top of IMG-004, on its paper. Gallery
//        music starts.
//    5   CUT to the white panel, close up. Callum (the stick man) pops in.
//   11   His speech "Draw me as I am, please" writes itself in.
//   14   The camera pulls out, and "So, without further ado, let's
//        transform Callum..." writes itself in on the right.
//   21   CUT to the watercolour panel (bottom of IMG-004). Callum stands
//        exactly where the dashed potato outline is (the outline is hidden).
//   23   THE SPIN: he flips like a playing card, swapping between stick
//        man and dashed outline, faster and faster, with sparkles and a
//        drum-roll.
//   28   TA-DA! White flash, CUT to the finished potato (top of IMG-005).
//   36   Fade out; Replay and "back to the opening" buttons appear.
//
//  Change the numbers in TIMES to re-time the whole scene.
// =====================================================================

const TIMES = {
  stickAppears: 5,
  speech: 11,
  pullOut: 14,
  cutToMagic: 21,
  spinStarts: 23,
  tada: 28,
  fadeOut: 36,
};

const W = 1280, H = 900;          // size of the picture area

// Where the sprites go. LAYOUT comes from layout.js, which is written by
// tools/prepare_pictures.py, so the cut-outs land exactly on their spots.
const L = window.LAYOUT;
const MID_TOP = (H - L.mid.h) / 2; // the middle picture is shorter than the
                                   // screen, so it sits in the centre


class Transformation extends Phaser.Scene {

  // ---- 1. Load pictures ---------------------------------------------
  preload() {
    // USB version: pictures come packed in assets.js (window.ASSETS).
    // Web version: they're read from the assets folder.
    const packed = window.ASSETS || {};
    const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
    pic("intro_text", "intro_text.jpg");
    pic("mid_blank", "mid_blank.jpg");
    pic("stick", "stick.png");
    pic("speech", "speech.png");
    pic("announce", "announce.png");
    pic("magic_blank", "magic_blank.jpg");
    pic("outline", "outline.png");
    pic("final", "final.jpg");
  }

  // ---- 2. Set up, then wait for the Play tap ------------------------
  create() {
    // Small helper: run some code a number of seconds after a shot starts.
    this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
    window.startShow = () => this.showText();
  }

  // Wipe the screen ready for the next shot.
  cut() {
    this.children.removeAll(true);                     // remove every picture
    this.tweens.killAll();                             // stop every movement
    this.time.removeAllEvents();                       // cancel waiting timers
    this.cameras.main.setZoom(1).setScroll(0, 0);      // camera back to normal
  }

  // A plain rectangle the colour of the paper, behind everything.
  paper() {
    this.add.rectangle(0, 0, W, H, Phaser.Display.Color.HexStringToColor(L.paper).color)
      .setOrigin(0);
  }

  // ---- SHOT 1: just the text ------------------------------------------
  showText() {
    this.paper();
    const text = this.add.image(W / 2, H / 2, "intro_text").setAlpha(0);
    this.tweens.add({ targets: text, alpha: 1, duration: 1200 });   // gentle fade in

    this.at(TIMES.stickAppears, () => { this.cut(); this.showStickPanel(); });
  }

  // ---- SHOT 2: Callum in the white panel, then the pull-out -----------
  showStickPanel() {
    const t0 = TIMES.stickAppears;                    // this shot's start time
    const cam = this.cameras.main;

    this.paper();
    this.add.image(0, MID_TOP, "mid_blank").setOrigin(0);

    // Start close up on the white panel (its middle is about x 310, y 445).
    cam.setZoom(1.25);
    cam.centerOn(310, 445);

    // Callum pops up from his feet, with a little overshoot ("Back" ease).
    const stick = this.addSprite("stick", L.stick).setOrigin(0.5, 1);
    stick.x += stick.width / 2;                       // origin moved to his feet,
    stick.y += stick.height;                          // so move him to match
    stick.setScale(0);
    this.at(0.6, () => this.tweens.add({
      targets: stick, scale: 1, duration: 600, ease: "Back.easeOut" }));

    // His speech writes itself in, left to right.
    const speech = this.addSprite("speech", L.speech);
    this.writeIn(speech, 0);
    this.at(TIMES.speech - t0, () => this.writeIn(speech, 2000));

    // Pull out to show the whole picture, then the announcement writes in.
    const announce = this.addSprite("announce", L.announce);
    this.writeIn(announce, 0);
    this.at(TIMES.pullOut - t0, () => {
      cam.zoomTo(1, 3000, "Sine.easeInOut");
      cam.pan(W / 2, H / 2, 3000, "Sine.easeInOut");
      this.at(1.5, () => this.writeIn(announce, 2000));
    });

    this.at(TIMES.cutToMagic - t0, () => { this.cut(); this.showMagic(); });
  }

  // ---- SHOT 3: the spin -------------------------------------------------
  showMagic() {
    const t0 = TIMES.cutToMagic;
    this.add.image(0, 0, "magic_blank").setOrigin(0);

    // Both sprites stand on the same spot: the middle of the outline.
    // (L.outline is the outline's top-left corner; add half its size.)
    const size = this.textures.get("outline").getSourceImage();
    const cx = L.outline.x + size.width / 2, cy = L.outline.y + size.height / 2;
    const outline = this.add.image(cx, cy, "outline").setScale(0, 1);   // hidden (flat)
    const stick = this.add.image(cx, cy, "stick").setScale(1.04);      // as tall as the outline

    Music.fadeOut(1.5);

    this.at(TIMES.spinStarts - t0, () => {
      Music.roll(TIMES.tada - TIMES.spinStarts);
      this.sparkles(cx, cy);
      // How long each half-flip takes: starts slow, ends very fast.
      this.flip([stick, outline], 0, 260, (TIMES.tada - TIMES.spinStarts) * 1000);
    });

    this.at(TIMES.tada - t0, () => { this.cut(); this.showPotato(); });
  }

  // One "card flip": squash the showing sprite flat (scaleX -> 0), then
  // unsquash the other one. Repeat, a bit quicker each time, until the
  // time runs out.
  flip(sprites, showing, speed, timeLeft) {
    if (timeLeft <= 0) return;
    const now = sprites[showing], next = sprites[1 - showing];
    const full = next.texture.key === "stick" ? 1.04 : 1;   // each one's normal width
    this.tweens.add({
      targets: now, scaleX: 0, duration: speed, ease: "Sine.easeIn",
      onComplete: () => this.tweens.add({
        targets: next, scaleX: full, duration: speed, ease: "Sine.easeOut",
        onComplete: () => this.flip(sprites, 1 - showing,
                                    Math.max(40, speed * 0.85), timeLeft - 2 * speed),
      }),
    });
  }

  // Little star-like sparkles that pop out around the spinning figure.
  sparkles(cx, cy) {
    this.time.addEvent({
      delay: 70, loop: true,
      callback: () => {
        const angle = Math.random() * Math.PI * 2;
        const star = this.add.star(cx, cy, 4, 4, 14, 0xfff6a0).setAlpha(0.9);
        this.tweens.add({
          targets: star,
          x: cx + Math.cos(angle) * 320, y: cy + Math.sin(angle) * 320,
          angle: 180, alpha: 0, scale: 0.4, duration: 800,
          onComplete: () => star.destroy(),            // tidy up when done
        });
      },
    });
  }

  // ---- SHOT 4: TA-DA! The potato ---------------------------------------
  showPotato() {
    Music.tada();
    this.cameras.main.flash(700, 255, 255, 255);       // white flash

    // A small "boing": starts a touch big and settles.
    const potato = this.add.image(W / 2, H / 2, "final").setScale(1.12);
    this.tweens.add({ targets: potato, scale: 1, duration: 700, ease: "Back.easeOut" });

    // The gallery music comes back, gently, after the fanfare.
    this.at(2.2, () => Music.start(TIMES.fadeOut - TIMES.tada));

    this.at(TIMES.fadeOut - TIMES.tada, () => {
      Music.fadeOut(2);
      this.cameras.main.fadeOut(2000, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => showEnd());   // in index.html
    });
  }

  // ---- Helpers ------------------------------------------------------------

  // Put a cut-out sprite at its spot on the middle picture.
  addSprite(key, spot) {
    return this.add.image(spot.x, MID_TOP + spot.y, key).setOrigin(0);
  }

  // "Write in": show a sprite from left to right, like a pen drawing it.
  // setCrop shows only part of a picture; we grow that part over time.
  writeIn(sprite, duration) {
    const reveal = { w: 0 };
    sprite.setCrop(0, 0, 0, sprite.height);            // nothing showing yet
    if (duration === 0) return;
    this.tweens.add({
      targets: reveal, w: sprite.width, duration, ease: "Linear",
      onUpdate: () => sprite.setCrop(0, 0, reveal.w, sprite.height),
    });
  }
}


// ---- Start Phaser ---------------------------------------------------
new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: "stage",
  backgroundColor: "#000000",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: Transformation,
});

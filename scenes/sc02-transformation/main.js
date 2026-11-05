// =====================================================================
//  main.js  -  SC-02 Interlude: "The Transformation"
//              (uses IMG-004, then IMG-005: top half, then bottom half)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//    0   Just the text from the top of IMG-004, on its paper. Gallery
//        music starts.
//    5   CUT to the white panel, close up. Callum (the stick man) pops in.
//   11   His speech "Draw me as I am, please" writes itself in.
//   12.5 A toast pops up: the suspicious dog thinking "Draw me like one
//        of your French girls" (see toast.js).
//   14   The camera pulls out, and "So, without further ado, let's
//        transform Callum..." writes itself in on the right.
//   21   CUT to the watercolour panel (bottom of IMG-004). Callum stands
//        exactly where the dashed potato outline is (the outline is hidden).
//   23   THE SPIN: he flips like a playing card, swapping between stick
//        man and dashed outline, faster and faster, with sparkles and a
//        drum-roll.
//   28   TA-DA! White flash, CUT to the finished potato (top of IMG-005).
//   35   CUT to the bottom half of IMG-005 (IMG-006 is its close-up),
//        with the text, faces and names all hidden. Hold.
//   39   The text on the left appears, line by line from the top.
//   45   POP! Each head and name pops in, one at a time, each pop a
//        little quicker (and higher) than the one before.
//   51   Star Wars crawl: "Now onto our grandest adventure!"
//   54   The van from the opening jogs back across, right to left,
//        and the 8-bit Valkyries come back (a "reprise").
//   64   Fade out; the end of scene 2.
//
//  Change the numbers in TIMES to re-time the whole scene.
// =====================================================================

// Everything below is inside { } so its names (TIMES, W, H ...) stay
// private to this scene. That lets several scenes share one page
// (see play-all.html) without their names clashing.
{

  const TIMES = {
    stickAppears: 5,
    speech: 11,
    dogToast: 12.5,
    pullOut: 14,
    cutToMagic: 21,
    spinStarts: 23,
    tada: 28,
    cutToSpuds: 35,
    spudText: 39,
    pops: 45,
    crawl: 51,
    vanReturns: 54,     // about when the crawl is a third of the way up
    fadeOut: 64,
  };

  const W = 1280, H = 900;          // size of the picture area

  // Where the sprites go. LAYOUT comes from layout.js, which is written by
  // tools/prepare_pictures.py, so the cut-outs land exactly on their spots.
  const L = window.LAYOUT;
  const MID_TOP = (H - L.mid.h) / 2; // the middle picture is shorter than the
                                     // screen, so it sits in the centre


  class Transformation extends Phaser.Scene {

    // Every scene needs its own name, so "Play all" can switch between them.
    constructor() { super("transformation"); }

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
    pic("spuds_blank", "spuds_blank.jpg");
    pic("spud_text", "spud_text.png");
    pic("bus", "bus.png");                         // the van, copied from the opening
    for (const p of L.people) {                    // a head and a name for each person
      pic("head_" + p.name, "head_" + p.name + ".png");
      pic("name_" + p.name, "name_" + p.name + ".png");
    }
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      // Small helper: run some code a number of seconds after a shot starts.
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      // "Play all": we arrive straight from the opening, so begin at once.
      // On its own: wait for index.html to call startShow() on the Play tap.
      if (window.PLAY_ALL) this.showText();
      else window.startShow = () => this.showText();
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
      GalleryMusic.start(23);                         // the gallery music begins
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

      // ...and the suspicious dog has thoughts about that (toast.js).
      this.at(TIMES.dogToast - t0, () => showDogToast());

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

      GalleryMusic.fadeOut(1.5);

      this.at(TIMES.spinStarts - t0, () => {
        GalleryMusic.roll(TIMES.tada - TIMES.spinStarts);
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
      GalleryMusic.tada();
      this.cameras.main.flash(700, 255, 255, 255);       // white flash

      // A small "boing": starts a touch big and settles.
      const potato = this.add.image(W / 2, H / 2, "final").setScale(1.12);
      this.tweens.add({ targets: potato, scale: 1, duration: 700, ease: "Back.easeOut" });

      // The gallery music comes back, gently, after the fanfare.
      this.at(2.2, () => GalleryMusic.start(TIMES.fadeOut - TIMES.tada));

      this.at(TIMES.cutToSpuds - TIMES.tada, () => { this.cut(); this.showSpuds(); });
    }

    // ---- SHOT 5: the whole Titanic Club, as spuds ------------------------
    showSpuds() {
      const t0 = TIMES.cutToSpuds;
      this.add.image(0, 0, "spuds_blank").setOrigin(0);   // nobody there yet

      // The text on the left: hidden, then shown line by line from the top.
      const text = this.add.image(L.spud_text.x, L.spud_text.y, "spud_text").setOrigin(0);
      text.setCrop(0, 0, text.width, 0);                // nothing showing yet
      this.at(TIMES.spudText - t0, () => {
        const reveal = { h: 0 };
        this.tweens.add({
          targets: reveal, h: text.height, duration: 3000, ease: "Linear",
          onUpdate: () => text.setCrop(0, 0, text.width, reveal.h),
        });
      });

      // POP! One person at a time: head and name together.
      // 'gap' is the wait before the next pop; it shrinks each time.
      this.at(TIMES.pops - t0, () => {
        let when = 0, gap = 0.9;
        L.people.forEach((p, i) => {
          this.at(when, () => this.popIn(p, i));
          when += gap;
          gap *= 0.85;                                   // 15% quicker each time
        });
      });

      // The Star Wars crawl (HTML, like the opening), over a darkened picture.
      // (setDepth(10) keeps the dark sheet in FRONT of the heads, even
      //  though the heads are added later.)
      const night = this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0).setAlpha(0).setDepth(10);
      this.at(TIMES.crawl - t0, () => {
        this.tweens.add({ targets: night, alpha: 0.6, duration: 2000 });
        startEndCrawl();                                 // in index.html
      });

      // The van comes back the other way, to the Valkyries.
      this.at(TIMES.vanReturns - t0, () => {
        GalleryMusic.fadeOut(1);
        OpeningMusic.start(TIMES.fadeOut - TIMES.vanReturns + 3);   // music.js of the opening
        this.vanReturns();
      });

      this.at(TIMES.fadeOut - t0, () => {
        GalleryMusic.fadeOut(2.5);
        OpeningMusic.fadeOut(2.5);
        this.cameras.main.fadeOut(2500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          stopEndCrawl();                                // in index.html
          showEnd();                                     // in index.html
        });
      });
    }

    // The van from the opening, jogging from right to left along the
    // bottom of the screen. setFlipX(true) mirrors the picture so it
    // faces the way it's going. setDepth(11) keeps it in front of the
    // dark sheet, so it's bright while the page behind is dimmed.
    vanReturns() {
      const van = this.add.image(W + 250, 885, "bus").setOrigin(0.5, 1)
        .setScale(0.55).setFlipX(true).setDepth(11);

      // Jogging: bounce up and down and rock slightly, forever
      this.tweens.add({
        targets: van, y: van.y - 6, angle: { from: -1.5, to: 1.5 },
        duration: 140, yoyo: true, repeat: -1,
      });

      // Across the screen in 7 seconds, starting slowly
      this.tweens.add({ targets: van, x: -250, duration: 7000, ease: "Sine.easeIn" });

      // Dust puffs: this time BEHIND means to the right of the van
      this.time.addEvent({
        delay: 120, repeat: 55,
        callback: () => {
          const puff = this.add.circle(van.x + 150, van.y - 10, 10 + Math.random() * 12, 0xd8cfa0)
            .setAlpha(0.8).setDepth(11);
          this.tweens.add({
            targets: puff, x: puff.x + 60, y: puff.y - 30, scale: 2.2, alpha: 0, duration: 700,
            onComplete: () => puff.destroy(),
          });
        },
      });
    }

    // Pop one person into existence: the head grows from nothing with a
    // little overshoot, the name follows a moment later.
    popIn(person, number) {
      GalleryMusic.pop(number);
      const head = this.add.image(person.head.x, person.head.y, "head_" + person.name);
      const name = this.add.image(person.label.x, person.label.y, "name_" + person.name);
      for (const sprite of [head, name]) {
        // Grow from the middle: move the origin to the centre, and the
        // position by half the size to match, so it lands in the same spot.
        sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
        sprite.setScale(0);
      }
      this.tweens.add({ targets: head, scale: 1, duration: 300, ease: "Back.easeOut" });
      this.tweens.add({ targets: name, scale: 1, duration: 250, delay: 80, ease: "Back.easeOut" });
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
  // On the "Play all" page, just add this scene to the list (that page
  // starts Phaser itself, with every scene). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(Transformation);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Transformation,
  });

}

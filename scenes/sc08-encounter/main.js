// =====================================================================
//  main.js  -  EPISODE 8 "A Close Encounter"
//              (uses IMG-030 and IMG-031)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//   PANEL 1 - OUT IN THE COUNTRY  (IMG-030, top picture)
//    0    A sunny countryside: a road running back to the horizon.
//         Happy 8-bit country music and birdsong. The birds in the top
//         left flap and swoop about.
//    1.5  Far, far away on the road: a TINY van. All through this panel
//         it comes closer - growing, rocking and sliding from side to
//         side - getting ever larger and more menacing...
//    2    ...while the green French lady happily bops in from the left,
//         across the grass, to her spot by the road.
//    6    The book's words roll up from the bottom of the screen:
//         "Up ahead! A local, going about their day in the streets of
//         Lyon! Shame the wing mirror almost knocked their head off when
//         Enda forgot the width of the new vehicle."
//   26    The van is right there, full size. Hold...
//   31    Clear the screen. A "rewind" noise...
//
//   PANEL 2 - UP AHEAD!  (IMG-031, the picture from beside the van)
//   32.5  ...the same moment, from the side: the lady bopping along on
//         the grass, as happy as ever (same happy music, of course!)
//   34    The van's side - and its wing mirror - grows in from the lower
//         left corner, closer and closer, at just the height of her head...
//   48    Full size. Hold for 5...
//
//   PANEL 3 - THE NEAR MISS  (IMG-033, three panels side by side, with
//   "Displaying full crisis control, Joe froze and hoped everything would
//   just pan out." across the top the whole time)
//   54.5  RIGHT: Spud Enda at the wheel, smiling, music notes floating up,
//         the wheel turning left and right. MIDDLE: Joe, calm (for now).
//         LEFT: the road from above. The lady walks in from the bottom,
//         turning round as she goes, to her spot by the road.
//         (Times below are seconds after this panel starts - see NEAR.)
//    +5   Joe whispers "run..." and starts to sweat
//    +9   "runnnn" (louder: eyes and mouth grow)
//    +10  the van (from above), mirror sticking out like a blade, comes
//         down from the top, closer and closer...
//    +13  "runnnnnnnnn" (louder still: he's shaking)
//    +17  "RUNNNN!" (wide eyes, the scream from the book)
//    +19.5 NEAR MISS: the lady dodges left, the van swerves right and
//         whooshes past!
//    +22  Zoom in on Spud Enda, still happily humming...
//    +24  "Meanwhile, Enda focused on the road ahead."
//    +31  Fade out. THE END of episode 8.
//
//  STORY RULE: the van travels LEFT to RIGHT (right to left is kept for
//  its comedy retreat, later on). Here it comes towards us, which is fine.
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    land: 0,
    van: 1.5,             // the van appears, tiny, on the horizon...
    vanFull: 26,          // ...and is full size by now
    ladyIn: 2,            // the lady starts bopping in from the left
    ladyHome: 12,         // ...and reaches her spot
    words: 6,             // the words roll up from the bottom
    clear: 31,            // clear the screen (rewind!)
    side: 32.5,           // the picture from the side of the van
    sideVan: 34,          // the van's side starts growing in...
    sideVanFull: 48,      // ...full size
    nearMiss: 54.5,       // the three panels (see NEAR for what happens in them)
    fadeOut: 86,
  };

  // The near-miss panels' own timetable (seconds from when they start)
  const NEAR = { ladyIn: 1, ladyHome: 9, run1: 5, run2: 9, van: 10, run3: 13, scream: 17,
                 miss: 19.5, zoom: 22, meanwhile: 24 };

  const W = 1280, H = 900;          // size of the picture area
  const BOOK_FONT = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Trebuchet MS", sans-serif';
  const L = window.LAYOUT8;         // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page

  class CloseEncounter extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("encounter"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      for (const key of ["cl_land", "up_blank"]) pic(key, key + ".jpg");
      for (const key of ["cl_birds2", "cl_bird1", "cl_lady", "cl_van",
                         "up_lady", "up_van", "up_words"]) pic(key, key + ".png");
      for (const key of ["nm_road", "nm_joe", "nm_drv"]) pic(key, key + ".jpg");
      for (const key of ["nm_top", "nm_lady", "nm_van", "nm_eye_l", "nm_eye_r", "nm_mouth", "nm_drop",
                         "nm_wide_l", "nm_wide_r", "nm_brunnn", "nm_wheel",
                         "nm_note1", "nm_note2", "nm_note3", "nm_note4", "nm_note5"]) pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      // "Play all": we arrive straight from episode 7, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    start() {
      // The happy music plays all the way through BOTH pictures
      CountrySounds.pastoral(TIMES.fadeOut + 3);
      CountrySounds.birdsong(TIMES.clear);
      this.cut();
      this.showCountry();
      this.at(TIMES.clear - 1, () => this.cameras.main.fadeOut(1000, 0, 0, 0));
      this.at(TIMES.clear, () => CountrySounds.rewind());
      this.at(TIMES.side, () => { this.cut(); this.showSide(); });
      this.at(TIMES.nearMiss - 1, () => this.cameras.main.fadeOut(900, 0, 0, 0));
      this.at(TIMES.nearMiss, () => { this.cut(); this.showNearMiss(); });
      this.at(TIMES.fadeOut, () => {
        CountrySounds.pastoralOff(2.5);
        if (this.wordsCam) this.wordsCam.fadeOut(2500, 0, 0, 0);
        this.cameras.main.fadeOut(2500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          if (window.PLAY_ALL) this.scene.start("right");      // "Play all": on to episode 9
          else showEnd();                                       // in index.html
        });
      });
    }

    // A "cut": clear the screen for the next picture
    cut() {
      this.tweens.killAll();
      this.children.removeAll(true);
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(600);
      this.onTick = null;
      // stop this picture's repeating jobs (music notes, sweat...)
      // (NOT all timers: the show's own timetable runs on timers too!)
      (this.loops || []).forEach((job) => job.remove());
      this.loops = [];
    }

    // Phaser calls update() every frame (about 60 times a second). If a
    // picture has set an "onTick" job, we run it: that's how the vans
    // move smoothly in BOTH directions (growing AND swaying) at once.
    update(time) {
      if (this.onTick) this.onTick(time / 1000);
    }

    // An image at its place from layout.js
    placed(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0);
    }

    // Put a sprite's origin in its middle WITHOUT moving it
    middle(sprite) {
      return sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    }

    // A happy walk: the sprite bobs up and down and rocks from side to side
    // (a "bop" every 'beat' ms, with a little step sound), while it
    // slides from fromX to its own x over 'ms' milliseconds.
    bopAlong(sprite, fromX, ms, beat = 380) {
      const homeX = sprite.x, homeY = sprite.y;
      sprite.x = fromX;
      // the walk across
      this.tweens.add({ targets: sprite, x: homeX, duration: ms, ease: "Linear" });
      // the bop: up and back down, over and over
      const bop = this.tweens.add({ targets: sprite, y: homeY - 14, duration: beat / 2,
                                    ease: "Sine.easeOut", yoyo: true, repeat: -1 });
      // the rock: lean one way, then the other
      sprite.angle = -4;
      const rock = this.tweens.add({ targets: sprite, angle: 4, duration: beat,
                                     ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      const steps = this.time.addEvent({ delay: beat, loop: true, callback: () => CountrySounds.step() });
      // when she gets there: stop walking, but keep a happy little sway
      this.time.delayedCall(ms, () => {
        bop.stop(); rock.stop(); steps.remove();
        sprite.y = homeY; sprite.angle = 0;
        this.tweens.add({ targets: sprite, y: homeY - 6, duration: 700, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });
        this.tweens.add({ targets: sprite, angle: { from: -2, to: 2 }, duration: 1400,
                          ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      });
    }

    // =====================================================================
    //  PANEL 1 - OUT IN THE COUNTRY
    // =====================================================================
    showCountry() {
      this.add.image(0, 0, "cl_land").setOrigin(0);

      // ---- The birds: flap (squash up and down) and swoop about ----
      for (const [key, swoop] of [["cl_birds2", 2600], ["cl_bird1", 3300]]) {
        const bird = this.middle(this.placed(key));
        this.tweens.add({ targets: bird, scaleY: 0.4, duration: 220, yoyo: true, repeat: -1 });  // flap
        this.tweens.add({ targets: bird, x: bird.x + 70, duration: swoop, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });                                            // swoop
        this.tweens.add({ targets: bird, y: bird.y - 22, duration: swoop / 2, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });                                            // bob
      }

      // ---- The van: tiny on the horizon, growing as it comes ----
      // Its "origin" is the middle of its bottom edge (where its wheels
      // touch the road), so it always sits ON the road as it grows.
      const [vpX, vpY] = L.cl_vp, [baseX, baseY] = L.cl_van_base;
      const van = this.add.image(vpX, vpY, "cl_van").setOrigin(0.5, 1).setScale(0.02).setVisible(false);
      const startAt = TIMES.van, length = TIMES.vanFull - TIMES.van;
      let began = null;
      this.at(TIMES.van, () => { van.setVisible(true); CountrySounds.approach(length); });
      this.onTick = (now) => {
        if (!van.visible) return;
        began = began ?? now;
        // p goes from 0 to 1 over the whole approach; "near" grows slowly
        // at first and fast at the end (p squared), like something coming
        // straight at you
        const p = Math.min((now - began) / length, 1);
        const near = p * p;
        van.setScale(0.02 + 0.98 * near);
        // slide along the road from the horizon down to its spot, swaying
        // from side to side (more and more as it gets closer)...
        const sway = Math.sin(now * 2.3) * 70 * near * (1 - p * 0.6);
        van.x = vpX + (baseX - vpX) * near + sway;
        van.y = vpY + (baseY - vpY) * near;
        // ...and rocking, like it's going a bit too fast
        van.angle = Math.sin(now * 3.4) * 3 * (p < 1 ? 1 : 0.3);
      };

      // ---- The lady: bops in from the left, across the grass ----
      const lady = this.placed("cl_lady");                   // her spot (in front of the van)
      lady.setOrigin(0.5, 1).setPosition(lady.x + lady.width / 2, lady.y + lady.height);   // feet
      lady.setVisible(false);
      this.at(TIMES.ladyIn, () => {
        lady.setVisible(true);
        this.bopAlong(lady, -lady.width / 2, (TIMES.ladyHome - TIMES.ladyIn) * 1000);
      });

      // ---- The words roll up from the bottom ----
      this.at(TIMES.words, () => this.rollUpWords());
    }

    // The book's words rise up from below the screen onto a band of
    // yellow page at the bottom, and stay there.
    rollUpWords() {
      const band = this.add.rectangle(0, H, W, 10, PAPER, 0.88).setOrigin(0, 0);   // the band first...
      const words = this.add.image(W / 2, 0, "up_words").setScale(0.72);          // ...the words on top
      const bandH = words.displayHeight + 24;
      band.setSize(W, bandH);
      words.y = H + bandH / 2;
      this.tweens.add({ targets: band, y: H - bandH, duration: 2500, ease: "Sine.easeOut" });
      this.tweens.add({ targets: words, y: H - bandH / 2, duration: 2500, ease: "Sine.easeOut" });
    }

    // =====================================================================
    //  PANEL 2 - UP AHEAD! (from the side of the van)
    // =====================================================================
    showSide() {
      this.add.image(0, 0, "up_blank").setOrigin(0);

      // ---- The lady: still bopping happily along ----
      const lady = this.placed("up_lady");
      lady.setOrigin(0.5, 1).setPosition(lady.x + lady.width / 2, lady.y + lady.height);
      this.bopAlong(lady, lady.x + 260, (TIMES.sideVanFull - TIMES.side - 4) * 1000, 420);

      // ---- The van's side grows in from the lower-left corner ----
      // Its origin is its bottom-left corner, pinned near the screen's
      // bottom-left, so it swells up and out across the picture.
      const van = this.placed("up_van").setOrigin(0, 1);
      const homeX = van.x, homeY = van.y + van.height;
      van.setPosition(homeX, homeY).setScale(0.05).setVisible(false);
      const length = TIMES.sideVanFull - TIMES.sideVan;
      let began = null;
      // (this picture starts at TIMES.side, so count from then)
      this.at(TIMES.sideVan - TIMES.side, () => { van.setVisible(true); CountrySounds.approach(length); });
      this.onTick = (now) => {
        if (!van.visible) return;
        began = began ?? now;
        const p = Math.min((now - began) / length, 1);
        const near = p * p;
        van.setScale(0.05 + 0.95 * near);
        // rocking and sliding side to side as it comes, settling at the end
        const settle = 1 - p;
        van.x = homeX + Math.sin(now * 2.1) * 40 * near * settle - 30 * settle;
        van.y = homeY + Math.sin(now * 3.3) * 10 * settle;
        van.angle = Math.sin(now * 2.7) * 2.5 * settle;
        if (p === 1 && !van.shook) {             // it's arrived: a judder
          van.shook = true;
          this.cameras.main.shake(400, 0.006);
        }
      };
      // The lady stays in FRONT of the van (she's further along the road)
      lady.setDepth(1);
    }

    // =====================================================================
    //  PANEL 3 - THE NEAR MISS (three panels side by side)
    // =====================================================================
    showNearMiss() {
      const at = (sec, fn) => this.at(sec, fn);          // (this.at counts from NOW, when the panel starts)
      this.wordsCam = null;
      const every = (ms, fn) => this.loops.push(this.time.addEvent({ delay: ms, loop: true, callback: fn }));

      // ---- The three pictures, with black frames, and the words on top ----
      const road = this.placed("nm_road"), joe = this.placed("nm_joe"), drv = this.placed("nm_drv");
      const frames = this.add.graphics().setDepth(5).lineStyle(6, 0x1c1a18);
      for (const p of [road, joe, drv]) frames.strokeRect(p.x, p.y, p.width, p.height);
      this.placed("nm_top");
      // a "mask" for each panel: things moving inside it are only seen
      // INSIDE its frame (like looking through a window)
      const windowOf = (p) => {
        const shape = this.make.graphics({ add: false });
        shape.fillStyle(0xffffff).fillRect(p.x, p.y, p.width, p.height);
        return shape.createGeometryMask();
      };

      // =========== RIGHT: happy Spud Enda at the wheel ===========
      const drvWindow = windowOf(drv);
      // his steering wheel turns left and right, round its middle (the hub)
      const wheel = this.placed("nm_wheel").setMask(drvWindow);
      const [hubX, hubY] = L.nm_wheel_hub;
      wheel.setOrigin((hubX - wheel.x) / wheel.width, (hubY - wheel.y) / wheel.height).setPosition(hubX, hubY);
      wheel.angle = -22;
      this.tweens.add({ targets: wheel, angle: 22, duration: 1100, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      // a happy little smile (drawn as part of a circle)
      const [sx, sy] = L.nm_drv_smile;
      const smile = this.add.graphics().lineStyle(4, 0x1c1a18);
      smile.beginPath(); smile.arc(sx, sy - 12, 14, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155)); smile.strokePath();
      // music notes float up out of the picture, one after another, for ever
      const notes = ["nm_note1", "nm_note2", "nm_note3", "nm_note4", "nm_note5"];
      every(650, () => {
        const key = Phaser.Utils.Array.GetRandom(notes);
        const n = this.placed(key).setMask(drvWindow);
        if (this.wordsCam) this.wordsCam.ignore(n);        // (only the zooming camera shows it)
        n.x += Phaser.Math.Between(-10, 10);
        this.tweens.add({ targets: n, y: n.y - 300, duration: 3200, ease: "Linear",
                          onComplete: () => n.destroy() });
        this.tweens.add({ targets: n, x: n.x + 26, duration: 700, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });              // wiggle as it rises
      });

      // =========== MIDDLE: Joe, getting more and more worried ===========
      const joeWindow = windowOf(joe);
      const middle = (key) => this.middle(this.placed(key));
      const eyeL = middle("nm_eye_l"), eyeR = middle("nm_eye_r"), mouth = middle("nm_mouth");
      // where his words go (just right of his mouth)
      const wordsX = mouth.x + mouth.displayWidth / 2 + 6, wordsY = mouth.y;
      let words = null;
      const say = (text, size, level) => {
        if (words) words.destroy();
        words = this.add.text(wordsX, wordsY, text,
          { fontFamily: BOOK_FONT, fontSize: size + "px", color: "#1c1a18", fontStyle: "bold" }).setOrigin(0, 0.5)
          .setMask(joeWindow);
        this.tweens.add({ targets: words, scale: { from: 0.4, to: 1 }, duration: 300, ease: "Back.easeOut" });
        CountrySounds.whisper(level);
        CountrySounds.panic(level);
      };
      // sweat: a drop runs down from his brow, again and again
      const sweat = (ms) => every(ms, () => {
        const d = this.placed("nm_drop");
        if (this.wordsCam) this.wordsCam.ignore(d);
        d.x += Phaser.Math.Between(-6, 10);
        CountrySounds.drip();
        this.tweens.add({ targets: d, y: d.y + 130, alpha: 0, duration: 1500, ease: "Quad.easeIn",
                          onComplete: () => d.destroy() });
      });
      // shaking: every frame, nudge Joe's face bits a random amount
      let shake = 0;
      const joeBits = [joe, eyeL, eyeR, mouth];
      const homes = joeBits.map((b) => [b.x, b.y]);

      at(NEAR.run1, () => { say("run...", 18, 1); sweat(1500); });
      at(NEAR.run2, () => {
        say("runnnn", 26, 2);
        this.tweens.add({ targets: [eyeL, eyeR], scale: 1.35, duration: 300 });
        this.tweens.add({ targets: mouth, scale: 1.5, duration: 300 });
      });
      at(NEAR.run3, () => {
        say("runnnnnnnnn", 30, 3); shake = 2.5; sweat(700);
        this.tweens.add({ targets: [eyeL, eyeR], scale: 1.6, duration: 300 });
        this.tweens.add({ targets: mouth, scale: 1.9, duration: 300 });
      });
      at(NEAR.scream, () => {
        // the screaming face from the book: wide eyes and "BRUNNN"
        words.destroy(); words = null;
        for (const [old, key] of [[eyeL, "nm_wide_l"], [eyeR, "nm_wide_r"]]) {
          const wide = this.add.image(old.x, old.y - 2, key);
          joeBits.push(wide); homes.push([wide.x, wide.y]);
          old.setVisible(false);
        }
        mouth.setVisible(false);
        const yell = this.add.image(mouth.x - mouth.width / 2, mouth.y + 8, "nm_brunnn").setOrigin(0, 0.5).setMask(joeWindow);
        this.tweens.add({ targets: yell, scale: { from: 0.3, to: 0.95 }, duration: 350, ease: "Back.easeOut" });
        joeBits.push(yell); homes.push([yell.x, yell.y]);
        shake = 6;
        CountrySounds.scream();
        this.cameras.main.shake(500, 0.008);
      });

      // =========== LEFT: the road from above ===========
      const roadWindow = windowOf(road);
      // The lady: walks up from the bottom, turning as she goes, to her spot
      const lady = middle("nm_lady").setMask(roadWindow);
      const ladyHome = [lady.x, lady.y];
      lady.y = road.y + road.height + 120;                  // start: below the picture
      // The van: comes down from above the picture, getting bigger
      const van = middle("nm_van").setMask(roadWindow);
      const vanHome = [van.x, van.y];
      van.y = road.y - van.height;
      let ladyStart = null, vanStart = null, missed = false;

      this.onTick = (now) => {
        // Joe's shakes
        joeBits.forEach((b, i) => {
          b.x = homes[i][0] + (Math.random() - 0.5) * shake;
          b.y = homes[i][1] + (Math.random() - 0.5) * shake;
        });
        // the lady walking up and turning
        if (ladyStart !== null && !missed) {
          const p = Math.min((now - ladyStart) / (NEAR.ladyHome - NEAR.ladyIn), 1);
          const ease = 1 - Math.pow(1 - p, 2);              // slows down as she arrives
          lady.y = ladyHome[1] + (road.y + road.height + 120 - ladyHome[1]) * (1 - ease);
          lady.x = ladyHome[0] + Math.sin(now * 5) * 6 * (1 - p);      // a little wander
          lady.angle = 200 * (1 - ease) + Math.sin(now * 7) * 10 * (1 - p);   // turning round
          lady.setScale(1 + Math.sin(now * 10) * 0.04 * (1 - p));             // steps
        }
        // the van coming closer and closer
        if (vanStart !== null && !missed) {
          const p = Math.min((now - vanStart) / (NEAR.miss - NEAR.van), 1);
          van.y = vanHome[1] - (vanHome[1] - (road.y - van.height)) * (1 - p * p);
          van.setScale(0.75 + 0.25 * p);
          van.x = vanHome[0] + Math.sin(now * 3) * 6;
        }
      };
      at(NEAR.ladyIn, () => { ladyStart = this.time.now / 1000; });
      at(NEAR.van, () => { vanStart = this.time.now / 1000; CountrySounds.approach(NEAR.miss - NEAR.van); });

      // THE NEAR MISS: she dodges left, it swerves right and zooms past
      at(NEAR.miss, () => {
        missed = true;
        CountrySounds.whoosh();
        this.tweens.add({ targets: lady, x: lady.x - 50, angle: lady.angle - 70, duration: 300, ease: "Back.easeOut" });
        this.tweens.add({ targets: van, x: van.x + 60, angle: 7, duration: 250, ease: "Quad.easeOut" });
        this.tweens.add({ targets: van, y: road.y + road.height + van.height, duration: 900, delay: 150,
                          ease: "Quad.easeIn" });
        // and Joe calms down... a bit
        this.time.delayedCall(1200, () => { shake = 1; });
      });

      // ---- Zoom in on Spud Enda, then the words across the screen ----
      at(NEAR.zoom, () => {
        const [fx, fy] = L.nm_drv_face;
        this.cameras.main.pan(fx, fy + 20, 2000, "Sine.easeInOut");
        this.cameras.main.zoomTo(2.2, 2000, "Sine.easeInOut");
      });
      at(NEAR.meanwhile, () => {
        // The words go on their OWN camera, which doesn't zoom, so they
        // stay the right size, straight across the middle of the screen.
        const band = this.add.rectangle(0, H - 190, W, 150, PAPER, 0.9).setOrigin(0).setAlpha(0);
        const text = this.add.text(W / 2, H - 115, "Meanwhile, Enda focused on the road ahead.",
          { fontFamily: BOOK_FONT, fontSize: "56px", color: "#1c1a18", fontStyle: "bold" })
          .setOrigin(0.5).setAlpha(0);
        const wordsCam = this.cameras.add(0, 0, W, H);
        wordsCam.ignore(this.children.list.filter((c) => c !== band && c !== text));
        this.cameras.main.ignore([band, text]);
        this.wordsCam = wordsCam;
        this.tweens.add({ targets: [band, text], alpha: 1, duration: 1200 });
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(CloseEncounter);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: CloseEncounter,
  });

}

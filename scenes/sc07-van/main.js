// =====================================================================
//  main.js  -  EPISODE 7 "A Van, A Man & a Plan"
//              (uses IMG-026, IMG-027, IMG-028 and IMG-029)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//   PANEL 1 - THE COUNTDOWN  (Spud Enda at the wheel)
//    0.5  On the yellow page, across the middle: "With the car now fully
//         booked, the families cheered as Enda hit the accelerator..."
//    7.5  Spud Enda at the wheel. The engine ticks over.
//    9    ZOOM in on his eyes (focus!)... rev... "3"
//   11.5  zoom out
//   12.5  ZOOM in on his hands on the wheel... a bigger rev... "2"
//   15    zoom out... a BIG rev
//   17.5  hold... "1" and a HUGE rev
//   19.5  The picture grows and grows until it fades away...
//
//   PANEL 2 - VROOOOM
//   21    ...to the van, with the yellow barrier post ahead.
//   21.5  "Here we go!"
//   23    Rev the van: "VROOOOM"
//   24.5  It speeds off towards the yellow post...
//
//   PANEL 3 - BAM
//   25    CONTACT! A flash, a crash: "BAM". The van bounces about,
//         a sad "wah-wah-wah-waaah", and the engine dies.
//   28    "...and promptly crashed into the barrier of the car park!"
//   35.5  Clear to black.
//
//   PANEL 4 - FIVE MINUTES LATER
//   38    The FIVE MINUTES LATER panel, large, with a "ta-da".
//   41    "Hoo boy, these local drivers sure do have a bee in their bonnet!"
//
//   PANEL 5 - TODAY'S DRIVING FORECAST
//   49.5  TODAY'S DRIVING FORECAST, one drawing at a time (thunder first):
//         +1   the dial: the needle ticks up from Easy... to FRENCH (alarm!)
//         +6   the angry driver: wheel yanked left and right, eyebrows going
//         +10  the lorry: jogging on the spot, the hand going up (whistle)
//         +15  the little vans, to the Ride of the Valkyries: the pink one
//              bumps the blue one, which flips over and lands upside down,
//              in flames. The pink one drives off to the right.
//         Hold for 5...
//   78    ...and the whole forecast again.
//  106.5  Fade out. The end.
//
//  HORROR MUSIC (Enda's idea): a spooky organ tune under the opening
//  words, a creepy hum and a speeding heartbeat in the countdown, a creaky
//  door and thunder on "1", a theremin "ooo-eee-ooo" on "Here we go!" and
//  FIVE MINUTES LATER, and a scream at the crash.
//
//  STORY RULE: the van travels LEFT to RIGHT (right to left is kept for
//  its comedy retreat, later on).
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    openText: 0.5,
    driver: 7.5,
    eyes: 9,              // zoom in, rev, then "3"
    out1: 11.5,
    hands: 12.5,          // zoom in, rev, then "2"
    out2: 15,
    bigRev: 15.8,
    one: 17.5,            // "1" and a HUGE rev
    expand: 19.5,
    vroomPanel: 21,
    hereWeGo: 21.5,
    revVan: 23,
    go: 24.5,             // it hits the post half a second later
    bam: 25,
    crashedText: 28,
    black: 35.5,
    five: 38,
    hooBoy: 41,
    forecast: 49.5,       // the forecast panel plays...
    forecastAgain: 78,    // ...and then once more
    fadeOut: 106.5,
  };

  // The forecast panel's own timetable (seconds from when it starts)
  const FORECAST = { dial: 1, needle: 2, driver: 6, lorry: 10, vans: 15 };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT7;         // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page
  const BOOK_FONT = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Trebuchet MS", sans-serif';
  const BIG_FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif';

  class VanManPlan extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("van"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      for (const key of ["van_driver", "van_vroom_blank", "van_bam_blank", "fc_blank"]) pic(key, key + ".jpg");
      for (const key of ["fc_dial", "fc_face", "fc_brows", "fc_wheel", "fc_cab", "fc_arm", "fc_tyre",
                         "fc_blue", "fc_pink", "fc_burnt"]) pic(key, key + ".png");
      for (const key of ["van_van", "van_vroom", "van_herewego", "van_bam_van", "van_bam",
                         "van_crashed", "van_five", "van_hooboy"]) pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      // "Play all": we arrive straight from episode 6, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    start() {
      // HORROR: a spooky organ tune under the opening words
      VanSounds.horror(TIMES.driver - TIMES.openText + 0.5);
      this.at(TIMES.driver - 0.8, () => VanSounds.horrorOff(1));
      this.showWords();
      this.at(TIMES.driver, () => { this.cut(); this.showDriver(); });
      this.at(TIMES.vroomPanel, () => { this.cut(); this.showVroom(); });
      this.at(TIMES.bam, () => { this.cut(); this.showBam(); });
      this.at(TIMES.black, () => { this.cameras.main.fadeOut(1000, 0, 0, 0); VanSounds.creak(); });
      this.at(TIMES.five, () => { this.cut(); this.showFive(); });
      this.at(TIMES.forecast - 1, () => this.cameras.main.fadeOut(900, 0, 0, 0));
      this.at(TIMES.forecast, () => { this.cut(); this.showForecast(); });
      this.at(TIMES.forecastAgain - 0.8, () => this.cameras.main.fadeOut(700, 0, 0, 0));
      this.at(TIMES.forecastAgain, () => { this.cut(); this.showForecast(); });
      this.at(TIMES.fadeOut, () => {
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => showEnd());  // in index.html / play-all.html
      });
    }

    // A "cut": clear the screen for the next picture
    cut() {
      this.tweens.killAll();
      this.children.removeAll(true);
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(400);
    }

    // An image at its place from layout.js
    placed(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0);
    }

    // Put a sprite's origin in its middle WITHOUT moving it
    middle(sprite) {
      return sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    }

    // Show a sprite from the top downwards over 'duration' ms (0 = hide).
    rollDown(sprite, duration) {
      const reveal = { h: 0 };
      sprite.setCrop(0, 0, sprite.width, 0);
      if (duration === 0) return;
      this.tweens.add({
        targets: reveal, h: sprite.height, duration, ease: "Sine.easeInOut",
        onUpdate: () => sprite.setCrop(0, 0, sprite.width, reveal.h),
      });
    }

    // =====================================================================
    //  PANEL 1 - THE COUNTDOWN
    // =====================================================================
    // The opening words, across the middle of the yellow page
    showWords() {
      const words = this.add.text(W / 2, H / 2,
        "With the car now fully booked,\nthe families cheered as Enda\nhit the accelerator...",
        { fontFamily: BOOK_FONT, fontSize: "64px", color: "#1c1a18", align: "center", lineSpacing: 14 })
        .setOrigin(0.5).setAlpha(0);
      this.at(TIMES.openText, () => this.tweens.add({ targets: words, alpha: 1, duration: 1200 }));
    }

    showDriver() {
      const t0 = TIMES.driver;
      const at = (time, fn) => this.at(time - t0, fn);
      this.cameras.main.setBackgroundColor(0x000000);
      VanSounds.engine(TIMES.bam - TIMES.driver + 1);
      // HORROR: a creepy hum and a heart beating faster and faster
      VanSounds.drone(TIMES.vroomPanel - TIMES.driver);
      VanSounds.heartbeat(TIMES.one - TIMES.driver);

      const pic = this.placed("van_driver");
      const home = { x: pic.x, y: pic.y };

      // ZOOM: make the picture 'z' times bigger, and move it so that the
      // point (fx, fy) on the picture lands in the middle of the screen.
      const zoomTo = ([fx, fy], z) => {
        VanSounds.whoosh();
        this.tweens.add({ targets: pic, scale: z, x: W / 2 - fx * z, y: H / 2 - fy * z,
                          duration: 800, ease: "Cubic.easeInOut" });
      };
      const zoomOut = () => {
        VanSounds.whoosh();
        this.tweens.add({ targets: pic, scale: 1, x: home.x, y: home.y, duration: 700, ease: "Cubic.easeInOut" });
      };

      // A countdown number, slammed into the middle of the screen
      const count = (n, bigShake) => {
        VanSounds.count();
        const num = this.add.text(W / 2, H / 2, String(n), {
          fontFamily: BIG_FONT, fontSize: "420px", color: "#ffe81f", stroke: "#000000", strokeThickness: 24,
        }).setOrigin(0.5).setScale(2.5).setAlpha(0);
        this.tweens.add({ targets: num, scale: 1, alpha: 1, duration: 200, ease: "Quad.easeIn",
                          onComplete: () => this.cameras.main.shake(bigShake ? 600 : 200, bigShake ? 0.02 : 0.008) });
        this.tweens.add({ targets: num, alpha: 0, delay: 1300, duration: 300, onComplete: () => num.destroy() });
      };

      at(TIMES.eyes, () => zoomTo(L.van_eyes, 3));          // focus...
      at(TIMES.eyes + 0.6, () => VanSounds.rev(1));
      at(TIMES.eyes + 1, () => count(3));
      at(TIMES.out1, zoomOut);
      at(TIMES.hands, () => zoomTo(L.van_hands, 1.9));      // hands on the wheel
      at(TIMES.hands + 0.6, () => VanSounds.rev(2));
      at(TIMES.hands + 1, () => count(2));
      at(TIMES.out2, zoomOut);
      at(TIMES.bigRev, () => { VanSounds.rev(2); this.cameras.main.shake(400, 0.006); });
      at(TIMES.one - 2, () => VanSounds.drumroll(2));        // hold...
      at(TIMES.one - 2.5, () => VanSounds.creak());          // a creaky door, somewhere...
      at(TIMES.one, () => { count(1, true); VanSounds.rev(3); VanSounds.thunder(); });

      // The picture grows and grows, and fades away
      at(TIMES.expand, () => {
        VanSounds.rev(3);
        this.tweens.add({ targets: pic, scale: 4, x: W / 2 - pic.width * 2, y: H / 2 - pic.height * 2,
                          alpha: 0, duration: 1400, ease: "Quad.easeIn" });
      });
    }

    // =====================================================================
    //  PANEL 2 - VROOOOM
    // =====================================================================
    showVroom() {
      const t0 = TIMES.vroomPanel;
      const at = (time, fn) => this.at(time - t0, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      this.add.image(0, 0, "van_vroom_blank").setOrigin(0);

      const van = this.placed("van_van");
      const say = this.placed("van_herewego");
      this.rollDown(say, 0);
      at(TIMES.hereWeGo, () => { this.rollDown(say, 1200); VanSounds.theremin(3.5); });

      // VROOOOM: pops up as he revs, and the van shakes with it
      const vroom = this.middle(this.placed("van_vroom")).setScale(0);
      at(TIMES.revVan, () => {
        VanSounds.rev(3);
        this.tweens.add({ targets: vroom, scale: 1, duration: 300, ease: "Back.easeOut" });
        this.tweens.add({ targets: van, y: van.y - 4, duration: 50, yoyo: true, repeat: 12 });
      });

      // Off it goes, faster and faster, until its front hits the post
      at(TIMES.go, () => {
        this.tweens.add({ targets: say, alpha: 0, duration: 200 });
        this.tweens.add({ targets: van, x: van.x + L.van_to_post, duration: (TIMES.bam - TIMES.go) * 1000,
                          ease: "Quad.easeIn" });
      });
    }

    // =====================================================================
    //  PANEL 3 - BAM
    // =====================================================================
    showBam() {
      const t0 = TIMES.bam;
      const at = (time, fn) => this.at(time - t0, fn);
      VanSounds.crash();
      VanSounds.scream();
      VanSounds.engineOff(1.2);
      this.cameras.main.flash(250, 255, 255, 255);
      this.cameras.main.shake(500, 0.02);
      this.add.image(0, 0, "van_bam_blank").setOrigin(0);

      // The van: origin at the middle of its bottom, so it rocks on its wheels
      const van = this.placed("van_bam_van");
      van.setOrigin(0.5, 1).setPosition(van.x + van.width / 2, van.y + van.height);
      const vy = van.y;
      // Bounce about: hops that get smaller, and a rock from side to side
      [40, 26, 14, 6].forEach((hop, i) => this.at(i * 0.36, () =>
        this.tweens.add({ targets: van, y: vy - hop, duration: 170, yoyo: true, ease: "Quad.easeOut" })));
      this.tweens.add({ targets: van, angle: { from: -5, to: 4 }, duration: 160, yoyo: true, repeat: 4,
                        onComplete: () => van.setAngle(0) });

      // BAM slams in
      const bam = this.middle(this.placed("van_bam")).setScale(2.2).setAlpha(0);
      this.tweens.add({ targets: bam, scale: 1, alpha: 1, duration: 220, ease: "Quad.easeIn" });

      // the sad trombone, once the bouncing settles
      at(TIMES.bam + 0.8, () => VanSounds.sad());

      // "...and promptly crashed into the barrier of the car park!"
      const words = this.placed("van_crashed");
      this.rollDown(words, 0);
      at(TIMES.crashedText, () => this.rollDown(words, 2500));
    }

    // =====================================================================
    //  PANEL 4 - FIVE MINUTES LATER
    // =====================================================================
    showFive() {
      const t0 = TIMES.five;
      const at = (time, fn) => this.at(time - t0, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      const five = this.middle(this.placed("van_five")).setScale(0.2).setAngle(-12);
      VanSounds.sting();
      VanSounds.theremin(TIMES.forecast - TIMES.five - 1.5);   // ooo-eee-ooo...
      this.tweens.add({ targets: five, scale: 1, angle: 0, duration: 600, ease: "Back.easeOut" });

      const words = this.placed("van_hooboy");
      this.rollDown(words, 0);
      at(TIMES.hooBoy, () => this.rollDown(words, 3000));
    }

    // =====================================================================
    //  PANEL 5 - TODAY'S DRIVING FORECAST
    // =====================================================================
    // The drawings come in one by one, and each one comes to life.
    // (Times here are seconds from the start of this panel, because the
    //  whole panel plays TWICE: see FORECAST below.)
    showForecast() {
      this.add.image(0, 0, "fc_blank").setOrigin(0);       // just the title
      VanSounds.thunder();

      // Pop something into place: from nothing, with a little bounce
      const pop = (sprite, when) => {
        sprite.setScale(0);
        this.at(when, () => { VanSounds.tickUp(8); this.tweens.add({ targets: sprite, scale: 1, duration: 450, ease: "Back.easeOut" }); });
        return sprite;
      };
      const F = FORECAST;

      // ---- 1. THE DIAL: the needle ticks up from Easy... to FRENCH ----
      const dial = pop(this.middle(this.placed("fc_dial")), F.dial);
      const [hx, hy] = L.fc_hub;
      const needle = this.add.graphics({ x: hx, y: hy }).setVisible(false);
      // The needle points straight UP when its angle is 0, so its angle
      // is "degrees round the clock": -100 = Easy (left), 100 = French (right).
      needle.fillStyle(0x1d1b14);
      needle.fillTriangle(-14, 0, 14, 0, 0, -L.fc_needle);
      needle.fillCircle(0, 0, L.fc_hub_r);
      needle.angle = -100;
      this.at(F.dial + 0.5, () => needle.setVisible(true));
      // Tick, tick, tick... each tick a bit sooner than the last
      const STEPS = 14;
      let when = F.needle;
      for (let i = 1; i <= STEPS; i++) {
        const angle = -100 + (200 * i) / STEPS;
        this.at(when, () => { needle.angle = angle; VanSounds.tickUp(i); });
        when += 0.26 - i * 0.014;
      }
      // FRENCH! It slams against the end and shudders, with an alarm
      this.at(when, () => {
        VanSounds.alarm();
        this.cameras.main.shake(300, 0.008);
        this.tweens.add({ targets: needle, angle: { from: 112, to: 100 }, duration: 90, yoyo: true, repeat: 6 });
        this.tweens.add({ targets: dial, scale: 1.06, duration: 90, yoyo: true, repeat: 3 });
      });

      // ---- 2. THE ANGRY DRIVER: wheel yanked left and right, eyebrows going ----
      const face = pop(this.middle(this.placed("fc_face")), F.driver);
      const brows = pop(this.middle(this.placed("fc_brows")), F.driver);
      const wheel = pop(this.middle(this.placed("fc_wheel")), F.driver);
      this.at(F.driver + 0.6, () => {
        VanSounds.grumble();
        this.tweens.add({ targets: wheel, angle: { from: -40, to: 40 }, duration: 320, yoyo: true, repeat: 6,
                          ease: "Sine.easeInOut", onComplete: () => wheel.setAngle(0) });
        this.tweens.add({ targets: brows, y: brows.y - 7, angle: { from: -4, to: 4 }, duration: 140, yoyo: true, repeat: 14 });
        this.tweens.add({ targets: face, angle: { from: -3, to: 3 }, duration: 160, yoyo: true, repeat: 12,
                          onComplete: () => face.setAngle(0) });
      });

      // ---- 3. THE LORRY: jogging on the spot, and THAT hand going up ----
      const cab = pop(this.middle(this.placed("fc_cab")), F.lorry);
      const tyre = pop(this.middle(this.placed("fc_tyre")), F.lorry);
      // The arm swings from its shoulder: put its origin there
      const arm = this.placed("fc_arm");
      const [sx, sy] = L.fc_shoulder;
      arm.setOrigin((sx - arm.x) / arm.width, (sy - arm.y) / arm.height).setPosition(sx, sy);
      pop(arm, F.lorry);
      this.at(F.lorry + 0.6, () => {
        this.tweens.add({ targets: [cab, arm], y: "-=10", duration: 140, yoyo: true, repeat: 15 });
        this.tweens.add({ targets: tyre, angle: 360, duration: 1100, repeat: 3 });        // wheel spinning
        [0, 1.4, 2.8].forEach((t) => this.at(t, () => {
          VanSounds.whistleUp();
          this.tweens.add({ targets: arm, angle: { from: 30, to: -10 }, duration: 450, ease: "Back.easeOut",
                            onComplete: () => this.tweens.add({ targets: arm, angle: 0, duration: 300, delay: 400 }) });
        }));
      });

      // ---- 4. THE LITTLE VANS, to the Ride of the Valkyries ----
      const blue = this.middle(this.placed("fc_blue"));
      const pink = this.middle(this.placed("fc_pink"));
      const burnt = this.middle(this.placed("fc_burnt")).setAlpha(0);
      // Both drive along the same road: the blue one's bottom lines up with the pink one's
      blue.y = pink.y + (pink.height - blue.height) / 2;
      const blueStop = W * 0.45, pinkStop = blueStop - (blue.width + pink.width) / 2 - 90;
      blue.x = -blue.width; pink.x = -blue.width - pink.width - 160;
      let bobs = [];
      this.at(F.vans, () => {
        VanSounds.valkyries(4);
        bobs = [blue, pink].map((v) => this.tweens.add({ targets: v, y: "-=7", duration: 130, yoyo: true, repeat: -1 }));
        this.tweens.add({ targets: blue, x: blueStop, duration: 4500, ease: "Sine.easeOut" });
        this.tweens.add({ targets: pink, x: pinkStop, duration: 4500, ease: "Sine.easeOut" });
      });
      // The pink van shoots forward and BUMPS the blue one...
      const bumpAt = F.vans + 4.8;
      this.at(bumpAt, () => this.tweens.add({ targets: pink, x: blueStop - (blue.width + pink.width) / 2 + 8,
                                              duration: 350, ease: "Quad.easeIn" }));
      // ...and the blue one FLIPS, over and over, landing upside down in
      // flames where the burnt-out van is in the drawing
      this.at(bumpAt + 0.35, () => {
        VanSounds.bonk();
        VanSounds.whoosh();
        bobs[0].remove();
        this.tweens.add({ targets: blue, x: burnt.x, angle: 540, duration: 1300, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: blue, y: blue.y - 380, duration: 650, ease: "Quad.easeOut" });   // up...
        this.tweens.add({ targets: blue, y: burnt.y, duration: 650, delay: 650, ease: "Quad.easeIn" }); // ...and down
      });
      this.at(bumpAt + 1.65, () => {
        VanSounds.crash();
        VanSounds.fire(5);
        this.cameras.main.shake(300, 0.01);
        blue.setVisible(false);
        burnt.setAlpha(1).setScale(0.6);
        this.tweens.add({ targets: burnt, scale: 1, duration: 300, ease: "Back.easeOut",
                          onComplete: () => this.tweens.add({ targets: burnt, scaleY: 1.05, scaleX: 0.98,
                                                              duration: 120, yoyo: true, repeat: -1 }) });
      });
      // The pink van drives off to the right
      this.at(bumpAt + 2.2, () => this.tweens.add({ targets: pink, x: W + pink.width, duration: 2200, ease: "Quad.easeIn" }));
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(VanManPlan);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: VanManPlan,
  });

}

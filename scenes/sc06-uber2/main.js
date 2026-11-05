// =====================================================================
//  main.js  -  EPISODE 6 "Uber World, Part Deux"
//              (uses page 11: IMG-017 street map, IMG-018 helmets and
//               words, IMG-019 chickens)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//   PANEL 1 - THE CENTRE OF THE ROAD
//    0    The street map, empty of cars. Traffic noise.
//    0.5  Red and blue cars drive up and down the road, in and out of
//         the picture, round and round (the left lane goes up, the right
//         lane comes down, like their little motion lines say).
//    5    Our pink Uber drives in from the bottom and stops - in the
//         MIDDLE of the road.
//    9    The words write in, top right: "The first Uber driver kindly
//         dropped off some of the Titanic Club..."
//   14    The six helmets: the family in the Uber with the driver.
//   17    "Driver: This is where you have to get out" writes in.
//   20.5  POP, POP, POP... each passenger pops out of existence,
//         leaving only the driver. Each pop ends in a chicken "bok!"
//         (a hint of the next panel).
//
//   PANEL 2 - RUUUN!
//   27.5  The chicken panel, empty.
//   28    The words write in: "Quickly, they ran to safety, like
//         adrenaline-soaked chickens..."
//   33.5  "RUUUN!" and the chickens dash from RIGHT to LEFT, clucking.
//         (Right to left is Enda's call here. The van keeps right to
//          left for its comedy retreat.)
//   41    Off the left edge, they FLIP round and dash back LEFT to RIGHT...
//   47.5  ...off the right edge. A pause: an empty panel.
//   50    They run back in from the right and park in their own spot.
//
//   THE B TEAM  (page 12, IMG-020, with our loony 8-bit tune)
//   57    On black, typed out: "Meanwhile in another reality..."
//         (wobbling), "...er, I mean another Uber.", "Let's call it
//         the B team.."
//   69    The page, with every panel EMPTY.
//   70    The words at the bottom of the page reel in.
//   79    The top cartoon (Rhianna and the driver), no words. Hold 5.
//   84    Rhianna: "car hire, here we come!"  Hold 5.
//   91    The driver: "Hey Madam... want to go to the train station?"
//   97    Rhianna daydreaming (middle left)... thinking dots, one by one.
//  103    Rhianna deciding (middle right).
//  104.5  YE,  GO  ON!  one word at a time, HUGE, in the middle. BOOM!
//  111    Zoom in on the bottom panel: le car hire, no Uber.
//  112.5  The Uber jogs in from the left...
//  116.5  ..."wait, STOP!" - and it speeds off, leaving the shout
//         hanging in the air. Hold 5.
//
//   THE LIFT  (top-left mini panel of IMG-023)
//  124    The empty waiting room. The "Car hire" sign draws in, then the
//         painting and the clock appear, and the lift (down).
//  131    The six potatoes walk in and take their places. Enda and
//         Annelisa go into the lift. "Be right back".
//  141    The lift goes up and away.
//  144    Waiting music. The clock ticks, and time moves on...
//  154    ...to half past: the lift comes back down.
//  157.5  Enda and Annelisa step out; everyone CHEERS...
//  160    ...and off they all go, to the right.
//  165    Fade out. The end.
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    traffic: 0.5,
    uber: 5,              // it takes 3 seconds to pull up
    droppedText: 9,
    helmets: 14,
    driverSays: 17,
    popOut: 20.5,         // one head every 0.6 seconds
    chickensPanel: 27.5,
    quicklyText: 28,
    run: 33.5,            // right to left: 7 seconds
    runBack: 41,          // flipped, left to right: 6 seconds
    comeHome: 50,         // in from the right, slowing to a stop: 3 seconds
    // the B team
    meanwhile: 57,
    page: 69,
    pageWords: 70,
    topCartoon: 79,
    rhiannaSays: 84,
    uberDriverSays: 91,
    thinking: 97,         // the dots come 1.5, 2.5 and 3.5 seconds later
    decides: 103,
    bigWords: 104.5,      // one every 1.1 seconds
    zoomIn: 111,
    uberIn: 112.5,        // jogging along for 4 seconds
    uberGo: 116.5,
    // the lift
    liftRoom: 124,
    sign: 124.5,
    painting: 127,
    clock: 128,
    lift: 129.5,
    arrive: 131,          // one potato every 0.6 seconds
    beRightBack: 137.5,
    liftUp: 141,
    waiting: 144,         // the clock goes round to half past in 10 seconds
    liftDown: 154,
    stepOut: 157.5,
    cheer: 158.5,
    exit: 160,
    fadeOut: 165,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT6;         // sprite positions, from layout.js
  const LB = window.LAYOUT6B;       // ...and for the B team, from layout_bteam.js
  // The book's style of writing, as near as the computer/iPad has
  const BOOK_FONT = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Trebuchet MS", sans-serif';

  class Deuxieme extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("uber2"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      pic("map_blank", "map_blank.jpg");
      for (const c of L.cars) pic(c.key, c.key + ".png");
      for (const key of ["uber_top", "driver_says", "dropped_text", "helmets_empty",
                         "ruun", "chickens", "chickens_run", "quickly_text"]) pic(key, key + ".png");
      for (let i = 1; i <= 5; i++) pic("helmet_head" + i, `helmet_head${i}.png`);
      pic("chicken_blank", "chicken_blank.jpg");
      // The B team: every picture named in layout_bteam.js, plus the backgrounds
      for (const key in LB) if (LB[key].x !== undefined) pic(key, key + ".png");
      pic("bt_page", "bt_page.jpg");
      pic("lf_room", "lf_room.jpg");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.loops = [];
      this.cars = [];
      // "Play all": we arrive straight from episode 5, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    start() {
      this.showMap();
      this.at(TIMES.chickensPanel - 1.2, () => { this.cameras.main.fadeOut(1000, 0, 0, 0); Deux.trafficOff(1); });
      this.at(TIMES.chickensPanel, () => { this.cut(); this.showChickens(); });
      // The B team
      this.at(TIMES.meanwhile - 1.2, () => this.cameras.main.fadeOut(1000, 0, 0, 0));
      this.at(TIMES.meanwhile, () => { this.cut(); this.showMeanwhile(); });
      this.at(TIMES.page, () => { this.cut(); this.showPage(); });
      this.at(TIMES.liftRoom - 1.2, () => { this.cameras.main.fadeOut(1000, 0, 0, 0); Deux.loonyOff(1.2); });
      this.at(TIMES.liftRoom, () => { this.cut(); this.showLift(); });
      this.at(TIMES.fadeOut, () => {
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => showEnd());  // in index.html / play-all.html
      });
    }

    // A "cut": clear the screen for the next picture
    cut() {
      this.loops.forEach((loop) => loop.remove());
      this.loops = [];
      this.cars = [];
      this.tweens.killAll();
      this.children.removeAll(true);
      this.orbit = null;
      this.cameras.main.setZoom(1).centerOn(W / 2, H / 2);     // undo any zoom
      this.cameras.main.fadeIn(700);
    }

    // Put a sprite's origin in its middle WITHOUT moving it (so it can
    // grow, shrink, spin or bounce around its middle).
    middle(sprite) {
      return sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    }

    // An image at its place from layout_bteam.js
    placed(key) {
      return this.add.image(LB[key].x, LB[key].y, key).setOrigin(0);
    }

    // =====================================================================
    //  PANEL 1 - THE CENTRE OF THE ROAD
    // =====================================================================
    showMap() {
      Deux.traffic(TIMES.chickensPanel + 1);
      this.add.image(0, 0, "map_blank").setOrigin(0);
      this.cameras.main.fadeIn(600);

      // The traffic. Each car remembers its lane; update() below moves
      // them every frame.
      this.at(TIMES.traffic, () => {
        for (const c of L.cars) {
          const car = this.add.image(c.x, c.y, c.key).setOrigin(0).setDepth(1);
          car.lane = c.lane;
          this.cars.push(car);
        }
      });
      // a horn now and then
      this.loops.push(this.time.addEvent({ delay: 3700, loop: true, callback: () => Deux.horn() }));

      // Our pink Uber drives up from the bottom and stops in the middle
      const uber = this.add.image(L.uber_top.x, H + 20, "uber_top").setOrigin(0).setDepth(1);
      this.at(TIMES.uber, () => {
        this.tweens.add({ targets: uber, y: L.uber_top.y, duration: 3000, ease: "Cubic.easeOut" });
        this.at(2.3, () => Deux.brakes());
      });

      // The words, top right
      const words = this.add.image(L.dropped_text.x, L.dropped_text.y, "dropped_text").setOrigin(0);
      this.rollDown(words, 0);
      this.at(TIMES.droppedText, () => this.rollDown(words, 4000));

      // The six helmets: the empty helmets picture, with the five
      // passengers' faces sitting on top of it (the driver is part of
      // the picture, so he stays when the others pop out)
      const panel = this.add.container(L.helmets.x, L.helmets.y).setAlpha(0);
      panel.add(this.add.image(0, 0, "helmets_empty").setOrigin(0));
      const heads = [];
      for (let i = 1; i <= 5; i++) {
        const p = L["helmet_head" + i];
        const head = this.add.image(p.x - L.helmets.x, p.y - L.helmets.y, "helmet_head" + i).setOrigin(0);
        // shrink towards its middle when it pops: origin in the middle
        head.setOrigin(0.5).setPosition(head.x + head.width / 2, head.y + head.height / 2);
        heads.push(head);
      }
      panel.add(heads);
      this.at(TIMES.helmets, () => {
        Deux.ding();
        panel.setScale(0.9);
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 600, ease: "Back.easeOut" });
      });

      // "Driver: This is where you have to get out"
      const says = this.add.image(L.driver_says.x, L.driver_says.y, "driver_says").setOrigin(0).setDepth(2);
      this.rollDown(says, 0);
      this.at(TIMES.driverSays, () => this.rollDown(says, 2500));

      // POP! One by one, the passengers vanish
      heads.forEach((head, i) => this.at(TIMES.popOut + i * 0.6, () => {
        Deux.pop(i);
        this.at(0.15, () => Deux.cluck());   // a "bok!" as they go: a hint of the chickens to come
        this.tweens.add({ targets: head, scale: 0, duration: 220, ease: "Back.easeIn" });
        this.puff(panel.x + head.x, panel.y + head.y);
      }));
    }

    // Phaser calls update() every frame. Move the traffic: the left lane
    // goes up, the right lane comes down, each lane at its own steady
    // speed (so no car bumps into the one in front). When a car drives
    // off one end, it comes back in at the other: it jumps a whole
    // "loop" (the screen's height plus a gap), so the gaps stay the same.
    update(time, delta) {
      const seconds = delta / 1000;
      const LOOP = H + 260;
      for (const car of this.cars) {
        if (car.lane === 1) {
          car.y -= 130 * seconds;                         // up
          if (car.y + car.height < -130) car.y += LOOP;
        } else {
          car.y += 150 * seconds;                         // down
          if (car.y > H + 130) car.y -= LOOP;
        }
      }
    }

    // A little ring of white puffs where something popped
    puff(x, y) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const dot = this.add.circle(x, y, 7, 0xffffff).setStrokeStyle(2, 0x1d1b14).setDepth(3);
        this.tweens.add({
          targets: dot, x: x + Math.cos(a) * 60, y: y + Math.sin(a) * 60, scale: 0.2, alpha: 0,
          duration: 400, ease: "Quad.easeOut", onComplete: () => dot.destroy(),
        });
      }
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
    //  PANEL 2 - RUUUN!
    // =====================================================================
    showChickens() {
      const t0 = TIMES.chickensPanel;
      this.add.image(0, 0, "chicken_blank").setOrigin(0);

      const words = this.add.image(L.quickly_text.x, L.quickly_text.y, "quickly_text").setOrigin(0);
      this.rollDown(words, 0);
      this.at(TIMES.quicklyText - t0, () => this.rollDown(words, 4000));

      // RUUUN! grows out of nothing
      const ruun = this.add.image(L.ruun.x, L.ruun.y, "ruun").setOrigin(0);
      ruun.setOrigin(0.5).setPosition(ruun.x + ruun.width / 2, ruun.y + ruun.height / 2).setScale(0);

      // The flock. While running it uses "chickens_run" (the picture with
      // its cut-off edges blurred); once parked it swaps to "chickens"
      // (sharp edges, exactly as drawn).
      // Its origin is its MIDDLE, so flipping it (flipX) turns it round
      // on the spot. home = where its middle sits in the drawing.
      const flock = this.add.image(0, 0, "chickens_run");
      const homeX = L.chickens.x + flock.width / 2;
      const homeY = L.chickens.y + flock.height / 2;
      const offLeft = -flock.width / 2 - 20;          // just off the left edge
      const offRight = W + flock.width / 2 + 20;      // just off the right edge
      flock.setPosition(offRight, homeY);

      // Bobbing up and down and wobbling, for as long as they run
      let bob = null;
      const startBob = () => {
        bob = this.tweens.add({ targets: flock, y: homeY - 14, angle: { from: -2, to: 2 },
                                duration: 110, yoyo: true, repeat: -1 });
      };
      const stopBob = () => { if (bob) bob.remove(); flock.setY(homeY).setAngle(0); };

      // 1. RUUUN! Right to left, and away off the left edge
      this.at(TIMES.run - t0, () => {
        this.tweens.add({ targets: ruun, scale: 1, duration: 300, ease: "Back.easeOut" });
        this.tweens.add({ targets: ruun, angle: { from: -6, to: 6 }, duration: 90, yoyo: true, repeat: 20 });
        Deux.panic(7);
        Deux.scurry(7);
        startBob();
        this.tweens.add({ targets: flock, x: offLeft, duration: 7000, ease: "Linear" });
      });

      // 2. Turn round (flipX = mirror image, so they face right) and
      //    dash back left to right, off the right edge
      this.at(TIMES.runBack - t0, () => {
        flock.setFlipX(true);
        Deux.panic(6);
        Deux.scurry(6);
        this.tweens.add({ targets: flock, x: offRight, duration: 6000, ease: "Linear",
                          onComplete: stopBob });       // 3. off screen: hold
      });

      // 4. Back in from the right, facing left again, slowing down to
      //    stop in their own spot. Then swap to the sharp picture.
      this.at(TIMES.comeHome - t0, () => {
        flock.setFlipX(false);
        Deux.panic(2.5);
        startBob();
        this.tweens.add({
          targets: flock, x: homeX, duration: 3000, ease: "Quad.easeOut",
          onComplete: () => {
            stopBob();
            flock.setTexture("chickens");
            Deux.cluck();
            this.at(0.3, () => Deux.cluck());
          },
        });
      });
    }

    // =====================================================================
    //  THE B TEAM, 1 - "Meanwhile in another reality..."
    // =====================================================================
    // Three lines typed out one letter at a time on black. The first one
    // wobbles like a dream, until "...er, I mean another Uber" snaps it
    // back to normal.
    showMeanwhile() {
      const style = { fontFamily: BOOK_FONT, fontSize: "64px", color: "#ffe81f", align: "center" };
      const LINES = [
        { words: "Meanwhile in another reality...", y: 300, at: 0.5 },
        { words: "...er, I mean another Uber.", y: 450, at: 4.5 },
        { words: "Let's call it the B team..", y: 600, at: 8 },
      ];
      const texts = LINES.map((line) => this.add.text(W / 2, line.y, "", style).setOrigin(0.5));

      LINES.forEach((line, n) => this.at(line.at, () => this.typeOut(texts[n], line.words)));

      // The dreamy wobble on the first line (a stretchy, swaying tween)
      this.at(LINES[0].at, () => {
        Deux.warp();
        texts[0].wobble = this.tweens.add({ targets: texts[0], scaleY: 1.25, scaleX: 0.92, angle: 3,
                                            duration: 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      });
      // "...er, I mean" - snap back to normal
      this.at(LINES[1].at, () => { texts[0].wobble.remove(); texts[0].setScale(1).setAngle(0); });
    }

    // Type 'words' into a text object one letter at a time, with a blip
    typeOut(text, words) {
      let n = 0;
      this.loops.push(this.time.addEvent({
        delay: 55, repeat: words.length - 1, callback: () => {
          n++;
          text.setText(words.slice(0, n));
          if (words[n - 1] !== " " && n % 2) Deux.blip();
        },
      }));
    }

    // =====================================================================
    //  THE B TEAM, 2 - page 12: Rhianna's Uber
    // =====================================================================
    showPage() {
      const t0 = TIMES.page;
      const at = (time, fn) => this.at(time - t0, fn);      // times from the TIMES table
      Deux.loony(TIMES.liftRoom - TIMES.page);
      this.add.image(0, 0, "bt_page").setOrigin(0);        // the page, every panel empty

      // A panel appears: a quick fade in
      const panel = (key, time) => {
        const p = this.placed(key).setAlpha(0);
        at(time, () => { Deux.ding(); this.tweens.add({ targets: p, alpha: 1, duration: 800 }); });
        return p;
      };

      // The words at the bottom reel in, line by line
      const words = this.placed("bt_words");
      this.rollDown(words, 0);
      at(TIMES.pageWords, () => this.rollDown(words, 6000));

      // The top cartoon, then what each of them says
      panel("bt_top", TIMES.topCartoon);
      const rSays = this.placed("bt_r_says");
      this.rollDown(rSays, 0);
      at(TIMES.rhiannaSays, () => this.rollDown(rSays, 2000));
      const dSays = this.placed("bt_d_says");
      this.rollDown(dSays, 0);
      at(TIMES.uberDriverSays, () => this.rollDown(dSays, 3000));

      // Rhianna thinking: the dots come one at a time
      panel("bt_midleft", TIMES.thinking);
      [1, 2, 3].forEach((n) => {
        const dot = this.placed("bt_dot" + n).setVisible(false);
        at(TIMES.thinking + 0.5 + n, () => { dot.setVisible(true); Deux.blip(); });
      });

      // Rhianna decides...
      panel("bt_midright", TIMES.decides);
      this.bigWords(["YE,", "GO", "ON!"], TIMES.bigWords - t0);
      const yeGoOn = this.placed("bt_yegoon");
      this.rollDown(yeGoOn, 0);
      at(TIMES.bigWords + 3.6, () => this.rollDown(yeGoOn, 1200));

      // The bottom panel: zoom the camera in on it
      const bottom = panel("bt_bottom", TIMES.zoomIn);
      const midX = bottom.x + bottom.width / 2, midY = bottom.y + bottom.height / 2;
      at(TIMES.zoomIn, () => {
        this.cameras.main.pan(midX, midY, 1500, "Sine.easeInOut");
        this.cameras.main.zoomTo(1.8, 1500, "Sine.easeInOut");
      });
      this.uberRun(bottom);
    }

    // Huge words, one at a time, slammed into the middle of the screen
    bigWords(list, start) {
      const dark = this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0).setAlpha(0).setDepth(10);
      let shown = null;
      list.forEach((word, i) => this.at(start + i * 1.1, () => {
        if (i === 0) dark.setAlpha(0.6);
        if (shown) shown.destroy();
        shown = this.add.text(W / 2, H / 2, word, {
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif', fontSize: "260px",
          color: "#ffe81f", stroke: "#000000", strokeThickness: 18,
        }).setOrigin(0.5).setDepth(11).setScale(3).setAlpha(0);
        // SLAM: from huge and see-through down to its size, then a shake
        this.tweens.add({ targets: shown, scale: 1, alpha: 1, duration: 180, ease: "Quad.easeIn",
                          onComplete: () => { Deux.boom(i); this.cameras.main.shake(180, 0.012); } });
      }));
      this.at(start + list.length * 1.1 + 0.5, () => {
        this.tweens.add({ targets: [dark, shown], alpha: 0, duration: 400 });
      });
    }

    // The Uber: jogs in from the left, then "wait, STOP!" and it zooms off,
    // leaving the shout hanging in the air. A "mask" the shape of the
    // panel hides the car whenever it's outside the panel.
    uberRun(bottom) {
      const t0 = TIMES.page;
      const at = (time, fn) => this.at(time - t0, fn);
      const window_ = this.make.graphics({ add: false });
      window_.fillRect(bottom.x + 4, bottom.y + 4, bottom.width - 8, bottom.height - 8);
      const mask = window_.createGeometryMask();

      const car = this.placed("bt_uber").setMask(mask);
      const homeX = car.x, homeY = car.y;
      car.x = bottom.x - car.width;                       // waiting just outside the panel, left
      const lines = this.placed("bt_zoom").setMask(mask).setVisible(false);
      const linesOffset = lines.x - homeX;                 // speed lines sit just behind the car
      const shout = this.middle(this.placed("bt_stop")).setScale(0);

      // Jogging along: steady speed, bouncing up and down
      let bob = null;
      at(TIMES.uberIn, () => {
        Deux.putter(TIMES.uberGo - TIMES.uberIn);
        this.tweens.add({ targets: car, x: homeX, duration: (TIMES.uberGo - TIMES.uberIn) * 1000, ease: "Linear" });
        bob = this.tweens.add({ targets: car, y: homeY - 5, duration: 140, yoyo: true, repeat: -1 });
      });

      // "wait, STOP!" ... and it's gone
      at(TIMES.uberGo, () => {
        bob.remove(); car.y = homeY;
        this.tweens.add({ targets: shout, scale: 1, duration: 250, ease: "Back.easeOut" });
        lines.setPosition(car.x + linesOffset, homeY + (lines.y - homeY)).setVisible(true);
        Deux.zoom();
        this.tweens.add({ targets: [car, lines], x: "+=" + (bottom.width + 300), duration: 800,
                          delay: 150, ease: "Quad.easeIn" });
      });
    }

    // =====================================================================
    //  THE B TEAM, 3 - the lift
    // =====================================================================
    showLift() {
      const t0 = TIMES.liftRoom;
      const at = (time, fn) => this.at(time - t0, fn);
      this.add.image(0, 0, "lf_room").setOrigin(0);

      // The "Car hire" sign draws in, then the painting and the clock pop up
      const sign = this.placed("lf_sign");
      this.rollDown(sign, 0);
      at(TIMES.sign, () => this.rollDown(sign, 2000));
      const pop = (sprite, time) => {
        sprite.setScale(0);
        at(time, () => { Deux.pop(0); this.tweens.add({ targets: sprite, scale: 1, duration: 450, ease: "Back.easeOut" }); });
      };
      pop(this.middle(this.placed("lf_painting")), TIMES.painting);

      // The clock: its face, with hands we draw ourselves so they can turn.
      // Both go in a "container" at the clock's middle, so the whole clock
      // can pulse bigger and smaller.
      const [cx, cy] = LB.lf_clock_centre, r = LB.lf_clock_radius;
      const clock = this.add.container(cx, cy);
      clock.add(this.add.image(LB.lf_clock.x - cx, LB.lf_clock.y - cy, "lf_clock").setOrigin(0));
      const hands = this.add.graphics();
      clock.add(hands);
      const time = { minutes: 60 };                   // minutes past twelve: 60 = one o'clock
      const drawHands = () => {
        // angle round the clock: 0 = pointing up (12), going clockwise
        const hand = (angle, length, width) => {
          hands.lineStyle(width, 0x1d1b14);
          hands.lineBetween(0, 0, Math.sin(angle) * length, -Math.cos(angle) * length);
        };
        hands.clear();
        hand((time.minutes / 60) * Math.PI * 2, r * 0.62, 5);          // minute hand: once round an hour
        hand((time.minutes / 720) * Math.PI * 2, r * 0.42, 7);         // hour hand: once round in 12 hours
      };
      drawHands();
      pop(clock, TIMES.clock);

      // The lift, down on our floor
      const lift = this.placed("lf_lift").setDepth(1).setAlpha(0);
      at(TIMES.lift, () => { Deux.ding(); this.tweens.add({ targets: lift, alpha: 1, duration: 600 }); });

      // The six potatoes walk in from the left to their places.
      // 5 and 6 are Enda and Annelisa: their places are IN the lift.
      const pots = [1, 2, 3, 4, 5, 6].map((n) => {
        const p = this.placed("lf_pot" + n).setDepth(2);
        p.homeX = p.x; p.homeY = p.y;
        p.x = -p.width - 20;
        return p;
      });
      const walk = (p, toX, seconds, then) => {
        const bob = this.tweens.add({ targets: p, y: p.homeY - 10, duration: 130, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: p, x: toX, duration: seconds * 1000, ease: "Linear",
                          onComplete: () => { bob.remove(); p.y = p.homeY; if (then) then(); } });
      };
      pots.forEach((p, i) => at(TIMES.arrive + i * 0.6, () => { Deux.blip(); walk(p, p.homeX, 3 + i * 0.15); }));

      // "Be right back"
      const brb = this.placed("lf_brb").setDepth(3);
      this.rollDown(brb, 0);
      at(TIMES.beRightBack, () => this.rollDown(brb, 1500));

      // Up goes the lift, with Enda and Annelisa in it
      const riders = [lift, pots[4], pots[5]];
      at(TIMES.liftUp, () => {
        this.tweens.add({ targets: brb, alpha: 0, duration: 400 });
        Deux.whirr(3);
        this.tweens.add({ targets: riders, y: "-=" + (lift.y + lift.height + 40), duration: 3000, ease: "Sine.easeIn" });
      });

      // Waiting... the clock ticks (and pulses), time flies round to half
      // past one, and the four left behind fidget
      at(TIMES.waiting, () => {
        const seconds = TIMES.liftDown - TIMES.waiting;
        Deux.waiting(seconds + 1);
        this.tweens.add({ targets: time, minutes: 90, duration: seconds * 1000, ease: "Linear", onUpdate: drawHands });
        this.loops.push(this.time.addEvent({ delay: 500, repeat: seconds * 2 - 1, callback: () => {
          Deux.tick();
          this.tweens.add({ targets: clock, scale: 1.12, duration: 80, yoyo: true });
        } }));
        this.loops.push(this.time.addEvent({ delay: 900, repeat: Math.floor(seconds / 0.9) - 1, callback: () => {
          const p = pots[Math.floor(Math.random() * 4)];
          this.tweens.add({ targets: p, y: p.homeY - 14, duration: 150, yoyo: true });
        } }));
      });

      // Half past: down comes the lift
      at(TIMES.liftDown, () => {
        Deux.waitingOff(1);
        Deux.ding();
        Deux.whirr(3);
        riders.forEach((p) => this.tweens.add({ targets: p, y: p === lift ? LB.lf_lift.y : p.homeY,
                                                 duration: 3000, ease: "Sine.easeOut" }));
      });

      // Out they step...
      at(TIMES.stepOut, () => {
        walk(pots[4], pots[4].homeX - 170, 0.7);
        walk(pots[5], pots[5].homeX - 130, 0.7);
      });

      // ...HOORAY! Everyone jumps for joy...
      at(TIMES.cheer, () => {
        Deux.cheer();
        pots.forEach((p, i) => this.tweens.add({ targets: p, y: p.homeY - 50, duration: 220, yoyo: true,
                                                 repeat: 1, delay: i * 40, ease: "Quad.easeOut" }));
      });

      // ...and off they go, to the right (the ones nearest the right first)
      at(TIMES.exit, () => {
        Deux.scurry(3);
        [...pots].sort((a, b) => b.x - a.x).forEach((p, i) =>
          this.at(i * 0.3, () => walk(p, W + 40, 2.6 - i * 0.1)));
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(Deuxieme);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Deuxieme,
  });

}

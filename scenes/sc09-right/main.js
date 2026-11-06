// =====================================================================
//  main.js  -  EPISODE 9 "Drive on your other Right!"
//              (uses IMG-037, IMG-038 and IMG-039)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//   PANEL 1 - ONE HOUR LATER  (IMG-037)
//    0    "One hour later", with the balloons and the #1 trophy.
//         The Ride of the Valkyries (the same 8-bit tune as episode 1)...
//    1.5  ...and the van jogs across the bottom, LEFT to RIGHT.
//   15    Fade away to a clean yellow page. Hold...
//
//   INTERLUDE
//   17    At the top, in plain "computer" letters:
//         "Interlude: Interesting Observation"
//   18.5  POP! Ta-da! The French number plates picture (IMG-038) pops up
//         like a phone notification.
//   25.5  Clear.
//
//   PANEL 2 - THE RANDOM TYRE  (IMG-039, the middle picture)
//   26.5  The van jogs along on the spot, engine ticking over. Hold...
//   30    WHOOSH: a lump of stray tyre rubber flies in from the top right,
//   30.7  BOOP! bounces off the van (leaving a scuff), and flies off.
//   32    Under the picture: the arrow and "Random tyre hitting the car".
//
//   PANEL 3 - "IT'LL COME OFF IN THE WASH!"  (IMG-039, right-hand picture)
//   38    Spud Enda, not worried at all, with the happy country tune
//         from episode 8. Hold for 5...
//
//   PANEL 4 - DRIVE ON THE RIGHT  (IMG-041 and IMG-042)
//   45    Full screen: the three front seats, everybody happily bopping
//         along, Enda's steering wheel turning. (Still the happy tune.)
//   48    The middle seat, smiling: "Drive on the RIGHT, Enda" (ahem)
//   54    Quick swap: now she's WORRIED. "DRIVE on the RIGHT" (dun-dun!)
//   58    Zoom in on her face...
//   59.5  ...and SWAP: "DRIVE ON THE RIIIGHT!" The music stops dead. Hold...
//
//   PANEL 5 - THE ROUNDABOUT  (IMG-043 and IMG-045)
//   65    Back to Spud Enda driving along, calm and happy (happy tune).
//   70    Split screen: Enda shrinks over to the right and turns WORRIED -
//         sweating, worry lines wobbling, still turning the wheel. Above:
//         "The minibus always stalled in first gear".
//         On the left: the roundabout. The pink minivan goes round...
//         stalls... revs... stalls... and all the cars behind it queue up
//         and HONK. Two cars loop round the other way. Every so often:
//         "Oops, that silly first gear..."
//   98    Fade out. (More to come!)
//
//  STORY RULE: the van travels LEFT to RIGHT (right to left is kept for
//  its comedy retreat, later on).
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    later: 0,
    busGo: 1.5,           // the van starts across...
    busGone: 14,          // ...and is off the right-hand side by now
    clear: 15,            // fade to a clean page
    interlude: 17,        // "Interlude: Interesting Observation"
    plates: 18.5,         // the pop-up
    tyrePanel: 26.5,      // the random tyre picture
    tyreIn: 30,           // (seconds from the START, like everything here)
    hit: 30.7,
    words: 32,
    wash: 38,             // "It'll come off in the wash!"
    seats: 45,            // the three front seats
    say1: 48,             // "Drive on the RIGHT, Enda" (smiling)
    say2: 54,             // worried: "DRIVE on the RIGHT"
    zoom: 58,
    scream: 59.5,         // "DRIVE ON THE RIIIGHT!"
    happy: 65,            // back to calm, happy Enda
    split: 70,            // split screen: the roundabout and worried Enda
    fadeOut: 98,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT9;         // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page
  // "System font": whatever plain font the computer / iPad uses for itself
  const SYSTEM_FONT = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  class OtherRight extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("right"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      for (const key of ["rt_later", "rt_blank", "rt_wash", "ds_blank", "ds_scream"]) pic(key, key + ".jpg");
      for (const key of ["ds_left", "ds_mid", "ds_right", "ds_mid2", "ds_say1", "ds_say2"]) pic(key, key + ".png");
      for (const key of ["rb_blank", "we_enda"]) pic(key, key + ".jpg");
      for (const key of ["rb_pink", "rb_blue1", "rb_blue2", "rb_blue3", "rb_red1", "rb_red2", "rb_oops",
                         "rb_honk1", "rb_honk2", "rb_honk3", "rb_stalled",
                         "we_wheel", "we_lines", "we_brow_l", "we_brow_r", "we_sweat_l", "we_sweat_r"])
        pic(key, key + ".png");
      for (const key of ["rt_bus", "rt_plates", "rt_van", "rt_tyre", "rt_lump", "rt_scuff", "rt_words"])
        pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      // "Play all": we arrive straight from episode 8, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    start() {
      this.loops = [];
      this.showLater();
      this.at(TIMES.clear, () => { RightSounds.valkyriesOff(1.5); this.cameras.main.fadeOut(1200, 0xf4, 0xea, 0xac); });
      this.at(TIMES.interlude, () => { this.cut([0xf4, 0xea, 0xac]); this.showInterlude(); });
      this.at(TIMES.tyrePanel - 1, () => this.cameras.main.fadeOut(900, 0, 0, 0));
      this.at(TIMES.tyrePanel, () => { this.cut(); this.showTyre(); });
      this.at(TIMES.wash - 0.8, () => { RightSounds.engineOff(0.8); this.cameras.main.fadeOut(700, 0, 0, 0); });
      this.at(TIMES.wash, () => {
        this.cut();
        this.add.image(0, 0, "rt_wash").setOrigin(0);       // just the picture, held
        RightSounds.pastoral(TIMES.scream - TIMES.wash + 1);   // on through the seats
      });
      this.at(TIMES.seats - 0.8, () => this.cameras.main.fadeOut(700, 0, 0, 0));
      this.at(TIMES.seats, () => { this.cut(); this.showSeats(); });
      this.at(TIMES.happy - 0.6, () => this.cameras.main.fadeOut(500, 0, 0, 0));
      this.at(TIMES.happy, () => { this.cut(); this.showRoundabout(); });
      this.at(TIMES.fadeOut, () => {
        RightSounds.pastoralOff(2.5);
        RightSounds.engineOff(2);
        this.cameras.main.fadeOut(2500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => showEnd());  // in index.html / play-all.html
      });
    }

    // A "cut": clear the screen for the next picture
    cut(colour = [0, 0, 0]) {
      this.tweens.killAll();
      this.children.removeAll(true);
      this.loops.forEach((job) => job.remove());     // stop repeating jobs (dust...)
      this.loops = [];
      this.onTick = null;
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(500, ...colour);      // fade in from this colour
    }

    // Phaser calls update() every frame (about 60 times a second). If a
    // picture has set an "onTick" job, we run it, telling it the time now
    // and how long since the last frame (both in seconds).
    update(time, delta) {
      if (this.onTick) this.onTick(time / 1000, delta / 1000);
    }

    // An image at its place from layout.js
    placed(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0);
    }

    // Put a sprite's origin in its middle WITHOUT moving it
    middle(sprite) {
      return sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    }

    // Jogging: bob up and down a few pixels, over and over (like episode 1)
    jog(sprite, size, speed = 110) {
      this.tweens.add({ targets: sprite, y: sprite.y - size, duration: speed, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
    }

    // =====================================================================
    //  PANEL 1 - ONE HOUR LATER, and the van across the bottom
    // =====================================================================
    showLater() {
      this.cameras.main.fadeIn(800);
      this.placed("rt_later");
      RightSounds.valkyries(TIMES.clear + 1);

      this.at(TIMES.busGo, () => {
        // the van from episode 1, small, starting off the left edge,
        // its wheels on a line near the bottom of the screen
        const bus = this.add.image(-200, H - 20, "rt_bus").setOrigin(0.5, 1).setScale(0.45);
        this.jog(bus, 5);
        // little dust puffs behind it
        this.loops.push(this.time.addEvent({ delay: 120, loop: true, callback: () => {
          const puff = this.add.circle(bus.x - 130, bus.y - 10, 8 + Math.random() * 10, 0xd8cfa0).setAlpha(0.8);
          this.children.moveBelow(puff, bus);
          this.tweens.add({ targets: puff, x: puff.x - 50, y: puff.y - 25, scale: 2, alpha: 0, duration: 650,
                            onComplete: () => puff.destroy() });
        } }));
        // across, LEFT to RIGHT
        this.tweens.add({ targets: bus, x: W + 220, duration: (TIMES.busGone - TIMES.busGo) * 1000,
                          ease: "Linear" });
      });
    }

    // =====================================================================
    //  INTERLUDE - "Interesting Observation" and the pop-up
    // =====================================================================
    showInterlude() {
      const title = this.add.text(W / 2, 60, "Interlude: Interesting Observation",
        { fontFamily: SYSTEM_FONT, fontSize: "46px", color: "#1c1a18" }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: title, alpha: 1, y: 70, duration: 600, ease: "Sine.easeOut" });

      // the pop-up "toast": the picture on a white card with a soft shadow
      this.at(TIMES.plates - TIMES.interlude, () => {
        const pic = this.placed("rt_plates");
        const cx = pic.x + pic.width / 2, cy = pic.y + pic.height / 2 + 30;
        const shadow = this.add.rectangle(cx + 10, cy + 12, pic.width + 30, pic.height + 30, 0x000000, 0.25);
        const card = this.add.rectangle(cx, cy, pic.width + 30, pic.height + 30, 0xffffff).setStrokeStyle(4, 0x1c1a18);
        this.children.bringToTop(pic);
        pic.setOrigin(0.5).setPosition(cx, cy);
        const toast = [shadow, card, pic];
        // FAST: from nothing to a bit too big, then settle back (that's "Back.easeOut")
        toast.forEach((t) => t.setScale(0));
        this.tweens.add({ targets: toast, scale: 1, duration: 380, ease: "Back.easeOut" });
        RightSounds.pop();
        this.time.delayedCall(120, () => RightSounds.tada());
      });
    }

    // =====================================================================
    //  PANEL 2 - THE RANDOM TYRE
    // =====================================================================
    showTyre() {
      const t0 = TIMES.tyrePanel;                         // this picture's start
      const panel = this.placed("rt_blank");

      // The van, jogging along on the spot
      const van = this.middle(this.placed("rt_van"));
      this.jog(van, 4, 100);
      RightSounds.engine(TIMES.fadeOut - t0 + 2);
      // the scuff mark goes ON the van (moves with it), hidden for now
      const scuff = this.middle(this.placed("rt_scuff")).setAlpha(0);
      const scuffOffset = [scuff.x - van.x, scuff.y - van.y];
      this.events.on("update", () => { scuff.x = van.x + scuffOffset[0]; scuff.y = van.y + scuffOffset[1]; });

      // Only show the tyre INSIDE the picture's frame
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(panel.x, panel.y, L.rt_blank.w, L.rt_blank.h);
      const frame = shape.createGeometryMask();

      // The tyre (with speed lines) starts off the top right, and flies
      // in along its speed lines to the van's front corner
      const tyre = this.middle(this.placed("rt_tyre")).setMask(frame);
      const hitX = tyre.x, hitY = tyre.y;
      tyre.setPosition(hitX + 330, hitY - 230).setVisible(false);
      this.at(TIMES.tyreIn - t0, () => {
        tyre.setVisible(true);
        RightSounds.whoosh();
        this.tweens.add({ targets: tyre, x: hitX, y: hitY, duration: (TIMES.hit - TIMES.tyreIn) * 1000,
                          ease: "Quad.easeIn" });
      });

      // BOOP! it bounces off: swap to just the lump (no speed lines),
      // which spins away up and over to the left, off the screen
      this.at(TIMES.hit - t0, () => {
        RightSounds.boop();
        this.time.delayedCall(150, () => RightSounds.boing());
        tyre.setVisible(false);
        const lump = this.middle(this.placed("rt_lump"));
        lump.setPosition(hitX - 8, hitY + 6);
        this.tweens.add({ targets: lump, x: -120, duration: 1300, ease: "Linear" });
        this.tweens.add({ targets: lump, y: hitY - 260, duration: 500, ease: "Quad.easeOut",
                          yoyo: false, onComplete: () =>
                            this.tweens.add({ targets: lump, y: H + 100, duration: 800, ease: "Quad.easeIn" }) });
        this.tweens.add({ targets: lump, angle: -720, duration: 1300 });
        // the van rocks back from the hit, and the scuff appears
        this.tweens.add({ targets: van, angle: -5, duration: 90, yoyo: true, repeat: 1, ease: "Sine.easeOut" });
        this.cameras.main.shake(250, 0.006);
        scuff.setAlpha(1);
      });

      // The words underneath, with their arrow
      this.at(TIMES.words - t0, () => {
        const words = this.middle(this.placed("rt_words"));
        words.setScale(0);
        this.tweens.add({ targets: words, scale: 1, duration: 400, ease: "Back.easeOut" });
        RightSounds.pop();
      });
    }

    // =====================================================================
    //  PANEL 4 - DRIVE ON THE RIGHT
    // =====================================================================
    showSeats() {
      const t0 = TIMES.seats;                             // this picture's start
      this.add.image(0, 0, "ds_blank").setOrigin(0);

      // Enda's steering wheel: a circle with an X in it (like the book's),
      // drawn at the bottom of his seat, turning left and right. Only the
      // part above the floor line shows (a "mask").
      const [wx, wy, wr] = L.ds_wheel;
      const wheel = this.add.graphics({ x: wx, y: wy });
      wheel.lineStyle(7, 0x1c1a18).strokeCircle(0, 0, wr);
      wheel.lineStyle(5, 0x1c1a18).lineBetween(-wr * 0.7, -wr * 0.7, wr * 0.7, wr * 0.7)
                                  .lineBetween(wr * 0.7, -wr * 0.7, -wr * 0.7, wr * 0.7);
      wheel.fillStyle(0x1c1a18).fillCircle(0, 0, 7);
      const above = this.make.graphics({ add: false });
      above.fillStyle(0xffffff).fillRect(0, 0, W, L.ds_floor);

      // The three seats (with their potatoes), all bopping along to the
      // music - each at a slightly different speed, so they don't match
      const seat = (key, speed, lean) => {
        const s = this.placed(key);
        s.setOrigin(0.5, 1).setPosition(s.x + s.width / 2, s.y + s.height);   // pivot at the bottom
        this.tweens.add({ targets: s, y: s.y - 12, duration: speed, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
        this.tweens.add({ targets: s, angle: { from: -lean, to: lean }, duration: speed * 2,
                          ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
        return s;
      };
      seat("ds_left", 380, 3);
      const mid = seat("ds_mid", 420, 2.5);
      const right = seat("ds_right", 400, 2);
      // the wheel goes in front of Enda, and turns
      this.children.bringToTop(wheel);
      wheel.setMask(above.createGeometryMask());
      wheel.angle = -25;
      this.tweens.add({ targets: wheel, angle: 25, duration: 1000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

      // 1) Smiling: "Drive on the RIGHT, Enda"
      let words = null;
      this.at(TIMES.say1 - t0, () => {
        words = this.placed("ds_say1").setAlpha(0);
        this.tweens.add({ targets: words, alpha: 1, duration: 400 });
        RightSounds.ahem();
      });

      // 2) Quick swap: worried now, and louder: "DRIVE on the RIGHT"
      this.at(TIMES.say2 - t0, () => {
        mid.setTexture("ds_mid2");
        words.destroy();
        words = this.middle(this.placed("ds_say2"));
        words.x -= 90;                                      // (room to grow without leaving the screen)
        this.tweens.add({ targets: words, scale: { from: 0.6, to: 1.15 }, duration: 250, ease: "Back.easeOut" });
        this.tweens.add({ targets: words, angle: { from: -3, to: 3 }, duration: 70, yoyo: true, repeat: -1 });
        RightSounds.sting();
        this.cameras.main.shake(300, 0.005);
      });

      // 3) Zoom in on her face...
      this.at(TIMES.zoom - t0, () => {
        const [fx, fy] = L.ds_face;
        this.cameras.main.pan(fx, fy, 1400, "Cubic.easeIn");
        this.cameras.main.zoomTo(3, 1400, "Cubic.easeIn");
      });

      // ...and SWAP to the screaming picture. The music stops dead.
      this.at(TIMES.scream - t0, () => {
        RightSounds.pastoralOff(0.05);
        this.cameras.main.setZoom(1).centerOn(W / 2, H / 2);
        this.tweens.killAll();
        this.children.removeAll(true);
        const big = this.add.image(W / 2, H / 2, "ds_scream").setScale(1.6);
        this.tweens.add({ targets: big, scale: 1, duration: 350, ease: "Back.easeOut" });
        this.cameras.main.flash(250, 255, 255, 255);
        this.cameras.main.shake(900, 0.012);
        RightSounds.scream();
      });
    }

    // =====================================================================
    //  PANEL 5 - THE ROUNDABOUT
    // =====================================================================
    showRoundabout() {
      const t0 = TIMES.happy;                             // this part's start
      RightSounds.pastoral(TIMES.fadeOut - t0 + 3);         // the happy tune again

      // ---- 1. Calm, happy Enda, big, in the middle, bopping along ----
      const happy = this.add.container(W / 2, H / 2 + 40);
      const seat = this.add.image(0, 0, "ds_right");
      // his steering wheel (as before): a circle with an X, turning
      const r = 70;
      const wheel = this.add.graphics({ x: 0, y: seat.height / 2 - 10 });
      wheel.lineStyle(9, 0x1c1a18).strokeCircle(0, 0, r);
      wheel.lineStyle(6, 0x1c1a18).lineBetween(-r * 0.7, -r * 0.7, r * 0.7, r * 0.7)
                                  .lineBetween(r * 0.7, -r * 0.7, -r * 0.7, r * 0.7);
      happy.add([seat, wheel]).setScale(1.7);
      // (only show the top half of the wheel: a mask along his seat's bottom)
      const cover = this.add.rectangle(W / 2, H / 2 + 40 + seat.height * 0.85 + 70, W, 140, PAPER);
      this.tweens.add({ targets: wheel, angle: { from: -25, to: 25 }, duration: 1000, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
      this.tweens.add({ targets: happy, y: happy.y - 14, duration: 400, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

      // ---- 2. SPLIT SCREEN ----
      this.at(TIMES.split - t0, () => {
        // Enda shrinks over to the right-hand side...
        const right = L.we_enda;
        cover.destroy();
        this.tweens.add({ targets: happy, x: right.x + right.w / 2, y: right.y + right.h / 2 + 30, scale: 1.2,
                          duration: 1200, ease: "Cubic.easeInOut" });
        // ...and MORPHS into worried Enda (one fades out as the other fades in)
        const worried = this.add.container(0, 0).setAlpha(0);
        this.time.delayedCall(1000, () => {
          this.tweens.add({ targets: happy, alpha: 0, duration: 900 });
          this.tweens.add({ targets: worried, alpha: 1, duration: 900 });
          RightSounds.worry();
        });
        this.showWorried(worried);
        // the words at the top, sliding down into place
        const words = this.placed("rb_stalled");
        const wy = words.y;
        words.y = -words.height;
        this.tweens.add({ targets: words, y: wy, duration: 800, delay: 1500, ease: "Back.easeOut" });
        // the roundabout fades in on the left
        this.showCars();
      });
    }

    // Worried Enda (right-hand side): sweat dripping, worry lines and
    // eyebrows wobbling, still turning the wheel
    showWorried(group) {
      const enda = this.placed("we_enda");
      const box = L.we_enda;
      const wheel = this.middle(this.placed("we_wheel"));
      // (the wheel is only seen inside his picture)
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      wheel.setMask(shape.createGeometryMask());
      this.tweens.add({ targets: wheel, angle: { from: -14, to: 14 }, duration: 900, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
      const lines = this.middle(this.placed("we_lines"));
      this.tweens.add({ targets: lines, scaleX: 1.12, y: lines.y - 3, duration: 260, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
      const browL = this.middle(this.placed("we_brow_l")), browR = this.middle(this.placed("we_brow_r"));
      this.tweens.add({ targets: browL, angle: { from: -10, to: 10 }, duration: 300, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: browR, angle: { from: 10, to: -10 }, duration: 330, yoyo: true, repeat: -1 });
      group.add([enda, wheel, lines, browL, browR]);
      // sweat: the drops run down, fade, and come again
      for (const [key, speed] of [["we_sweat_l", 1300], ["we_sweat_r", 1500]]) {
        const drop = this.placed(key);
        const y0 = drop.y;
        group.add(drop);
        this.tweens.add({ targets: drop, y: y0 + 60, alpha: { from: 1, to: 0 }, duration: speed, ease: "Quad.easeIn",
                          repeat: -1 });
      }
    }

    // The roundabout (left-hand side): the cars go round and round
    showCars() {
      const every = (ms, fn) => this.loops.push(this.time.addEvent({ delay: ms, loop: true, callback: fn }));
      const road = this.placed("rb_blank").setAlpha(0);
      this.tweens.add({ targets: road, alpha: 1, duration: 800 });
      const [cx, cy] = L.rb_centre;

      // Each car remembers: its picture, how far it is from the middle
      // (its lane), its angle round the circle, the angle it was DRAWN at
      // (so we can turn it as it goes), and how fast it goes (degrees a
      // second; minus = anticlockwise, the proper French way).
      const car = (key, speed) => {
        const img = this.middle(this.placed(key)).setAlpha(0);
        this.tweens.add({ targets: img, alpha: 1, duration: 800 });
        const dx = img.x - cx, dy = img.y - cy;
        const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
        return { img, lane: Math.hypot(dx, dy), angle, drawnAt: angle, speed, moving: speed, blocked: false };
      };
      // the inner lane: the pink minivan in FRONT, the others queued behind
      const pink = car("rb_pink", -30);
      const inner = [pink, car("rb_blue2", -30), car("rb_red2", -30), car("rb_blue3", -30)];
      // the outer lane: two cars going round the OTHER way (oops!)
      const outer = [car("rb_blue1", 34), car("rb_red1", 34)];
      const GAP = 48;                                     // degrees: how close a car will get to the one in front

      // The pink minivan's stop-start routine, over and over:
      // go a little... STALL (shudder)... REV (shake)... lurch off again
      const routine = () => {
        pink.moving = -28;
        this.time.delayedCall(1300, () => {
          pink.moving = 0;
          RightSounds.stall();
          this.tweens.add({ targets: pink.img, scale: 0.94, duration: 80, yoyo: true, repeat: 3 });
          this.time.delayedCall(1700, () => {
            RightSounds.rev();
            this.tweens.add({ targets: pink.img, x: pink.img.x + 4, duration: 50, yoyo: true, repeat: 6 });
          });
        });
      };
      routine();
      every(3800, routine);

      // Every frame: move each car round its lane
      this.onTick = (now, dt) => {
        for (const c of [...inner, ...outer]) {
          let step = c.moving * dt;
          if (inner.includes(c) && c !== pink) {
            // don't drive into the car in front (the next one anticlockwise)
            const i = inner.indexOf(c);
            const ahead = inner[i - 1] || inner[inner.length - 1];
            const space = ((c.angle - ahead.angle) % 360 + 360) % 360;   // degrees to the car in front
            const wanted = Math.min(Math.abs(c.speed * dt), Math.max(space - GAP, 0));
            c.blocked = wanted < Math.abs(c.speed * dt) * 0.5;
            step = -wanted;
          }
          c.angle += step;
          const a = Phaser.Math.DegToRad(c.angle);
          c.img.x = cx + Math.cos(a) * c.lane;
          c.img.y = cy + Math.sin(a) * c.lane;
          c.img.angle = c.angle - c.drawnAt;             // turn the car as it goes round
        }
      };

      // HONK! Every so often, a car that's stuck behind the minivan honks
      const honks = ["rb_honk1", "rb_honk2", "rb_honk3"];
      every(650, () => {
        const stuck = inner.filter((c) => c.blocked);
        if (!stuck.length || Math.random() < 0.3) return;
        const c = Phaser.Utils.Array.GetRandom(stuck);
        RightSounds.honk(0.85 + Math.random() * 0.4);
        // the word HONK pops out beside the car (further from the middle)
        const a = Phaser.Math.DegToRad(c.angle);
        const h = this.add.image(cx + Math.cos(a) * (c.lane + 70), cy + Math.sin(a) * (c.lane + 70),
                                 Phaser.Utils.Array.GetRandom(honks)).setScale(0.3);
        this.tweens.add({ targets: h, scale: 0.85, duration: 200, ease: "Back.easeOut" });
        this.tweens.add({ targets: h, alpha: 0, delay: 700, duration: 400, onComplete: () => h.destroy() });
      });

      // "Oops, that silly first gear..." pops up by the minivan now and then
      every(6000, () => {
        const a = Phaser.Math.DegToRad(pink.angle);
        const o = this.add.image(cx + Math.cos(a) * (pink.lane + 40), cy + Math.sin(a) * (pink.lane + 40) - 60,
                                 "rb_oops").setScale(0);
        this.tweens.add({ targets: o, scale: 0.9, duration: 300, ease: "Back.easeOut" });
        this.tweens.add({ targets: o, alpha: 0, delay: 2600, duration: 500, onComplete: () => o.destroy() });
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(OtherRight);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: OtherRight,
  });

}

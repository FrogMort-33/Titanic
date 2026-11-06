// =====================================================================
//  main.js  -  EPISODE 11 "Fiery Finale ?"
//              (uses IMG-063 and IMG-065)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//    0    "FIVE MINUTES LATER" (from episode 10), and we zoom in on it...
//    4    ...fade to the mountains. The fires on the mountain flicker and
//         roar. No van yet. Hold for 5...
//    9    ...our van comes in on the left and heads right (the Ride of the
//         Valkyries!) - and behind it, flames spring up all over the
//         green hills, big ones and small ones.
//   16.5  The van is gone, safe. The flames keep spreading until the whole
//         picture glows RED...
//   23.5  ...fade to LE SATNAV (full screen). Its warning light flashes.
//   26    The words appear, line by line: "Satnav: Hey, you want a more
//         adventurous route? Recalculating journey..."
//   31.5  PIN-PON! A siren, and in the middle of the screen, flashing:
//         "RECALCULATING JOURNEY" - yellow...
//   34    ...then RED. Hold for 5...
//   39    ...switch to the next satnav picture: the wiggly "adventurous"
//         road. The siren stops; the spooky horror tune (from episode 7)...
//   40.5  ...and the satnav smiles:  ":)"   Hold...
//   46    New screen: Tasha at her side window again (from episode 9), big.
//         Flames lick up the sides of the van all around her...
//   48    ...her eyes follow something from left to right... she turns
//         to look right, and shakes her head.
//   56    Fade out.
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    zoomFor: 3.2,         // zoom in on "FIVE MINUTES LATER"
    hills: 4,             // the mountains on fire
    vanIn: 9,             // our van comes in on the left...
    vanGone: 16.5,        // ...and is off the right-hand side by now
    red: 16.5,            // the whole picture slowly goes red...
    redFor: 6,            // ...taking this long
    satnav: 23.5,         // LE SATNAV
    words: 26,            // its words appear...
    wordsFor: 4.5,        // ...line by line, over this long
    recalc: 31.5,         // PIN-PON! "RECALCULATING JOURNEY" (yellow)
    recalcRed: 34,        // ...now red
    satnav2: 39,          // the next satnav picture, with the horror tune
    smile: 40.5,          // ":)"
    tasha: 46,            // Tasha at her window, flames all around
    look: 48,             // she looks from left to right
    fadeOut: 56,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT11;        // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page

  // ---- THE ROAD: the van's wheels follow this line (from layout.js).
  //      roadY(x) gives the road's height at any x across the screen. ----
  function roadY(x) {
    const R = L.ff_road;
    let i = 1;
    while (i < R.length - 1 && x > R[i][0]) i++;
    const [ax, ay] = R[i - 1], [bx, by] = R[i];
    return ay + (by - ay) * (x - ax) / (bx - ax);
  }

  class FieryFinale extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("fiery"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      for (const key of ["ff_later", "ff_hills", "ff_satnav", "ff_satnav2", "tw_window"]) pic(key, key + ".jpg");
      for (const key of ["tw_tasha1", "tw_tasha2"]) pic(key, key + ".png");
      for (const key of ["ff_flame1", "ff_flame2", "ff_flame3", "ff_flame", "ff_bus", "ff_satnav_words", "ff_smile"])
        pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      // "Play all": we arrive straight from episode 10, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    // Phaser calls update() every frame. If there's an "onTick" job, we run
    // it with the time now and the time since the last frame (in seconds).
    update(time, delta) {
      if (this.onTick) this.onTick(time / 1000, delta / 1000);
    }

    // An image at its place from layout.js
    placed(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0);
    }

    // A "cut": clear the screen for the next picture
    cut() {
      this.tweens.killAll();
      this.children.removeAll(true);
      (this.loops || []).forEach((job) => job.remove());   // stop repeating jobs
      this.loops = [];
      this.onTick = null;
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(500);
    }

    start() {
      const cam = this.cameras.main;
      this.loops = [];

      // ---- 1. "FIVE MINUTES LATER" (the same card as episode 10), zooming in ----
      const card = this.add.image(W / 2, H / 2, "ff_later");
      cam.fadeIn(600);
      this.tweens.add({ targets: card, scale: { from: 1, to: 1.6 }, duration: TIMES.zoomFor * 1000,
                        ease: "Sine.easeIn" });
      FierySounds.whoosh();

      // ---- 2. the mountains on fire ----
      this.at(TIMES.hills - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.hills, () => { this.cut(); this.showHills(); });

      // ---- 3. LE SATNAV ----
      this.at(TIMES.satnav - 0.6, () => {
        FierySounds.valkyriesOff(0.6);
        cam.fadeOut(500, 0, 0, 0);
      });
      this.at(TIMES.satnav, () => { this.cut(); this.showSatnav(); });
      this.at(TIMES.satnav2, () => { this.cut(); this.showSatnav2(); });
      this.at(TIMES.tasha - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.tasha, () => { this.cut(); this.showTasha(); });

      // ---- the end ----
      this.at(TIMES.fadeOut, () => {
        FierySounds.horrorOff(2.5);
        cam.fadeOut(2500, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => showEnd());   // in index.html / play-all.html
      });
    }

    // =====================================================================
    //  THE MOUNTAINS ON FIRE
    // =====================================================================
    showHills() {
      const t0 = TIMES.hills;                             // this part's start
      const box = L.ff_hills;
      this.placed("ff_hills");
      // a "mask", so the van and the new flames are only seen inside the picture
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();
      FierySounds.fire(TIMES.satnav - t0 + 0.5, 0.1);

      // ---- the three drawn flames flicker: each stretches taller from its
      //      bottom and back, at its own speed (never smaller than drawn,
      //      so the drawing underneath stays covered) ----
      for (const [key, speed] of [["ff_flame1", 230], ["ff_flame2", 290], ["ff_flame3", 260]]) {
        const f = this.placed(key);
        f.setOrigin(0.5, 1).setPosition(f.x + f.width / 2, f.y + f.height);
        this.tweens.add({ targets: f, scaleY: 1.1, scaleX: 1.03, duration: speed, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });
      }

      // ---- a new flame springs up at (x, y): it grows from nothing to its
      //      size, then flickers ----
      const flames = [];
      const light = (x, y, size) => {
        const f = this.add.image(x, y, "ff_flame").setOrigin(0.5, 1).setScale(0).setMask(inside);
        flames.push(f);
        this.tweens.add({ targets: f, scale: size, duration: 500, ease: "Back.easeOut",
          onComplete: () => this.tweens.add({ targets: f, scaleY: size * 1.18, duration: 180 + Math.random() * 200,
                                              ease: "Sine.easeInOut", yoyo: true, repeat: -1 }) });
      };

      // ---- our van: in from the left, heroically across to the right ----
      this.at(TIMES.vanIn - t0, () => {
        FierySounds.valkyries(TIMES.satnav - TIMES.vanIn + 1);
        FierySounds.rev();
        const bus = this.add.image(box.x - 200, 0, "ff_bus").setOrigin(0.5, 1).setScale(0.38).setMask(inside);
        this.tweens.add({ targets: bus, x: box.x + box.w + 200, duration: (TIMES.vanGone - TIMES.vanIn) * 1000 });
        // spots on the green hills where flames will spring up (from
        // layout.js, in order from left to right)
        const spots = L.ff_spots.slice();
        this.onTick = (now) => {
          bus.y = roadY(bus.x) + 6 + Math.sin(now * 14) * 3;   // follow the road, with a little bop
          // light (up to 3 a frame) the spots the van has just passed
          for (let n = 0; n < 3 && spots.length && spots[0][0] < bus.x - 90; n++) {
            const [x, y] = spots.shift();
            light(x, y, 0.08 + Math.random() * 0.32);           // big ones and small ones
          }
        };
      });

      // ---- the van is safe... and the fire spreads over EVERYTHING ----
      this.at(TIMES.red - t0, () => {
        this.onTick = null;
        // a red glow over the whole picture, getting stronger
        const glow = this.add.rectangle(box.x, box.y, box.w, box.h, 0xd8261c).setOrigin(0).setAlpha(0);
        glow.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.tweens.add({ targets: glow, alpha: 0.75, duration: TIMES.redFor * 1000 });
        // the flames that are already burning grow bigger
        flames.forEach((f) => this.tweens.add({ targets: f, scaleX: f.scaleX * 1.8, duration: TIMES.redFor * 1000 }));
        // and more and more flames spring up, all over the picture
        let n = 0;
        this.loops.push(this.time.addEvent({ delay: 60, repeat: 90, callback: () => {
          n++;
          light(box.x + Math.random() * box.w, box.y + 60 + Math.random() * (box.h - 40), 0.2 + n / 90 * 0.7);
        } }));
      });
    }

    // =====================================================================
    //  LE SATNAV: "Hey, you want a more adventurous route?"
    // =====================================================================
    showSatnav() {
      const t0 = TIMES.satnav;                            // this part's start
      this.placed("ff_satnav");

      // its warning light flashes (a yellow glow, on and off)
      const [bx, by, br] = L.ff_beacon;
      const glow = this.add.circle(bx, by, br, 0xffe81f).setAlpha(0);
      this.tweens.add({ targets: glow, alpha: 0.6, duration: 250, yoyo: true, repeat: -1, repeatDelay: 250 });

      // the words, one line at a time (setCrop shows just the top part)
      this.at(TIMES.words - t0, () => {
        const words = this.placed("ff_satnav_words");
        words.setCrop(0, 0, words.width, 0);
        L.ff_satnav_lines.forEach((bottom, i) => {
          this.time.delayedCall(i * TIMES.wordsFor * 1000 / 3, () => {
            words.setCrop(0, 0, words.width, bottom);
            FierySounds.boop();
          });
        });
      });

      // PIN-PON! "RECALCULATING JOURNEY", flashing in the middle of the screen
      this.at(TIMES.recalc - t0, () => {
        FierySounds.siren(TIMES.satnav2 - TIMES.recalc);
        const big = this.add.text(W / 2, H / 2, "RECALCULATING\nJOURNEY", {
          fontFamily: "Arial Black, Arial, sans-serif", fontSize: "96px", color: "#ffe81f", align: "center",
          stroke: "#1c1a18", strokeThickness: 14 }).setOrigin(0.5);
        this.tweens.add({ targets: big, scale: { from: 0.3, to: 1 }, duration: 400, ease: "Back.easeOut" });
        // flash: on and off, again and again
        this.loops.push(this.time.addEvent({ delay: 280, loop: true, callback: () => big.setVisible(!big.visible) }));
        // ...yellow, then RED
        this.at(TIMES.recalcRed - TIMES.recalc, () => {
          big.setColor("#ff2a1a");
          this.cameras.main.flash(200, 255, 40, 20);
        });
      });
    }

    // The next satnav picture: the wiggly road... and a smile. Spooky.
    showSatnav2() {
      const t0 = TIMES.satnav2;                           // this part's start
      this.cameras.main.resetFX();
      this.cameras.main.flash(250, 0, 0, 0);
      FierySounds.horror(TIMES.fadeOut - t0 + 3);
      this.placed("ff_satnav2");
      // its warning light flashes, slower now
      const [bx, by, br] = L.ff_beacon2;
      const glow = this.add.circle(bx, by, br, 0xffe81f).setAlpha(0);
      this.tweens.add({ targets: glow, alpha: 0.6, duration: 450, yoyo: true, repeat: -1, repeatDelay: 300 });
      // ":)" - it slowly appears
      this.at(TIMES.smile - t0, () => {
        const smile = this.placed("ff_smile").setAlpha(0);
        this.tweens.add({ targets: smile, alpha: 1, duration: 1500 });
      });
    }

    // =====================================================================
    //  TASHA AT HER WINDOW, with the flames licking the sides of the van
    // =====================================================================
    showTasha() {
      const t0 = TIMES.tasha;                             // this part's start
      const win = L.tw_window;
      const [gx1, gy1, gx2, gy2] = L.tw_glass;            // the window glass (no flames there)
      this.placed("tw_window");
      const head = this.placed("tw_tasha1");
      FierySounds.fire(TIMES.fadeOut - t0 + 1, 0.12);
      // a "mask": the flames are only seen on the van, not the page around it
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(win.x, win.y, win.w, win.h);
      const onVan = shape.createGeometryMask();

      // ---- flames along the bottom and up both sides of the van. Each one
      //      grows, flickers, and sometimes dies down and springs up again ----
      const spots = [];
      for (let x = win.x + 20; x < win.x + win.w; x += 75) spots.push([x + Math.random() * 30, win.y + win.h + 10]);   // along the bottom
      for (let y = win.y + win.h - 60; y > gy1 + 120; y -= 120) {                                   // up the sides
        spots.push([win.x + (gx1 - win.x) * Math.random(), y]);
        spots.push([gx2 + (win.x + win.w - gx2) * Math.random(), y]);
      }
      spots.forEach(([x, y]) => {
        // bigger at the bottom, smaller higher up
        const size = 0.12 + 0.3 * (y - gy1) / (win.y + win.h - gy1) * (0.5 + Math.random() * 0.5);
        const f = this.add.image(x, y, "ff_flame").setOrigin(0.5, 1).setScale(0).setMask(onVan);
        this.tweens.add({ targets: f, scale: size, duration: 400 + Math.random() * 900, delay: Math.random() * 1500,
                          ease: "Back.easeOut",
          onComplete: () => this.tweens.add({ targets: f, scaleY: size * (1.15 + Math.random() * 0.4),
                                              angle: { from: -4, to: 4 }, duration: 150 + Math.random() * 250,
                                              ease: "Sine.easeInOut", yoyo: true, repeat: -1 }) });
      });

      // ---- flame tongues streaming past (the van is driving to the right,
      //      so they blow back to the LEFT), over the lower part of the van ----
      this.loops.push(this.time.addEvent({ delay: 650, loop: true, callback: () => {
        const y = gy2 + 120 + Math.random() * (win.y + win.h - gy2 - 100);
        const f = this.add.image(win.x + win.w + 40, y, "ff_flame").setOrigin(0.5, 1)
          .setScale(0.12 + Math.random() * 0.15).setAngle(-25).setMask(onVan);
        this.tweens.add({ targets: f, x: win.x - 80, duration: 1400 + Math.random() * 600,
                          onComplete: () => f.destroy() });
      } }));

      // ---- the fire's orange light flickering over everything ----
      const light = this.add.rectangle(0, 0, W, H, 0xff7a1a).setOrigin(0).setAlpha(0.08)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: light, alpha: 0.22, duration: 140, yoyo: true, repeat: -1, repeatDelay: 90 });

      // ---- Tasha looks out: from the left... to the right ----
      const h0 = head.x;
      head.x -= 50;                                     // looking back to the LEFT first
      this.at(TIMES.look - t0, () => {
        this.tweens.add({ targets: head, x: h0 + 20, duration: 1800, ease: "Sine.easeInOut" });
        this.time.delayedCall(1300, () => {
          // she turns to look RIGHT (the second drawing), still moving
          const head2 = this.placed("tw_tasha2").setAlpha(0);
          this.children.moveBelow(head2, light);
          const x2 = head2.x;
          head2.x = x2 - 20;
          this.tweens.add({ targets: head2, alpha: 1, x: x2 + 20, duration: 700, ease: "Sine.easeOut" });
          this.tweens.add({ targets: head, alpha: 0, duration: 500 });
          FierySounds.worry();
          // disbelief: a little shake of the head
          this.time.delayedCall(1200, () =>
            this.tweens.add({ targets: head2, angle: { from: -3, to: 3 }, duration: 160, yoyo: true, repeat: 7 }));
        });
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(FieryFinale);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: FieryFinale,
  });

}

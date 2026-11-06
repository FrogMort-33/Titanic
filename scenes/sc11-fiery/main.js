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
//   56    New screen: UP THE BURNING MOUNTAIN (IMG-067), with Enda in the
//         corner (IMG-068): bopping, steering, sweating, eyes spinning,
//         screaming. The fires flicker and spread across the mountain...
//   57.5  ...the pink van comes in at the bottom and follows the road up,
//         screaming all the way - a trail of HHHHH behind it, getting
//         longer - and disappears over the first hill.
//   62    "Meanwhile, Enda was totally fine."   Hold...
//
//   "IS THAT LE MAZEL?"  (IMG-069)
//   69.5  New screen: the ruined house on the hill. The van (drawn facing
//         left) comes in from the right and stops on the hill...
//   74    "Is that Le Mazel?"
//   76.5  "It's been 50 years, the forest fire got to it before we did"
//   83    ...after a pause the van rolls on, BEHIND the house, off the left.
//
//   THE RANDOM EXCLAMATION SIGN  (IMG-070)
//   90    The whole picture, just as it is. A heavy heart beats fast;
//         Enda (right) bops, steers, sweats, eyes spinning. Hold 5...
//
//   THE FOREST ROAD FROM ABOVE  (IMG-071)
//   96.5  Right: the road through the forest, from above. The pink van
//         drives up it, in at the bottom and off the top - twice -
//         screaming "AAAAAAAAH!" as it goes. Left: Tasha at her window
//         again, looking from left to right.
//  114    Fade out.
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
    mountain: 56,         // up the burning mountain
    vanUp: 57.5,          // the van comes in at the bottom...
    vanUpFor: 10,         // ...and takes this long to get over the first hill
    meanwhile: 62,        // "Meanwhile, Enda was totally fine."
    mazel: 69.5,          // the ruined house
    mazelIn: 70,          // the van comes in from the right...
    mazelStop: 73,        // ...and stops here
    say1: 74,             // "Is that Le Mazel?"
    say2: 76.5,           // "It's been 50 years..."
    rollOn: 83,           // the van rolls on, behind the house...
    rollGone: 89,         // ...and is off the left by now
    sign: 90,             // the random exclamation sign
    forest: 96.5,         // the forest road from above, and Tasha
    passes: [98, 106],    // when the van starts each trip up the road
    passFor: 5.5,         // how long each trip takes
    tashaLook: 99,        // Tasha looks from left to right
    layby: 114,           // "ANY LAY-BYS?": the mountain road, horror music
    carIn: 115.5,         // the blue car drives up the road...
    carBend: 120.5,       // ...reaches the bend, and goes over the edge
    carLand: 122,         // CRASH (upside down)
    potsOut: 122.6,       // two dead potatoes fall out
    vanIn2: 128,          // (hold 5) Valkyries! our van comes up the road
    ask: 128.5,           // "Do we have any lay-bys?"
    reply: 131,           // "No, but we have ditches that lead off a cliff."
    teeter: 133,          // the van teeters half over the edge...
    teeterFor: 3,         // ...for this long, then carries on regardless
    vanTop: 139,          // the van is over the hill by now
    made: 140.5,          // "MADE IT TO LE MAZEL!"
    lines: 141.5,         // the words appear, line by line...
    lineEach: 0.8,        // ...one every this many seconds
    glitch: 147.5,        // the slow, glitchy Valkyries
    mzVan: 152.5,         // (wait 5) the burning van splutters in at the bottom...
    mzArrive: 164,        // ...and reaches the pink house
    anniv: 170,           // "Happy Anniversary honey..."
    honey: 171.5,         // Joe says it
    cry: 174.5,           // they both cry with relief
    black: 181,           // fade to black
    fin: 183,             // FIN
    letter: 189.5,        // the letter from Rosie & Joe (+ La Marseillaise)
    quotes: 199.5,        // the P.S. quotes from the trip home
    bonus: 209.5,         // the BONUS quote
    race: 215,            // our burning van races back and forth...
    raceEach: 2.6,        // ...each dash across takes this long...
    raceDashes: 5,        // ...this many dashes (the last one exits right)
    fadeOut: 229,
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
      for (const key of ["um_mountain", "um_enda", "lm_scene", "xs_sign", "xs_enda", "fr_road"]) pic(key, key + ".jpg");
      for (const key of ["fr_van", "fr_aah1", "fr_aah2"]) pic(key, key + ".png");
      for (const key of ["lm_van", "lm_house", "lm_say1", "lm_say2a", "lm_say2b", "xs_mouth", "xs_wheel",
                         "xs_eye_l", "xs_eye_r"]) pic(key, key + ".png");
      for (const key of ["um_flame1", "um_flame2", "um_flame3", "um_van", "um_h", "um_mouth", "um_wheel",
                         "um_eye_l", "um_eye_r", "um_meanwhile"]) pic(key, key + ".png");
      for (const key of ["bl_scene", "mz_scene", "ha_scene", "fin_page", "aw_letter", "aw_quotes", "aw_bonus"])
        pic(key, key + ".jpg");
      for (const key of ["bl_car", "bl_pot1", "bl_pot2", "bl_van", "bl_ask1", "bl_ask2", "bl_say1", "bl_say2",
                         "bl_say3", "mz_van", "mz_pot", "mz_line1", "mz_line2", "mz_line3", "mz_line4", "mz_line5",
                         "mz_line6", "mz_line7", "ha_words", "ha_mouth", "ha_rmouth", "ha_hands"]) pic(key, key + ".png");
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
      this.at(TIMES.mountain - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.mountain, () => { this.cut(); this.showMountain(); });
      this.at(TIMES.mazel - 0.6, () => { FierySounds.horrorOff(0.6); cam.fadeOut(500, 0, 0, 0); });
      this.at(TIMES.mazel, () => { this.cut(); this.showMazel(); });
      this.at(TIMES.sign - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.sign, () => { this.cut(); this.showSign(); });
      this.at(TIMES.forest - 0.5, () => cam.fadeOut(400, 0, 0, 0));
      this.at(TIMES.forest, () => { this.cut(); this.showForest(); });

      // pictures 72 to 79: the end of the journey, and the afterword
      const parts = [["layby", "showLayby"], ["made", "showMade"], ["anniv", "showAnniv"], ["fin", "showFin"],
                     ["letter", "showLetter"], ["quotes", "showQuotes"], ["bonus", "showBonus"], ["race", "showRace"]];
      for (const [time, method] of parts) {
        if (time !== "fin")                   // (FIN comes up out of black already)
          this.at(TIMES[time] - 0.6, () => cam.fadeOut(500, 0, 0, 0));
        this.at(TIMES[time], () => { this.cut(); this[method](); });
      }

      // ---- the end ----
      this.at(TIMES.fadeOut, () => {
        FierySounds.glitchOff(2.5);
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
      FierySounds.horror(TIMES.mazel - t0 + 3);
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
      FierySounds.fire(TIMES.layby - t0 + 0.5, 0.12);
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

    // A picture from layout.js with its middle as its handle (so it can
    // turn or stretch round its middle) - it doesn't move
    middled(key) {
      const img = this.placed(key);
      return img.setOrigin(0.5).setPosition(img.x + img.width / 2, img.y + img.height / 2);
    }

    // =====================================================================
    //  UP THE BURNING MOUNTAIN, and screaming Enda
    // =====================================================================
    showMountain() {
      const t0 = TIMES.mountain;                          // this part's start
      const box = L.um_mountain;
      this.placed("um_mountain");
      const shape = this.make.graphics({ add: false });   // things only seen inside the picture
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();

      // ---- the three drawn flames flicker ----
      for (const [key, speed] of [["um_flame1", 240], ["um_flame2", 300], ["um_flame3", 270]]) {
        const f = this.placed(key);
        f.setOrigin(0.5, 1).setPosition(f.x + f.width / 2, f.y + f.height);
        this.tweens.add({ targets: f, scaleY: 1.1, scaleX: 1.03, duration: speed, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });
      }
      // ---- ...and the fire spreads: new flames spring up on the green,
      //      one after another, bigger as time goes on ----
      const spots = Phaser.Utils.Array.Shuffle(L.um_spots.slice());
      let lit = 0;
      this.loops.push(this.time.addEvent({ delay: 90, repeat: spots.length - 1, callback: () => {
        const [x, y] = spots[lit++];
        const size = 0.08 + Math.random() * 0.12 + lit / spots.length * 0.25;
        const f = this.add.image(x, y, "ff_flame").setOrigin(0.5, 1).setScale(0).setMask(inside);
        this.tweens.add({ targets: f, scale: size, duration: 500, ease: "Back.easeOut",
          onComplete: () => this.tweens.add({ targets: f, scaleY: size * 1.2, duration: 160 + Math.random() * 200,
                                              ease: "Sine.easeInOut", yoyo: true, repeat: -1 }) });
      } }));

      // ---- the pink van: up the road from the bottom, screaming, with a
      //      trail of H's growing behind it ----
      const road = L.um_road;
      const lens = [0];                                   // how far along the road each point is
      for (let i = 1; i < road.length; i++)
        lens.push(lens[i - 1] + Math.hypot(road[i][0] - road[i - 1][0], road[i][1] - road[i - 1][1]));
      const along = (d) => {                              // the point 'd' pixels along the road
        let i = 1;
        while (i < road.length - 1 && d > lens[i]) i++;
        const f = Math.min(1, (d - lens[i - 1]) / (lens[i] - lens[i - 1]));
        return [road[i - 1][0] + (road[i][0] - road[i - 1][0]) * f, road[i - 1][1] + (road[i][1] - road[i - 1][1]) * f];
      };
      this.at(TIMES.vanUp - t0, () => {
        const van = this.add.image(0, 0, "um_van").setOrigin(0.5, 0.8).setMask(inside);
        const trip = { d: 0 };
        let lastH = -999;
        this.tweens.add({ targets: trip, d: lens[lens.length - 1], duration: TIMES.vanUpFor * 1000,
          ease: "Sine.easeIn",
          onUpdate: () => {
            const [x, y] = along(trip.d);
            van.setPosition(x, y + Math.sin(trip.d / 6) * 1.5);      // a little bop
            van.setScale(1.6 - 0.8 * trip.d / lens[lens.length - 1]); // smaller as it gets further away
            // every 22 pixels of road, another "H" pops up behind it (to
            // the right, like in the drawing), so the trail grows
            if (trip.d - lastH > 38) {
              lastH = trip.d;
              const h = this.add.image(x + 45 + Math.random() * 35, y - 20 + Math.random() * 30, "um_h")
                .setScale(0).setAngle(-15 + Math.random() * 30).setMask(inside);
              this.tweens.add({ targets: h, scale: van.scale * 0.6, duration: 300, ease: "Back.easeOut" });
              this.tweens.add({ targets: h, y: h.y - 4, duration: 200, yoyo: true, repeat: -1, delay: 300 });
            }
          },
          // over the first hill... gone
          onComplete: () => this.tweens.add({ targets: van, alpha: 0, scale: 0.3, duration: 400 }) });
        // screaming, all the way
        FierySounds.scream();
        this.loops.push(this.time.addEvent({ delay: 1500, repeat: Math.floor(TIMES.vanUpFor / 1.5) - 1,
                                             callback: () => FierySounds.scream() }));
      });

      // ---- Enda in the corner: bopping, steering, sweating, screaming ----
      const enda = this.add.container(0, 0).setDepth(5);   // (in front of the flames)
      enda.add(this.placed("um_enda"));
      const mouth = this.placed("um_mouth");
      mouth.setOrigin(0.5, 0.3).setPosition(mouth.x + mouth.width / 2, mouth.y + mouth.height * 0.3);
      const wheel = this.middled("um_wheel");
      const eyeL = this.middled("um_eye_l"), eyeR = this.middled("um_eye_r");
      enda.add([mouth, wheel, eyeL, eyeR]);
      this.tweens.add({ targets: enda, y: -8, duration: 230, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      this.tweens.add({ targets: wheel, angle: { from: -40, to: 40 }, duration: 500, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });                         // yanking the wheel
      this.tweens.add({ targets: [eyeL, eyeR], angle: 360, duration: 900, repeat: -1 });   // spinning eyes
      this.tweens.add({ targets: mouth, scaleY: 1.12, scaleX: 1.04, duration: 120, yoyo: true, repeat: -1 });
      // sweat drips off him, over and over
      this.loops.push(this.time.addEvent({ delay: 350, loop: true, callback: () => {
        const [dx, dy] = Phaser.Utils.Array.GetRandom(L.um_drops);
        const drop = this.add.ellipse(dx, dy + enda.y, 10, 15, 0x5fc0dc).setStrokeStyle(1.5, 0x2a6f9a).setDepth(6);
        this.tweens.add({ targets: drop, y: drop.y + 90, alpha: { from: 1, to: 0 }, duration: 1100,
                          ease: "Quad.easeIn", onComplete: () => drop.destroy() });
      } }));

      // ---- "Meanwhile, Enda was totally fine." on a yellow card ----
      this.at(TIMES.meanwhile - t0, () => {
        const [cx, cy, cw, ch] = L.um_card;
        const card = this.add.graphics().fillStyle(PAPER).fillRoundedRect(cx, cy, cw, ch, 14)
          .lineStyle(3, 0x1c1a18).strokeRoundedRect(cx, cy, cw, ch, 14).setDepth(7);   // (in front of everything)
        const words = this.placed("um_meanwhile").setDepth(8);
        card.setAlpha(0); words.setAlpha(0);
        this.tweens.add({ targets: [card, words], alpha: 1, duration: 1200 });
      });
    }

    // =====================================================================
    //  "IS THAT LE MAZEL?" - the ruined house
    // =====================================================================
    showMazel() {
      const t0 = TIMES.mazel;                             // this part's start
      const box = L.lm_scene;
      this.placed("lm_scene");
      const shape = this.make.graphics({ add: false });   // the van is only seen inside the picture
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const van = this.add.image(0, 0, "lm_van").setOrigin(0.5, 1).setMask(shape.createGeometryMask());
      this.placed("lm_house");                            // the house goes on TOP, so the van passes behind it

      // the van's road (from layout.js): roadY(x) gives the road's height
      const road = L.lm_road;                             // (from right to left)
      const roadY = (x) => {
        let i = 1;
        while (i < road.length - 1 && x < road[i][0]) i++;
        const [ax, ay] = road[i - 1], [bx, by] = road[i];
        return ay + (by - ay) * (x - ax) / (bx - ax);
      };
      const place = () => { van.y = roadY(van.x) + Math.sin(van.x / 9) * 2; };   // on the road, bopping
      van.x = box.x + box.w + van.width;                 // off the right-hand side
      place();
      // in from the right... and stop
      this.at(TIMES.mazelIn - t0, () => {
        FierySounds.engine(TIMES.rollGone - TIMES.mazelIn);
        this.tweens.add({ targets: van, x: L.lm_stop, duration: (TIMES.mazelStop - TIMES.mazelIn) * 1000,
                          ease: "Quad.easeOut", onUpdate: place });
      });
      // the words, written in left to right as they're said
      const say = (key, secs, pitch) => {
        const words = this.placed(key);
        const shown = { w: 0 };
        words.setCrop(0, 0, 0, words.height);
        this.tweens.add({ targets: shown, w: words.width, duration: secs * 1000,
                          onUpdate: () => words.setCrop(0, 0, shown.w, words.height) });
        FierySounds.chatter(secs, pitch);
      };
      this.at(TIMES.say1 - t0, () => say("lm_say1", 1.8, 1.2));
      this.at(TIMES.say2 - t0, () => {
        say("lm_say2a", 2.4, 0.9);
        this.time.delayedCall(2500, () => say("lm_say2b", 1.6, 0.9));
      });
      // after a pause, it rolls on - behind the house - and off the left
      this.at(TIMES.rollOn - t0, () => {
        this.tweens.add({ targets: van, x: box.x - van.width, duration: (TIMES.rollGone - TIMES.rollOn) * 1000,
                          ease: "Sine.easeIn", onUpdate: place });
      });
    }

    // =====================================================================
    //  THE RANDOM EXCLAMATION SIGN - just the picture, a racing heart, and
    //  Enda (right) in a state
    // =====================================================================
    showSign() {
      this.placed("xs_sign");
      FierySounds.engineOff(0.5);
      FierySounds.heartbeat(TIMES.forest - TIMES.sign + 2.5, 150);
      // Enda's picture, with his moving parts, all bopping together
      const enda = this.add.container(0, 0);
      enda.add(this.add.image(L.xs_enda_img.x, L.xs_enda_img.y, "xs_enda").setOrigin(0));
      const mouth = this.placed("xs_mouth");
      mouth.setOrigin(0.5, 0.3).setPosition(mouth.x + mouth.width / 2, mouth.y + mouth.height * 0.3);
      const wheel = this.middled("xs_wheel");
      const eyeL = this.middled("xs_eye_l"), eyeR = this.middled("xs_eye_r");
      enda.add([mouth, wheel, eyeL, eyeR]);
      this.tweens.add({ targets: enda, y: -6, duration: 200, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      this.tweens.add({ targets: wheel, angle: { from: -40, to: 40 }, duration: 450, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
      this.tweens.add({ targets: [eyeL, eyeR], angle: 360, duration: 800, repeat: -1 });
      this.tweens.add({ targets: mouth, scaleY: 1.1, scaleX: 1.04, duration: 130, yoyo: true, repeat: -1 });
      // sweat
      this.loops.push(this.time.addEvent({ delay: 300, loop: true, callback: () => {
        const [dx, dy] = Phaser.Utils.Array.GetRandom(L.xs_drops);
        const drop = this.add.ellipse(dx, dy + enda.y, 11, 16, 0x5fc0dc).setStrokeStyle(1.5, 0x2a6f9a);
        this.tweens.add({ targets: drop, y: drop.y + 90, alpha: { from: 1, to: 0 }, duration: 1000,
                          ease: "Quad.easeIn", onComplete: () => drop.destroy() });
      } }));
    }

    // =====================================================================
    //  THE FOREST ROAD FROM ABOVE (right), and Tasha at her window (left)
    // =====================================================================
    showForest() {
      const t0 = TIMES.forest;                            // this part's start
      const box = L.fr_road;
      this.placed("fr_road");
      const shape = this.make.graphics({ add: false });   // the van is only seen inside the picture
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();

      // ---- Tasha's window (the same pictures as before), made smaller and
      //      put on the left: everything goes in a "container" that is
      //      shrunk to 60% ----
      const k = 0.6;
      const tasha = this.add.container(20 - L.tw_window.x * k, (H - L.tw_window.h * k) / 2 - L.tw_window.y * k)
        .setScale(k);
      const head1 = this.placed("tw_tasha1");
      const head2 = this.placed("tw_tasha2").setAlpha(0);
      tasha.add([this.placed("tw_window"), head1, head2]);
      const h0 = head1.x, x2 = head2.x;
      head1.x -= 50;                                      // looking LEFT first...
      this.at(TIMES.tashaLook - t0, () => {
        this.tweens.add({ targets: head1, x: h0 + 20, duration: 1800, ease: "Sine.easeInOut" });   // ...then right
        this.time.delayedCall(1300, () => {
          head2.x = x2 - 20;
          this.tweens.add({ targets: head2, alpha: 1, x: x2 + 20, duration: 700, ease: "Sine.easeOut" });
          this.tweens.add({ targets: head1, alpha: 0, duration: 500 });
          this.time.delayedCall(1200, () =>
            this.tweens.add({ targets: head2, angle: { from: -3, to: 3 }, duration: 160, yoyo: true, repeat: 7 }));
        });
      });

      // ---- the van: in at the bottom, up the road and off the top,
      //      screaming as it goes ----
      const vx = L.fr_van.x + this.textures.get("fr_van").getSourceImage().width / 2;
      const van = this.add.image(vx, box.y + box.h + 200, "fr_van").setMask(inside);
      TIMES.passes.forEach((start) => {
        this.at(start - t0, () => {
          van.y = box.y + box.h + van.height / 2;           // just below the picture
          this.tweens.add({ targets: van, y: box.y - van.height / 2, duration: TIMES.passFor * 1000 });
          this.tweens.add({ targets: van, x: vx + 4, duration: 120, yoyo: true, repeat: TIMES.passFor * 4 });  // a judder
          FierySounds.engine(TIMES.passFor);
          // AAAAAAAAH! - each scream pops up beside the van as it goes past
          [["fr_aah2", 0.25, 1.1], ["fr_aah1", 0.55, 0.9]].forEach(([key, when, pitch]) => {
            this.time.delayedCall(when * TIMES.passFor * 1000, () => {
              FierySounds.scream();
              const aah = this.placed(key).setAlpha(0);
              this.tweens.add({ targets: aah, alpha: 1, duration: 150 });
              this.tweens.add({ targets: aah, x: aah.x + 3, duration: 60, yoyo: true, repeat: 12 });   // shaking
              this.tweens.add({ targets: aah, alpha: 0, delay: 1800, duration: 500, onComplete: () => aah.destroy() });
            });
          });
        });
      });
    }

    // =====================================================================
    //  HELPERS FOR DRIVING ALONG A WIGGLY ROAD
    //  A road is a list of [x, y] points. "d" is how far along it we are,
    //  in pixels. along(road, d) says where that is: x, y, and which way
    //  the road is heading there (dx, dy).
    // =====================================================================
    roadLengths(road) {
      const lens = [0];
      for (let i = 1; i < road.length; i++)
        lens.push(lens[i - 1] + Math.hypot(road[i][0] - road[i - 1][0], road[i][1] - road[i - 1][1]));
      return lens;
    }
    along(road, lens, d) {
      let i = 1;
      while (i < road.length - 1 && d > lens[i]) i++;
      const [ax, ay] = road[i - 1], [bx, by] = road[i];
      const f = Phaser.Math.Clamp((d - lens[i - 1]) / (lens[i] - lens[i - 1]), 0, 1);
      return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, dx: bx - ax, dy: by - ay };
    }
    // Put a vehicle (drawn facing RIGHT) on the road: it turns round to face
    // left when the road heads left, and tilts a little up or down hills.
    setOnRoad(car, p, scale) {
      const left = p.dx < 0;
      car.setFlipX(left);
      const slope = Math.atan2(p.dy, Math.abs(p.dx)) * 180 / Math.PI;     // uphill is negative
      car.angle = Phaser.Math.Clamp(left ? -slope : slope, -30, 30);
      car.setPosition(p.x, p.y).setScale(scale);
    }

    // A little puff of grey smoke (exhaust, or dust)
    puff(x, y, size = 18) {
      const p = this.add.circle(x, y, size, 0x777777, 0.6);
      this.tweens.add({ targets: p, scale: 2.2, alpha: 0, y: y - 20, duration: 900, onComplete: () => p.destroy() });
    }

    // Words appear left to right, as if written ("crop" shows only part)
    reveal(img, seconds) {
      const w = img.width, job = { f: 0 };
      img.setCrop(0, 0, 0, img.height);
      this.tweens.add({ targets: job, f: 1, duration: seconds * 1000,
                        onUpdate: () => img.setCrop(0, 0, w * job.f, img.height) });
    }

    // =====================================================================
    //  "ANY LAY-BYS?" (IMG-072): the blue car goes over the cliff, then our
    //  van wobbles half over the edge at the bend, and carries on anyway
    // =====================================================================
    showLayby() {
      const t0 = TIMES.layby;                             // this part's start
      const box = L.bl_scene;
      this.placed("bl_scene");
      const shape = this.make.graphics({ add: false });   // cars only seen inside the picture
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();
      FierySounds.horror(TIMES.vanIn2 - t0 + 1);
      const road = L.bl_road, lens = this.roadLengths(road);
      // further up the road = further away = smaller
      const yNear = road[3][1], yFar = road[road.length - 1][1];
      const size = (y) => 0.3 + 0.7 * Phaser.Math.Clamp((y - yFar) / (yNear - yFar), 0, 1.2);

      // ---- THE BLUE CAR. Its picture is drawn UPSIDE DOWN (crashed), so
      //      while it drives it is turned the right way up (angle 180) ----
      const carTex = this.textures.get("bl_car").getSourceImage();
      const landX = L.bl_car.x + carTex.width / 2, landY = L.bl_car.y + carTex.height / 2;
      const car = this.add.image(-200, 0, "bl_car").setMask(inside).setDepth(2);
      // where the car leaves the road: the road point nearest the bend
      let dBend = 0;
      road.forEach((pt, i) => { if (pt[1] >= L.bl_bend[1]) dBend = lens[i]; });
      const trip = { d: 0 };
      this.at(TIMES.carIn - t0, () => {
        FierySounds.engine(TIMES.carBend - TIMES.carIn + 0.5);
        this.tweens.add({ targets: trip, d: dBend, duration: (TIMES.carBend - TIMES.carIn) * 1000,
          ease: "Quad.easeIn",                            // speeding up...
          onUpdate: () => {
            const p = this.along(road, lens, trip.d);
            car.setPosition(p.x, p.y - car.displayHeight / 2).setScale(size(p.y) * 1.1);
            car.angle = 180 + Phaser.Math.Clamp(Math.atan2(p.dy, p.dx) * 180 / Math.PI, -30, 30);
          } });
      });
      // ...straight on at the bend, over the edge, a flip in the air, CRASH
      this.at(TIMES.carBend - t0, () => {
        FierySounds.screech();
        const x0 = car.x, y0 = car.y, a0 = car.angle, s0 = car.scale, fly = { u: 0 };
        this.tweens.add({ targets: fly, u: 1, duration: (TIMES.carLand - TIMES.carBend) * 1000,
          onUpdate: () => {
            const u = fly.u;
            car.x = x0 + (landX - x0) * u;
            car.y = y0 + (landY - y0) * u * u - 120 * Math.sin(Math.PI * u);   // up a bit, then down
            car.angle = a0 + (360 - a0) * u;                                  // flips over...
            car.setScale(s0 + (1 - s0) * u);
          },
          onComplete: () => {                              // ...and lands upside down, as drawn
            car.setAngle(0).setPosition(landX, landY);
            FierySounds.crash();
            this.cameras.main.shake(300, 0.012);
            for (let k = 0; k < 6; k++) this.puff(landX - 60 + k * 24, landY + 40, 14);
          } });
      });
      // two dead potatoes tumble out, one each way
      this.at(TIMES.potsOut - t0, () => {
        ["bl_pot1", "bl_pot2"].forEach((key, k) => {
          const pot = this.middled(key);
          const tx = pot.x, ty = pot.y, job = { u: 0 };
          this.tweens.add({ targets: job, u: 1, duration: 700, delay: k * 350,
            onUpdate: () => {
              pot.x = landX + (tx - landX) * job.u;
              pot.y = landY + (ty - landY) * job.u - 70 * Math.sin(Math.PI * job.u);
              pot.angle = 360 * job.u * (k ? 1 : -1);
            },
            onComplete: () => FierySounds.plop() });
          pot.setPosition(landX, landY);
        });
      });

      // ---- OUR VAN, to the Valkyries ----
      const van = this.add.image(-300, 0, "bl_van").setOrigin(0.5, 0.9).setMask(inside).setDepth(3);
      // the edge of the cliff at the bend: which way is "outwards" from the road there
      const pb = this.along(road, lens, dBend + 30);
      const outX = L.bl_edge[0] - pb.x, outY = L.bl_edge[1] - pb.y;
      const go = { d: 0, out: 0, tilt: 0 };
      const place = () => {
        const p = this.along(road, lens, go.d);
        p.x += outX * go.out; p.y += outY * go.out;     // drifting to the outer edge
        this.setOnRoad(van, p, size(p.y) * 0.95);
        van.angle += go.tilt;
      };
      this.at(TIMES.vanIn2 - t0, () => {
        FierySounds.horrorOff(0.3);
        FierySounds.valkyries(TIMES.made - TIMES.vanIn2);
        FierySounds.engine(TIMES.vanTop - TIMES.vanIn2);
        // up to the bend, swinging wide to the OUTSIDE of the road...
        this.tweens.add({ targets: go, d: dBend + 30, duration: (TIMES.teeter - TIMES.vanIn2) * 1000, onUpdate: place });
        this.tweens.add({ targets: go, out: 1, delay: (TIMES.teeter - TIMES.vanIn2 - 1.5) * 1000, duration: 1500,
                          ease: "Sine.easeOut" });
      });
      // ...teeter, half over the edge (rocking), then carry on regardless
      this.at(TIMES.teeter - t0, () => {
        FierySounds.worry();
        FierySounds.screech();
        this.tweens.add({ targets: go, tilt: { from: -14, to: 14 }, duration: 380, ease: "Sine.easeInOut",
                          yoyo: true, repeat: Math.floor(TIMES.teeterFor / 0.76) - 1, onUpdate: place,
                          onComplete: () => { go.tilt = 0; } });
        this.time.delayedCall(TIMES.teeterFor * 0.4 * 1000, () => FierySounds.scream());
      });
      this.at(TIMES.teeter + TIMES.teeterFor - t0, () => {
        this.tweens.add({ targets: go, d: lens[lens.length - 1], duration: (TIMES.vanTop - TIMES.teeter - TIMES.teeterFor) * 1000,
                          onUpdate: place });
        this.tweens.add({ targets: go, out: 0, duration: 1200 });
        this.tweens.add({ targets: van, alpha: 0, delay: (TIMES.vanTop - TIMES.teeter - TIMES.teeterFor - 0.8) * 1000,
                          duration: 700 });               // over the top of the hill
      });

      // ---- the words, as the van comes in (with chatter for the talking) ----
      this.at(TIMES.ask - t0, () => {
        FierySounds.chatter(1.6, 1.1);
        this.reveal(this.placed("bl_ask1"), 0.8);
        this.time.delayedCall(800, () => this.reveal(this.placed("bl_ask2"), 0.8));
      });
      this.at(TIMES.reply - t0, () => {
        FierySounds.chatter(2.2, 0.9);
        ["bl_say1", "bl_say2", "bl_say3"].forEach((key, k) =>
          this.time.delayedCall(k * 750, () => this.reveal(this.placed(key), 0.75)));
      });
    }

    // =====================================================================
    //  "MADE IT TO LE MAZEL!" (IMG-073): the words, the glitchy Valkyries,
    //  then the van (roof on fire) splutters up the road to the pink house
    // =====================================================================
    showMade() {
      const t0 = TIMES.made;
      const box = L.mz_scene;
      this.placed("mz_scene");
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();
      const pot = this.placed("mz_pot");                  // the tiny potato by the house
      pot.setOrigin(0.5, 1).setPosition(pot.x + pot.width / 2, pot.y + pot.height);

      // the words, line by line
      for (let i = 1; i <= 7; i++)
        this.at(TIMES.lines - t0 + (i - 1) * TIMES.lineEach, () => this.reveal(this.placed("mz_line" + i), TIMES.lineEach));

      this.at(TIMES.glitch - t0, () => FierySounds.valkyriesGlitch(TIMES.black - TIMES.glitch + 1));

      // ---- the van, with little flames flickering on its roof. Van and
      //      flames go in a "container" so they move and shrink together.
      //      (0, 0) in the container is the middle of the van's bottom. ----
      const vt = this.textures.get("mz_van").getSourceImage();
      const van = this.add.container(-500, -500).setMask(inside).setVisible(false);   // (hidden till it comes in)
      van.add(this.add.image(0, 0, "mz_van").setOrigin(0.5, 1));
      L.mz_roof.forEach(([rx, ry], k) => {
        const f = this.add.image(rx - vt.width / 2, ry - vt.height + 12, "ff_flame").setOrigin(0.5, 1).setScale(0.22);
        van.add(f);
        this.tweens.add({ targets: f, scaleY: 0.32, scaleX: 0.19, duration: 160 + k * 37, yoyo: true, repeat: -1 });
      });
      const road = L.mz_road, lens = this.roadLengths(road);
      const yBot = road[1][1], yTop = road[road.length - 1][1];
      const go = { d: 0 };
      this.at(TIMES.mzVan - t0, () => {
        van.setVisible(true);
        FierySounds.splutter(TIMES.mzArrive - TIMES.mzVan);
        FierySounds.fire(TIMES.anniv - TIMES.mzVan, 0.05);
        this.tweens.add({ targets: go, d: lens[lens.length - 1], duration: (TIMES.mzArrive - TIMES.mzVan) * 1000,
                          ease: "Sine.easeOut" });
        // spluttering: little jerks and puffs of black smoke
        this.loops.push(this.time.addEvent({ delay: 450, repeat: Math.floor((TIMES.mzArrive - TIMES.mzVan) / 0.45) - 1,
          callback: () => {
            this.puff(van.x - 150 * van.scale, van.y - 40 * van.scale, 22 * van.scale + 4);
            van.angle = Phaser.Math.Between(-3, 3);
          } }));
      });
      this.onTick = () => {
        const p = this.along(road, lens, go.d);
        const k = Phaser.Math.Clamp((p.y - yTop) / (yBot - yTop), 0, 1);     // near = big, far = small
        van.setPosition(p.x, p.y).setScale(0.15 + 0.75 * k);
      };
      // ---- arrived! The tiny potato jumps for joy ----
      this.at(TIMES.mzArrive - t0, () => {
        FierySounds.engineOff(0.2);
        van.angle = 0;
        this.tweens.add({ targets: pot, y: pot.y - 40, duration: 260, ease: "Quad.easeOut", yoyo: true, repeat: 7,
                          onRepeat: () => FierySounds.yippee() });
        this.tweens.add({ targets: pot, angle: { from: -12, to: 12 }, duration: 260, yoyo: true, repeat: 7 });
        FierySounds.yippee();
      });
    }

    // =====================================================================
    //  "HAPPY ANNIVERSARY HONEY..." (IMG-074): Joe and Rosie hold hands,
    //  Joe says it, and they both cry with relief. Then fade to black.
    // =====================================================================
    showAnniv() {
      const t0 = TIMES.anniv;
      const pic = this.add.container(0, 0);                // so it can all shiver together
      pic.add(this.placed("ha_scene"));
      const mouth = this.middled("ha_mouth"), rmouth = this.middled("ha_rmouth"), hands = this.middled("ha_hands");
      pic.add([mouth, rmouth, hands]);
      // holding hands: a gentle squeeze, now and then
      this.tweens.add({ targets: hands, scale: 1.05, duration: 500, yoyo: true, repeat: -1, repeatDelay: 900,
                        ease: "Sine.easeInOut" });
      // little hearts float up from their hands
      const heart = (x, y) => {
        const g = this.add.graphics({ x, y }).setDepth(5);
        g.fillStyle(0xe8406a);
        g.fillCircle(-7, 0, 8).fillCircle(7, 0, 8).fillTriangle(-15, 3, 15, 3, 0, 20);
        this.tweens.add({ targets: g, y: y - 160, x: x + Phaser.Math.Between(-40, 40), alpha: 0, duration: 2600,
                          onComplete: () => g.destroy() });
      };
      this.loops.push(this.time.addEvent({ delay: 900, loop: true,
        callback: () => heart(L.ha_hearts[0] + Phaser.Math.Between(-30, 30), L.ha_hearts[1]) }));
      // Joe says it (the words write themselves, his mouth moves)
      this.at(TIMES.honey - t0, () => {
        FierySounds.chatter(2.4, 0.85);
        this.reveal(this.placed("ha_words").setDepth(4), 2.4);
        this.tweens.add({ targets: mouth, scaleY: 1.5, scaleX: 1.08, duration: 120, yoyo: true, repeat: 9 });
      });
      // then they both cry (happy tears!), shivering a little as they sob
      this.at(TIMES.cry - t0, () => {
        FierySounds.sob(TIMES.black - TIMES.cry, 1);
        this.time.delayedCall(250, () => FierySounds.sob(TIMES.black - TIMES.cry - 0.5, 1.25));
        this.tweens.add({ targets: pic, x: 3, duration: 90, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: [mouth, rmouth], scaleY: 1.25, duration: 220, yoyo: true, repeat: -1 });
        this.loops.push(this.time.addEvent({ delay: 220, loop: true, callback: () => {
          const [tx, ty] = Phaser.Utils.Array.GetRandom(L.ha_tears);
          const drop = this.add.ellipse(tx, ty, 12, 18, 0x4fb3e0).setStrokeStyle(1.5, 0x22688f).setDepth(3);
          this.tweens.add({ targets: drop, y: ty + 140, alpha: { from: 1, to: 0 }, duration: 1100, ease: "Quad.easeIn",
                            onComplete: () => drop.destroy() });
        } }));
      });
      this.at(TIMES.black - t0, () => {
        FierySounds.glitchOff(1.5);
        this.cameras.main.fadeOut(1500, 0, 0, 0);
      });
    }

    // =====================================================================
    //  FIN (IMG-075): just the page, held
    // =====================================================================
    showFin() {
      this.placed("fin_page");
    }

    // =====================================================================
    //  THE AFTERWORD (IMG-077, 078, 079), to an 8-bit La Marseillaise.
    //  Each page slowly drifts a little closer while you read it.
    // =====================================================================
    showPage(key) {
      const page = this.add.image(W / 2, H / 2, key);
      this.tweens.add({ targets: page, scale: 1.04, duration: 10000 });
    }
    showLetter() {
      FierySounds.marseillaise(TIMES.race - TIMES.letter);
      this.showPage("aw_letter");
    }
    showQuotes() { this.showPage("aw_quotes"); }
    showBonus() { this.showPage("aw_bonus"); }

    // =====================================================================
    //  THE LAST LAP: our van (the one from episode 1), roof on fire, races
    //  across left to right, turns round and races back... a few times,
    //  to the glitchy Valkyries, then it's gone.
    // =====================================================================
    showRace() {
      FierySounds.valkyriesOff(0.3);                     // (the anthem)
      FierySounds.valkyriesGlitch(TIMES.fadeOut - TIMES.race + 2);
      FierySounds.fire(TIMES.fadeOut - TIMES.race, 0.06);
      // a simple road across the middle of the page
      const g = this.add.graphics();
      g.fillStyle(0x8a8580).fillRect(0, 560, W, 150);
      g.fillStyle(0xffffff);
      for (let x = 20; x < W; x += 120) g.fillRect(x, 630, 60, 8);
      // the van and its roof flames, in a container: (0, 0) = middle of its bottom
      const k = 0.5;
      const tex = this.textures.get("ff_bus").getSourceImage();
      const van = this.add.container(-400, 650);
      van.add(this.add.image(0, 0, "ff_bus").setOrigin(0.5, 1).setScale(k));
      [-0.3, -0.1, 0.1, 0.3].forEach((fx, i) => {
        const f = this.add.image(fx * tex.width * k, -tex.height * k * 0.92, "ff_flame").setOrigin(0.5, 1).setScale(0.18);
        van.add(f);
        this.tweens.add({ targets: f, scaleY: 0.27, scaleX: 0.15, duration: 150 + i * 31, yoyo: true, repeat: -1 });
      });
      this.tweens.add({ targets: van, y: 644, duration: 110, yoyo: true, repeat: -1 });   // bouncing along
      // dash after dash: odd ones go right, even ones go left (van turned round)
      const off = tex.width * k / 2 + 80;
      for (let n = 0; n < TIMES.raceDashes; n++) {
        this.at(0.3 + n * TIMES.raceEach, () => {
          const right = n % 2 === 0;
          van.scaleX = right ? 1 : -1;
          van.x = right ? -off : W + off;
          FierySounds.whoosh();
          FierySounds.scream();
          this.tweens.add({ targets: van, x: right ? W + off : -off, duration: TIMES.raceEach * 1000 - 200,
                            ease: "Sine.easeInOut" });
        });
      }
      this.loops.push(this.time.addEvent({ delay: 120, loop: true,
        callback: () => this.puff(van.x - van.scaleX * tex.width * k * 0.45, 640, 12) }));
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

// =====================================================================
//  main.js  -  SC-04 "Le Taxi at Lyon"   (uses IMG-010)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//    0   Right up close on the airport clock (top right). Tick, tock...
//    2.5 The camera pulls back to show the whole airport: EMPTY, except
//        for the French potato with her shopping trolley.
//    5   The black plane flies back and forth across the sky. A yellow
//        lightning bolt chases it, and every few seconds (TIMES.zaps)
//        it ZAPS the plane: flash, thunder, the plane jolts.
//    9   Our family walks in from the left to their spot.
//   13.5 The first taxi jogs in from the RIGHT, nose first (engine,
//        dust puffs), and drives all the way to the left-hand spot...
//   17   ...then the second taxi, which parks on the right.
//   22   POP! A taxi driver appears on top of each taxi...
//   24   ...and they shuffle about, back and forth, on their roofs.
//   27   FINALLY the family's question: "umm... which taxi do we get?"
//   34   Fade out. The end (for now!).
//
//  STORY RULE: the van travels LEFT to RIGHT (right-to-left is saved
//  for its comedy "retreat" later). The taxis are drawn facing LEFT, so
//  they drive in from the right, nose first (Enda's call). The plane may
//  go both ways.
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every scene's main.js on one page without the names clashing)

  const TIMES = {
    zoomOut: 2.5,
    plane: 5,
    zaps: [8, 11.5, 15, 18.5, 22, 25.5, 29, 32.5],   // every lightning strike
    family: 9,
    taxiLeft: 13.5,       // the taxi that parks on the left comes first
    taxiRight: 17,        // (so neither has to drive through the other)
    drivers: 22,
    shuffle: 24,
    question: 27,
    fadeOut: 34,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT4;         // sprite positions, from layout.js

  // Which things are drawn in front of which: bigger numbers in front.
  const DEPTH = { family: 1, dust: 2, taxi: 3, driver: 4, bubble: 5, plane: 6, bolt: 7 };


  class Taxi extends Phaser.Scene {

    // Every scene needs its own name, so "Play all" can switch between them.
    constructor() { super("taxi"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      pic("airport_blank", "airport_blank.jpg");
      pic("plane_shadow", "plane_shadow.png");
      pic("family", "family.png");
      pic("taxi1", "taxi1.png");
      pic("taxi2", "taxi2.png");
      pic("driver1", "driver1.png");
      pic("driver2", "driver2.png");
      pic("bubble", "bubble.png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      // "Play all": we arrive straight from scene 3, so begin at once.
      if (window.PLAY_ALL) this.showAirport();
      else window.startShow = () => this.showAirport();
    }

    // ---- The whole scene is one shot ------------------------------------
    showAirport() {
      const cam = this.cameras.main;
      this.add.image(0, 0, "airport_blank").setOrigin(0);

      // Start right up close on the clock, then pull back.
      // (setBounds stops the camera looking past the edge of the picture.)
      cam.setBounds(0, 0, W, H);
      cam.setZoom(4);
      cam.centerOn(L.clock[0], L.clock[1]);
      cam.fadeIn(800);
      [0.4, 1.4, 2.4].forEach((t) => this.at(t, () => TaxiSounds.tick()));
      this.at(TIMES.zoomOut, () => {
        cam.zoomTo(1, 3500, "Sine.easeInOut");
        cam.pan(W / 2, H / 2, 3500, "Sine.easeInOut");
      });

      // The plane and its lightning
      this.at(TIMES.plane, () => this.startPlane());
      for (const t of TIMES.zaps) this.at(t, () => this.zap());

      // The family walks in
      this.at(TIMES.family, () => this.familyArrives());

      // The taxis jog in (the right-hand one first, so it doesn't have to
      // drive through the other one)
      this.at(TIMES.taxiLeft, () => this.taxiArrives("taxi1", 4500));
      this.at(TIMES.taxiRight, () => this.taxiArrives("taxi2", 3500));

      // POP! The drivers, then they shuffle about
      this.at(TIMES.drivers, () => this.popDriver("driver1", 0));
      this.at(TIMES.drivers + 1, () => this.popDriver("driver2", 1));

      // The question
      this.at(TIMES.question, () => this.askQuestion());

      // The end
      this.at(TIMES.fadeOut, () => {
        TaxiSounds.planeOff(2);
        cam.fadeOut(2000, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => {
          if (window.PLAY_ALL) this.scene.start("uber");   // "Play all": on to scene 5
          else showEnd();                                   // in index.html
        });
      });
    }

    // ---- The plane --------------------------------------------------------
    startPlane() {
      TaxiSounds.plane();
      // Turn the plane round its middle (not its top-left corner)
      this.plane = this.add.image(-100, 70, "plane_shadow").setDepth(DEPTH.plane);
      this.bolt = this.makeBolt();
      this.flyAcross(+1);                       // +1 = left to right first
    }

    // Fly from one side to the other, then turn round and come back,
    // forever. direction: +1 = to the right, -1 = to the left.
    flyAcross(direction) {
      const plane = this.plane;
      plane.setFlipX(direction < 0);            // the picture faces right; flip it to face left
      plane.x = direction > 0 ? -100 : W + 100;
      plane.y = 50 + Math.random() * 60;        // a different height each time
      this.tweens.add({
        targets: plane, x: direction > 0 ? W + 100 : -100,
        y: plane.y + (Math.random() * 40 - 20),
        duration: 4200, ease: "Linear",
        onComplete: () => this.flyAcross(-direction),
      });
    }

    // The yellow lightning bolt: a zig-zag drawn with straight lines,
    // yellow with a black edge, like a felt-tip drawing.
    makeBolt() {
      const zigzag = [[0, 0], [26, 0], [14, 22], [32, 22], [6, 56], [12, 32], [-4, 32]];
      const bolt = this.add.graphics().setDepth(DEPTH.bolt);
      bolt.fillStyle(0xffd21f).lineStyle(3, 0x1d1b14);
      bolt.beginPath();
      bolt.moveTo(zigzag[0][0], zigzag[0][1]);
      for (const [x, y] of zigzag.slice(1)) bolt.lineTo(x, y);
      bolt.closePath(); bolt.fillPath(); bolt.strokePath();
      // A gentle flicker while it chases the plane
      this.tweens.add({ targets: bolt, alpha: { from: 1, to: 0.55 }, duration: 120, yoyo: true, repeat: -1 });
      return bolt;
    }

    // Phaser calls update() every frame (about 60 times a second).
    // We use it to keep the bolt chasing the plane: it hangs just above
    // and BEHIND the plane (behind = the side it's coming from).
    update() {
      if (!this.plane || this.bolt.striking) return;
      const behind = this.plane.flipX ? +1 : -1;
      this.bolt.x = this.plane.x + behind * 75 - 14;
      this.bolt.y = this.plane.y - 75;
    }

    // ZAP! The bolt jumps onto the plane: flash, thunder, the plane jolts.
    zap() {
      if (!this.plane) return;
      const bolt = this.bolt, plane = this.plane;
      bolt.striking = true;
      this.tweens.add({
        targets: bolt, x: plane.x - 14, y: plane.y - 45, duration: 90,
        onComplete: () => {
          TaxiSounds.zap();
          this.cameras.main.flash(200, 255, 245, 160);
          plane.setTint(0xffe066);                                  // lit up yellow
          this.tweens.add({ targets: plane, angle: { from: -25, to: 25 }, duration: 60, yoyo: true, repeat: 3,
                            onComplete: () => plane.setAngle(0) });
          this.time.delayedCall(350, () => { plane.clearTint(); bolt.striking = false; });
        },
      });
    }

    // ---- The family ------------------------------------------------------
    familyArrives() {
      const family = this.addSprite("family");
      const spotX = family.x;
      family.x = -family.width;                                     // start off the left edge
      this.tweens.add({ targets: family, x: spotX, duration: 3000, ease: "Sine.easeOut" });
      // little hops as they walk, which stop when they get there
      this.tweens.add({ targets: family, y: family.y - 8, duration: 130, yoyo: true, repeat: 10 });
      [0, 1, 2].forEach((t) => this.at(t, () => TaxiSounds.steps()));
    }

    // ---- The taxis -------------------------------------------------------
    // Jog in from the RIGHT, nose first (bouncing and rocking, with puffs
    // of dust)
    // and slow down to stop at its spot.
    taxiArrives(key, duration) {
      const taxi = this.addSprite(key).setDepth(DEPTH.taxi);
      const spotX = taxi.x, spotY = taxi.y;
      taxi.x = W;                                 // start just off the right edge
      TaxiSounds.putter();

      // Jogging: bounce up and down and rock slightly
      const jog = this.tweens.add({
        targets: taxi, y: spotY - 7, angle: { from: -1, to: 1 },
        duration: 140, yoyo: true, repeat: -1,
      });

      // Dust puffs from behind the back wheel (the taxi's RIGHT end)
      const dust = this.time.addEvent({
        delay: 110, loop: true,
        callback: () => {
          const puff = this.add.circle(taxi.x + taxi.width - 20, spotY + taxi.height - 25, 10 + Math.random() * 12, 0xc9c2a8)
            .setAlpha(0.85).setDepth(DEPTH.dust);
          this.tweens.add({
            targets: puff, x: puff.x + 70, y: puff.y - 30, scale: 2.2, alpha: 0, duration: 700,
            onComplete: () => puff.destroy(),
          });
        },
      });

      // Drive to the spot, slowing down at the end. Then stop jogging,
      // settle with a little bump, and switch the engine off.
      this.tweens.add({
        targets: taxi, x: spotX, duration, ease: "Sine.easeOut",
        onComplete: () => {
          jog.stop(); dust.remove();
          taxi.setAngle(0).setY(spotY);
          this.tweens.add({ targets: taxi, y: spotY - 10, duration: 120, yoyo: true, ease: "Quad.easeOut" });
          TaxiSounds.putterOff();
        },
      });
    }

    // ---- The drivers -----------------------------------------------------
    // POP! A driver grows out of nothing on his taxi roof, with a ring of
    // little stars. Then he starts shuffling.
    popDriver(key, number) {
      TaxiSounds.pop(number);
      const d = this.addSprite(key).setDepth(DEPTH.driver);
      // Grow from his feet: move the origin to the bottom middle, and the
      // position to match, so he lands in the same spot.
      d.setOrigin(0.5, 1).setPosition(d.x + d.width / 2, d.y + d.height);
      d.setScale(0);
      this.tweens.add({ targets: d, scale: 1, duration: 350, ease: "Back.easeOut" });
      this.sparkle(d.x, d.y - d.height / 2);
      this.at(TIMES.shuffle - TIMES.drivers - number, () => this.shuffle(d, number));
    }

    // Shuffle back and forth along the roof with small hops.
    // The two drivers start in opposite directions, so it looks like a
    // grumpy little dance.
    shuffle(d, number) {
      const homeX = d.x, step = number === 0 ? 30 : -30;
      this.tweens.add({
        targets: d, x: homeX + step, duration: 700, ease: "Sine.easeInOut",
        yoyo: true, repeat: -1,
        onYoyo: () => TaxiSounds.shuffle(),
        onRepeat: () => TaxiSounds.shuffle(),
      });
      this.tweens.add({ targets: d, y: d.y - 6, duration: 175, yoyo: true, repeat: -1 });
    }

    // A ring of little yellow stars flying outwards from (x, y)
    sparkle(x, y) {
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const star = this.add.star(x, y, 5, 5, 11, 0xffe81f).setStrokeStyle(2, 0x1d1b14).setDepth(DEPTH.driver + 0.5);
        this.tweens.add({
          targets: star, x: x + Math.cos(angle) * 140, y: y + Math.sin(angle) * 140,
          angle: 180, alpha: 0, duration: 650, ease: "Quad.easeOut",
          onComplete: () => star.destroy(),
        });
      }
    }

    // ---- The question ------------------------------------------------------
    // The speech bubble grows out of its little tail, with a puzzled "hmm?"
    askQuestion() {
      TaxiSounds.hmm();
      const b = this.addSprite("bubble").setDepth(DEPTH.bubble);
      // its tail is at the bottom, about a third of the way along
      b.setOrigin(0.33, 1).setPosition(b.x + b.width * 0.33, b.y + b.height);
      b.setScale(0);
      this.tweens.add({ targets: b, scale: 1, duration: 500, ease: "Back.easeOut" });
    }

    // ---- Helpers ------------------------------------------------------------

    // Put a cut-out sprite at its spot (from layout.js).
    addSprite(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0).setDepth(DEPTH[key] || 1);
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this scene to the list (that page
  // starts Phaser itself, with every scene). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(Taxi);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Taxi,
  });

}

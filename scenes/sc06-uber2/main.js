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
//         leaving only the driver.
//
//   PANEL 2 - RUUUN!
//   27.5  The chicken panel, empty.
//   28    The words write in: "Quickly, they ran to safety, like
//         adrenaline-soaked chickens..."
//   33.5  "RUUUN!" and the chickens dash from RIGHT to LEFT, clucking.
//         (Right to left is Enda's call here. The van keeps right to
//          left for its comedy retreat.)
//   42    Fade out. The end.
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
    run: 33.5,
    fadeOut: 42,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT6;         // sprite positions, from layout.js

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
                         "ruun", "chickens", "quickly_text"]) pic(key, key + ".png");
      for (let i = 1; i <= 5; i++) pic("helmet_head" + i, `helmet_head${i}.png`);
      pic("chicken_blank", "chicken_blank.jpg");
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
      this.cameras.main.fadeIn(700);
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

      // The flock waits just off the RIGHT edge, then dashes across to
      // the LEFT and away, bobbing up and down and wobbling as they run.
      const flock = this.add.image(W + 20, L.chickens.y, "chickens").setOrigin(0);
      this.at(TIMES.run - t0, () => {
        this.tweens.add({ targets: ruun, scale: 1, duration: 300, ease: "Back.easeOut" });
        this.tweens.add({ targets: ruun, angle: { from: -6, to: 6 }, duration: 90, yoyo: true, repeat: 20 });
        Deux.panic(7);
        Deux.scurry(7);
        this.tweens.add({ targets: flock, x: -flock.width - 20, duration: 7000, ease: "Linear" });
        this.tweens.add({ targets: flock, y: L.chickens.y - 14, angle: { from: -2, to: 2 },
                          duration: 110, yoyo: true, repeat: -1 });
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

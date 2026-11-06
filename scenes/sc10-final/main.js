// =====================================================================
//  main.js  -  EPISODE 10 "Final Destination (almost)"
//              (uses IMG-055)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//    0    Close up on "ONE HOUR LATER" (happy country tune)...
//    2.5  ...zoom out to the whole picture: the road, the nuclear towers,
//         and a happy potato at the bottom. The road is EMPTY.
//    6.5  The words at the top appear: "This happened. After the
//         comparison to Final Destination 2 was made, Enda accelerated
//         to safety."
//    9    The potato talks (mouth moving, 8-bit chatter) and her words
//         appear: "1 HOUR without an incident! Oh look, nuclear towers!
//         And a log truck!"
//   14.5  The Ride of the Valkyries...
//   15.5  ...the LOG TRUCK comes in at the bottom right and bops up the
//         road...
//   17.5  ...our pink van follows it, and catches up behind it.
//   20.5  Driver Enda: "AAAAH!!!" (googly eyes!)
//   23.5  A passenger: "FLOOR IT!"
//   24.5  The van speeds up, overtakes the truck and vanishes up the road
//         into the distance. (phew!)
//         The truck bops on... and near the top its logs slide off the
//         back, one by one, and PLOP onto the road. The truck drives off.
//   37    Fade out.
//
//  To change WHEN things happen, change the numbers in TIMES below.
//  To change how FAST the vehicles go, change SPEED below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    zoomOut: 2.5,         // zoom out from "ONE HOUR LATER"
    top: 6.5,             // the words at the top
    talk: 9,              // the potato talks...
    talkFor: 5,           // ...for this many seconds
    valkyries: 14.5,      // the music
    truckIn: 15.5,        // the log truck comes in
    vanIn: 17.5,          // the van follows it
    aaah: 20.5,           // Enda: "AAAAH!!!"
    floorIt: 23.5,        // "FLOOR IT!"
    overtake: 24.5,       // the van overtakes and is gone
    fadeOut: 37,
  };

  const SPEED = {         // in screen pixels per second, along the road
    truck: 55,
    van: 75,              // catching up
    floorIt: 290,         // FLOOR IT!
  };
  const GAP = 215;        // how close the van gets behind the truck (pixels along the road)
  const LOGS_AT = 600;    // how far up the road the truck is when its logs fall off

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT10;        // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page

  // ---- THE ROAD ------------------------------------------------------
  // The road is a line of points (from layout.js), bottom right to top
  // left. "s" means how far along the road (in pixels). roadAt(s) gives
  // the point that far along, and which way the road goes there.
  const PATH = L.fd_path;
  const LENGTHS = [0];                      // how far along the road each point is
  for (let i = 1; i < PATH.length; i++)
    LENGTHS.push(LENGTHS[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));

  function roadAt(s) {
    // find the piece of road that s is on (before the start or after the
    // end, we just carry on in a straight line)
    let i = 1;
    while (i < PATH.length - 1 && s > LENGTHS[i]) i++;
    const [ax, ay] = PATH[i - 1], [bx, by] = PATH[i];
    const len = LENGTHS[i] - LENGTHS[i - 1];
    const f = (s - LENGTHS[i - 1]) / len;            // 0 at the piece's start, 1 at its end
    return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, dx: (bx - ax) / len, dy: (by - ay) / len };
  }

  // Things further up the road (higher on the screen) are further away,
  // so they look smaller. This gives a size for any height on the screen.
  function sizeAt(y) {
    return 0.5 + 0.65 * (y - 169) / (722 - 169);
  }

  class FinalDestination extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("final"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      pic("fd_road", "fd_road.jpg");
      for (const key of ["fd_truck", "fd_log1", "fd_log2", "fd_log3", "fd_log4", "fd_van", "fd_aaaah", "fd_aaah",
                         "fd_floor", "fd_phew", "fd_top", "fd_speech", "fd_mouth"])
        pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      // "Play all": we arrive straight from episode 9, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    // Phaser calls update() every frame (about 60 times a second). If
    // there's an "onTick" job, we run it with the time now and the time
    // since the last frame (both in seconds).
    update(time, delta) {
      if (this.onTick) this.onTick(time / 1000, delta / 1000);
    }

    // An image at its place from layout.js
    placed(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0);
    }

    // The middle of a sprite, as drawn in the picture
    centreOf(key) {
      const tex = this.textures.get(key).getSourceImage();
      return [L[key].x + tex.width / 2, L[key].y + tex.height / 2];
    }

    start() {
      const cam = this.cameras.main;

      // ---- the picture, with the road cleared, and a "mask" so the
      //      vehicles are only seen inside the picture ----
      const box = L.fd_road;
      this.placed("fd_road");
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      this.inside = shape.createGeometryMask();

      // ---- 1. start close up on "ONE HOUR LATER", then zoom out ----
      const [lx, ly] = L.fd_later;
      cam.setZoom(3.4).centerOn(lx, ly + 30);
      cam.fadeIn(800);
      FinalSounds.pastoral(TIMES.valkyries + 1);
      this.at(TIMES.zoomOut, () => {
        cam.pan(W / 2, H / 2, 3000, "Cubic.easeInOut");
        cam.zoomTo(1, 3000, "Cubic.easeInOut");
      });

      // ---- 2. the words at the top ----
      this.at(TIMES.top, () => {
        const top = this.placed("fd_top").setAlpha(0);
        top.y -= 15;
        this.tweens.add({ targets: top, alpha: 1, y: top.y + 15, duration: 900, ease: "Sine.easeOut" });
      });

      // ---- 3. the potato talks, and her words appear line by line ----
      this.at(TIMES.talk, () => {
        const mouth = this.placed("fd_mouth");
        // (its pivot is near its top, so it opens DOWNWARDS)
        mouth.setOrigin(0.5, 0.3).setPosition(mouth.x + mouth.width / 2, mouth.y + mouth.height * 0.3);
        const flaps = Math.round(TIMES.talkFor * 1000 / 220);
        this.tweens.add({ targets: mouth, scaleY: 1.7, scaleX: 1.08, duration: 110, ease: "Sine.easeInOut",
                          yoyo: true, repeat: flaps - 1 });
        FinalSounds.chatter(TIMES.talkFor, 1.1);
        // the words: we show more and more of them, from the top down
        // ("setCrop" shows just a part of a picture)
        const words = this.placed("fd_speech");
        const shown = { h: 0 };
        words.setCrop(0, 0, words.width, 0);
        this.tweens.add({ targets: shown, h: words.height, duration: TIMES.talkFor * 1000,
                          onUpdate: () => words.setCrop(0, 0, words.width, shown.h) });
      });

      // ---- 4. the Valkyries, the truck and the van ----
      this.at(TIMES.valkyries, () => { FinalSounds.pastoralOff(1); FinalSounds.valkyries(TIMES.fadeOut - TIMES.valkyries + 2); });
      this.at(TIMES.truckIn, () => this.startTruck());
      this.at(TIMES.vanIn, () => this.startVan());

      // ---- the end ----
      this.at(TIMES.fadeOut, () => {
        FinalSounds.valkyriesOff(2.5);
        FinalSounds.engineOff(2);
        cam.fadeOut(2500, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => showEnd());   // in index.html / play-all.html
      });
    }

    // =====================================================================
    //  THE LOG TRUCK
    // =====================================================================
    startTruck() {
      const [tx, ty] = this.centreOf("fd_truck");
      this.truckSize = sizeAt(ty);                    // the size it was drawn at
      const truck = this.add.image(0, 0, "fd_truck").setMask(this.inside);
      // the 4 logs ride on the truck: remember where each one sits
      // (from the truck's middle, as drawn)
      const logs = [1, 2, 3, 4].map((n) => {
        const [x, y] = this.centreOf("fd_log" + n);
        return { img: this.add.image(0, 0, "fd_log" + n).setMask(this.inside), dx: x - tx, dy: y - ty, onTruck: true };
      });
      this.truck = { img: truck, logs, s: -90, speed: SPEED.truck, dropped: false };
      FinalSounds.engine(TIMES.fadeOut - TIMES.truckIn);
      this.onTick = (now, dt) => this.drive(now, dt);
    }

    // =====================================================================
    //  OUR PINK VAN
    // =====================================================================
    startVan() {
      const [vx, vy] = this.centreOf("fd_van");
      this.vanSize = sizeAt(vy);
      // the van and its googly eyes, together in one container
      const van = this.add.container(0, 0).setMask(this.inside);
      van.add(this.add.image(0, 0, "fd_van"));
      // googly eyes on Enda's face in the window (hidden until he panics)
      this.eyes = [];
      for (const [ex, ey] of [[-31, -61], [-15, -65]]) {
        const white = this.add.circle(ex, ey, 7, 0xffffff).setStrokeStyle(2, 0x1c1a18);
        const pupil = this.add.circle(ex, ey, 3.5, 0x1c1a18);
        van.add([white, pupil]);
        this.eyes.push({ white, pupil, x: ex, y: ey });
      }
      this.eyes.forEach((e) => { e.white.setVisible(false); e.pupil.setVisible(false); });
      this.van = { img: van, s: -230, speed: SPEED.van, side: 0, gone: false };

      // "AAAAH!!!" - the driver panics stuck behind the truck
      this.at(TIMES.aaah - TIMES.vanIn, () => {
        this.bubble = this.add.image(0, 0, "fd_aaaah").setScale(0);
        this.tweens.add({ targets: this.bubble, scale: 1, duration: 250, ease: "Back.easeOut" });
        this.bubbleAt = [-150, 0];                      // where it sits (from the van's middle: to its left)
        this.eyes.forEach((e) => { e.white.setVisible(true); e.pupil.setVisible(true); });
        FinalSounds.wilhelm(1.1);
      });
      // "FLOOR IT!"
      this.at(TIMES.floorIt - TIMES.vanIn, () => {
        this.bubble.destroy();
        this.bubble = this.add.image(0, 0, "fd_floor").setScale(0);
        this.bubbleAt = [70, -95];
        this.tweens.add({ targets: this.bubble, scale: 1.2, duration: 250, ease: "Back.easeOut" });
        FinalSounds.sting();
      });
      // GO! the van overtakes (pulling out to the side, then back in)
      this.at(TIMES.overtake - TIMES.vanIn, () => {
        this.van.speed = SPEED.floorIt;
        this.van.overtaking = true;
        this.tweens.add({ targets: this.van, side: 55, duration: 450, ease: "Sine.easeOut" });
        this.tweens.add({ targets: this.van, side: 0, duration: 600, delay: 1300, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: this.bubble, alpha: 0, duration: 400, delay: 700 });
        FinalSounds.rev();
        FinalSounds.whoosh();
      });
    }

    // =====================================================================
    //  EVERY FRAME: move the truck, its logs and the van up the road
    // =====================================================================
    drive(now, dt) {
      const truck = this.truck, van = this.van;
      const jog = (speed) => Math.sin(now * speed) * 2.5;   // a little bop up and down

      // ---- the truck ----
      truck.s += truck.speed * dt;
      const t = roadAt(truck.s);
      const tk = sizeAt(t.y) / this.truckSize;            // how big it is here
      const ty = t.y + jog(18);
      truck.img.setPosition(t.x, ty).setScale(tk).setDepth(t.y);
      for (const log of truck.logs) {
        if (log.onTruck) log.img.setPosition(t.x + log.dx * tk, ty + log.dy * tk).setScale(tk).setDepth(t.y + 1);
      }
      // near the top: the logs slide off the back and PLOP onto the road
      if (!truck.dropped && truck.s > LOGS_AT) {
        truck.dropped = true;
        this.dropLogs(t);
      }

      // ---- the van ----
      if (van) {
        if (!van.overtaking) {
          // catching up... but it won't go closer than GAP behind the truck
          van.s = Math.min(van.s + van.speed * dt, truck.s - GAP);
        } else {
          van.s += van.speed * dt;
        }
        const v = roadAt(van.s);
        const vk = sizeAt(v.y) / this.vanSize;
        // "side": how far it has pulled out to overtake (at right angles
        // to the road)
        const sx = -v.dy * van.side, sy = v.dx * van.side;
        van.img.setPosition(v.x + sx, v.y + sy + jog(22)).setScale(vk).setDepth(v.y + sy);
        // the googly eyes wobble about
        this.eyes.forEach((e, i) => e.pupil.setPosition(e.x + Math.sin(now * 13 + i * 2) * 3,
                                                         e.y + Math.cos(now * 17 + i) * 3));
        // the shout follows the van
        if (this.bubble && this.bubble.active)
          this.bubble.setPosition(van.img.x + this.bubbleAt[0] * vk, van.img.y + this.bubbleAt[1] * vk).setDepth(2000);
        // "phew!" as it vanishes up the road
        if (!van.gone && van.s > LENGTHS[LENGTHS.length - 1] - 60) {
          van.gone = true;
          const phew = this.placed("fd_phew").setScale(0).setDepth(2000);
          phew.setOrigin(0.5).setPosition(phew.x + phew.width / 2, phew.y + phew.height / 2);
          this.tweens.add({ targets: phew, scale: 1, duration: 300, ease: "Back.easeOut" });
          this.tweens.add({ targets: phew, alpha: 0, delay: 2200, duration: 600 });
          FinalSounds.pop();
        }
      }
    }

    // The logs slide off the BACK of the truck, one after another, and
    // drop onto the road (where they stay, rocking a little as they land)
    dropLogs(t) {
      const back = [-t.dx, -t.dy];                        // "backwards" down the road
      this.truck.logs.slice().reverse().forEach((log, i) => {   // the top log first
        this.time.delayedCall(i * 280, () => {
          log.onTruck = false;
          const img = log.img;
          const dist = 40 + i * 28;                       // further back each time
          this.tweens.add({
            targets: img,
            x: img.x + back[0] * dist,
            y: img.y + back[1] * dist + 22,               // (+22: down onto the road)
            angle: (i % 2 ? 1 : -1) * (3 + i * 2),
            duration: 450,
            ease: "Bounce.easeOut",
          });
          this.time.delayedCall(260, () => FinalSounds.boop());
        });
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(FinalDestination);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: FinalDestination,
  });

}

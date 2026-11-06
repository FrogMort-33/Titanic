// =====================================================================
//  main.js  -  EPISODE 10 "Final Destination (almost)"  (complete)
//              (uses IMG-055, 057, 060, 061, 062 and 063)
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
//         Hold for 5...
//
//   PART 2 - THE TOLL BOOTH  (IMG-057)  - the happy country tune again
//   38.5  "ONE HOUR LATER" (big)...
//   42    ...fades to the toll booth, the barrier DOWN.
//   43.5  The van bops in from the right and stops at the booth.
//   47.5  POP! the ticket comes out; a hand comes out of the van and takes it.
//   50.5  The barrier goes UP...
//   52    ...and the van bops off out of the picture.
//   56    Inside the van. The middle potato: "The strict instruction was
//         DON'T lose the ticket"...
//   62    ...Enda: "Oh, shit."
//   65    "Delirious laughter continued." (ha ha ha)
//   71    One little picture at a time: "Rhianna, how are you?"
//   77    Rhianna: "Reading for my life". Hold for 5...
//   85    ...back to him, confused: eyebrows going, "..."
//
//   PART 3 - EURO TRUCK SIMULATOR, French Village Edition  (IMG-060)
//   92    Clear screen. A never-ending stream of lorries bops slowly past,
//         left to right (beep beep!): as one goes off the right, another
//         comes in on the left...
//  102    ...then, from the left, our van SPEEDS across (the Valkyries)...
//  105.5  ...and is gone. Hold...
//
//   PART 4 - "WE'LL ALL GET DVT!"  (IMG-061)  - the happy country tune
//  109    New screen. Top: inside the van, four potatoes. Bottom: the van
//         bopping along the road towards "LE SERVICES 100,000 m".
//  110.5  Rosie: "We'll all get DVT!"   (hold)
//  115    Enda: "My foot will be frozen on the accelerator!"
//  121    The top picture changes to the next little panel...
//  122    ...Annelisa: "Do you need a break? After all the running people
//         over, bashing the car up?..."
//  ~128   The van bops off the right of the road picture.
//
//   PART 5 - "MEANWHILE, ENDA WAS TOTALLY FINE."  (IMG-062)
//  127    The camera zooms in on Enda in the little panel until he's the
//         same size as in the big close-up...
//  130    ...then swap: Enda full size (left), thinking about a frog in a
//         boiling pot (right). Bubbles rise, sweat drips, the wheel turns.
//  131.5  "Meanwhile, Enda was totally fine."
//  134    Enda: "I'm like a frog in boiling water!"
//  137.5  An EDITOR'S NOTE pops up to explain.
//
//   PART 6 - LE SERVICES  (IMG-063)
//  147.5  "FIVE MINUTES LATER" (big, slowly getting closer)...
//  151.5  ...the shop, titled "LE SERVICES". The shopkeeper looks normal.
//  152.5  The two happy potatoes bop in from the left...
//  156.5  ...and ask: "Un Pizza plz?"  Hold for 5...
//  164    ...the shopkeeper ERUPTS: she bounces, the screen shakes, her face
//         changes to the shout, "WHAT?!" and pizza slices fly out.
//  172    Fade out - the end of Episode 10.
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
    // PART 2 - the toll booth
    later2: 38.5,         // "ONE HOUR LATER"
    booth: 42,            // the toll booth, barrier down
    vanIn2: 43.5,         // the van bops in...
    vanStop: 46.5,        // ...and stops
    ticket: 47.5,         // the ticket pops out, the hand takes it
    raise: 50.5,          // the barrier goes up
    vanOut2: 52,          // the van bops away
    inside: 56,           // inside the van
    strict: 57.5,         // "The strict instruction was DON'T lose the ticket"
    ohShit: 62,           // "Oh, shit."
    laughter: 65,         // "Delirious laughter continued."
    rhianna: 71,          // "Rhianna, how are you?"
    reading: 77,          // "Reading for my life"
    confused: 85,         // back to him, confused
    // PART 3 - the lorries
    convoy: 92,           // the stream of lorries
    zoom: 102,            // our van speeds across...
    zoomGone: 105.5,      // ...and is off the right-hand side by now
    // PART 4 - "We'll all get DVT!"
    dvt: 109,             // new screen: inside the van + the road
    rosie: 110.5,         // Rosie: "We'll all get DVT!"
    rosieFor: 2.5,
    enda: 115,            // Enda: "My foot will be frozen on the accelerator!"
    endaFor: 3.5,
    ann: 121,             // the next little panel...
    annTalk: 122,         // ...Annelisa: "Do you need a break? ..."
    annFor: 4.5,
    vanGone: 128,         // the van is off the right of the road picture by now
    // PART 5 - Meanwhile, Enda was totally fine
    zoomEnda: 127,        // zoom in on Enda...
    zoomFor: 2.6,         // ...taking this long
    frog: 130,            // swap to the big Enda + his frog thought
    meanwhile: 131.5,     // "Meanwhile, Enda was totally fine."
    frogLine: 134,        // Enda: "I'm like a frog in boiling water!"
    frogFor: 3,
    note: 137.5,          // the editor's note pops up
    // PART 6 - Le Services
    later3: 147.5,        // "FIVE MINUTES LATER"
    shop: 151.5,          // the shop, "LE SERVICES"
    walkIn: 152.5,        // the potatoes bop in...
    walkFor: 3,           // ...taking this long
    ask: 156.5,           // "Un Pizza plz?"
    askFor: 2.5,
    erupt: 164,           // "WHAT?!"
    fadeOut: 172,
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
      for (const key of ["tb_later", "tb_booth", "tb_inside", "tb_frame1", "tb_frame2", "tb_frame3"]) pic(key, key + ".jpg");
      pic("et_town", "et_town.jpg");
      for (const key of ["sv_four", "sv_two", "sv_road", "fg_frog", "ls_later", "ls_shop"]) pic(key, key + ".jpg");
      for (const key of ["ls_shout", "ls_calm", "ls_pots", "ls_mouth_l", "ls_mouth_r", "ls_pizza", "ls_what",
                         "ls_slice1", "ls_slice2"]) pic(key, key + ".png");
      for (const key of ["fg_mouth", "fg_wheel", "fg_meanwhile", "fg_line"]) pic(key, key + ".png");
      for (const key of ["sv_mouth_rosie", "sv_mouth_enda", "sv_wheel_a", "sv_dvt", "sv_foot", "sv_mouth_ann",
                         "sv_wheel_b", "sv_break", "sv_van"])
        pic(key, key + ".png");
      for (const key of ["et_pink", "et_blue", "et_red", "fd_bus"]) pic(key, key + ".png");
      for (const key of ["tb_arm", "tb_ticket", "tb_hand", "tb_van", "tb_mouth_mid", "tb_mouth_enda", "tb_wheel_iv",
                         "tb_strict", "tb_ohshit", "tb_delirious", "tb_mouth_q", "tb_wheel_1", "tb_say_q", "tb_mouth_r",
                         "tb_say_r", "tb_wheel_3", "tb_brow_l", "tb_dots"])
        pic(key, key + ".png");
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

    // Talking: the mouth stretches open and shut for 'secs' (only ever
    // BIGGER than the drawing, so it always covers it), with 8-bit chatter.
    talk(mouth, secs, pitch) {
      mouth.setOrigin(0.5, 0.3);
      const flaps = Math.round(secs * 1000 / 220);
      this.tweens.add({ targets: mouth, scaleY: 1.7, scaleX: 1.1, duration: 110, ease: "Sine.easeInOut",
                        yoyo: true, repeat: flaps - 1 });
      FinalSounds.chatter(secs, pitch);
    }

    // A picture from layout.js with its middle as its handle (so it can
    // stretch or turn round its middle) - it doesn't move
    middled(key) {
      const img = this.placed(key);
      return img.setOrigin(0.5).setPosition(img.x + img.width / 2, img.y + img.height / 2);
    }

    // Words pop up
    pop(key) {
      const words = this.middled(key);
      this.tweens.add({ targets: words, scale: { from: 0.4, to: 1 }, alpha: { from: 0, to: 1 }, duration: 300,
                        ease: "Back.easeOut" });
      return words;
    }

    // A steering wheel turning left and right
    steer(key) {
      const wheel = this.middled(key);
      this.tweens.add({ targets: wheel, angle: { from: -25, to: 25 }, duration: 900, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
      return wheel;
    }

    start() {
      const cam = this.cameras.main;
      this.loops = [];

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

      // ---- PART 2: the toll booth ----
      this.at(TIMES.later2 - 1, () => {
        FinalSounds.valkyriesOff(1);
        FinalSounds.engineOff(1);
        cam.fadeOut(900, 0, 0, 0);
      });
      this.at(TIMES.later2, () => { this.cut(); this.showTollBooth(); });
      this.at(TIMES.inside - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.inside, () => { this.cut(); this.showInside(); });
      this.at(TIMES.rhianna - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.rhianna, () => { this.cut(); this.showFrames(); });
      this.at(TIMES.convoy - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.convoy, () => { this.cut(); this.showConvoy(); });
      this.at(TIMES.dvt - 0.8, () => { FinalSounds.valkyriesOff(0.8); cam.fadeOut(700, 0, 0, 0); });
      this.at(TIMES.dvt, () => { this.cut(); this.showServices(); });
      this.at(TIMES.zoomEnda, () => this.zoomOnEnda());
      this.at(TIMES.frog, () => { this.cut(); this.showFrog(); });
      this.at(TIMES.later3 - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.later3, () => { this.cut(); this.showLater3(); });
      this.at(TIMES.shop - 0.6, () => cam.fadeOut(500, 0, 0, 0));
      this.at(TIMES.shop, () => { this.cut(); this.showShop(); });

      // ---- the end ----
      this.at(TIMES.fadeOut, () => {
        FinalSounds.pastoralOff(2.5);
        FinalSounds.valkyriesOff(2.5);
        cam.fadeOut(2500, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => {
          if (window.PLAY_ALL) this.scene.start("fiery");     // "Play all": on to episode 11
          else showEnd();                                     // in index.html
        });
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

    // =====================================================================
    //  PART 2 - THE TOLL BOOTH
    // =====================================================================
    showTollBooth() {
      const t0 = TIMES.later2;                            // this part's start
      const cam = this.cameras.main;
      FinalSounds.pastoral(TIMES.fadeOut - t0 + 3);       // happy and carefree again
      const later = this.placed("tb_later");

      // fade to the toll booth
      this.at(TIMES.booth - t0 - 0.6, () => cam.fadeOut(500, 0xf4, 0xea, 0xac));
      this.at(TIMES.booth - t0, () => {
        later.destroy();
        cam.fadeIn(500, 0xf4, 0xea, 0xac);
        const box = L.tb_booth;
        this.placed("tb_booth");
        // everything that moves is only seen inside the picture (a "mask")
        const shape = this.make.graphics({ add: false });
        shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
        const inside = shape.createGeometryMask();

        // the ticket (hidden until it pops out) and the hand (hidden
        // inside the van until it reaches out) - both BEHIND the van
        const ticket = this.middled("tb_ticket").setScale(0).setMask(inside);
        const hand = this.placed("tb_hand").setMask(inside);
        const handX = hand.x;
        hand.x += 130;                                    // tucked inside the van
        // the van: starts off the right-hand side
        const van = this.placed("tb_van").setMask(inside);
        const vanX = van.x;
        van.x = box.x + box.w + 20;
        hand.setVisible(false);
        // the barrier, turning round its end at the booth. It's drawn UP;
        // we start it DOWN (turned 17 degrees), across the front of the van
        const arm = this.placed("tb_arm");
        const [px, py] = L.tb_pivot;
        arm.setOrigin((px - arm.x) / arm.width, (py - arm.y) / arm.height).setPosition(px, py);
        arm.angle = 17;

        // the van bops in and stops at the booth
        const bop = this.tweens.add({ targets: van, y: van.y - 6, duration: 130, yoyo: true, repeat: -1 });
        FinalSounds.engine(TIMES.vanOut2 - TIMES.booth + 4);
        this.at(TIMES.vanIn2 - TIMES.booth, () => {
          this.tweens.add({ targets: van, x: vanX, duration: (TIMES.vanStop - TIMES.vanIn2) * 1000, ease: "Sine.easeOut" });
        });

        // POP: the ticket comes out of the slot...
        this.at(TIMES.ticket - TIMES.booth, () => {
          this.tweens.add({ targets: ticket, scale: 1, duration: 350, ease: "Back.easeOut" });
          FinalSounds.pop();
        });
        // ...a hand comes out of the van, takes it, and goes back in
        this.at(TIMES.ticket - TIMES.booth + 0.6, () => {
          hand.setVisible(true);
          this.tweens.add({ targets: hand, x: handX - 35, duration: 600, ease: "Sine.easeOut" });
        });
        this.at(TIMES.ticket - TIMES.booth + 1.5, () => {
          FinalSounds.boop();
          this.tweens.add({ targets: [hand, ticket], x: "+=170", duration: 700, ease: "Sine.easeIn",
                            onComplete: () => { hand.setVisible(false); ticket.setVisible(false); } });  // (in the van now)
        });

        // the barrier goes UP (beep beep, creak)
        this.at(TIMES.raise - TIMES.booth, () => {
          FinalSounds.honk(1.4);
          FinalSounds.squeeze();
          this.tweens.add({ targets: arm, angle: -6, duration: 1000, ease: "Back.easeOut" });
        });
        // the van bops off out of the picture (to the left)
        this.at(TIMES.vanOut2 - TIMES.booth, () => {
          FinalSounds.rev();
          this.tweens.add({ targets: [van, hand, ticket], x: `-=${van.x - box.x + van.width + 40}`, duration: 3000,
                            ease: "Sine.easeIn" });
        });
      });
    }

    // Inside the van: the three front seats
    showInside() {
      const t0 = TIMES.inside;                            // this part's start
      // the picture and its moving bits go in one container, which bops along
      const panel = this.add.container(0, 0);
      panel.add(this.placed("tb_inside"));
      const midMouth = this.middled("tb_mouth_mid"), endaMouth = this.middled("tb_mouth_enda");
      panel.add([midMouth, endaMouth, this.steer("tb_wheel_iv")]);
      this.tweens.add({ targets: panel, y: -5, duration: 420, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

      this.at(TIMES.strict - t0, () => {
        panel.add(this.pop("tb_strict"));
        this.talk(midMouth, 3.5, 1.2);
      });
      this.at(TIMES.ohShit - t0, () => {
        panel.add(this.pop("tb_ohshit"));
        this.talk(endaMouth, 1.0, 0.8);
      });
      // "Delirious laughter continued." - and lots of it
      this.at(TIMES.laughter - t0, () => {
        const words = this.pop("tb_delirious");
        this.tweens.add({ targets: words, angle: { from: -2, to: 2 }, duration: 160, yoyo: true, repeat: -1 });
        FinalSounds.haha();
        this.loops.push(this.time.addEvent({ delay: 1200, loop: true, callback: () => FinalSounds.haha() }));
      });
    }

    // The three little pictures, one at a time, full screen
    showFrames() {
      const t0 = TIMES.rhianna;                           // this part's start
      // 1) "Rhianna, how are you?"
      let frame = [this.placed("tb_frame1"), this.steer("tb_wheel_1")];
      const mouthQ = this.middled("tb_mouth_q");
      frame.push(mouthQ);
      this.at(1.2, () => { frame.push(this.pop("tb_say_q")); this.talk(mouthQ, 2, 1.0); });

      // a quick swap to the next picture
      const swap = (build) => {
        this.cameras.main.flash(200, 255, 255, 255);
        frame.forEach((f) => f.destroy());
        frame = build();
      };
      // 2) Rhianna: "Reading for my life"
      this.at(TIMES.reading - t0, () => swap(() => {
        const mouthR = this.middled("tb_mouth_r");
        const f = [this.placed("tb_frame2"), mouthR];
        this.children.bringToTop(mouthR);
        this.time.delayedCall(1000, () => { f.push(this.pop("tb_say_r")); this.talk(mouthR, 2, 1.35); });
        return f;
      }));
      // 3) back to him, confused: his eyebrow goes up and down and wiggles, "..."
      this.at(TIMES.confused - t0, () => swap(() => {
        const brow = this.middled("tb_brow_l");
        const f = [this.placed("tb_frame3"), this.steer("tb_wheel_3"), brow];
        this.children.bringToTop(brow);
        this.tweens.add({ targets: brow, y: brow.y - 14, duration: 350, ease: "Sine.easeInOut", yoyo: true,
                          repeat: -1, repeatDelay: 300 });
        this.tweens.add({ targets: brow, angle: { from: -10, to: 12 }, duration: 260, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });
        // "..." one dot at a time
        const dots = this.placed("tb_dots");
        f.push(dots);
        const shown = { w: 0 };
        dots.setCrop(0, 0, 0, dots.height);
        this.tweens.add({ targets: shown, w: dots.width, duration: 1800, delay: 800, ease: "Stepped",
                          easeParams: [3], onUpdate: () => dots.setCrop(0, 0, shown.w, dots.height) });
        FinalSounds.worry();
        return f;
      }));
    }

    // =====================================================================
    //  PART 3 - EURO TRUCK SIMULATOR: a never-ending stream of lorries
    // =====================================================================
    showConvoy() {
      const t0 = TIMES.convoy;                            // this part's start
      const box = L.et_town;
      this.placed("et_town");
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();        // (only seen inside the picture)

      // The lorries take turns: blue, red, pink, blue, red, pink...
      const kinds = ["et_blue", "et_red", "et_pink"];
      let next = 0;
      const lorries = [];
      const SLOW = 85;                                    // pixels a second
      const SPACE = 60;                                   // gap between one lorry and the next
      const lane = L.et_lane;                             // where the wheels touch the road
      const addLorry = (x) => {
        const key = kinds[next++ % kinds.length];
        const img = this.add.image(x, lane, key).setOrigin(0, 1).setMask(inside);
        img.bop = Math.random() * 6;                      // (each bops a bit differently)
        lorries.push(img);
        return img;
      };
      // start with the road already full of lorries
      let x = box.x + box.w;
      while (x > box.x - 300) {
        const lorry = addLorry(0);
        x -= lorry.width + SPACE;
        lorry.x = x;
      }

      // every frame: move them all along; when one has gone off the right,
      // throw it away; when there's room on the left, bring in a new one
      this.onTick = (now, dt) => {
        for (const lorry of lorries) {
          lorry.x += SLOW * dt;
          lorry.y = lane - Math.abs(Math.sin(now * 7 + lorry.bop)) * 4;     // bop bop bop
        }
        while (lorries.length && lorries[0].x > box.x + box.w) lorries.shift().destroy();
        const last = lorries[lorries.length - 1];
        if (!last || last.x > box.x - 200) {
          const lorry = addLorry(0);
          lorry.x = (last ? last.x : box.x) - lorry.width - SPACE;
        }
        if (this.bus) this.bus.y = lane + 40 - Math.abs(Math.sin(now * 14)) * 5;
      };
      // beep beep! now and then
      this.loops.push(this.time.addEvent({ delay: 1700, loop: true, callback: () => {
        FinalSounds.honk(1.3);
        this.time.delayedCall(220, () => FinalSounds.honk(1.3));
      } }));

      // ---- our van SPEEDS across, in front, left to right ----
      this.at(TIMES.zoom - t0, () => {
        FinalSounds.pastoralOff(1);
        FinalSounds.valkyries(TIMES.dvt - TIMES.zoom + 1);
        const bus = this.add.image(box.x - 300, lane + 40, "fd_bus").setOrigin(0.5, 1).setScale(0.5).setMask(inside);
        this.bus = bus;
        this.tweens.add({ targets: bus, x: box.x + box.w + 300, duration: (TIMES.zoomGone - TIMES.zoom) * 1000,
                          ease: "Sine.easeIn" });
        FinalSounds.whoosh();
        FinalSounds.rev();
        // dust puffs behind it
        const dust = this.time.addEvent({ delay: 70, loop: true, callback: () => {
          const puff = this.add.circle(bus.x - bus.displayWidth / 2, bus.y - 12, 8 + Math.random() * 10, 0xd8cfa0)
            .setAlpha(0.8).setMask(inside);
          this.tweens.add({ targets: puff, x: puff.x - 60, y: puff.y - 25, scale: 2, alpha: 0, duration: 600,
                            onComplete: () => puff.destroy() });
        } });
        this.loops.push(dust);
        this.at(TIMES.zoomGone - TIMES.zoom + 0.3, () => dust.remove());
      });
    }

    // =====================================================================
    //  PART 4 - "WE'LL ALL GET DVT!": inside the van (top half of the
    //  screen) and the van on the road (bottom half)
    // =====================================================================

    // A mouth, ready to talk: its handle is near its top (so it opens
    // DOWNWARDS) and it sits exactly where it was drawn
    mouthAt(key) {
      const m = this.placed(key);
      return m.setOrigin(0.5, 0.3).setPosition(m.x + m.width / 2, m.y + m.height * 0.3);
    }

    // Words that write themselves in, top line first, over 'secs'
    // ("setCrop" shows just the top part of a picture, and we let more and
    //  more of it show)
    writeIn(key, secs) {
      const words = this.placed(key);
      const shown = { h: 0 };
      words.setCrop(0, 0, words.width, 0);
      this.tweens.add({ targets: shown, h: words.height, duration: secs * 1000,
                        onUpdate: () => words.setCrop(0, 0, words.width, shown.h) });
      return words;
    }

    showServices() {
      const t0 = TIMES.dvt;                               // this part's start
      FinalSounds.pastoral(TIMES.fadeOut - t0 + 3);       // happy and carefree

      // ---- BOTTOM: the road, and our van bopping along it ----
      const road = L.sv_road;
      this.placed("sv_road");
      const shape = this.make.graphics({ add: false });   // the van is only seen inside the picture
      shape.fillStyle(0xffffff).fillRect(road.x, road.y, road.w, road.h);
      const van = this.placed("sv_van").setMask(shape.createGeometryMask());
      // bop: a little hop up and down, over and over...
      this.tweens.add({ targets: van, y: van.y - 4, duration: 260, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      // ...while it trundles to the right, and off the end of the picture
      this.tweens.add({ targets: van, x: road.x + road.w + 10, duration: (TIMES.vanGone - t0) * 1000,
                        ease: "Sine.easeIn" });

      // ---- TOP: inside the van, the four potatoes. Everything in one
      //      "container" so the whole picture bops along together ----
      let panel = this.add.container(0, 0);
      const rosie = this.mouthAt("sv_mouth_rosie"), enda = this.mouthAt("sv_mouth_enda");
      panel.add([this.placed("sv_four"), rosie, enda, this.steer("sv_wheel_a")]);
      this.tweens.add({ targets: panel, y: -5, duration: 420, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

      // Rosie: "We'll all get DVT!"
      this.at(TIMES.rosie - t0, () => {
        panel.add(this.pop("sv_dvt"));
        this.talk(rosie, TIMES.rosieFor, 1.3);
      });
      // Enda: "My foot will be frozen on the accelerator!" (it writes in as he says it)
      this.at(TIMES.enda - t0, () => {
        panel.add(this.writeIn("sv_foot", TIMES.endaFor));
        this.talk(enda, TIMES.endaFor, 0.8);
      });

      // ---- the next little panel: Annelisa and Enda ----
      this.at(TIMES.ann - t0, () => {
        this.cameras.main.flash(200, 255, 255, 255);
        panel.destroy();                                  // (takes everything in it too)
        panel = this.add.container(0, 0);
        const ann = this.mouthAt("sv_mouth_ann");
        panel.add([this.placed("sv_two"), ann, this.steer("sv_wheel_b")]);
        this.tweens.add({ targets: panel, y: -5, duration: 420, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
        // "Do you need a break? After all the running people over, bashing the car up?..."
        this.at(TIMES.annTalk - TIMES.ann, () => {
          panel.add(this.writeIn("sv_break", TIMES.annFor));
          this.talk(ann, TIMES.annFor, 1.1);
        });
      });
    }

    // =====================================================================
    //  PART 5 - "MEANWHILE, ENDA WAS TOTALLY FINE."
    // =====================================================================

    // Zoom the camera in on little Enda (top right of the picture) until
    // his face is exactly where - and as big as - the big Enda's face will
    // be in the next picture. Then the swap is seamless.
    zoomOnEnda() {
      const cam = this.cameras.main;
      const [a1, b1, a2, b2] = L.sv_face;          // little Enda's face (left, top, right, bottom)
      const [c1, d1, c2, d2] = L.fg_face;          // big Enda's face
      const zoom = (c2 - c1) / (a2 - a1);          // how much bigger he needs to be
      // The camera looks at a point (its middle). We pick the point that
      // puts little Enda's face where big Enda's face will be:
      const midX = (a1 + a2) / 2 - ((c1 + c2) / 2 - W / 2) / zoom;
      const midY = (b1 + b2) / 2 - ((d1 + d2) / 2 - H / 2) / zoom;
      cam.pan(midX, midY, TIMES.zoomFor * 1000, "Cubic.easeInOut");
      cam.zoomTo(zoom, TIMES.zoomFor * 1000, "Cubic.easeInOut");
    }

    showFrog() {
      const t0 = TIMES.frog;                              // this part's start
      const cam = this.cameras.main;
      cam.setZoom(1).centerOn(W / 2, H / 2);              // camera back to normal...
      cam.resetFX();
      cam.flash(350, 255, 255, 255);                      // ...with a dreamy white flash
      FinalSounds.boing();

      this.placed("fg_frog");
      const mouth = this.mouthAt("fg_mouth");
      this.steer("fg_wheel");

      // ---- bubbles rise out of the pot, over and over ----
      const [px, py] = L.fg_pot;
      this.loops.push(this.time.addEvent({ delay: 260, loop: true, callback: () => {
        const b = this.add.circle(px + (Math.random() - 0.5) * L.fg_potw * 0.8, py, 4 + Math.random() * 7, 0x6cc4e8)
          .setStrokeStyle(2, 0x2a6f9a);
        this.tweens.add({ targets: b, y: py - 70 - Math.random() * 60, x: b.x + (Math.random() - 0.5) * 30,
                          alpha: { from: 1, to: 0 }, duration: 1300, ease: "Sine.easeOut",
                          onComplete: () => b.destroy() });
      } }));

      // ---- sweat drips down his face (new drops, over and over) ----
      this.loops.push(this.time.addEvent({ delay: 700, loop: true, callback: () => {
        const [dx, dy] = Phaser.Utils.Array.GetRandom(L.fg_drops);
        const drop = this.add.ellipse(dx, dy, 9, 14, 0x5fc0dc).setStrokeStyle(1.5, 0x2a6f9a);
        this.tweens.add({ targets: drop, y: dy + 70, alpha: { from: 1, to: 0 }, duration: 1500, ease: "Quad.easeIn",
                          onComplete: () => drop.destroy() });
      } }));

      // ---- "Meanwhile, Enda was totally fine." ----
      this.at(TIMES.meanwhile - t0, () => {
        const words = this.placed("fg_meanwhile").setAlpha(0);
        this.tweens.add({ targets: words, alpha: 1, duration: 900 });
      });

      // ---- Enda: "I'm like a frog in boiling water!" ----
      this.at(TIMES.frogLine - t0, () => {
        this.pop("fg_line");
        this.talk(mouth, TIMES.frogFor, 0.8);
      });

      // ---- the EDITOR'S NOTE pops up ----
      this.at(TIMES.note - t0, () => this.editorsNote());
    }

    // A "toast": a little card that pops up with a note from the editor
    editorsNote() {
      const x = 930, y = 545, w = 660, h = 300;           // its middle, and its size
      const card = this.add.container(x, y);
      const shadow = this.add.graphics().fillStyle(0x000000, 0.25).fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w, h, 18);
      const back = this.add.graphics().fillStyle(0xfffbe6).fillRoundedRect(-w / 2, -h / 2, w, h, 18)
        .lineStyle(4, 0x1c1a18).strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
      const title = this.add.text(-w / 2 + 22, -h / 2 + 16, "✎ EDITOR'S NOTE",
        { fontFamily: "Arial Black, Arial, sans-serif", fontSize: "28px", color: "#c0392b" });
      const note = this.add.text(-w / 2 + 22, -h / 2 + 62,
        "* Theory suggests that if you place a frog in water and boil the water slowly, " +
        "the frog will not notice and will carry on as usual. This is NOT a recommendation " +
        "for a French cooking technique, but a philosophical view on how well we can endure " +
        "a slow build-up of stress.",
        { fontFamily: "Arial, sans-serif", fontSize: "24px", color: "#1c1a18", lineSpacing: 5,
          wordWrap: { width: w - 44 } });
      card.add([shadow, back, title, note]);
      // it pops in, with a bounce (and a ta-da!)
      this.tweens.add({ targets: card, scale: { from: 0.2, to: 1 }, alpha: { from: 0, to: 1 }, duration: 450,
                        ease: "Back.easeOut" });
      FinalSounds.tada();
    }

    // =====================================================================
    //  PART 6 - LE SERVICES: "Un Pizza plz?"  "WHAT?!"
    // =====================================================================

    // "FIVE MINUTES LATER", big, creeping slowly closer
    showLater3() {
      const card = this.middled("ls_later");
      this.tweens.add({ targets: card, scale: { from: 1, to: 1.12 }, duration: (TIMES.shop - TIMES.later3) * 1000 });
    }

    showShop() {
      const t0 = TIMES.shop;                              // this part's start
      const box = L.ls_shop;

      // ---- the title, at the top ----
      const title = this.add.text(W / 2, 58, "LE SERVICES",
        { fontFamily: "Arial Black, Arial, sans-serif", fontSize: "64px", color: "#ffe81f",
          stroke: "#1c1a18", strokeThickness: 10 }).setOrigin(0.5);
      this.tweens.add({ targets: title, scale: { from: 0.3, to: 1 }, alpha: { from: 0, to: 1 }, duration: 600,
                        ease: "Back.easeOut" });

      // ---- the empty shop, and the shopkeeper (calm, for now) ----
      this.placed("ls_shop");
      const calm = this.placed("ls_calm");
      const shout = this.placed("ls_shout").setVisible(false);
      const keeper = this.add.container(0, 0, [calm, shout]);   // (so both faces bounce together)
      // she breathes gently while she waits
      const idle = this.tweens.add({ targets: keeper, y: -3, duration: 900, ease: "Sine.easeInOut", yoyo: true,
                                     repeat: -1 });

      // ---- the two potatoes bop in from the left (only seen inside the
      //      picture: a "mask") ----
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const pots = this.add.container(-700, 0).setMask(shape.createGeometryMask());
      const left = this.mouthAt("ls_mouth_l"), right = this.mouthAt("ls_mouth_r");
      pots.add([this.placed("ls_pots"), left, right]);
      this.at(TIMES.walkIn - t0, () => {
        this.tweens.add({ targets: pots, x: 0, duration: TIMES.walkFor * 1000, ease: "Sine.easeOut" });
        // bop, bop, bop as they walk... then a happy little bop now and then
        this.tweens.add({ targets: pots, y: -12, duration: 200, ease: "Sine.easeInOut", yoyo: true,
                          repeat: Math.round(TIMES.walkFor * 1000 / 400) - 1,
                          onComplete: () => this.tweens.add({ targets: pots, y: -5, duration: 400, yoyo: true,
                                                              repeat: -1, repeatDelay: 600 }) });
      });

      // ---- "Un Pizza plz?" - both of them, at once ----
      this.at(TIMES.ask - t0, () => {
        this.pop("ls_pizza");
        this.talk(left, TIMES.askFor, 1.25);
        this.talk(right, TIMES.askFor, 1.0);
      });

      // ---- she ERUPTS ----
      this.at(TIMES.erupt - t0, () => {
        FinalSounds.pastoralOff(0.05);                    // the music stops dead
        idle.stop();
        calm.setVisible(false);
        shout.setVisible(true);                           // the shouting face
        FinalSounds.sting();
        FinalSounds.scream();                             // "WHAT?!"
        this.cameras.main.shake(700, 0.02);               // the whole screen shakes
        // she jumps up and bounces down, three times
        keeper.y = 0;
        this.tweens.add({ targets: keeper, y: -55, duration: 220, ease: "Quad.easeOut", yoyo: true, repeat: 2 });
        // "WHAT?!" bursts out, and keeps trembling
        const what = this.middled("ls_what");
        this.tweens.add({ targets: what, scale: { from: 0.2, to: 1 }, duration: 380, ease: "Back.easeOut" });
        this.tweens.add({ targets: what, angle: { from: -2.5, to: 2.5 }, duration: 90, yoyo: true, repeat: -1 });
        // pizza slices fly out of her, spinning, and land where they're drawn
        const [hx, hy] = this.centreOf("ls_shout");
        for (const [key, turns] of [["ls_slice1", -2], ["ls_slice2", 2]]) {
          const slice = this.middled(key);
          this.tweens.add({ targets: slice, x: { from: hx, to: slice.x }, y: { from: hy, to: slice.y },
                            angle: { from: 360 * turns, to: 0 }, scale: { from: 0.3, to: 1 }, duration: 800,
                            ease: "Cubic.easeOut" });
        }
        // and the potatoes jump in fright
        this.tweens.killTweensOf(pots);
        this.tweens.add({ targets: pots, y: -30, x: -25, duration: 160, ease: "Quad.easeOut", yoyo: true });
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

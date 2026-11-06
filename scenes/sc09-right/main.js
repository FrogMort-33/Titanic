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
//
//   PANEL 6 - THE NAVIGATION AWARD  (IMG-046)
//   98    Full screen: "2022's Navigation Award goes to Annelisa
//         Christensen!" Fanfare and confetti. Hold...
//  103    ...then it shrinks away into the top right corner.
//
//   PANEL 7 - THE WRONG ROAD  (IMG-047, IMG-048, IMG-049, IMG-050)
//  104.5  Top left: the inside of the van - the 4 potatoes happily
//         bopping along, Enda's wheel turning.
//  108    The back seat: "I think we need to go down that lane" (her mouth
//         moves, with 8-bit chatter)... pause...
//  112    The middle seat: "Do we? I don't know". Hold for 5...
//  119.5  The second drawing: the back seat, eyes wide: "I think we do"...
//  123.5  ...the middle seat: "Hold on"
//  126.5  The bottom panel appears: the two roads, the skull sign, the fire.
//         The Ride of the Valkyries starts...
//  128    ...and the pink van comes in from the RIGHT and speeds along the
//         wrong road, off the left-hand side.
//  132.5  Zoom in on the skull and crossbones (dun-dun!). Hold...
//  136.5  ...back out.
//  138    Top panel: "Yeah, we do" (everyone in their new poses).
//  142    Bottom panel: the big pink van, LAUGHING, jogging on the spot,
//         HA HA HA all round it. (Still the Valkyries.)
//
//   PANEL 8 - MEANWHILE... THE GREEN CAR  (IMG-051 to IMG-054)
//  148    "Meanwhile". Left: the two green potatoes bopping along, driving
//         (no words yet). Right: their green car bops DOWN the motorway.
//  153    "Madam, shall we drive through this motorway?"...
//  157    ..."ye". The driver locks the wheel round into a veer...
//  158.8  ...the pink van comes UP the motorway from the bottom...
//  160    ...and the green car cuts right across in front of it ("le
//         danger") and off the right-hand side.
//  160.8  Below: everyone in the pink van SCREAMING (lots of screams).
//  167    New panels. Left: Joe, squeezing his bag. Right: Enda driving
//         (sweat dripping, eyes spinning, wheel turning).
//  169    Under Joe: "Joe squeezed his bag so hard, he left claw marks."
//  171    Under Enda: "Meanwhile, Enda was totally fine."
//  173    Zoom in on the bag...
//  175    ...R.I.P. (it wobbles; wah wah wah waaah)
//  178    Underneath: Tasha at her side window...
//  179.5  ...looking from left to right in disbelief, following the car.
//         The Valkyries play all the way through.
//  189    Fade out. THE END of episode 9.
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
    award: 98,            // the navigation award, full screen
    awardShrink: 103,     // ...shrinks into the top right
    potatoes: 104.5,      // top panel: the 4 potatoes bopping along
    lane1: 108,           // back seat: "I think we need to go down that lane"
    lane2: 112,           // middle seat: "Do we? I don't know"
    doWe: 119.5,          // 2nd drawing - back seat: "I think we do"
    holdOn: 123.5,        // middle seat: "Hold on"
    reveal: 126.5,        // bottom panel: the roads (and the Valkyries)
    vanIn: 128,           // the pink van comes in from the right...
    vanOut: 131.5,        // ...and is off the left-hand side by now
    skull: 132.5,         // zoom in on the skull and crossbones
    skullOut: 136.5,      // zoom back out
    yeah: 138,            // top panel: "Yeah, we do"
    laugh: 142,           // bottom panel: the laughing van
    meanwhile: 148,       // "Meanwhile": the green potatoes and their car
    greenTalk: 153,       // "Madam, shall we drive through this motorway?"
    ye: 157,              // "ye"
    veer: 158.3,          // the wheel locks round
    vanUp: 158.8,         // the pink van comes up the motorway
    cutAcross: 160,       // the green car cuts across and away
    screams: 160.8,       // everyone in the van screaming
    joe: 167,             // Joe and his bag / Enda driving
    joeText: 169,
    endaText: 171,
    bagZoom: 173,         // zoom in on the bag...
    rip: 175,             // ...R.I.P.
    tasha: 178,           // Tasha at her window
    look: 179.5,          // ...looks from left to right
    fadeOut: 189,
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
      // the award and the wrong road
      for (const key of ["nv_van1", "nv_van2", "nv_van3", "nv_road", "nv_laugh"]) pic(key, key + ".jpg");
      for (const n of [1, 2, 3])
        for (const part of ["rear", "left", "mid", "enda", "wheel", "mouth_mid"]) pic("nv_" + part + n, "nv_" + part + n + ".png");
      for (const key of ["gc_left", "gc_right", "gc_scream", "gc_joe", "gc_rip", "gc_enda", "gc_window"])
        pic(key, key + ".jpg");
      for (const key of ["gc_meanwhile", "gc_madam", "gc_driver", "gc_mouth_madam", "gc_mouth_driver", "gc_wheel",
                         "gc_say1", "gc_say2", "gc_car", "gc_arcs", "gc_danger", "gc_pink", "gc_pinklines", "gc_bag",
                         "gc_sweat1", "gc_sweat2", "gc_sweat3", "gc_sweat4", "gc_eye_l", "gc_eye_r", "gc_ewheel",
                         "gc_joetext", "gc_endatext", "gc_tasha1", "gc_tasha2"])
        pic(key, key + ".png");
      for (const key of ["nv_award", "nv_mouth_rear1", "nv_mouth_rear2", "nv_say1", "nv_say2", "nv_say3", "nv_say4",
                         "nv_say5", "nv_pink", "nv_speed", "nv_fire", "nv_hahavan", "nv_haspeed", "nv_ha"])
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
      this.at(TIMES.award - 0.6, () => { RightSounds.pastoralOff(0.6); this.cameras.main.fadeOut(500, 0, 0, 0); });
      this.at(TIMES.award, () => { this.cut(); this.showAward(); });
      this.at(TIMES.meanwhile - 0.6, () => this.cameras.main.fadeOut(500, 0, 0, 0));
      this.at(TIMES.meanwhile, () => { this.cut(); this.showMeanwhile(); });
      this.at(TIMES.joe - 0.5, () => this.cameras.main.fadeOut(400, 0, 0, 0));
      this.at(TIMES.joe, () => { this.cut(); this.showJoe(); });
      this.at(TIMES.fadeOut, () => {
        RightSounds.valkyriesOff(2.5);
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
      RightSounds.engine(TIMES.wash - t0 + 1);
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
      RightSounds.pastoral(TIMES.award - t0 + 1);           // the happy tune again

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
    // =====================================================================
    //  PANEL 6 - THE NAVIGATION AWARD
    // =====================================================================
    showAward() {
      const t0 = TIMES.award;                             // this part's start
      this.cameras.main.setBackgroundColor(PAPER);
      // The award card: the words (lifted from the book) on a gold card.
      // Everything goes in one "container", so it can all shrink together.
      const words = this.add.image(0, 0, "nv_award");
      const cw = words.width + 90, ch = words.height + 70;
      const shadow = this.add.rectangle(12, 14, cw, ch, 0x000000, 0.25);
      const card = this.add.rectangle(0, 0, cw, ch, 0xf7d64a).setStrokeStyle(8, 0x1c1a18);
      const inner = this.add.rectangle(0, 0, cw - 34, ch - 34).setStrokeStyle(3, 0x1c1a18);
      const award = this.add.container(W / 2, H / 2, [shadow, card, inner, words]).setScale(0.95);
      this.tweens.add({ targets: award, scale: 1.05, duration: 500, ease: "Back.easeOut" });   // (fits the screen)
      RightSounds.fanfare();

      // confetti: little coloured paper bits tumbling down the screen
      const colours = [0xe84a5f, 0x2a9d8f, 0xf4a261, 0x6a4c93, 0x1d70b8, 0xffffff];
      for (let i = 0; i < 70; i++) {
        const bit = this.add.rectangle(Math.random() * W, -20 - Math.random() * 400, 10, 16,
                                       Phaser.Utils.Array.GetRandom(colours));
        this.tweens.add({ targets: bit, y: H + 40, angle: 360 * (Math.random() < 0.5 ? 2 : -2),
                          x: bit.x + (Math.random() - 0.5) * 160,
                          duration: 2600 + Math.random() * 2000, delay: Math.random() * 1500,
                          onComplete: () => bit.destroy() });
      }

      // ...then it shrinks away into the top right corner, and the van
      // interior panel comes in on the left
      this.at(TIMES.awardShrink - t0, () => {
        this.tweens.add({ targets: award, x: 935, y: 220, scale: 0.5, duration: 1300, ease: "Cubic.easeInOut" });
      });
      this.at(TIMES.potatoes - t0, () => this.showLane());
    }

    // =====================================================================
    //  PANEL 7 - THE WRONG ROAD
    // =====================================================================

    // One seat (with its potato) that bops along. 'extras' are other
    // pictures that must move WITH it (a mouth, the steering wheel).
    // We put them all in a "container" whose middle is the bottom of the
    // seat, so the seat rocks from its base.
    bopSeat(key, speed, lean, extras = []) {
      const s = L[key];
      const tex = this.textures.get(key).getSourceImage();
      const bx = s.x + tex.width / 2, by = s.y + tex.height;     // bottom middle of the seat
      const box = this.add.container(bx, by);
      box.add(this.add.image(0, 0, key).setOrigin(0.5, 1));
      box.parts = {};
      for (const k of extras) {
        const e = L[k];
        const img = this.add.image(0, 0, k);
        if (e.cx) {
          // the steering wheel turns round its own middle
          img.setOrigin((e.cx - e.x) / img.width, (e.cy - e.y) / img.height).setPosition(e.cx - bx, e.cy - by);
          this.tweens.add({ targets: img, angle: { from: -22, to: 22 }, duration: 900, ease: "Sine.easeInOut",
                            yoyo: true, repeat: -1 });
        } else {
          // a mouth: its pivot is near its top, so it opens DOWNWARDS
          img.setOrigin(0.5, 0.3).setPosition(e.x + img.width / 2 - bx, e.y + img.height * 0.3 - by);
        }
        box.add(img);
        box.parts[k] = img;
      }
      this.tweens.add({ targets: box, y: by - 7, duration: speed, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      this.tweens.add({ targets: box, angle: { from: -lean, to: lean }, duration: speed * 2,
                        ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      return box;
    }

    // One version of the van interior (n = 1, 2 or 3): the plain panel,
    // then the 4 seats, back seat first (so the front seats are in front)
    potatoPanel(n) {
      const group = this.add.container(0, 0);
      group.add(this.placed("nv_van" + n));
      const seats = {};
      seats.rear = this.bopSeat("nv_rear" + n, 430, 2, n < 3 ? ["nv_mouth_rear" + n] : []);
      seats.left = this.bopSeat("nv_left" + n, 380, 2.5);
      seats.mid = this.bopSeat("nv_mid" + n, 410, 2, ["nv_mouth_mid" + n]);
      seats.enda = this.bopSeat("nv_enda" + n, 400, 1.5, ["nv_wheel" + n]);
      group.add([seats.rear, seats.left, seats.mid, seats.enda]);
      group.seats = seats;
      return group;
    }

    // Talking: the mouth stretches open and shut, quickly, for 'secs'
    // (it only ever gets BIGGER than the drawing, so it always covers it),
    // with 8-bit chatter. 'pitch': higher for some potatoes than others.
    talk(mouth, secs, pitch) {
      const flaps = Math.round(secs * 1000 / 220);
      this.tweens.add({ targets: mouth, scaleY: 1.8, scaleX: 1.12, duration: 110, ease: "Sine.easeInOut",
                        yoyo: true, repeat: flaps - 1 });
      RightSounds.chatter(secs, pitch);
    }

    // Words appear (a quick pop), and stay
    say(key, group) {
      const words = this.middle(this.placed(key));
      group.add(words);
      this.tweens.add({ targets: words, scale: { from: 0.4, to: 1 }, alpha: { from: 0, to: 1 }, duration: 300,
                        ease: "Back.easeOut" });
      return words;
    }

    showLane() {
      const t0 = TIMES.potatoes;                          // this part's start
      RightSounds.pastoral(TIMES.reveal - t0 + 1);          // happy again... for now

      // ---- the van interior, top left ----
      let top = this.potatoPanel(1).setAlpha(0);
      this.tweens.add({ targets: top, alpha: 1, duration: 700 });

      // the back seat: "I think we need to go down that lane"
      this.at(TIMES.lane1 - t0, () => {
        this.say("nv_say1", top);
        this.talk(top.seats.rear.parts.nv_mouth_rear1, 2.4, 1.15);
      });
      // ...pause... the middle seat: "Do we? I don't know"
      this.at(TIMES.lane2 - t0, () => {
        this.say("nv_say2", top);
        this.talk(top.seats.mid.parts.nv_mouth_mid1, 2.2, 1);
      });
      // the 2nd drawing (same place): back seat, eyes wide: "I think we do"
      this.at(TIMES.doWe - t0, () => {
        top.destroy();
        top = this.potatoPanel(2);
        this.say("nv_say3", top);
        this.talk(top.seats.rear.parts.nv_mouth_rear2, 1.6, 1.15);
      });
      // the middle seat: "Hold on"
      this.at(TIMES.holdOn - t0, () => {
        this.say("nv_say4", top);
        this.talk(top.seats.mid.parts.nv_mouth_mid2, 1.0, 1);
      });

      // ---- the bottom panel: the roads ----
      this.at(TIMES.reveal - t0, () => this.showRoad());

      // ---- "Yeah, we do" (IMG-049), in the top panel ----
      this.at(TIMES.yeah - t0, () => {
        const old = top;
        top = this.potatoPanel(3).setAlpha(0);
        this.tweens.add({ targets: top, alpha: 1, duration: 400, onComplete: () => old.destroy() });
        this.time.delayedCall(500, () => {
          this.say("nv_say5", top);
          this.talk(top.seats.mid.parts.nv_mouth_mid3, 1.4, 1);
        });
      });
    }

    // The bottom panel: the right road (with the tick) and the WRONG road
    // (skull and crossbones, fire). The pink van speeds down the wrong one.
    showRoad() {
      const t0 = TIMES.reveal;                            // this part's start
      RightSounds.pastoralOff(0.8);
      RightSounds.valkyries(TIMES.fadeOut - t0 + 3);       // all the way to the end

      const panel = this.add.container(0, 0);
      const road = this.placed("nv_road");
      const box = L.nv_road;
      // the fire flickers: it stretches up and down from its bottom
      const fire = this.placed("nv_fire");
      fire.setOrigin(0.5, 1).setPosition(fire.x + fire.width / 2, fire.y + fire.height);
      this.tweens.add({ targets: fire, scaleY: 1.18, scaleX: 1.05, duration: 160, yoyo: true, repeat: -1 });
      panel.add([road, fire]);
      // the panel slides up into place
      panel.y = 40; panel.alpha = 0;
      this.tweens.add({ targets: panel, y: 0, alpha: 1, duration: 700, ease: "Cubic.easeOut" });

      // anything in the bottom panel is only seen INSIDE it (a "mask"),
      // so the van appears from the panel's right-hand edge
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x, box.y, box.w, box.h);
      const inside = shape.createGeometryMask();

      // ---- the pink van: in from the RIGHT, off to the LEFT ----
      this.at(TIMES.vanIn - t0, () => {
        const vanPic = L.nv_pink, lines = L.nv_speed;
        const tex = this.textures.get("nv_pink").getSourceImage();
        const vx = vanPic.x + tex.width / 2, vy = vanPic.y + tex.height / 2;   // where it was drawn
        const body = this.add.image(0, 0, "nv_pink");
        const speed = this.add.image(lines.x - vx, lines.y - vy, "nv_speed").setOrigin(0);  // behind it (right)
        const van = this.add.container(box.x + box.w + 300, vy, [speed, body]).setMask(inside);
        this.jog(body, 5, 90);
        this.tweens.add({ targets: speed, alpha: 0.4, duration: 90, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: van, x: box.x - 300, duration: (TIMES.vanOut - TIMES.vanIn) * 1000, ease: "Linear" });
        RightSounds.rev();
        RightSounds.whoosh();
        // dust puffs behind it (on its right)
        const dust = this.time.addEvent({ delay: 90, loop: true, callback: () => {
          const puff = this.add.circle(van.x + tex.width / 2 + 10, vy + tex.height / 2 - 12, 8 + Math.random() * 10,
                                       0x8f897f).setAlpha(0.55).setMask(inside);
          this.tweens.add({ targets: puff, x: puff.x + 60, y: puff.y - 20, scale: 2, alpha: 0, duration: 600,
                            onComplete: () => puff.destroy() });
        } });
        this.loops.push(dust);
        this.at(TIMES.vanOut - TIMES.vanIn + 0.3, () => { dust.remove(); van.destroy(); });
      });

      // ---- zoom in on the skull and crossbones ----
      this.at(TIMES.skull - t0, () => {
        const [sx, sy] = L.nv_skull;
        this.cameras.main.pan(sx + 20, sy + 30, 1400, "Cubic.easeInOut");   // (a little below, to miss the top panel)
        this.cameras.main.zoomTo(3.2, 1400, "Cubic.easeInOut");
        this.time.delayedCall(1300, () => { RightSounds.sting(); this.cameras.main.shake(400, 0.003); });
      });
      this.at(TIMES.skullOut - t0, () => {
        this.cameras.main.pan(W / 2, H / 2, 1000, "Cubic.easeInOut");
        this.cameras.main.zoomTo(1, 1000, "Cubic.easeInOut");
      });

      // ---- the laughing van (IMG-050) ----
      this.at(TIMES.laugh - t0, () => {
        this.tweens.add({ targets: panel, alpha: 0, duration: 500, onComplete: () => panel.destroy() });
        const bg = this.placed("nv_laugh").setAlpha(0);
        // the van and its speed lines jog together, on the spot
        const v = L.nv_hahavan;
        const vt = this.textures.get("nv_hahavan").getSourceImage();
        const vx = v.x + vt.width / 2, vy = v.y + vt.height / 2;
        const body = this.add.image(0, 0, "nv_hahavan");
        const lines = this.add.image(L.nv_haspeed.x - vx, L.nv_haspeed.y - vy, "nv_haspeed").setOrigin(0);
        const van = this.add.container(vx, vy, [lines, body]).setAlpha(0);
        this.tweens.add({ targets: van, y: vy - 8, duration: 100, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
        this.tweens.add({ targets: lines, x: lines.x + 10, alpha: 0.4, duration: 100, yoyo: true, repeat: -1 });
        // all the HA HA HAs shake with laughter
        const ha = this.middle(this.placed("nv_ha")).setAlpha(0);
        this.tweens.add({ targets: ha, scale: 1.04, angle: { from: -1.5, to: 1.5 }, duration: 140, yoyo: true,
                          repeat: -1 });
        this.tweens.add({ targets: [bg, van, ha], alpha: 1, duration: 500 });
        RightSounds.haha();
        this.loops.push(this.time.addEvent({ delay: 2200, loop: true, callback: () => RightSounds.haha() }));
      });
    }

    // =====================================================================
    //  PANEL 8 - MEANWHILE... THE GREEN CAR CUTS UP THE VAN
    // =====================================================================

    // A see-through "mask" in the shape of a box: things are only seen
    // inside it (so cars appear from the panel's edge, not the page's)
    boxMask(box) {
      const shape = this.make.graphics({ add: false });
      shape.fillStyle(0xffffff).fillRect(box.x + 6, box.y + 6, box.w - 12, box.h - 12);
      return shape.createGeometryMask();
    }

    // A picture with its "middle" put somewhere else (cx, cy): handy for
    // a car whose speed lines must come with it
    carGroup(keys, cx, cy) {
      const group = this.add.container(cx, cy);
      for (const k of keys) group.add(this.add.image(L[k].x - cx, L[k].y - cy, k).setOrigin(0));
      return group;
    }

    showMeanwhile() {
      const t0 = TIMES.meanwhile;                         // this part's start
      const title = this.placed("gc_meanwhile").setAlpha(0);
      this.tweens.add({ targets: title, alpha: 1, duration: 600 });

      // ---- left mini panel: the two green potatoes, bopping along ----
      this.placed("gc_left");
      const madam = this.bopSeat("gc_madam", 400, 3, ["gc_mouth_madam"]);
      const driver = this.bopSeat("gc_driver", 440, 2, ["gc_mouth_driver", "gc_wheel"]);

      // ---- right mini panel: their green car, bopping DOWN the motorway ----
      const road = L.gc_right;
      this.placed("gc_right");
      const inside = this.boxMask(road);
      const carTex = this.textures.get("gc_car").getSourceImage();
      const carX = L.gc_car.x + carTex.width / 2, carY = L.gc_car.y + carTex.height / 2;  // where it's drawn
      const car = this.carGroup(["gc_car"], carX, carY).setMask(inside);
      car.y = road.y - 60;                                // starts above the top...
      this.tweens.add({ targets: car, y: carY, duration: 4500, ease: "Sine.easeOut" });   // ...and comes down
      const bob = this.tweens.add({ targets: car.list[0], y: car.list[0].y - 3, duration: 120, yoyo: true, repeat: -1 });
      RightSounds.engine(TIMES.screams - t0);

      // the green potatoes talk
      this.at(TIMES.greenTalk - t0, () => {
        this.say("gc_say1", this.add.container(0, 0));
        this.talk(madam.parts.gc_mouth_madam, 2.6, 1.3);
      });
      this.at(TIMES.ye - t0, () => {
        this.say("gc_say2", this.add.container(0, 0));
        this.talk(driver.parts.gc_mouth_driver, 0.5, 0.9);
      });
      // the driver locks the wheel round: VEER
      this.at(TIMES.veer - t0, () => {
        const wheel = driver.parts.gc_wheel;
        this.tweens.killTweensOf(wheel);
        this.tweens.add({ targets: wheel, angle: 85, duration: 250, ease: "Back.easeOut" });
      });

      // the pink van comes UP from the bottom, bopping along
      this.at(TIMES.vanUp - t0, () => {
        const vt = this.textures.get("gc_pink").getSourceImage();
        const vx = L.gc_pink.x + vt.width / 2, vy = L.gc_pink.y + vt.height / 2;
        const van = this.carGroup(["gc_pink", "gc_pinklines"], vx, vy).setMask(inside);
        van.y = road.y + road.h + 60;
        this.tweens.add({ targets: van, y: vy, duration: 1200, ease: "Sine.easeOut" });
        this.tweens.add({ targets: van.list[0], y: van.list[0].y - 3, duration: 110, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: van.list[1], alpha: 0.3, duration: 90, yoyo: true, repeat: -1 });
        // when the green car cuts in: the van slams its brakes (a jolt back)
        this.at(TIMES.cutAcross - TIMES.vanUp + 0.4, () => {
          this.tweens.add({ targets: van, y: vy + 25, duration: 160, yoyo: true, ease: "Quad.easeOut" });
        });
      });

      // the green car cuts across, in front of the van, and off to the right
      this.at(TIMES.cutAcross - t0, () => {
        bob.stop();
        // its swerve lines and "le danger" come with it
        car.add(this.add.image(L.gc_arcs.x - carX, L.gc_arcs.y - carY, "gc_arcs").setOrigin(0));
        const danger = this.add.image(L.gc_danger.x - carX, L.gc_danger.y - carY, "gc_danger").setOrigin(0).setScale(0);
        car.add(danger);
        this.tweens.add({ targets: danger, scale: 1, duration: 200, ease: "Back.easeOut" });
        RightSounds.screech();
        this.tweens.add({ targets: car, x: road.x + road.w + 120, y: carY + 110, angle: -40, duration: 1500,
                          ease: "Quad.easeIn" });
        this.time.delayedCall(300, () => RightSounds.honk(1.1));
      });

      // ---- below: everyone in the pink van SCREAMING ----
      this.at(TIMES.screams - t0, () => {
        const sc = this.middle(this.placed("gc_scream"));
        this.tweens.add({ targets: sc, scale: { from: 0.5, to: 1 }, duration: 300, ease: "Back.easeOut" });
        this.tweens.add({ targets: sc, x: sc.x + 5, duration: 45, yoyo: true, repeat: -1 });   // shaking with fright
        this.cameras.main.shake(700, 0.01);
        // lots of screams, one after another (each potato's a bit different)
        [[0, 1], [0.35, 1.25], [0.8, 0.85], [1.2, 1.4], [1.7, 1.1], [2.3, 0.95]].forEach(([when, pitch]) =>
          this.time.delayedCall(when * 1000, () => RightSounds.wilhelm(pitch)));
      });
    }

    // Joe and his bag (left), Enda "totally fine" (right), Tasha (below)
    showJoe() {
      const t0 = TIMES.joe;                               // this part's start

      // ---- Joe, squeezing his bag ----
      const jb = L.gc_joe;
      const bt = this.textures.get("gc_bag").getSourceImage();
      const bx = L.gc_bag.x + bt.width / 2, by = L.gc_bag.y + bt.height / 2;   // the middle of his bag
      // everything in one container, centred on the bag, so we can zoom on it
      const joe = this.add.container(bx, by);
      joe.add(this.add.image(jb.x - bx, jb.y - by, "gc_joe").setOrigin(0));
      const bag = this.add.image(0, 0, "gc_bag");
      joe.add(bag);
      joe.setMask(this.boxMask({ x: jb.x - 6, y: jb.y - 6, w: jb.w + 12, h: jb.h + 12 }));
      this.tweens.add({ targets: joe, x: bx + 2, duration: 50, yoyo: true, repeat: -1 });         // trembling
      this.tweens.add({ targets: bag, scaleX: 1.05, scaleY: 1.1, duration: 260, yoyo: true, repeat: -1 });  // SQUEEZE
      const creaks = this.time.addEvent({ delay: 520, loop: true, callback: () => RightSounds.squeeze() });
      this.loops.push(creaks);

      this.at(TIMES.joeText - t0, () => this.say("gc_joetext", this.add.container(0, 0)));
      this.at(TIMES.endaText - t0, () => this.say("gc_endatext", this.add.container(0, 0)));

      // zoom in on the bag...
      this.at(TIMES.bagZoom - t0, () => {
        this.tweens.add({ targets: joe, scale: 2.6, x: jb.x + jb.w / 2, y: jb.y + jb.h / 2, duration: 1400,
                          ease: "Cubic.easeIn" });
      });
      // ...and it's dead. R.I.P. (with a wobble)
      this.at(TIMES.rip - t0, () => {
        creaks.remove();
        joe.destroy();
        const rip = this.middle(this.placed("gc_rip"));
        rip.x = jb.x + jb.w / 2;
        this.tweens.add({ targets: rip, scale: { from: 1.4, to: 1 }, duration: 400, ease: "Back.easeOut" });
        this.tweens.add({ targets: rip, angle: { from: -6, to: 6 }, duration: 300, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });
        RightSounds.sadTrombone();
      });

      // ---- Enda, "totally fine" ----
      this.placed("gc_enda");
      const wheel = this.middle(this.placed("gc_ewheel"));
      this.tweens.add({ targets: wheel, angle: { from: -16, to: 16 }, duration: 700, ease: "Sine.easeInOut",
                        yoyo: true, repeat: -1 });
      for (const [key, dir] of [["gc_eye_l", 1], ["gc_eye_r", -1]]) {          // spinning spiral eyes
        const eye = this.middle(this.placed(key));
        this.tweens.add({ targets: eye, angle: 360 * dir, duration: 1200, repeat: -1 });
      }
      // sweat: each drop runs down, fades, and comes again
      [["gc_sweat1", 1100], ["gc_sweat2", 1300], ["gc_sweat3", 1200], ["gc_sweat4", 1000]].forEach(([key, speed]) => {
        const drop = this.placed(key);
        this.tweens.add({ targets: drop, y: drop.y + 45, alpha: { from: 1, to: 0 }, duration: speed,
                          ease: "Quad.easeIn", repeat: -1 });
      });

      // ---- Tasha at her side window ----
      this.at(TIMES.tasha - t0, () => {
        const win = this.placed("gc_window").setAlpha(0);
        const head = this.placed("gc_tasha1").setAlpha(0);
        this.tweens.add({ targets: [win, head], alpha: 1, duration: 600 });
        const h0 = head.x;
        head.x -= 25;                                     // looking back to the LEFT first
        // ...then her eyes follow the car from left to right
        this.at(TIMES.look - TIMES.tasha, () => {
          this.tweens.add({ targets: head, x: h0 + 10, duration: 1800, ease: "Sine.easeInOut" });
          this.time.delayedCall(1300, () => {
            // she turns to look RIGHT (the second drawing), still moving
            const head2 = this.placed("gc_tasha2").setAlpha(0);
            const x2 = head2.x;
            head2.x = x2 - 10;
            this.tweens.add({ targets: head2, alpha: 1, x: x2 + 10, duration: 700, ease: "Sine.easeOut" });
            this.tweens.add({ targets: head, alpha: 0, duration: 500 });
            RightSounds.worry();
            // disbelief: a little shake of the head
            this.time.delayedCall(1200, () =>
              this.tweens.add({ targets: head2, angle: { from: -3, to: 3 }, duration: 160, yoyo: true, repeat: 7 }));
          });
        });
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

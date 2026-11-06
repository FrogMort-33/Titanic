// =====================================================================
//  main.js  -  EPISODE 8 "A Close Encounter"
//              (uses IMG-030 and IMG-031)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//   PANEL 1 - OUT IN THE COUNTRY  (IMG-030, top picture)
//    0    A sunny countryside: a road running back to the horizon.
//         Happy 8-bit country music and birdsong. The birds in the top
//         left flap and swoop about.
//    1.5  Far, far away on the road: a TINY van. All through this panel
//         it comes closer - growing, rocking and sliding from side to
//         side - getting ever larger and more menacing...
//    2    ...while the green French lady happily bops in from the left,
//         across the grass, to her spot by the road.
//    6    The book's words roll up from the bottom of the screen:
//         "Up ahead! A local, going about their day in the streets of
//         Lyon! Shame the wing mirror almost knocked their head off when
//         Enda forgot the width of the new vehicle."
//   26    The van is right there, full size. Hold...
//   31    Clear the screen. A "rewind" noise...
//
//   PANEL 2 - UP AHEAD!  (IMG-031, the picture from beside the van)
//   32.5  ...the same moment, from the side: the lady bopping along on
//         the grass, as happy as ever (same happy music, of course!)
//   34    The van's side - and its wing mirror - grows in from the lower
//         left corner, closer and closer, at just the height of her head...
//   48    Full size. Hold for 5...
//   54    Fade out. (To be continued!)
//
//  STORY RULE: the van travels LEFT to RIGHT (right to left is kept for
//  its comedy retreat, later on). Here it comes towards us, which is fine.
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every episode's main.js on one page without the names clashing)

  const TIMES = {
    land: 0,
    van: 1.5,             // the van appears, tiny, on the horizon...
    vanFull: 26,          // ...and is full size by now
    ladyIn: 2,            // the lady starts bopping in from the left
    ladyHome: 12,         // ...and reaches her spot
    words: 6,             // the words roll up from the bottom
    clear: 31,            // clear the screen (rewind!)
    side: 32.5,           // the picture from the side of the van
    sideVan: 34,          // the van's side starts growing in...
    sideVanFull: 48,      // ...full size
    fadeOut: 54,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT8;         // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page

  class CloseEncounter extends Phaser.Scene {

    // Every episode needs its own name, so "Play all" can switch between them.
    constructor() { super("encounter"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      for (const key of ["cl_land", "up_blank"]) pic(key, key + ".jpg");
      for (const key of ["cl_birds2", "cl_bird1", "cl_lady", "cl_van",
                         "up_lady", "up_van", "up_words"]) pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.cameras.main.setBackgroundColor(PAPER);
      // "Play all": we arrive straight from episode 7, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    start() {
      // The happy music plays all the way through BOTH pictures
      CountrySounds.pastoral(TIMES.fadeOut + 3);
      CountrySounds.birdsong(TIMES.clear);
      this.cut();
      this.showCountry();
      this.at(TIMES.clear - 1, () => this.cameras.main.fadeOut(1000, 0, 0, 0));
      this.at(TIMES.clear, () => CountrySounds.rewind());
      this.at(TIMES.side, () => { this.cut(); this.showSide(); });
      this.at(TIMES.fadeOut, () => {
        CountrySounds.pastoralOff(2.5);
        this.cameras.main.fadeOut(2500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => showEnd());  // in index.html / play-all.html
      });
    }

    // A "cut": clear the screen for the next picture
    cut() {
      this.tweens.killAll();
      this.children.removeAll(true);
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(600);
      this.onTick = null;
    }

    // Phaser calls update() every frame (about 60 times a second). If a
    // picture has set an "onTick" job, we run it: that's how the vans
    // move smoothly in BOTH directions (growing AND swaying) at once.
    update(time) {
      if (this.onTick) this.onTick(time / 1000);
    }

    // An image at its place from layout.js
    placed(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0);
    }

    // Put a sprite's origin in its middle WITHOUT moving it
    middle(sprite) {
      return sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    }

    // A happy walk: the sprite bobs up and down and rocks from side to side
    // (a "bop" every 'beat' ms, with a little step sound), while it
    // slides from fromX to its own x over 'ms' milliseconds.
    bopAlong(sprite, fromX, ms, beat = 380) {
      const homeX = sprite.x, homeY = sprite.y;
      sprite.x = fromX;
      // the walk across
      this.tweens.add({ targets: sprite, x: homeX, duration: ms, ease: "Linear" });
      // the bop: up and back down, over and over
      const bop = this.tweens.add({ targets: sprite, y: homeY - 14, duration: beat / 2,
                                    ease: "Sine.easeOut", yoyo: true, repeat: -1 });
      // the rock: lean one way, then the other
      sprite.angle = -4;
      const rock = this.tweens.add({ targets: sprite, angle: 4, duration: beat,
                                     ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      const steps = this.time.addEvent({ delay: beat, loop: true, callback: () => CountrySounds.step() });
      // when she gets there: stop walking, but keep a happy little sway
      this.time.delayedCall(ms, () => {
        bop.stop(); rock.stop(); steps.remove();
        sprite.y = homeY; sprite.angle = 0;
        this.tweens.add({ targets: sprite, y: homeY - 6, duration: 700, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });
        this.tweens.add({ targets: sprite, angle: { from: -2, to: 2 }, duration: 1400,
                          ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      });
    }

    // =====================================================================
    //  PANEL 1 - OUT IN THE COUNTRY
    // =====================================================================
    showCountry() {
      this.add.image(0, 0, "cl_land").setOrigin(0);

      // ---- The birds: flap (squash up and down) and swoop about ----
      for (const [key, swoop] of [["cl_birds2", 2600], ["cl_bird1", 3300]]) {
        const bird = this.middle(this.placed(key));
        this.tweens.add({ targets: bird, scaleY: 0.4, duration: 220, yoyo: true, repeat: -1 });  // flap
        this.tweens.add({ targets: bird, x: bird.x + 70, duration: swoop, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });                                            // swoop
        this.tweens.add({ targets: bird, y: bird.y - 22, duration: swoop / 2, ease: "Sine.easeInOut",
                          yoyo: true, repeat: -1 });                                            // bob
      }

      // ---- The van: tiny on the horizon, growing as it comes ----
      // Its "origin" is the middle of its bottom edge (where its wheels
      // touch the road), so it always sits ON the road as it grows.
      const [vpX, vpY] = L.cl_vp, [baseX, baseY] = L.cl_van_base;
      const van = this.add.image(vpX, vpY, "cl_van").setOrigin(0.5, 1).setScale(0.02).setVisible(false);
      const startAt = TIMES.van, length = TIMES.vanFull - TIMES.van;
      let began = null;
      this.at(TIMES.van, () => { van.setVisible(true); CountrySounds.approach(length); });
      this.onTick = (now) => {
        if (!van.visible) return;
        began = began ?? now;
        // p goes from 0 to 1 over the whole approach; "near" grows slowly
        // at first and fast at the end (p squared), like something coming
        // straight at you
        const p = Math.min((now - began) / length, 1);
        const near = p * p;
        van.setScale(0.02 + 0.98 * near);
        // slide along the road from the horizon down to its spot, swaying
        // from side to side (more and more as it gets closer)...
        const sway = Math.sin(now * 2.3) * 70 * near * (1 - p * 0.6);
        van.x = vpX + (baseX - vpX) * near + sway;
        van.y = vpY + (baseY - vpY) * near;
        // ...and rocking, like it's going a bit too fast
        van.angle = Math.sin(now * 3.4) * 3 * (p < 1 ? 1 : 0.3);
      };

      // ---- The lady: bops in from the left, across the grass ----
      const lady = this.placed("cl_lady");                   // her spot (in front of the van)
      lady.setOrigin(0.5, 1).setPosition(lady.x + lady.width / 2, lady.y + lady.height);   // feet
      lady.setVisible(false);
      this.at(TIMES.ladyIn, () => {
        lady.setVisible(true);
        this.bopAlong(lady, -lady.width / 2, (TIMES.ladyHome - TIMES.ladyIn) * 1000);
      });

      // ---- The words roll up from the bottom ----
      this.at(TIMES.words, () => this.rollUpWords());
    }

    // The book's words rise up from below the screen onto a band of
    // yellow page at the bottom, and stay there.
    rollUpWords() {
      const band = this.add.rectangle(0, H, W, 10, PAPER, 0.88).setOrigin(0, 0);   // the band first...
      const words = this.add.image(W / 2, 0, "up_words").setScale(0.72);          // ...the words on top
      const bandH = words.displayHeight + 24;
      band.setSize(W, bandH);
      words.y = H + bandH / 2;
      this.tweens.add({ targets: band, y: H - bandH, duration: 2500, ease: "Sine.easeOut" });
      this.tweens.add({ targets: words, y: H - bandH / 2, duration: 2500, ease: "Sine.easeOut" });
    }

    // =====================================================================
    //  PANEL 2 - UP AHEAD! (from the side of the van)
    // =====================================================================
    showSide() {
      this.add.image(0, 0, "up_blank").setOrigin(0);

      // ---- The lady: still bopping happily along ----
      const lady = this.placed("up_lady");
      lady.setOrigin(0.5, 1).setPosition(lady.x + lady.width / 2, lady.y + lady.height);
      this.bopAlong(lady, lady.x + 260, (TIMES.sideVanFull - TIMES.side - 4) * 1000, 420);

      // ---- The van's side grows in from the lower-left corner ----
      // Its origin is its bottom-left corner, pinned near the screen's
      // bottom-left, so it swells up and out across the picture.
      const van = this.placed("up_van").setOrigin(0, 1);
      const homeX = van.x, homeY = van.y + van.height;
      van.setPosition(homeX, homeY).setScale(0.05).setVisible(false);
      const length = TIMES.sideVanFull - TIMES.sideVan;
      let began = null;
      // (this picture starts at TIMES.side, so count from then)
      this.at(TIMES.sideVan - TIMES.side, () => { van.setVisible(true); CountrySounds.approach(length); });
      this.onTick = (now) => {
        if (!van.visible) return;
        began = began ?? now;
        const p = Math.min((now - began) / length, 1);
        const near = p * p;
        van.setScale(0.05 + 0.95 * near);
        // rocking and sliding side to side as it comes, settling at the end
        const settle = 1 - p;
        van.x = homeX + Math.sin(now * 2.1) * 40 * near * settle - 30 * settle;
        van.y = homeY + Math.sin(now * 3.3) * 10 * settle;
        van.angle = Math.sin(now * 2.7) * 2.5 * settle;
        if (p === 1 && !van.shook) {             // it's arrived: a judder
          van.shook = true;
          this.cameras.main.shake(400, 0.006);
        }
      };
      // The lady stays in FRONT of the van (she's further along the road)
      lady.setDepth(1);
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this episode to the list (that page
  // starts Phaser itself, with every episode). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(CloseEncounter);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: CloseEncounter,
  });

}

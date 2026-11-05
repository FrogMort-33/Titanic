// =====================================================================
//  main.js  -  SC-03 "Flights of Fantasy Fun !"   (uses IMG-007)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//    0   The sky from the top picture of IMG-007, with just the plane
//        jogging along on the spot (speed lines behind it). Engine drone.
//    5   The words write themselves in: "Our story begins like any good
//        story, with our protagonists hurtling through a storm cloud."
//   10   THUNDER and a lightning flash: the storm cloud appears.
//        More thunder now and then (see TIMES.thunder).
//   12   The plane flies (left to right) into the storm cloud...
//   15   ...and gets thrown about inside it. Hold 5 seconds.
//   20   Fade out. (More of scene 3, IMG-008 and IMG-009, comes later.)
//
//  Change the numbers in TIMES to re-time the whole scene.
// =====================================================================

// Everything inside { } so its names stay private to this scene
// (lets several scenes share one page - see play-all.html).
{

  const TIMES = {
    title: 5,
    storm: 10,
    thunder: [10, 13, 15.5, 17.2, 19],   // every clap of thunder
    flyIn: 12,
    bumpy: 15,
    fadeOut: 20,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT3;         // sprite positions, from layout.js

  // Which things are drawn in front of which: bigger numbers in front.
  const DEPTH = { sky: 0, cloud: 1, lines: 2, plane: 3, title: 4 };


  class Flight extends Phaser.Scene {

    // Every scene needs its own name, so "Play all" can switch between them.
    constructor() { super("flight"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      pic("sky_blank", "sky_blank.jpg");
      pic("plane", "plane.png");
      pic("title", "title.png");
      pic("cloud", "cloud.png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      // "Play all": we arrive straight from scene 2, so begin at once.
      if (window.PLAY_ALL) this.showSky();
      else window.startShow = () => this.showSky();
    }

    // ---- The whole scene is one shot ------------------------------------
    showSky() {
      FlightSounds.engine();
      this.add.image(0, 0, "sky_blank").setOrigin(0);

      // The storm cloud: there all along, but invisible until the storm.
      const cloud = this.addSprite("cloud").setAlpha(0);

      // Speed lines behind the plane, then the plane itself.
      this.speedLines = this.makeSpeedLines();
      const plane = this.addSprite("plane");
      // Turn the plane round its middle (not its top-left corner)
      plane.setOrigin(0.5).setPosition(plane.x + plane.width / 2, plane.y + plane.height / 2);
      this.jog(plane, 10);

      // The words write in, left to right
      const title = this.addSprite("title");
      title.setCrop(0, 0, 0, title.height);
      this.at(TIMES.title, () => {
        const reveal = { w: 0 };
        this.tweens.add({
          targets: reveal, w: title.width, duration: 3500,
          onUpdate: () => title.setCrop(0, 0, reveal.w, title.height),
        });
      });

      // Thunder and lightning, at every time in TIMES.thunder
      for (const t of TIMES.thunder) this.at(t, () => this.lightning(cloud));

      // The storm cloud rolls in with the first thunder
      this.at(TIMES.storm, () => {
        cloud.setScale(0.85);
        this.tweens.add({ targets: cloud, alpha: 1, scale: 1, duration: 1200, ease: "Back.easeOut" });
      });

      // Fly into the cloud: right, a bit smaller (further away)
      this.at(TIMES.flyIn, () => {
        this.speedLines.remove();                  // no more speed lines
        this.tweens.killTweensOf(plane);           // stop jogging
        this.tweens.add({
          targets: plane,
          x: cloud.x + cloud.width / 2, y: cloud.y + cloud.height / 2,
          scale: 0.55, angle: 8,
          duration: (TIMES.bumpy - TIMES.flyIn) * 1000, ease: "Sine.easeIn",
        });
      });

      // Bumpy! Thrown about at random inside the cloud
      this.at(TIMES.bumpy, () => this.bumpAbout(plane, plane.x, plane.y));

      this.at(TIMES.fadeOut, () => {
        FlightSounds.engineOff(2);
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => showEnd());   // in index.html
      });
    }

    // ---- Effects --------------------------------------------------------

    // Put a cut-out sprite at its spot (from layout.js).
    addSprite(key) {
      return this.add.image(L[key].x, L[key].y, key).setOrigin(0).setDepth(DEPTH[key]);
    }

    // "Jogging": bounce up and down and rock slightly, forever.
    jog(sprite, height) {
      this.tweens.add({
        targets: sprite, y: sprite.y - height, angle: { from: -2, to: 2 },
        duration: 160, yoyo: true, repeat: -1,
      });
    }

    // One flash of lightning: thunder sound, white flash, the screen
    // jolts, and the cloud gives a little shudder.
    lightning(cloud) {
      FlightSounds.thunder();
      this.cameras.main.flash(250, 255, 255, 230);
      this.cameras.main.shake(500, 0.006);
      this.tweens.add({ targets: cloud, x: cloud.x + 6, duration: 50, yoyo: true, repeat: 3 });
    }

    // Throw the plane about: each jerk goes to a random spot near the
    // middle (x, y) with a random tilt, then the next one starts.
    bumpAbout(plane, x, y) {
      this.tweens.add({
        targets: plane,
        x: x + Phaser.Math.Between(-40, 40),
        y: y + Phaser.Math.Between(-30, 30),
        angle: Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(90, 200),
        ease: "Sine.easeInOut",
        onComplete: () => this.bumpAbout(plane, x, y),
      });
    }

    // Dark streaks whooshing from right to left behind the plane, so it
    // looks like it's flying left to right.
    makeSpeedLines() {
      return this.time.addEvent({
        delay: 90, loop: true,
        callback: () => {
          const y = 300 + Math.random() * 450;
          const line = this.add.rectangle(420, y, 90 + Math.random() * 90, 6, 0x1d1b14)
            .setOrigin(0, 0.5).setAlpha(0.8).setDepth(DEPTH.lines);
          this.tweens.add({
            targets: line, x: -250, alpha: 0, duration: 550,
            onComplete: () => line.destroy(),
          });
        },
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this scene to the list (that page
  // starts Phaser itself, with every scene). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(Flight);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Flight,
  });

}

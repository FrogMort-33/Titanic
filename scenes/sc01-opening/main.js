// =====================================================================
//  main.js  -  SC-01 Opening: "Time for Dinner Productions presents
//              The Titanic Club"   (uses IMG-001 and IMG-002)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//    0   Close-up on the cover painting, slowly zooming out to show it all.
//        The music starts.
//    3   A Star Wars style title crawls up over it (that part is HTML/CSS,
//        see index.html - it's easier to tilt text in 3D there).
//   16   CUT to the top panel of IMG-002: the bus jogs on the spot,
//        with puffs of dust and speed lines. 5 seconds.
//   21   CUT to the bottom panel: "The Titanic Club". Hold 5 seconds.
//   26   The bus jogs slowly across the road and drives off.
//   33   CUT to IMG-003: Annelisa's famous quote. Hold 5 seconds.
//   38   Fade out, music fades, a Replay button appears.
//
//  Change the numbers in TIMES to re-time the whole scene.
// =====================================================================

// Everything below is inside { } so its names (TIMES, W, H ...) stay
// private to this scene. That lets several scenes share one page
// (see play-all.html) without their names clashing.
{

  const TIMES = {
    crawlStarts: 3,
    cutToBus: 16,
    cutToTitle: 21,
    busSetsOff: 26,
    cutToQuote: 33,
    fadeOut: 38,
  };

  const W = 1280, H = 900;          // size of the picture area


  class Opening extends Phaser.Scene {

    // Every scene needs its own name, so "Play all" can switch between them.
    constructor() { super("opening"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      // USB version: pictures come packed in assets.js (window.ASSETS).
      // Web version: they're read from the assets folder.
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      pic("cover", "cover.jpg");
      pic("panel_top", "panel_top.jpg");
      pic("panel_bottom", "panel_bottom.jpg");
      pic("bus", "bus.png");
      pic("quote", "quote.jpg");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      // A small helper: run some code after a number of seconds.
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);

      // index.html tells us when Play is tapped by calling startShow().
      window.startShow = () => this.showCover();
    }

    // ---- SHOT 1: the cover, zooming out --------------------------------
    showCover() {
      OpeningMusic.start(42);                         // the Valkyries begin

      // The 'origin' is the point we zoom around: the valley where the
      // two hills meet (measured on the picture: 643, 461).
      const cover = this.add.image(W / 2, H / 2, "cover")
        .setOrigin(643 / 1280, 461 / 857)
        .setScale(3.2);                                   // start close up

      // Slowly zoom out until the whole painting fills the screen.
      this.tweens.add({
        targets: cover,
        scale: 1.05, x: 675, y: 484,
        duration: 9000,
        ease: "Sine.easeInOut",
      });

      // A black sheet over the picture, faded in so the yellow title
      // crawl stands out (like space in the films).
      const night = this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0).setAlpha(0);
      this.at(TIMES.crawlStarts, () => {
        startCrawl();                                     // in index.html
        this.tweens.add({ targets: night, alpha: 0.6, duration: 2500 });
      });

      this.at(TIMES.cutToBus, () => {
        stopCrawl();
        cover.destroy(); night.destroy();
        this.showBusJogging();
      });
    }

    // ---- SHOT 2: top panel, bus jogging on the spot ---------------------
    showBusJogging() {
      this.add.image(0, 0, "panel_top").setOrigin(0).setDisplaySize(W, 894);

      // Speed lines and dust go BEHIND the bus, so make them first.
      this.makeSpeedLines(60, 640, 300);

      // Put the cut-out bus exactly where it is in the drawing.
      // (worked out from the crop boxes in tools/prepare_pictures.py)
      const bus = this.add.image(154, 219, "bus").setOrigin(0).setScale(1.511);
      this.jog(bus, 8);

      this.cameras.main.shake(400, 0.004);              // a little jolt on the cut

      this.at(TIMES.cutToTitle - TIMES.cutToBus, () => {
        this.children.removeAll(true);                    // clear the screen
        this.tweens.killAll();                            // stop the jogging
        this.time.removeAllEvents();                      // stop the speed lines
        this.showTitle();
      });
    }

    // ---- SHOT 3: "The Titanic Club", then the bus drives off -------------
    showTitle() {
      // This panel is a bit taller than the screen, so centre it.
      this.add.image(W / 2, H / 2, "panel_bottom");

      this.at(TIMES.busSetsOff - TIMES.cutToTitle, () => {
        // Small bus, starting off the left edge, wheels on the road.
        const bus = this.add.image(-200, 880, "bus").setOrigin(0.5, 1).setScale(0.55);
        this.jog(bus, 5);
        this.makeDust(bus);

        this.tweens.add({
          targets: bus,
          x: W + 250,                                     // past the right edge = gone
          duration: (TIMES.cutToQuote - TIMES.busSetsOff) * 1000,
          ease: "Sine.easeIn",                            // starts slow, speeds up
        });
      });

      this.at(TIMES.cutToQuote - TIMES.cutToTitle, () => {
        this.children.removeAll(true);
        this.tweens.killAll();
        this.time.removeAllEvents();                      // stop the dust puffs
        this.showQuote();
      });
    }

    // ---- SHOT 4: Annelisa's quote (IMG-003) -----------------------------
    showQuote() {
      // A very slow push-in, so the still picture doesn't feel frozen.
      const quote = this.add.image(W / 2, H / 2, "quote");
      this.tweens.add({ targets: quote, scale: 1.06, duration: 6000, ease: "Sine.easeOut" });

      this.at(TIMES.fadeOut - TIMES.cutToQuote, () => {
        OpeningMusic.fadeOut(3);
        this.cameras.main.fadeOut(3000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          // "Play all": go straight on to the next scene. Otherwise: the end.
          if (window.PLAY_ALL) this.scene.start("transformation");
          else showReplay();                                // in index.html
        });
      });
    }

    // ---- Effects used above --------------------------------------------

    // "Jogging": bounce up and down and rock slightly, forever.
    jog(sprite, height) {
      this.tweens.add({
        targets: sprite,
        y: sprite.y - height,
        angle: { from: -1.5, to: 1.5 },
        duration: 140,
        yoyo: true,
        repeat: -1,                                       // -1 means "forever"
      });
    }

    // Black speed lines that whoosh to the left, over and over.
    makeSpeedLines(xStart, yTop, yRange) {
      this.time.addEvent({
        delay: 90, loop: true,
        callback: () => {
          const y = yTop + Math.random() * yRange * 0.5;
          const line = this.add.rectangle(xStart + 120, y, 90 + Math.random() * 80, 5, 0x1d1b14)
            .setOrigin(0, 0.5);
          this.tweens.add({
            targets: line, x: xStart - 160, alpha: 0, duration: 450,
            onComplete: () => line.destroy(),             // tidy up when done
          });
        },
      });
    }

    // Little dust puffs that pop out behind a moving bus and fade.
    makeDust(bus) {
      this.time.addEvent({
        delay: 120, loop: true,
        callback: () => {
          const puff = this.add.circle(bus.x - 150, bus.y - 10, 10 + Math.random() * 12, 0xd8cfa0)
            .setAlpha(0.8);
          this.children.moveBelow(puff, bus);            // behind the bus
          this.tweens.add({
            targets: puff, x: puff.x - 60, y: puff.y - 30, scale: 2.2, alpha: 0, duration: 700,
            onComplete: () => puff.destroy(),
          });
        },
      });
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this scene to the list (that page
  // starts Phaser itself, with every scene). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(Opening);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Opening,
  });

}

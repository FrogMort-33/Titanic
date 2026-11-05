// =====================================================================
//  main.js  -  SC-03 "Flights of Fantasy Fun !"
//              (uses IMG-007, then IMG-008, then IMG-009)
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
//
//   PART 2 - inside the plane (IMG-008)
//   20   CUT inside: close up on the "Fasten your seat belts" sign,
//        then the camera pulls back to show the whole cabin (no broad
//        bean yet!). Lightning flickers in the window with thunder, and
//        the cabin shakes (TIMES.windowFlash).
//   26   The words write in: "The Titanic Club kept their cool, unlike
//        the petrified lady above, portrayed by a broad bean."
//   31   SCREAM! The broad bean pops up from behind her seat and ducks
//        down again, several times (TIMES.screams), eyes wide and mouth
//        stretching open with each scream.
//
//   PART 3 - life-affirming turbulence (IMG-009)
//   39.5 CUT to IMG-009. The middle plane goes BOING on its spring,
//        bouncing its way across the screen from left to right.
//        Only "...arrived in a dark, closed airport," is showing.
//   44.5 The rest of the words write in. Hold 5.
//   52   Fade out: the end of scene 3.
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
    cabin: 20,
    windowFlash: [22, 24.5, 27, 29.5],
    cabinText: 26,
    screams: [31, 33.5, 35.5, 37.2],
    turbulence: 39.5,
    restOfText: 44.5,
    fadeOut: 52,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT3;         // sprite positions, from layout.js

  // Which things are drawn in front of which: bigger numbers in front.
  const DEPTH = { sky: 0, cloud: 1, lines: 2, plane: 3, title: 4,
                  window_flash: 1, bean: 1, cabin_text: 2 };


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
      // part 2
      pic("cabin_blank", "cabin_blank.jpg");
      pic("bean", "bean.png");
      pic("window_flash", "window_flash.png");
      pic("cabin_text", "cabin_text.png");
      // part 3
      pic("turb_blank", "turb_blank.jpg");
      pic("boing", "boing.png");
      pic("text_rest1", "text_rest1.png");
      pic("text_rest2", "text_rest2.png");
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

      this.at(TIMES.cabin, () => { this.cut(); this.showCabin(); });
    }

    // Wipe the screen ready for the next shot.
    cut() {
      this.children.removeAll(true);
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.cameras.main.setZoom(1).setScroll(0, 0).removeBounds();
    }

    // ---- PART 2: inside the plane ----------------------------------------
    showCabin() {
      const t0 = TIMES.cabin;
      const cam = this.cameras.main;
      this.add.image(0, 0, "cabin_blank").setOrigin(0);

      // Start right up close on the seatbelt sign, then pull back.
      // (setBounds stops the camera looking past the edge of the picture.)
      cam.setBounds(0, 0, W, H);
      cam.setZoom(4);
      cam.centerOn(L.sign[0], L.sign[1]);
      cam.flash(300, 255, 255, 255);
      this.at(1.5, () => {
        cam.zoomTo(1, 4000, "Sine.easeInOut");
        cam.pan(W / 2, H / 2, 4000, "Sine.easeInOut");
      });

      // The lightning in the window: hidden until each flash
      const flash = this.addSprite("window_flash").setVisible(false);
      for (const t of TIMES.windowFlash) this.at(t - t0, () => this.flicker(flash));

      // The words write in
      const words = this.addSprite("cabin_text");
      this.writeIn(words, 0);
      this.at(TIMES.cabinText - t0, () => this.writeIn(words, 3500));

      // The broad bean hides behind her seat. She "pops up" by growing
      // upwards from the seat edge. She lives in a "container" (a box that
      // holds several things and moves/scales them together): her picture
      // plus her screaming face. The container's (0,0) point is at her
      // bottom middle, so squashing its height (scaleY) from 0 to 1 makes
      // her rise up out of the seat, face and all.
      const b = L.bean, bw = 202, bh = 212;                // her picture is 202 x 212
      const bean = this.add.container(b.x + bw / 2, b.y + bh).setDepth(DEPTH.bean);
      bean.add(this.add.image(-bw / 2, -bh, "bean").setOrigin(0));
      bean.face = this.makeScreamFace(bean);
      bean.setScale(1, 0);
      // Her hands cover two short bits of the seat's edge in the picture,
      // so draw that edge line back in, behind her.
      const [[ax, ay], [bx, by]] = L.seat_edge;
      this.add.line(0, 0, ax, ay, bx, by, 0x1d1b14).setOrigin(0).setLineWidth(2.5).setDepth(0.5);

      TIMES.screams.forEach((t) => this.at(t - t0, () => this.scream(bean)));

      this.at(TIMES.turbulence - t0, () => { this.cut(); this.showTurbulence(); });
    }

    // Lightning in the window: on, off, on, off... with thunder and a shake
    flicker(flash) {
      FlightSounds.thunder();
      this.cameras.main.shake(700, 0.008);
      [0, 90, 170, 300, 380].forEach((ms, i) =>
        this.time.delayedCall(ms, () => flash.setVisible(i % 2 === 0)));   // even = on
      this.time.delayedCall(520, () => flash.setVisible(false));
    }

    // One scream: the bean pops up, wiggles and screams with her mouth
    // stretching wide open, then ducks back down behind her seat.
    scream(bean) {
      FlightSounds.scream();
      this.tweens.add({ targets: bean, scaleY: 1, duration: 160, ease: "Back.easeOut" });
      this.tweens.add({ targets: bean, angle: { from: -4, to: 4 }, duration: 70, yoyo: true, repeat: 6 });
      // the mouth: AAAH (wide) - ah (smaller) - AAAGH (wide) - shut
      this.tweens.chain({ targets: bean.face.mouth, tweens: [
        { scaleY: 1.6, scaleX: 1.2, duration: 120 },
        { scaleY: 1.0, scaleX: 1.0, duration: 200, delay: 300 },
        { scaleY: 1.7, scaleX: 1.25, duration: 100 },
        { scaleY: 0.5, scaleX: 0.8, duration: 300, delay: 150 },
      ]});
      this.time.delayedCall(1000, () =>
        this.tweens.add({ targets: bean, scaleY: 0, angle: 0, duration: 160, ease: "Back.easeIn" }));
    }

    // The broad bean's screaming face: big round staring eyes and a dark
    // open mouth, made from simple shapes and drawn over her own little
    // face. Positions are measured on her picture, counting from her
    // bottom middle (the container's 0,0), so they move with her.
    makeScreamFace(bean) {
      const face = {};
      for (const [x, y] of [[-16, -153], [14, -174]]) {        // left eye, right eye
        bean.add(this.add.circle(x, y, 8, 0xffffff).setStrokeStyle(2, 0x1d1b14));   // eye white
        bean.add(this.add.circle(x, y, 3, 0x1d1b14));                               // pupil
      }
      face.mouth = this.add.ellipse(23, -148, 16, 20, 0x3a1010).setStrokeStyle(2.5, 0x1d1b14);
      face.mouth.setScale(0.5, 0.5);                           // starts small
      bean.add(face.mouth);
      return face;
    }

    // ---- PART 3: life-affirming turbulence --------------------------------
    showTurbulence() {
      const t0 = TIMES.turbulence;
      FlightSounds.engineOff(1.5);

      // This page is taller than the screen: shrink it to fit (k) and put
      // it in the middle, on paper-coloured background. A "container"
      // holds the page and its sprites, so they all shrink together.
      const T = L.turb, k = H / T.h;
      this.add.rectangle(0, 0, W, H, Phaser.Display.Color.HexStringToColor(T.paper).color).setOrigin(0);
      const page = this.add.container((W - T.w * k) / 2, 0).setScale(k);
      page.add(this.add.image(0, 0, "turb_blank").setOrigin(0));
      this.cameras.main.fadeIn(600);

      // The plane on its spring. Its origin is at the bottom of the spring,
      // so squashing/stretching it (scaleY) works like a real spring.
      const b = L.boing, img = this.textures.get("boing").getSourceImage();
      const spring = this.add.image(b.x + img.width / 2, b.y + img.height, "boing").setOrigin(0.5, 1);
      page.add(spring);
      this.boingForever(spring);

      // ...and it travels across the screen from left to right while it
      // boings: start just off the left edge, end just off the right edge.
      // (The page is shrunk by k and shifted by page.x, so screen edges
      // are converted into "page" numbers first.)
      const leftEdge = -page.x / k - img.width / 2;
      const rightEdge = (W - page.x) / k + img.width / 2;
      spring.x = leftEdge;
      this.tweens.add({ targets: spring, x: rightEdge, duration: 6000, repeat: -1 });

      // The rest of the words, hidden until later
      const rest1 = this.add.image(L.text_rest1.x, L.text_rest1.y, "text_rest1").setOrigin(0);
      const rest2 = this.add.image(L.text_rest2.x, L.text_rest2.y, "text_rest2").setOrigin(0);
      page.add([rest1, rest2]);
      this.writeIn(rest1, 0);
      this.writeIn(rest2, 0);
      this.at(TIMES.restOfText - t0, () => {
        this.writeIn(rest1, 700);
        this.at(0.7, () => this.writeIn(rest2, 3000));
      });

      this.at(TIMES.fadeOut - t0, () => {
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          if (window.PLAY_ALL) this.scene.start("taxi");   // "Play all": on to scene 4
          else showEnd();                                   // in index.html
        });
      });
    }

    // BOING: squash the spring down, then let it spring back up with a
    // wobble ("Elastic" ease), with the boing sound. Again and again.
    boingForever(spring) {
      this.tweens.add({
        targets: spring, scaleY: 0.55, scaleX: 1.1, duration: 250, ease: "Sine.easeIn",
        onComplete: () => {
          FlightSounds.boing();
          this.tweens.add({
            targets: spring, scaleY: 1, scaleX: 1, duration: 1100, ease: "Elastic.easeOut",
            onComplete: () => this.boingForever(spring),
          });
        },
      });
    }

    // "Write in": show a sprite from left to right, like a pen drawing it.
    writeIn(sprite, duration) {
      const reveal = { w: 0 };
      sprite.setCrop(0, 0, 0, sprite.height);
      if (duration === 0) return;
      this.tweens.add({
        targets: reveal, w: sprite.width, duration,
        onUpdate: () => sprite.setCrop(0, 0, reveal.w, sprite.height),
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

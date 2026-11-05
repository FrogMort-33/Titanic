// =====================================================================
//  main.js  -  "Hello van": the smallest useful Phaser example
// =====================================================================
//
//  What happens on screen:
//    1. A still picture from the book is drawn as the background.
//    2. The pink minibus (a cut-out PNG with a see-through background)
//       drives across it, bouncing a little as it goes.
//    3. A stress meter in the HUD fills up while the van drives.
//    4. Click the picture to make it all happen again.
//
//  Phaser is already loaded by index.html, so here we can use the
//  global object called "Phaser".
// =====================================================================


// ---------------------------------------------------------------------
//  A "scene" is one screen of the game/story. Later, every storyboard
//  scene (SC-01, SC-02 ...) could be one of these.
//  Phaser calls three functions on a scene, in this order:
//     preload()  -> load pictures and sounds
//     create()   -> put things on the screen, once
//     update()   -> runs about 60 times a second, for anything that
//                   needs checking every frame (we don't need it yet)
// ---------------------------------------------------------------------
class HelloVan extends Phaser.Scene {

  preload() {
    // Give each file a short name (a "key") we can use later.
    // If assets.js was loaded (the USB-stick version), the pictures come
    // packed inside it; otherwise they are read from the assets folder.
    const packed = window.ASSETS || {};
    this.load.image("road", packed.road || "assets/background.jpg");   // IMG-072 working copy
    this.load.image("van",  packed.van  || "assets/van.png");          // cut out of IMG-050
  }

  create() {
    // --- The still shot ------------------------------------------------
    // Place the background at the centre of the 1000 x 750 canvas.
    this.add.image(500, 375, "road");

    // --- The moving object ---------------------------------------------
    // Sprites are pictures that can move. The PNG's transparent pixels
    // let the background show through ("blitting with alpha").
    this.van = this.add.image(-200, 560, "van").setScale(0.55);

    // Start the drive, and drive again whenever the picture is clicked.
    this.drive();
    this.input.on("pointerdown", () => this.drive());
  }

  // Our own helper: send the van across the screen once.
  drive() {
    // Stop any drive already happening, and put the van back at the start.
    this.tweens.killTweensOf(this.van);
    this.van.setPosition(-200, 560).setAngle(0);
    setStress(0);

    // A "tween" smoothly changes a property from its current value to a
    // new one over a set time. Here: move x from -200 to 1200 in 4 seconds.
    this.tweens.add({
      targets: this.van,
      x: 1200,
      duration: 4000,
      ease: "Sine.easeInOut",
      // onUpdate runs every frame of the tween. tween.progress goes 0 -> 1,
      // so we can use it to fill the stress meter as the van travels.
      onUpdate: (tween) => setStress(tween.progress * 100),
    });

    // A second tween at the same time: a small bounce up and down,
    // repeating, so the van looks like it's on a bumpy road.
    this.tweens.add({
      targets: this.van,
      y: 548,
      angle: -2,
      duration: 180,
      yoyo: true,     // go there, then come back
      repeat: 10,     // do it 10 more times
    });
  }
}


// ---------------------------------------------------------------------
//  The HUD is ordinary HTML (see index.html), not part of Phaser.
//  This tiny function just changes the width of the coloured bar.
// ---------------------------------------------------------------------
function setStress(percent) {
  const bar = document.getElementById("van-stress");
  bar.style.width = Math.round(percent) + "%";
}


// ---------------------------------------------------------------------
//  Start Phaser. This creates the canvas and runs our scene.
// ---------------------------------------------------------------------
new Phaser.Game({
  type: Phaser.AUTO,          // use the fastest drawing method available
  width: 1000,
  height: 750,
  parent: "stage",            // put the canvas inside <div id="stage">
  backgroundColor: "#f6efc4",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: HelloVan,
});

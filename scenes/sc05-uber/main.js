// =====================================================================
//  main.js  -  EPISODE 5 "Uber World, Part One"
//              (uses IMG-012, then IMG-013, then both pictures of
//               IMG-014, plus two paragraphs of words from IMG-011)
// =====================================================================
//
//  THE PLAN (times in seconds after the viewer taps Play)
//
//   PART 1 - UBER!  (IMG-012, racing music)
//    0    The night sky with "UBER!", the moon and Tash waving her phone.
//         No cars yet.
//    1.5  The blue Uber races in from the left and screeches to a stop.
//    3.5  The pink Uber races in too, and parks.
//    7    The words: "Tash's quick-thinking summoned two Ubers..."
//   16.5  The family POP into the cars, one head at a time,
//         then "oui, oui!" (blue car) and "non, non!" (pink car).
//   22    VROOM VROOM! Both cars rev up...
//   23.5  ...and jog off to the right.
//
//   PART 2 - LE HOTEL  (IMG-013, on yellow paper)
//   27.5  The hotel with EMPTY windows and the bottom picture hidden.
//   28    The words write in: "What ensued was the calm before the storm..."
//   34    Our potato heads appear one by one in the six windows.
//   44.5  (after holding 5) the bottom picture is revealed, rolling down
//         like a blind: Le Reception, "PINBALL?! NON! NON!", with
//         pinball machine noises (flippers, bumpers, score ticks).
//
//   PART 3 - SLEEPY TIME  (IMG-014's top picture, Brahms' Lullaby)
//   51.5  Everyone asleep in the bunk beds, under the blue-white-red
//         colours. Zzz's float up from the sleepy heads at random.
//
//   PART 4 - TRES BIEN!  (IMG-014's bottom picture, our own happy tune)
//   64    An empty page, just the potato.
//   64.8  The words write in at the top, on a strip of yellow paper:
//         "After a gentle snooze, the Titanic Club rolled to the nearest
//          patisserie..." They stay to be read, then fade away.
//   71.5  Cakes and pastries fly in one by one; the potato ducks each time.
//   77    ...and they ORBIT round and round him.
//   84    The last flute (French bread!) flies in and he CATCHES it.
//         "Très Bien" pops up.
//   86.5  His words write in: "you mean, they eat the flutes here?"
//   94    Fade out. The end of Part One.
//
//  STORY RULE: cars and the van travel LEFT to RIGHT. The Ubers are
//  drawn facing right, so they drive in nose first from the left.
//
//  To change WHEN things happen, change the numbers in TIMES below.
// =====================================================================

{   // (these curly brackets keep our names private, so "Play all" can load
    //  every scene's main.js on one page without the names clashing)

  const TIMES = {
    blueCar: 1.5,
    pinkCar: 3.5,
    tashText: 7,
    tashTextGone: 16,
    passengers: 16.5,
    rev: 22,
    driveOff: 23.5,
    hotel: 27.5,
    hotelText: 28,
    windows: 34,          // one head a second after this
    reveal: 44.5,
    bunks: 51.5,
    pastry: 64,
    introText: 64.8,      // "After a gentle snooze..." (fades as the pastries come)
    pastriesIn: 71.5,     // one every 0.6 seconds after this
    orbit: 77,
    flute: 84,            // it lands 1.2 seconds later
    flutesText: 86.5,
    fadeOut: 94,
  };

  const W = 1280, H = 900;          // size of the picture area
  const L = window.LAYOUT5;         // sprite positions, from layout.js
  const PAPER = 0xf4eaac;           // the book's pale yellow page
  // The flying cakes and pastries of part 4 (pictures in assets/)
  const PASTRIES = ["pa_baguette1", "pa_croissant1", "pa_ring", "pa_muffin",
                    "pa_cake", "pa_baguette2", "pa_croissant2", "pa_croissant3"];

  class Uber extends Phaser.Scene {

    // Every scene needs its own name, so "Play all" can switch between them.
    constructor() { super("uber"); }

    // ---- 1. Load pictures ---------------------------------------------
    preload() {
      const packed = window.ASSETS || {};
      const pic = (key, file) => this.load.image(key, packed[key] || "assets/" + file);
      pic("uber_blank", "uber_blank.jpg");
      pic("car_blue", "car_blue.png");
      pic("car_pink", "car_pink.png");
      for (let i = 1; i <= 9; i++) pic("ub_head" + i, `ub_head${i}.png`);
      pic("oui_oui", "oui_oui.png");
      pic("non_non", "non_non.png");
      pic("tash_text", "tash_text.png");
      pic("hotel_blank", "hotel_blank.jpg");
      for (let i = 1; i <= 6; i++) pic("win_head" + i, `win_head${i}.png`);
      pic("hotel_bottom", "hotel_bottom.png");
      pic("ensued_text", "ensued_text.png");
      pic("bunks", "bunks.jpg");
      pic("pastry_blank", "pastry_blank.jpg");
      for (const key of PASTRIES) pic(key, key + ".png");
      for (const key of ["pa_potato", "pa_flute", "pa_tres_bien", "pa_flutes_text", "pa_intro_text"]) pic(key, key + ".png");
    }

    // ---- 2. Set up, then wait for the Play tap ------------------------
    create() {
      this.at = (seconds, fn) => this.time.delayedCall(seconds * 1000, fn);
      this.loops = [];                     // repeating timers, stopped at each cut
      // "Play all": we arrive straight from scene 4, so begin at once.
      if (window.PLAY_ALL) this.start();
      else window.startShow = () => this.start();
    }

    // Everything is planned at the start, using the TIMES above.
    start() {
      this.showUberSky();
      this.at(TIMES.hotel - 1.2, () => this.cameras.main.fadeOut(1000, 0, 0, 0));
      this.at(TIMES.hotel, () => { this.cut(); this.showHotel(); });
      this.at(TIMES.bunks - 1.5, () => this.cameras.main.fadeOut(1300, 0, 0, 0));
      this.at(TIMES.bunks, () => { this.cut(); this.showBunks(); });
      this.at(TIMES.pastry - 1.5, () => { this.cameras.main.fadeOut(1300, 0, 0, 0); UberSounds.lullabyOff(1.5); });
      this.at(TIMES.pastry, () => { this.cut(); this.showPastries(); });
      this.at(TIMES.fadeOut, () => {
        UberSounds.cafeOff(2.5);
        this.cameras.main.fadeOut(2500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          if (window.PLAY_ALL) this.scene.start("uber2");   // "Play all": on to episode 6
          else showEnd();                                    // in index.html
        });
      });
    }

    // A "cut": clear the screen for the next picture
    cut() {
      this.loops.forEach((loop) => loop.remove());
      this.loops = [];
      this.orbiting = null;
      this.tweens.killAll();
      this.children.removeAll(true);
      this.cameras.main.fadeIn(800);
    }

    // =====================================================================
    //  PART 1 - UBER!
    // =====================================================================
    showUberSky() {
      UberSounds.race(TIMES.hotel);
      this.add.image(0, 0, "uber_blank").setOrigin(0);
      this.cameras.main.fadeIn(600);

      // Each car is a "container": a box holding the car picture, its
      // passengers and its shout, so they all move together.
      const blue = this.makeCar("car_blue", [1, 2, 3, 4, 5], "oui_oui");
      const pink = this.makeCar("car_pink", [6, 7, 8, 9], "non_non");

      this.at(TIMES.blueCar, () => this.raceIn(blue, 2500));
      this.at(TIMES.pinkCar, () => this.raceIn(pink, 2500));
      this.at(TIMES.tashText, () => this.showTashText());

      // The passengers pop in, one after another; then each car shouts
      let t = TIMES.passengers;
      blue.heads.forEach((head, i) => this.at(t + i * 0.35, () => this.popIn(head, i)));
      t += blue.heads.length * 0.35 + 0.2;
      this.at(t, () => this.popIn(blue.shout, 6));
      t += 0.6;
      pink.heads.forEach((head, i) => this.at(t + i * 0.35, () => this.popIn(head, i + 2)));
      t += pink.heads.length * 0.35 + 0.2;
      this.at(t, () => this.popIn(pink.shout, 8));

      this.at(TIMES.rev, () => { this.revUp(blue); this.revUp(pink); });
      this.at(TIMES.driveOff, () => { this.driveOff(blue, 0); this.driveOff(pink, 300); });
      this.at(TIMES.driveOff + 2, () => UberSounds.raceOff(2));
    }

    // Build a car container, parked off the left edge for now.
    // Positions of the heads and the shout are measured from the car's
    // own top-left corner (that's the container's 0,0).
    makeCar(key, headNumbers, shoutKey) {
      const spot = L[key];
      const car = this.add.container(spot.x, spot.y);
      car.add(this.add.image(0, 0, key).setOrigin(0));
      car.heads = headNumbers.map((n) => {
        const h = L["ub_head" + n];
        return this.hidden(this.add.image(h.x - spot.x, h.y - spot.y, "ub_head" + n));
      });
      const s = L[shoutKey];
      car.shout = this.hidden(this.add.image(s.x - spot.x, s.y - spot.y, shoutKey));
      car.add([...car.heads, car.shout]);
      car.spotX = spot.x; car.spotY = spot.y;
      car.width = this.textures.get(key).getSourceImage().width;
      car.height = this.textures.get(key).getSourceImage().height;
      car.x = -car.width - 40;                       // waiting off the left edge
      return car;
    }

    // A sprite that will "pop" later: it grows from its middle, so move
    // its origin to the middle (and its position to match), and start
    // it at size 0 (invisible).
    hidden(sprite) {
      sprite.setOrigin(0.5).setPosition(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
      return sprite.setScale(0);
    }

    popIn(sprite, number) {
      UberSounds.pop(number);
      this.tweens.add({ targets: sprite, scale: 1, duration: 300, ease: "Back.easeOut" });
    }

    // Race in from the left, slowing down to a stop at the parking spot,
    // then the tyres screech and the car rocks forward and back.
    raceIn(car, duration) {
      const jog = this.jog(car);
      const dust = this.dustBehind(car);
      const lines = this.speedLines(car);
      this.tweens.add({
        targets: car, x: car.spotX, duration, ease: "Cubic.easeOut",
        onComplete: () => {
          jog.stop(); dust.remove(); lines.remove();
          car.y = car.spotY;
          this.tweens.add({ targets: car, angle: { from: 3, to: 0 }, duration: 500, ease: "Back.easeOut" });
        },
      });
      this.at(duration / 1000 - 0.9, () => UberSounds.screech());   // brakes, just before stopping
    }

    // VROOM VROOM: shake on the spot with puffs of smoke from the back
    revUp(car) {
      UberSounds.rev();
      this.tweens.add({ targets: car, x: car.x + 4, duration: 40, yoyo: true, repeat: 18 });
      this.dustBehind(car, 1500);
    }

    // Off to the right, picking up speed, jogging all the way
    driveOff(car, delay) {
      this.time.delayedCall(delay, () => {
        this.jog(car);
        this.dustBehind(car);
        this.speedLines(car);
        this.tweens.add({ targets: car, x: W + 60, duration: 3000, ease: "Quad.easeIn" });
      });
    }

    // Jogging: bounce up and down and rock slightly (until stopped)
    jog(car) {
      return this.tweens.add({
        targets: car, y: car.spotY - 7, angle: { from: -1, to: 1 },
        duration: 130, yoyo: true, repeat: -1,
      });
    }

    // Puffs of dust from behind the back wheel (the car's LEFT end).
    // Runs until removed, or for 'ms' milliseconds if given.
    dustBehind(car, ms) {
      const loop = this.time.addEvent({
        delay: 100, loop: true,
        callback: () => {
          const puff = this.add.circle(car.x + 30, car.y + car.height - 30, 10 + Math.random() * 12, 0xc9c2b8)
            .setAlpha(0.85);
          this.children.moveBelow(puff, car);          // behind the car
          this.tweens.add({
            targets: puff, x: puff.x - 70, y: puff.y - 25, scale: 2.2, alpha: 0, duration: 650,
            onComplete: () => puff.destroy(),
          });
        },
      });
      this.loops.push(loop);
      if (ms) this.time.delayedCall(ms, () => loop.remove());
      return loop;
    }

    // Dark streaks whooshing out behind a moving car
    speedLines(car) {
      const loop = this.time.addEvent({
        delay: 70, loop: true,
        callback: () => {
          const y = car.y + 30 + Math.random() * (car.height - 80);
          const line = this.add.rectangle(car.x - 10, y, 60 + Math.random() * 80, 4, 0x1d1b14)
            .setOrigin(1, 0.5).setAlpha(0.8);
          this.tweens.add({
            targets: line, x: line.x - 160, alpha: 0, duration: 400,
            onComplete: () => line.destroy(),
          });
        },
      });
      this.loops.push(loop);
      return loop;
    }

    // The words from the page, on a yellow card in the middle. The
    // picture behind goes darker so the words are easy to read.
    showTashText() {
      const dim = this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0).setAlpha(0).setDepth(10);
      const card = this.add.container(W / 2, H / 2).setDepth(11).setAlpha(0).setScale(0.85);
      const img = this.add.image(0, 0, "tash_text");
      const pad = 40;
      const back = this.add.graphics();
      back.fillStyle(PAPER).lineStyle(4, 0x1d1b14);
      back.fillRoundedRect(-img.width / 2 - pad, -img.height / 2 - pad, img.width + 2 * pad, img.height + 2 * pad, 18);
      back.strokeRoundedRect(-img.width / 2 - pad, -img.height / 2 - pad, img.width + 2 * pad, img.height + 2 * pad, 18);
      card.add([back, img]);
      this.tweens.add({ targets: dim, alpha: 0.45, duration: 600 });
      this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 600, ease: "Back.easeOut" });
      this.at(TIMES.tashTextGone - TIMES.tashText, () => {
        this.tweens.add({ targets: [dim, card], alpha: 0, duration: 600 });
      });
    }

    // =====================================================================
    //  PART 2 - LE HOTEL
    // =====================================================================
    showHotel() {
      const t0 = TIMES.hotel;
      this.add.image(0, 0, "hotel_blank").setOrigin(0);

      // The words write in from the top down, line after line
      const words = this.add.image(L.ensued_text.x, L.ensued_text.y, "ensued_text").setOrigin(0);
      this.rollDown(words, 0);
      this.at(TIMES.hotelText - t0, () => this.rollDown(words, 5000));

      // A face in each window, one a second, with a little "ding"
      for (let i = 1; i <= 6; i++) {
        const p = L["win_head" + i];
        const head = this.hidden(this.add.image(p.x, p.y, "win_head" + i));
        this.at(TIMES.windows - t0 + (i - 1), () => {
          UberSounds.ding(i - 1);
          this.tweens.add({ targets: head, scale: 1, duration: 350, ease: "Back.easeOut" });
        });
      }

      // The bottom picture: hidden, then rolled down like a blind
      const bottom = this.add.image(L.hotel_bottom.x, L.hotel_bottom.y, "hotel_bottom").setOrigin(0);
      this.rollDown(bottom, 0);
      this.at(TIMES.reveal - t0, () => {
        this.rollDown(bottom, 2500, true);
        UberSounds.pinballMachine(5);              // flippers, bumpers, ticks...
        this.at(2.5, () => UberSounds.pinball());  // ...and a jingle as it lands
      });
    }

    // Show a sprite from the top downwards over 'duration' ms (0 = hide).
    // withRoller: a dark bar rides along the bottom edge, like a blind's roller.
    rollDown(sprite, duration, withRoller) {
      const reveal = { h: 0 };
      sprite.setCrop(0, 0, sprite.width, 0);
      if (duration === 0) return;
      const roller = withRoller
        ? this.add.rectangle(sprite.x - 6, sprite.y, sprite.width + 12, 10, 0x6b4a2a).setOrigin(0, 0.5)
        : null;
      this.tweens.add({
        targets: reveal, h: sprite.height, duration, ease: "Sine.easeInOut",
        onUpdate: () => {
          sprite.setCrop(0, 0, sprite.width, reveal.h);
          if (roller) roller.y = sprite.y + reveal.h;
        },
        onComplete: () => { if (roller) this.tweens.add({ targets: roller, alpha: 0, duration: 400 }); },
      });
    }

    // =====================================================================
    //  PART 3 - SLEEPY TIME
    // =====================================================================
    showBunks() {
      UberSounds.lullaby(TIMES.pastry - TIMES.bunks + 1);
      this.add.rectangle(0, 0, W, H, 0x141a33).setOrigin(0);       // night-time dark
      // a few twinkling stars in the dark strips above and below
      for (let i = 0; i < 30; i++) {
        const y = Math.random() < 0.5 ? Math.random() * L.bunks.y : H - Math.random() * L.bunks.y;
        const star = this.add.circle(Math.random() * W, y, 1.5 + Math.random() * 1.5, 0xfff6c8);
        this.tweens.add({ targets: star, alpha: { from: 1, to: 0.2 }, duration: 800 + Math.random() * 1500,
                          yoyo: true, repeat: -1, delay: Math.random() * 1000 });
      }
      this.add.image(L.bunks.x, L.bunks.y, "bunks").setOrigin(0);

      // Zzz's: every so often, from a sleeper picked at random
      this.loops.push(this.time.addEvent({
        delay: 350, loop: true,
        callback: () => {
          const [x, y] = Phaser.Utils.Array.GetRandom(L.sleepers);
          this.floatZ(x + 18, y - 8);
        },
      }));
    }

    // One "Z" that floats up and to the right, swaying, growing and fading
    floatZ(x, y) {
      const z = this.add.text(x, y, "Z", {
        fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive', fontSize: "36px",
        color: "#ffffff", stroke: "#1d1b14", strokeThickness: 5,
      }).setOrigin(0.5).setScale(0.6);
      this.tweens.add({
        targets: z, y: y - 90, x: x + 40, scale: 1.3, alpha: { from: 1, to: 0 },
        duration: 2600, ease: "Sine.easeOut", onComplete: () => z.destroy(),
      });
      this.tweens.add({ targets: z, angle: { from: -15, to: 15 }, duration: 500, yoyo: true, repeat: 2 });
    }

    // =====================================================================
    //  PART 4 - TRES BIEN!
    // =====================================================================
    showPastries() {
      const t0 = TIMES.pastry;
      UberSounds.cafe(TIMES.fadeOut - TIMES.pastry + 3);
      this.add.image(0, 0, "pastry_blank").setOrigin(0);
      const [cx, cy] = L.pa_centre;               // the middle of the potato

      // The potato. His origin is at his feet, so squashing him (scaleY)
      // keeps his feet on the ground: that's how he "ducks".
      const potato = this.add.image(L.pa_potato.x, L.pa_potato.y, "pa_potato").setOrigin(0);
      potato.setOrigin(0.5, 1).setPosition(potato.x + potato.width / 2, potato.y + potato.height);
      const duck = () => this.tweens.add({
        targets: potato, scaleY: 0.78, scaleX: 1.08, duration: 160, yoyo: true, ease: "Quad.easeOut",
      });

      // The words at the top, on a strip of the book's yellow paper with
      // a dark edge. They write in, stay to be read, then fade away
      // just before the pastries start flying.
      const intro = this.add.image(W / 2, 24, "pa_intro_text").setOrigin(0.5, 0).setDepth(5);
      const strip = this.add.rectangle(W / 2, 12, intro.width + 60, intro.height + 24, PAPER)
        .setOrigin(0.5, 0).setStrokeStyle(4, 0x1d1b14).setDepth(4).setAlpha(0);
      this.rollDown(intro, 0);
      this.at(TIMES.introText - t0, () => {
        this.tweens.add({ targets: strip, alpha: 1, duration: 400 });
        this.rollDown(intro, 4000);
      });
      this.at(TIMES.pastriesIn - t0 - 0.8, () =>
        this.tweens.add({ targets: [strip, intro], alpha: 0, duration: 700 }));

      // Each pastry: placed at its spot in the picture ("home"), turning
      // round its middle, hidden until it flies in.
      const pastries = PASTRIES.map((key) => {
        const p = this.add.image(L[key].x, L[key].y, key).setOrigin(0);
        p.setOrigin(0.5).setPosition(p.x + p.width / 2, p.y + p.height / 2).setVisible(false);
        p.homeX = p.x; p.homeY = p.y;
        // For the orbit: how far from the potato, and at what angle.
        // (Up-and-down distances are stretched by 1/0.7, so the orbit is
        // an oval, wider than it is tall, and fits on the screen.)
        const u = p.x - cx, v = (p.y - cy) / 0.7;
        p.radius = Math.hypot(u, v);
        p.startAngle = Math.atan2(v, u);
        p.spin = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random());   // degrees per frame
        return p;
      });

      // Fly in, one at a time, from somewhere off the edge of the screen
      pastries.forEach((p, i) => this.at(TIMES.pastriesIn - t0 + i * 0.6, () => {
        const fromLeft = p.homeX < cx;
        p.setPosition(fromLeft ? -200 : W + 200, p.homeY + (Math.random() * 400 - 200)).setVisible(true);
        UberSounds.whoosh();
        duck();
        this.tweens.add({ targets: p, x: p.homeX, y: p.homeY, angle: { from: fromLeft ? -360 : 360, to: 0 },
                          duration: 700, ease: "Quad.easeOut" });
      }));

      // Orbit: from now on, update() moves every pastry round the potato.
      // "turn" is how far round they've gone (in radians: 2 x pi = once
      // all the way round). Once round every 7 seconds.
      this.at(TIMES.orbit - t0, () => {
        this.orbiting = { pastries, cx, cy, turn: 0 };
        this.tweens.add({ targets: this.orbiting, turn: Math.PI * 2, duration: 7000, repeat: -1 });
        // and he keeps ducking as they whizz past his head
        this.loops.push(this.time.addEvent({ delay: 1100, loop: true, callback: duck }));
      });

      // The last flute flies in, spinning, and he catches it
      const flute = this.add.image(L.pa_flute.x, L.pa_flute.y, "pa_flute").setOrigin(0);
      flute.setOrigin(0.5).setPosition(flute.x + flute.width / 2, flute.y + flute.height / 2).setVisible(false);
      const fx = flute.x, fy = flute.y;
      this.at(TIMES.flute - t0, () => {
        flute.setPosition(-250, fy - 150).setVisible(true);
        UberSounds.whoosh();
        this.tweens.add({
          targets: flute, x: fx, y: fy, angle: { from: -720, to: 0 }, duration: 1200, ease: "Cubic.easeOut",
          onComplete: () => {
            UberSounds.catchIt();
            this.tweens.add({ targets: [potato, flute], y: "-=25", duration: 150, yoyo: true, ease: "Quad.easeOut" });
            const tb = this.hidden(this.add.image(L.pa_tres_bien.x, L.pa_tres_bien.y, "pa_tres_bien"));
            this.tweens.add({ targets: tb, scale: 1, duration: 350, ease: "Back.easeOut" });
          },
        });
      });

      // His words write in from the top down, line by line
      const words = this.add.image(L.pa_flutes_text.x, L.pa_flutes_text.y, "pa_flutes_text").setOrigin(0);
      this.rollDown(words, 0);
      this.at(TIMES.flutesText - t0, () => this.rollDown(words, 3000));
    }

    // Phaser calls update() every frame. While the pastries orbit, put
    // each one on its oval path round the potato, and keep it spinning.
    update() {
      const o = this.orbiting;
      if (!o) return;
      for (const p of o.pastries) {
        const a = p.startAngle + o.turn;
        p.x = o.cx + Math.cos(a) * p.radius;
        p.y = o.cy + Math.sin(a) * p.radius * 0.7;
        p.angle += p.spin;
      }
    }
  }


  // ---- Start Phaser ---------------------------------------------------
  // On the "Play all" page, just add this scene to the list (that page
  // starts Phaser itself, with every scene). On its own, start it here.
  if (window.PLAY_ALL) window.PLAY_ALL.push(Uber);
  else new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "stage",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Uber,
  });

}

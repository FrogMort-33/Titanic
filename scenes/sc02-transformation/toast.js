// =====================================================================
//  toast.js  -  the "suspicious dog" pop-up for SC-02
// =====================================================================
//
//  When Callum says "Draw me as I am, please", a little card (a "toast",
//  like a phone notification) slides up in the bottom-right corner with
//  the side-eye dog. Small thought bubbles float up from it, getting
//  bigger, and then a big bubble says:
//        "Draw me like one of your French girls !! ?"
//  After a few seconds it all slides away again.
//
//  It's plain HTML + CSS laid over the picture (like the title crawl),
//  so the camera zooming in Phaser doesn't move it. This file makes its
//  own HTML and CSS, so a page only needs <script src="toast.js"> and a
//  call to showDogToast(). That's why play-all.html can use it too.
//
//  TO RE-TIME IT: change the numbers in TOAST (seconds after it starts).
// =====================================================================

const TOAST = {
  bubble1: 0.8,       // first little bubble
  bubble2: 1.3,       // second, a bit bigger
  bubble3: 1.8,       // third, bigger again
  bigBubble: 2.4,     // the big thought with the words
  goAway: 6.5,        // everything slides away
};

// ---- The look: all the CSS, added to the page once --------------------
// Sizes are in "vmin" (1vmin = 1% of the screen's shorter side), so it is
// the same size on an iPad, a phone or a big monitor.
const TOAST_CSS = `
  #dogtoast { position: absolute; right: 3vmin; bottom: 3vmin; z-index: 4;
              pointer-events: none; transform: translateY(150%);
              transition: transform .5s cubic-bezier(.2, 1.4, .4, 1); }
  #dogtoast.show { transform: translateY(0); }          /* slides up (and bounces) */
  /* Going away: slide down AND fade out (the bubbles sit high above the
     card, so sliding alone would leave them on screen) */
  #dogtoast.hide { transform: translateY(150%); opacity: 0;
                   transition: transform .5s ease-in, opacity .4s; }

  /* The card with the dog */
  #dogtoast .card { background: #fff; padding: 1vmin; border-radius: 2vmin;
                    box-shadow: 0 1vmin 3vmin rgba(0,0,0,.5); }
  #dogtoast .card img { display: block; width: 24vmin; border-radius: 1.2vmin; }

  /* Thought bubbles: white circles that pop in (scale from 0 to 1) */
  #dogtoast .puff, #dogtoast .big {
      position: absolute; background: #fff; border: .5vmin solid #222;
      transform: scale(0); transition: transform .3s cubic-bezier(.3, 1.8, .5, 1); }
  #dogtoast .puff { border-radius: 50%; }
  /* The bubbles go up and to the LEFT of the dog, each one bigger, and
     the big thought sits beyond the last one, so none of them overlap.
     (left/top are measured from the dog card's top-left corner.)      */
  #dogtoast .p1 { width: 2.5vmin; height: 2.5vmin; left: -3vmin;  top: 1vmin; }
  #dogtoast .p2 { width: 4vmin;   height: 4vmin;   left: -9vmin;  top: -4vmin; }
  #dogtoast .p3 { width: 6vmin;   height: 6vmin;   left: -17vmin; top: -11vmin; }

  /* The big thought: a cloud-ish rounded box with the words */
  #dogtoast .big { right: 36vmin; bottom: 22vmin; width: 42vmin; padding: 3vmin 3.5vmin;
                   border-radius: 50% / 45%;          /* very round = cloud-like */
                   font-family: "Chalkboard SE", "Comic Sans MS", "Comic Neue", cursive;
                   font-size: 4.4vmin; line-height: 1.15; text-align: center; color: #222; }
  #dogtoast .on { transform: scale(1); }
`;

// ---- The parts: the HTML for the card and the bubbles ------------------
const TOAST_HTML = `
  <div class="card"><img alt="Suspicious dog"></div>
  <div class="puff p1"></div>
  <div class="puff p2"></div>
  <div class="puff p3"></div>
  <div class="big">Draw me like one of your French girls !! ?</div>
`;

// ---- Show it once ------------------------------------------------------
function showDogToast() {
  // 1. Add the CSS and HTML to the page (first time only)
  let toast = document.getElementById("dogtoast");
  if (!toast) {
    const style = document.createElement("style");
    style.textContent = TOAST_CSS;
    document.head.appendChild(style);

    toast = document.createElement("div");
    toast.id = "dogtoast";
    toast.innerHTML = TOAST_HTML;
    // The picture: packed in assets.js, or else from the assets folder.
    toast.querySelector("img").src = (window.ASSETS && window.ASSETS.dog) || "assets/dog.jpg";
    document.getElementById("stage").appendChild(toast);
  }

  // 2. A small helper: do something after a number of seconds
  const at = (seconds, fn) => setTimeout(fn, seconds * 1000);
  const pop = (selector) => toast.querySelector(selector).classList.add("on");

  // 3. The show
  toast.classList.add("show");
  GalleryMusic.suspicious();                      // "hmm?" (in music.js)
  at(TOAST.bubble1, () => pop(".p1"));
  at(TOAST.bubble2, () => pop(".p2"));
  at(TOAST.bubble3, () => pop(".p3"));
  at(TOAST.bigBubble, () => pop(".big"));
  at(TOAST.goAway, () => toast.classList.add("hide"));
}

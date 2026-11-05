"""
prepare_pictures.py  -  cut the pictures for SC-02 "The Transformation"
                         out of the master photos of IMG-004 and IMG-005.

Boxes are measured on the 1000-pixel-tall working copies (easy to look
at, see working/IMG-004.jpg), then scaled up so we cut from the
full-size masters, then shrunk to screen size.

TWO TRICKS ARE USED HERE
------------------------
1. "Lifting the ink" (make a sprite):
   The pen lines are darker than the paper around them. For every pixel
   we compare it with the lightest paper nearby. The darker it is than
   the paper, the more solid it becomes; plain paper becomes see-through.
   Result: a PNG of just the drawing (the stick man, the speech, ...).

2. "Rubbing out" (make a clean background):
   Where the ink was, we paint in a very blurry copy of the paper around
   it, so the drawing disappears and the paint/paper carries on underneath.

Makes, in ../assets/:
  intro_text.jpg   the three lines of text at the top of IMG-004
  mid_blank.jpg    the white stick panel + the yellow paper, all ink rubbed out
  stick.png        the stick man (Callum) on his own
  speech.png       "Draw me as I am, please"
  announce.png     "So, without further ado, let's transform Callum..." + arrow
  magic_blank.jpg  the lower watercolour panel with the dashed outline rubbed out
  outline.png      the dashed potato outline on its own
  final.jpg        top half of IMG-005: the potato and its top text

And layout.js (next to index.html), which tells main.js where each
sprite sits on its background, so everything lines up exactly.

Run:   python3 tools/prepare_pictures.py     then   python3 make_offline.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps, ImageFilter

HERE = Path(__file__).resolve().parent
SCENE = HERE.parent
STORY = HERE.parents[2]                      # .../storybook
OUT = SCENE / "assets"
WIDTH = 1280                                 # every background is made this wide


def open_master(name):
    """Open a master photo the right way up, and work out the scale factor."""
    img = ImageOps.exif_transpose(Image.open(STORY / "originals" / name)).convert("RGB")
    return img, img.height / 1000            # working copies are 1000 px tall


def cut_to_width(img, scale, box):
    """Cut a box (working-copy pixels) from the master, resize to WIDTH wide.
    Also return a function that turns working-copy points into pixels on
    the new picture (we need that to place the sprites)."""
    piece = img.crop(tuple(round(v * scale) for v in box))
    k = WIDTH / piece.width
    piece = piece.resize((WIDTH, round(piece.height * k)), Image.LANCZOS)
    zoom = WIDTH / (box[2] - box[0])         # working px -> new picture px
    to_px = lambda x, y: (round((x - box[0]) * zoom), round((y - box[1]) * zoom))
    return piece, to_px


def ink_strength(img):
    """0..255 for every pixel: how much darker it is than the paper nearby."""
    grey = np.asarray(img.convert("L"), dtype=np.float32)
    # The lightest pixel within a small square = the paper colour there.
    paper = np.asarray(img.convert("L").filter(ImageFilter.MaxFilter(15))
                       .filter(ImageFilter.GaussianBlur(6)), dtype=np.float32)
    darker = paper - grey
    # Below 22 is just paper texture; from there it ramps up to solid quickly.
    return np.clip((darker - 22) * 5, 0, 255)


def lift_ink(img, ink, region):
    """Make a see-through PNG of the ink inside 'region' (x0,y0,x1,y1 px)."""
    x0, y0, x1, y1 = region
    rgba = img.crop(region).convert("RGBA")
    alpha = ink[y0:y1, x0:x1].astype(np.uint8)
    rgba.putalpha(Image.fromarray(alpha))
    return rgba


def rub_out(img, ink, regions):
    """Hide the ink inside each region by painting blurry paper over it."""
    h, w = ink.shape
    # Which pixels to replace: the ink, made a bit fatter to catch its edges
    hole = np.zeros((h, w), np.uint8)
    for x0, y0, x1, y1 in regions:
        hole[y0:y1, x0:x1] = (ink[y0:y1, x0:x1] > 10) * 255
    hole = np.asarray(Image.fromarray(hole).filter(ImageFilter.MaxFilter(9)), np.float32) / 255

    # A blur that ignores the ink: blur (picture x good) and divide by blur(good).
    good = 1 - hole
    pic = np.asarray(img, np.float32)
    def blur(a, r=18):
        return np.asarray(Image.fromarray(a).filter(ImageFilter.GaussianBlur(r)), np.float32)
    weight = blur((good * 255).astype(np.uint8)) / 255 + 1e-3
    filled = np.stack([blur((pic[..., c] * good).astype(np.uint8)) / 255 / weight * 255
                       for c in range(3)], axis=-1)
    soft = np.asarray(Image.fromarray((hole * 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
    out = pic * (1 - soft) + np.clip(filled, 0, 255) * soft
    return Image.fromarray(out.astype(np.uint8))


def feather(img, colour, px=60):
    """Blend the edges of a picture into a flat colour, so it sits on a
    plain background of that colour without a hard line around it."""
    w, h = img.size
    edge = np.ones((h, w), np.float32)
    ramp = np.linspace(0, 1, px)
    edge[:px, :] *= ramp[:, None]; edge[-px:, :] *= ramp[::-1][:, None]
    edge[:, :px] *= ramp[None, :]; edge[:, -px:] *= ramp[None, ::-1]
    flat = np.array(colour, np.float32)
    out = np.asarray(img, np.float32) * edge[..., None] + flat * (1 - edge[..., None])
    return Image.fromarray(out.astype(np.uint8))


layout = {}                                  # sprite positions, saved to layout.js

def save_jpg(img, name):
    img.save(OUT / name, quality=88)
    print(name, img.size)

def save_sprite(img, ink, region_working, to_px, name):
    """Lift the ink in a working-copy box, save it, remember where it goes."""
    (x0, y0), (x1, y1) = to_px(*region_working[:2]), to_px(*region_working[2:])
    lift_ink(img, ink, (x0, y0, x1, y1)).save(OUT / (name + ".png"))
    layout[name] = {"x": x0, "y": y0}        # top-left corner on its background
    print(name + ".png", (x1 - x0, y1 - y0), "at", (x0, y0))
    return (x0, y0, x1, y1)


# =====================================================================
#  IMG-004 (04.jpg)
# =====================================================================
page, s = open_master("04.jpg")

# --- the intro text at the top ----------------------------------------
text, _ = cut_to_width(page, s, (140, 52, 612, 162))
# The paper colour, so the screen around the text can match it
paper = tuple(int(v) for v in np.median(np.asarray(text).reshape(-1, 3), axis=0))
layout["paper"] = "#%02x%02x%02x" % paper
save_jpg(feather(text, paper), "intro_text.jpg")

# --- the middle: stick panel on the left, announcement on the right ---
mid, to_px = cut_to_width(page, s, (78, 163, 622, 492))
ink = ink_strength(mid)
boxes = [
    save_sprite(mid, ink, (110, 242, 193, 458), to_px, "stick"),     # Callum
    save_sprite(mid, ink, (183, 183, 324, 292), to_px, "speech"),    # Draw me as I am
    save_sprite(mid, ink, (365, 248, 616, 378), to_px, "announce"),  # So, without...
]
save_jpg(feather(rub_out(mid, ink, boxes), paper), "mid_blank.jpg")
layout["mid"] = {"w": mid.width, "h": mid.height}

# --- the lower panel: watercolour with the dashed outline -------------
# This box is the same shape as the screen (1280 x 900), so it fills it.
low, to_px = cut_to_width(page, s, (62, 492, 652, 907))
ink = ink_strength(low)
box = save_sprite(low, ink, (308, 548, 462, 790), to_px, "outline")
save_jpg(rub_out(low, ink, [box]), "magic_blank.jpg")

# =====================================================================
#  IMG-005 (05.jpg): the potato, top half of the page, screen-shaped
# =====================================================================
page5, s5 = open_master("05.jpg")
final, _ = cut_to_width(page5, s5, (92, 72, 668, 477))
save_jpg(final, "final.jpg")

# ---- write layout.js ---------------------------------------------------
(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on its background (pixels, top-left).\n"
    "window.LAYOUT = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js", layout)

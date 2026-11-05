"""
prepare_pictures.py  -  cut the pictures for SC-03 "Flights of Fantasy Fun !"
                         out of the master photo of IMG-007 (06.jpg).

Boxes are measured on the 1000-pixel-tall working copy (working/IMG-007.jpg).
The picture tools themselves live in storybook/tools/picture_tricks.py.

Makes, in ../assets/:
  sky_blank.jpg   the top picture of IMG-007 with the plane, the words and
                  the storm cloud all rubbed out (just the sky)
  plane.png       the plane on its own (solid, so the sky doesn't show through)
  title.png       "Our story begins like any good story, with our
                   protagonists hurtling through a storm cloud."
  cloud.png       the blue storm cloud with its yellow lightning

And layout.js (next to index.html): where each sprite sits on the sky.

Run:   python3 tools/prepare_pictures.py     then   python3 make_offline.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCENE = HERE.parent
OUT = SCENE / "assets"
sys.path.insert(0, str(HERE.parents[2] / "tools"))  # storybook/tools
from picture_tricks import *                         # open_master, rub_out, ...


def colourfulness(img):
    """0..255 for every pixel: how strongly coloured it is (not grey/white).
    The storm cloud is bright blue and yellow; the sky around it is pale."""
    a = np.asarray(img, np.float32)
    strength = a.max(axis=2) - a.min(axis=2)        # 0 = grey, big = vivid
    return np.clip((strength - 45) * 4, 0, 255)


layout = {}

# The top picture of IMG-007, cut to the shape of the screen (1280 x 900)
page, s = open_master("06.jpg")
sky, to_px = cut_to_width(page, s, (100, 3, 672, 405))
ink = ink_strength(sky)

def box_px(box):
    """A working-copy box -> a box in pixels on the new picture."""
    (x0, y0), (x1, y1) = to_px(*box[:2]), to_px(*box[2:])
    return max(x0, 0), max(y0, 0), min(x1, sky.width), min(y1, sky.height)

def save_sprite(name, box, alpha):
    """Save a sprite: the picture inside 'box', see-through where alpha is 0."""
    x0, y0, x1, y1 = box
    sprite = sky.crop(box).convert("RGBA")
    sprite.putalpha(Image.fromarray(alpha.astype(np.uint8)))
    sprite.save(OUT / (name + ".png"))
    layout[name] = {"x": x0, "y": y0}
    print(name + ".png", sprite.size, "at", (x0, y0))

cover = np.zeros(ink.shape, np.float32)             # what to rub out (0..255)

# --- the words: just the ink ------------------------------------------
b = box_px((183, 8, 600, 82))
save_sprite("title", b, ink[b[1]:b[3], b[0]:b[2]])
cover[b[1]:b[3], b[0]:b[2]] = ink[b[1]:b[3], b[0]:b[2]]

# --- the plane: ink + its insides (and the two long lines above it) -----
b = box_px((140, 66, 366, 408))
alpha = fill_inside(ink, b)
save_sprite("plane", b, alpha)
cover[b[1]:b[3], b[0]:b[2]] = np.maximum(cover[b[1]:b[3], b[0]:b[2]], alpha)

# --- the storm cloud: the colourful paint + a solid round middle --------
b = box_px((405, 62, 658, 392))
x0, y0, x1, y1 = b
alpha = colourfulness(sky)[y0:y1, x0:x1]
round_middle = Image.new("L", (x1 - x0, y1 - y0), 0)
cx, cy = to_px(530, 216)                          # middle of the blue ball
rx, ry = 112 * (sky.width / 572), 125 * (sky.width / 572)   # its size
ImageDraw.Draw(round_middle).ellipse(
    [cx - x0 - rx, cy - y0 - ry, cx - x0 + rx, cy - y0 + ry], fill=255)
round_middle = round_middle.filter(ImageFilter.GaussianBlur(8))
alpha = np.maximum(alpha, np.asarray(round_middle, np.float32))
save_sprite("cloud", b, alpha)
cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], alpha)

# --- the empty sky -----------------------------------------------------
whole = (0, 0, sky.width, sky.height)
sky_blank = rub_out(sky, cover, [whole], soft_edge=4)
sky_blank.save(OUT / "sky_blank.jpg", quality=88)
print("sky_blank.jpg", sky_blank.size)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on the sky (pixels, top-left corner).\n"
    "window.LAYOUT3 = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js", layout)

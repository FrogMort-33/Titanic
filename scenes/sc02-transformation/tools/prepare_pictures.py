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
from PIL import Image, ImageOps, ImageFilter, ImageDraw

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
    """0..255 for every pixel: how much darker it is than the paper nearby.

    We judge darkness by each pixel's BRIGHTEST colour (red, green or blue).
    Black pen is dark in all three, but red paint is still bright in red,
    so the red watercolour doesn't get mistaken for ink."""
    bright = Image.fromarray(np.asarray(img).max(axis=2))
    grey = np.asarray(bright, dtype=np.float32)
    # The lightest pixel within a small square = the paper colour there.
    paper = np.asarray(bright.filter(ImageFilter.MaxFilter(15))
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


def fill_holes(pic, good):
    """Fill the holes in a picture from the colours around them.

    "Push-pull": shrink the picture to half size again and again (holes
    get smaller each time, until they vanish), then grow it back,
    using the small, hole-free versions to fill the holes at each size.
    pic:  the picture (height x width x 3);  good: 1 = keep, 0 = hole."""
    h, w = good.shape
    if min(h, w) <= 2 or good.min() > 0.99:
        return pic
    # Shrink: average each 2x2 block, counting only the good pixels
    H, W = (h + 1) // 2 * 2, (w + 1) // 2 * 2
    pp = np.zeros((H, W, 3), np.float32); pp[:h, :w] = pic * good[..., None]
    gg = np.zeros((H, W), np.float32);    gg[:h, :w] = good
    sum_p = pp.reshape(H // 2, 2, W // 2, 2, 3).sum(axis=(1, 3))
    sum_g = gg.reshape(H // 2, 2, W // 2, 2).sum(axis=(1, 3))
    small = sum_p / np.maximum(sum_g, 1e-6)[..., None]
    small = fill_holes(small, np.minimum(sum_g, 1))           # fill the smaller one first
    # Grow it back smoothly to full size
    big = np.stack([np.asarray(Image.fromarray(small[..., c].astype(np.float32), "F")
                               .resize((W, H), Image.BILINEAR)) for c in range(3)], -1)[:h, :w]
    return pic * good[..., None] + big * (1 - good[..., None])


def rub_out(img, ink, regions, soft_edge=2):
    """Hide the ink inside each region by painting the paper over it."""
    h, w = ink.shape
    # Which pixels to replace: the ink, made a bit fatter to catch its edges
    hole = np.zeros((h, w), np.uint8)
    for x0, y0, x1, y1 in regions:
        hole[y0:y1, x0:x1] = (ink[y0:y1, x0:x1] > 10) * 255
    hole = np.asarray(Image.fromarray(hole).filter(ImageFilter.MaxFilter(11)), np.float32) / 255

    pic = np.asarray(img, np.float32)
    filled = fill_holes(pic, 1 - hole)
    # Soften the filled part a touch so it looks like paint, not pixels
    filled = np.asarray(Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8))
                        .filter(ImageFilter.GaussianBlur(3)), np.float32)
    soft = np.asarray(Image.fromarray((hole * 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(soft_edge)), np.float32)[..., None] / 255
    out = pic * (1 - soft) + filled * soft
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


def fill_inside(ink, region):
    """For a head: the outline's ink PLUS everything inside the outline,
    so the pale face comes too (not just its lines).
    How: paint the outside of the head starting from a corner, like the
    paint-bucket tool. Whatever the paint can't reach is inside the head."""
    x0, y0, x1, y1 = region
    lines = Image.fromarray(((ink[y0:y1, x0:x1] > 40) * 255).astype(np.uint8))
    lines = lines.filter(ImageFilter.MaxFilter(5))   # fatten lines to close tiny gaps
    lines = Image.fromarray(np.pad(np.asarray(lines), 2)).copy()   # a border so paint flows
                                                     # all round (.copy() so it can be painted)
    ImageDraw.floodfill(lines, (0, 0), 128)          # 128 = "outside"
    inside = (np.asarray(lines)[2:-2, 2:-2] != 128) * 255
    # Solid inside the head, and the normal soft ink for hair etc. outside it
    solid = np.asarray(Image.fromarray(inside.astype(np.uint8))
                       .filter(ImageFilter.GaussianBlur(1.5)), np.float32)
    return np.maximum(solid, ink[y0:y1, x0:x1])


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

# =====================================================================
#  IMG-005 bottom half (IMG-006 is a close-up of it): the spud family
# =====================================================================
# Everything that pops in later is lifted off as a sprite and rubbed out
# of the background: the text on the left, each head, each name, and
# the line at the bottom (that one becomes the Star Wars crawl instead).
spuds, to_px = cut_to_width(page5, s5, (55, 488, 705, 945))
ink = ink_strength(spuds)
holes = []                                   # areas to rub out

holes.append(save_sprite(spuds, ink, (92, 560, 232, 792), to_px, "spud_text"))

# Each person: the box round their head, and the box round their name
# (working-copy pixels on IMG-005, measured on a zoomed grid).
PEOPLE = [
    #  name        head box                 name box
    ("enda",     (370, 565, 420, 631),    (367, 630, 420, 650)),
    ("annelisa", (434, 564, 492, 630),    (437, 628, 506, 646)),
    ("rosie",    (281, 654, 336, 730),    (285, 728, 333, 748)),
    ("joe",      (360, 649, 405, 718),    (355, 717, 393, 743)),
    ("connor",   (444, 645, 484, 717),    (437, 712, 485, 730)),
    ("natasha",  (500, 620, 560, 711),    (494, 706, 560, 726)),
    ("rhianna",  (316, 740, 370, 817),    (304, 816, 363, 835)),
    ("callum",   (399, 742, 455, 822),    (394, 819, 446, 837)),
    ("leon",     (480, 730, 534, 815),    (485, 811, 530, 831)),
]
layout["people"] = []
for name, head_box, name_box in PEOPLE:
    # Head: solid sprite (pale face and all), so its whole oval disappears
    (x0, y0), (x1, y1) = to_px(*head_box[:2]), to_px(*head_box[2:])
    alpha = fill_inside(ink, (x0, y0, x1, y1))
    head = spuds.crop((x0, y0, x1, y1)).convert("RGBA")
    head.putalpha(Image.fromarray(alpha.astype(np.uint8)))
    head.save(OUT / f"head_{name}.png")
    holes.append((x0, y0, x1, y1, alpha))   # rub out the whole head shape
    # Name: just the ink
    nb = save_sprite(spuds, ink, name_box, to_px, f"name_{name}")
    holes.append(nb)
    layout["people"].append({"name": name, "head": {"x": x0, "y": y0},
                             "label": layout.pop(f"name_{name}")})

# The bottom line "Now onto our grandest adventure!" - rubbed out only
(bx0, by0), (bx1, by1) = to_px(190, 900), to_px(562, 945)
holes.append((bx0, by0, bx1, min(by1, spuds.height)))

# Rub out: the ink of every sprite, and for heads the whole head shape
# (so no pale empty ovals are left behind as a clue).
cover = ink.copy()
for h in holes:
    if len(h) == 5:                          # a head, with its own shape
        x0, y0, x1, y1, alpha = h
        cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], alpha)
save_jpg(rub_out(spuds, cover, [h[:4] for h in holes], soft_edge=4), "spuds_blank.jpg")


# ---- write layout.js ---------------------------------------------------
(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on its background (pixels, top-left).\n"
    "window.LAYOUT = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js", layout)

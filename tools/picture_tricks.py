"""
picture_tricks.py  -  the picture tools every scene's prepare_pictures.py uses.

  open_master(name)        open a master photo the right way up
  cut_to_width(...)        cut a box out of it, resized to 1280 wide
  ink_strength(img)        how "inky" each pixel is (dark pen lines)
  lift_ink(...)            make a see-through PNG of just the ink
  fill_inside(ink, box)    ink PLUS everything inside its outline (solid shapes)
  rub_out(...)             paint over things so they disappear from a background
  feather(img, colour)     blend a picture's edges into a flat colour

A scene uses them like this (see scenes/sc03-flight/tools/prepare_pictures.py):

    import sys; sys.path.insert(0, str(STORY / "tools"))
    from picture_tricks import *

(Scenes 1 and 2 were made before this file existed and keep their own copies.)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageDraw

STORY = Path(__file__).resolve().parents[1]  # .../storybook
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

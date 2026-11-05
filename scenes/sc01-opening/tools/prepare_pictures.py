"""
prepare_pictures.py  -  cut the pictures this scene needs out of the master photos.

Boxes are measured on the 1000-pixel-tall working copies (easy to look at),
then scaled up so we cut from the full-size masters (sharpest result).

Makes, in ../assets/:
  cover.jpg         the painting on the cover of IMG-001 (no title text)
  panel_top.jpg     the top panel of IMG-002 (the screaming bus)
  panel_bottom.jpg  the bottom panel of IMG-002 (The Titanic Club road)
  bus.png           the bus on its own, with a see-through background
  quote.jpg         Annelisa's quote from IMG-003
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
STORY = HERE.parents[2]                      # .../storybook
OUT = HERE.parent / "assets"
WIDTH = 1280                                 # every background is made this wide


def open_master(name):
    """Open a master photo the right way up, and work out the scale factor."""
    img = ImageOps.exif_transpose(Image.open(STORY / "originals" / name)).convert("RGB")
    scale = img.height / 1000                # working copies are 1000 px tall
    return img, scale


def cut(img, scale, box):
    """Cut a box (given in working-copy pixels) out of the master."""
    return img.crop(tuple(round(v * scale) for v in box))


def save_background(img, name):
    img = img.resize((WIDTH, round(img.height * WIDTH / img.width)), Image.LANCZOS)
    img.save(OUT / name, quality=88)
    print(name, img.size)


# --- IMG-001: the cover painting --------------------------------------
cover, s = open_master("01_cover.jpg")
save_background(cut(cover, s, (122, 408, 655, 765)), "cover.jpg")

# --- IMG-002: two panels ------------------------------------------------
page, s = open_master("02.jpg")
save_background(cut(page, s, (62, 84, 612, 468)), "panel_top.jpg")
save_background(cut(page, s, (42, 514, 636, 966)), "panel_bottom.jpg")

# --- IMG-003: Annelisa's quote (cropped to the screen's shape) -------
quote, s3 = open_master("03.jpg")
save_background(cut(quote, s3, (120, 224, 640, 590)), "quote.jpg")

# --- IMG-002: the bus as a cut-out ------------------------------------
# The bus outline is traced by hand as one shape (the body) plus two
# circles (the wheels). Everything outside that shape becomes see-through.
box = (128, 178, 522, 474)                   # area around the bus
bus = cut(page, s, box).convert("RGBA")

mask = Image.new("L", bus.size, 0)           # black = hidden, white = kept
d = ImageDraw.Draw(mask)
def pt(x, y):                                # working-copy point -> cut-out pixel
    return ((x - box[0]) * s, (y - box[1]) * s)
# corners of the body, then along the wavy bottom edge between the wheels
body = [pt(147, 201), pt(506, 192), pt(511, 410), pt(468, 402), pt(375, 396),
        pt(300, 401), pt(268, 396), pt(178, 400), pt(141, 416)]
d.polygon(body, fill=255)
for cx, cy, r in [(221, 416, 47), (421, 406, 46)]:          # the two wheels
    x, y = pt(cx, cy)
    d.ellipse([x - r * s, y - r * s, x + r * s, y + r * s], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(2))              # soften the edge a touch
bus.putalpha(mask)
bus = bus.resize((bus.width // 3, bus.height // 3), Image.LANCZOS)
bus.save(OUT / "bus.png")
print("bus.png", bus.size)

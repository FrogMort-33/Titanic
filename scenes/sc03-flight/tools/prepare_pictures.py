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
 Part 2 (IMG-008, inside the plane):
  cabin_blank.jpg  the cabin with the bean, window lightning and words rubbed out
  bean.png         the broad bean (only the part above the seat)
  window_flash.png the yellow lightning in the window
  cabin_text.png   "The Titanic Club kept their cool, unlike the petrified..."
 Part 3 (IMG-009, turbulence):
  turb_blank.jpg   the page with all three planes and springs rubbed out
  boing.png        the middle plane and its "Weeeee" spring
  text_rest1.png, text_rest2.png   the words after ", closed airport,"

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

# --- the plane: ink + its insides --------------------------------------
b = box_px((140, 66, 366, 408))
alpha = fill_inside(ink, b)
# Rub out (from the background) everything, including the two long
# vertical lines through the plane...
cover[b[1]:b[3], b[0]:b[2]] = np.maximum(cover[b[1]:b[3], b[0]:b[2]], alpha)

# ...but leave those two lines OFF the plane sprite (Enda: not needed).
# Each line is traced as a few points (x, y) on IMG-007, measured by
# looking for the dark line row by row. Line 2 bends a little.
# On every row we cover the line with a short blend from the pixel just
# left of it to the pixel just right of it - for the colour AND the
# see-through-ness. Above the plane both sides are see-through, so the
# line vanishes; inside the plane both sides are white, so it's painted white.
LINES = [
    [(215.5, 66), (215.5, 200), (214.6, 300), (214.6, 305)],
    [(260.7, 66), (260.7, 120), (262.3, 160), (264, 200), (267.5, 230),
     (269, 250), (270.8, 270), (271, 292)],
]
rgb = np.asarray(sky.crop(b), np.float32).copy()
alpha = alpha.astype(np.float32).copy()
half = 7                                            # half the width we paint over
for points in LINES:
    px_points = [to_px(x, y) for x, y in points]    # -> picture pixels
    ys = [p[1] - b[1] for p in px_points]
    xs = [p[0] - b[0] for p in px_points]
    for row in range(max(ys[0], 0), min(ys[-1], rgb.shape[0])):
        x = int(round(np.interp(row, ys, xs)))       # where the line is on this row
        x0, x1 = x - half, x + half
        mix = np.linspace(0, 1, x1 - x0)
        for layer in [rgb[..., 0], rgb[..., 1], rgb[..., 2], alpha]:
            left, right = layer[row, x0 - 1], layer[row, x1]
            layer[row, x0:x1] = left * (1 - mix) + right * mix
# Little specks of sky texture above the plane's top wing: not the plane
alpha[: to_px(0, 178)[1] - b[1]] = 0
plane = Image.fromarray(rgb.astype(np.uint8)).convert("RGBA")
plane.putalpha(Image.fromarray(alpha.astype(np.uint8)))
plane.save(OUT / "plane.png")
layout["plane"] = {"x": b[0], "y": b[1]}
print("plane.png", plane.size, "(vertical lines taken out)")

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

# =====================================================================
#  PART 2: inside the plane  (IMG-008 = 06_closeup.jpg, turned 270)
# =====================================================================
page8, s8 = open_master("06_closeup.jpg", rotate_clockwise=270)
cabin, to_px8 = cut_to_width(page8, s8, (5, 25, 995, 721))   # screen-shaped
ink8 = ink_strength(cabin)
cover8 = np.zeros(ink8.shape, np.float32)
def px8(box):
    (x0, y0), (x1, y1) = to_px8(*box[:2]), to_px8(*box[2:])
    return max(x0, 0), max(y0, 0), min(x1, cabin.width), min(y1, cabin.height)
def sprite8(name, box, alpha):
    x0, y0, x1, y1 = box
    im = cabin.crop(box).convert("RGBA")
    im.putalpha(Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)))
    im.save(OUT / (name + ".png"))
    layout[name] = {"x": x0, "y": y0}
    cover8[y0:y1, x0:x1] = np.maximum(cover8[y0:y1, x0:x1], alpha)
    print(name + ".png", im.size, "at", (x0, y0))

# The words at the bottom
b = px8((118, 612, 962, 732))
sprite8("cabin_text", b, ink8[b[1]:b[3], b[0]:b[2]])

# The lightning in the window: yellow = lots of red AND green, little blue
b = px8((742, 66, 868, 198))
a8 = np.asarray(cabin, np.float32)[b[1]:b[3], b[0]:b[2]]
yellow = np.minimum(a8[..., 0], a8[..., 1]) - a8[..., 2]
sprite8("window_flash", b, np.clip((yellow - 40) * 4, 0, 255))

# The broad bean peeping over the seat. Only the part ABOVE the top edge
# of the seat (a straight line from (240,327) to (500,162) on IMG-008),
# so the seat's own line stays in the background. main.js makes her pop
# up by growing her upwards from that edge.
b = px8((258, 128, 414, 292))
x0, y0, x1, y1 = b
bean = fill_inside(ink8, b)
(lx0, ly0), (lx1, ly1) = to_px8(240, 327), to_px8(500, 162)
xs = np.arange(x0, x1)[None, :]
ys = np.arange(y0, y1)[:, None]
seat_y = ly0 + (xs - lx0) * (ly1 - ly0) / (lx1 - lx0)     # the seat edge, column by column
above_seat = ys < seat_y - 4
# ...plus her two little hands gripping the seat top (they hang over it)
for hand in [(318, 258, 340, 288), (386, 216, 410, 242)]:
    (hx0, hy0), (hx1, hy1) = to_px8(*hand[:2]), to_px8(*hand[2:])
    above_seat |= (xs >= hx0) & (xs < hx1) & (ys >= hy0) & (ys < hy1)
bean = np.where(above_seat, bean, 0)
sprite8("bean", b, bean)
layout["seat_edge"] = [[lx0, ly0], [lx1, ly1]]           # for the "behind the seat" mask

# The green spud's face (she screams): where her eyes and mouth are
layout["spud_face"] = {"eye1": to_px8(390, 295), "eye2": to_px8(418, 287),
                       "mouth": to_px8(411, 308), "size": round(9 * cabin.width / 990)}
# The seatbelt sign (the camera starts zoomed in on it)
layout["sign"] = to_px8(418, 70)

cabin_blank = np.asarray(rub_out(cabin, cover8, [(0, 0, cabin.width, cabin.height)],
                                 soft_edge=4)).copy()
# Rubbing out the bean also smudged the seat's top edge just below her,
# so paint that thin strip of the ORIGINAL picture back on top.
X0, Y0, X1, Y1 = b
strip = np.abs(ys - seat_y) < 7                     # 7 px either side of the edge
strip &= ~(above_seat & (ys >= seat_y - 4))          # but not her hands (main.js draws
                                                     # the edge line over those gaps)
region = cabin_blank[Y0:Y1, X0:X1]
region[strip] = np.asarray(cabin)[Y0:Y1, X0:X1][strip]
Image.fromarray(cabin_blank).save(OUT / "cabin_blank.jpg", quality=88)
print("cabin_blank.jpg")


# =====================================================================
#  PART 3: life-affirming turbulence  (IMG-009 = 07.jpg, turned 270)
# =====================================================================
page9, s9 = open_master("07.jpg", rotate_clockwise=270)
turb, to_px9 = cut_to_width(page9, s9, (140, 56, 916, 732))
ink9 = ink_strength(turb)
cover9 = np.zeros(ink9.shape, np.float32)
def px9(box):
    (x0, y0), (x1, y1) = to_px9(*box[:2]), to_px9(*box[2:])
    return max(x0, 0), max(y0, 0), min(x1, turb.width), min(y1, turb.height)
def sprite9(name, box, alpha):
    x0, y0, x1, y1 = box
    im = turb.crop(box).convert("RGBA")
    im.putalpha(Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)))
    im.save(OUT / (name + ".png"))
    layout[name] = {"x": x0, "y": y0}
    cover9[y0:y1, x0:x1] = np.maximum(cover9[y0:y1, x0:x1], alpha)
    print(name + ".png", im.size, "at", (x0, y0))

# The middle plane with its "Weeeee" spring: this one goes BOING
b = px9((444, 152, 598, 602))
sprite9("boing", b, fill_inside(ink9, b))
# The other two planes and their springs: just rubbed out
for box in [(228, 380, 392, 604), (718, 400, 862, 596)]:
    b = px9(box)
    a = fill_inside(ink9, b)
    cover9[b[1]:b[3], b[0]:b[2]] = np.maximum(cover9[b[1]:b[3], b[0]:b[2]], a)
# The words after ", closed airport," (end of line 1, then lines 2 and 3)
b = px9((798, 610, 884, 650)); sprite9("text_rest1", b, ink9[b[1]:b[3], b[0]:b[2]])
b = px9((176, 648, 884, 724)); sprite9("text_rest2", b, ink9[b[1]:b[3], b[0]:b[2]])
# This page is taller than the screen, so it will be shrunk to fit and
# sit on a background the colour of the paper (taken from its bottom edge).
paper9 = np.median(np.asarray(turb)[-20:].reshape(-1, 3), axis=0).astype(int)
layout["turb"] = {"w": turb.width, "h": turb.height,
                  "paper": "#%02x%02x%02x" % tuple(paper9)}

rub_out(turb, cover9, [(0, 0, turb.width, turb.height)], soft_edge=4) \
    .save(OUT / "turb_blank.jpg", quality=88)
print("turb_blank.jpg", turb.size)


(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on the sky (pixels, top-left corner).\n"
    "window.LAYOUT3 = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js", layout)

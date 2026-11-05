"""
prepare_pictures.py  -  cut the pictures for SC-04 "Le Taxi at Lyon"
                         out of the master photo of IMG-010 (08.jpg, turned 270).

Boxes are measured on the working copy (working/IMG-010.jpg, 1000 x 751).
The picture tools live in storybook/tools/picture_tricks.py.

Makes, in ../assets/:
  airport_blank.jpg  the airport with the family, taxis, drivers, plane,
                     lightning and speech bubble all rubbed out
                     (the French potato with the shopping trolley stays)
  plane_shadow.png   the black plane silhouette
  zap.png            the little yellow lightning
  family.png         our family of potatoes
  bubble.png         "umm... which taxi do we get?"
  taxi1.png, taxi2.png        the two taxis (without their drivers)
  driver1.png, driver2.png    the two taxi drivers

And layout.js: where each sprite sits on the airport (pixels, top-left).

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

page, s = open_master("08.jpg", rotate_clockwise=270)
pic, to_px = cut_to_width(page, s, (42, 66, 962, 713))   # screen-shaped
rgb = np.asarray(pic, np.float32)

# Two ways of finding "the drawing" in this picture:
# 1. MARKER: the thick black felt-tip lines. The grey pencil shading all
#    over the background is much lighter, so "very dark" = marker only.
marker = ((rgb.max(axis=2) < 95) * 255).astype(np.float32)
# 2. YELLOW (for the lightning): lots of red and green, little blue.
yellow = np.clip((np.minimum(rgb[..., 0], rgb[..., 1]) - rgb[..., 2] - 40) * 4, 0, 255)

layout = {}
cover = np.zeros(marker.shape, np.float32)          # what to rub out

def px(box):
    (x0, y0), (x1, y1) = to_px(*box[:2]), to_px(*box[2:])
    return max(x0, 0), max(y0, 0), min(x1, pic.width), min(y1, pic.height)

def save_sprite(name, box, alpha):
    x0, y0, x1, y1 = box
    im = pic.crop(box).convert("RGBA")
    im.putalpha(Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)))
    im.save(OUT / (name + ".png"))
    layout[name] = {"x": x0, "y": y0}
    cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], alpha)
    print(name + ".png", im.size, "at", (x0, y0))

def solid(box, leave_out=()):   # (used for the plane silhouette)
    """Marker lines + everything they enclose (see fill_inside).
    leave_out: boxes whose marker lines are ignored (someone standing on
    top of a taxi is not part of the taxi)."""
    lines = marker.copy()
    for lb in leave_out:
        x0, y0, x1, y1 = px(lb)
        lines[y0:y1, x0:x1] = 0
    return fill_inside(lines, px(box))

# Hand-traced outlines (working-copy points). In this picture the grey
# pencil shading is nearly as dark as the black pen, so the computer can't
# reliably tell "drawing" from "background" by itself. So for the taxis,
# drivers and family we trace their outline by hand as a list of points.
def outline(points):
    """A soft-edged mask (0..255) of a hand-traced shape, the size of the picture."""
    m = Image.new("L", pic.size, 0)
    ImageDraw.Draw(m).polygon([to_px(x, y) for x, y in points], fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(1.5)), np.float32)

def sprite_from_outline(name, *shapes, trim=False):
    """Save a sprite whose see-through-ness comes from one or more traced shapes.
    trim=True: also cut away the grey pencil background left inside the
    traced shape (my tracing is a bit loose around the drivers)."""
    mask = np.zeros(marker.shape, np.float32)
    for points in shapes:
        mask = np.maximum(mask, outline(points))
    ys, xs = np.nonzero(mask)
    box = tuple(int(v) for v in (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))   # plain numbers for layout.js
    alpha = mask[box[1]:box[3], box[0]:box[2]]
    if trim:
        alpha = np.minimum(alpha, not_background(box, alpha))
    save_sprite(name, box, alpha)

def not_background(box, shape_mask):
    """Everything in the box EXCEPT grey pencil background that can be
    reached from outside the traced shape (paint-bucket again, as in
    fill_inside): grey shading INSIDE a driver (his trousers) is kept,
    because his black outline stops the paint getting in."""
    x0, y0, x1, y1 = box
    c = rgb[y0:y1, x0:x1]
    hi, lo = c.max(axis=2), c.min(axis=2)
    grey = ((hi - lo) < 0.10 * hi) & (hi > 90) & (hi < 200)    # dull, not black, not white
    # "walls" the paint can't cross: everything that isn't grey, made a
    # little fatter so tiny gaps in his outline are closed
    walls = Image.fromarray((~grey * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    passable = (np.asarray(walls) == 0) | (shape_mask < 128)     # paint can flow here
    im = Image.fromarray(np.pad(np.where(passable, 0, 255).astype(np.uint8), 2)).copy()
    ImageDraw.floodfill(im, (0, 0), 128)
    keep = (np.asarray(im)[2:-2, 2:-2] != 128).astype(np.uint8) * 255
    keep = Image.fromarray(keep).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))  # tidy specks
    return np.asarray(keep.filter(ImageFilter.GaussianBlur(1)), np.float32)

# --- the drivers ------------------------------------------------------
sprite_from_outline("driver1",
    [(412, 283), (425, 270), (445, 268), (470, 262), (510, 262), (535, 268), (546, 282),
     (546, 330), (532, 385), (510, 402), (458, 402), (440, 392), (425, 372), (420, 335),
     (418, 310), (410, 300)],
    [(452, 398), (465, 398), (465, 446), (452, 446)],             # left leg
    [(496, 398), (509, 398), (509, 446), (496, 446)],             # right leg
    [(438, 440), (476, 440), (476, 463), (438, 463)],             # left foot
    [(480, 440), (516, 440), (516, 463), (480, 463)],             # right foot
    trim=True)
sprite_from_outline("driver2",
    [(600, 345), (625, 318), (660, 312), (690, 322), (712, 340), (722, 375), (722, 420),
     (710, 450), (690, 468), (680, 478), (684, 522), (612, 522), (616, 478), (600, 462),
     (598, 420), (588, 405), (590, 385), (598, 375)],
    trim=True)

# --- the taxis (their drivers are separate sprites) --------------------
sprite_from_outline("taxi1",
    [(118, 548), (222, 540), (306, 537), (309, 483), (318, 470), (392, 466), (392, 430),
     (428, 430), (428, 462), (525, 458), (533, 470), (538, 605), (470, 615), (470, 640),
     (420, 640), (420, 617), (190, 628), (190, 642), (120, 642), (118, 628)])
sprite_from_outline("taxi2",
    [(578, 527), (760, 505), (760, 440), (850, 440), (850, 400), (883, 400), (883, 438),
     (968, 436), (968, 602), (705, 612), (705, 624), (630, 624), (630, 614), (578, 614)])

# --- the family, and their speech bubble -------------------------------
sprite_from_outline("family",
    [(45, 358), (58, 340), (70, 330), (95, 326), (115, 338), (132, 333), (150, 340),
     (172, 340), (190, 322), (205, 308), (225, 307), (242, 322), (255, 322), (260, 300),
     (280, 297), (300, 305), (303, 318), (318, 323), (335, 320), (360, 318), (376, 328),
     (384, 355), (387, 402), (330, 414), (290, 422), (240, 432), (190, 442), (140, 452),
     (90, 458), (45, 472)])
# The speech bubble: a hand-traced cloud (solid, writing and all), plus
# just the ink of its little tail "(" underneath.
cloud = outline([(80, 215), (90, 198), (130, 193), (200, 190), (280, 192), (345, 200),
                 (352, 225), (345, 245), (300, 258), (230, 262), (150, 262), (100, 255), (80, 240)])
tail = np.zeros_like(cloud)
tx0, ty0 = to_px(158, 262); tx1, ty1 = to_px(186, 304)
tail[ty0:ty1, tx0:tx1] = ink_strength(pic)[ty0:ty1, tx0:tx1]
both = np.maximum(cloud, tail)
ys, xs = np.nonzero(both > 20)
b = tuple(int(v) for v in (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
alpha = both[b[1]:b[3], b[0]:b[2]]
save_sprite("bubble", b, alpha)

# --- the plane silhouette and its lightning ---------------------------
PLANE = (585, 80, 670, 145)
b = px(PLANE)
save_sprite("plane_shadow", b, solid(PLANE))   # ("plane" is taken by scene 3)
ZAP = (528, 64, 582, 104)
b = px(ZAP)
save_sprite("zap", b, yellow[b[1]:b[3], b[0]:b[2]])

# --- the empty airport --------------------------------------------------
# Rubbing out leaves smooth, blurry patches, which look odd on this
# pencil-shaded picture. So we draw our own pencil shading on top:
#   1. start with "noise" (random speckles, like TV static)
#   2. smear it in one direction (a "motion blur"), so the speckles
#      become long thin streaks, like pencil strokes
#   3. add those strokes to the rubbed-out places only.
# The wall is shaded with diagonal strokes, the road with flatter ones,
# matching the way they were coloured in.
whole = (0, 0, pic.width, pic.height)
blank = np.asarray(rub_out(pic, cover, [whole], soft_edge=4), np.float32)

def pencil(angle, stroke_length, seed):
    """Fake pencil strokes over the whole picture: +/- brightness changes."""
    rng = np.random.default_rng(seed)
    big = int(max(pic.size) * 1.5)                 # bigger, so turning leaves no corners
    speckles = Image.fromarray(rng.integers(0, 256, (big, big), dtype=np.uint8))
    # smear sideways: average each speckle with its neighbours along a line
    streaks = np.asarray(speckles, np.float32)
    k = np.ones(stroke_length) / stroke_length
    streaks = np.apply_along_axis(lambda row: np.convolve(row, k, "same"), 1, streaks)
    streaks = Image.fromarray(np.clip(streaks, 0, 255).astype(np.uint8)).rotate(angle)
    x0, y0 = (big - pic.width) // 2, (big - pic.height) // 2
    out = np.asarray(streaks.crop((x0, y0, x0 + pic.width, y0 + pic.height)), np.float32)
    out = (out - out.mean()) / out.std()           # average 0, "size" 1
    return out[..., None]

def strength(box):
    """How strongly the real pencil shading wobbles in a sample patch."""
    patch = pic.crop(px(box)).convert("L")
    detail = np.asarray(patch, np.float32) - np.asarray(patch.filter(ImageFilter.GaussianBlur(6)), np.float32)
    return detail.std()

road = pencil(angle=8, stroke_length=7, seed=1) * strength((44, 478, 112, 540)) * 0.9
wall = pencil(angle=-35, stroke_length=9, seed=2) * strength((470, 190, 560, 262)) * 0.9

# Which parts are road? Below the road edge, which runs at about working
# y 395 on the left and y 378 on the right of the picture.
yy, xx = np.mgrid[0:pic.height, 0:pic.width]
road_top = to_px(0, 395)[1] + (to_px(0, 378)[1] - to_px(0, 395)[1]) * xx / pic.width
is_road = (yy > road_top)[..., None]

# Smooth out blotches in the rubbed-out road by pulling it towards the
# road's usual colour.
road_colour = np.median(np.asarray(pic.crop(px((44, 478, 112, 540))), np.float32).reshape(-1, 3), axis=0)
where = np.asarray(Image.fromarray(np.clip(cover, 0, 255).astype(np.uint8))
                   .filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(4)),
                   np.float32)[..., None] / 255         # the rubbed-out places
wall_colour = np.median(np.asarray(pic.crop(px((70, 90, 200, 180))), np.float32).reshape(-1, 3), axis=0)
blank = np.where(is_road, blank * (1 - 0.6 * where) + road_colour * 0.6 * where,
                          blank * (1 - 0.5 * where) + wall_colour * 0.5 * where)
# Only shade inside the drawing's frame, not on the yellow page around it
fx0, fy0 = to_px(47, 70); fx1, fy1 = to_px(992, 652)
in_frame = np.zeros_like(where); in_frame[max(fy0, 0):fy1, max(fx0, 0):fx1] = 1
blank = blank + np.where(is_road, road, wall) * where * in_frame

# 4. Better still, where we can: COPY real pencil shading from a nearby
#    spot that wasn't rubbed out (like the "clone" brush in a paint
#    program). For each rubbed-out pixel we try a few shifts in turn
#    (up, sideways...) and take the first one that lands on clean
#    wall. (Only the walls: copying the road dragged taxi wheels and
#    shadows along with it, so the road keeps its fake pencil.)
#    The pale inner wall (the big rectangle, from about working x 452,
#    y 178) and the darker outer wall are kept apart, and we never copy
#    from close to the rectangle's black edge (it would copy the line).
clean = np.asarray(Image.fromarray(np.clip(cover, 0, 255).astype(np.uint8))
                   .filter(ImageFilter.MaxFilter(15)), np.float32) < 10
need = (where[..., 0] > 0.02) & (in_frame[..., 0] > 0)
road2d = is_road[..., 0]
ix, iy = to_px(452, 178)                               # inner wall's top-left corner
inner = (xx >= ix) & (yy >= iy)
near_edge = ((np.abs(xx - ix) < 14) & (yy >= iy - 14)) | ((np.abs(yy - iy) < 14) & (xx >= ix - 14))
clean &= ~near_edge
cloned = np.zeros(need.shape, bool)
copy = blank.copy()
shifts = {False: [(0, -150), (0, -300), (-170, 0), (170, 0), (-340, 0), (340, 0), (0, 150)],   # wall
          True:  [(-220, 0), (220, 0), (-440, 0), (440, 0), (-660, 0), (660, 0), (0, 160)]}   # road
for want_road in (False,):
    for dx, dy in shifts[want_road]:
        ys, xs = np.nonzero(need & ~cloned & (road2d == want_road))
        sx, sy = xs + dx, ys + dy
        ok = (sx >= 0) & (sx < pic.width) & (sy >= 0) & (sy < pic.height)
        ys, xs, sx, sy = ys[ok], xs[ok], sx[ok], sy[ok]
        good = (clean[sy, sx] & (road2d[sy, sx] == want_road) & (in_frame[sy, sx, 0] > 0)
                & (inner[sy, sx] == inner[ys, xs]) & ~near_edge[ys, xs])
        copy[ys[good], xs[good]] = rgb[sy[good], sx[good]]
        cloned[ys[good], xs[good]] = True
print("cloned", int(cloned.sum()), "of", int(need.sum()), "rubbed-out pixels")
blank = blank * (1 - where) + copy * where             # soft edges, like before
# 5. The inner wall's left edge (a black line) was partly behind a
#    driver, so draw it back in, down to the road.
final = Image.fromarray(np.clip(blank, 0, 255).astype(np.uint8))
ImageDraw.Draw(final).line([(ix, iy), (ix, int(road_top[0, ix]))], fill=(38, 36, 34), width=3)
final.save(OUT / "airport_blank.jpg", quality=88)
print("inner wall corner", (ix, iy))
print("airport_blank.jpg", pic.size)

layout["clock"] = to_px(820, 105)                 # the camera starts zoomed in here
(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on the airport (pixels, top-left corner).\n"
    "window.LAYOUT4 = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js", layout)

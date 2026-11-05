"""
prepare_pictures.py  -  cut the pictures for EPISODE 6 "Uber World, Part Deux"

  PANEL 1 (one screen, made of three pieces of page 11):
     left:         the street map            (IMG-017, master 11_map_closeup.jpg)
     top right:    "The first Uber driver kindly dropped off..."
     bottom right: six helmets in the Uber   (both IMG-018, master 11_faces_closeup.jpg)
  PANEL 2: the chickens                      (IMG-019, master 11_chickens_closeup.jpg)

Boxes are measured on the working copies (working/IMG-0xx.jpg, 1000 px
on the long side). The picture tools live in storybook/tools/picture_tricks.py.

Makes, in ../assets/:
  map_blank.jpg         panel 1's whole screen: the EMPTY road on the left
                        (no cars, no words), plain paper on the right
  car1..car10.png       the red and blue cars (with their little motion lines)
  uber_top.png          the pink Uber, seen from above
  driver_says.png       "Driver: This is where you have to get out"
  dropped_text.png      "The first Uber driver kindly dropped off..."
  helmets.png           the six helmets panel, everyone in it
  helmets_empty.png     the same, with only the driver left
  helmet_head1..5.png   the five passengers' faces (they pop out)
  chicken_blank.jpg     panel 2, empty: no chickens, no words
  quickly_text.png      "Quickly, they ran to safety, like adrenaline-soaked chickens..."
  chickens.png          the chickens, parked in their spot (edges sharp)
  chickens_run.png      the same, with the cut-off edges blurred, for running
  ruun.png              "RUUUN!"

And layout.js (window.LAYOUT6): where everything goes, in screen pixels.

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

layout = {}
PAPER = (244, 234, 172)          # the book's pale yellow page

def save_png(name, rgb_img, alpha):
    im = rgb_img.convert("RGBA")
    im.putalpha(Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)))
    im.save(OUT / (name + ".png"))
    print(name + ".png", im.size)

def grow(mask, size):
    """Make a mask a little fatter (size = how many pixels across)."""
    return np.asarray(Image.fromarray(np.clip(mask, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.MaxFilter(size)), np.float32)


# =====================================================================
#  PANEL 1, left: the street map (IMG-017)
# =====================================================================
master, s17 = open_master("11_map_closeup.jpg")
MAPBOX = (66, 86, 556, 968)                       # working-copy box of the map
road = master.crop(tuple(round(v * s17) for v in MAPBOX))
k = 900 / road.height                             # fit the screen's height
road = road.resize((round(road.width * k), 900), Image.LANCZOS)
MAP_W = road.width
def mp(x, y):
    """Working-copy point on IMG-017 -> pixel on the screen."""
    return round((x - MAPBOX[0]) * s17 * k), round((y - MAPBOX[1]) * s17 * k)
def mbox(box):
    (a, b), (c, d) = mp(*box[:2]), mp(*box[2:])
    return max(a, 0), max(b, 0), min(c, MAP_W), min(d, 900)

rrgb = np.asarray(road, np.float32)
rink = ink_strength(road)
cover = np.zeros(rink.shape, np.float32)

# The cars: (body box, motion-lines box), working-copy numbers.
# Lane 1 (left) drives UP the page: their motion lines trail below them.
# Lane 2 (right) drives DOWN the page: their lines trail above them.
CARS = [
    ((200, 97, 273, 151), (205, 151, 268, 188)),     # 1 blue   lane 1
    ((202, 211, 271, 310), (210, 310, 265, 348)),    # 2 red    lane 1
    ((198, 384, 269, 487), (210, 487, 262, 528)),    # 3 blue   lane 1
    ((192, 584, 261, 692), (205, 692, 255, 732)),    # 4 red    lane 1
    ((196, 782, 270, 887), (210, 887, 260, 928)),    # 5 blue   lane 1
    ((400, 134, 456, 217), (410, 105, 452, 134)),    # 6 red    lane 2
    ((404, 283, 461, 366), (412, 250, 450, 283)),    # 7 blue   lane 2
    ((427, 426, 483, 512), (438, 390, 470, 426)),    # 8 red    lane 2
    ((440, 611, 506, 731), (448, 565, 485, 611)),    # 9 blue   lane 2
    ((422, 797, 510, 923), (435, 760, 480, 797)),    # 10 red   lane 2
]
layout["cars"] = []
for i, (body, lines) in enumerate(CARS, start=1):
    bb, lb = mbox(body), mbox(lines)
    box = (min(bb[0], lb[0]), min(bb[1], lb[1]), max(bb[2], lb[2]), max(bb[3], lb[3]))
    x0, y0, x1, y1 = box
    alpha = np.zeros((y1 - y0, x1 - x0), np.float32)
    alpha[lb[1] - y0:lb[3] - y0, lb[0] - x0:lb[2] - x0] = rink[lb[1]:lb[3], lb[0]:lb[2]]   # just the lines' ink
    alpha[bb[1] - y0:bb[3] - y0, bb[0] - x0:bb[2] - x0] = 255                              # the whole car
    save_png(f"car{i}", road.crop(box), alpha)
    layout["cars"].append({"key": f"car{i}", "x": x0, "y": y0, "lane": 1 if i <= 5 else 2})
    cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], alpha)

# The pink Uber
ub = mbox((304, 521, 409, 681))
save_png("uber_top", road.crop(ub), np.full((ub[3] - ub[1], ub[2] - ub[0]), 255, np.float32))
layout["uber_top"] = {"x": ub[0], "y": ub[1]}
cover[ub[1]:ub[3], ub[0]:ub[2]] = 255

# "Driver: This is where you have to get out" (and its little tick)
db = mbox((266, 308, 462, 506))
save_png("driver_says", road.crop(db), rink[db[1]:db[3], db[0]:db[2]])
layout["driver_says"] = {"x": db[0], "y": db[1]}
cover[db[1]:db[3], db[0]:db[2]] = np.maximum(cover[db[1]:db[3], db[0]:db[2]], rink[db[1]:db[3], db[0]:db[2]])

# The empty road: a smooth fill from the road around the holes (this
# keeps the photo's light and shade), plus fake crayon strokes running
# up and down the road: random speckles smeared downwards.
hole = grow(cover, 17) / 255
hole = np.asarray(Image.fromarray((np.clip(hole, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)),
                  np.float32) / 255
filled = fill_holes(rrgb, (hole < 0.05).astype(np.float32))
filled = np.asarray(Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5)), np.float32)
rng = np.random.default_rng(4)
speckles = rng.normal(0, 1, rrgb.shape[:2])
streak = np.ones(15) / 15                                       # smear 15 pixels up/down
strokes = np.apply_along_axis(lambda col: np.convolve(col, streak, "same"), 0, speckles)
strokes = strokes / strokes.std() * 7                           # gentle: +/- 7 brightness
road_blank = rrgb * (1 - hole[..., None]) + (filled + strokes[..., None]) * hole[..., None]

screen = Image.new("RGB", (1280, 900), PAPER)
screen.paste(Image.fromarray(np.clip(road_blank, 0, 255).astype(np.uint8)), (0, 0))
layout["map_w"] = MAP_W


# =====================================================================
#  PANEL 1, right: the words and the six helmets (IMG-018)
# =====================================================================
hmaster, s18 = open_master("11_faces_closeup.jpg")
def hcrop(box):
    return hmaster.crop(tuple(round(v * s18) for v in box))

# The words: just the ink, on our own clean paper
words = hcrop((268, 12, 598, 352))
wh = 300
words = words.resize((round(words.width * wh / words.height), wh), Image.LANCZOS)
save_png("dropped_text", Image.new("RGB", words.size, (28, 26, 24)), ink_strength(words))
right_w = 1280 - MAP_W
layout["dropped_text"] = {"x": MAP_W + (right_w - words.width) // 2, "y": 18}

# The helmets panel
HBOX = (35, 365, 652, 987)
panel = hcrop(HBOX)
ph = 560
kh = ph / panel.height
panel = panel.resize((round(panel.width * kh), ph), Image.LANCZOS)
panel.save(OUT / "helmets.png")
px0 = MAP_W + (right_w - panel.width) // 2
layout["helmets"] = {"x": px0, "y": 900 - ph - 14}
def hp(x, y):
    """Working-copy point on IMG-018 -> pixel on the helmets panel."""
    return round((x - HBOX[0]) * s18 * kh), round((y - HBOX[1]) * s18 * kh)

# The passengers' faces (hair and all), as soft ovals. The driver (with
# his beret, bottom right) stays put.
FACES = [(457, 417, 565, 518), (177, 557, 270, 648), (310, 542, 430, 650),
         (485, 567, 563, 660), (202, 702, 323, 800)]
prgb = np.asarray(panel, np.float32)
empty = prgb.copy()
rng = np.random.default_rng(3)
for i, box in enumerate(FACES, start=1):
    (a, b), (c, d) = hp(*box[:2]), hp(*box[2:])
    oval = Image.new("L", panel.size, 0)
    ImageDraw.Draw(oval).ellipse((a, b, c, d), fill=255)
    oval = np.asarray(oval.filter(ImageFilter.GaussianBlur(3)), np.float32)
    save_png(f"helmet_head{i}", panel.crop((a - 4, b - 4, c + 4, d + 4)), oval[b - 4:d + 4, a - 4:c + 4])
    layout[f"helmet_head{i}"] = {"x": px0 + a - 4, "y": layout["helmets"]["y"] + b - 4}
    # the empty helmet: its own grey (the lighter part of a ring just
    # outside the face), with a little crayon grain
    ring = (grow(oval, 41) > 128) & (oval < 30)
    grey = np.percentile(prgb[ring], 70, axis=0)
    paint = grey + rng.normal(0, 6, prgb[..., :1].shape)
    o = oval[..., None] / 255
    empty = empty * (1 - o) + paint * o
Image.fromarray(np.clip(empty, 0, 255).astype(np.uint8)).save(OUT / "helmets_empty.png")
print("helmets.png / helmets_empty.png", panel.size)

screen.save(OUT / "map_blank.jpg", quality=88)
print("map_blank.jpg", screen.size)


# =====================================================================
#  PANEL 2: the chickens (IMG-019)
# =====================================================================
cmaster, s19 = open_master("11_chickens_closeup.jpg", rotate_clockwise=270)
cpic, cto = cut_to_width(cmaster, s19, (50, 80, 990, 742))
cpic = cpic.crop((0, 0, 1280, 900))
crgb = np.asarray(cpic, np.float32)
cink = ink_strength(cpic)
def cbox(box):
    (a, b), (c, d) = cto(*box[:2]), cto(*box[2:])
    return max(a, 0), max(b, 0), min(c, 1280), min(d, 900)
ccover = np.zeros(cink.shape, np.float32)

# The words on the yellow page, on the left
qb = cbox((62, 240, 248, 510))
save_png("quickly_text", Image.new("RGB", (qb[2] - qb[0], qb[3] - qb[1]), (28, 26, 24)),
         cink[qb[1]:qb[3], qb[0]:qb[2]])
layout["quickly_text"] = {"x": qb[0], "y": qb[1]}
ccover[qb[1]:qb[3], qb[0]:qb[2]] = np.maximum(ccover[qb[1]:qb[3], qb[0]:qb[2]], cink[qb[1]:qb[3], qb[0]:qb[2]])

# "RUUUN!"
rb = cbox((345, 95, 640, 320))
save_png("ruun", cpic.crop(rb), cink[rb[1]:rb[3], rb[0]:rb[2]])
layout["ruun"] = {"x": rb[0], "y": rb[1]}
ccover[rb[1]:rb[3], rb[0]:rb[2]] = np.maximum(ccover[rb[1]:rb[3], rb[0]:rb[2]], cink[rb[1]:rb[3], rb[0]:rb[2]])

# The chickens: traced by hand round the whole flock (bodies, combs,
# beaks and feet), from the left edge of the panel to the pink one.
FLOCK = [(262, 345), (300, 330), (330, 350), (415, 315), (440, 298), (470, 288), (520, 283),
         (560, 295), (600, 330), (640, 405), (700, 395), (720, 360), (760, 320), (800, 305),
         (835, 330), (870, 400), (905, 405), (935, 345), (960, 330), (990, 320), (990, 700),
         (955, 705), (880, 705), (820, 705), (760, 705), (690, 705),
         (560, 705), (480, 705), (440, 705), (330, 705), (262, 705)]
flock = Image.new("L", cpic.size, 0)
ImageDraw.Draw(flock).polygon([cto(x, y) for x, y in FLOCK], fill=255)
# The bottom of the "RUUUN!" box catches the tops of two combs: take
# anything inside the flock's outline back out of it, and save it again.
ruun_alpha = cink[rb[1]:rb[3], rb[0]:rb[2]] * (1 - np.asarray(flock, np.float32)[rb[1]:rb[3], rb[0]:rb[2]] / 255)
save_png("ruun", cpic.crop(rb), ruun_alpha)
flock = np.asarray(flock.filter(ImageFilter.GaussianBlur(1.5)), np.float32)
# Inside the traced shape, keep only the chickens themselves: their
# black outlines and everything those outlines close in (fill_inside),
# NOT the white paper between and around them.
ys, xs = np.nonzero(flock > 10)
fb0 = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
# The chickens at the far left and far right are cut off by the edge
# of the panel, so their outlines are open there. Draw a short "wall"
# along those edges (only as tall as their bodies) to close them.
walls = cink.copy()
for (wx, wy0, wy1) in [(264, 352, 560), (985, 315, 690)]:
    x, ya = cto(wx, wy0); _, yb = cto(wx, wy1)
    walls[ya:yb, max(x - 3, 0):x + 3] = 255
solid = np.zeros_like(flock)
solid[fb0[1]:fb0[3], fb0[0]:fb0[2]] = fill_inside(walls, fb0)
m = Image.fromarray(np.clip(solid, 0, 255).astype(np.uint8))
m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))       # close pinholes
flock = np.minimum(flock, np.asarray(m.filter(ImageFilter.GaussianBlur(1)), np.float32))
fb = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
# The cut-off edges are straight lines, which look odd when the flock
# runs. Fade the alpha to nothing over the last 60 pixels at each side,
# so at running speed they look like a blur instead of a hard edge.
fade = np.clip(np.minimum(np.arange(cpic.size[0]) - fb[0], fb[2] - 1 - np.arange(cpic.size[0])) / 60, 0, 1)
flock_moving = flock * fade[None, :]
save_png("chickens_run", cpic.crop(fb), flock_moving[fb[1]:fb[3], fb[0]:fb[2]])   # while running
save_png("chickens", cpic.crop(fb), flock[fb[1]:fb[3], fb[0]:fb[2]])              # parked: hard edges
layout["chickens"] = {"x": fb[0], "y": fb[1]}
ccover = np.maximum(ccover, grow(flock, 15))

# Two bits left over: the edge of the pink chicken at the far right,
# and a dab of orange (a foot) at the bottom left. Rub those out too.
# (These boxes are in SCREEN pixels: x0, y0, x1, y1.)
for x0, y0, x1, y1 in [(1195, 270, 1280, 570), (295, 705, 370, 785)]:
    ccover[y0:y1, x0:x1] = 255

# The empty panel: everything rubbed out, filled with the plain paper
# (and the grey floor) from around it
hole = grow(ccover, 9) > 10
good = (~hole & (cink < 25)).astype(np.float32)
cfill = fill_holes(crgb, good)
cfill = np.asarray(Image.fromarray(np.clip(cfill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4)), np.float32)
# A smooth fill looks foggy next to real paper, so add a little grain
cfill = cfill + np.random.default_rng(6).normal(0, 3.5, cfill.shape[:2])[..., None]
soft = np.asarray(Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)),
                  np.float32)[..., None] / 255
Image.fromarray(np.clip(crgb * (1 - soft) + cfill * soft, 0, 255).astype(np.uint8)).save(OUT / "chicken_blank.jpg", quality=88)
print("chicken_blank.jpg", cpic.size)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on the screen (pixels, top-left corner).\n"
    "window.LAYOUT6 = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js written")

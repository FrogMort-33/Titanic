"""
prepare_pictures.py  -  cut the pictures for EPISODE 8 "A Close Encounter"

  PANEL 1  "Out in the country"  IMG-030 (master 15_1.jpg): the top picture
  PANEL 2  "Up ahead!"           IMG-031 (master 15_2.jpg): the bottom picture
                                 and its words

Boxes are measured on the working copies (1000 px on the long side).
The picture tools live in storybook/tools/picture_tricks.py.

Makes, in ../assets/:
  cl_land.jpg           the countryside: no van, no lady, the road to the horizon
  cl_birds2.png, cl_bird1.png   the birds (to fly)
  cl_lady.png           the green French lady
  cl_van.png            the van, head on
  up_blank.jpg          the "Up ahead" picture with no van and no lady
  up_lady.png           the lady (small, on the grass)
  up_van.png            the side of the van with its wing mirror
  up_words.png          "Up ahead! A local, going about their day..."

And layout.js (window.LAYOUT8): where everything goes, in screen pixels.

Run:   python3 tools/prepare_pictures.py     then   python3 make_offline.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCENE = HERE.parent
OUT = SCENE / "assets"
sys.path.insert(0, str(HERE.parents[2] / "tools"))  # storybook/tools
from picture_tricks import *                         # open_master, ink_strength, ...

layout = {}
PAPER = (244, 234, 172)          # the book's pale yellow page
W, H = 1280, 900                 # the screen
INK = (28, 26, 24)               # an even black, for printed words

def save_png(name, rgb_img, alpha):
    im = rgb_img.convert("RGBA")
    im.putalpha(Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)))
    im.save(OUT / (name + ".png"))
    print(name + ".png", im.size)

def grow(mask, size):
    """Make a mask a little fatter (size = how many pixels across)."""
    return np.asarray(Image.fromarray(np.clip(mask, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.MaxFilter(size)), np.float32)

def polygon_mask(size, points, blur=1.2):
    """A see-through mask: 255 inside the polygon, 0 outside."""
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon(points, fill=255)
    if blur:
        m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(m, np.float32)


class Picture:
    """One box cut from a master photo and resized to fit a space on the
    screen. It remembers where it goes, and turns working-copy points
    into pixels on itself (pt) or on the screen (screen)."""
    def __init__(self, master_name, rotate, box, fit_w, fit_h, at_x=None, at_y=None):
        master, s = open_master(master_name, rotate)
        piece = master.crop(tuple(round(v * s) for v in box))
        k = min(fit_w / piece.width, fit_h / piece.height)
        self.img = piece.resize((round(piece.width * k), round(piece.height * k)), Image.LANCZOS)
        self.box, self.zoom = box, s * k
        # where its top-left corner goes on the screen (default: centred)
        self.x = (W - self.img.width) // 2 if at_x is None else at_x
        self.y = (H - self.img.height) // 2 if at_y is None else at_y
        self.rgb = np.asarray(self.img, np.float32)
        self.ink = ink_strength(self.img)
        self.hole = np.zeros(self.ink.shape, np.float32)       # what to rub out

    def pt(self, x, y):
        return round((x - self.box[0]) * self.zoom), round((y - self.box[1]) * self.zoom)

    def pbox(self, box):
        (a, b), (c, d) = self.pt(*box[:2]), self.pt(*box[2:])
        return max(a, 0), max(b, 0), min(c, self.img.width), min(d, self.img.height)

    def place(self, name, x, y):
        layout[name] = {"x": x + self.x, "y": y + self.y}

    def words(self, name, box, colour=None, keep_below=None):
        """Lift hand-written or printed words off the picture (just the ink)."""
        b = self.pbox(box)
        a = self.ink[b[1]:b[3], b[0]:b[2]].copy()
        rgb = self.img.crop(b) if colour is None else Image.new("RGB", (b[2] - b[0], b[3] - b[1]), colour)
        save_png(name, rgb, a)
        self.place(name, b[0], b[1])
        self.hole[b[1]:b[3], b[0]:b[2]] = np.maximum(self.hole[b[1]:b[3], b[0]:b[2]], a)

    def solid(self, name, box, outline):
        """A drawn thing (like a van): its outline and everything inside it,
        only inside a rough hand-traced outline (so nothing touching it comes
        too)."""
        b = self.pbox(box)
        a = np.zeros_like(self.ink)
        a[b[1]:b[3], b[0]:b[2]] = fill_inside(self.ink, b)
        a = np.minimum(a, polygon_mask(self.img.size, [self.pt(x, y) for x, y in outline], 1.5))
        save_png(name, self.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
        self.place(name, b[0], b[1])
        self.hole = np.maximum(self.hole, a)

    def blank(self, name, grow_by=11):
        """The picture with everything cut out rubbed out (filled from the
        plain colours around it), on the yellow paper, saved as a jpg."""
        hole = grow(self.hole, grow_by) > 10
        good = (~hole & (self.ink < 25)).astype(np.float32)
        fill = fill_holes(self.rgb, good)
        fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32)
        fill = fill + np.random.default_rng(len(name)).normal(0, 3, fill.shape[:2])[..., None]   # paper grain
        soft = np.asarray(Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)),
                          np.float32)[..., None] / 255
        clean = Image.fromarray(np.clip(self.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))
        self.save_on_paper(name, clean)

    def save_on_paper(self, name, img=None):
        page = Image.new("RGB", (W, H), PAPER)
        page.paste(feather(img or self.img, PAPER, 16), (self.x, self.y))
        page.save(OUT / (name + ".jpg"), quality=88)
        print(name + ".jpg")


# =====================================================================
#  PANEL 1: the close encounter (IMG-030, top picture): the countryside
# =====================================================================
# Everything that moves is cut out: the birds, the green French lady and
# the van. Then the picture behind the van is REBUILT: sky above the
# horizon, grass below it, and the road carried on back to the horizon.
land = Picture("15_1.jpg", 270, (133, 148, 918, 722), W, H)

land.words("cl_birds2", (174, 196, 226, 219))                  # the pair of birds
land.words("cl_bird1", (123, 248, 176, 272))                   # the bird on its own
LADY = [(170, 722), (176, 600), (190, 530), (232, 488), (290, 476), (338, 492), (362, 540),
        (382, 630), (402, 648), (400, 676), (372, 690), (366, 722)]
land.solid("cl_lady", (166, 472, 404, 724), LADY)
VAN8 = [(386, 240), (424, 240), (424, 168), (842, 168), (842, 252), (884, 252), (884, 340),
        (846, 340), (846, 490), (864, 490), (864, 556), (802, 556), (800, 492), (498, 492),
        (498, 556), (418, 556), (418, 490), (424, 490), (424, 324), (386, 324)]
land.solid("cl_van", (384, 164, 886, 558), VAN8)
# the middle of the van's bottom edge, where it sits on the road
vx, vy = land.pt(642, 553)
layout["cl_van_base"] = [vx + land.x, vy + land.y]

# ---- Rebuild the scenery behind them --------------------------------
# Smudging the holes left a ghost van, and painting new crayon strokes
# looked fake.  So instead we PATCH it, like mending a jumper: little
# squares of Rosie & Joe's own sky, grass and road are copied from
# elsewhere in the picture and blended together over the hole.
#   * sky & grass squares come from the SAME HEIGHT in the picture, so the
#     sky stays at the top and the grass starts at the right height;
#   * road squares come from the bit of road under the van.
# Then the road edges are carried on, bending gently back to a point on
# the horizon (the "vanishing point").
z = land.zoom                                     # working px -> picture px
def px(x, y):
    return land.pt(x, y)
size = land.img.size
HORIZON = 386                                     # where the sky meets the grass
VP = (642, HORIZON + 2)                           # where the road disappears

# The road edges: straight lines from the vanishing point down to where
# Rosie & Joe's road meets the bottom-left (behind the lady) and the
# right-hand edge of the picture. (Their old edge lines are rubbed out.)
LEFT = [VP, (205, 722)]
RIGHT = [VP, (915, 551)]
OLD_EDGES = [[(358, 552), (420, 483)], [(849, 488), (912, 548)]]

# The REBUILD area: the van's box and the lady (a little fatter)
R = Image.new("L", size, 0)
d = ImageDraw.Draw(R)
d.rectangle([px(378, 158), px(892, 562)], fill=255)
d.polygon([px(x, y) for x, y in LADY], fill=255)
for edge in OLD_EDGES + [LEFT]:                   # and a band along the road edges
    d.line([px(*q) for q in edge], fill=255, width=round(14 * z))
R = R.filter(ImageFilter.MaxFilter(round(6 * z) | 1))
soft = np.asarray(R.filter(ImageFilter.GaussianBlur(6)), np.float32)[..., None] / 255

# The road's shape: between the two edges, down to the bottom. (The left
# edge carries on behind the lady to the bottom at about x=205.)
road = Image.new("L", size, 0)
ImageDraw.Draw(road).polygon([px(*VP), px(915, 551), px(918, 554), px(918, 722), px(205, 722)], fill=255)
road = np.asarray(road.filter(ImageFilter.GaussianBlur(1.5)), np.float32)[..., None] / 255

rng = np.random.default_rng(30)
def quilt(src_boxes, same_row, patch=36):
    return quilt_from(land, src_boxes, same_row, patch)
def quilt_from(land, src_boxes, same_row, patch=36):
    """Cover the whole picture with overlapping squares copied from the
    source boxes, blended with soft edges (a 'Hann window' weight that is
    1 in the middle of a square and 0 at its edges)."""
    z = land.zoom
    size = land.img.size
    P, step = round(patch * z), round(patch * z / 2)
    win = np.outer(np.hanning(P), np.hanning(P))[..., None] + 1e-4
    total = np.zeros(land.rgb.shape, np.float32)
    weight = np.zeros(land.rgb.shape[:2] + (1,), np.float32)
    for ty in range(-step, size[1], step):
        for tx in range(-step, size[0], step):
            cy = ty + P // 2                               # middle of this square
            box = src_boxes(cy) if callable(src_boxes) else src_boxes
            x0, y0, x1, y1 = land.pbox(box)
            sx = rng.integers(x0, max(x0 + 1, x1 - P))
            sy = min(max(ty, y0), y1 - P) if same_row else rng.integers(y0, max(y0 + 1, y1 - P))
            a, b = max(ty, 0), max(tx, 0)                  # clip to the picture
            c, d_ = min(ty + P, size[1]), min(tx + P, size[0])
            piece = land.rgb[sy + a - ty:sy + c - ty, sx + b - tx:sx + d_ - tx]
            w = win[a - ty:c - ty, b - tx:d_ - tx]
            total[a:c, b:d_] += piece * w
            weight[a:c, b:d_] += w
    return total / weight

# sky & grass: above the lady's head use the strip between the birds and
# the lady; lower down use the grass strip on the far left
scenery = quilt(lambda y: (232, 150, 372, 470) if y < px(0, 470)[1] else (133, 470, 186, 712), True)
tarmac = quilt((440, 575, 800, 700), False, patch=60)
canvas = scenery * (1 - road) + tarmac * road
canvas = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8))

# The road edges, in thick black felt-tip like the rest
pen = ImageDraw.Draw(canvas)
INK = (34, 34, 36)
for edge in (LEFT, RIGHT):
    pen.line([px(*q) for q in edge], fill=INK, width=round(4.5 * z), joint="curve")
# the panel's bottom border (the lady's cut-out took a bite out of it)
pen.line([px(133, 716), px(420, 716)], fill=INK, width=round(5 * z))
canvas = canvas.filter(ImageFilter.GaussianBlur(0.5))

# The old picture with the rebuild area swapped for the new patchwork
pic = Image.fromarray(np.clip(land.rgb * (1 - soft) + np.asarray(canvas, np.float32) * soft, 0, 255).astype(np.uint8))
layout["cl_vp"] = [px(*VP)[0] + land.x, px(*VP)[1] + land.y]
land.save_on_paper("cl_land", pic)


# =====================================================================
#  PANEL 2: "Up ahead!" (IMG-031, bottom picture): the van's side with
#  its wing mirror on the left, the lady on the grass on the right
# =====================================================================
up = Picture("15_2.jpg", 270, (122, 66, 876, 594), W, H)

# The lady (small, on the grass): traced round by hand
LADY2 = [(570, 140), (588, 110), (640, 104), (668, 128), (682, 150), (674, 162), (674, 240),
         (662, 262), (652, 272), (630, 268), (600, 268), (584, 264), (578, 240), (574, 200), (568, 170)]
up.solid("up_lady", (564, 100, 686, 276), LADY2)

# The van: EVERYTHING left of the windscreen pillar, plus the wing mirror.
# (It runs off the edge of the picture, so we just cut along a traced
# outline instead of following its ink.)
VANSIDE = [(122, 66), (512, 66), (542, 160), (580, 296), (702, 304), (704, 594), (122, 594)]
b = up.pbox((122, 66, 704, 594))
a = polygon_mask(up.img.size, [up.pt(x, y) for x, y in VANSIDE], 1.0)
save_png("up_van", up.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
up.place("up_van", b[0], b[1])

# Fill in behind them with patches of the grass on the right-hand side,
# copied from the same height (so the paper's shading still matches)
hole = np.maximum(a, grow(polygon_mask(up.img.size, [up.pt(x, y) for x, y in LADY2], 0), 9))
soft = np.asarray(Image.fromarray(hole.astype(np.uint8)).filter(ImageFilter.GaussianBlur(4)),
                  np.float32)[..., None] / 255
grass = quilt_from(up, (700, 96, 856, 590), True)
blank = Image.fromarray(np.clip(up.rgb * (1 - soft) + grass * soft, 0, 255).astype(np.uint8))
pen = ImageDraw.Draw(blank)
pen.line([up.pt(122, 70), up.pt(840, 94)], fill=(34, 34, 36), width=round(4.5 * up.zoom))  # the top edge
up.save_on_paper("up_blank", blank)

# The words under the picture, as clean black print (saved on their own)
words = Picture("15_2.jpg", 270, (120, 598, 884, 714), W - 120, 200)
words.words("up_words", (120, 598, 884, 714), INK)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT8 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

"""
prepare_pictures.py  -  cut the pictures for EPISODE 10 "Final Destination (almost)"

  IMG-055 (master 20_1.jpg, turned 90 degrees): "One hour later", the
  nuclear towers, the road, the log truck and the pink van.

Makes, in ../assets/:
  fd_road.jpg       the whole picture with the road CLEARED (no traffic, no
                    words on it, no speech) - the background
  fd_truck.png      the log truck without its logs;  fd_log1..4.png the logs
  fd_van.png        the pink van (the one with everyone inside)
  fd_aaaah.png      "AAAAH!!!"   fd_aaah.png  "AAAH!"   fd_floor.png "FLOOR IT!"
  fd_phew.png       "phew!"
  fd_top.png        "This happened. After the comparison to Final Destination 2
                    was made, Enda accelerated to safety."
  fd_speech.png     "1 HOUR without an incident! Oh look, nuclear towers! And
                    a log truck!"
  fd_mouth.png      the potato's mouth (it stretches to talk)
  fd_later.png      "ONE HOUR LATER" (to zoom in on)

And layout.js (window.LAYOUT10): where everything goes, in screen pixels,
plus the road's path for the vehicles to drive along.

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

    def words(self, name, box, colour=None, keep_below=None, floor=0):
        """Lift hand-written or printed words off the picture (just the ink).
        floor: ignore ink fainter than this (so crayon shading isn't taken)."""
        b = self.pbox(box)
        a = self.ink[b[1]:b[3], b[0]:b[2]].copy()
        if floor:
            a = np.clip((a - floor) * 255 / (255 - floor), 0, 255)
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



rng = np.random.default_rng(39)
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

def mend(pic, hole, sources=None, patch=24):
    """Fill a hole: with patches from 'sources' (a box) if given, else
    smudged in from the edges with a little pencil grain added."""
    soft = np.asarray(Image.fromarray(np.clip(hole, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
    # the overall colour: smudged in from the edges of the hole (so it
    # blends with whatever is next to it, light or dark)...
    good = ((hole < 10) & (pic.ink < 60)).astype(np.float32)
    base = fill_holes(pic.rgb, good)
    base = np.asarray(Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(4)), np.float32)
    if sources:
        # ...plus the crayon TEXTURE (just the fine detail) from patches
        tex = quilt_from(pic, sources, False, patch)
        smooth = np.asarray(Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8))
                            .filter(ImageFilter.GaussianBlur(6)), np.float32)
        fill = base + (tex - smooth)
    else:
        fill = base + rng.normal(0, 7, base.shape[:2])[..., None]
    return Image.fromarray(np.clip(pic.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))



INKC = (34, 34, 36)              # the colour for lifted pen words

# =====================================================================
#  THE PICTURE (IMG-055): the whole page, as big as fits the screen
# =====================================================================
pic = Picture("20_1.jpg", 90, (90, 40, 705, 990), W, H - 10)
layout["fd_road"] = {"x": pic.x, "y": pic.y, "w": pic.img.width, "h": pic.img.height}

# ---- things that MOVE: the log truck (and its logs) and the pink van ----
TRUCK = [(285, 398), (312, 354), (353, 370), (372, 352), (390, 360), (462, 402), (515, 436), (525, 458),
         (515, 490), (482, 500), (478, 518), (440, 520), (420, 505), (360, 470), (330, 468), (318, 450),
         (322, 428), (300, 415)]
LOGS = [(365, 357), (385, 360), (515, 436), (525, 460), (515, 490), (492, 496), (472, 484), (365, 423)]
VAN = [(503, 628), (522, 594), (540, 592), (540, 558), (560, 551), (585, 558), (592, 590), (678, 654),
       (668, 700), (650, 724), (612, 724), (600, 730), (572, 722), (560, 706), (530, 666), (505, 660)]

def cut(name, outline):
    """Cut a drawn thing out along a hand-traced outline (just its own ink
    and everything inside its outline)"""
    pic.solid(name, (min(x for x, _ in outline) - 2, min(y for _, y in outline) - 2,
                     max(x for x, _ in outline) + 2, max(y for _, y in outline) + 2), outline)

cut("fd_van", VAN)
cut("fd_truck", TRUCK)
# the logs: cut out of the truck picture again, as 4 separate logs. The
# logs lie along the truck (direction "along"); we slice the load into 4
# bands ACROSS that direction, one band per log.
along = np.array([145.0, 80.0]); along /= np.hypot(*along)
across = np.array([-along[1], along[0]])                     # at right angles to "along"
truck_img = Image.open(OUT / "fd_truck.png")
tb = pic.pbox((min(x for x, _ in TRUCK) - 2, min(y for _, y in TRUCK) - 2,
               max(x for x, _ in TRUCK) + 2, max(y for _, y in TRUCK) + 2))
load = polygon_mask(pic.img.size, [pic.pt(x, y) for x, y in LOGS], 1.0)
yy, xx = np.mgrid[0:pic.img.height, 0:pic.img.width]
x0, y0 = pic.pt(365, 357)
depth = ((xx - x0) * across[0] + (yy - y0) * across[1]) / pic.zoom     # how far "down" the load (working px)
truck_alpha = np.asarray(truck_img.getchannel("A"), np.float32)
for i, (lo, hi) in enumerate([(-20, 15), (15, 30), (30, 45), (45, 90)]):
    band = load * ((depth >= lo) & (depth < hi))
    ys, xs = np.nonzero(band > 10)
    b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    save_png("fd_log%d" % (i + 1), pic.img.crop(b), band[b[1]:b[3], b[0]:b[2]])
    pic.place("fd_log%d" % (i + 1), b[0], b[1])
# ...and take the logs OFF the truck picture (leaving the empty truck)
truck_alpha = np.minimum(truck_alpha, 255 - load[tb[1]:tb[3], tb[0]:tb[2]])
truck_img.putalpha(Image.fromarray(truck_alpha.astype(np.uint8))); truck_img.save(OUT / "fd_truck.png")

# ---- the words that pop up (lifted off, so they can come and go) ----
pic.words("fd_aaaah", (535, 306, 674, 362), INKC)            # "AAAAH!!!"
pic.words("fd_aaah", (510, 510, 596, 578), INKC)             # "AAAH!"
pic.words("fd_floor", (604, 524, 684, 604), INKC)            # "FLOOR IT!"
pic.words("fd_phew", (218, 184, 300, 242), INKC)             # "phew!"
# (the words written on the plain PAPER are rubbed out separately, below,
#  with paper - so remember the road's holes so far)
road_hole = pic.hole.copy()
pic.hole = np.zeros_like(pic.hole)
pic.words("fd_top", (298, 48, 660, 122), INKC)               # the words at the top
pic.words("fd_speech", (92, 468, 412, 684), INKC)            # "1 HOUR without an incident! ..."
paper_hole = pic.hole

# ---- other traffic and marks to clear off the road ----
OTHERS = [  # (the 2 other drawings of the van, their speed lines, arrows)
    [(462, 332), (548, 330), (582, 348), (580, 420), (548, 432), (470, 412)],          # van, middle
    [(548, 405), (645, 455), (640, 490), (555, 440)],                                  # its speed lines
    [(545, 448), (595, 445), (598, 520), (548, 470)],                                  # the curly arrow
    [(160, 248), (205, 228), (275, 262), (275, 300), (262, 330), (215, 330), (160, 280)],  # van, top left
    [(245, 312), (280, 312), (282, 336), (245, 336)],                                  # its speed lines
    [(296, 290), (415, 300), (418, 328), (296, 314)],                                  # the arrow
    [(625, 715), (675, 738), (670, 760), (625, 740)],                                  # bottom van's lines
    # the pale patches that were behind the shouted words
    [(500, 505), (600, 500), (690, 520), (690, 615), (600, 600), (500, 560)],
]
for o in OTHERS:
    road_hole = np.maximum(road_hole, polygon_mask(pic.img.size, [pic.pt(x, y) for x, y in o], 1.0))
# the road: smudged road colour plus road crayon texture
# (mend smudges in colour from around each hole; we pretend green grass
#  and purple are "ink" for a moment, so ONLY grey road gets smudged in)
real_ink = pic.ink
colourful = (pic.rgb.max(axis=2) - pic.rgb.min(axis=2)) > 40
pic.ink = np.maximum(pic.ink, colourful * 255.0)
road = mend(pic, grow(road_hole, 9), (205, 340, 280, 400), 22)
pic.ink = real_ink
# the edge of the road ran under the truck: draw that bit back in
ImageDraw.Draw(road).line([pic.pt(*p) for p in [(268, 444), (300, 460), (335, 470), (370, 480), (400, 495),
                                                (420, 515), (436, 538)]], fill=(60, 60, 62), width=round(3.5 * pic.zoom))
pic.rgb = np.asarray(road, np.float32)
# "AAAAH!!!" was written on the GRASS above the road: grass goes back there
grass_hole = polygon_mask(pic.img.size, [pic.pt(x, y) for x, y in
                          [(540, 300), (676, 300), (676, 362), (610, 360), (545, 336)]], 2.0)
road = mend(pic, grass_hole, (560, 250, 640, 292), 22)
ImageDraw.Draw(road).line([pic.pt(*p) for p in [(528, 330), (565, 346), (605, 362), (645, 380)]],
                          fill=(60, 60, 62), width=round(3.5 * pic.zoom))
pic.rgb = np.asarray(road, np.float32)
# the paper: smudged paper colour plus paper texture
road = mend(pic, grow(paper_hole, 7), (470, 860, 560, 960), 22)
road.save(OUT / "fd_road.jpg", quality=90)
print("fd_road.jpg", road.size)

# ---- the potato's mouth (bottom left), and "ONE HOUR LATER" ----
b = pic.pbox((255, 868, 335, 912))
m = Image.new("L", (b[2] - b[0], b[3] - b[1]), 0)
ImageDraw.Draw(m).ellipse((1, 1, m.width - 2, m.height - 2), fill=255)
save_png("fd_mouth", pic.img.crop(b), np.asarray(m.filter(ImageFilter.GaussianBlur(1.5)), np.float32))
pic.place("fd_mouth", b[0], b[1])
layout["fd_later"] = [pic.pt(210, 112)[0] + pic.x, pic.pt(210, 112)[1] + pic.y]   # where to zoom in

# ---- the road's path: where the middle of a vehicle goes, from the
# bottom right (off the picture) to the top left (off the picture) ----
PATH = [(730, 805), (590, 640), (405, 440), (235, 290), (40, 215)]
layout["fd_path"] = [[pic.pt(x, y)[0] + pic.x, pic.pt(x, y)[1] + pic.y] for x, y in PATH]

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT10 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

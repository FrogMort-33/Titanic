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

# =====================================================================
#  PART 2: THE TOLL BOOTH (IMG-057, masters 21_2.jpg and 21_3.jpg)
# =====================================================================
def disc_patch(p, name, centre, r):
    """A round patch that can turn in place (a steering wheel)"""
    b = p.pbox((centre[0] - r, centre[1] - r, centre[0] + r, centre[1] + r))
    m = Image.new("L", (b[2] - b[0], b[3] - b[1]), 0)
    ImageDraw.Draw(m).ellipse((1, 1, m.width - 2, m.height - 2), fill=255)
    save_png(name, p.img.crop(b), np.asarray(m.filter(ImageFilter.GaussianBlur(1)), np.float32))
    p.place(name, b[0], b[1])

def round_patch(p, name, box):
    """A soft-edged oval patch (a mouth that stretches to talk)"""
    b = p.pbox(box)
    m = Image.new("L", (b[2] - b[0], b[3] - b[1]), 0)
    ImageDraw.Draw(m).ellipse((1, 1, m.width - 2, m.height - 2), fill=255)
    save_png(name, p.img.crop(b), np.asarray(m.filter(ImageFilter.GaussianBlur(1.5)), np.float32))
    p.place(name, b[0], b[1])

def paper_fill(p, hole, grow_by=11):
    """Rub out everything in 'hole' with the plain paper around it: the
    paper's colour is smudged in from clean paper NEAR the hole (so it
    matches the light and shade there), with a little paper grain."""
    big = grow(hole, grow_by)
    soft = np.asarray(Image.fromarray(np.clip(big, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
    lowsat = (p.rgb.max(axis=2) - p.rgb.min(axis=2)) < 45
    good = ((grow(big, 9) < 10) & (p.ink < 25) & lowsat).astype(np.float32)
    fill = fill_holes(p.rgb, good)
    fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(6)), np.float32)
    fill = fill + rng.normal(0, 2.5, fill.shape[:2])[..., None]
    return Image.fromarray(np.clip(p.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))

def box_hole(p, box):
    """a hole the shape of a box (working-copy points)"""
    h = np.zeros_like(p.ink)
    b = p.pbox(box)
    h[b[1]:b[3], b[0]:b[2]] = 255
    return h

def whole(p, name):
    """Save a picture as it is, as a jpg, and remember where it goes"""
    p.img.save(OUT / (name + ".jpg"), quality=90)
    p.place(name, 0, 0)
    layout[name]["w"], layout[name]["h"] = p.img.size
    print(name + ".jpg", p.img.size)

# ---- "ONE HOUR LATER" (big) ----
whole(Picture("21_2.jpg", 0, (475, 85, 978, 378), W - 80, H - 80), "tb_later")

# ---- the toll booth: the barrier, the ticket, the hand and the van are
#      cut out so they can move; behind them, plain paper ----
tb = Picture("21_2.jpg", 0, (40, 82, 476, 380), W - 60, H - 60)
ARM = [(118, 120), (185, 99), (300, 83), (472, 74), (477, 93), (340, 112), (230, 137), (160, 167), (118, 188)]
tb.hole = np.zeros_like(tb.ink)
for name, outline in [
        ("tb_arm", ARM),
        ("tb_ticket", [(112, 200), (154, 200), (154, 228), (112, 228)]),
        ("tb_hand", [(166, 204), (180, 198), (220, 198), (220, 238), (180, 234), (166, 224)]),
        ("tb_van", [(198, 152), (409, 146), (412, 318), (406, 366), (338, 367), (334, 334), (294, 334),
                    (292, 367), (214, 367), (205, 320)])]:
    a = polygon_mask(tb.img.size, [tb.pt(x, y) for x, y in outline], 1.0)
    ys, xs = np.nonzero(a > 10)
    b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    save_png(name, tb.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
    tb.place(name, b[0], b[1])
    tb.hole = np.maximum(tb.hole, a)
layout["tb_pivot"] = [tb.pt(122, 157)[0] + tb.x, tb.pt(122, 157)[1] + tb.y]   # where the barrier turns
booth = paper_fill(tb, tb.hole, 15)
booth.save(OUT / "tb_booth.jpg", quality=90)
tb.place("tb_booth", 0, 0)
layout["tb_booth"]["w"], layout["tb_booth"]["h"] = booth.size
print("tb_booth.jpg", booth.size)

# ---- inside the van: "The strict instruction was DON'T lose the ticket" /
#      "Oh, shit." - and "Delirious laughter continued." below ----
iv = Picture("21_2.jpg", 0, (470, 385, 988, 668), W - 100, 600, at_y=20)
round_patch(iv, "tb_mouth_mid", (677, 597, 697, 622))
round_patch(iv, "tb_mouth_enda", (786, 612, 818, 634))
disc_patch(iv, "tb_wheel_iv", (798, 648), 10)
iv.words("tb_strict", (678, 392, 982, 506), INKC)
iv.words("tb_ohshit", (855, 528, 962, 598), INKC)
whole_iv = paper_fill(iv, np.maximum(box_hole(iv, (676, 390, 984, 508)), box_hole(iv, (853, 526, 964, 600))), 5)
whole_iv.save(OUT / "tb_inside.jpg", quality=90)
iv.place("tb_inside", 0, 0)
layout["tb_inside"]["w"], layout["tb_inside"]["h"] = whole_iv.size
dl = Picture("21_2.jpg", 0, (90, 470, 375, 565), 560, 190, at_y=660)
dl.words("tb_delirious", (90, 470, 375, 565), INKC)

# ---- the three little frames, one at a time, each full screen ----
f1 = Picture("21_3.jpg", 0, (15, 352, 347, 708), W - 80, H - 40)
round_patch(f1, "tb_mouth_q", (232, 535, 255, 558))
disc_patch(f1, "tb_wheel_1", (127, 443), 19)
f1.words("tb_say_q", (14, 660, 312, 708), INKC)            # "Rhianna, how are you?"
paper1 = paper_fill(f1, box_hole(f1, (12, 658, 314, 708)), 5)
paper1.save(OUT / "tb_frame1.jpg", quality=90); f1.place("tb_frame1", 0, 0)
layout["tb_frame1"]["w"], layout["tb_frame1"]["h"] = paper1.size

f2 = Picture("21_3.jpg", 0, (345, 335, 672, 700), W - 80, H - 40)
round_patch(f2, "tb_mouth_r", (470, 482, 550, 515))
f2.words("tb_say_r", (366, 655, 622, 698), INKC)           # "Reading for my life"
paper2 = paper_fill(f2, box_hole(f2, (362, 652, 625, 700)), 5)
paper2.save(OUT / "tb_frame2.jpg", quality=90); f2.place("tb_frame2", 0, 0)
layout["tb_frame2"]["w"], layout["tb_frame2"]["h"] = paper2.size

f3 = Picture("21_3.jpg", 0, (652, 322, 998, 672), W - 80, H - 40)
disc_patch(f3, "tb_wheel_3", (786, 367), 17)
f3.words("tb_brow_l", (836, 444, 877, 464), INKC)          # his eyebrows (they wiggle)
f3.words("tb_dots", (780, 650, 830, 668), INKC)            # "..."
face = mend(f3, grow(f3.hole, 5))
f3.rgb = np.asarray(face, np.float32)
face.save(OUT / "tb_frame3.jpg", quality=90); f3.place("tb_frame3", 0, 0)
layout["tb_frame3"]["w"], layout["tb_frame3"]["h"] = face.size

# =====================================================================
#  PART 3: EURO TRUCK SIMULATOR (IMG-060, master 21_4.jpg)
#  The lorries are cut out (they drive past in a never-ending stream);
#  behind them the picture is rebuilt: the buildings and sky carried
#  straight DOWN to the road, and the road carried straight UP.
#  (fd_bus.png is our usual van, copied from episode 1 via episode 9.)
# =====================================================================
ets = Picture("21_4.jpg", 0, (80, 85, 965, 640), W, H - 20)
for name, outline in [
        ("et_pink", [(95, 400), (252, 398), (254, 488), (248, 514), (93, 514)]),
        ("et_blue", [(314, 351), (522, 351), (524, 398), (562, 398), (600, 436), (604, 490), (592, 518), (316, 518)]),
        ("et_red", [(624, 351), (810, 351), (812, 396), (847, 396), (887, 430), (892, 502), (872, 513), (626, 515)])]:
    ets.solid(name, (min(x for x, _ in outline) - 2, min(y for _, y in outline) - 2,
                     max(x for x, _ in outline) + 2, max(y for _, y in outline) + 2), outline)
layout["et_lane"] = ets.pt(0, 514)[1] + ets.y          # where the wheels touch the road
# the band where the lorries were, all the way across
top, road, bottom = ets.pt(0, 346)[1], ets.pt(0, 440)[1], ets.pt(0, 522)[1]
rgb = ets.rgb.copy()
above = rgb[top - 14:top - 3].mean(axis=0)              # the row of colours just above the band
below = rgb[bottom + 3:bottom + 14].mean(axis=0)        # ...and just below it (the road)
for y in range(top, bottom):
    rgb[y] = above if y < road else below
rgb[top:bottom] += rng.normal(0, 4, rgb[top:bottom].shape[:2])[..., None]    # crayon grain
# (a soft join at the top and bottom of the band)
soft = np.zeros(rgb.shape[:2], np.float32)
soft[top:bottom] = 1
soft = np.asarray(Image.fromarray((soft * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)),
                  np.float32)[..., None] / 255
town = Image.fromarray(np.clip(ets.rgb * (1 - soft) + rgb * soft, 0, 255).astype(np.uint8))
# the line along the bottom of the buildings
ImageDraw.Draw(town).line([ets.pt(95, 440), ets.pt(960, 440)], fill=(120, 120, 110), width=2)
town.save(OUT / "et_town.jpg", quality=90)
ets.place("et_town", 0, 0)
layout["et_town"]["w"], layout["et_town"]["h"] = town.size
print("et_town.jpg", town.size)

# =====================================================================
#  PART 4: "WE'LL ALL GET DVT!" (IMG-061, master 22_1.jpg, turned 90)
#  Top half of the screen: inside the van. First the four potatoes
#  (Rosie: "We'll all get DVT!", Enda: "My foot will be frozen on the
#  accelerator!"), then the next little panel (Annelisa: "Do you need a
#  break? ..."). Bottom half: the van on the road and the services sign.
#  All the words are lifted off, so they can appear as each one speaks.
# =====================================================================
TOP_H = 520                      # the top half (inside the van)

def flat_paper(p, hole, grow_by=7):
    """Paint over 'hole' AND any yellow page showing round the panel with
    the panel's own white paper. The colour is smudged in from PLAIN white
    paper only (never the yellow page or the drawing), then blurred a lot
    so it follows the photo's gentle light and shade, plus a little grain."""
    r, g, b = p.rgb[..., 0], p.rgb[..., 1], p.rgb[..., 2]
    yellow = ((g - b) > 28) & ((r - g) < 15) & (p.ink < 40)   # the book's yellow page (faces are peach: redder)
    yellow = grow(yellow * 255.0, 5) > 10
    mask = np.maximum(grow(hole, grow_by), yellow * 255.0)
    plain = (mask < 10) & (p.ink < 20) & ((p.rgb.max(axis=2) - p.rgb.min(axis=2)) < 30)
    fill = fill_holes(p.rgb, plain.astype(np.float32))
    fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(14)), np.float32)
    fill = fill + rng.normal(0, 2.5, p.rgb.shape[:2])[..., None]
    soft = np.asarray(Image.fromarray(np.clip(mask, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
    return Image.fromarray(np.clip(p.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))

# ---- the four potatoes ----
fp = Picture("22_1.jpg", 90, (150, 80, 440, 234), W - 40, TOP_H - 20, at_y=10)
round_patch(fp, "sv_mouth_rosie", (189, 141, 212, 156))
round_patch(fp, "sv_mouth_enda", (314, 199, 331, 210))
disc_patch(fp, "sv_wheel_a", (322, 215), 6)
fp.words("sv_dvt", (230, 101, 306, 150), INKC)            # "We'll all get DVT!"
fp.words("sv_foot", (345, 113, 440, 196), INKC)           # "My foot will be frozen on the accelerator!"
# (the "M" pokes left past the seat's edge, so the box starts further left;
#  then the seat's edge, which comes along below the "My", is wiped off)
foot = Image.open(OUT / "sv_foot.png")
fa = np.asarray(foot.getchannel("A")).copy()
fa[round((148 - 113) * fp.zoom):, :round((360 - 345) * fp.zoom)] = 0   # the seat's edge
fa[:, :round(2 * fp.zoom)] = 0                                          # the speech tick's tip
foot.putalpha(Image.fromarray(fa)); foot.save(OUT / "sv_foot.png")
# rub out the words (the seat's edge is just left of "My foot") and the
# corner of the next panel, which pokes into this one
hole = box_hole(fp, (228, 99, 308, 152))                            # "We'll all get DVT!"
fb = fp.pbox((345, 113, 440, 196))                                   # "My foot...": just its ink,
hole[fb[1]:fb[3], fb[0]:fb[2]] = np.maximum(hole[fb[1]:fb[3], fb[0]:fb[2]],   # so the seat's edge stays
                                            grow(fa.astype(np.float32), 9))
hole = np.maximum(hole, box_hole(fp, (345, 201, 440, 234)))
hole = np.maximum(hole, box_hole(fp, (336, 128, 351, 148)))        # the little speech tick
four = flat_paper(fp, hole)
four.save(OUT / "sv_four.jpg", quality=90); fp.place("sv_four", 0, 0)
layout["sv_four"]["w"], layout["sv_four"]["h"] = four.size
print("sv_four.jpg", four.size)

# ---- the next little panel: Annelisa and Enda ----
ap = Picture("22_1.jpg", 90, (345, 202, 655, 407), W - 40, TOP_H - 20, at_y=10)
round_patch(ap, "sv_mouth_ann", (428, 352, 472, 376))
disc_patch(ap, "sv_wheel_b", (581, 397), 11)
ap.words("sv_break", (350, 206, 640, 274), INKC)           # "Do you need a break? ..."
two = flat_paper(ap, box_hole(ap, (348, 204, 642, 276)), 3)
two.save(OUT / "sv_two.jpg", quality=90); ap.place("sv_two", 0, 0)
layout["sv_two"]["w"], layout["sv_two"]["h"] = two.size
print("sv_two.jpg", two.size)

# ---- the road, the van and LE SERVICES 100,000 m ----
rp = Picture("22_1.jpg", 90, (131, 415, 400, 560), 700, H - TOP_H - 30, at_y=TOP_H + 15)
SVAN = [(137, 509), (196, 507), (196, 502), (219, 502), (219, 548), (214, 558), (197, 560),
        (186, 556), (160, 556), (152, 560), (143, 558), (137, 548)]
rp.solid("sv_van", (135, 500, 221, 562), SVAN)
# behind the van: plain road, mended with crayon texture from the empty road
road_hole = grow(rp.hole, 9)
road_hole = np.maximum(road_hole, box_hole(rp, (131, 538, 141, 548)))   # the exhaust puffs
rp.rgb = np.asarray(mend(rp, road_hole, (240, 505, 330, 550), 20), np.float32)
road = Image.fromarray(rp.rgb.astype(np.uint8))
road.save(OUT / "sv_road.jpg", quality=90); rp.place("sv_road", 0, 0)
layout["sv_road"]["w"], layout["sv_road"]["h"] = road.size
print("sv_road.jpg", road.size)

# =====================================================================
#  PART 5: "MEANWHILE, ENDA WAS TOTALLY FINE." (IMG-062, master 22_2.jpg)
#  The camera zooms in on Enda in the little panel above until he is the
#  same size as in this close-up, then we swap to it: Enda (left) and
#  his thought - a frog in a boiling pot (right).
# =====================================================================
fg = Picture("22_2.jpg", 0, (110, 55, 1000, 740), W, H)
round_patch(fg, "fg_mouth", (352, 497, 388, 517))
disc_patch(fg, "fg_wheel", (300, 640), 88)
fg.words("fg_meanwhile", (612, 595, 935, 730), INKC)      # "Meanwhile, Enda was totally fine." and the arrow
# everything OUTSIDE the two pictures (the yellow page, and the corner of
# the van picture from before) becomes our own plain yellow page; the empty
# top-left corner is where Enda's words will go
fg.rgb = np.asarray(paper_fill(fg, box_hole(fg, (608, 592, 940, 735)), 5), np.float32)   # rub out the caption
keep = np.maximum(polygon_mask(fg.img.size, [fg.pt(x, y) for x, y in
                                             [(117, 337), (503, 335), (505, 722), (117, 724)]], 0),
                  polygon_mask(fg.img.size, [fg.pt(x, y) for x, y in
                                             [(505, 126), (583, 126), (583, 65), (962, 62), (972, 580), (505, 584)]], 0))
soft = np.asarray(Image.fromarray(keep.astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
fill = np.array(PAPER, np.float32) + rng.normal(0, 2.5, fg.rgb.shape[:2])[..., None]
frog = Image.fromarray(np.clip(fg.rgb * soft + fill * (1 - soft), 0, 255).astype(np.uint8))
frog.save(OUT / "fg_frog.jpg", quality=90); fg.place("fg_frog", 0, 0)
layout["fg_frog"]["w"], layout["fg_frog"]["h"] = frog.size
print("fg_frog.jpg", frog.size)
# where things are, on the screen, for the animation:
def on_screen(p, x, y):
    return [p.pt(x, y)[0] + p.x, p.pt(x, y)[1] + p.y]
layout["fg_face"] = on_screen(fg, 125, 345) + on_screen(fg, 495, 720)       # Enda's face, big
layout["fg_drops"] = [on_screen(fg, x, y) for x, y in [(152, 472), (138, 492), (450, 496), (444, 512)]]
layout["fg_pot"] = on_screen(fg, 755, 235)                                 # the top of the pot
layout["fg_potw"] = fg.pt(860, 0)[0] - fg.pt(670, 0)[0]                    # how wide the pot is
layout["sv_face"] = on_screen(ap, 548, 322) + on_screen(ap, 612, 405)       # Enda's face, small (part 4)

# Enda's line, lifted from the little panel in part 4 (master 22_1.jpg),
# to go in the empty top-left corner
fl = Picture("22_1.jpg", 90, (470, 412, 662, 487), 520, 210, at_x=fg.x + 40, at_y=fg.y + 90)
fl.words("fg_line", (470, 412, 662, 487), INKC)          # "I'm like a frog in boiling water!"

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT10 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

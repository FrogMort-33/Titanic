"""
prepare_pictures.py  -  cut the pictures for EPISODE 11 "Fiery Finale ?"

  IMG-063 (master 23_1.jpg), the middle picture: the mountains on fire.

Makes, in ../assets/:
  ff_hills.jpg      the mountains, with our van and "OMG" rubbed out
  ff_flame1..3.png  the three drawn flames (they flicker, in place)
  ff_flame.png      one clean flame (just the flame, no hillside) - copies
                    of it spring up behind the van as it passes
  (ff_later.jpg "FIVE MINUTES LATER" is copied from episode 10, and
   ff_bus.png, our usual van, from episode 1 via episodes 9 and 10)

And layout.js (window.LAYOUT11): where everything goes, in screen pixels,
plus the road for the van, and green spots where new flames can start.

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

# =====================================================================
#  THE MOUNTAINS ON FIRE (IMG-063, middle picture)
# =====================================================================
hl = Picture("23_1.jpg", 0, (172, 362, 852, 748), W, H)

# ---- the three drawn flames: cut out (with their hillside), so each can
#      flicker - stretching taller from its bottom, never smaller, so the
#      drawing underneath is always covered ----
FLAMES = {
    "ff_flame1": [(558, 632), (570, 600), (580, 562), (582, 525), (590, 494), (603, 520), (618, 540), (640, 552),
                  (652, 568), (657, 605), (650, 630), (620, 632)],
    "ff_flame2": [(644, 634), (648, 590), (650, 545), (660, 500), (676, 440), (692, 462), (705, 488), (728, 498),
                  (742, 520), (738, 585), (722, 626), (690, 636)],
    "ff_flame3": [(733, 630), (738, 560), (737, 480), (740, 420), (746, 382), (765, 428), (792, 458), (810, 500),
                  (822, 560), (818, 625), (790, 632)],
}
for name, outline in FLAMES.items():
    a = polygon_mask(hl.img.size, [hl.pt(x, y) for x, y in outline], 1.2)
    ys, xs = np.nonzero(a > 10)
    b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    save_png(name, hl.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
    hl.place(name, b[0], b[1])

# ---- one CLEAN flame (the big right one, without the green hill showing
#      through it), for the new fires that spread behind the van ----
a = polygon_mask(hl.img.size, [hl.pt(x, y) for x, y in FLAMES["ff_flame3"]], 1.2)
r, g, b_ = hl.rgb[..., 0], hl.rgb[..., 1], hl.rgb[..., 2]
# keep only the flame itself: its colours (yellow, red) and its ink lines -
# not the green hillside or the pale paper showing between the tongues
sat = hl.rgb.max(axis=2) - hl.rgb.min(axis=2)
greenish = (g > r + 6) & (g > b_ + 6)
paper = (sat < 22) & (hl.ink < 30)
flame = (~greenish & ~paper).astype(np.uint8) * 255
# "close" the little gaps in the pale crayon (fatten, then thin again)
flame = Image.fromarray(flame).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
a = a * np.asarray(flame, np.float32) / 255
a = np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.MedianFilter(5)), np.float32)   # tidy specks
ys, xs = np.nonzero(a > 10)
b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
save_png("ff_flame", hl.img.crop(b), a[b[1]:b[3], b[0]:b[2]])

# ---- rub out our van, its speed lines and "OMG" (the van drives in later) ----
hole = np.zeros_like(hl.ink)
for box in [(398, 690, 524, 748), (520, 664, 616, 708)]:
    bb = hl.pbox(box)
    hole[bb[1]:bb[3], bb[0]:bb[2]] = 255
hills = mend(hl, hole, (430, 600, 530, 665), 20)
# the road's edge line ran under the van: draw it back in
d = ImageDraw.Draw(hills)
d.line([hl.pt(392, 746), hl.pt(460, 744), hl.pt(528, 742)], fill=(52, 50, 48), width=max(2, round(0.9 * hl.zoom)))
hills.save(OUT / "ff_hills.jpg", quality=90)
hl.place("ff_hills", 0, 0)
layout["ff_hills"]["w"], layout["ff_hills"]["h"] = hills.size
print("ff_hills.jpg", hills.size)

# ---- the road: where the van's wheels go, left to right ----
layout["ff_road"] = [[hl.pt(x, y)[0] + hl.x, hl.pt(x, y)[1] + hl.y] for x, y in
                     [(150, 750), (345, 748), (520, 742), (700, 722), (870, 700)]]

# ---- green spots on the hills where new flames can start (picked at
#      random from the green crayon, away from the existing flames) ----
green = (g > r + 6) & (g > b_ + 6) & (hl.ink < 40)
for outline in FLAMES.values():
    green &= polygon_mask(hl.img.size, [hl.pt(x, y) for x, y in outline], 0) < 10
gy, gx = np.nonzero(green[: hl.pt(0, 735)[1]])            # (above the road)
pick = rng.choice(len(gx), 160, replace=False)
spots = sorted([[int(gx[i]) + hl.x, int(gy[i]) + hl.y] for i in pick])
layout["ff_spots"] = spots

# =====================================================================
#  PART 2: LE SATNAV (IMG-065, master 23_3.jpg, the left-hand panel)
#  "Satnav: Hey, you want a more adventurous route? Recalculating journey..."
# =====================================================================
sn = Picture("23_3.jpg", 0, (58, 90, 507, 647), W - 40, H - 20)
sn.words("ff_satnav_words", (86, 503, 496, 620), INKC)
lines = [(86, 503, 496, 540), (86, 540, 496, 578), (86, 578, 496, 620)]   # the 3 lines, top to bottom
layout["ff_satnav_lines"] = [sn.pt(0, y1)[1] - sn.pt(0, 503)[1] for _, _, _, y1 in lines]   # (where each ends)
# the panel with the words rubbed out (they appear line by line)
hole = box_hole(sn, (84, 500, 498, 624))
near = sn.pbox((84, 500, 498, 624))                       # the paper between the letters
nb = np.zeros(sn.ink.shape, bool); nb[near[1]:near[3], near[0]:near[2]] = True
colour = np.median(sn.rgb[nb & (grow(sn.ink, 9) < 15)], axis=0)
soft = np.asarray(Image.fromarray(hole.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), np.float32)[..., None] / 255
fill = colour + rng.normal(0, 2.5, sn.rgb.shape[:2])[..., None]
clean = Image.fromarray(np.clip(sn.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))
clean.save(OUT / "ff_satnav.jpg", quality=90)
sn.place("ff_satnav", 0, 0)
layout["ff_satnav"]["w"], layout["ff_satnav"]["h"] = clean.size
layout["ff_beacon"] = [sn.pt(381, 211)[0] + sn.x, sn.pt(381, 211)[1] + sn.y, round(26 * sn.zoom)]   # the flashing light
print("ff_satnav.jpg", clean.size)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT11 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

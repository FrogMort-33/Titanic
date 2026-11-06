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

# ---- the right-hand satnav panel: the wiggly "adventurous" road, and
#      "Satnav: :)" - the smile appears on its own ----
s2 = Picture("23_3.jpg", 0, (507, 95, 949, 640), W - 40, H - 20)
s2.words("ff_smile", (660, 503, 748, 598), INKC)                  # ":)"
hole = box_hole(s2, (657, 500, 751, 601))
near = s2.pbox((560, 495, 860, 610))                      # the paper around it (not the ink)
nb = np.zeros(s2.ink.shape, bool); nb[near[1]:near[3], near[0]:near[2]] = True
colour = np.median(s2.rgb[nb & (grow(s2.ink, 9) < 15)], axis=0)
soft = np.asarray(Image.fromarray(hole.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)), np.float32)[..., None] / 255
fill = colour + rng.normal(0, 2.5, s2.rgb.shape[:2])[..., None]
smile_free = Image.fromarray(np.clip(s2.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))
smile_free.save(OUT / "ff_satnav2.jpg", quality=90)
s2.place("ff_satnav2", 0, 0)
layout["ff_satnav2"]["w"], layout["ff_satnav2"]["h"] = smile_free.size
layout["ff_beacon2"] = [s2.pt(850, 225)[0] + s2.x, s2.pt(850, 225)[1] + s2.y, round(26 * s2.zoom)]
print("ff_satnav2.jpg", smile_free.size)

# =====================================================================
#  PART 3: TASHA AT HER WINDOW (IMG-054 from episode 9, master 19_4.jpg)
#  The same two drawings of Tasha as episode 9, cut again bigger (full
#  screen). The flames lick the sides of the van around her.
# =====================================================================
def patch_out(pic, hole, name):
    """Rub out everything in 'hole' (smudging in the paper or crayon
    colour from around it), and save the picture as a jpg."""
    big = grow(hole, 9)
    soft = np.asarray(Image.fromarray(np.clip(big, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
    # the colour to fill with: smudged in ONLY from clean bits outside the hole
    good = ((grow(big, 9) < 10) & (pic.ink < 30)).astype(np.float32)
    fill = fill_holes(pic.rgb, good)
    fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(5)), np.float32)
    fill = fill + rng.normal(0, 2.5, fill.shape[:2])[..., None]           # paper grain
    clean = Image.fromarray(np.clip(pic.rgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))
    clean.save(OUT / (name + ".jpg"), quality=90)
    pic.place(name, 0, 0)
    layout[name]["w"], layout[name]["h"] = clean.size
    print(name + ".jpg", clean.size)
    return clean

def cut_polys(pic, name, outlines):
    """Like cut_seat, but the outline can be several pieces"""
    a = np.zeros_like(pic.ink)
    for o in outlines:
        a = np.maximum(a, polygon_mask(pic.img.size, [pic.pt(x, y) for x, y in o], 1.0))
    ys, xs = np.nonzero(a > 10)
    b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    save_png(name, pic.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
    pic.place(name, b[0], b[1])
    pic.hole = np.maximum(pic.hole, a)


tw = Picture("19_4.jpg", 0, (60, 108, 550, 615), W - 40, H - 20)
cut_polys(tw, "tw_tasha1", [[(138, 380), (148, 325), (180, 284), (230, 261), (282, 256), (326, 274), (356, 304),
                             (366, 362), (396, 476), (392, 484), (206, 484), (188, 440), (150, 410)],
                            [(203, 492), (238, 492), (236, 515), (203, 515)],
                            [(337, 492), (362, 492), (360, 512), (337, 512)]])
# behind her: inside the window, plain paper; below it, the van's pink
# crayon (copied in patches from the pink below the window); then the
# window's left and bottom edges are drawn back in
inside = box_hole(tw, (150, 220, 488, 482))
big = grow(tw.hole, 9)
hole_in = np.minimum(big, inside)
hole_out = big * (inside < 10)
tw.rgb = np.asarray(mend(tw, hole_in, (400, 240, 480, 470), 22), np.float32)   # paper texture from the empty right side
tw.rgb = np.asarray(mend(tw, hole_out, (200, 520, 470, 600), 22), np.float32)
win = Image.fromarray(np.clip(tw.rgb, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(win)
d.line([tw.pt(153, 214), tw.pt(146, 330), tw.pt(132, 489)], fill=(40, 38, 36), width=round(1.6 * tw.zoom))
d.line([tw.pt(132, 489), tw.pt(300, 486), tw.pt(465, 478)], fill=(40, 38, 36), width=round(1.6 * tw.zoom))
win.save(OUT / "tw_window.jpg", quality=90)
tw.place("tw_window", 0, 0)
layout["tw_window"]["w"], layout["tw_window"]["h"] = win.size
print("tw_window.jpg", win.size)
# her second look (from the right-hand picture), sized and placed so its
# window lines up with the first window
W1 = (133, 211, 492, 489)
W2 = (585, 218, 910, 489)
k = (tw.pt(W1[2], 0)[0] - tw.pt(W1[0], 0)[0]) / (W2[2] - W2[0])     # screen pixels per working pixel
t2 = Picture("19_4.jpg", 0, W2[:2] + (W2[2], 520), round((W2[2] - W2[0]) * k), 4000,
             at_x=tw.pt(*W1[:2])[0] + tw.x, at_y=tw.pt(*W1[:2])[1] + tw.y)
cut_polys(t2, "tw_tasha2", [[(598, 332), (614, 295), (650, 271), (700, 267), (742, 284), (762, 318), (767, 350),
                             (792, 376), (830, 470), (836, 482), (668, 482), (650, 420), (640, 400), (604, 386)],
                            [(652, 490), (684, 490), (682, 512), (652, 512)],
                            [(763, 490), (793, 490), (791, 512), (763, 512)]])
# the window (where the flames must NOT go) and the van's side, on the screen
layout["tw_glass"] = [tw.pt(*W1[:2])[0] + tw.x, tw.pt(*W1[:2])[1] + tw.y,
                      tw.pt(*W1[2:])[0] + tw.x, tw.pt(*W1[2:])[1] + tw.y]

# =====================================================================
#  PART 4: UP THE BURNING MOUNTAIN (IMG-067, master 24_2.jpg) with
#  screaming Enda (IMG-068, master 24_3.jpg) in the corner and
#  "Meanwhile, Enda was totally fine."
# =====================================================================
um = Picture("24_2.jpg", 0, (48, 135, 850, 692), W, H)
UFLAMES = {
    "um_flame1": [(408, 408), (440, 418), (482, 445), (520, 470), (546, 510), (562, 560), (558, 606), (500, 608),
                  (440, 608), (424, 560), (412, 480)],
    "um_flame2": [(523, 305), (560, 313), (602, 340), (642, 380), (668, 420), (662, 472), (640, 482), (560, 502),
                  (540, 470), (528, 400)],
    "um_flame3": [(652, 425), (655, 345), (680, 290), (712, 228), (747, 162), (762, 230), (773, 330), (768, 428),
                  (720, 428)],
}
for name, outline in UFLAMES.items():
    a = polygon_mask(um.img.size, [um.pt(x, y) for x, y in outline], 1.2)
    ys, xs = np.nonzero(a > 10)
    b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    save_png(name, um.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
    um.place(name, b[0], b[1])
# the van, and one "H" (copies of it make the screaming trail)
um.solid("um_van", (712, 543, 751, 574), [(713, 546), (748, 552), (750, 562), (746, 574), (718, 574), (712, 563)])
um.words("um_h", (823, 548, 851, 579), INKC)
# rub out the van and all the "AHHHHH" (the van drives in later, screaming)
hole = grow(um.hole, 7)
for box in [(713, 508, 767, 549),
            (300, 624, 448, 694)]:                    # (and the corner of the picture of Enda below it)
    hole = np.maximum(hole, box_hole(um, box))
# the H's: a shape that keeps just right of the road, so the road stays
hole = np.maximum(hole, polygon_mask(um.img.size, [um.pt(x, y) for x, y in
                  [(758, 518), (888, 518), (888, 672), (803, 672), (803, 622), (760, 600)]], 1.0))
mount = mend(um, hole, (590, 560, 700, 660), 22)
# the bit of road the van was sitting on: drawn back in (a dark edge,
# then the brown road on top)
d = ImageDraw.Draw(mount)
bend = [um.pt(x, y) for x, y in [(700, 552), (712, 553), (724, 557), (733, 565), (739, 578), (742, 592)]]
d.line(bend, fill=(45, 40, 36), width=round(8.5 * um.zoom), joint="curve")
d.line(bend, fill=(150, 112, 88), width=round(6.5 * um.zoom), joint="curve")
mount.save(OUT / "um_mountain.jpg", quality=90)
um.place("um_mountain", 0, 0)
layout["um_mountain"]["w"], layout["um_mountain"]["h"] = mount.size
print("um_mountain.jpg", mount.size)
# the road, from the bottom of the picture up to the first hill
layout["um_road"] = [[um.pt(x, y)[0] + um.x, um.pt(x, y + 5)[1] + um.y] for x, y in
                     [(780, 700), (781, 650), (762, 625), (745, 600), (740, 580), (735, 565), (722, 556), (705, 552),
                      (680, 544), (660, 525), (650, 516), (625, 521), (605, 512), (580, 508), (560, 515), (546, 521)]]
# green spots where the fire can spread to
r, g, b_ = um.rgb[..., 0], um.rgb[..., 1], um.rgb[..., 2]
green = (g > r + 6) & (g > b_ + 6) & (um.ink < 40) & (hole < 10)
for outline in UFLAMES.values():
    green &= polygon_mask(um.img.size, [um.pt(x, y) for x, y in outline], 0) < 10
green[:, :um.pt(300, 0)[0]] = False                                 # (not the far-left hill, where Enda sits)
gy, gx = np.nonzero(green)
pick = rng.choice(len(gx), 220, replace=False)
layout["um_spots"] = [[int(gx[i]) + um.x, int(gy[i]) + um.y] for i in pick]

# ---- screaming Enda, in the bottom-left corner ----
EX, EY = 14, 448
en = Picture("24_3.jpg", 0, (38, 228, 480, 708), 410, 440, at_x=EX, at_y=EY)
round_patch(en, "um_mouth", (170, 400, 308, 480))
disc_patch(en, "um_wheel", (255, 570), 95)
disc_patch(en, "um_eye_l", (203, 357), 25)
disc_patch(en, "um_eye_r", (310, 366), 25)
en.img.save(OUT / "um_enda.jpg", quality=90)
en.place("um_enda", 0, 0)
layout["um_enda"]["w"], layout["um_enda"]["h"] = en.img.size
layout["um_drops"] = [[en.pt(x, y)[0] + en.x, en.pt(x, y)[1] + en.y] for x, y in
                      [(108, 360), (96, 410), (126, 420), (414, 425)]]
# "Meanwhile, Enda was totally fine." (with its arrow)
cap = Picture("24_3.jpg", 0, (585, 485, 935, 645), 420, 200, at_x=EX + 440, at_y=H - 205)
cap.words("um_meanwhile", (585, 485, 935, 645), INKC)
layout["um_card"] = [EX + 430, H - 215, 440, 205]

# =====================================================================
#  PART 5: "IS THAT LE MAZEL?" (IMG-069 top, master 25_1.jpg)
#  The van (drawn facing LEFT) comes in from the right, stops, the words
#  appear; then it rolls on BEHIND the ruined house and off to the left.
# =====================================================================
lm = Picture("25_1.jpg", 0, (150, 40, 724, 402), W - 20, H - 20)
lm.solid("lm_van", (572, 157, 697, 257), [(575, 160), (692, 160), (696, 215), (691, 247), (670, 254), (630, 251),
                                          (605, 255), (584, 249), (577, 215)])
van_hole = lm.hole.copy()
lm.words("lm_say1", (262, 42, 682, 99), INKC)                # "Is that Le Mazel?"
lm.words("lm_say2a", (158, 99, 722, 143), INKC)              # "It's been 50 years, the forest fire got
lm.words("lm_say2b", (158, 140, 546, 182), INKC)             #  to it before we did"
# the house is cut out too, so the van can pass BEHIND it
HOUSE = [(198, 214), (226, 211), (296, 221), (310, 211), (377, 209), (384, 227), (412, 227), (422, 237),
         (424, 404), (196, 404)]
ha = polygon_mask(lm.img.size, [lm.pt(x, y) for x, y in HOUSE], 1.0)
ys, xs = np.nonzero(ha > 10)
hb = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
save_png("lm_house", lm.img.crop(hb), ha[hb[1]:hb[3], hb[0]:hb[2]])
lm.place("lm_house", hb[0], hb[1])
# the background: words and van rubbed out (sky colour smudged in)
hole = np.maximum(grow(van_hole, 9), box_hole(lm, (262, 42, 682, 99)))
hole = np.maximum(hole, box_hole(lm, (158, 99, 722, 143)))
hole = np.maximum(hole, box_hole(lm, (158, 140, 546, 182)))
sky = mend(lm, hole, (440, 185, 560, 250), 20)
# the hill's edge ran under the van's wheels: draw it back
ImageDraw.Draw(sky).line([lm.pt(545, 265), lm.pt(595, 251), lm.pt(650, 247), lm.pt(724, 245)],
                         fill=(40, 38, 36), width=max(2, round(0.9 * lm.zoom)))
sky.save(OUT / "lm_scene.jpg", quality=90)
lm.place("lm_scene", 0, 0)
layout["lm_scene"]["w"], layout["lm_scene"]["h"] = sky.size
print("lm_scene.jpg", sky.size)
# the van's road: along the top of the hill, down behind the house, off left
layout["lm_road"] = [[lm.pt(x, y)[0] + lm.x, lm.pt(x, y)[1] + lm.y] for x, y in
                     [(800, 244), (724, 245), (650, 247), (595, 251), (545, 265), (495, 285), (420, 322),
                      (300, 346), (200, 360), (40, 366)]]
layout["lm_stop"] = lm.pt(634, 0)[0] + lm.x                     # where it stops (its middle)

# =====================================================================
#  PART 6: THE RANDOM EXCLAMATION SIGN (IMG-070, master 25_2.jpg) - the
#  whole picture, just as it is, with Enda (right) animated
# =====================================================================
xs = Picture("25_2.jpg", 0, (60, 132, 997, 622), W, H)
round_patch(xs, "xs_mouth", (758, 293, 872, 368))
disc_patch(xs, "xs_wheel", (830, 450), 70)
disc_patch(xs, "xs_eye_l", (755, 252), 18)
disc_patch(xs, "xs_eye_r", (865, 262), 19)
# below Enda's picture is the next page's picture: that becomes plain page
rgb = xs.rgb.copy()
pb = xs.pbox((648, 562, 997, 622))
rgb[pb[1]:pb[3], pb[0]:pb[2]] = np.array(PAPER, np.float32) + rng.normal(0, 2.5, (pb[3] - pb[1], pb[2] - pb[0], 1))
pic70 = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
pic70.save(OUT / "xs_sign.jpg", quality=90)
xs.place("xs_sign", 0, 0)
layout["xs_sign"]["w"], layout["xs_sign"]["h"] = pic70.size
layout["xs_enda"] = list(xs.pbox((648, 140, 997, 562)))                       # Enda's picture (on itself)
layout["xs_enda"] = [layout["xs_enda"][0] + xs.x, layout["xs_enda"][1] + xs.y,
                     layout["xs_enda"][2] + xs.x, layout["xs_enda"][3] + xs.y]
layout["xs_drops"] = [[xs.pt(x, y)[0] + xs.x, xs.pt(x, y)[1] + xs.y] for x, y in
                      [(690, 240), (685, 305), (715, 325), (938, 300)]]
print("xs_sign.jpg", pic70.size)
# Enda's picture by itself (so it can bop without the rest moving)
eb = xs.pbox((648, 140, 997, 562))
xs.img.crop(eb).save(OUT / "xs_enda.jpg", quality=90)
xs.place("xs_enda_img", eb[0], eb[1])

# =====================================================================
#  PART 7: THE FOREST ROAD FROM ABOVE (IMG-071 right, master 25_3.jpg)
#  The van (a pink box, seen from above) drives up the road again and
#  again, screaming. (Tasha at her window, beside it, reuses tw_*.)
# =====================================================================
fr = Picture("25_3.jpg", 0, (432, 130, 950, 695), 700, 880, at_x=560)
fr.solid("fr_van", (636, 221, 734, 399), [(638, 223), (732, 223), (734, 397), (638, 397)])
van_alpha = fr.hole.copy()
fr.words("fr_aah1", (432, 205, 632, 297), INKC)             # "AAAAAAAAH" (left)
fr.words("fr_aah2", (748, 275, 914, 372), INKC)             # "AAAAAAAAH" (right)
words_hole = grow(((fr.hole - van_alpha) > 12) * 255.0, 11)
# the road where the van was: the road runs straight up and down, so the
# empty road just BELOW the van is simply copied up over it
rgb = fr.rgb.copy()
top, bot = fr.pt(0, 216)[1], fr.pt(0, 404)[1]
x0, x1 = fr.pt(628, 0)[0], fr.pt(742, 0)[0]
rgb[top:bot, x0:x1] = fr.rgb[bot:bot + (bot - top), x0:x1]
fr.rgb = rgb
# the "AAAAH"s: just their ink rubbed out, smudged over from around them
road = mend(fr, words_hole, None)
road.save(OUT / "fr_road.jpg", quality=90)
fr.place("fr_road", 0, 0)
layout["fr_road"]["w"], layout["fr_road"]["h"] = road.size
print("fr_road.jpg", road.size)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT11 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

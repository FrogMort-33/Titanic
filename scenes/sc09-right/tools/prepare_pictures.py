"""
prepare_pictures.py  -  cut the pictures for EPISODE 9 "Drive on your other Right!"

  PANEL 1  "One hour later"          IMG-037 (master 17_1.jpg)
  PANEL 2  "French number plates"    IMG-038 (master 17_2.jpg), clipped neatly
                                     to its panel, for the pop-up
  PANEL 3  "Random tyre"             IMG-039 (master 17_3.jpg), the middle
                                     picture: the van, the tyre, the scuff, and
                                     the words "Random tyre hitting the car"
  PANEL 4  "It'll come off in the wash!"  IMG-039, the right-hand picture

Makes, in ../assets/:
  rt_later.jpg      "One hour later" with the balloons and trophy
  rt_plates.png     the French number plates picture (for the pop-up)
  rt_blank.jpg      the tyre picture with NO van and NO tyre (rebuilt behind)
  rt_van.png        the van
  rt_tyre.png       the tyre with its speed lines (coming in)
  rt_lump.png       just the lump of tyre (bouncing off)
  rt_scuff.png      the scuff mark it leaves on the van
  rt_words.png      the arrow and "Random tyre hitting the car"
  rt_wash.jpg       Spud Enda: "It'll come off in the wash!"
  ds_blank.jpg      the inside of the van with no seats (IMG-041)
  ds_left/mid/right.png  the three front seats with their potatoes;
  ds_mid2.png       the middle seat again, worried;  ds_say1/2.png  her words
  ds_scream.jpg     "DRIVE ON THE RIIIGHT!" (IMG-042)
  rb_blank.jpg      the roundabout with no cars (IMG-043); rb_pink, rb_blue1..3,
                    rb_red1..2 the cars; rb_honk1..3, rb_oops, rb_stalled (words)
  we_enda.jpg       worried Enda (IMG-045), with we_wheel, we_lines, we_brow_l/r,
                    we_sweat_l/r cut out to move
  nv_award.png      "2022's Navigation Award goes to Annelisa Christensen!" (IMG-046)
  nv_van1/2/3.jpg   the van interior, plain (IMG-047 left, IMG-047 right, IMG-049),
                    with nv_rear/left/mid/enda1..3 (the seats), nv_wheel1..3,
                    nv_mouth_rear1/2 and nv_mouth_mid1..3 (mouths that talk),
                    and nv_say1..5 (the words)
  nv_road.jpg       the two roads with no van (IMG-048); nv_pink (the van),
                    nv_speed (its speed lines), nv_fire (flickers)
  nv_laugh.jpg      the laughing van picture, empty (IMG-050); nv_hahavan,
                    nv_haspeed, nv_ha (all the HA HA HAs)
  (rt_bus.png is the bus from episode 1, for crossing the screen)

And layout.js (window.LAYOUT9): where everything goes, in screen pixels.

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



# =====================================================================
#  PANEL 1: One hour later (IMG-037)
# =====================================================================
later = Picture("17_1.jpg", 270, (55, 262, 975, 652), W - 80, H - 200, at_y=60)
later.save_on_paper("rt_later")
layout["rt_later"] = {"x": later.x, "y": later.y, "w": later.img.width, "h": later.img.height}


# =====================================================================
#  PANEL 2: French number plates (IMG-038), clipped to its panel
# =====================================================================
plates = Picture("17_2.jpg", 90, (66, 424, 610, 866), W - 300, H - 260)
CLIP = [(66, 424), (610, 424), (610, 866), (66, 866)]
a = polygon_mask(plates.img.size, [plates.pt(x, y) for x, y in CLIP], 0.8)
save_png("rt_plates", plates.img, a)
plates.place("rt_plates", 0, 0)


# =====================================================================
#  PANEL 3: the random tyre (IMG-039, the middle picture)
# =====================================================================
ty = Picture("17_3.jpg", 0, (334, 298, 642, 640), W - 260, H - 230, at_y=40)
INKC = (34, 34, 36)

# The tyre coming in: the blue lump and its speed lines
TYRE = [(552, 410), (560, 392), (590, 386), (612, 370), (630, 380), (614, 404), (606, 420),
        (604, 445), (585, 456), (560, 452), (550, 430)]
b = ty.pbox((546, 366, 634, 460))
tyre_a = polygon_mask(ty.img.size, [ty.pt(x, y) for x, y in TYRE], 1.0)
# (only the ink and the blue: not the paper between the lines)
blue = np.zeros_like(ty.ink)
cx, cy = ty.pt(578, 421); r = 29 * ty.zoom
yy, xx = np.mgrid[0:ty.img.height, 0:ty.img.width]
disc = ((xx - cx) ** 2 + (yy - cy) ** 2 < r * r).astype(np.float32) * 255
# the lump = inside that circle, only the ink and the BLUE crayon (not the paper)
rgb_ = ty.rgb
blueness = np.clip((rgb_[..., 2] - rgb_[..., 0] - 15) * 6, 0, 255)
lump = np.minimum(disc, np.maximum(ty.ink, blueness))
lump = np.asarray(Image.fromarray(lump.astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
                  .filter(ImageFilter.MinFilter(3)), np.float32)            # fill tiny gaps
tyre_alpha = np.minimum(tyre_a, np.maximum(ty.ink, lump))
save_png("rt_tyre", ty.img.crop(b), tyre_alpha[b[1]:b[3], b[0]:b[2]])
ty.place("rt_tyre", b[0], b[1])
bl = ty.pbox((546, 388, 610, 456))
save_png("rt_lump", ty.img.crop(bl), lump[bl[1]:bl[3], bl[0]:bl[2]])
ty.place("rt_lump", bl[0], bl[1])

# The scuff mark on the van's side
ty.words("rt_scuff", (476, 496, 534, 533))

# The van: cut along a traced outline (the tyre sits on its front corner,
# so we patch that corner with van-coloured paper and draw its lines back)
VANP = [(370, 402), (478, 410), (581, 410), (582, 574), (548, 576), (540, 599), (470, 601),
        (458, 586), (452, 600), (386, 603), (372, 590), (370, 575)]
vb = ty.pbox((362, 390, 586, 607))
van_a = polygon_mask(ty.img.size, [ty.pt(x, y) for x, y in VANP], 1.0)
van_rgb = np.asarray(ty.img, np.float32).copy()
pb = ty.pbox((420, 496, 470, 528))                               # a plain bit of the van's side
paper = np.median(van_rgb[pb[1]:pb[3], pb[0]:pb[2]].reshape(-1, 3), axis=0)
patch = (np.maximum(disc, grow(ty.hole, 3)) > 20)                 # the tyre and the scuff
# paint those bits the colour of the van's side, with a little grain
van_rgb[patch] = paper + rng.normal(0, 4, (patch.sum(), 1))
# (the front corner is a little whiter than the middle of the van)
cb = ty.pbox((530, 455, 572, 500))
front = np.median(np.asarray(ty.img, np.float32)[cb[1]:cb[3], cb[0]:cb[2]].reshape(-1, 3), axis=0)
corner = disc > 20
van_rgb[corner] = front + rng.normal(0, 4, (corner.sum(), 1))
van_img = Image.fromarray(van_rgb.astype(np.uint8))
pen = ImageDraw.Draw(van_img)
pen.line([ty.pt(540, 412), ty.pt(580, 412), ty.pt(580, 470)], fill=INKC, width=round(3.5 * ty.zoom), joint="curve")
save_png("rt_van", van_img.crop(vb), van_a[vb[1]:vb[3], vb[0]:vb[2]])
ty.place("rt_van", vb[0], vb[1])

# The empty picture: rebuild sky, hill and road behind the van and tyre
hole = np.maximum(grow(van_a, 15), grow(np.maximum(tyre_a, disc), 15))
HILL = [(334, 352), (480, 412), (540, 452), (578, 520), (600, 546), (334, 546)]
hill = polygon_mask(ty.img.size, [ty.pt(x, y) for x, y in HILL], 1.5)[..., None] / 255
ground = (yy > ty.pt(0, 547)[1]).astype(np.float32)[..., None]
sky_t = quilt_from(ty, (440, 306, 560, 392), True, 24)
hill_t = quilt_from(ty, (342, 380, 368, 540), False, 20)
road_t = quilt_from(ty, (345, 607, 630, 631), False, 20)
scene = sky_t * (1 - hill) + hill_t * hill
scene = scene * (1 - ground) + road_t * ground
scene = Image.fromarray(np.clip(scene, 0, 255).astype(np.uint8))
pen = ImageDraw.Draw(scene)
pen.line([ty.pt(*q) for q in HILL[:5]], fill=INKC, width=round(3 * ty.zoom), joint="curve")
pen.line([ty.pt(334, 546), ty.pt(640, 550)], fill=INKC, width=round(3 * ty.zoom))
soft = np.asarray(Image.fromarray(hole.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), np.float32)[..., None] / 255
blank = Image.fromarray(np.clip(ty.rgb * (1 - soft) + np.asarray(scene, np.float32) * soft, 0, 255).astype(np.uint8))
blank.save(OUT / "rt_blank.jpg", quality=90)
ty.place("rt_blank", 0, 0)
layout["rt_blank"]["w"], layout["rt_blank"]["h"] = blank.size
print("rt_blank.jpg", blank.size)

# The words under it, with their arrow
wd = Picture("17_3.jpg", 0, (466, 643, 978, 697), W - 300, 120, at_y=H - 150)
wd.words("rt_words", (466, 643, 978, 697), INKC)

# =====================================================================
#  PANEL 4: "It'll come off in the wash!" (IMG-039, the right-hand picture)
# =====================================================================
wash = Picture("17_3.jpg", 0, (637, 312, 988, 646), W - 120, H - 80)
wash.save_on_paper("rt_wash")

# =====================================================================
#  PANEL 5: "Drive on the RIGHT, Enda" (IMG-041, master 17_5.jpg, and
#  IMG-042, master 17_6.jpg)
# =====================================================================
# The top row of IMG-041 is the three front seats. We cut each seat (and
# its potato) out so they can bop about, and the middle one twice: once
# smiling (top row), once worried (bottom row - exactly 330 lower on the
# page, so we cut that row with the same box moved down by 330).
SEATS = Picture("17_5.jpg", 0, (150, 0, 852, 420), W, H)
WORRIED = Picture("17_5.jpg", 0, (150, 330, 852, 750), W, H)
SEAT_L = [(195, 382), (195, 300), (210, 240), (250, 208), (300, 199), (345, 213), (380, 248),
          (392, 300), (390, 388)]
SEAT_M = [(385, 388), (388, 300), (405, 250), (445, 221), (490, 213), (540, 224), (575, 260),
          (588, 320), (585, 398)]
SEAT_R = [(575, 398), (578, 300), (595, 240), (635, 204), (680, 191), (730, 204), (765, 244),
          (778, 310), (776, 404)]

def cut_seat(pic, name, outline):
    """a seat and its potato, cut along a traced outline"""
    xs, ys = [x for x, _ in outline], [y for _, y in outline]
    b = pic.pbox((min(xs) - 2, min(ys) - 2, max(xs) + 2, max(ys) + 2))
    a = polygon_mask(pic.img.size, [pic.pt(x, y) for x, y in outline], 1.0)
    save_png(name, pic.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
    pic.place(name, b[0], b[1])
    pic.hole = np.maximum(pic.hole, a)

cut_seat(SEATS, "ds_left", SEAT_L)
cut_seat(SEATS, "ds_mid", SEAT_M)
cut_seat(SEATS, "ds_right", SEAT_R)
cut_seat(WORRIED, "ds_mid2", [(x, y + 330) for x, y in SEAT_M])
SEATS.words("ds_say1", (440, 4, 760, 175), INKC)                  # "Drive on the RIGHT, Enda" (calm)
WORRIED.words("ds_say2", (478, 418, 852, 535), INKC)              # ...and again (worried)
# (that box also caught the top of the next seat: rub out its bottom-right)
im = Image.open(OUT / "ds_say2.png")
al = np.asarray(im.getchannel("A")).copy()
bx = WORRIED.pbox((478, 418, 852, 535))
cx, cy = WORRIED.pt(562, 512)
al[cy - bx[1]:, cx - bx[0]:] = 0
im.putalpha(Image.fromarray(al)); im.save(OUT / "ds_say2.png")
# where the middle potato's face is (to zoom in on), and Enda's steering wheel
layout["ds_face"] = [SEATS.pt(488, 330)[0] + SEATS.x, SEATS.pt(488, 330)[1] + SEATS.y]
layout["ds_wheel"] = [SEATS.pt(668, 418)[0] + SEATS.x, SEATS.pt(668, 418)[1] + SEATS.y,
                      round(46 * SEATS.zoom)]
layout["ds_floor"] = SEATS.pt(0, 402)[1] + SEATS.y
# the empty van: patch over the seats and words with plain paper
# the empty van: all plain paper (patches of the blank page), with the
# line along the bottom where the seats sit
empty = quilt_from(SEATS, (160, 110, 440, 185), False, 40)
empty = Image.fromarray(np.clip(empty, 0, 255).astype(np.uint8))
ImageDraw.Draw(empty).line([SEATS.pt(150, 380), SEATS.pt(810, 406)], fill=INKC, width=round(2.5 * SEATS.zoom))
SEATS.save_on_paper("ds_blank", empty)

# IMG-042: the scream, the whole picture
scream = Picture("17_6.jpg", 0, (78, 88, 898, 690), W - 60, H - 40)
scream.save_on_paper("ds_scream")

# =====================================================================
#  PANEL 6: the roundabout (IMG-043, master 17_7.jpg, left-hand picture)
#  and worried Enda (IMG-045, master 17_9.jpg)
# =====================================================================
TOPW = 130                                       # room at the top for the words
rb = Picture("17_7.jpg", 0, (20, 212, 500, 700), 610, H - TOPW - 30, at_x=20, at_y=TOPW + 10)
# the middle of the roundabout (the trees) and the two lanes' sizes
layout["rb_centre"] = [rb.pt(247, 450)[0] + rb.x, rb.pt(247, 450)[1] + rb.y]
layout["rb_zoom"] = rb.zoom
CARS = {  # name: (box, colour) - every car is cut along its box's outline
    "rb_pink":  (243, 302, 310, 374),
    "rb_blue2": (306, 378, 368, 448),
    "rb_red2":  (304, 450, 370, 530),
    "rb_blue3": (232, 516, 302, 574),
    "rb_blue1": (56, 322, 128, 388),
    "rb_red1":  (42, 406, 112, 472),
}
for name, box in CARS.items():
    x0, y0, x1, y1 = box
    rb.solid(name, box, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)])
rb.words("rb_oops", (250, 262, 438, 326), INKC)                   # "Oops, that silly first gear..."
rb.words("rb_honk1", (346, 362, 428, 428), INKC)
rb.words("rb_honk2", (350, 490, 394, 562), INKC)
rb.words("rb_honk3", (212, 572, 298, 652), INKC)
for box in [(62, 382, 92, 392), (66, 476, 80, 504)]:             # the little arrows by the cars
    rb.words("rb_junk", box)
# The empty roundabout. A roundabout is the same all the way round, so we
# fill each hole with the AVERAGE colour of the road at that distance from
# the middle (worked out from everywhere that isn't a hole), plus a bit of
# pencil texture so it doesn't look flat.
fill_me = grow(rb.hole, 13) > 20
for name, (x0, y0, x1, y1) in CARS.items():
    c = rb.pbox((x0 - 8, y0 - 8, x1 + 8, y1 + 8))
    fill_me[c[1]:c[3], c[0]:c[2]] = True
for box in [(246, 258, 442, 330), (342, 358, 432, 432), (346, 486, 398, 566), (208, 568, 302, 656)]:
    c = rb.pbox(box)                                          # the white patches behind the words
    fill_me[c[1]:c[3], c[0]:c[2]] = True
cx, cy = rb.pt(247, 450)
yy, xx = np.mgrid[0:rb.img.height, 0:rb.img.width]
dist = np.hypot(xx - cx, yy - cy).astype(int)                # how far each pixel is from the middle
profile = np.zeros((dist.max() + 1, 3), np.float32)
for r in range(dist.max() + 1):
    ring = (np.abs(dist - r) <= 3) & ~fill_me & (rb.ink < 60)
    if ring.sum() > 20:
        profile[r] = np.median(rb.rgb[ring], axis=0)
    else:
        profile[r] = profile[r - 1]
smooth_road = profile[dist]
tex = quilt_from(rb, (120, 560, 190, 640), False, 20)
tex_soft = np.asarray(Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)), np.float32)
out_rgb = smooth_road + (tex - tex_soft)
soft = np.asarray(Image.fromarray((fill_me * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)),
                  np.float32)[..., None] / 255
empty = Image.fromarray(np.clip(rb.rgb * (1 - soft) + out_rgb * soft, 0, 255).astype(np.uint8))
empty.save(OUT / "rb_blank.jpg", quality=90)
rb.place("rb_blank", 0, 0)
print("rb_blank.jpg", empty.size)

# the words above, with their arrow (pointing left, at the roundabout)
st = Picture("17_7.jpg", 0, (505, 158, 960, 252), W - 400, TOPW - 20, at_y=8)
st.words("rb_stalled", (505, 158, 960, 252), INKC)

# ---- worried Enda (IMG-045) ----
we = Picture("17_9.jpg", 90, (8, 165, 748, 880), 610, H - TOPW - 30, at_x=650, at_y=TOPW + 10)
we.words("we_lines", (262, 186, 452, 220))                       # the worry lines on his forehead
we.words("we_brow_l", (224, 248, 258, 298))
we.words("we_brow_r", (494, 264, 536, 306))
we.words("we_sweat_l", (92, 370, 136, 496))
we.words("we_sweat_r", (628, 438, 692, 506))
calm = mend(we, grow(we.hole, 9), (300, 470, 440, 540), 16)       # (patched with his face)
we.rgb = np.asarray(calm, np.float32)
# the steering wheel: a disc that can turn (it covers the same space as it turns)
WC, WR = (372, 734), 170
disc = polygon_mask(we.img.size, [we.pt(WC[0] + WR * np.cos(t), WC[1] + WR * np.sin(t))
                                  for t in np.linspace(0, 2 * np.pi, 60)], 1.0)
b = we.pbox((WC[0] - WR, WC[1] - WR, WC[0] + WR, WC[1] + WR))
save_png("we_wheel", calm.crop(b), disc[b[1]:b[3], b[0]:b[2]])
we.place("we_wheel", b[0], b[1])
calm.save(OUT / "we_enda.jpg", quality=90)
we.place("we_enda", 0, 0)
layout["we_enda"]["w"], layout["we_enda"]["h"] = calm.size
print("we_enda.jpg", calm.size)

# =====================================================================
#  PANEL 7: THE NAVIGATION AWARD and THE WRONG ROAD
#  (IMG-046 award, IMG-047 the potatoes chatting, IMG-048 the roads,
#   IMG-049 "Yeah, we do", IMG-050 the laughing van - masters 18_1..18_5)
# =====================================================================
# Where things go on the screen:
#   the award: first big in the middle, then shrunk into the top RIGHT
#   the van interior (the potatoes): the top LEFT box below
#   the roads / the laughing van: the bottom half
TOP = (20, 12, 560, 420)          # x, y, width, height of the top-left panel
LOW = (0, 452, W, 440)            # the bottom panel's space

# ---- the award (IMG-046) ----
# The close-up photo (18_1) is very blurry, so we take the same words from
# the sharper copy on the next page (18_2) and print them on a fresh card.
aw = Picture("18_2.jpg", 0, (596, 122, 975, 322), W - 260, H - 320)
aw.words("nv_award", (596, 122, 975, 322), INKC, floor=30)

def plain_paper(pic):
    """The picture with ALL its drawing rubbed out: just the paper, with
    its gentle light and shade (smudged in from the clean bits of paper)
    and a little grain."""
    good = (np.asarray(Image.fromarray((pic.ink > 18).astype(np.uint8) * 255)
                       .filter(ImageFilter.MaxFilter(7))) < 10).astype(np.float32)
    paper = fill_holes(pic.rgb, good)
    paper = np.asarray(Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8))
                       .filter(ImageFilter.GaussianBlur(12)), np.float32)
    return paper + rng.normal(0, 2.5, paper.shape[:2])[..., None]

def panel_of_potatoes(master, box, seats, floor_line, blank_name):
    """One version of the van interior: cut out each seat (with its potato)
    so it can bop, and make a plain-paper panel to sit them on (with the
    line of the van floor drawn back in)."""
    pic = Picture(master, 0, box, TOP[2], TOP[3], at_x=TOP[0], at_y=TOP[1])
    for name, outline in seats.items():
        cut_seat(pic, name, outline)
    empty = plain_paper(pic)
    empty = Image.fromarray(np.clip(empty, 0, 255).astype(np.uint8))
    ImageDraw.Draw(empty).line([pic.pt(*floor_line[0]), pic.pt(*floor_line[1])], fill=INKC,
                               width=round(2.5 * pic.zoom))
    empty.save(OUT / (blank_name + ".jpg"), quality=90)
    pic.place(blank_name, 0, 0)
    layout[blank_name]["w"], layout[blank_name]["h"] = empty.size
    print(blank_name + ".jpg", empty.size)
    return pic

def mouth(pic, name, box):
    """A little patch of face round a mouth, with soft round edges. The show
    stretches it up and down to make the mouth 'talk'."""
    b = pic.pbox(box)
    w, h = b[2] - b[0], b[3] - b[1]
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).ellipse((1, 1, w - 2, h - 2), fill=255)
    save_png(name, pic.img.crop(b), np.asarray(m.filter(ImageFilter.GaussianBlur(1.5)), np.float32))
    pic.place(name, b[0], b[1])

def wheel(pic, name, centre, r, floor_y):
    """Enda's little steering wheel: a disc that can turn (only the part
    above the floor line)."""
    b = pic.pbox((centre[0] - r, centre[1] - r, centre[0] + r, floor_y))
    disc = Image.new("L", pic.img.size, 0)
    (cx, cy), rr = pic.pt(*centre), round(r * pic.zoom)
    ImageDraw.Draw(disc).ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=255)
    save_png(name, pic.img.crop(b), np.asarray(disc, np.float32)[b[1]:b[3], b[0]:b[2]])
    pic.place(name, b[0], b[1])
    layout[name]["cx"], layout[name]["cy"] = cx + pic.x, cy + pic.y   # the middle, to turn round

# ---- 1st version (IMG-047, left): "I think we need to go down that lane"
p1 = panel_of_potatoes("18_2.jpg", (0, 135, 565, 505), {
    "nv_rear1": [(0, 175), (25, 155), (65, 147), (100, 157), (120, 185), (128, 230), (126, 290),
                 (120, 340), (0, 350)],
    "nv_left1": [(0, 352), (45, 342), (85, 348), (108, 365), (122, 400), (131, 450), (133, 492), (0, 488)],
    "nv_mid1": [(134, 494), (136, 410), (148, 370), (175, 342), (215, 330), (255, 338), (282, 360),
                (296, 395), (300, 497)],
    "nv_enda1": [(298, 499), (300, 380), (314, 342), (345, 318), (385, 308), (428, 320), (455, 355),
                 (466, 420), (468, 502)],
}, [(0, 488), (480, 501)], "nv_van1")
mouth(p1, "nv_mouth_rear1", (34, 232, 56, 256))         # the little round "o"
mouth(p1, "nv_mouth_mid1", (200, 425, 252, 466))         # her wobbly mouth
wheel(p1, "nv_wheel1", (377, 481), 21, 492)
p1.words("nv_say1", (128, 143, 505, 208), INKC)          # "I think we need to go down that lane"
p1.words("nv_say2", (178, 222, 562, 322), INKC)          # "Do we? I don't know"
# (that box also caught the top of Enda's seat: rub out its bottom right)
im = Image.open(OUT / "nv_say2.png")
al = np.asarray(im.getchannel("A")).copy()
bx, (cx, cy) = p1.pbox((178, 222, 562, 322)), p1.pt(300, 298)
al[cy - bx[1]:, cx - bx[0]:] = 0
im.putalpha(Image.fromarray(al)); im.save(OUT / "nv_say2.png")

# ---- 2nd version (IMG-047, right): "I think we do" / "Hold on"
p2 = panel_of_potatoes("18_2.jpg", (495, 345, 988, 712), {
    "nv_rear2": [(505, 470), (510, 410), (528, 375), (560, 352), (600, 345), (640, 355), (665, 380),
                 (676, 425), (678, 480), (672, 540), (505, 548)],
    "nv_left2": [(500, 705), (503, 610), (517, 570), (548, 545), (592, 535), (640, 540), (672, 560),
                 (690, 600), (697, 703)],
    "nv_mid2": [(697, 703), (700, 590), (712, 560), (745, 543), (790, 540), (825, 553), (840, 590),
                (842, 701)],
    "nv_enda2": [(840, 701), (842, 590), (856, 555), (890, 536), (935, 535), (965, 560), (980, 610),
                 (982, 698)],
}, [(497, 706), (985, 694)], "nv_van2")
mouth(p2, "nv_mouth_rear2", (586, 448, 610, 480))        # the "o", shocked
mouth(p2, "nv_mouth_mid2", (748, 628, 797, 662))         # her mouth, above her hand
wheel(p2, "nv_wheel2", (887, 668), 20, 692)
p2.words("nv_say3", (676, 355, 940, 418), INKC)          # "I think we do"
p2.words("nv_say4", (712, 465, 852, 538), INKC)          # "Hold on"

# ---- 3rd version (IMG-049): "Yeah, we do"
p3 = panel_of_potatoes("18_4.jpg", (150, 240, 868, 705), {
    "nv_rear3": [(165, 520), (165, 380), (175, 320), (200, 282), (240, 256), (290, 247), (340, 262),
                 (372, 292), (390, 330), (398, 380), (396, 440), (388, 490), (170, 500)],
    "nv_left3": [(168, 700), (170, 560), (192, 515), (238, 488), (290, 480), (340, 490), (380, 515),
                 (402, 560), (410, 620), (412, 698)],
    "nv_mid3": [(425, 694), (428, 570), (446, 520), (488, 495), (530, 490), (575, 498), (606, 528),
                (624, 575), (630, 690)],
    "nv_enda3": [(628, 690), (632, 570), (645, 515), (678, 480), (722, 462), (772, 467), (810, 500),
                 (828, 560), (834, 688)],
}, [(155, 700), (865, 682)], "nv_van3")
mouth(p3, "nv_mouth_mid3", (497, 606, 560, 640))         # her big smile
wheel(p3, "nv_wheel3", (707, 668), 22, 686)
p3.words("nv_say5", (520, 355, 775, 462), INKC)          # "Yeah, we do"

# ---- the roads (IMG-048, master 18_3) ----
# The pink van is cut out (it drives through), and so are its speed lines.
# Behind it the road is rebuilt from road texture. The bottom right corner
# of this crop has the NEXT picture in it, so that's covered with road too.
road = Picture("18_3.jpg", 0, (120, 315, 870, 740), LOW[2], LOW[3], at_y=LOW[1])
road.solid("nv_pink", (190, 528, 470, 696),
           [(190, 532), (464, 528), (470, 656), (458, 694), (376, 696), (372, 668), (338, 668),
            (334, 696), (224, 696), (218, 664), (188, 656)])
road.words("nv_speed", (466, 612, 610, 646), INKC)        # the speed lines behind it
hole = grow(road.hole, 11)
c = road.pbox((512, 668, 870, 740))                       # (the next picture's corner)
hole[c[1]:c[3], c[0]:c[2]] = 255
fixed = mend(road, hole, (620, 515, 850, 610), 24)
ImageDraw.Draw(fixed).line([road.pt(505, 724), road.pt(870, 721)], fill=INKC, width=round(2.5 * road.zoom))
fixed.save(OUT / "nv_road.jpg", quality=90)
road.place("nv_road", 0, 0)
layout["nv_road"]["w"], layout["nv_road"]["h"] = fixed.size
print("nv_road.jpg", fixed.size)
# the fire (it flickers) - just its colours and outline, cut along a rough outline
fire = road.pbox((296, 400, 436, 494))
f_rgb = road.rgb[fire[1]:fire[3], fire[0]:fire[2]]
warm = (f_rgb[..., 0] - f_rgb[..., 2] > 70) & (f_rgb[..., 0] > 150)           # orange and yellow
f_ink = road.ink[fire[1]:fire[3], fire[0]:fire[2]]
f_a = np.maximum(warm * 255.0, f_ink)
f_a = np.minimum(f_a, polygon_mask(road.img.size, [road.pt(x, y) for x, y in
                 [(300, 490), (305, 440), (318, 408), (345, 418), (362, 395), (382, 420), (415, 425),
                  (420, 450), (436, 465), (420, 492)]], 1.0)[fire[1]:fire[3], fire[0]:fire[2]])
save_png("nv_fire", road.img.crop(fire), f_a)
road.place("nv_fire", fire[0], fire[1])
# the skull and crossbones sign (to zoom in on)
layout["nv_skull"] = [road.pt(195, 410)[0] + road.x, road.pt(195, 410)[1] + road.y]

# ---- the laughing van (IMG-050, master 18_5) ----
ha = Picture("18_5.jpg", 0, (120, 370, 870, 712), LOW[2], LOW[3], at_y=LOW[1])
VAN_HA = [(285, 430), (670, 426), (694, 604), (632, 606), (630, 646), (590, 656), (550, 650),
          (540, 612), (440, 618), (440, 650), (410, 664), (366, 662), (342, 640), (344, 622), (286, 628)]
ha.solid("nv_hahavan", (282, 422, 698, 668), VAN_HA)
ha.words("nv_haspeed", (700, 570, 862, 604), INKC)
# all the "HA"s: every bit of ink above the road that isn't the van
b = ha.pbox((122, 372, 850, 600))
van_mask = grow(polygon_mask(ha.img.size, [ha.pt(x, y) for x, y in VAN_HA], 1.0), 9)
a = ha.ink.copy()
a = np.where(van_mask > 20, 0, a)
s = ha.pbox((700, 566, 870, 610)); a[s[1]:s[3], s[0]:s[2]] = 0    # (not the speed lines)
save_png("nv_ha", Image.new("RGB", (b[2] - b[0], b[3] - b[1]), INKC), a[b[1]:b[3], b[0]:b[2]])
ha.place("nv_ha", b[0], b[1])
# Behind them: plain paper everywhere above the road line (the line and
# the grey shading under it stay as they are)
above = polygon_mask(ha.img.size, [ha.pt(x, y) for x, y in
        [(122, 372), (848, 372), (866, 640), (815, 646), (700, 645), (620, 645), (520, 650),
         (430, 662), (300, 670), (160, 684), (122, 686)]], 2.0)[..., None] / 255
fixed = Image.fromarray(np.clip(ha.rgb * (1 - above) + plain_paper(ha) * above, 0, 255).astype(np.uint8))
fixed.save(OUT / "nv_laugh.jpg", quality=90)
ha.place("nv_laugh", 0, 0)
layout["nv_laugh"]["w"], layout["nv_laugh"]["h"] = fixed.size
print("nv_laugh.jpg", fixed.size)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT9 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

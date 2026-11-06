"""
prepare_pictures.py  -  cut the pictures for EPISODE 9 "Drive on your other Right!"

  PANEL 1  "One hour later"          IMG-037 (master 17_1.jpg)
  PANEL 2  "French number plates"    IMG-038 (master 17_2.jpg), clipped neatly
                                     to its panel, for the pop-up
  PANEL 3  "Random tyre"             IMG-039 (master 17_3.jpg), the middle
                                     picture: the van, the tyre, the scuff, and
                                     the words "Random tyre hitting the car"

Makes, in ../assets/:
  rt_later.jpg      "One hour later" with the balloons and trophy
  rt_plates.png     the French number plates picture (for the pop-up)
  rt_blank.jpg      the tyre picture with NO van and NO tyre (rebuilt behind)
  rt_van.png        the van
  rt_tyre.png       the tyre with its speed lines (coming in)
  rt_lump.png       just the lump of tyre (bouncing off)
  rt_scuff.png      the scuff mark it leaves on the van
  rt_words.png      the arrow and "Random tyre hitting the car"
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

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT9 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

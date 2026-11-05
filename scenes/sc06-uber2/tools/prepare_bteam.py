"""
prepare_bteam.py  -  cut the pictures for EPISODE 6's second half: "the B team"

  PAGE 12 uses IMG-020 (the whole page, master 12.jpg): Rhianna's Uber
  LIFT    uses IMG-023 (master 13_1.jpg), the top-left mini panel:
          the car hire's waiting room with the lift  (made by the
          second half of this file)

Boxes are measured on the working copies (working/IMG-0xx.jpg, 1000 px
on the long side), like the other episodes.

Makes, in ../assets/:
  bt_page.jpg          page 12 with every panel EMPTY and no words
  bt_top.png           the top cartoon (Rhianna + the driver), no words
  bt_midleft.png       Rhianna thinking, no "..."
  bt_midright.png      Rhianna deciding, no "ye, go on"
  bt_bottom.png        le car hire, with NO Uber and no "wait, STOP!"
  bt_words.png         the paragraph at the bottom of the page
  bt_r_says.png        "car hire, here we come!"
  bt_d_says.png        "Hey Madam... want to go to the train station?"
  bt_dot1..3.png       the three thinking dots
  bt_yegoon.png        "ye, go on"
  bt_stop.png          "wait, STOP!"
  bt_uber.png          Rhianna's Uber
  bt_zoom.png          the Uber's speed lines

  lf_room.jpg          the lift's waiting room, EMPTY
  lf_sign.png, lf_painting.png, lf_clock.png (no hands), lf_lift.png (empty)
  lf_brb.png           "Be right back"
  lf_pot1..6.png       the six potatoes (5 and 6 are Enda and Annelisa)

And layout_bteam.js (window.LAYOUT6B): where everything goes, in screen
pixels. (Its own file, so this script and prepare_pictures.py don't
overwrite each other's work.)

Run:   python3 tools/prepare_bteam.py     then   python3 make_offline.py
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
    return np.asarray(m.filter(ImageFilter.GaussianBlur(blur)), np.float32)


# =====================================================================
#  PAGE 12 (IMG-020): the whole page, fitted to the screen's HEIGHT
# =====================================================================
# The page is tall and thin, so it sits in the middle of the screen with
# the book's yellow paper either side of it.
master, s20 = open_master("12.jpg")
PAGEBOX = (80, 0, 725, 995)                       # working-copy box of the page
page = master.crop(tuple(round(v * s20) for v in PAGEBOX))
k = H / page.height
page = page.resize((round(page.width * k), H), Image.LANCZOS)
PAGE_X = (W - page.width) // 2                    # where the page's left edge sits

def pp(x, y):
    """Working-copy point on IMG-020 -> pixel on the PAGE picture."""
    return round((x - PAGEBOX[0]) * s20 * k), round((y - PAGEBOX[1]) * s20 * k)
def pbox(box):
    (a, b), (c, d) = pp(*box[:2]), pp(*box[2:])
    return max(a, 0), max(b, 0), min(c, page.width), min(d, H)
def on_screen(x, y):
    """Pixel on the page picture -> pixel on the screen."""
    return {"x": x + PAGE_X, "y": y}

prgb = np.asarray(page, np.float32)
pink = ink_strength(page)
hole = np.zeros(pink.shape, np.float32)            # everything to rub out

def words(name, box, colour=None, not_inside=None):
    """Lift some hand-written words off the page (just the ink).
    not_inside: an oval (centre x, centre y, half-width, half-height) to
    leave out, for words drawn right next to someone's head."""
    b = pbox(box)
    a = pink[b[1]:b[3], b[0]:b[2]].copy()
    if not_inside:
        cx, cy, rx, ry = not_inside
        (x0, y0), (x1, y1) = pp(cx - rx, cy - ry), pp(cx + rx, cy + ry)
        head = Image.new("L", page.size, 0)
        ImageDraw.Draw(head).ellipse((x0, y0, x1, y1), fill=255)
        a[np.asarray(head)[b[1]:b[3], b[0]:b[2]] > 0] = 0
    rgb = page.crop(b) if colour is None else Image.new("RGB", (b[2] - b[0], b[3] - b[1]), colour)
    save_png(name, rgb, a)
    layout[name] = on_screen(b[0], b[1])
    hole[b[1]:b[3], b[0]:b[2]] = np.maximum(hole[b[1]:b[3], b[0]:b[2]], a)

words("bt_r_says", (147, 70, 228, 140), not_inside=(249, 152, 49, 69))     # (not her head)
words("bt_d_says", (436, 76, 547, 166), not_inside=(556, 101, 44, 36))     # (not his head)
words("bt_yegoon", (604, 373, 653, 453))
words("bt_stop", (440, 638, 530, 702))
words("bt_words", (92, 849, 724, 994), colour=(28, 26, 24))     # printed, so even black
# The thinking dots, one picture each so they can appear one at a time
for i, (x0, x1) in enumerate([(127, 139), (139, 151), (151, 166)]):
    words("bt_dot%d" % (i + 1), (x0, 438, x1, 458))

# Rhianna's Uber: everything inside its outline (fill_inside), but only
# inside a rough hand-drawn shape, so the hills' lines that touch it
# don't come too.
CAR = [(455, 702), (613, 699), (613, 790), (602, 800), (462, 800), (455, 790)]
cb = pbox((449, 693, 619, 806))
carmask = polygon_mask(page.size, [pp(x, y) for x, y in CAR], 1.5)
solid = np.zeros_like(pink)
solid[cb[1]:cb[3], cb[0]:cb[2]] = fill_inside(pink, cb)
car_a = np.minimum(solid, carmask)
save_png("bt_uber", page.crop(cb), car_a[cb[1]:cb[3], cb[0]:cb[2]])
layout["bt_uber"] = on_screen(cb[0], cb[1])
hole = np.maximum(hole, grow(car_a, 9))

# The speed lines behind it
zb = pbox((376, 701, 456, 790))
save_png("bt_zoom", page.crop(zb), pink[zb[1]:zb[3], zb[0]:zb[2]])
layout["bt_zoom"] = on_screen(zb[0], zb[1])
hole[zb[1]:zb[3], zb[0]:zb[2]] = np.maximum(hole[zb[1]:zb[3], zb[0]:zb[2]], pink[zb[1]:zb[3], zb[0]:zb[2]])

# A clean page: all of that rubbed out, filled from the colours around it.
# Don't rub out other ink that just happens to be near the words (like
# Rhianna's head): only the words' own ink, made a little fatter.
other_ink = (pink > 40) & (hole < 10)
hole = (grow(hole, 7) > 10) & ~other_ink
good = ~hole & (pink < 25)                 # fill only from plain colour, not from lines

# Where the Uber was, the picture is half green sky, half yellow hills.
# Fill each part only from its own colour, so they don't smudge together.
SKY = [(376, 600), (432, 675), (508, 717), (553, 692), (668, 600)]
BOTTOM_PANEL = [(130, 561), (668, 549), (668, 821), (130, 835)]
sky = polygon_mask(page.size, [pp(x, y) for x, y in SKY], 0) > 127
in_bottom = polygon_mask(page.size, [pp(x, y) for x, y in BOTTOM_PANEL], 0) > 127
fill_other = fill_holes(prgb, good.astype(np.float32))
fill_sky = fill_holes(prgb, (good & sky & in_bottom).astype(np.float32))
fill_ground = fill_holes(prgb, (good & ~sky & in_bottom).astype(np.float32))
fill = np.where((in_bottom & sky)[..., None], fill_sky,
                np.where(in_bottom[..., None], fill_ground, fill_other))
fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32)
fill = fill + np.random.default_rng(7).normal(0, 3, fill.shape[:2])[..., None]   # paper grain
soft = np.asarray(Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)),
                  np.float32)[..., None] / 255
clean_img = Image.fromarray(np.clip(prgb * (1 - soft) + fill * soft, 0, 255).astype(np.uint8))

# The Uber was hiding where the two hills meet. Draw those lines in, as
# the hills would carry on behind it (and the bottom edge of the hills).
pen = ImageDraw.Draw(clean_img)
for line in [[(430, 674), (508, 717), (553, 692)], [(438, 787), (616, 761)]]:
    pen.line([pp(x, y) for x, y in line], fill=(38, 36, 32), width=4, joint="curve")
clean = np.asarray(clean_img, np.float32)

# The four cartoon panels: the inside of each frame (just inside the
# black frame lines, so the frames stay on the empty page)
PANELS = {
    "bt_top":      [(127, 0), (661, 0), (661, 283), (127, 287)],
    "bt_midleft":  [(129, 306), (384, 304), (390, 550), (131, 554)],
    "bt_midright": [(401, 305), (659, 302), (659, 543), (406, 550)],
    "bt_bottom":   [(130, 561), (668, 549), (668, 821), (130, 835)],
}
empty = clean.copy()
for name, poly in PANELS.items():
    pts = [pp(x, y) for x, y in poly]
    m = polygon_mask(page.size, pts, 1.0)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    b = (max(min(xs) - 2, 0), max(min(ys) - 2, 0), min(max(xs) + 2, page.width), min(max(ys) + 2, H))
    save_png(name, clean_img.crop(b), m[b[1]:b[3], b[0]:b[2]])
    layout[name] = on_screen(b[0], b[1])
    # On the empty page, paint the panel with plain white paper
    empty = empty * (1 - m[..., None] / 255) + np.array([238, 235, 242], np.float32) * (m[..., None] / 255)

# The empty page, on the book's yellow paper the width of the screen
blank = Image.new("RGB", (W, H), PAPER)
blank.paste(feather(Image.fromarray(np.clip(empty, 0, 255).astype(np.uint8)), PAPER, 24), (PAGE_X, 0))
blank.save(OUT / "bt_page.jpg", quality=88)
print("bt_page.jpg", blank.size)

# =====================================================================
#  THE LIFT (IMG-023, top-left mini panel): the car hire's waiting room
# =====================================================================
# The panel is fitted to the screen's height, with yellow paper either
# side. Everything is cut out, then rubbed out, so the room starts EMPTY:
# just the walls, the lift shaft's dashed lines and the floor.
lmaster, s23 = open_master("13_1.jpg")
LIFTBOX = (72, 14, 676, 470)
room = lmaster.crop(tuple(round(v * s23) for v in LIFTBOX))
k2 = H / room.height
room = room.resize((round(room.width * k2), H), Image.LANCZOS)
ROOM_X = (W - room.width) // 2

def rp(x, y):
    """Working-copy point on IMG-023 -> pixel on the ROOM picture."""
    return round((x - LIFTBOX[0]) * s23 * k2), round((y - LIFTBOX[1]) * s23 * k2)
def rbox(box):
    (a, b), (c, d) = rp(*box[:2]), rp(*box[2:])
    return max(a, 0), max(b, 0), min(c, room.width), min(d, H)
def room_screen(x, y):
    return {"x": x + ROOM_X, "y": y}

rrgb = np.asarray(room, np.float32)
rink = ink_strength(room)
rhole = np.zeros(rink.shape, np.float32)

def cut_shape(name, corners, grow_by=9):
    """A sprite cut out along a hand-traced outline (a sign, a picture...)."""
    pts = [rp(x, y) for x, y in corners]
    m = grow(polygon_mask(room.size, pts, 0), grow_by)
    m = np.asarray(Image.fromarray(m.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32)
    ys, xs = np.nonzero(m > 5)
    b = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    save_png(name, room.crop(b), m[b[1]:b[3], b[0]:b[2]])
    layout[name] = room_screen(b[0], b[1])
    global rhole
    rhole = np.maximum(rhole, m)
    return b

cut_shape("lf_sign", [(229, 42), (422, 21), (420, 110), (224, 122)])
cut_shape("lf_painting", [(174, 157), (344, 135), (336, 240), (180, 254)])
# The lift: just its frame and its "lift" sign. Its inside is made
# see-through (in the drawing it held Enda, Annelisa and a grey smudge),
# so the wall shows through when it's empty.
lb = cut_shape("lf_lift", [(499, 255), (640, 253), (642, 441), (497, 443)], grow_by=11)
lift_png = Image.open(OUT / "lf_lift.png")
la = np.asarray(lift_png.getchannel("A"), np.float32).copy()
(x0, y0), (x1, y1) = rp(511, 289), rp(627, 436)
hollow = Image.new("L", room.size, 0)
ImageDraw.Draw(hollow).rectangle((x0, y0, x1, y1), fill=255)
hollow = np.asarray(hollow.filter(ImageFilter.GaussianBlur(2)), np.float32)[lb[1]:lb[3], lb[0]:lb[2]]
lift_png.putalpha(Image.fromarray(np.clip(la - hollow, 0, 255).astype(np.uint8)))
lift_png.save(OUT / "lf_lift.png")

# The clock: just its round face. Its hands are rubbed out; main.js
# draws new hands, so they can go round.
cx, cy = rp(125, 167)
r = rp(125 + 29, 167)[0] - cx                       # radius, to the outside of the ring
yy, xx = np.mgrid[0:H, 0:room.width]
dist = np.hypot(xx - cx, yy - cy)
face_a = np.clip((r + 2 - dist) * 120, 0, 255)       # the whole disc
inner = dist < r * 0.72                               # inside the ring = where the hands are
crgb = rrgb.copy()
crgb[inner] = np.median(rrgb[(dist > r * 1.2) & (dist < r * 1.6)], axis=0)  # wall colour
cb = (cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3)
save_png("lf_clock", Image.fromarray(crgb.astype(np.uint8)).crop(cb), face_a[cb[1]:cb[3], cb[0]:cb[2]])
layout["lf_clock"] = room_screen(cb[0], cb[1])
layout["lf_clock_centre"] = [cx + ROOM_X, cy]
layout["lf_clock_radius"] = r
rhole = np.maximum(rhole, grow(face_a, 9))

# "Be right back": the words only (the grey smudge around it stays behind)
bb = rbox((347, 233, 494, 357))
brb = np.clip((rink[bb[1]:bb[3], bb[0]:bb[2]] - 50) * 2, 0, 255)
save_png("lf_brb", Image.new("RGB", (bb[2] - bb[0], bb[3] - bb[1]), (28, 26, 24)), brb)
layout["lf_brb"] = room_screen(bb[0], bb[1])
sb = rbox((345, 228, 499, 375))                       # words AND smudge, all rubbed out
rhole[sb[1]:sb[3], sb[0]:sb[2]] = 255

# The six potatoes: 1-4 wait on the floor, 5-6 (Enda and Annelisa) are
# in the lift in the drawing. Each one: outline + everything inside it.
POTS = [(98, 334, 162, 412), (78, 398, 125, 472), (200, 387, 250, 457),
        (290, 374, 350, 450), (503, 325, 573, 415), (577, 330, 628, 414)]
for i, box in enumerate(POTS, 1):
    b = rbox(box)
    a = np.zeros_like(rink)
    a[b[1]:b[3], b[0]:b[2]] = fill_inside(rink, b)
    if i == 5:   # Enda's head is under the grey smudge: keep only an oval
        (x0, y0), (x1, y1) = rp(box[0] + 2, box[1] + 6), rp(box[2] - 2, box[3])
        oval = Image.new("L", room.size, 0)
        ImageDraw.Draw(oval).ellipse((x0, y0, x1, y1), fill=255)
        a = np.minimum(a, np.asarray(oval.filter(ImageFilter.GaussianBlur(1.5)), np.float32))
        # and paint over the grey smudge (grey, but not as dark as his lines)
        pic = np.asarray(room.crop(b), np.float32).copy()
        ink_here = rink[b[1]:b[3], b[0]:b[2]]
        near_lines = grow((ink_here > 150) * 255.0, 7) > 0
        greyish = (ink_here > 15) & ~near_lines & (a[b[1]:b[3], b[0]:b[2]] > 200)
        pic[greyish] = (236, 233, 236)
        save_png("lf_pot5", Image.fromarray(pic.astype(np.uint8)), a[b[1]:b[3], b[0]:b[2]])
        layout["lf_pot5"] = room_screen(b[0], b[1])
        rhole = np.maximum(rhole, grow(a, 9))
        continue
    save_png("lf_pot%d" % i, room.crop(b), a[b[1]:b[3], b[0]:b[2]])
    layout["lf_pot%d" % i] = room_screen(b[0], b[1])
    rhole = np.maximum(rhole, grow(a, 9))

# The two posts of the NEXT mini panel's sign poke up at the bottom
for box in [(258, 452, 278, 470), (350, 452, 368, 470)]:
    b = rbox(box)
    rhole[b[1]:b[3], b[0]:b[2]] = 255

# The empty room: everything rubbed out, filled from the plain wall
rh = grow(rhole, 5) > 10
# ...but keep the floor line (it runs under everyone's feet)
fl = Image.new("L", room.size, 0)
ImageDraw.Draw(fl).line([rp(72, 478), rp(676, 436)], fill=255, width=round(14 * s23 * k2))
rh &= ~((np.asarray(fl) > 0) & (rink > 40))
good = (~rh & (rink < 25)).astype(np.float32)
rfill = fill_holes(rrgb, good)
rfill = np.asarray(Image.fromarray(np.clip(rfill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32)
rfill = rfill + np.random.default_rng(8).normal(0, 3, rfill.shape[:2])[..., None]
soft = np.asarray(Image.fromarray((rh * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)),
                  np.float32)[..., None] / 255
empty_room = Image.fromarray(np.clip(rrgb * (1 - soft) + rfill * soft, 0, 255).astype(np.uint8))
blank = Image.new("RGB", (W, H), PAPER)
blank.paste(feather(empty_room, PAPER, 20), (ROOM_X, 0))
blank.save(OUT / "lf_room.jpg", quality=88)
print("lf_room.jpg", blank.size)

(SCENE / "layout_bteam.js").write_text(
    "// Made by tools/prepare_bteam.py - do not edit by hand.\n"
    "window.LAYOUT6B = " + json.dumps(layout, indent=1) + ";\n")
print("layout_bteam.js written")

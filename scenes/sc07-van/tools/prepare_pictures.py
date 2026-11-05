"""
prepare_pictures.py  -  cut the pictures for EPISODE 7 "A Van, A Man & a Plan"

  PANEL 1  "At the wheel"        IMG-027 (master 13_5.jpg): Spud Enda, glasses on
  PANEL 2  "VROOOOM"             IMG-026 (master 13_4.jpg), bottom picture
  PANEL 3  "BAM"                 IMG-028 (master 14_1.jpg), top picture + its words
  PANEL 4  "FIVE MINUTES LATER"  IMG-028, the yellow panel + "Hoo boy..."
  PANEL 5  "Today's driving forecast"  IMG-029 (master 14_2.jpg)

Boxes are measured on the working copies (working/IMG-0xx.jpg, 1000 px
on the long side). The picture tools live in storybook/tools/picture_tricks.py.

Each picture is fitted into the screen (1280 x 900) and sits on the
book's yellow paper. The sprites are cut out of it, and rubbed out of
the background, so they can move.

Makes, in ../assets/:
  van_driver.jpg        Spud Enda at the wheel (the picture only)
  van_vroom_blank.jpg   the VROOOOM panel with NO van, words or "VROOOOM"
  van_van.png           the van (with its speed lines)
  van_vroom.png         "VROOOOM"
  van_herewego.png      "Here we go!"
  van_bam_blank.jpg     the BAM panel with NO van and no "BAM"
  van_bam_van.png       the crashed van
  van_bam.png           "BAM"
  van_crashed.png       "...and promptly crashed into the barrier of the car park!"
  van_five.png          the "FIVE MINUTES LATER" panel
  van_hooboy.png        "Hoo boy, these local drivers sure do have a bee in their bonnet!"
  van_forecast.jpg      "Today's driving forecast" (as drawn)
  fc_blank.jpg          the forecast with only its title
  fc_dial.png (no pointer), fc_face.png, fc_brows.png, fc_wheel.png,
  fc_cab.png (no arm), fc_arm.png, fc_tyre.png, fc_blue.png, fc_pink.png,
  fc_burnt.png          each drawing on the forecast, to animate

And layout.js (window.LAYOUT7): where everything goes, in screen pixels.

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
#  PANEL 1: Spud Enda at the wheel (IMG-027)
# =====================================================================
# Saved on its own (not on paper), so main.js can zoom it in and out.
driver = Picture("13_5.jpg", 270, (155, 160, 850, 690), W - 60, H - 40)
driver.img.save(OUT / "van_driver.jpg", quality=90)
print("van_driver.jpg", driver.img.size)
layout["van_driver"] = {"x": driver.x, "y": driver.y}
# Places to zoom in on (pixels on the picture): his eyes, and his hands
# on the steering wheel
layout["van_eyes"] = list(driver.pt(490, 288))
layout["van_hands"] = list(driver.pt(515, 610))


# =====================================================================
#  PANEL 2: VROOOOM (IMG-026, bottom picture)
# =====================================================================
vroom = Picture("13_4.jpg", 270, (252, 318, 845, 634), W, H)
vroom.words("van_vroom", (264, 338, 606, 411))
vroom.words("van_herewego", (590, 424, 688, 486))
VAN = [(262, 413), (600, 413), (602, 606), (585, 622), (262, 626)]
vroom.solid("van_van", (262, 411, 604, 627), VAN)
vroom.blank("van_vroom_blank")
# The van stops when its front reaches the yellow post: how far is that?
layout["van_to_post"] = vroom.pt(664, 0)[0] - vroom.pt(601, 0)[0]


# =====================================================================
#  PANEL 3: BAM (IMG-028, top picture), with its two lines of words below
# =====================================================================
bam = Picture("14_1.jpg", 270, (178, 48, 875, 498), W - 280, 640, at_y=24)
# "BAM": only below the panel's top edge (the frame line runs close to it)
bb = bam.pbox((364, 62, 714, 214))
under_frame = polygon_mask(bam.img.size, [bam.pt(x, y) for x, y in
                                           [(364, 70), (714, 90), (714, 214), (364, 214)]], 1.5)
bam_a = np.minimum(bam.ink, under_frame)[bb[1]:bb[3], bb[0]:bb[2]]
save_png("van_bam", bam.img.crop(bb), bam_a)
bam.place("van_bam", bb[0], bb[1])
bam.hole[bb[1]:bb[3], bb[0]:bb[2]] = np.maximum(bam.hole[bb[1]:bb[3], bb[0]:bb[2]], bam_a)
CRASHED_VAN = [(352, 208), (736, 212), (736, 458), (645, 458), (642, 489), (558, 489), (555, 458),
               (495, 458), (492, 490), (403, 490), (400, 458), (352, 458)]
bam.solid("van_bam_van", (348, 204, 740, 492), CRASHED_VAN)
bam.blank("van_bam_blank")

# The two lines below it: printed words, so lifted as even black ink
words = Picture("14_1.jpg", 270, (176, 503, 538, 576), 900, 160, at_y=700)
save_png("van_crashed", Image.new("RGB", words.img.size, INK), words.ink)
layout["van_crashed"] = {"x": words.x, "y": words.y}


# =====================================================================
#  PANEL 4: FIVE MINUTES LATER, and "Hoo boy..."
# =====================================================================
five = Picture("14_1.jpg", 270, (553, 491, 907, 717), 940, 600, at_y=30)
five_a = polygon_mask(five.img.size, [(0, 0), (five.img.width, 0), (five.img.width, five.img.height),
                                      (0, five.img.height)], 0)
save_png("van_five", five.img, feather(Image.fromarray(five_a.astype(np.uint8)).convert("RGB"), (0, 0, 0), 12).getchannel("R"))
layout["van_five"] = {"x": five.x, "y": five.y}

hoo = Picture("14_1.jpg", 270, (174, 612, 538, 717), 860, 230, at_y=650)
save_png("van_hooboy", Image.new("RGB", hoo.img.size, INK), hoo.ink)
layout["van_hooboy"] = {"x": hoo.x, "y": hoo.y}


# =====================================================================
#  PANEL 5: Today's driving forecast (IMG-029)
# =====================================================================
forecast = Picture("14_2.jpg", 270, (88, 84, 958, 706), W - 20, H - 10)
forecast.save_on_paper("van_forecast")          # the whole panel, as drawn
fc = forecast

def outline_cut(pic, name, outline, box=None):
    """A sprite cut along a hand-traced outline (everything inside it)."""
    pts = [pic.pt(x, y) for x, y in outline]
    a = polygon_mask(pic.img.size, pts, 1.2)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    b = (max(min(xs) - 2, 0), max(min(ys) - 2, 0), min(max(xs) + 2, pic.img.width), min(max(ys) + 2, pic.img.height))
    save_png(name, pic.img.crop(b), a[b[1]:b[3], b[0]:b[2]])
    pic.place(name, b[0], b[1])
    pic.hole = np.maximum(pic.hole, a)

# Each drawing on the forecast is cut out on its own, so main.js can
# bring them in one by one and animate them.
#
# The dial: its little pointer is rubbed out (main.js draws a new needle
# that can swing round). The black hub stays.
db = fc.pbox((372, 206, 694, 518))
dial_a = np.zeros_like(fc.ink)
dial_a[db[1]:db[3], db[0]:db[2]] = fill_inside(fc.ink, db)
nub = fc.pbox((572, 360, 598, 384))
nub_hole = np.zeros(fc.ink.shape, np.float32)
nub_hole[nub[1]:nub[3], nub[0]:nub[2]] = fc.ink[nub[1]:nub[3], nub[0]:nub[2]]
nub_hole = grow(nub_hole, 7) > 10
dial_rgb = fill_holes(fc.rgb, (~nub_hole & (fc.ink < 25)).astype(np.float32))
dial_rgb = np.where(nub_hole[..., None], dial_rgb, fc.rgb)
save_png("fc_dial", Image.fromarray(np.clip(dial_rgb, 0, 255).astype(np.uint8)).crop(db), dial_a[db[1]:db[3], db[0]:db[2]])
fc.place("fc_dial", db[0], db[1])
fc.hole = np.maximum(fc.hole, dial_a)
hx, hy = fc.pt(534, 378)
layout["fc_hub"] = [hx + fc.x, hy + fc.y]                        # the middle of the hub
layout["fc_hub_r"] = fc.pt(534 + 38, 378)[0] - hx                 # its radius
layout["fc_needle"] = fc.pt(534 + 125, 378)[0] - hx               # how long the needle is

# The angry driver (upper right): face, eyebrows, steering wheel
fc.words("fc_brows", (786, 176, 873, 195))                       # (just the eyebrows' ink)
fc.words("fc_face", (744, 150, 916, 244))                        # (the rest of the face's ink...
face = Image.open(OUT / "fc_face.png")                            #  ...without the eyebrows)
fa = np.asarray(face.getchannel("A"), np.float32).copy()
fb, bb2 = fc.pbox((744, 150, 916, 244)), fc.pbox((786, 176, 873, 195))
fa[bb2[1] - fb[1]:bb2[3] - fb[1], bb2[0] - fb[0]:bb2[2] - fb[0]] = 0
face.putalpha(Image.fromarray(fa.astype(np.uint8)))
face.save(OUT / "fc_face.png")
fc.solid("fc_wheel", (770, 246, 877, 357), [(770, 246), (877, 246), (877, 357), (770, 357)])

# The lorry's cab (left): the hand doing the "salute" comes off on its own
ARM = [(203, 320), (213, 321), (258, 276), (276, 268), (276, 226), (237, 226), (237, 262), (198, 304)]
outline_cut(fc, "fc_arm", ARM)
CAB = [(88, 172), (321, 174), (340, 470), (88, 473)]
cab_a = polygon_mask(fc.img.size, [fc.pt(x, y) for x, y in CAB], 1.2)
cb = fc.pbox((86, 170, 342, 475))
# where the arm was, inside the window: paint it plain white, like the window
arm_m = polygon_mask(fc.img.size, [fc.pt(x, y) for x, y in ARM], 0) > 0
wb = fc.pbox((110, 215, 200, 230))                                # a plain bit of the window
cab_rgb = fc.rgb.copy()
cab_rgb[arm_m] = np.median(fc.rgb[wb[1]:wb[3], wb[0]:wb[2]].reshape(-1, 3), axis=0)
save_png("fc_cab", Image.fromarray(cab_rgb.astype(np.uint8)).crop(cb), cab_a[cb[1]:cb[3], cb[0]:cb[2]])
fc.place("fc_cab", cb[0], cb[1])
fc.hole = np.maximum(fc.hole, cab_a)
# (the tyre: a rough circle round it, so the cab's bottom line doesn't come too)
TYRE = [(200 + 54 * np.cos(a), 518 + 50 * np.sin(a)) for a in np.linspace(0, 2 * np.pi, 24, endpoint=False)]
fc.solid("fc_tyre", (144, 466, 256, 570), TYRE)
sx, sy = fc.pt(207, 316)
layout["fc_shoulder"] = [sx + fc.x, sy + fc.y]                    # the arm swings round here

# The two little vans along the bottom, and the burnt-out blue one
fc.solid("fc_blue", (88, 582, 255, 691), [(88, 582), (255, 582), (255, 691), (88, 691)])
fc.solid("fc_pink", (297, 537, 456, 653), [(297, 537), (456, 537), (456, 653), (297, 653)])
fc.solid("fc_burnt", (742, 432, 922, 645), [(742, 432), (922, 432), (922, 645), (742, 645)])

# The empty forecast: only the title is left
fc.blank("fc_blank")


(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT7 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

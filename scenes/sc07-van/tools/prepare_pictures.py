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
  van_forecast.jpg      "Today's driving forecast"

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
forecast.save_on_paper("van_forecast")


(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "window.LAYOUT7 = " + json.dumps(layout, indent=1) + ";\n")
print("layout.js written")

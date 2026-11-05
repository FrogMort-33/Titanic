"""
prepare_pictures.py  -  cut the pictures for SC-05 "Uber World, Part One"

  PART 1 uses IMG-012 (the "UBER!" close-up, master 09_uber_closeup.jpg)
  PART 2 uses IMG-013 (the "Le Hotel" close-up, master 09_hotel_closeup.jpg)
  PART 3 uses the top picture of IMG-014 (the bunk beds, master 10.jpg)
  and both parts borrow a paragraph of words from IMG-011 (the whole
  page, master 09.jpg).

Boxes are measured on the working copies (working/IMG-0xx.jpg, 1000 px
on the long side). The picture tools live in storybook/tools/picture_tricks.py.

Makes, in ../assets/:
  uber_blank.jpg            the night sky with both cars rubbed out
  car_blue.png, car_pink.png    the two Ubers, passenger windows EMPTY
  ub_head1..9.png           the passengers (5 in the blue car, 4 in the pink)
  oui_oui.png, non_non.png  what each car shouts
  tash_text.png             "Tash's quick-thinking summoned two Ubers..."
  hotel_blank.jpg           page 2: yellow paper + the hotel with empty
                            windows and the bottom picture hidden
  win_head1..6.png          the faces for the six hotel windows
  hotel_bottom.png          the bottom picture (reception, pinball...)
  ensued_text.png           "What ensued was the calm before the storm..."
  bunks.jpg                 page 3: everyone asleep in the bunk beds (IMG-014)
  pa_intro_text.png         "After a gentle snooze, the Titanic Club rolled..." 

And layout.js (window.LAYOUT5): where everything goes, in screen pixels.

Run:   python3 tools/prepare_pictures.py     then   python3 make_offline.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCENE = HERE.parent
OUT = SCENE / "assets"
sys.path.insert(0, str(HERE.parents[2] / "tools"))  # storybook/tools
from picture_tricks import *                         # open_master, rub_out, ...

layout = {}

def as_int(*values):
    """Plain whole numbers (numpy's own number types upset json)."""
    return [int(v) for v in values]

def save_png(name, rgb_img, alpha):
    im = rgb_img.convert("RGBA")
    im.putalpha(Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8)))
    im.save(OUT / (name + ".png"))
    print(name + ".png", im.size)


# =====================================================================
#  PART 1 - the night sky and the two Ubers (IMG-012)
# =====================================================================
master, s = open_master("09_uber_closeup.jpg")
sky, to_px = cut_to_width(master, s, (40, 50, 970, 704))     # screen-shaped (1280 x 900)
rgb = np.asarray(sky, np.float32)
H1, W1 = rgb.shape[:2]

def px(box):
    """A working-copy box -> a box in pixels on the screen-shaped picture."""
    (x0, y0), (x1, y1) = to_px(*box[:2]), to_px(*box[2:])
    return max(x0, 0), max(y0, 0), min(x1, W1), min(y1, H1)

# The thick black felt-tip lines. The grey pencil sky is lighter.
marker = ((rgb.max(axis=2) < 95) * 255).astype(np.float32)
ink = ink_strength(sky)
cover = np.zeros(marker.shape, np.float32)       # everything to rub out

def traced_mask(shapes):
    """A soft mask of hand-traced shapes: ("poly", [points]) or ("oval", box)."""
    m = Image.new("L", sky.size, 0)
    d = ImageDraw.Draw(m)
    for kind, pts in shapes:
        if kind == "poly":
            d.polygon([to_px(x, y) for x, y in pts], fill=255)
        else:
            d.ellipse((*to_px(*pts[:2]), *to_px(*pts[2:])), fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(1.5)), np.float32)

def car_sprite(name, box, window, slots, glass, traced=None):
    """Cut out one car: its outline and everything inside it (fill_inside),
    with the passengers' window painted over as EMPTY glass.
    The passengers are saved separately, one picture per seat (slots)."""
    b = px(box)
    x0, y0, x1, y1 = b
    if traced:
        alpha = traced_mask(traced)[y0:y1, x0:x1]
    else:
        alpha = fill_inside(marker, b)
    # Tidy: fill_inside also returns stray specks of ink nearby. "Opening"
    # (shrink, then grow back) removes anything thinner than 9 pixels,
    # but the big solid car survives.
    m = Image.fromarray(np.clip(alpha, 0, 255).astype(np.uint8))
    solid = np.asarray(m.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(13)), np.float32)
    alpha = np.minimum(alpha, solid)
    car = sky.crop(b)
    # The passengers, one rectangle per seat, BEFORE we empty the window
    wy0, wy1 = window[1], window[3]
    for i, (sx0, sx1) in enumerate(zip(slots[:-1], slots[1:])):
        hb = px((sx0, wy0, sx1, wy1))
        head = sky.crop(hb).convert("RGBA")
        head.save(OUT / f"ub_head{name_heads[0] + i}.png")
        layout[f"ub_head{name_heads[0] + i}"] = {"x": hb[0], "y": hb[1]}
    name_heads[0] += len(slots) - 1
    # Empty glass over the passenger window (rounded box, a bit inside
    # the window's black edge so the edge still shows)
    w = px(window)
    draw = ImageDraw.Draw(car)
    draw.rounded_rectangle((w[0] - x0, w[1] - y0, w[2] - x0, w[3] - y0), radius=10, fill=glass)
    save_png(name, car, alpha)
    layout[name] = {"x": x0, "y": y0}
    cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], alpha)
    return b

name_heads = [1]          # passengers are numbered 1, 2, 3... across both cars
blue = car_sprite("car_blue", (55, 440, 565, 705), window=(131, 475, 302, 525),
                  slots=[128, 164, 197, 232, 265, 302], glass=(206, 220, 236))
pink = car_sprite("car_pink", (615, 305, 945, 505), window=(648, 340, 772, 373),
                  slots=[645, 683, 708, 740, 773], glass=(232, 226, 232),
                  # its thin outline has gaps, so it's traced by hand instead
                  traced=[("poly", [(632, 345), (640, 330), (660, 326), (720, 323), (780, 320), (812, 320),
                                    (832, 328), (836, 375), (860, 378), (895, 382), (915, 393), (926, 415),
                                    (930, 440), (918, 453), (880, 458), (800, 460), (700, 458), (655, 450),
                                    (637, 438), (631, 400)]),
                          ("oval", (687, 450, 761, 498)), ("oval", (847, 456, 901, 503))])

def words(name, box, attach_to):
    """Lift just the ink of a shout ("oui, oui!") from the sky."""
    b = px(box)
    x0, y0, x1, y1 = b
    a = ink[y0:y1, x0:x1]
    save_png(name, sky.crop(b), a)
    layout[name] = {"x": b[0], "y": b[1]}
    cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], a)

words("oui_oui", (160, 408, 290, 456), "car_blue")
words("non_non", (662, 278, 772, 320), "car_pink")

# Other things to rub out: the speed lines, the little "ooo" exhaust
# and the yellow dust puff
for box in [(380, 355, 640, 445), (75, 572, 110, 600), (535, 585, 650, 645)]:
    x0, y0, x1, y1 = px(box)
    cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], np.maximum(ink[y0:y1, x0:x1], marker[y0:y1, x0:x1]))
x0, y0, x1, y1 = px((535, 585, 650, 645))                          # the puff is yellow, not ink:
cover[y0:y1, x0:x1] = 255                                          # rub out the whole box

# Each car sits on a white "halo" of unshaded paper. Rub that out too:
# the bright pixels close around each car.
near_car = np.asarray(Image.fromarray(np.clip(cover, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.MaxFilter(51)), np.float32) > 10
bright = rgb.min(axis=2) > 175
halo = (near_car & bright) * 255.0
cover = np.maximum(cover, halo)
hole = np.asarray(Image.fromarray(np.clip(cover, 0, 255).astype(np.uint8))
                  .filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255

# Fill the holes: first smoothly (push-pull), then COPY real pencil sky
# over them from a clean spot nearby (like the "clone" brush), trying a
# few shifts in turn. Clean = not near anything we rub out, and not in
# the top band with the moon, stars, "UBER!" and Tash.
filled = fill_holes(rgb, 1 - hole)
clean = (np.asarray(Image.fromarray(np.clip(cover, 0, 255).astype(np.uint8))
                    .filter(ImageFilter.MaxFilter(25)), np.float32) < 10)
clean[:px((0, 0, 1, 245))[3], :] = False                          # the top band
# ...and only copy from properly SHADED sky: not the white paper margins,
# not the yellow page around the drawing. (Judged on a blurred copy, so
# the gaps between pencil strokes still count as shaded.)
shade = np.asarray(Image.fromarray(rgb.min(axis=2).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), np.float32)
not_yellow = rgb[..., 2] > 0.85 * rgb[..., 0]
clean &= (shade < 200) & not_yellow
need = hole > 0.02
done = np.zeros_like(need)
copy = filled.copy()
shifts = [(dx, dy) for r in (130, 260, 390, 520) for dx, dy in
          [(0, r), (0, -r), (r, 0), (-r, 0), (r, r), (-r, r), (r, -r), (-r, -r)]]
for dx, dy in shifts:
    ys, xs = np.nonzero(need & ~done)
    sx, sy = xs + dx, ys + dy
    ok = (sx >= 0) & (sx < W1) & (sy >= 0) & (sy < H1)
    ys, xs, sx, sy = ys[ok], xs[ok], sx[ok], sy[ok]
    good = clean[sy, sx]
    copy[ys[good], xs[good]] = rgb[sy[good], sx[good]]
    done[ys[good], xs[good]] = True
print("sky: copied", int(done.sum()), "of", int(need.sum()), "pixels")
blank = rgb * (1 - hole[..., None]) + copy * hole[..., None]
Image.fromarray(np.clip(blank, 0, 255).astype(np.uint8)).save(OUT / "uber_blank.jpg", quality=88)
print("uber_blank.jpg", sky.size)


# =====================================================================
#  The words, from the whole page (IMG-011)
# =====================================================================
page, s11 = open_master("09.jpg", rotate_clockwise=90)
def page_crop(box):
    return page.crop(tuple(round(v * s11) for v in box))

def words_only(box, height):
    """Just the printed words of a paragraph (see-through around them),
    resized to 'height' pixels tall. The photo of the page is shadowy,
    so we keep only the ink and put it on clean paper of our own."""
    crop = page_crop(box)
    crop = crop.resize((round(crop.width * height / crop.height), height), Image.LANCZOS)
    alpha = ink_strength(crop)
    ink_colour = Image.new("RGB", crop.size, (28, 26, 24))   # nice even black
    return ink_colour, alpha

im, a = words_only((48, 350, 302, 600), 520)
save_png("tash_text", im, a)
ensued, ensued_alpha = words_only((48, 628, 308, 945), 680)
paper = (244, 234, 172)          # the book's pale yellow page

# =====================================================================
#  PART 2 - Le Hotel (IMG-013), on a page of yellow paper
# =====================================================================
hmaster, s13 = open_master("09_hotel_closeup.jpg", rotate_clockwise=90)
HBOX = (75, 30, 640, 1000)                        # the hotel, working-copy box
hotel = hmaster.crop(tuple(round(v * s13) for v in HBOX))
k = 900 / hotel.height                            # fit the screen's height
hotel = hotel.resize((round(hotel.width * k), 900), Image.LANCZOS)
hx = 1280 - hotel.width - 30                      # where it goes on the screen
def hp(x, y):
    """Working-copy point on IMG-013 -> pixel on the hotel picture."""
    return round((x - HBOX[0]) * s13 * k), round((y - HBOX[1]) * s13 * k)
hrgb = np.asarray(hotel, np.float32)

# Yellow = lots of red and green, not much blue
yellow = (hrgb[..., 0] > 80) & (hrgb[..., 1] > 70) & (hrgb[..., 2] < 0.55 * hrgb[..., 1])

# The six windows: rough box (inside the black frame) and where the
# little heart ends (the face is below it).  Working-copy numbers.
WINDOWS = [((152, 208, 271, 320)), ((333, 228, 398, 311)), ((438, 212, 544, 318)),
           ((137, 384, 272, 545)), ((314, 415, 392, 540)), ((430, 396, 535, 546))]
hrgb2 = hrgb.copy()
rng = np.random.default_rng(5)
for i, (x0, y0, x1, y1) in enumerate(WINDOWS, start=1):
    (a, b), (c, d) = hp(x0, y0), hp(x1, y1)
    face = ~yellow[b:d, a:c]                           # not yellow = the face
    m = Image.fromarray((face * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))  # remove specks
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))  # close small gaps
    alpha = np.asarray(m.filter(ImageFilter.GaussianBlur(1)), np.float32)
    save_png(f"win_head{i}", hotel.crop((a, b, c, d)), alpha)
    layout[f"win_head{i}"] = {"x": hx + a, "y": b}
    # Empty the window: paint the face's place in this window's yellow,
    # with a little grain so it looks like crayon, not flat paint
    win_yellow = np.median(hrgb[b:d, a:c][yellow[b:d, a:c]], axis=0)
    print("window", i, "yellow pixels", int(yellow[b:d, a:c].sum()), "of", (d - b) * (c - a))
    grown = np.asarray(m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5)),
                       np.float32)[..., None] / 255
    paint = win_yellow + rng.normal(0, 6, (d - b, c - a, 1))
    hrgb2[b:d, a:c] = hrgb2[b:d, a:c] * (1 - grown) + paint * grown

# The bottom picture: save it, then hide it under plain paper
(bx0, by0), (bx1, by1) = hp(100, 572), hp(598, 1000)
bx0, by1 = max(bx0, 0), min(by1, hotel.height)
Image.fromarray(np.clip(hrgb, 0, 255).astype(np.uint8)).crop((bx0, by0, bx1, by1)).save(OUT / "hotel_bottom.png")
layout["hotel_bottom"] = {"x": hx + bx0, "y": by0}
print("hotel_bottom.png", (bx1 - bx0, by1 - by0))
wall = np.percentile(hrgb[hp(0, 330)[1]:hp(0, 350)[1], hp(290, 0)[0]:hp(420, 0)[0]].reshape(-1, 3), 90, axis=0)   # the lighter wall
hrgb2[by0:by1, bx0:bx1] = wall + rng.normal(0, 4, (by1 - by0, bx1 - bx0, 1))   # paper, a little grainy

# The whole page: yellow paper, the hotel on the right
canvas = Image.new("RGB", (1280, 900), paper)
hotel_done = feather(Image.fromarray(np.clip(hrgb2, 0, 255).astype(np.uint8)), paper, px=25)
canvas.paste(hotel_done, (hx, 0))
canvas.save(OUT / "hotel_blank.jpg", quality=88)
print("hotel_blank.jpg", canvas.size)

# The words go on the left, blended into the paper at the edges
save_png("ensued_text", ensued, ensued_alpha)
layout["ensued_text"] = {"x": max(20, (hx - ensued.width) // 2), "y": (900 - ensued.height) // 2}
print("ensued_text.png", ensued.size)

# =====================================================================
#  PART 3 - all asleep in the bunk beds (top picture of IMG-014)
# =====================================================================
# The picture is wider than the screen's shape, so it fills the width
# and sits in the middle, with night-time dark above and below it.
bmaster, s14 = open_master("10.jpg")
bunks, bto = cut_to_width(bmaster, s14, (92, 92, 656, 400))
bunks.save(OUT / "bunks.jpg", quality=88)
top = (900 - bunks.height) // 2
layout["bunks"] = {"x": 0, "y": top}
# Each sleeper's head (top middle), for the floating Zzz's
HEADS = [(262, 122), (257, 182), (264, 252), (260, 330), (350, 157), (390, 152),
         (552, 102), (555, 182), (595, 300)]
layout["sleepers"] = [[bto(x, y)[0], bto(x, y)[1] + top] for x, y in HEADS]
print("bunks.jpg", bunks.size)

# =====================================================================
#  PART 4 - "Très bien!" (bottom picture of IMG-014)
# =====================================================================
# Everything is cut out separately, then rubbed out of the picture, so
# the page starts EMPTY and the pastries can fly about on it.
panel, pto = cut_to_width(bmaster, s14, (82, 490, 700, 925))
panel = panel.crop((0, 0, 1280, 900))
prgb = np.asarray(panel, np.float32)
pink = ink_strength(panel)                       # (ink on the pastry panel)
pmarker = ((prgb.max(axis=2) < 110) * 255).astype(np.float32)
pcover = np.zeros(pink.shape, np.float32)

def ppx(box):
    (x0, y0), (x1, y1) = pto(*box[:2]), pto(*box[2:])
    return max(x0, 0), max(y0, 0), min(x1, 1280), min(y1, 900)

def pastry(name, box):
    """A pastry: its outline and everything inside it. 'Opening' (shrink,
    then grow) throws away thin bits like the speed lines."""
    b = ppx(box)
    x0, y0, x1, y1 = b
    a = fill_inside(pmarker, b)
    m = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    solid = np.asarray(m.filter(ImageFilter.MinFilter(17)).filter(ImageFilter.MaxFilter(23)), np.float32)
    a = np.minimum(a, solid)
    save_png(name, panel.crop(b), a)
    layout[name] = {"x": x0, "y": y0}
    pcover[y0:y1, x0:x1] = np.maximum(pcover[y0:y1, x0:x1], pink[y0:y1, x0:x1])   # all ink here goes,
    pcover[y0:y1, x0:x1] = np.maximum(pcover[y0:y1, x0:x1], a)                    # speed lines too

PASTRIES = {"pa_baguette1": (88, 503, 234, 607), "pa_croissant1": (403, 505, 495, 592),
            "pa_ring": (497, 538, 566, 614), "pa_muffin": (140, 613, 205, 676),
            "pa_cake": (541, 678, 660, 794), "pa_baguette2": (76, 708, 137, 924),
            "pa_croissant2": (178, 796, 252, 899), "pa_croissant3": (576, 826, 682, 892)}
for name, box in PASTRIES.items():
    pastry(name, box)
# the speed lines, wherever they are
for box in [(60, 500, 140, 600), (340, 515, 410, 580), (560, 540, 615, 612), (520, 760, 580, 830),
            (140, 800, 190, 900), (640, 820, 725, 895)]:
    x0, y0, x1, y1 = ppx(box)
    pcover[y0:y1, x0:x1] = np.maximum(pcover[y0:y1, x0:x1], pink[y0:y1, x0:x1])

# The potato and the flute he's hugging, traced by hand. The flute is
# a long thin band from his lower left to his upper right.
POTATO = [(330, 590), (390, 592), (420, 645), (427, 705), (420, 760), (432, 790), (410, 802),
          (350, 802), (328, 786), (320, 760), (305, 700), (304, 645), (314, 605)]
FLUTE = [(290, 730), (295, 712), (437, 623), (449, 629), (451, 646), (300, 747)]
def traced(points):
    m = Image.new("L", panel.size, 0)
    ImageDraw.Draw(m).polygon([pto(x, y) for x, y in points], fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(1.5)), np.float32)
potato_a, flute_a = traced(POTATO), traced(FLUTE)

def save_traced(name, alpha, rgb_array):
    ys, xs = np.nonzero(alpha > 10)
    b = as_int(xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    im = Image.fromarray(np.clip(rgb_array, 0, 255).astype(np.uint8)).crop(b)
    save_png(name, im, alpha[b[1]:b[3], b[0]:b[2]])
    layout[name] = {"x": b[0], "y": b[1]}

save_traced("pa_flute", flute_a, prgb)
# The potato WITHOUT the flute: paint over the flute with his own
# crayon-brown (filled in from around it, plus a little grain)
fl = np.asarray(Image.fromarray(flute_a.astype(np.uint8)).filter(ImageFilter.MaxFilter(29))
                .filter(ImageFilter.GaussianBlur(2)), np.float32) / 255     # a bit wider: its outline too
inside = (potato_a > 128) & (fl < 0.5)
# Paint over the flute by COPYING his body from just below it (like the
# clone brush): the crayon texture matches, and his left outline, which
# carries on downwards, gets drawn back in too.
SHIFT = 120                                                          # pixels down
below = np.roll(prgb, -SHIFT, axis=0)                                # pixel (x, y+100) moved to (x, y)
no_flute = prgb * (1 - fl[..., None]) + below * fl[..., None]
save_traced("pa_potato", np.where(fl > 0.5, np.minimum(potato_a, 255) * (potato_a > 128), potato_a), no_flute)
grow = lambda a: np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.MaxFilter(21)), np.float32)
pcover = np.maximum(pcover, np.maximum(grow(potato_a), grow(flute_a)))   # (grown, to catch his outline)

# The words
def panel_words(name, box):
    b = ppx(box)
    x0, y0, x1, y1 = b
    save_png(name, panel.crop(b), pink[y0:y1, x0:x1])
    layout[name] = {"x": x0, "y": y0}
    pcover[y0:y1, x0:x1] = np.maximum(pcover[y0:y1, x0:x1], pink[y0:y1, x0:x1])
panel_words("pa_tres_bien", (245, 598, 312, 648))
panel_words("pa_flutes_text", (272, 812, 498, 908))
layout["pa_centre"] = list(pto(366, 700))             # the middle of the potato

# The words between the two pictures on the page ("After a gentle
# snooze..."): just the printed ink, put on clean paper by main.js,
# at the top of the pastry panel.
ib = tuple(round(v * s14) for v in (100, 404, 650, 497))
icrop = bmaster.crop(ib)
icrop = icrop.resize((1100, round(icrop.height * 1100 / icrop.width)), Image.LANCZOS)
iink = ink_strength(icrop)
iink[:14] = 0                  # a smudge of the painting above sneaks in at the top
save_png("pa_intro_text", Image.new("RGB", icrop.size, (28, 26, 24)), iink)

# The empty page: all of that rubbed out
# (Only plain paper is used to fill the holes: anything dark nearby,
# like the potato's outline, would smudge into the fill.)
hole = np.asarray(Image.fromarray(np.clip(pcover, 0, 255).astype(np.uint8))
                  .filter(ImageFilter.MaxFilter(15)), np.float32) > 10
good = (~hole & (pink < 25)).astype(np.float32)
paper_fill = fill_holes(prgb, good)
paper_fill = np.asarray(Image.fromarray(np.clip(paper_fill, 0, 255).astype(np.uint8))
                        .filter(ImageFilter.GaussianBlur(4)), np.float32)
soft = np.asarray(Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4)),
                  np.float32)[..., None] / 255
pblank = Image.fromarray(np.clip(prgb * (1 - soft) + paper_fill * soft, 0, 255).astype(np.uint8))
pblank.save(OUT / "pastry_blank.jpg", quality=88)
print("pastry_blank.jpg", pblank.size)

(SCENE / "layout.js").write_text(
    "// Made by tools/prepare_pictures.py - do not edit by hand.\n"
    "// Where each cut-out sprite sits on the screen (pixels, top-left corner).\n"
    "window.LAYOUT5 = " + json.dumps(layout, indent=2) + ";\n")
print("layout.js written")

"""
make_cast_sheet.py
==================

WHAT THIS DOES
--------------
Reads index/cast_and_objects.csv and draws one PNG "who's who" sheet:
a card for every actor, guest and object, with a picture, its ID,
its name, and the images it appears in.

WHERE THE PICTURE COMES FROM
----------------------------
The 'portrait' column can hold a crop, written like this:

    IMG-006:230,340,325,510
      |      |   |   |   |
      |      left top right bottom   (pixels in the WORKING copy)
      which image

If 'portrait' is empty, the card just uses the first image listed in
'appears_in', shrunk to fit. To improve a picture later, edit the
portrait box in the CSV and run this again.

HOW TO RUN
----------
    python3 make_cast_sheet.py
(run make_working_copies.py first, so the working images exist)
"""

import csv
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent      # .../storybook
CAST_CSV = ROOT / "index" / "cast_and_objects.csv"
OUT = ROOT / "previews" / "cast-and-objects.png"

# Colours taken from the book: pale yellow paper, felt-tip ink, lime hills
PAPER, INK, CARD, HILL = (246, 239, 196), (29, 27, 20), (255, 252, 235), (185, 207, 43)
KIND_COLOUR = {"cast": (79, 159, 191), "guest": (214, 96, 140), "object": (120, 110, 80), "place": (120, 110, 80)}

CARD_W, CARD_H = 360, 330     # size of one card
PIC_H = 200                   # height of the picture area on the card
COLUMNS = 6


def font(size, bold=False):
    """Load a font, or fall back to Pillow's built-in one."""
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def picture_for(row):
    """Return the image to show on this card (a crop, or a whole image)."""
    if row["portrait"]:
        image_id, box = row["portrait"].split(":")
        left, top, right, bottom = (int(n) for n in box.split(","))
        img = Image.open(ROOT / "working" / f"{image_id}.jpg").crop((left, top, right, bottom))
    else:
        first_id = row["appears_in"].split()[0]
        img = Image.open(ROOT / "working" / f"{first_id}.jpg")
    # 'contain' shrinks the picture to fit the box without cutting anything off
    return ImageOps.contain(img, (CARD_W - 30, PIC_H))


def main():
    rows = list(csv.DictReader(open(CAST_CSV, newline="", encoding="utf-8")))
    lines = (len(rows) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGB", (COLUMNS * (CARD_W + 20) + 20, lines * (CARD_H + 20) + 110), PAPER)
    d = ImageDraw.Draw(sheet)
    d.text((24, 24), "Titanic Club: cast, guests and objects", font=font(44, True), fill=INK)

    for i, row in enumerate(rows):
        x = 20 + (i % COLUMNS) * (CARD_W + 20)
        y = 100 + (i // COLUMNS) * (CARD_H + 20)

        d.rectangle([x, y, x + CARD_W, y + CARD_H], fill=CARD, outline=INK, width=3)

        pic = picture_for(row)
        sheet.paste(pic, (x + (CARD_W - pic.width) // 2, y + 12))   # centred at the top

        # coloured tag with the ID, e.g. ACT-01
        colour = KIND_COLOUR.get(row["kind"], INK)
        d.rounded_rectangle([x + 12, y + PIC_H + 22, x + 120, y + PIC_H + 52], radius=12, fill=colour)
        d.text((x + 22, y + PIC_H + 25), row["id"], font=font(20, True), fill="white")
        d.text((x + 130, y + PIC_H + 24), row["name"][:22], font=font(19, True), fill=INK)

        # which images this one appears in (shortened if it is a long list)
        ids = row["appears_in"].split()
        shown = " ".join(i.replace("IMG-", "") for i in ids[:6]) + (" ..." if len(ids) > 6 else "")
        d.text((x + 12, y + PIC_H + 66), "in IMG " + shown, font=font(18), fill=INK)

    OUT.parent.mkdir(exist_ok=True)
    sheet.save(OUT)
    print(f"Saved {OUT}")


if __name__ == "__main__":
    main()

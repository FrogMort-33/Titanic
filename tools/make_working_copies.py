"""
make_working_copies.py
======================

WHAT THIS DOES
--------------
Reads the master image index (index/images.csv) and, for every row:

  1. opens the untouched master photo in  originals/
  2. turns it the right way up (using the 'rotate_clockwise' column)
  3. shrinks it to a small, quick-to-edit size
  4. saves it as  working/IMG-001.jpg, working/IMG-002.jpg, ...

Then it draws a "contact sheet" PNG: every working image as a thumbnail
with its IMG-ID printed underneath, so we can say "look at IMG-041"
and both know exactly which picture that is.

WHY THE SPREADSHEET IS THE BOSS
-------------------------------
images.csv is the single source of truth. If a photo is the wrong way
up, change its 'rotate_clockwise' number in the CSV and run this again.
The masters are only ever READ, never changed.

HOW TO RUN
----------
    python3 make_working_copies.py

(It needs the Pillow library:  pip install pillow )
"""

import csv
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

# ---------------------------------------------------------------------
# Folders. Everything is found relative to this script's location,
# so the whole 'storybook' folder can be moved anywhere.
# ---------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent   # .../storybook
INDEX_CSV = ROOT / "index" / "images.csv"
WORKING_DIR = ROOT / "working"
PREVIEW_DIR = ROOT / "previews"

# Longest side of a working copy, in pixels. Small enough to be fast,
# big enough to still read the handwriting.
WORKING_SIZE = 1000

# Contact sheet layout
THUMB = 220          # size of each thumbnail square
LABEL_H = 34         # space under each thumbnail for the IMG-ID
COLUMNS = 10


def load_index():
    """Read images.csv into a list of dictionaries (one per row)."""
    with open(INDEX_CSV, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def make_working_copy(row):
    """Make one small, upright working copy from its master photo."""
    master = Image.open(ROOT / row["master_file"])

    # Phones store "which way up" as a hidden tag (EXIF). This applies it.
    img = ImageOps.exif_transpose(master).convert("RGB")

    # Our own correction on top. Pillow's rotate() turns ANTI-clockwise,
    # so we pass a negative number to turn clockwise.
    degrees = int(row["rotate_clockwise"] or 0)
    if degrees:
        img = img.rotate(-degrees, expand=True)   # expand = don't crop corners

    img.thumbnail((WORKING_SIZE, WORKING_SIZE))   # keeps the shape, only shrinks
    out = ROOT / row["working_file"]
    img.save(out, quality=85)
    return out


def make_contact_sheet(rows):
    """One big PNG with every image and its ID, in index order."""
    rows_needed = (len(rows) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGB", (COLUMNS * THUMB, rows_needed * (THUMB + LABEL_H)), (246, 239, 196))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 20)
    except OSError:
        font = ImageFont.load_default()          # fallback if the font is missing

    for i, row in enumerate(rows):
        col, line = i % COLUMNS, i // COLUMNS
        x, y = col * THUMB, line * (THUMB + LABEL_H)

        thumb = Image.open(ROOT / row["working_file"])
        thumb.thumbnail((THUMB - 10, THUMB - 10))
        # centre the thumbnail inside its square
        sheet.paste(thumb, (x + (THUMB - thumb.width) // 2, y + (THUMB - thumb.height) // 2))

        label = row["image_id"]
        w = draw.textlength(label, font=font)
        draw.text((x + (THUMB - w) / 2, y + THUMB + 4), label, font=font, fill=(29, 27, 20))

    out = PREVIEW_DIR / "contact-sheet.png"
    sheet.save(out)
    return out


if __name__ == "__main__":
    WORKING_DIR.mkdir(exist_ok=True)
    PREVIEW_DIR.mkdir(exist_ok=True)

    rows = load_index()
    for row in rows:
        make_working_copy(row)
    print(f"Made {len(rows)} working copies in {WORKING_DIR}")
    print(f"Contact sheet: {make_contact_sheet(rows)}")

"""
make_offline.py
===============

WHY THIS EXISTS
---------------
When someone double-clicks index.html from a USB stick, the browser
opens it as a plain file (the address starts with file://). For safety,
browsers then refuse to let a page *load* other picture and sound files.
That would break Phaser.

THE TRICK
---------
Turn every picture and sound into text (called "base64") and put that
text inside one JavaScript file, assets.js. The page loads assets.js
with an ordinary <script> tag, which browsers DO allow from a file,
and Phaser reads the pictures straight out of it.

Result: copy the whole folder anywhere, double-click index.html, it works.
No internet needed (Phaser itself is in lib/phaser.min.js).

HOW TO RUN
----------
After adding or changing anything in assets/, run:

    python3 make_offline.py

Then add a line to the ASSET_FILES list below for any new file.
"""

import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent

# key (the name main.js uses)  ->  file in the assets folder
ASSET_FILES = {
    "road": "assets/background.jpg",
    "van":  "assets/van.png",
}

# What kind of file each extension is, so the browser knows how to read it
MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav"}


def to_data_url(path):
    """Read a file and turn it into a 'data:' address made of plain text."""
    data = (HERE / path).read_bytes()
    text = base64.b64encode(data).decode("ascii")
    return f"data:{MIME[Path(path).suffix.lower()]};base64,{text}"


lines = ["// Made by make_offline.py - do not edit by hand.",
         "// Every picture/sound, packed as text so the page works from a USB stick.",
         "window.ASSETS = {"]
for key, path in ASSET_FILES.items():
    lines.append(f'  "{key}": "{to_data_url(path)}",')
lines.append("};")

(HERE / "assets.js").write_text("\n".join(lines) + "\n")
print(f"Wrote assets.js with {len(ASSET_FILES)} files")

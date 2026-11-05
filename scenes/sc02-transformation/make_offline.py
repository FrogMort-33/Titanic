"""
make_offline.py  -  pack every file in assets/ into assets.js

Browsers won't let a double-clicked page (file://) load separate picture
or sound files, but they WILL run a <script> file. So we turn each
picture into text ("base64") inside assets.js. main.js then finds each
picture by its name without the extension, e.g. assets/bus.png -> "bus".

Run again whenever anything in assets/ changes:   python3 make_offline.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav"}

lines = ["// Made by make_offline.py - do not edit by hand.", "window.ASSETS = {"]
for f in sorted((HERE / "assets").iterdir()):
    if f.suffix.lower() in MIME:
        text = base64.b64encode(f.read_bytes()).decode("ascii")
        lines.append(f'  "{f.stem}": "data:{MIME[f.suffix.lower()]};base64,{text}",')
        print("packed", f.name)
lines.append("};")
(HERE / "assets.js").write_text("\n".join(lines) + "\n")

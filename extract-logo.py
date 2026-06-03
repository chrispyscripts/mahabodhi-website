#!/usr/bin/env python3
"""Isolate the orange Bodhi-tree mark from the logo crop into a transparent PNG."""
from PIL import Image
from pathlib import Path

SRC = Path("/Users/chrisharder/Desktop/MahaBohdi/logo-crop.png")
OUT = Path(__file__).parent / "assets" / "logo-tree.png"

def is_orange(r, g, b):
    # keep warm orange tree pixels; drop black background and white lettering
    return r > 95 and (r - b) > 40 and g < r + 10 and not (r > 200 and g > 185 and b > 165)

img = Image.open(SRC).convert("RGBA")
px = img.load()
w, h = img.size
minx, miny, maxx, maxy = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if is_orange(r, g, b):
            # normalise toward the brand orange for a clean, consistent fill
            px[x, y] = (r, g, b, 255)
            if x < minx: minx = x
            if y < miny: miny = y
            if x > maxx: maxx = x
            if y > maxy: maxy = y
        else:
            px[x, y] = (0, 0, 0, 0)

if maxx > minx and maxy > miny:
    pad = 4
    box = (max(0, minx - pad), max(0, miny - pad), min(w, maxx + pad), min(h, maxy + pad))
    img = img.crop(box)

img.save(OUT, "PNG")
print(f"saved {OUT.name} ({img.size[0]}x{img.size[1]})")

#!/usr/bin/env python3
"""Grade Maha Bodhi source photos into the brand's black -> orange -> cream duotone."""
from PIL import Image, ImageEnhance, ImageOps
from pathlib import Path

SRC = Path("/Users/chrisharder/Desktop/MahaBohdi")
OUT = Path(__file__).parent / "assets"
OUT.mkdir(parents=True, exist_ok=True)

# Near-grayscale base: neutral shadows/mids, with a subtle warm-orange lift only in the highlights.
# (The full brand orange is applied as a fade-in tint on hover, in CSS.)
STOPS = [
    (0.00, (9, 9, 10)),        # near-black shadows
    (0.45, (110, 109, 107)),   # neutral mid-gray
    (0.78, (192, 187, 178)),   # warm light gray
    (1.00, (247, 233, 208)),   # soft warm cream highlight
]

def build_lut():
    lut = []
    for i in range(256):
        t = i / 255
        for j in range(len(STOPS) - 1):
            t0, c0 = STOPS[j]
            t1, c1 = STOPS[j + 1]
            if t0 <= t <= t1:
                f = (t - t0) / (t1 - t0) if t1 > t0 else 0
                lut.append(tuple(round(c0[k] + (c1[k] - c0[k]) * f) for k in range(3)))
                break
        else:
            lut.append(STOPS[-1][1])
    return lut

LUT = build_lut()

def grade(img):
    g = ImageOps.grayscale(img)
    g = ImageEnhance.Contrast(g).enhance(1.12)   # punchier shadows
    g = ImageEnhance.Brightness(g).enhance(1.02)
    px = g.load()
    w, h = g.size
    out = Image.new("RGB", (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            op[x, y] = LUT[px[x, y]]
    # blend toward the neutral grayscale original so mids stay true B&W (warmth only in highlights)
    base = ImageOps.grayscale(img).convert("RGB")
    return Image.blend(out, base, 0.45)

# time token in source filename -> output semantic name
MAP = {
    "3.33.47": "yoga.jpg",
    "3.34.09": "trx-class.jpg",
    "3.34.20": "coaching.jpg",
    "3.34.29": "strength.jpg",
    "3.34.40": "wall.jpg",
    "3.34.47": "trx-detail.jpg",
    "3.35.06": "physio-device.jpg",
    "3.35.11": "weights.jpg",
    "3.35.19": "medball-class.jpg",
    "3.35.33": "coffee.jpg",
    "3.35.44": "reception.jpg",
    "3.35.54": "event.jpg",
    "3.36.06": "physio-room.jpg",
    "3.36.34": "logo-wall.jpg",
    "building-4.21.03": "building.jpg",
}

# Recenter a graded image around a focal point (fraction of w/h) so center/cover keeps it centered.
CENTER_CROP = {"building.jpg": (0.546, 0.629)}  # the wall logo

def recenter(img, fx, fy):
    w, h = img.size
    cx, cy = fx * w, fy * h
    halfw = min(cx, w - cx)
    halfh = min(cy, h - cy)
    return img.crop((round(cx - halfw), round(cy - halfh), round(cx + halfw), round(cy + halfh)))

def find_src(token):
    for p in SRC.glob("*.png"):
        if token in p.name:
            return p
    return None

if __name__ == "__main__":
    for token, out_name in MAP.items():
        src = find_src(token)
        if src is None:
            print(f"skip (missing): {token}")
            continue
        img = Image.open(src).convert("RGB")
        graded = grade(img)
        if out_name in CENTER_CROP:
            graded = recenter(graded, *CENTER_CROP[out_name])
        graded.save(OUT / out_name, "JPEG", quality=86, optimize=True)
        print(f"{out_name:18s} <- {src.name}")
    print("done")

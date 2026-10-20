#!/usr/bin/env python3
"""Vẽ biểu tượng app: kính lúp có dấu tích trên nền xanh mực bút bi."""
from PIL import Image, ImageDraw
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / 'icons'
OUT.mkdir(exist_ok=True)
BG, FG, TICK = (45, 70, 200), (255, 255, 255), (255, 214, 102)

def draw(size, pad_ratio, rounded):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.22), fill=BG)
    else:
        d.rectangle((0, 0, S, S), fill=BG)
    p = S * pad_ratio
    inner = S - 2 * p
    cx, cy, r = p + inner * 0.42, p + inner * 0.42, inner * 0.30
    w = int(inner * 0.085)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=FG, width=w)
    # tay cầm
    import math
    a = math.radians(45)
    x0, y0 = cx + r * math.cos(a), cy + r * math.sin(a)
    x1, y1 = p + inner * 0.88, p + inner * 0.88
    d.line((x0, y0, x1, y1), fill=FG, width=int(w * 1.5))
    d.ellipse((x1 - w * 0.75, y1 - w * 0.75, x1 + w * 0.75, y1 + w * 0.75), fill=FG)
    # dấu tích bên trong
    t = [(cx - r * 0.48, cy + r * 0.02), (cx - r * 0.10, cy + r * 0.40), (cx + r * 0.52, cy - r * 0.36)]
    d.line(t, fill=TICK, width=int(w * 1.05), joint='curve')
    for x, y in (t[0], t[2]):
        d.ellipse((x - w * 0.52, y - w * 0.52, x + w * 0.52, y + w * 0.52), fill=TICK)
    return im.resize((size, size), Image.LANCZOS)

draw(192, 0.16, True).save(OUT / 'icon-192.png')
draw(512, 0.16, True).save(OUT / 'icon-512.png')
draw(512, 0.24, False).save(OUT / 'maskable-512.png')
draw(180, 0.14, False).convert('RGB').save(OUT / 'apple-touch-icon.png')
print('icons ->', OUT)

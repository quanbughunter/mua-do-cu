#!/usr/bin/env python3
"""Sinh icon Android từ icons/ (chạy lại khi đổi icon): mipmap-*/ic_launcher.png và ic_launcher_fg.png."""
import pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
ICONS = ROOT.parent / 'icons'
DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
legacy = Image.open(ICONS / 'icon-512.png').convert('RGBA')
fg = Image.open(ICONS / 'maskable-512.png').convert('RGBA')  # phần hình nằm gọn trong vùng an toàn
for d, k in DENS.items():
    out = ROOT / 'res' / f'mipmap-{d}'
    out.mkdir(parents=True, exist_ok=True)
    legacy.resize((round(48 * k),) * 2, Image.LANCZOS).save(out / 'ic_launcher.png', optimize=True)
    fg.resize((round(108 * k),) * 2, Image.LANCZOS).save(out / 'ic_launcher_fg.png', optimize=True)
    print(out.name)

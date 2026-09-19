#!/usr/bin/env python
"""Genera los iconos PWA de Biblioteca: fondo tinta, rombo dorado de la marca."""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(OUT, exist_ok=True)

TINTA = (18, 16, 13, 255)      # #12100d
ORO = (200, 165, 88, 255)      # #c8a558

def rombo(draw, cx, cy, r):
    draw.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=ORO)

def icono(size, maskable=False):
    img = Image.new("RGBA", (size, size), TINTA)
    d = ImageDraw.Draw(img)
    # rombo centrado; en maskable se reduce al 60% (zona segura)
    r = int(size * (0.30 if maskable else 0.38))
    rombo(d, size // 2, size // 2, r)
    return img

for nombre, size, maskable in [
    ("icon-512.png", 512, False),
    ("icon-192.png", 192, False),
    ("icon-512-maskable.png", 512, True),
    ("icon-192-maskable.png", 192, True),
]:
    icono(size, maskable).save(os.path.join(OUT, nombre))
    print("icono:", nombre)

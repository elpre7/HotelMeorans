#!/usr/bin/env python3
"""
Aplica el tratamiento fotográfico que usamos para el hero: baja el look
HDR/saturado típico de las imágenes de banco o generadas, y le devuelve
las imperfecciones que tiene una foto real (rolloff de luces, viñeteo,
grano). Guarda un JPG optimizado.

Requiere: pip install pillow numpy

Uso:
    python3 tools/grade-image.py entrada.png assets/img/hero.jpg
"""
import os
import sys

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

if len(sys.argv) != 3:
    sys.exit(__doc__)

src, dst = sys.argv[1], sys.argv[2]

im = Image.open(src).convert('RGB')
w, h = im.size

# Bajar la saturación general (el look HDR/stock viene de acá).
im = ImageEnhance.Color(im).enhance(0.88)

a = np.asarray(im).astype(np.float32) / 255.0

# Rolloff de altas luces: en una foto real el blanco casi nunca clipea tan limpio.
hi = np.clip((a - 0.75) / 0.25, 0, 1)
a = a - hi * (a - 0.75) * 0.16

# Levantar apenas las sombras, para menos contraste digital duro.
a = a * (1 - 0.045) + 0.045

# Split toning: sombras a frío, luces a cálido.
lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
shadow_mask = np.clip(1 - lum * 1.7, 0, 1)[..., None]
high_mask = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None]
a += shadow_mask * np.array([-0.010, -0.002, 0.014], dtype=np.float32)
a += high_mask * np.array([0.012, 0.004, -0.010], dtype=np.float32)

# Viñeteo leve: imita la caída de luz de una lente real.
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
cx, cy = w / 2, h / 2
r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2) / np.sqrt(2)
a *= (1 - 0.13 * (r ** 2.2))[..., None]

# Grano fino de luminancia: es lo que más rompe el aspecto "plástico".
rng = np.random.default_rng(7)
grain8 = np.clip(rng.normal(128, 40, (h, w)), 0, 255).astype(np.uint8)
grain8 = Image.fromarray(grain8, mode='L').filter(ImageFilter.GaussianBlur(0.5))
grain = np.asarray(grain8).astype(np.float32) - 128.0
grain /= (grain.std() + 1e-6)
# Más grano en medios tonos y casi nada en luces, como la película real.
grain_mask = (1 - np.abs(lum - 0.45) / 0.55).clip(0.15, 1)
a += (grain * 0.011 * grain_mask)[..., None]

out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGB')
out = out.filter(ImageFilter.UnsharpMask(radius=1.4, percent=52, threshold=3))
out.save(dst, quality=92, subsampling=0, optimize=True, progressive=True)

print('%s (%d KB, %dx%d) -> %s (%d KB)' % (
    os.path.basename(src), os.path.getsize(src) / 1024, w, h,
    os.path.basename(dst), os.path.getsize(dst) / 1024,
))

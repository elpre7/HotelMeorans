#!/usr/bin/env python3
"""
Genera los recortes verticales que se sirven en móvil.

Una foto apaisada dentro de una sección de celular se recorta al ~30% central
por el object-fit:cover, así que conviene recortarla a mano y elegir qué parte
de la escena queda a la vista, en vez de dejar que el navegador corte por el
medio. De paso pesan bastante menos.

FOCO es el centro horizontal del recorte, como fracción del ancho (0 = borde
izquierdo, 1 = derecho).

Requiere: pip install pillow

Uso:
    python3 tools/crop-mobile.py
"""
import os

from PIL import Image

RATIO = 0.66  # ancho/alto del recorte
FOCO = {
    'hero': 0.45,      # pileta con el tobogán y la fuente
    'soul': 0.45,      # recepción y la pared roja
    'stay': 0.42,      # la cama con el tapiz floral
    'amenity': 0.45,   # la bandeja con la panera
    'look': 0.50,      # vista aérea, el centro del pueblo
    'location': 0.50,  # la fachada con el cartel
}

base = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')

for nombre, foco in FOCO.items():
    src = os.path.join(base, nombre + '.jpg')
    dst = os.path.join(base, nombre + '-m.jpg')

    im = Image.open(src).convert('RGB')
    w, h = im.size
    cw = round(h * RATIO)
    left = max(0, min(w - cw, round(w * foco - cw / 2)))

    im.crop((left, 0, left + cw, h)).save(
        dst, quality=84, subsampling=0, optimize=True, progressive=True)

    print('%-12s %sx%s (%d KB) -> %s %sx%s (%d KB)' % (
        nombre, w, h, os.path.getsize(src) / 1024,
        os.path.basename(dst), cw, h, os.path.getsize(dst) / 1024))

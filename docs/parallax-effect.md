# Efecto de parallax (`js/parallax.js`)

Reproduce el efecto de scroll de [hoteljoaquin.com](https://hoteljoaquin.com/):
en cada sección de pantalla completa, la imagen de fondo se desplaza más
lento que el resto de la página mientras se hace scroll, y el texto se
mueve a velocidad normal por encima.

## De dónde sale el número 0.25

No es un pin de secciones ni un fundido cruzado — es **parallax de fondo
lineal**, nada más. Se confirmó leyendo el código fuente real del sitio
(corre sobre el theme de WordPress **Uncode**), que expone su configuración
en un `<script>` inline:

```json
"parallax_factor": "0.25",
"mobile_parallax_allowed": ""
```

Es decir: el fondo se traduce en Y a un **cuarto de la velocidad del
scroll**, y el efecto se **desactiva en mobile**. `parallax.js` reproduce
exactamente eso, sin dependencias (nada de GSAP, Lenis, jQuery, etc.).

## Cómo usarla

**1.** Incluí el script una sola vez, en cualquier parte del HTML:

```html
<script src="js/parallax.js"></script>
```

**2.** Marcá cada sección con esta estructura mínima:

```html
<section class="with-parallax" data-parallax-auto>
  <div class="bg-wrapper">
    <div class="bg-inner" style="background-image:url('foto.jpg')"></div>
  </div>
  <div class="row-content">
    <h2>Tu contenido va acá, normal</h2>
  </div>
</section>
```

Con `data-parallax-auto` se activa solo — no hace falta llamar nada a mano.
El CSS necesario (`position`, `overflow`, `transform`) se inyecta
automáticamente la primera vez que se usa.

También funciona con una capa de fondo más simple, una sola `<img>` en vez
del par `bg-wrapper` / `bg-inner`:

```html
<section class="with-parallax" data-parallax-auto>
  <div class="background-wrapper">
    <img src="foto.jpg" alt="">
  </div>
  <div class="row-content">...</div>
</section>
```

El script busca, en orden, `.bg-inner` y después `.background-wrapper`
dentro de cada sección — cualquiera de las dos convenciones sirve.

**3.** Si preferís controlarlo a mano en vez de `data-parallax-auto`:

```html
<script>
  initParallax('.with-parallax', { factor: 0.25 });
</script>
```

## API — `initParallax(selector, options)`

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `selector` | string | `'.with-parallax'` | Selector CSS de las secciones a animar. |
| `options.factor` | number | `0.25` | Fracción de la velocidad del scroll a la que se mueve el fondo. |
| `options.mobileBreakpoint` | number | `767` | Ancho de pantalla (px) por debajo del cual el efecto se desactiva, igual que en el sitio real. |
| `options.bgSelector` | string | `'.bg-inner, .background-wrapper'` | Selector para encontrar la capa que se mueve dentro de cada sección. |

Devuelve una función `destroy()` que saca los listeners, por si necesitás
desactivar el efecto dinámicamente.

## Problemas reales que ya nos pasaron (leer antes de reportar un bug)

Nos costó horas encontrar estas dos, así que quedan documentadas para no
repetir la historia:

### 1. "El efecto no hace nada" pero el código está bien

Si tu sistema operativo o navegador tiene activada la preferencia de
accesibilidad **"reducir movimiento"**, cualquier regla CSS del tipo

```css
@media (prefers-reduced-motion: reduce) {
  .background-wrapper { transform: none !important; }
}
```

anula el `transform` que pone el JS, pase lo que pase. No importa cuánto
arregles el script: si esa regla existe en algún lado del CSS de la
página, el efecto se ve "muerto" solo en las máquinas con esa preferencia
activada. `index.html` de este repo **no** desactiva el efecto por
`prefers-reduced-motion` a propósito — si la volvés a agregar, hacelo
sabiendo que vas a apagar el efecto en tu propia máquina si la tenés
activada (Configuración del sistema → Accesibilidad → Reducir movimiento).

### 2. Se desactiva solo en pantallas angostas

Es intencional (`mobileBreakpoint: 767`, igual que
`mobile_parallax_allowed: ""` en el sitio real) — no es un bug si no ves
movimiento en el celular o con la ventana del navegador achicada.

### 3. Después de actualizar `parallax.js`, sigue el comportamiento viejo

Los navegadores (y el CDN de GitHub Pages) cachean archivos `.js`. Si
cambiás `js/parallax.js`, actualizá también la versión en el `<script>`
que lo carga:

```html
<script src="js/parallax.js?v=3"></script>
```

y pedile a quien esté probando que haga una recarga forzada
(Ctrl/Cmd+Shift+R) o abra una ventana de incógnito.

## Cómo probar el efecto aislado

Si algo no anda en la página completa, antes de tocar nada ahí, probá el
mecanismo solo. Un archivo mínimo de una sola sección con un div de color
sólido y `initParallax` alcanza para confirmar que el script en sí
funciona, sin fotos externas ni CSS de por medio que puedan estar
tapando el resultado. Un HUD en pantalla que muestre `window.innerWidth`,
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` y el
`transform` calculado en vivo hace que cualquier bloqueo (como los dos de
arriba) se vea inmediatamente, en vez de tener que adivinar.

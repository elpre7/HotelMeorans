/**
 * parallax.js — drop this file into any page, no build step, no dependencies.
 *
 * Reproduces hoteljoaquin.com's row background parallax: each section's
 * background image drifts at a fraction of scroll speed while its text
 * content scrolls at normal speed on top. Their site (Uncode WP theme)
 * ships this exact value in its config: SiteParameters.parallax_factor = 0.25
 *
 * ---- Markup (works in ANY page/site) ----
 *   <section class="with-parallax" data-parallax-auto>
 *     <div class="bg-wrapper">
 *       <div class="bg-inner" style="background-image:url('foto.jpg')"></div>
 *     </div>
 *     <div class="row-content">
 *       <h2>Tu texto va acá, con normalidad</h2>
 *     </div>
 *   </section>
 *
 * ---- Usage ----
 * 1) <script src="parallax.js"></script>  (once, anywhere on the page)
 * 2) Either:
 *    a) add `data-parallax-auto` to every section you want the effect on
 *       (it self-initializes on load), or
 *    b) call it yourself for more control:
 *       initParallax('.with-parallax', { factor: 0.25 });
 *
 * The required CSS (position/overflow for the drift to work) is injected
 * automatically — you only write background-image + your content.
 */
(function () {
  'use strict';

  var STYLE_ID = 'parallax-fx-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.with-parallax{position:relative;overflow:hidden;}' +
      '.with-parallax .bg-wrapper{position:absolute;inset:-25% 0;overflow:hidden;}' +
      '.with-parallax .bg-inner{position:absolute;inset:0;background-size:cover;background-position:center;will-change:transform;}' +
      '.with-parallax .row-content{position:relative;z-index:1;}';
    document.head.appendChild(style);
  }

  function initParallax(selector, options) {
    selector = selector || '.with-parallax';
    options = options || {};
    var factor = typeof options.factor === 'number' ? options.factor : 0.25;
    var mobileBreakpoint = typeof options.mobileBreakpoint === 'number' ? options.mobileBreakpoint : 767;

    injectStyles();

    var layers = Array.prototype.map
      .call(document.querySelectorAll(selector), function (row) {
        return { row: row, bg: row.querySelector('.bg-inner') };
      })
      .filter(function (layer) {
        return layer.bg;
      });

    if (!layers.length) return function () {};
    if (window.matchMedia('(max-width: ' + mobileBreakpoint + 'px)').matches) {
      return function () {}; // matches SiteParameters.mobile_parallax_allowed = ""
    }

    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight;
      layers.forEach(function (layer) {
        var rect = layer.row.getBoundingClientRect();
        var distanceFromCenter = rect.top + rect.height / 2 - vh / 2;
        layer.bg.style.transform = 'translate3d(0, ' + (-distanceFromCenter * factor).toFixed(2) + 'px, 0)';
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();

    return function destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }

  window.initParallax = initParallax;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('[data-parallax-auto]')) {
      initParallax('[data-parallax-auto]');
    }
  });
})();

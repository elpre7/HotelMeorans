/**
 * parallax.js
 *
 * Reproduces Hotel Joaquin's row background parallax: each full-height
 * section has a background image that drifts at a fraction of scroll
 * speed while its text content scrolls at normal speed on top. Their
 * site (Uncode WP theme) ships this exact value in its site config:
 *   SiteParameters.parallax_factor === "0.25"
 *
 * Markup expected per section:
 *   <section class="with-parallax">
 *     <div class="bg-wrapper">
 *       <div class="bg-inner" style="background-image:url(...)"></div>
 *     </div>
 *     <div class="row-content">...</div>
 *   </section>
 *
 * Usage:
 *   initParallax('.with-parallax');
 */
function initParallax(selector = '.with-parallax', options = {}) {
  const { factor = 0.25 } = options;

  const layers = Array.from(document.querySelectorAll(selector))
    .map((row) => ({ row, bg: row.querySelector('.bg-inner') }))
    .filter((layer) => layer.bg);

  if (!layers.length) return () => {};

  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    layers.forEach(({ row, bg }) => {
      const rect = row.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - vh / 2;
      bg.style.transform = `translate3d(0, ${(-distanceFromCenter * factor).toFixed(2)}px, 0)`;
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  const mq = window.matchMedia('(max-width: 767px)');
  if (mq.matches) return () => {}; // matches SiteParameters.mobile_parallax_allowed = ""

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', update);
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initParallax };
}

/**
 * scrollCrossfade.js
 *
 * Reproduces the "stacked sections" scroll effect: each full-viewport
 * section pins in place, then fades and shrinks slightly while the next
 * section scrolls up and over it, before releasing to normal scroll.
 *
 * Requires GSAP + ScrollTrigger loaded on the page before this file.
 *
 * Usage:
 *   <section class="fx-section">...</section>
 *   <section class="fx-section">...</section>
 *   <section class="fx-section">...</section>
 *
 *   initScrollCrossfade('.fx-section');
 */
function initScrollCrossfade(selector = '.fx-section', options = {}) {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('initScrollCrossfade: GSAP + ScrollTrigger are required.');
    return () => {};
  }

  const { fadeScale = 0.92, ease = 'none', minWidth = 0 } = options;

  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray(selector);
  const triggers = [];

  const mm = gsap.matchMedia();

  mm.add(`(min-width: ${minWidth}px)`, () => {
    sections.forEach((section, i) => {
      if (i === sections.length - 1) return;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        pin: true,
        pinSpacing: false,
        scrub: true,
        onUpdate(self) {
          gsap.set(section, {
            opacity: 1 - self.progress,
            scale: 1 - self.progress * (1 - fadeScale),
            ease,
          });
        },
        onLeaveBack() {
          gsap.set(section, { opacity: 1, scale: 1 });
        },
      });

      triggers.push(trigger);
    });

    return () => triggers.forEach((trigger) => trigger.kill());
  });

  return () => mm.revert();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initScrollCrossfade };
}

import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Smoothly scroll the window to a target element (by selector or node).
 * `offset` accounts for the fixed-ish nav height.
 */
export function smoothScrollTo(target, offset = 80) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  gsap.to(window, {
    duration: 1,
    ease: 'power2.inOut',
    scrollTo: { y: el, offsetY: offset, autoKill: true },
  });
}

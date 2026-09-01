/* The press lean, from the Broadsheet design system's print-plates driver.
 *
 * The plate constructions on this page (.cmyk-head, .cmyk-num) are pure CSS —
 * they need no SVG separation filters, only the pointer published as bare
 * -1..1 factors (--press-nx / --press-ny), which each construction multiplies
 * into its own em spread in broadsheet.css. The plates drift a breath toward
 * the cursor as it roams the page; the C plate holds.
 *
 * Numbers match the system's driver: 0.22 smoothing on the raw pointer,
 * factors normalized from the viewport center. The driver stands down for
 * reduced motion and for coarse pointers, where the CSS var() fallbacks of 0
 * leave the plates at their resting offsets.
 */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const root = document.documentElement;
  let nx = 0, ny = 0;   // smoothed pointer, -1..1 from viewport center
  let tx = 0, ty = 0;   // raw pointer target
  let raf = 0, last = '';

  const tick = () => {
    raf = 0;
    nx += (tx - nx) * 0.22;   // soften the hand
    ny += (ty - ny) * 0.22;

    // guarded on the computed output — an equal-value write still dirties style
    const key = nx.toFixed(3) + ',' + ny.toFixed(3);
    if (key !== last) {
      last = key;
      root.style.setProperty('--press-nx', nx.toFixed(3));
      root.style.setProperty('--press-ny', ny.toFixed(3));
    }
    if (Math.abs(tx - nx) > 0.002 || Math.abs(ty - ny) > 0.002) schedule();
  };

  const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

  addEventListener('pointermove', (e) => {
    tx = 2 * e.clientX / innerWidth - 1;
    ty = 2 * e.clientY / innerHeight - 1;
    schedule();
  }, { passive: true });
})();

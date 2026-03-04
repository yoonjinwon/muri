(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer =
    typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

  if (prefersReducedMotion || coarsePointer) return;

  const root = document.documentElement;
  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.3;
  let currentX = targetX;
  let currentY = targetY;
  let rafId = 0;
  let active = false;

  function setVisible(visible) {
    root.style.setProperty("--cursor-glow-opacity", visible ? "1" : "0");
  }

  function tick() {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    root.style.setProperty("--cursor-x", currentX + "px");
    root.style.setProperty("--cursor-y", currentY + "px");

    const done = Math.abs(targetX - currentX) < 0.2 && Math.abs(targetY - currentY) < 0.2;
    if (!done || active) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      rafId = 0;
    }
  }

  function ensureTicking() {
    if (!rafId) rafId = window.requestAnimationFrame(tick);
  }

  window.addEventListener(
    "mousemove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      active = true;
      setVisible(true);
      ensureTicking();
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    active = false;
    setVisible(false);
  });

  window.addEventListener(
    "mousedown",
    () => {
      setVisible(true);
      ensureTicking();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      targetX = Math.min(targetX, window.innerWidth);
      targetY = Math.min(targetY, window.innerHeight);
      ensureTicking();
    },
    { passive: true }
  );
})();

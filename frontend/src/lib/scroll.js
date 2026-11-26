import Lenis from "lenis";

export const WHATSAPP_NUMBER = "51957082739";
export const WHATSAPP_DISPLAY = "+51 957 082 739";

export const waLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export const WA_DEFAULT = waLink(
  "Hola MAQSYMA, quiero cotizar un equipo de soldadura."
);

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -64, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  const lenis = new Lenis({
    duration: isFirefox ? 0.85 : 1.15,
    smoothWheel: !isFirefox,
    wheelMultiplier: isFirefox ? 1.2 : 1,
    touchMultiplier: isFirefox ? 1.5 : 2,
  });
  window.__lenis = lenis;
  let rafId;
  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
    window.__lenis = null;
  };
}

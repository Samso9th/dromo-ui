// Centralized GSAP setup for the marketing/landing surface.
// ScrollTrigger ships inside the `gsap` package — no extra dependency needed.
// Everything here is import-safe on the server; the actual animations only ever
// run inside useEffect/gsap.context on the client (see <Reveal /> and <Hero />).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const EASE = "expo.out";
export const EASE_CUBIC = "power4.out";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger };

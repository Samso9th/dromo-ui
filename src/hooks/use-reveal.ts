import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  delay?: number;
  y?: number;
  duration?: number;
}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: opts?.y ?? 8 },
        {
          opacity: 1,
          y: 0,
          duration: opts?.duration ?? 0.5,
          delay: opts?.delay ?? 0,
          ease: "power2.out",
        },
      );
    }, el);
    return () => ctx.revert();
  }, [opts?.delay, opts?.y, opts?.duration]);
  return ref;
}

export function useStagger<T extends HTMLElement = HTMLDivElement>(opts?: {
  selector?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const items = el.querySelectorAll(opts?.selector ?? ":scope > *");
      gsap.fromTo(
        items,
        { opacity: 0, y: opts?.y ?? 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: opts?.stagger ?? 0.06,
        },
      );
    }, el);
    return () => ctx.revert();
  }, [opts?.selector, opts?.stagger, opts?.y]);
  return ref;
}

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, EASE, prefersReducedMotion } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds to delay the tween once it enters the viewport. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
  /** Stagger direct children instead of revealing the element as one block. */
  stagger?: number;
};

/**
 * Scroll-triggered reveal used across the landing + legal pages.
 * SSR-safe: markup renders fully on the server; the animation only runs on the
 * client. Elements start hidden via the `[data-reveal]` CSS rule and are revealed
 * here — with a <noscript>/reduced-motion fallback in styles.css so content is
 * never permanently invisible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 28,
  stagger,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger != null ? Array.from(el.children) : el;

    if (prefersReducedMotion()) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: EASE,
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger]);

  return (
    <Tag
      ref={ref as never}
      data-reveal={stagger != null ? undefined : ""}
      data-reveal-stagger={stagger != null ? "" : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}

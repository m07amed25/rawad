"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GsapStaggerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child */
  stagger?: number;
  /** Overall delay before animation starts */
  delay?: number;
  /** Animation from direction */
  from?: "bottom" | "right" | "left";
}

/**
 * Animates direct children with GSAP stagger.
 * Wraps them in a container and each child slides + fades in.
 */
export function GsapStagger({
  children,
  className,
  stagger = 0.08,
  delay = 0.15,
  from = "bottom",
}: GsapStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.children;
    if (!items.length) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (from === "bottom") fromVars.y = 24;
    if (from === "right") fromVars.x = 24;
    if (from === "left") fromVars.x = -24;

    gsap.set(items, fromVars);

    gsap.to(items, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.5,
      stagger,
      delay,
      ease: "power2.out",
    });
  }, [stagger, delay, from]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

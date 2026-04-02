"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface GsapTextRevealProps {
  children: string;
  className?: string;
  /** Animation style: "chars" splits by character, "words" by word */
  mode?: "chars" | "words";
  /** Stagger delay between each unit */
  stagger?: number;
  /** Overall delay before animation starts */
  delay?: number;
  /** Duration per unit */
  duration?: number;
  /** Direction of the reveal */
  from?: "bottom" | "top" | "right" | "left";
  /** HTML tag to render */
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * GSAP-powered text reveal animation.
 * Splits text into words or characters and staggers them in.
 */
export function GsapTextReveal({
  children,
  className,
  mode = "words",
  stagger = 0.04,
  delay = 0,
  duration = 0.6,
  from = "bottom",
  as: Tag = "span",
}: GsapTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const getFromVars = useCallback(() => {
    const base = { opacity: 0 };
    switch (from) {
      case "bottom":
        return { ...base, y: 30 };
      case "top":
        return { ...base, y: -30 };
      case "right":
        return { ...base, x: 30 };
      case "left":
        return { ...base, x: -30 };
      default:
        return { ...base, y: 30 };
    }
  }, [from]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasAnimated.current) return;
    hasAnimated.current = true;

    const units = container.querySelectorAll(".gsap-text-unit");

    gsap.set(units, getFromVars());

    gsap.to(units, {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      stagger,
      delay,
      ease: "power3.out",
    });
  }, [delay, duration, stagger, getFromVars]);

  const units =
    mode === "chars" ? children.split("") : children.split(/(\s+)/);

  return (
    // @ts-expect-error dynamic tag ref typing
    <Tag ref={containerRef} className={className}>
      {units.map((unit, i) => {
        if (/^\s+$/.test(unit)) {
          return <span key={i}>&nbsp;</span>;
        }
        return (
          <span
            key={i}
            className="gsap-text-unit inline-block"
            style={{ opacity: 0 }}
          >
            {unit}
          </span>
        );
      })}
    </Tag>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Subtle cursor-following glow effect on the form panel.
 * Shows a radial highlight that follows the mouse.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const parent = glow.parentElement;
    if (!parent) return;

    const handleMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(glow, {
        x,
        y,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    const handleEnter = () => {
      gsap.to(glow, { opacity: 1, duration: 0.4 });
    };

    const handleLeave = () => {
      gsap.to(glow, { opacity: 0, duration: 0.4 });
    };

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseenter", handleEnter);
    parent.addEventListener("mouseleave", handleLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("mouseenter", handleEnter);
      parent.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-0"
      style={{
        width: 350,
        height: 350,
        opacity: 0,
        background:
          "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)",
        borderRadius: "50%",
      }}
    />
  );
}

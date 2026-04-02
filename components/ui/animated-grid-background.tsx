"use client";

import { useEffect, useId, useRef } from "react";
import { motion } from "motion/react";

export function AnimatedGridBackground() {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);

  useEffect(() => {
    const paths = pathsRef.current;
    if (!paths.length) return;

    const animate = (path: SVGPathElement, delay: number) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      const keyframes = [
        { strokeDashoffset: length, opacity: 0 },
        { strokeDashoffset: length * 0.5, opacity: 1 },
        { strokeDashoffset: 0, opacity: 0 },
      ];

      const animation = path.animate(keyframes, {
        duration: 4000 + Math.random() * 3000,
        delay,
        iterations: Infinity,
        easing: "ease-in-out",
      });

      return animation;
    };

    const animations = paths.map((path, i) =>
      animate(path, i * 800 + Math.random() * 1500),
    );

    return () => animations.forEach((a) => a.cancel());
  }, []);

  const lines = [
    "M0 120 Q200 80 400 120",
    "M0 200 Q150 240 350 180 Q500 140 600 200",
    "M0 300 Q250 260 450 300",
    "M0 400 Q180 440 380 380 Q520 340 600 400",
    "M50 0 Q90 200 50 400",
    "M200 0 Q160 180 220 350",
    "M400 0 Q440 150 380 320",
    "M550 0 Q510 200 560 400",
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>
        {lines.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              if (el) pathsRef.current[i] = el;
            }}
            d={d}
            stroke={`url(#${id}-grad)`}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0"
          />
        ))}
      </svg>

      {/* Floating orbs */}
      <motion.div
        className="absolute w-32 h-32 bg-white/[0.04] rounded-full blur-xl"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "15%", left: "20%" }}
      />
      <motion.div
        className="absolute w-24 h-24 bg-white/[0.03] rounded-full blur-xl"
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 30, -25, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "20%", right: "15%" }}
      />
    </div>
  );
}

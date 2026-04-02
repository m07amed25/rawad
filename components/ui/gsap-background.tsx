"use client";

import { useEffect, useRef, useId } from "react";
import gsap from "gsap";

/**
 * High-impact GSAP-powered decorative background.
 * Morphing blobs + flowing gradient lines + floating particles.
 */
export function GsapBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<SVGCircleElement[]>([]);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const id = useId();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Morphing blobs ──
      blobsRef.current.forEach((blob, i) => {
        const dur = 6 + i * 2;
        gsap.to(blob, {
          attr: {
            cx: `${30 + Math.random() * 40}%`,
            cy: `${20 + Math.random() * 60}%`,
            r: 80 + Math.random() * 60,
          },
          duration: dur,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 1.5,
        });
        gsap.to(blob, {
          opacity: 0.04 + Math.random() * 0.06,
          duration: dur * 0.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.8,
        });
      });

      // ── Flowing gradient lines ──
      pathsRef.current.forEach((path, i) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });

        const tl = gsap.timeline({ repeat: -1, delay: i * 1.2 });
        tl.to(path, {
          strokeDashoffset: 0,
          opacity: 0.6,
          duration: 2.5 + Math.random() * 1.5,
          ease: "power1.inOut",
        }).to(path, {
          opacity: 0,
          duration: 1.5,
          ease: "power1.in",
        }).set(path, {
          strokeDashoffset: length,
        });
      });

      // ── Floating particles ──
      particlesRef.current.forEach((particle, i) => {
        const w = 2 + Math.random() * 4;
        const h = 2 + Math.random() * 4;
        const bg = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.25})`;
        gsap.set(particle, {
          width: w,
          height: h,
          background: bg,
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
          scale: 0,
          opacity: 0,
        });

        const tl = gsap.timeline({ repeat: -1, delay: i * 0.6 });
        tl.to(particle, {
          scale: 1,
          opacity: 0.6,
          duration: 1.5,
          ease: "power2.out",
        })
          .to(
            particle,
            {
              y: `-=${40 + Math.random() * 80}`,
              x: `+=${(Math.random() - 0.5) * 60}`,
              duration: 3 + Math.random() * 2,
              ease: "none",
            },
            "<",
          )
          .to(
            particle,
            {
              scale: 0,
              opacity: 0,
              duration: 1.5,
              ease: "power2.in",
            },
            "-=1.5",
          );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const lines = [
    "M0 80 Q150 40 300 80 Q450 120 600 80",
    "M0 160 Q200 200 350 150 Q500 100 600 160",
    "M0 260 Q180 220 360 270 Q500 310 600 260",
    "M0 360 Q220 400 400 350 Q520 310 600 360",
    "M0 440 Q160 400 320 450 Q480 490 600 440",
    "M80 0 Q60 150 100 300 Q130 420 80 500",
    "M300 0 Q340 120 280 260 Q240 380 310 500",
    "M520 0 Q480 180 540 320 Q570 430 520 500",
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* SVG layer: blobs + lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient
            id={`${id}-line`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Morphing blobs */}
        {[0, 1, 2].map((i) => (
          <circle
            key={`blob-${i}`}
            ref={(el) => {
              if (el) blobsRef.current[i] = el;
            }}
            cx={`${25 + i * 25}%`}
            cy={`${30 + i * 15}%`}
            r={60 + i * 20}
            fill="rgba(255,255,255,0.04)"
            filter={`url(#${id}-glow)`}
          />
        ))}

        {/* Flowing lines */}
        {lines.map((d, i) => (
          <path
            key={`line-${i}`}
            ref={(el) => {
              if (el) pathsRef.current[i] = el;
            }}
            d={d}
            stroke={`url(#${id}-line)`}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0"
          />
        ))}
      </svg>

      {/* Particle layer */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          ref={(el) => {
            if (el) particlesRef.current[i] = el;
          }}
          className="absolute rounded-full pointer-events-none"
        />
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";

interface GsapFloatingImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Enable mouse-tracking tilt & glow interactivity */
  interactive?: boolean;
}

/**
 * Image that floats with a gentle GSAP-powered hovering motion,
 * scales in on mount, and optionally reacts to mouse movement.
 */
export function GsapFloatingImage({
  src,
  alt,
  className,
  interactive = false,
}: GsapFloatingImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const floatTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Scale-in on mount
      gsap.from(el, {
        scale: 0.6,
        opacity: 0,
        duration: 1.2,
        ease: "back.out(1.6)",
        delay: 0.2,
      });

      // Continuous gentle float
      floatTween.current = gsap.to(el, {
        y: -18,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      // Subtle rotation
      gsap.to(el, {
        rotation: 3,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(ref.current, {
        rotationY: x * 20,
        rotationX: -y * 20,
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.6,
          x: x * 40,
          y: y * 40,
          duration: 0.3,
        });
      }
    },
    [interactive],
  );

  const handleMouseLeave = useCallback(() => {
    if (!interactive || !ref.current) return;
    gsap.to(ref.current, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
      overwrite: "auto",
    });
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        x: 0,
        y: 0,
        duration: 0.4,
      });
    }
  }, [interactive]);

  return (
    <div
      ref={ref}
      className={`relative ${className || ""}`}
      style={{ perspective: interactive ? 800 : undefined }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain drop-shadow-2xl"
        priority
      />
      {interactive && (
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-full pointer-events-none opacity-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      )}
    </div>
  );
}

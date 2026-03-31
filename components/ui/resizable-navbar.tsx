"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState } from "react";
import Image from "next/image";


function smoothScrollTo(targetId: string) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const targetY = el.getBoundingClientRect().top + window.scrollY - 80;
  const startY = window.scrollY;
  const diff = targetY - startY;
  const duration = 800;
  let startTime: number | null = null;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + diff * ease);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 60) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("sticky inset-x-0 top-0 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        boxShadow: visible
          ? "0 4px 32px rgba(120,191,247,0.18), 0 1px 0 rgba(255,255,255,0.15) inset"
          : "none",
        borderColor: visible ? "rgba(120,191,247,0.4)" : "rgba(120,191,247,0)",
        width: visible ? "92%" : "100%",
        y: visible ? 8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full border border-transparent bg-transparent px-4 py-2 lg:flex dark:bg-transparent",
        visible && "bg-white/85 dark:bg-neutral-950/85",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center gap-1 text-sm font-medium lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={(e) => {
            e.preventDefault();
            const id = item.link.replace("#", "");
            smoothScrollTo(id);
            onItemClick?.();
          }}
          className="relative px-4 py-2 transition-colors duration-150 cursor-pointer"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-[#78BFF7]/20 dark:bg-[#78BFF7]/15"
            />
          )}
          <span className="relative z-20 font-semibold text-neutral-700 dark:text-neutral-200 hover:text-[#1a7fc1] transition-colors duration-150">
            {item.name}
          </span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        boxShadow: visible
          ? "0 4px 24px rgba(120,191,247,0.18), 0 1px 0 rgba(255,255,255,0.15) inset"
          : "none",
        width: visible ? "94%" : "100%",
        borderRadius: visible ? "1rem" : "0px",
        paddingInline: visible ? "12px" : "0px",
        y: visible ? 8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col items-center justify-between bg-transparent py-2 lg:hidden",
        visible && "bg-white/85 dark:bg-neutral-950/85",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between px-2 py-1",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl bg-white/95 px-4 py-6 shadow-[0_8px_40px_rgba(120,191,247,0.18),_0_1px_0_rgba(255,255,255,0.2)_inset] border border-[#78BFF7]/20 backdrop-blur-md dark:bg-neutral-950/95 dark:border-[#78BFF7]/10",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#78BFF7]/20 transition-colors duration-150"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <IconX className="text-neutral-700 dark:text-white" />
      ) : (
        <IconMenu2 className="text-neutral-700 dark:text-white" />
      )}
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center gap-2 px-2 py-1"
    >
      <Image
        src="/images/logo.png"
        alt="logo"
        width={44}
        height={44}
        className="rounded-full"
      />
      <span
        className="text-2xl font-black tracking-wide text-neutral-800 dark:text-white"
        style={{ fontFamily: "var(--font-aquatico)" }}
      >
        Rawad
      </span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-5 py-2 rounded-full text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 inline-block text-center select-none";

  const variantStyles = {
    primary:
      "bg-[#78BFF7] text-white shadow-[0_2px_12px_rgba(120,191,247,0.45)] hover:bg-[#5aafe8] hover:shadow-[0_4px_20px_rgba(120,191,247,0.55)]",
    secondary:
      "bg-transparent border border-[#78BFF7]/60 text-neutral-700 hover:bg-[#78BFF7]/10 dark:text-neutral-200 dark:border-[#78BFF7]/40",
    dark: "bg-neutral-900 text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] hover:bg-neutral-700",
    gradient:
      "bg-gradient-to-b from-[#78BFF7] to-[#3a9de0] text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:from-[#5aafe8] hover:to-[#2a8dd0]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

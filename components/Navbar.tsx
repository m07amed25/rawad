"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";

export function Nav() {
  const navItems = [
    {
      name: "تواصل معنا",
      link: "#contactus",
    },
    {
      name: "ساعدني",
      link: "#help",
    },
    {
      name: "لماذا رواد",
      link: "#whyus",
    },
    {
      name: "من نحن",
      link: "#whoisus",
    },
    {
      name: "الواجهة",
      link: "#interface",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Navbar className="fixed top-0 z-50 w-full">
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton href="/auth/sign-up" variant="secondary">
              انشاء حساب
            </NavbarButton>
            <NavbarButton href="/auth/sign-in" variant="primary">
              تسجيل الدخول
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  const id = item.link.replace("#", "");
                  setTimeout(() => {
                    const el = document.getElementById(id);
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
                  }, 150);
                }}
                className="relative text-neutral-600"
              >
                <span className="block font-semibold">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                href="/auth/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                انشاء حساب
              </NavbarButton>
              <NavbarButton
                href="/auth/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                تسجيل الدخول
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </>
  );
}

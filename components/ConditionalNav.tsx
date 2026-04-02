"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Navbar";

export function ConditionalNav() {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/student") || pathname.startsWith("/teacher");
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/welcome") ||
    isDashboard
  ) {
    return null;
  }

  return <Nav />;
}

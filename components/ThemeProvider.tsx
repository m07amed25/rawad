"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const shouldForceLight = pathname === "/" || pathname?.startsWith("/auth");

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={shouldForceLight ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}

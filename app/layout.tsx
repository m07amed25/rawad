import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import { Nav } from "@/components/Navbar";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const aquatico = localFont({
  src: "./fonts/Aquatico-Regular.otf",
  variable: "--font-aquatico",
});

export const metadata: Metadata = {
  title: "RΛWΛD",
  description:
    "نظام الامتحانات الإلكتروني للطلاب وذوي الإعاقة تمنحك الحرية وتدعم احتياجاتك",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar">
      <body className={`${cairo.variable} ${aquatico.variable}`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}

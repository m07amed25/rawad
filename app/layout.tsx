import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import { ConditionalNav } from "@/components/ConditionalNav";
import { Toaster } from "@/components/ui/sonner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const aquatico = localFont({
  src: "./fonts/Aquatico-Regular.otf",
  variable: "--font-aquatico",
});

export const metadata: Metadata = {
  title: {
    default: "RΛWΛD | رواد",
    template: "%s | RΛWΛD",
  },
  description:
    "رواد — نظام الامتحانات الإلكتروني للطلاب وذوي الإعاقة. تمنحك الحرية وتدعم احتياجاتك بأحدث التقنيات لتجربة تعليمية شاملة ومتاحة للجميع.",
  keywords: [
    "رواد",
    "RAWAD",
    "امتحانات إلكترونية",
    "ذوي الإعاقة",
    "تعليم شامل",
    "اختبارات رقمية",
    "إمكانية الوصول",
    "نظام امتحانات",
    "طلاب",
    "تكنولوجيا التعليم",
  ],
  authors: [{ name: "Mohamed Reda" }],
  creator: "Mohamed Reda",
  publisher: "Mohamed Reda",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "RΛWΛD | رواد",
    title: "RΛWΛD | رواد — نظام الامتحانات الإلكتروني",
    description:
      "نظام الامتحانات الإلكتروني للطلاب وذوي الإعاقة. تمنحك الحرية وتدعم احتياجاتك بأحدث التقنيات.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "RΛWΛD — رواد",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RΛWΛD | رواد — نظام الامتحانات الإلكتروني",
    description:
      "نظام الامتحانات الإلكتروني للطلاب وذوي الإعاقة. تمنحك الحرية وتدعم احتياجاتك.",
    images: ["/images/logo.png"],
  },
  metadataBase: new URL("https://rawad-mu.vercel.app"),
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" data-scroll-behavior="smooth">
      <body className={`${cairo.variable} ${aquatico.variable}`}>
        <ConditionalNav />
        {children}
        {/* RTL-friendly Sonner toaster — position top-right maps to top-left in RTL */}
        <Toaster position="top-right" dir="rtl" richColors closeButton />
      </body>
    </html>
  );
}

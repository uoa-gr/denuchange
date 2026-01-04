import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IAG DENUCHANGE Workshop 2026 | Naxos, Greece",
  description:
    "International Association of Geomorphologists DENUCHANGE Working Group Workshop. October 6-9, 2026, Naxos, Greece. Exploring denudation processes, weathering, erosion and mass movements.",
  keywords: [
    "geomorphology",
    "denudation",
    "IAG",
    "DENUCHANGE",
    "workshop",
    "Naxos",
    "Greece",
    "erosion",
    "weathering",
  ],
  authors: [{ name: "NKUA - National & Kapodistrian University of Athens" }],
  openGraph: {
    title: "IAG DENUCHANGE Workshop 2026 | Naxos, Greece",
    description:
      "Join us for the IAG DENUCHANGE Workshop exploring denudation processes. October 6-9, 2026, Naxos, Greece.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
            {children}
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}

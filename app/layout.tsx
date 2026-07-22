import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Bebas_Neue, Cormorant_Garamond, Barlow } from "next/font/google";

const playfair = Playfair_Display({
  variable: "--font-vintage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Blockfuse Vintage",
  description: "Heritage craftsmanship meets modern sophistication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
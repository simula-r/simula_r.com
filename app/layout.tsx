import type { Metadata } from "next";
import { Geist, Reenie_Beanie } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const berkeleyMono = localFont({
  variable: "--font-berkeley-mono",
  src: [
    {
      path: "./fonts/berkeley-mono/BerkeleyMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/berkeley-mono/BerkeleyMono-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/berkeley-mono/BerkeleyMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/berkeley-mono/BerkeleyMono-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

const reenieBeanie = Reenie_Beanie({
  variable: "--font-reenie-beanie",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Simula_r",
  description: "Welcome to Simula_r's whiteboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${berkeleyMono.variable} ${reenieBeanie.variable} h-full w-full antialiased`}
    >
      <body className="w-full h-full">{children}</body>
    </html>
  );
}

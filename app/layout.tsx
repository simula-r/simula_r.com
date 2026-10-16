import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Shantell_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
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

const shantellSans = Shantell_Sans({
  variable: "--font-shantell-sans",
  subsets: ["latin"],
  axes: ["BNCE", "INFM"],
});

export const metadata: Metadata = {
  title: "Simula_r — Jake, Design Engineer",
  description:
    "Jake (a_r) is a Design Engineer in the Bay Area. Take a guided tour of the whiteboard, or hold to take the wheel and explore it yourself.",
  applicationName: "Simula_r",
  authors: [{ name: "Jake" }],
  openGraph: {
    title: "Simula_r — Jake, Design Engineer",
    description:
      "A guided, live-narrated whiteboard tour by Jake (a_r), a Bay Area Design Engineer.",
    siteName: "Simula_r",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Simula_r — Jake, Design Engineer",
    description:
      "A guided, live-narrated whiteboard tour by Jake (a_r), a Bay Area Design Engineer.",
  },
};

export const viewport: Viewport = {
  themeColor: "#262422",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${schibstedGrotesk.variable} ${berkeleyMono.variable} ${shantellSans.variable} h-full w-full antialiased`}
    >
      <body className="w-full h-full">{children}</body>
    </html>
  );
}

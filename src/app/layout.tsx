import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { GoogleTranslate } from "@/components/common/GoogleTranslate";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GramVest — Rural Business Decision Engine | SIH 2026",
  description:
    "AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant for Rural Micro-Entrepreneurs in Punjab, India.",
  keywords: [
    "GramVest",
    "SIH 2026",
    "Rural Entrepreneurship",
    "Punjab Business Advisory",
    "PMEGP Subsidy",
    "Dairy Processing Feasibility",
    "Micro-Enterprise Financial Structuring",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSerif.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#fff8f2] text-[#1d1b18]"
      >
        <GoogleTranslate />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

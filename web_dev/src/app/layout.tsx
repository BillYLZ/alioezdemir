import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Footer, { CtaBand } from "@/components/Footer";
import Header from "@/components/Header";
import { serviceCards } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.oezdemir-die-praxis.de"),
  title: {
    default: "Zahnarztpraxis Özdemir · Endodontie & Zahnerhalt in Peine",
    template: "%s · Zahnarztpraxis Özdemir Peine",
  },
  description:
    "Zahnarztpraxis Ali Özdemir MSc in Peine-Essinghausen: moderne, ganzheitliche Zahnheilkunde mit Schwerpunkt mikroskopische Wurzelkanalbehandlung (Endodontie), Prophylaxe und Zahnersatz.",
  openGraph: { type: "website", locale: "de_DE", siteName: "Zahnarztpraxis Özdemir" },
};

export const viewport: Viewport = { themeColor: "#f8f5f0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${fraunces.variable} ${manrope.variable} antialiased`}>
      <body className="font-sans">
        <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Zum Inhalt springen
        </a>
        <Header services={serviceCards()} />
        <main id="inhalt">{children}</main>
        <CtaBand />
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { SiteFooter } from "@/components/SiteChrome";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.oezdemir-die-praxis.de"),
  title: {
    default: "Zahnarztpraxis Özdemir Peine-Essinghausen",
    template: "%s - Zahnarztpraxis Özdemir Peine-Essinghausen",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${openSans.variable} antialiased`}>
      <body className="font-sans">
        {/* #wrapper: ueber 1260px darf die Header-Welle seitlich herausragen */}
        <div className="mx-auto max-w-[1200px] overflow-hidden xl:overflow-visible">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

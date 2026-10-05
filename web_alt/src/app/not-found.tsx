import Link from "next/link";
import { HeaderVisual, SiteHeader } from "@/components/SiteChrome";
import { headerElements, pages } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <SiteHeader>
        <HeaderVisual elements={headerElements(pages.find((p) => p.url === "/")!)} />
      </SiteHeader>
      <main className="richtext bg-panel p-5 lg:p-10">
        <h1>Seite nicht gefunden</h1>
        <p>Die angeforderte Seite existiert nicht (mehr).</p>
        <p>
          <Link href="/">Zur Startseite</Link>
        </p>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Elements from "@/components/Elements";
import QuickNav from "@/components/QuickNav";
import { HeaderVisual, SideNav, SiteHeader } from "@/components/SiteChrome";
import { headerElements, href, isLeistung, leistungenNav, mainArticles, pageByPath, pages } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.url === "/" ? [] : p.url.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug } = await params;
  const page = pageByPath(slug);
  if (!page) return {};
  return {
    title: page.url === "/" ? { absolute: "Zahnarztpraxis Özdemir Peine-Essinghausen" } : page.pageTitle || page.title,
    description: page.description,
    alternates: { canonical: page.url },
  };
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const page = pageByPath(slug);
  if (!page) notFound();
  if (page.type === "forward") redirect(href(page));

  // Contao-Layout "Leistungen": rechte Spalte 300px, unter 768px stattdessen Quicknav
  const leistung = isLeistung(page);
  const nav = leistung ? leistungenNav() : [];

  const articles = mainArticles(page).map((a) => (
    <section
      key={a.id}
      aria-label={a.title}
      className={
        a.cssClass === "no-padding"
          ? "relative"
          : `relative p-5 lg:p-10 ${a.cssClass === "braun" ? "braun bg-taupe" : ""}`
      }
    >
      <Elements elements={a.elements} />
    </section>
  ));

  return (
    <>
      <SiteHeader>
        <HeaderVisual elements={headerElements(page)} />
      </SiteHeader>
      <div className="bg-panel">
        {leistung ? (
          <div className="md:grid md:grid-cols-[minmax(0,1fr)_300px]">
            <main>
              <QuickNav items={nav} />
              {articles}
            </main>
            <aside className="hidden py-5 pr-5 md:block lg:py-10 lg:pr-10">
              <SideNav items={nav} current={page.url} />
            </aside>
          </div>
        ) : (
          <main>{articles}</main>
        )}
      </div>
    </>
  );
}

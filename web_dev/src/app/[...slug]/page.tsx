/* eslint-disable @next/next/no-img-element -- statischer Export */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Content from "@/components/Content";
import { PhoneIcon } from "@/components/Header";
import HoursTable from "@/components/HoursTable";
import MapConsent from "@/components/MapConsent";
import OpenStatus from "@/components/OpenStatus";
import Reveal from "@/components/Reveal";
import { PRAXIS, SERVICES } from "@/lib/praxis";
import {
  ancestors,
  children,
  headerElements,
  href,
  isLeistung,
  mainArticles,
  pageByPath,
  pages,
  serviceCards,
  withoutTitle,
  type Element,
  type Page,
} from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.filter((p) => p.url !== "/").map((p) => ({ slug: p.url.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const page = pageByPath((await params).slug);
  if (!page) return {};
  return {
    title: page.pageTitle || page.title,
    description: page.description,
    alternates: { canonical: page.url },
  };
}

function headerImage(page: Page): string | undefined {
  const own = SERVICES[page.url]?.image;
  const el = headerElements(page).find((e) => e.type === "image") as Extract<Element, { type: "image" }> | undefined;
  return el?.image?.src ?? own;
}

export default async function SubPage({ params }: PageProps<"/[...slug]">) {
  const page = pageByPath((await params).slug);
  if (!page) notFound();
  if (page.type === "forward") redirect(href(page));

  const leistung = isLeistung(page);
  const parents = ancestors(page).filter((a) => a.type !== "root");
  const image = headerImage(page);
  const isKontakt = page.url === "/kontakt";
  const legal = page.url === "/impressum" || page.url === "/datenschutz";

  const articles = mainArticles(page);
  const sections = articles.map((a, i) => ({
    ...a,
    elements: i === 0 || articles.length === 1 ? withoutTitle(a.elements, page.title) : a.elements,
  }));

  // Leistungen: vorherige / naechste
  const services = serviceCards();
  const top = leistung ? ([page, ...parents].find((p) => services.some((s) => s.url === p.url)) ?? page) : page;
  const idx = services.findIndex((s) => s.url === top.url);
  const next = idx >= 0 ? services[(idx + 1) % services.length] : undefined;
  const subpages = leistung ? children(top.id) : [];

  return (
    <>
      {/* ------------------------------------------------ Seitenkopf */}
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <Reveal className="flex flex-col gap-6">
            <nav aria-label="Brotkrumen" className="text-sm text-stone">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-plum-600">
                    Start
                  </Link>
                </li>
                {parents.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span aria-hidden>/</span>
                    <Link href={href(p)} className="hover:text-plum-600">
                      {p.title}
                    </Link>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-ink">
                  <span aria-hidden>/</span>
                  <span aria-current="page">{page.title}</span>
                </li>
              </ol>
            </nav>
            <h1 className="max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.98] tracking-[-0.035em] text-ink">
              {page.title}
            </h1>
          </Reveal>
          {image && !legal && (
            <Reveal delay={100} className="overflow-hidden rounded-[2.5rem] bg-sand">
              <img src={image} alt="" className="aspect-[16/9] w-full object-cover md:aspect-[21/8]" fetchPriority="high" />
            </Reveal>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ Inhalt */}
      <section className="px-5 pt-16 md:px-8 md:pt-24">
        <div className={`mx-auto grid max-w-7xl gap-16 ${leistung ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : isKontakt ? "lg:grid-cols-2" : ""}`}>
          <div className={`flex min-w-0 flex-col gap-16 ${!leistung && !isKontakt ? "mx-auto w-full max-w-3xl" : ""}`}>
            {sections.map((a) => (
              <Reveal key={a.id} className="flex flex-col gap-10">
                <Content elements={a.elements} />
              </Reveal>
            ))}

            {subpages.length > 0 && (
              <Reveal className="flex flex-col gap-5">
                <h2 className="font-display text-3xl">Mehr zum Thema</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {subpages.map((s) => (
                    <li key={s.url}>
                      <Link
                        href={s.url}
                        aria-current={s.url === page.url ? "page" : undefined}
                        className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-sand bg-white px-5 py-4 font-semibold text-ink transition hover:border-plum-300 aria-[current=page]:border-plum-600 aria-[current=page]:text-plum-600"
                      >
                        {s.title}
                        <span className="text-plum-600 transition-transform group-hover:translate-x-1" aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {next && (
              <Link href={next.url} className="group relative flex items-center gap-6 overflow-hidden rounded-[2rem] bg-ink p-6 text-white md:p-8">
                <img src={next.image} alt="" className="size-20 shrink-0 rounded-2xl object-cover md:size-28" loading="lazy" />
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-xs font-bold tracking-[0.2em] text-plum-300 uppercase">Nächste Leistung</span>
                  <span className="font-display text-3xl md:text-4xl">{next.title}</span>
                </span>
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-xl transition group-hover:bg-plum-600" aria-hidden>
                  →
                </span>
              </Link>
            )}
          </div>

          {leistung && (
            <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
              <nav aria-label="Leistungen" className="rounded-[2rem] border border-sand bg-white p-3">
                <p className="px-3 pt-2 pb-3 text-xs font-bold tracking-[0.2em] text-stone uppercase">Leistungen</p>
                <ul className="flex flex-col">
                  {services.map((s) => {
                    const current = s.url === top.url;
                    return (
                      <li key={s.url}>
                        <Link
                          href={s.url}
                          aria-current={s.url === page.url ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold transition-colors ${
                            current ? "bg-plum-50 text-plum-600" : "text-ink hover:bg-cream"
                          }`}
                        >
                          <img src={s.image} alt="" className="size-9 rounded-xl object-cover" />
                          {s.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="flex flex-col gap-4 rounded-[2rem] bg-plum-600 p-6 text-white">
                <OpenStatus tone="dark" />
                <p className="font-display text-2xl leading-tight">Fragen zu Ihrer Behandlung?</p>
                <a href={PRAXIS.phoneHref} className="flex items-center justify-center gap-2 rounded-full bg-white py-3 font-semibold text-plum-700 transition hover:bg-plum-50">
                  <PhoneIcon className="size-4" /> {PRAXIS.phone}
                </a>
              </div>
            </aside>
          )}

          {isKontakt && (
            <aside className="flex flex-col gap-8">
              <div className="rounded-[2rem] border border-sand bg-white p-6 md:p-8">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-stone uppercase">Heute</p>
                <OpenStatus />
                <div className="mt-4">
                  <HoursTable />
                </div>
              </div>
              <div className="min-h-[24rem] overflow-hidden rounded-[2rem]">
                <MapConsent />
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}

import site from "../../content/site.json";

export type Headline = { tag: string; text: string };

export type ImageData = {
  src: string;
  alt: string;
  title: string;
  caption: string;
  href: string;
  fullsize: boolean;
  floating: string;
  size?: string[];
};

type Base = { id: number; hidden?: boolean; cssClass?: string; headline?: Headline };

export type Column = {
  elements: Element[];
  implicit?: boolean;
  hidden?: boolean;
  large?: string;
};

export type Element =
  | (Base & { type: "text"; html: string; image?: ImageData | null })
  | (Base & { type: "headline" })
  | (Base & { type: "html"; html: string })
  | (Base & { type: "image"; image: ImageData | null })
  | (Base & {
      type: "gallery";
      perRow: number;
      fullsize: boolean;
      images: { src: string; alt: string; title: string; caption: string }[];
    })
  | (Base & { type: "download"; src: string; title: string })
  | (Base & { type: "form"; form?: unknown })
  | (Base & { type: "columns"; large?: string; medium?: string; small?: string; columns: Column[] })
  | (Base & { type: "slider"; delay: number; elements: Element[] })
  | (Base & { type: string; raw: true });

export type Article = {
  id: number;
  title: string;
  column: string;
  published: boolean;
  cssClass?: string;
  elements: Element[];
};

export type Page = {
  id: number;
  pid: number;
  type: string;
  alias: string;
  url: string;
  title: string;
  pageTitle?: string;
  description?: string;
  published: boolean;
  hide: boolean;
  jumpTo?: number;
  sorting: number;
  articles: Article[];
};

export const pages = (site.pages as Page[]).filter((p) => p.published);
export const modules = site.modules as Record<string, { name: string; html: string }>;

const LEISTUNGEN_ID = 5;

export function pageByPath(slug: string[] = []): Page | undefined {
  const url = "/" + slug.map(decodeURIComponent).join("/");
  return pages.find((p) => p.url === url);
}

export function children(pid: number, { includeHidden = false } = {}) {
  return pages
    .filter((p) => p.pid === pid && (includeHidden || !p.hide))
    .sort((a, b) => a.sorting - b.sorting);
}

/** Hauptnavigation (Ebene 1 + 2), wie die Contao-Navigation */
export type NavItem = { title: string; url: string; children: NavItem[] };

export function mainNav(): NavItem[] {
  return children(1).map((p) => ({
    title: p.title,
    url: href(p),
    children: children(p.id).map((c) => ({ title: c.title, url: href(c), children: [] })),
  }));
}

/** Leistungen-Seitennavigation (rechte Spalte), bis Ebene 3 */
export function leistungenNav(): NavItem[] {
  return children(LEISTUNGEN_ID).map((p) => ({
    title: p.title,
    url: href(p),
    children: children(p.id).map((c) => ({ title: c.title, url: href(c), children: [] })),
  }));
}

/** forward-Seiten zeigen auf ihre erste Unterseite */
export function href(p: Page): string {
  if (p.type === "forward") {
    const target = p.jumpTo ? pages.find((x) => x.id === p.jumpTo) : children(p.id)[0];
    if (target) return href(target);
  }
  return p.url;
}

export function ancestors(p: Page): Page[] {
  const out: Page[] = [];
  let cur = pages.find((x) => x.id === p.pid);
  while (cur) {
    out.unshift(cur);
    cur = pages.find((x) => x.id === cur!.pid);
  }
  return out;
}

export function isLeistung(p: Page) {
  return ancestors(p).some((a) => a.id === LEISTUNGEN_ID);
}

/** in der Seite ohne eigenes Header-Bild das der Elternseite verwenden */
export function headerElements(p: Page): Element[] {
  for (const cand of [p, ...ancestors(p).reverse()]) {
    const els = cand.articles
      .filter((a) => a.published && a.column === "header")
      .flatMap((a) => a.elements)
      .filter((e) => !e.hidden);
    if (els.length) return els;
  }
  return pages.find((x) => x.url === "/")!.articles.filter((a) => a.column === "header").flatMap((a) => a.elements);
}

export function mainArticles(p: Page): Article[] {
  return p.articles.filter((a) => a.published && a.column === "main");
}

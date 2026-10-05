import site from "../../content/site.json";
import { SERVICES } from "./praxis";

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

// ------------------------------------------------------------ web2-Helfer


export type ServiceCard = {
  title: string;
  url: string;
  image: string;
  teaser: string;
  icon: string;
  children: { title: string; url: string }[];
};

/** Leistungen in CMS-Reihenfolge, Wurzelkanalbehandlung (Schwerpunkt) zuerst */
export function serviceCards(): ServiceCard[] {
  const list = children(LEISTUNGEN_ID)
    .filter((p) => SERVICES[p.url])
    .map((p) => ({
      title: p.title,
      url: p.url,
      ...SERVICES[p.url],
      children: children(p.id).map((c) => ({ title: c.title, url: c.url })),
    }));
  // WSR haengt im CMS mit eigenem Alias unter Wurzelkanalbehandlung
  return list.sort((a, b) => Number(b.url.includes("wurzel")) - Number(a.url.includes("wurzel")));
}

export function pageById(id: number) {
  return pages.find((p) => p.id === id);
}

/** Alle sichtbaren Elemente einer Seite (flach, inkl. Spalteninhalt) */
export function flatElements(p: Page): Element[] {
  const out: Element[] = [];
  const walk = (els: Element[]) =>
    els.forEach((e) => {
      if (e.hidden) return;
      out.push(e);
      if ("elements" in e && Array.isArray(e.elements)) walk(e.elements as Element[]);
      if ("columns" in e) (e.columns as Column[]).forEach((c) => walk(c.elements));
    });
  walk(mainArticles(p).flatMap((a) => a.elements));
  return out;
}

export type TeamMember = { name: string; role: string; image?: string };

/** Teammitglieder aus der CMS-Teamseite (<h2>Name</h2><p>Rolle</p>) */
export function teamMembers(): TeamMember[] {
  const team = pageById(3);
  if (!team) return [];
  return flatElements(team)
    .filter((e): e is Extract<Element, { type: "text" }> => e.type === "text")
    .map((e): TeamMember | null => {
      const name = e.html.match(/<h2>(.*?)<\/h2>/)?.[1]?.trim();
      const role = e.html.match(/<p>([\s\S]*?)<\/p>/)?.[1]?.replace(/&nbsp;/g, " ").trim();
      const image = e.image?.src.endsWith("/kf.jpg") ? undefined : e.image?.src;
      return name ? { name, role: role ?? "", image } : null;
    })
    .filter((m): m is TeamMember => !!m);
}

/** Vita-Eintraege (<li>Jahr Text</li>) */
export function vita(): { year: string; text: string }[] {
  const p = pageById(18);
  if (!p) return [];
  const html = flatElements(p).find((e) => e.type === "text") as Extract<Element, { type: "text" }> | undefined;
  return [...(html?.html.matchAll(/<li>(.*?)<\/li>/g) ?? [])].map((m) => {
    const t = m[1].replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
    const year = t.match(/^[\d/&\s-]+?(?=\s[A-ZÄÖÜa-z])/)?.[0]?.trim() ?? "";
    return { year, text: t.slice(year.length).trim() };
  });
}

/** Erste Ueberschrift entfernen, wenn sie den Seitentitel wiederholt (Titel steht im Seitenkopf) */
export function withoutTitle(elements: Element[], title: string): Element[] {
  let done = false;
  const norm = (s: string) => s.toLowerCase().replace(/<[^>]+>|&[a-z]+;/g, "").replace(/[^a-zäöüß]/g, "");
  const same = (s: string) => {
    const a = norm(s), b = norm(title);
    return a === b || a.startsWith(b) || b.startsWith(a);
  };
  const visit = (els: Element[]): Element[] =>
    els.map((e) => {
      if (done || e.hidden) return e;
      if ("columns" in e) return { ...e, columns: (e.columns as Column[]).map((c) => ({ ...c, elements: visit(c.elements) })) };
      if (e.type === "headline" || e.type === "text" || e.type === "gallery") {
        let out = e;
        if (e.headline && same(e.headline.text)) {
          out = { ...out, headline: undefined };
          done = true;
        }
        if (!done && out.type === "text") {
          const t = out as Extract<Element, { type: "text" }>;
          const m = t.html.match(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>/);
          if (m && same(m[1])) {
            out = { ...t, html: t.html.slice(m[0].length) };
            done = true;
          }
        }
        if (out.type === "headline" && !out.headline) return { ...out, hidden: true };
        done = true;
        return out;
      }
      return e;
    });
  return visit(elements);
}

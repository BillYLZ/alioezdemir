/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ElementView } from "./Elements";
import MainNav from "./MainNav";
import { mainNav, type Element, type NavItem } from "@/lib/site";

export const PRAXIS = {
  name: "Zahnarztpraxis Ali Özdemir MSc",
  street: "Kunzendorfer Str. 6",
  city: "31224 Peine-Essinghausen",
  phone: "05171 - 581 320",
  phoneHref: "tel:+495171581320",
};

/**
 * Contao-Header (mod_grouped): ab 971px halbtransparent ueber dem Header-Bild,
 * darunter normal im Fluss. Positionen 1:1 aus master.less.
 */
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const phone = (
    <strong>
      T. <a href={PRAXIS.phoneHref}>{PRAXIS.phone}</a>
    </strong>
  );
  return (
    <header className="relative">
      <div className="relative z-[100] bg-white lg:absolute lg:inset-x-0 lg:top-0 lg:bg-white/90">
        <div className="pb-5 text-center md:pb-[30px] md:pl-5 md:text-left mid:pb-5 lg:pl-[60px]">
          <Link href="/" className="inline-block">
            <img src="/files/oezdemirTheme/logo.png" alt="Zahnarztpraxis Özdemir" width={267} height={109} />
          </Link>
        </div>

        <div className="mod_contact text-center md:absolute md:top-12 md:right-5 md:text-right text-[0.9em] mid:top-[30px] mid:text-[1em] lg:right-[60px]">
          <div className="hidden xs:block">
            <p>
              {PRAXIS.street} | {PRAXIS.city} | {phone}
            </p>
            <p>Sprechzeiten: Mo: 8-17 Uhr | Di, Do: 8-13 und 15-19 Uhr | Mi, Fr: 8-13 Uhr</p>
          </div>
          <div className="xs:hidden">
            <p>
              {PRAXIS.street} | {PRAXIS.city}
              <br />
              {phone}
            </p>
            <p>
              Sprechzeiten: Mo: 8-17 Uhr | Di, Do: 8-13 und 15-19 Uhr
              <br />
              Mi, Fr: 8-13 Uhr
            </p>
          </div>
        </div>

        <MainNav items={mainNav()} />

        <div aria-hidden className="mod_artwork1" />
      </div>
      {children}
    </header>
  );
}

export function HeaderVisual({ elements }: { elements: Element[] }) {
  const el = elements[0];
  if (!el) return null;
  if (el.type === "image") {
    const img = (el as Extract<Element, { type: "image" }>).image;
    if (!img) return null;
    return (
      <figure className="relative">
        <img src={img.src} alt={img.alt || ""} className="block aspect-[1200/532] w-full object-cover" fetchPriority="high" />
        {img.caption && (
          <figcaption className="header-caption hidden md:block" dangerouslySetInnerHTML={{ __html: img.caption }} />
        )}
      </figure>
    );
  }
  return <ElementView el={el} />;
}

/** rechte Spalte "Unsere Leistungen" (Contao-Modul 9): alle Ebenen offen */
export function SideNav({ items, current }: { items: NavItem[]; current: string }) {
  const link = (it: NavItem) => {
    const active = current === it.url;
    const trail = active || current.startsWith(it.url + "/");
    return (
      <Link href={it.url} aria-current={active ? "page" : undefined} className={trail ? "trail" : undefined}>
        {it.title}
      </Link>
    );
  };
  return (
    <nav aria-labelledby="sidenav-title" className="sidenav">
      <h3 id="sidenav-title">Unsere Leistungen</h3>
      <ul>
        {items.map((it) => (
          <li key={it.url}>
            {link(it)}
            {it.children.length > 0 && (
              <ul>
                {it.children.map((c) => (
                  <li key={c.url}>{link(c)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="p-2.5 text-right lg:px-2.5 lg:py-[30px]">
      <p className="m-0 text-[0.7em] xs:text-[0.923em] [&_a]:text-ink">
        © {PRAXIS.name} &nbsp;|&nbsp; <Link href="/datenschutz">Datenschutz</Link> &nbsp;|&nbsp;{" "}
        <Link href="/impressum">Impressum</Link>
      </p>
    </footer>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PRAXIS } from "@/lib/praxis";

export type MenuService = { title: string; url: string; image: string; teaser: string; children: { title: string; url: string }[] };

const NAV = [
  { title: "Praxis", url: "/#praxis" },
  { title: "Leistungen", url: "/leistungen/wurzelkanalbehandlung", mega: true },
  { title: "Team", url: "/team" },
  { title: "Für Kollegen", url: "/kollegen" },
  { title: "News", url: "/News" },
  { title: "Kontakt", url: "/kontakt" },
];

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className={`size-9 ${light ? "text-white" : "text-plum-600"}`} aria-hidden>
        {/* stilisierter Zahn */}
        <path
          d="M20 6c-3.2-2.4-8.8-2.6-11.2.8-2.6 3.6-1.4 8.8.6 13.2 1.2 2.7 1.6 6 2.2 9.6.6 3.5 1.6 5.4 3 5.4 1.8 0 2.2-3.4 2.8-6.6.4-2.2 1.2-3.6 2.6-3.6s2.2 1.4 2.6 3.6c.6 3.2 1 6.6 2.8 6.6 1.4 0 2.4-1.9 3-5.4.6-3.6 1-6.9 2.2-9.6 2-4.4 3.2-9.6.6-13.2C28.8 3.4 23.2 3.6 20 6z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M14 11.5c1.8-1 4-.8 6 .6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.6rem] tracking-tight ${light ? "text-white" : "text-ink"}`}>Özdemir</span>
        <span className={`mt-1 text-[10px] font-bold tracking-[0.22em] uppercase ${light ? "text-white/60" : "text-stone"}`}>
          Zahnarztpraxis · Peine
        </span>
      </span>
    </span>
  );
}

export default function Header({ services }: { services: MenuService[] }) {
  const path = usePathname().replace(/\.html$/, "") || "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menues bei Seitenwechsel schliessen (waehrend des Renderns, ohne Effect)
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setMobile(false);
    setMega(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const active = (url: string) =>
    url.startsWith("/leistungen") ? path.startsWith("/leistungen") || path === "/WSR" : url !== "/#praxis" && path.startsWith(url);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-500 ${
        // backdrop-filter wuerde das fixe Mobil-Menue auf die Header-Box begrenzen
        mobile
          ? "bg-cream py-3"
          : scrolled || mega
            ? "bg-cream/85 py-3 shadow-[0_1px_0_rgba(29,23,34,0.06)] backdrop-blur-xl"
            : "py-5"
      }`}
      onMouseLeave={() => setMega(false)}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" aria-label="Startseite Zahnarztpraxis Özdemir">
          <Wordmark />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.title}>
                {item.mega ? (
                  <button
                    type="button"
                    aria-expanded={mega}
                    aria-controls="mega"
                    onMouseEnter={() => setMega(true)}
                    onClick={() => setMega((m) => !m)}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors hover:bg-plum-100 ${active(item.url) ? "text-plum-600" : "text-ink"}`}
                  >
                    {item.title}
                    <svg viewBox="0 0 16 16" className={`size-3.5 transition-transform ${mega ? "rotate-180" : ""}`} aria-hidden>
                      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.url}
                    onMouseEnter={() => setMega(false)}
                    aria-current={path === item.url ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors hover:bg-plum-100 ${active(item.url) ? "text-plum-600" : "text-ink"}`}
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={PRAXIS.phoneHref}
            className="group hidden items-center gap-2.5 rounded-full bg-ink py-2.5 pr-5 pl-2.5 text-sm font-semibold text-white transition-colors hover:bg-plum-700 sm:flex"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform group-hover:rotate-12">
              <PhoneIcon className="size-3.5" />
            </span>
            {PRAXIS.phone}
          </a>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-sm lg:hidden"
            aria-label={mobile ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobile}
            onClick={() => setMobile((m) => !m)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {mobile ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mega-Menue Leistungen */}
      <div
        id="mega"
        className={`absolute inset-x-0 top-full hidden origin-top transition-all duration-300 lg:block ${
          mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-[1.2fr_2fr] gap-8 rounded-3xl bg-white p-6 shadow-2xl shadow-plum-950/10">
            {services[0] && (
              <Link href={services[0].url} className="group relative overflow-hidden rounded-2xl">
                <img src={services[0].image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-plum-950/90 via-plum-950/30 to-transparent" />
                <span className="relative flex h-full min-h-72 flex-col justify-end gap-2 p-6 text-white">
                  <span className="text-xs font-bold tracking-[0.2em] text-plum-300 uppercase">Schwerpunkt</span>
                  <span className="font-display text-3xl">{services[0].title}</span>
                  <span className="text-sm text-white/75">{services[0].teaser}</span>
                </span>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 py-2">
              {services.map((s) => (
                <Link key={s.url} href={s.url} className="group flex items-center gap-4 rounded-xl p-2.5 transition-colors hover:bg-plum-50">
                  <img src={s.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
                  <span className="flex flex-col">
                    <span className="font-semibold text-ink group-hover:text-plum-600">{s.title}</span>
                    <span className="line-clamp-1 text-sm text-muted">{s.teaser}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobil-Menue */}
      <div
        className={`fixed inset-0 top-0 -z-10 flex flex-col overflow-y-auto bg-cream px-5 pt-24 pb-10 transition-[opacity,visibility] duration-300 lg:hidden ${
          mobile ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="flex flex-col">
          {NAV.filter((n) => !n.mega).map((item) => (
            <li key={item.title} className="border-b border-sand">
              <Link href={item.url} onClick={() => setMobile(false)} className="block py-4 font-display text-3xl text-ink">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 mb-3 text-xs font-bold tracking-[0.2em] text-stone uppercase">Leistungen</p>
        <ul className="grid grid-cols-2 gap-2">
          {services.map((s) => (
            <li key={s.url}>
              <Link href={s.url} onClick={() => setMobile(false)} className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink">
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
        <a href={PRAXIS.phoneHref} className="mt-8 flex items-center justify-center gap-3 rounded-full bg-plum-600 py-4 font-semibold text-white">
          <PhoneIcon className="size-4" /> {PRAXIS.phone}
        </a>
      </div>
    </header>
  );
}

export function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

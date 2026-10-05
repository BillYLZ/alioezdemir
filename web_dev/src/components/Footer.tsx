import Link from "next/link";
import { PRAXIS, SERVICES } from "@/lib/praxis";
import { pages } from "@/lib/site";
import { PhoneIcon, Wordmark } from "./Header";
import HoursTable from "./HoursTable";
import OpenStatus from "./OpenStatus";
import Reveal from "./Reveal";

export function CtaBand() {
  return (
    <section className="mt-24 px-3 md:mt-32 md:px-5">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-plum-600 px-6 py-16 text-white md:px-16 md:py-20">
        <div aria-hidden className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-plum-500/60 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-20 size-[24rem] rounded-full bg-plum-800/70 blur-3xl" />
        <div className="relative flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-5">
            <OpenStatus tone="dark" />
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
              Lassen Sie uns Ihren Zahn <em className="text-plum-300">erhalten</em>.
            </h2>
            <p className="max-w-lg text-lg text-white/75">
              Termine nur nach vorheriger telefonischer Absprache – wir nehmen uns Zeit für Ihr Anliegen.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href={PRAXIS.phoneHref}
              className="flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-plum-700 transition hover:bg-plum-50"
            >
              <PhoneIcon className="size-4" /> {PRAXIS.phone}
            </a>
            <a
              href={`mailto:${PRAXIS.email}`}
              className="rounded-full border border-white/30 px-7 py-4 text-center font-semibold text-white transition hover:bg-white/10"
            >
              E-Mail schreiben
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Footer() {
  const services = Object.keys(SERVICES)
    .map((url) => pages.find((p) => p.url === url))
    .filter(Boolean);
  return (
    <footer className="mt-24 bg-plum-950 text-white/70 md:mt-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-20 pb-10 md:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div className="flex flex-col gap-6">
          <Wordmark light />
          <p className="max-w-xs text-sm leading-relaxed">
            Zahnerhalt mit Konzept. Moderne, ganzheitliche Zahnheilkunde mit Schwerpunkt mikroskopische Endodontie –
            seit 2001 in Peine-Essinghausen.
          </p>
          <address className="flex flex-col gap-1 text-sm not-italic">
            <span className="text-white">{PRAXIS.name}</span>
            <span>{PRAXIS.street}</span>
            <span>{PRAXIS.city}</span>
          </address>
        </div>

        <nav aria-label="Leistungen" className="flex flex-col gap-4">
          <p className="text-xs font-bold tracking-[0.2em] text-white uppercase">Leistungen</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {services.map((p) => (
              <li key={p!.url}>
                <Link href={p!.url} className="transition-colors hover:text-white">
                  {p!.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Praxis" className="flex flex-col gap-4">
          <p className="text-xs font-bold tracking-[0.2em] text-white uppercase">Praxis</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              ["Team", "/team"],
              ["Vita Ali Özdemir", "/team/vita-ali-oezdemir"],
              ["Für Kollegen", "/kollegen"],
              ["News", "/News"],
              ["Kontakt & Anfahrt", "/kontakt"],
            ].map(([t, u]) => (
              <li key={u}>
                <Link href={u} className="transition-colors hover:text-white">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold tracking-[0.2em] text-white uppercase">Sprechzeiten</p>
          <div className="text-sm">
            <HoursTable tone="dark" />
          </div>
          <a href={PRAXIS.phoneHref} className="font-display text-2xl text-white transition-colors hover:text-plum-300">
            {PRAXIS.phone}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} {PRAXIS.name}</p>
          <p className="flex gap-6">
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

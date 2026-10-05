/* eslint-disable @next/next/no-img-element -- statischer Export */
import Link from "next/link";
import { PhoneIcon } from "@/components/Header";
import HoursTable from "@/components/HoursTable";
import MapConsent from "@/components/MapConsent";
import OpenStatus from "@/components/OpenStatus";
import Reveal from "@/components/Reveal";
import { CREDENTIALS, PRAXIS } from "@/lib/praxis";
import { children, pageById, serviceCards, teamMembers, vita } from "@/lib/site";

const MILESTONES = ["1993 - 1998", "08/2001", "2006 - 2008", "2009 - 2011", "2010", "03/2015"];

export default function Home() {
  const services = serviceCards();
  const [featured, ...rest] = services;
  const team = teamMembers();
  const milestones = vita().filter((v) => MILESTONES.includes(v.year) && !/Kongress/.test(v.text));
  const wurzel = pageById(12)!;
  const endoTopics = children(wurzel.id);

  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section className="relative overflow-hidden px-5 pt-32 pb-20 md:px-8 md:pt-40 lg:pb-28">
        <div aria-hidden className="absolute top-20 -right-40 size-[40rem] rounded-full bg-plum-100 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-8 lg:col-span-6">
            <Reveal>
              <span className="inline-flex rounded-full border border-sand bg-white/70 px-4 py-2 backdrop-blur">
                <OpenStatus />
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-[clamp(2.9rem,6.6vw,6rem)] leading-[0.95] tracking-[-0.035em] text-ink">
                Die eigenen Zähne sind die <em className="text-plum-600">besten</em> Implantate.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="max-w-xl text-lg leading-relaxed text-muted md:text-xl">
                Moderne, ganzheitliche Zahnheilkunde in Peine-Essinghausen – spezialisiert auf Zahnerhaltung, professionelle
                Prophylaxe, hochwertigen Zahnersatz und mikroskopische Wurzelkanalbehandlung.
              </p>
            </Reveal>
            <Reveal delay={240} className="flex flex-wrap gap-3">
              <a
                href={PRAXIS.phoneHref}
                className="group flex items-center gap-3 rounded-full bg-plum-600 py-2 pr-7 pl-2 font-semibold text-white shadow-xl shadow-plum-600/25 transition hover:bg-plum-700"
              >
                <span className="grid size-10 place-items-center rounded-full bg-white/15 transition-transform group-hover:rotate-12">
                  <PhoneIcon className="size-4" />
                </span>
                Termin vereinbaren
              </a>
              <Link
                href="#leistungen"
                className="flex items-center gap-2 rounded-full border border-ink/15 px-7 py-4 font-semibold text-ink transition hover:border-ink/40 hover:bg-white"
              >
                Leistungen entdecken <span aria-hidden>↓</span>
              </Link>
            </Reveal>
            <Reveal delay={320} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {["/files/startseite/portrait-dr-oezdemir.jpg", ...team.filter((t) => t.image).map((t) => t.image!)].slice(0, 4).map((src) => (
                  <img key={src} src={src} alt="" className="size-11 rounded-full border-2 border-cream object-cover object-top" />
                ))}
              </div>
              <p className="text-sm leading-snug text-muted">
                <strong className="block text-ink">Seit 2001 in Peine</strong>
                Ihr Praxisteam um Ali Özdemir MSc
              </p>
            </Reveal>
          </div>

          <div className="relative lg:col-span-6">
            <Reveal className="relative mx-auto max-w-xl">
              <div className="overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] bg-sand shadow-2xl shadow-plum-950/15">
                <img
                  src="/files/header/_LHA0225h.jpg"
                  alt="Lachender Vater mit Sohn – Patienten der Zahnarztpraxis Özdemir"
                  className="aspect-[4/5] w-full object-cover object-[60%_center]"
                  fetchPriority="high"
                />
              </div>
              {/* rotierendes Siegel */}
              <div className="absolute -top-4 -left-4 grid size-32 place-items-center rounded-full bg-cream shadow-xl md:-left-10 md:size-36">
                <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite] text-ink motion-reduce:animate-none" aria-hidden>
                  <defs>
                    <path id="circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                  </defs>
                  <text className="fill-current text-[9.5px] font-bold tracking-[0.2em] uppercase">
                    <textPath href="#circle">Zahnerhalt · Endodontie · Mikroskop ·</textPath>
                  </text>
                </svg>
                <img src="/files/header/_LHA0323.jpg" alt="" className="size-16 rounded-full object-cover md:size-20" />
              </div>
              {/* Qualifikations-Karte */}
              <div className="absolute right-4 -bottom-8 left-4 flex items-center gap-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:right-auto md:-left-12 md:max-w-sm">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-plum-600 text-white">
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M12 3 2 8l10 5 10-5-10-5z" />
                    <path d="M6 10v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
                  </svg>
                </span>
                <p className="text-sm leading-snug text-muted">
                  <strong className="block text-ink">Certified in Microendodontics</strong>
                  and Endodontic Microsurgery · University of Pennsylvania
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Credentials */}
      <section aria-label="Qualifikationen" className="overflow-hidden border-y border-sand bg-white py-6">
        <div className="flex w-max animate-marquee gap-12 motion-reduce:animate-none">
          {[...CREDENTIALS, ...CREDENTIALS].map((c, i) => (
            <span key={i} className="flex items-center gap-12 font-display text-xl whitespace-nowrap text-ink/80 md:text-2xl" aria-hidden={i >= CREDENTIALS.length}>
              {c}
              <span className="text-plum-300">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Philosophie */}
      <section id="praxis" className="scroll-mt-24 px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <figure className="relative">
              <img
                src="/files/startseite/portrait-dr-oezdemir.jpg"
                alt="Zahnarzt Ali Özdemir MSc"
                className="aspect-[4/5] w-full rounded-[2.5rem] object-cover object-[30%_center]"
                loading="lazy"
              />
              <figcaption className="absolute right-6 bottom-6 left-6 rounded-2xl bg-ink/80 p-4 text-sm text-white/80 backdrop-blur-md">
                <strong className="block font-display text-lg font-normal text-white">Ali Özdemir, MSc</strong>
                Zahnarzt · Master of Science Endodontie
              </figcaption>
            </figure>
          </Reveal>
          <div className="flex flex-col justify-center gap-10 lg:col-span-6 lg:col-start-7">
            <Reveal className="flex flex-col gap-6">
              <span className="eyebrow">Unsere Philosophie</span>
              <h2 className="font-display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[1.02] tracking-[-0.03em]">
                Zahnerhalt <em className="text-plum-600">vor</em> Zahnersatz.
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                Unser Ziel ist es, gemeinsam mit Ihnen ein Behandlungskonzept nach Ihren Wünschen und Bedürfnissen zu
                erarbeiten. Wir sichern Ihnen die Umsetzung dieses Konzepts auf qualitativ hohem zahnmedizinischen Niveau zu.
              </p>
            </Reveal>
            <ul className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Gemeinsam geplant", "Ihr Behandlungskonzept entsteht im Gespräch mit Ihnen."],
                ["02", "Hohe Qualität", "Moderne Methoden, präzise umgesetzt."],
                ["03", "Ganzheitlich", "Vorsorge, Erhalt und Ersatz aus einer Hand."],
              ].map(([n, t, d], i) => (
                <Reveal as="li" key={n} delay={i * 90} className="flex flex-col gap-3 rounded-3xl border border-sand bg-white p-6">
                  <span className="font-display text-3xl text-plum-300">{n}</span>
                  <strong className="text-ink">{t}</strong>
                  <span className="text-sm leading-relaxed text-muted">{d}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Leistungen (Bento) */}
      <section id="leistungen" className="scroll-mt-24 px-5 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex flex-col gap-5">
              <span className="eyebrow">Leistungen</span>
              <h2 className="max-w-2xl font-display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[1.02] tracking-[-0.03em]">
                Alles für gesunde Zähne – mit klarem <em className="text-plum-600">Schwerpunkt</em>.
              </h2>
            </div>
          </Reveal>

          <div className="grid auto-rows-[minmax(16rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Reveal className="md:col-span-2 lg:row-span-2">
              <Link href={featured.url} className="group relative flex h-full min-h-[28rem] overflow-hidden rounded-[2rem] bg-plum-900">
                <img src={featured.image} alt="" className="absolute inset-0 size-full object-cover opacity-80 transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-0 bg-gradient-to-t from-plum-950 via-plum-950/40 to-transparent" />
                <span className="relative mt-auto flex flex-col gap-4 p-8 text-white md:p-10">
                  <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-[0.18em] uppercase backdrop-blur">Schwerpunkt</span>
                  <span className="min-w-0 font-display text-[1.6rem] sm:text-4xl md:text-5xl">{featured.title}</span>
                  <span className="max-w-md text-white/75">{featured.teaser}</span>
                  <span className="mt-2 flex items-center gap-2 font-semibold">
                    Mehr erfahren <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </Link>
            </Reveal>
            {rest.map((s, i) => (
              <Reveal key={s.url} delay={(i % 2) * 90} className={i === 0 || i === 1 ? "" : ""}>
                <Link
                  href={s.url}
                  className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-sand bg-white transition-shadow duration-500 hover:shadow-2xl hover:shadow-plum-900/10"
                >
                  <span className="relative h-40 overflow-hidden">
                    <img src={s.image} alt="" className="size-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" loading="lazy" />
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-6">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-2xl text-ink">{s.title}</span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-plum-50 text-plum-600 transition group-hover:bg-plum-600 group-hover:text-white" aria-hidden>
                        →
                      </span>
                    </span>
                    <span className="text-sm leading-relaxed text-muted">{s.teaser}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
            <Reveal className="md:col-span-2">
              <a
                href={PRAXIS.phoneHref}
                className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[2rem] bg-plum-100 p-8 md:flex-row md:items-end"
              >
                <span aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-plum-300/40 blur-2xl transition-transform duration-700 group-hover:scale-125" />
                <span className="relative flex flex-col gap-3">
                  <OpenStatus />
                  <span className="max-w-sm font-display text-3xl leading-tight text-ink md:text-4xl">
                    Welche Behandlung passt zu Ihnen? Sprechen Sie mit uns.
                  </span>
                </span>
                <span className="relative flex w-fit items-center gap-3 rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition group-hover:bg-plum-700">
                  <PhoneIcon className="size-4" /> {PRAXIS.phone}
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Endodontie */}
      <section className="px-3 md:px-5">
        <div className="relative mx-auto max-w-[96rem] overflow-hidden rounded-[2.5rem] bg-plum-950 text-white">
          <img src="/files/header/_LHA0323.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity" loading="lazy" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-plum-950 via-plum-950/85 to-plum-950/30" />
          <div className="relative mx-auto grid max-w-7xl gap-16 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-2">
            <Reveal className="flex flex-col gap-8">
              <span className="eyebrow !text-plum-300">Schwerpunkt Endodontie</span>
              <h2 className="font-display text-[clamp(2.4rem,4.5vw,4.4rem)] leading-[1.02] tracking-[-0.03em]">
                Präzision, die man erst unter dem <em className="text-plum-300">Mikroskop</em> sieht.
              </h2>
              <p className="max-w-lg text-lg leading-relaxed text-white/70">
                Mit Operationsmikroskop, Kofferdam und rotierenden Nickel-Titan-Feilen behandeln wir Wurzelkanäle nach neuester
                Methodik. Abhängig von der klinischen Ausgangssituation können so bis zu 90 % der behandlungsbedürftigen
                Zähne erhalten werden.
              </p>
              <div className="flex items-end gap-5 border-t border-white/15 pt-8">
                <span className="font-display text-7xl leading-none text-white md:text-8xl">90%</span>
                <span className="max-w-[14rem] pb-2 text-sm text-white/60">der behandlungsbedürftigen Zähne können erhalten werden*</span>
              </div>
              <p className="text-xs text-white/40">* abhängig von der klinischen Ausgangssituation</p>
            </Reveal>
            <Reveal delay={120}>
              <ol className="flex flex-col">
                {endoTopics.map((t, i) => (
                  <li key={t.url} className="border-b border-white/10 first:border-t">
                    <Link href={t.url} className="group flex items-center gap-6 py-5 transition-colors hover:text-plum-300">
                      <span className="font-display text-sm text-white/40 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-lg font-semibold md:text-xl">{t.title}</span>
                      <span className="translate-x-0 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Vita */}
      <section className="px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto flex max-w-7xl flex-col gap-14">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex flex-col gap-5">
              <span className="eyebrow">Werdegang</span>
              <h2 className="max-w-2xl font-display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[1.02] tracking-[-0.03em]">
                Von Hannover bis <em className="text-plum-600">Philadelphia</em>.
              </h2>
            </div>
            <Link href="/team/vita-ali-oezdemir" className="font-semibold text-plum-600 underline decoration-plum-300 underline-offset-4 hover:decoration-plum-600">
              Gesamte Vita ansehen →
            </Link>
          </Reveal>
          <ol className="relative grid gap-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
            <span aria-hidden className="absolute top-[0.45rem] right-0 left-0 hidden h-px bg-sand lg:block" />
            {milestones.map((m, i) => (
              <Reveal as="li" key={m.year + m.text} delay={i * 70} className="relative flex flex-col gap-3">
                <span className="relative size-4 rounded-full border-4 border-cream bg-plum-600 ring-1 ring-plum-300" />
                <span className="font-display text-2xl text-ink">{m.year.replace(" - ", "–")}</span>
                <span className="text-sm leading-relaxed text-muted">{m.text.replace(/\s*"[^"]*"\s*$/, "")}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ Team */}
      <section className="px-5 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <Reveal className="relative overflow-hidden rounded-[2.5rem]">
            <img src="/files/header/_LHA0125h.jpg" alt="Das Praxisteam der Zahnarztpraxis Özdemir vor der Praxis" className="aspect-[4/5] w-full object-cover sm:aspect-[16/9] md:aspect-[21/9]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-950/80 via-transparent to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 flex flex-col justify-between gap-4 text-white md:right-12 md:bottom-12 md:left-12 md:flex-row md:items-end">
              <h2 className="font-display text-4xl leading-none tracking-tight md:text-6xl">Ihr Team in Peine</h2>
              <Link href="/team" className="w-fit rounded-full bg-white px-6 py-3 font-semibold text-ink transition hover:bg-plum-100">
                Team kennenlernen →
              </Link>
            </div>
          </Reveal>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {team.map((m, i) => (
              <Reveal as="li" key={m.name} delay={i * 80} className="flex flex-col gap-4">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="aspect-[4/5] w-full rounded-3xl object-cover object-top" loading="lazy" />
                ) : (
                  <span className="grid aspect-[4/5] w-full place-items-center rounded-3xl bg-plum-100 font-display text-5xl text-plum-600">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                )}
                <span>
                  <strong className="block font-display text-xl font-normal text-ink">{m.name}</strong>
                  <span className="text-sm text-muted">{m.role}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ Einblicke */}
      <section aria-label="Einblicke in die Praxis" className="pb-24 md:pb-36">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-8 [scrollbar-width:none]">
          {[
            ["/files/header/_LHA0475web.jpg", "Die Praxis in Essinghausen"],
            ["/files/header/_LHA0470.jpg", "Empfang"],
            ["/files/header/_LHA0537.jpg", "Behandlungszimmer"],
            ["/files/header/_LHA0299.jpg", "Arbeitsplatz mit Mikroskop"],
            ["/files/header/_LHA0500.jpg", "Besprechung"],
            ["/files/header/_LHA0480web.jpg", "Praxisschild"],
          ].map(([src, label]) => (
            <figure key={src} className="relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-[2rem] sm:w-[46vw] lg:w-[30vw]">
              <img src={src} alt={label} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-1.5 text-sm font-semibold text-ink backdrop-blur">
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Kollegen */}
      <section className="px-5 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-[2.5rem] bg-sand lg:grid-cols-2">
          <Reveal className="h-full">
            <img src="/files/startseite/IMG_5584.jpg" alt="Ali Özdemir an der Endodontic Clinic der University of Pennsylvania" className="size-full min-h-80 object-cover" loading="lazy" />
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-6 p-8 md:p-14 lg:pl-0">
            <span className="eyebrow">Für Kolleginnen & Kollegen</span>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">Überweiserpraxis für mikroskopische Endodontie</h2>
            <p className="leading-relaxed text-muted">
              Ob Instrumentenfraktur, Revision, Stiftentfernung, extrem gekrümmte Kanäle oder Perforationsverschluss: Dank
              Spezialisierung an der University of Pennsylvania bieten wir Ihren Patienten eine qualitativ sehr hochwertige
              Behandlung.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/files/pdf/ueberweisungsformular.pdf" target="_blank" rel="noopener" className="rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-plum-700">
                Überweisungsformular (PDF)
              </a>
              <Link href="/kollegen" className="rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink transition hover:border-ink/40">
                Mehr für Überweiser
              </Link>
            </div>
            <p className="text-sm text-muted">
              <strong className="text-ink">{PRAXIS.zweitpraxis.title}</strong> · {PRAXIS.zweitpraxis.street}, {PRAXIS.zweitpraxis.city} ·{" "}
              <a href={PRAXIS.zweitpraxis.phoneHref} className="font-semibold text-plum-600">
                {PRAXIS.zweitpraxis.phone}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ Kontakt */}
      <section id="kontakt" className="scroll-mt-24 px-5 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-8">
            <span className="eyebrow">Kontakt & Sprechzeiten</span>
            <h2 className="font-display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[1.02] tracking-[-0.03em]">
              Wir freuen uns auf <em className="text-plum-600">Sie</em>.
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold tracking-[0.18em] text-stone uppercase">Adresse</span>
                <address className="not-italic text-ink">
                  {PRAXIS.street}
                  <br />
                  {PRAXIS.city}
                </address>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold tracking-[0.18em] text-stone uppercase">Telefon & E-Mail</span>
                <a href={PRAXIS.phoneHref} className="font-semibold text-ink hover:text-plum-600">
                  {PRAXIS.phone}
                </a>
                <a href={`mailto:${PRAXIS.email}`} className="break-all text-plum-600 hover:underline">
                  {PRAXIS.email}
                </a>
              </div>
            </div>
            <HoursTable />
            <p className="text-sm font-semibold text-ink">Termine nur nach vorheriger telefonischer Absprache.</p>
          </Reveal>
          <Reveal delay={120} className="min-h-[26rem] overflow-hidden rounded-[2.5rem]">
            <MapConsent />
          </Reveal>
        </div>
      </section>
    </>
  );
}

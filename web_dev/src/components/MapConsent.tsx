"use client";
import { useState } from "react";
import { PRAXIS } from "@/lib/praxis";

/** Google Maps erst nach Klick laden (DSGVO: keine Datenuebertragung ohne Einwilligung) */
export default function MapConsent({ className = "" }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={PRAXIS.mapsEmbed}
        title="Anfahrt zur Zahnarztpraxis Özdemir"
        className={`size-full border-0 ${className}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div
      className={`relative flex size-full flex-col items-center justify-center gap-5 overflow-hidden bg-plum-100 p-8 text-center ${className}`}
    >
      {/* stilisierte Karte */}
      <svg aria-hidden className="absolute inset-0 size-full text-plum-300/40" preserveAspectRatio="none" viewBox="0 0 400 300">
        <path d="M-10 220 C 80 180, 140 260, 230 200 S 360 120, 420 160" fill="none" stroke="currentColor" strokeWidth="14" />
        <path d="M60 -10 C 90 90, 40 180, 120 310" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M300 -10 C 260 80, 330 170, 280 310" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M-10 90 L 420 60" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
      <span className="relative grid size-14 place-items-center rounded-full bg-plum-600 text-white shadow-xl shadow-plum-600/30">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
      </span>
      <div className="relative flex max-w-xs flex-col gap-2">
        <p className="font-semibold text-ink">
          {PRAXIS.street}, {PRAXIS.city}
        </p>
        <p className="text-sm text-muted">
          Beim Laden der Karte werden Daten an Google übertragen.
        </p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-plum-700"
        >
          Karte laden
        </button>
        <a
          href={PRAXIS.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-ink/15 bg-white/60 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/40"
        >
          Route planen ↗
        </a>
      </div>
    </div>
  );
}

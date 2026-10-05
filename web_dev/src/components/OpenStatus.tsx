"use client";
import { useSyncExternalStore } from "react";
import { HOURS } from "@/lib/praxis";

type Status = { open: boolean; text: string };

/** Aktueller Wochentag/Uhrzeit in Deutschland, unabhaengig von der Zeitzone des Besuchers */
function berlinNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, time: `${get("hour").replace("24", "00")}:${get("minute")}` };
}

export function computeStatus(): Status {
  const { day, time } = berlinNow();
  const today = HOURS.find((h) => h.day === day);
  const slot = today?.slots.find(([from, to]) => time >= from && time < to);
  if (slot) return { open: true, text: `Jetzt geöffnet · bis ${slot[1]} Uhr` };
  const later = today?.slots.find(([from]) => time < from);
  if (later) return { open: false, text: `Geschlossen · heute ab ${later[0]} Uhr` };
  for (let i = 1; i <= 7; i++) {
    const next = HOURS.find((h) => h.day === (day + i) % 7);
    if (next) return { open: false, text: `Geschlossen · ${i === 1 ? "morgen" : next.label} ab ${next.slots[0][0]} Uhr` };
  }
  return { open: false, text: "Geschlossen" };
}

// Uhrzeit als externe Quelle: minuetlich neu lesen, auf dem Server leer (statischer Export)
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 30_000);
  return () => clearInterval(t);
};
const snapshot = () => {
  const n = berlinNow();
  return `${n.day}|${n.time}`;
};
const serverSnapshot = () => "";

function useBerlinClock() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export default function OpenStatus({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const clock = useBerlinClock();
  const status = clock ? computeStatus() : null;

  if (!status) return <span className={`inline-block h-5 ${className}`} aria-hidden />;
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-semibold ${tone === "dark" ? "text-white/85" : "text-ink"} ${className}`}
      aria-live="polite"
    >
      <span className="relative flex size-2.5">
        {status.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-60" />}
        <span className={`relative inline-flex size-2.5 rounded-full ${status.open ? "bg-mint" : "bg-stone"}`} />
      </span>
      {status.text}
    </span>
  );
}

/** Heutiger Wochentag (Europe/Berlin), null waehrend des statischen Renderns */
export function useToday() {
  const clock = useBerlinClock();
  return clock ? Number(clock.split("|")[0]) : null;
}

"use client";
import { HOURS } from "@/lib/praxis";
import { useToday } from "./OpenStatus";

export default function HoursTable({ tone = "light" }: { tone?: "light" | "dark" }) {
  const today = useToday();
  const dark = tone === "dark";
  return (
    <dl className="flex flex-col">
      {HOURS.map((h) => {
        const isToday = h.day === today;
        return (
          <div
            key={h.day}
            className={`flex items-baseline justify-between gap-6 border-b py-3.5 ${dark ? "border-white/10" : "border-sand"} ${
              isToday ? (dark ? "text-white" : "text-plum-700") : dark ? "text-white/65" : "text-muted"
            }`}
          >
            <dt className="flex items-center gap-2 font-semibold">
              {h.label}
              {isToday && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${dark ? "bg-white/15" : "bg-plum-100"}`}>
                  Heute
                </span>
              )}
            </dt>
            <dd className="text-right tabular-nums">
              {h.slots.map(([a, b]) => `${a} – ${b}`).join("  ·  ")}
            </dd>
          </div>
        );
      })}
      <div className={`flex justify-between gap-6 py-3.5 ${dark ? "text-white/45" : "text-stone"}`}>
        <dt className="font-semibold">Sa – So</dt>
        <dd>geschlossen</dd>
      </div>
    </dl>
  );
}

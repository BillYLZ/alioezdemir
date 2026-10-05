"use client";
import { useRouter } from "next/navigation";
import type { NavItem } from "@/lib/site";

/** Contao mod_quicknav (Modul 10): ersetzt unter 768px die rechte Leistungen-Spalte */
export default function QuickNav({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const options = items.flatMap((it) => [
    { url: it.url, label: it.title },
    ...it.children.map((c) => ({ url: c.url, label: `\u00a0\u00a0 ${c.title}` })),
  ]);

  return (
    <div className="px-5 pt-5 md:hidden">
      <label htmlFor="quicknav" className="sr-only">
        Zielseite
      </label>
      <select
        id="quicknav"
        value=""
        onChange={(e) => e.target.value && router.push(e.target.value)}
        className="w-full border border-[#767676] bg-white px-1 py-0.5"
      >
        <option value="">- unsere Leistungen -</option>
        {options.map((o) => (
          <option key={o.url} value={o.url}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

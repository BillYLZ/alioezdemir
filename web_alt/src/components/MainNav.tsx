"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site";

const inTrail = (path: string, item: NavItem) =>
  path === item.url ||
  (item.url !== "/" && path.startsWith(item.url.split("/").slice(0, 2).join("/") + "/")) ||
  item.children.some((c) => path === c.url || path.startsWith(c.url + "/"));

/** Contao mod_navigation (Modul 1): Ebene 1 + Dropdown Ebene 2, Styles in globals.css */
export default function MainNav({ items }: { items: NavItem[] }) {
  const path = usePathname().replace(/\.html$/, "") || "/";

  return (
    <nav
      aria-label="Hauptnavigation"
      className="mod_navigation relative z-[102] px-5 py-2.5 md:absolute md:top-[100px] md:right-5 md:p-0 text-[0.9em] mid:top-[78px] mid:text-[1em] lg:right-[60px]"
    >
      <ul>
        {items.map((item) => (
          <li key={item.url}>
            <Link
              href={item.url}
              aria-current={path === item.url ? "page" : undefined}
              aria-haspopup={item.children.length > 0 || undefined}
              className={inTrail(path, item) ? "trail" : undefined}
            >
              {item.title}
            </Link>
            {item.children.length > 0 && (
              <ul>
                {item.children.map((c) => (
                  <li key={c.url} className={path === c.url ? "active" : undefined}>
                    <Link href={c.url} aria-current={path === c.url ? "page" : undefined}>
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* eslint-disable @next/next/no-img-element -- statischer Export, Bilder unoptimiert */
import type { Column, Element, ImageData } from "@/lib/site";
import Gallery from "./Gallery";
import Slider from "./Slider";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

// rocksolid-columns -> Tailwind (statische Klassen, damit Tailwind sie findet).
// Theme columns.less: small <600px (Abstand 2%), medium 600-900px (3%), large >900px (6%)
const GRID: Record<string, Record<string, string>> = {
  base: { "1": "grid-cols-1", "2": "grid-cols-2", "3": "grid-cols-3", "2-1": "grid-cols-[2fr_1fr]" },
  md: {
    "1": "min-[600px]:grid-cols-1",
    "2": "min-[600px]:grid-cols-2",
    "3": "min-[600px]:grid-cols-3",
    "2-1": "min-[600px]:grid-cols-[2fr_1fr]",
  },
  lg: {
    "1": "min-[901px]:grid-cols-1",
    "2": "min-[901px]:grid-cols-2",
    "3": "min-[901px]:grid-cols-3",
    "2-1": "min-[901px]:grid-cols-[2fr_1fr]",
  },
};

const POS: Record<string, string> = {
  left_top: "left top", center_top: "center top", right_top: "right top",
  left_center: "left center", center_center: "center", right_center: "right center",
  left_bottom: "left bottom", center_bottom: "center bottom", right_bottom: "right bottom",
};

function Heading({ h }: { h?: { tag: string; text: string } }) {
  if (!h) return null;
  const Tag = (["h1", "h2", "h3", "h4", "h5", "h6"].includes(h.tag) ? h.tag : "h2") as "h2";
  return (
    <div className="richtext">
      <Tag>{h.text}</Tag>
    </div>
  );
}

/** Contao-Bildgroesse (size = [Breite, Hoehe, Modus]): feste Breite, max. 100%, sonst Originalgroesse */
export function Figure({ img, className }: { img: ImageData; className?: string }) {
  const [w, h, mode] = img.size ?? [];
  const style: React.CSSProperties = {};
  if (w) style.width = `${w}px`;
  if (w && h) Object.assign(style, { aspectRatio: `${w} / ${h}`, objectFit: "cover", objectPosition: POS[mode] ?? "center" });
  const pic = (
    <img
      src={img.src}
      alt={img.alt || img.title || ""}
      title={img.title || undefined}
      loading="lazy"
      className="block h-auto max-w-full"
      style={style}
    />
  );
  const link = img.href || (img.fullsize ? img.src : "");
  return (
    <figure className={cx("w-fit max-w-full", className)}>
      {link ? (
        <a href={link} target={img.fullsize && !img.href ? "_blank" : undefined} rel="noopener">
          {pic}
        </a>
      ) : (
        pic
      )}
      {img.caption && (
        <figcaption
          className="bg-[#5b5b5b] px-5 py-1.5 text-sm text-[#dbdbdb]"
          dangerouslySetInnerHTML={{ __html: img.caption }}
        />
      )}
    </figure>
  );
}

function Text({ el }: { el: Extract<Element, { type: "text" }> }) {
  const img = el.image;
  const body = <div className="richtext" dangerouslySetInnerHTML={{ __html: el.html }} />;
  if (!img) return body;
  // Contao float_left/float_right: Text umfliesst das Bild
  if (img.floating === "left" || img.floating === "right") {
    return (
      <div className="flow-root">
        <Figure
          img={img}
          className={cx("mb-5 md:mb-2.5", img.floating === "left" ? "md:float-left md:mr-[30px]" : "md:float-right md:ml-[30px]")}
        />
        {body}
      </div>
    );
  }
  return (
    <div>
      {img.floating !== "below" && <Figure img={img} />}
      {body}
      {img.floating === "below" && <Figure img={img} />}
    </div>
  );
}

function Columns({ el }: { el: Extract<Element, { type: "columns" }> }) {
  const small = el.small ?? "1";
  const large = el.large ?? "1";
  const medium = el.medium ?? large;
  // implizite Spalten: jedes Element ist eine eigene Spalte (rocksolid-Verhalten)
  const cells: Column[] = el.columns
    .filter((c) => !c.hidden)
    .flatMap((c) => (c.implicit ? c.elements.map((e) => ({ elements: [e] })) : [c]))
    .filter((c) => c.elements.some(renders));
  // leere Spalten haben im Original 0px Hoehe -> die naechste rutscht nach links,
  // die Spaltenbreite bleibt aber erhalten (kein Strecken auf volle Breite)
  return (
    <div
      className={cx(
        "grid gap-x-[2%] gap-y-5 min-[600px]:gap-x-[3%] min-[901px]:gap-x-[6%] min-[901px]:gap-y-10",
        GRID.base[small],
        GRID.md[medium],
        GRID.lg[large],
      )}
    >
      {cells.map((c, i) => (
        <div key={i} className="min-w-0">
          <Elements elements={c.elements} />
        </div>
      ))}
    </div>
  );
}

/** false, wenn das Element nichts anzeigen wuerde (versteckt, Bild geloescht, Formular aus) */
function renders(e: Element): boolean {
  if (e.hidden) return false;
  if (e.type === "image") return !!(e as Extract<Element, { type: "image" }>).image;
  if (e.type === "form" || "raw" in e) return false;
  return true;
}

export function ElementView({ el }: { el: Element }) {
  switch (el.type) {
    case "text":
      return (
        <div className={el.cssClass}>
          <Heading h={el.headline} />
          <Text el={el as Extract<Element, { type: "text" }>} />
        </div>
      );
    case "headline":
      return <Heading h={el.headline} />;
    case "html": {
      const html = (el as Extract<Element, { type: "html" }>).html;
      // Google-Maps einbetten responsiv, toten Piwik-Opt-out weglassen
      if (/piwik/i.test(html)) return null;
      if (/<iframe/i.test(html)) {
        const src = html.match(/src="([^"]+)"/)?.[1];
        return src ? (
          <iframe
            src={src}
            title="Karte"
            loading="lazy"
            className="aspect-[16/7] w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : null;
      }
      return <div className="richtext" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    case "image": {
      const img = (el as Extract<Element, { type: "image" }>).image;
      return img ? (
        <div>
          <Heading h={el.headline} />
          <Figure img={img} />
        </div>
      ) : null;
    }
    case "gallery": {
      const g = el as Extract<Element, { type: "gallery" }>;
      return (
        <div>
          <Heading h={g.headline} />
          <Gallery images={g.images} perRow={g.perRow} />
        </div>
      );
    }
    case "download": {
      const d = el as Extract<Element, { type: "download" }>;
      return (
        <div>
          <Heading h={d.headline} />
          <a
            href={d.src}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 font-semibold text-brand hover:underline"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6M12 12v6m-3-3 3 3 3-3" />
            </svg>
            {d.title.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")} (PDF)
          </a>
        </div>
      );
    }
    case "columns":
      return <Columns el={el as Extract<Element, { type: "columns" }>} />;
    case "slider": {
      const s = el as Extract<Element, { type: "slider" }>;
      return <Slider images={s.elements.filter((e) => !e.hidden && e.type === "image").map((e) => (e as Extract<Element, { type: "image" }>).image!).filter(Boolean)} />;
    }
    default:
      return null; // form (im CMS deaktiviert) u.a.
  }
}

export default function Elements({ elements }: { elements: Element[] }) {
  return (
    <>
      {elements
        .filter((e) => !e.hidden)
        .map((e) => (
          <ElementView key={e.id} el={e} />
        ))}
    </>
  );
}

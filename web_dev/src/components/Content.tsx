/* eslint-disable @next/next/no-img-element -- statischer Export, Bilder unoptimiert */
import type { Column, Element, ImageData } from "@/lib/site";
import Gallery from "./Gallery";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

const GRID: Record<string, string> = {
  "1": "md:grid-cols-1",
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "2-1": "md:grid-cols-[2fr_1fr]",
};

const POS: Record<string, string> = {
  left_top: "left top", center_top: "center top", right_top: "right top",
  left_center: "left center", center_center: "center", right_center: "right center",
  left_bottom: "left bottom", center_bottom: "center bottom", right_bottom: "right bottom",
};

type Of<T extends string> = Extract<Element, { type: T }>;

/** false, wenn das Element nichts anzeigen wuerde */
export function renders(e: Element): boolean {
  if (e.hidden) return false;
  if (e.type === "image") return !!(e as Of<"image">).image;
  if (e.type === "html") return !/piwik/i.test((e as Of<"html">).html);
  if (e.type === "form" || "raw" in e) return false;
  return true;
}

function Heading({ h }: { h?: { tag: string; text: string } }) {
  if (!h) return null;
  return (
    <div className="prose-praxis">
      <h2>{h.text}</h2>
    </div>
  );
}

export function Figure({ img, className }: { img: ImageData; className?: string }) {
  const [, , mode] = img.size ?? [];
  return (
    <figure className={cx("flex flex-col gap-3", className)}>
      <div className="overflow-hidden rounded-3xl bg-sand">
        <img
          src={img.src}
          alt={img.alt || img.title || ""}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
          style={{ objectPosition: POS[mode] ?? "center" }}
        />
      </div>
      {img.caption && (
        <figcaption className="text-sm text-stone" dangerouslySetInnerHTML={{ __html: img.caption }} />
      )}
    </figure>
  );
}

function Text({ el }: { el: Of<"text"> }) {
  const body = <div className="prose-praxis" dangerouslySetInnerHTML={{ __html: el.html }} />;
  const img = el.image;
  if (!img) return body;
  const side = img.floating === "left" || img.floating === "right";
  return (
    <div className={cx("flex flex-col gap-8", side && "md:flex-row md:items-start", img.floating === "right" && "md:flex-row-reverse")}>
      {img.floating !== "below" && <Figure img={img} className={side ? "md:w-2/5 md:shrink-0" : undefined} />}
      <div className="min-w-0 flex-1">{body}</div>
      {img.floating === "below" && <Figure img={img} />}
    </div>
  );
}

function Columns({ el }: { el: Of<"columns"> }) {
  const cells: Column[] = el.columns
    .filter((c) => !c.hidden)
    .flatMap((c) => (c.implicit ? c.elements.map((e) => ({ elements: [e] })) : [c]))
    .filter((c) => c.elements.some(renders));
  if (cells.length === 1) return <Content elements={cells[0].elements} />;
  return (
    <div className={cx("grid gap-10", GRID[el.large ?? "1"])}>
      {cells.map((c, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-8">
          <Content elements={c.elements} />
        </div>
      ))}
    </div>
  );
}

function View({ el }: { el: Element }) {
  switch (el.type) {
    case "text":
      return (
        <div className="flex flex-col gap-4">
          <Heading h={el.headline} />
          <Text el={el as Of<"text">} />
        </div>
      );
    case "headline":
      return <Heading h={el.headline} />;
    case "html": {
      const html = (el as Of<"html">).html;
      if (/maps\/embed/.test(html)) return null; // Karte kommt als MapConsent
      return <div className="prose-praxis" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    case "image":
      return <Figure img={(el as Of<"image">).image!} />;
    case "gallery": {
      const g = el as Of<"gallery">;
      return (
        <div className="flex flex-col gap-6">
          <Heading h={g.headline} />
          <Gallery images={g.images} perRow={Math.min(g.perRow, 4)} />
        </div>
      );
    }
    case "download": {
      const d = el as Of<"download">;
      return (
        <a
          href={d.src}
          target="_blank"
          rel="noopener"
          className="group flex items-center gap-5 rounded-3xl border border-sand bg-white p-5 transition hover:border-plum-300 hover:shadow-lg hover:shadow-plum-900/5"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-plum-100 text-plum-600">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6M12 12v6m-3-3 3 3 3-3" />
            </svg>
          </span>
          <span className="flex flex-1 flex-col">
            <span className="font-semibold text-ink capitalize">{d.title.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")}</span>
            <span className="text-sm text-muted">PDF herunterladen</span>
          </span>
          <span className="text-2xl text-plum-600 transition-transform group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </a>
      );
    }
    case "columns":
      return <Columns el={el as Of<"columns">} />;
    default:
      return null;
  }
}

export default function Content({ elements }: { elements: Element[] }) {
  return (
    <>
      {elements.filter(renders).map((e) => (
        <View key={e.id} el={e} />
      ))}
    </>
  );
}

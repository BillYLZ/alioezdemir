"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";

type Img = { src: string; alt: string; title: string; caption: string };

const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-3 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
};

export default function Gallery({ images, perRow = 4 }: { images: Img[]; perRow?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <>
      <ul className={`grid grid-cols-2 gap-3 md:gap-4 ${COLS[perRow] ?? COLS[4]}`}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-2xl"
            >
              <img
                src={img.src}
                alt={img.alt || `Bild ${i + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-plum-950/95 backdrop-blur-sm p-4"
          onClick={close}
        >
          <img
            src={images[open].src}
            alt={images[open].alt || ""}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" onClick={close} aria-label="Schließen" className="absolute top-4 right-4 p-2 text-3xl leading-none text-white">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Vorheriges Bild"
                onClick={(e) => (e.stopPropagation(), step(-1))}
                className="absolute top-1/2 left-2 -translate-y-1/2 p-3 text-4xl text-white/80 hover:text-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Nächstes Bild"
                onClick={(e) => (e.stopPropagation(), step(1))}
                className="absolute top-1/2 right-2 -translate-y-1/2 p-3 text-4xl text-white/80 hover:text-white"
              >
                ›
              </button>
            </>
          )}
          <p className="absolute bottom-4 text-sm text-white/70">
            {open + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}

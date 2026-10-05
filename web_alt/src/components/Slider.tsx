"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { ImageData } from "@/lib/site";

/**
 * Header-Slider der Startseite (Contao ce_sliderStart / Swipe 2.0,
 * data-config="4000,1000,0,1": auto 4s, speed 1s, continuous).
 */
export default function Slider({ images, delay = 4000, speed = 1000 }: { images: ImageData[]; delay?: number; speed?: number }) {
  // from = vorheriger Slide: nur Nachbar-Wechsel animieren (sonst springt ein Slide quer durchs Bild)
  const [{ active, from }, setPos] = useState({ active: 0, from: 0 });
  const [paused, setPaused] = useState(false);
  const n = images.length;
  const go = (to: number) => setPos((p) => ({ active: to, from: p.active }));

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => setPos((p) => ({ active: (p.active + 1) % n, from: p.active })), delay);
    return () => clearInterval(t);
  }, [paused, n, delay]);

  if (!n) return null;

  const offset = (i: number, cur: number) => {
    const o = (i - cur + n) % n;
    return o === n - 1 && n > 2 ? -1 : o;
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[1200/532] w-full">
        {images.map((img, i) => {
          const o = offset(i, active);
          const animate = Math.abs(offset(i, from) - o) <= 1;
          return (
            <figure
              key={img.src}
              className="absolute inset-0"
              style={{
                transform: `translateX(${o * 100}%)`,
                transition: animate ? `transform ${speed}ms ease` : "none",
              }}
              aria-hidden={i !== active}
            >
              <img
                src={img.src}
                alt={img.alt || ""}
                className="block size-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
              />
              {img.caption && <figcaption className="header-caption hidden md:block" dangerouslySetInnerHTML={{ __html: img.caption }} />}
            </figure>
          );
        })}
      </div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-4 text-center text-[2.8em] leading-none">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Bild ${i + 1}`}
              aria-current={i === active}
              className={`cursor-pointer px-px ${i === active ? "text-[#a6a5a1]" : "text-white"}`}
            >
              •
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

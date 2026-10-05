import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Weiches Einblenden beim Scrollen – reines CSS (.reveal in globals.css),
 * Inhalte sind ohne JavaScript und fuer Suchmaschinen immer sichtbar.
 * `delay` staffelt Elemente einer Reihe ueber das Ende des Animationsbereichs.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const style = delay ? ({ "--reveal-end": `${40 + Math.round(delay / 8)}%` } as CSSProperties) : undefined;
  return (
    <Tag className={`reveal min-w-0 ${className}`} style={style}>
      {children}
    </Tag>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 pt-32 text-center">
      <p className="font-display text-[8rem] leading-none text-plum-300">404</p>
      <h1 className="font-display text-4xl">Diese Seite gibt es nicht (mehr).</h1>
      <Link href="/" className="rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-plum-700">
        Zur Startseite
      </Link>
    </section>
  );
}

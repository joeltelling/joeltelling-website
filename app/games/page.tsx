import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Games - Joel Telling",
  description: "Small games I've built that you can play right in your browser.",
};

const games = [
  {
    slug: "trig-sprint",
    name: "Trig Sprint",
    tagline: "A rhythm platformer with a live-synthesized soundtrack, five vehicles and a blaster.",
    tags: ["Rhythm", "Platformer", "Browser"],
    accent: "border-accent-purple/30 from-accent-purple/15",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <section className="px-6 pt-12 pb-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
          >
            &larr; joeltelling.com
          </Link>
          <h1 className="mt-6 font-heading text-5xl text-white sm:text-6xl">Games</h1>
          <p className="mt-3 max-w-xl text-base text-slate-400">
            Little games I&apos;ve built for fun. They run right in your browser - no download, no
            sign-up.
          </p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {games.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className={`card-hover flex flex-col justify-between rounded-2xl border bg-gradient-to-br to-bg-surface p-7 ${g.accent}`}
            >
              <div>
                <h2 className="mb-2 font-heading text-3xl text-white">{g.name}</h2>
                <p className="text-sm leading-relaxed text-slate-400">{g.tagline}</p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {g.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500"
                  >
                    {t}
                  </span>
                ))}
                <span className="ml-auto inline-flex items-center rounded-lg bg-accent-blue px-4 py-2 text-xs font-semibold text-white">
                  Play
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-border-subtle px-6 py-10 text-center sm:px-8">
        <p className="font-heading text-lg tracking-widest text-slate-600">JOEL TELLING</p>
        <p className="mt-2 text-sm italic text-slate-500">As always, high five!</p>
      </footer>
    </div>
  );
}

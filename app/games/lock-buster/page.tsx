import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lock Buster - Joel Telling",
  description:
    "Lock Buster is a frantic, touch-first combination lock game: the code is right there, you just have to be fast. Crack locks, steal snacks, panic gracefully.",
};

const GAME_URL = "/games/lock-buster/play/index.html";

const howTo: [string, string][] = [
  ["Keypad", "Tap the digits on the sticky note. The code is right there. You just have to be fast."],
  [
    "Dial",
    "Drag around the dial. Follow the arrows: stop on each number, spinning the right way, then lift your finger to lock it in.",
  ],
  ["The clock", "Every lock you crack adds time, and faster cracks add more. A wrong code costs you."],
  ["Streaks", "Crack locks without a single mistake to build your combo multiplier."],
];

export default function LockBusterPage() {
  return (
    <div className="min-h-screen">
      <section className="px-6 pt-12 pb-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/games"
            className="font-mono text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
          >
            &larr; All games
          </Link>
          <h1 className="mt-6 font-heading text-5xl text-white sm:text-6xl">Lock Buster</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-400">
            Crack locks. Steal snacks. Panic gracefully. How many combination locks can you open
            before the clock runs out? Built for touch screens, so it&apos;s best on a phone. This
            is an early prototype.
          </p>
        </div>
      </section>

      <section className="px-6 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <a
            href={GAME_URL}
            className="mb-4 flex items-center justify-center rounded-2xl bg-accent-blue px-6 py-5 text-lg font-bold text-white transition-all hover:brightness-110 sm:hidden"
          >
            Play full screen
          </a>
          <div className="mx-auto hidden max-w-[390px] overflow-hidden rounded-3xl border border-border-subtle bg-black sm:block">
            <iframe
              src={GAME_URL}
              title="Lock Buster"
              className="block aspect-[9/19] w-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
          <div className="mx-auto mt-3 flex max-w-[390px] flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-slate-500">Touch or mouse. Turn your sound on.</p>
            <a
              href={GAME_URL}
              className="inline-flex items-center rounded-lg border border-border-subtle px-4 py-2 text-xs font-semibold text-white transition-all hover:border-slate-600"
            >
              Open full screen
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-white">
            How to play
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {howTo.map(([title, what]) => (
              <div
                key={title}
                className="rounded-xl border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs text-accent-blue-light">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border-subtle px-6 py-10 text-center sm:px-8">
        <p className="font-heading text-lg tracking-widest text-slate-600">JOEL TELLING</p>
        <p className="mt-2 text-sm italic text-slate-500">As always, high five!</p>
      </footer>
    </div>
  );
}

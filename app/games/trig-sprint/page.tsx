import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trig Sprint - Joel Telling",
  description:
    "Trig Sprint is a rhythm platformer you can play in your browser: three levels, five vehicles, a blaster, and a soundtrack synthesized live.",
};

const GAME_URL = "/games/trig-sprint/play/index.html";

const controls: [string, string][] = [
  ["Space / Up / W / click / tap", "Jump (hold to keep jumping, fly the ship, zig-zag the wave)"],
  ["X / Shift / F / right-click", "Fire the blaster (the ship fires on its own)"],
  ["Phone / tablet", "Tap anywhere on the left side to jump. Hold the big FIRE strip on the right to shoot. You can hold both at once."],
  ["Esc / P", "Pause"],
  ["R", "Restart the attempt"],
  ["Z / Backspace", "Place a checkpoint (practice mode)"],
];

export default function TrigSprintPage() {
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
          <h1 className="mt-6 font-heading text-5xl text-white sm:text-6xl">Trig Sprint</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-400">
            Run, jump and fly through three levels set to a soundtrack that&apos;s synthesized live
            in your browser. Click the game to give it focus, then play. Turn your sound on.
          </p>
        </div>
      </section>

      <section className="px-6 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <a
            href={GAME_URL}
            className="mb-4 flex items-center justify-center rounded-2xl bg-accent-blue px-6 py-5 text-lg font-bold text-white transition-all hover:brightness-110 sm:hidden"
          >
            Play full screen (turn your phone sideways)
          </a>
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-black">
            <iframe
              src={GAME_URL}
              title="Trig Sprint"
              className="block aspect-video w-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-slate-500">
              Keyboard or touch. On a phone, use full screen in landscape.
            </p>
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
            Controls
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {controls.map(([keys, what]) => (
              <div
                key={keys}
                className="rounded-xl border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs text-accent-blue-light">{keys}</p>
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

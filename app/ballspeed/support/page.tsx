import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support - Ball Speed",
  description: "Support and FAQ for the Ball Speed iOS pitch speed app.",
};

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "My speed reading seems way too high or way too low.",
    a: (
      <>
        <p>
          A few common causes:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-white">Distance setting is wrong.</strong> In Settings, pick
            the preset that matches your pitching distance (MLB 60.5 ft, Little League / Youth 46
            ft, Middle School 54 ft) or enter a custom value. The same elapsed time produces very
            different mph at different distances.
          </li>
          <li>
            <strong className="text-white">Audio trigger picked up the wrong sound.</strong> In a
            noisy environment (or with the mic too close to you), the app may register a crowd
            sound or talking as the impact. Try adjusting sensitivity in Settings, or switch to
            Tap-Tap mode where you control both start and stop.
          </li>
          <li>
            <strong className="text-white">Capture method timing was off.</strong> In Tap-Tap or
            Hold modes, you&apos;re timing by hand — human reaction variability can add or subtract
            tens of milliseconds. Take a few pitches and look at the average rather than any single
            reading.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "Which capture method should I use?",
    a: (
      <p>
        <strong className="text-white">Audio</strong> is the most hands-off — great when someone
        else is pitching and you can hold the phone somewhere stable. <strong className="text-white">Tap-Tap</strong>{" "}
        is the most reliable — tap at release, tap again at impact.{" "}
        <strong className="text-white">Hold</strong> is easiest for solo use — press and hold as
        the ball is released, let go when it lands. All three are selectable in Settings at any
        time.
      </p>
    ),
  },
  {
    q: "Does Ball Speed work offline?",
    a: (
      <p>
        Yes, completely. Ball Speed has no network features, no accounts, and no cloud backup.
        Every pitch you record is stored locally on your phone. You can use it at a field with no
        signal, on a plane, or anywhere else.
      </p>
    ),
  },
  {
    q: "Does the app work for softball?",
    a: (
      <p>
        Yes. The pitching distance is configurable, so any softball distance (including fastpitch
        43 ft) works — just enter your distance as a custom value in Settings. The capture methods
        are sport-agnostic.
      </p>
    ),
  },
  {
    q: "Will my pitch history survive reinstalls?",
    a: (
      <p>
        iOS keeps a local backup of the app&apos;s data tied to your device and iCloud backup
        settings. If you delete and reinstall the app on the same device with iCloud backups
        enabled, your history may be restored. If you move to a new device, whether history
        transfers depends on your iCloud settings. We do not operate any cloud backup ourselves.
      </p>
    ),
  },
  {
    q: "Does the app collect any data about me?",
    a: (
      <p>
        No. See the{" "}
        <Link
          href="/ballspeed/privacy"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          Privacy Policy
        </Link>{" "}
        for details. Nothing you do in the app is transmitted off your device.
      </p>
    ),
  },
  {
    q: "How do I reset everything?",
    a: (
      <p>
        In Settings, tap &quot;Reset to defaults&quot; to restore default settings and re-show the
        onboarding flow. To clear your pitch history specifically, go to the History tab and use
        &quot;Clear All.&quot;
      </p>
    ),
  },
];

export default function Support() {
  return (
    <div className="grid-bg min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-blue-500/6 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-blue-400/60 transition-colors hover:text-blue-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            joeltelling.com
          </Link>
        </div>

        <header className="mb-12">
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="/ballspeed-icon.png"
              alt="Ball Speed app icon"
              width={56}
              height={56}
              className="rounded-2xl"
            />
            <div>
              <div className="font-mono text-xs text-blue-400/60 uppercase tracking-widest mb-1">
                Ball Speed · iOS App
              </div>
              <h1 className="text-3xl font-bold gradient-text sm:text-4xl">Support</h1>
            </div>
          </div>

          <p className="mt-6 text-slate-300 leading-relaxed border-l-2 border-blue-500/30 pl-4">
            Can&apos;t find what you need below? Send an email to{" "}
            <a
              href="mailto:ballspeed@joeltelling.com"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              ballspeed@joeltelling.com
            </a>
            . Responses are best-effort — this is a one-person app.
          </p>
        </header>

        <div className="mb-10 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent" />
          <span className="font-mono text-xs text-blue-400/60 uppercase tracking-widest">
            Frequently Asked
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-blue-500/40 to-transparent" />
        </div>

        <div className="space-y-10">
          {faqs.map((faq, i) => (
            <section key={i}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-blue-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-px flex-1 bg-blue-500/10" />
              </div>
              <h2 className="mb-3 text-base font-semibold text-white">{faq.q}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-slate-400">{faq.a}</div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-blue-500/10 bg-white/[0.025] p-6 text-sm text-slate-400">
          <p>
            <strong className="text-white">Still stuck?</strong> Email{" "}
            <a
              href="mailto:ballspeed@joeltelling.com"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              ballspeed@joeltelling.com
            </a>{" "}
            with your iPhone model, iOS version, and a short description of what you were doing
            when the issue happened. A screenshot helps.
          </p>
        </div>

        <footer className="mt-16 border-t border-white/5 pt-8 text-center">
          <p className="font-mono text-xs text-slate-600">
            joeltelling.com <span className="text-slate-700">·</span> Seattle, WA{" "}
            <span className="text-slate-700">·</span>{" "}
            <span className="text-blue-500/50">✋</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

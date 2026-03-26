import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface Section {
  number: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  intro?: ReactNode;
  sections: Section[];
  footer?: ReactNode;
}

export default function LegalPage({
  title,
  subtitle,
  effectiveDate,
  lastUpdated,
  intro,
  sections,
  footer,
}: LegalPageProps) {
  return (
    <div className="grid-bg min-h-screen">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-blue-500/6 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-16">
        {/* Back link */}
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

        {/* Header */}
        <header className="mb-12">
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="/orange-banana-icon.jpg"
              alt="Orange Banana app icon"
              width={56}
              height={56}
              className="rounded-2xl"
            />
            <div>
              <div className="font-mono text-xs text-blue-400/60 uppercase tracking-widest mb-1">
                {subtitle}
              </div>
              <h1 className="text-3xl font-bold gradient-text sm:text-4xl">{title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-500">
            <span>Effective: {effectiveDate}</span>
            <span className="text-slate-700">·</span>
            <span>Last updated: {lastUpdated}</span>
          </div>

          {intro && (
            <p className="mt-6 text-slate-300 leading-relaxed border-l-2 border-blue-500/30 pl-4">
              {intro}
            </p>
          )}
        </header>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.number}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-blue-500">
                  {section.number}
                </span>
                <div className="h-px flex-1 bg-blue-500/10" />
              </div>
              <h2 className="mb-3 text-base font-semibold text-white">{section.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-slate-400">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-16 rounded-xl border border-blue-500/10 bg-white/[0.025] p-6 text-sm text-slate-400">
            {footer}
          </div>
        )}

        {/* Page footer */}
        <footer className="mt-16 border-t border-white/5 pt-8 text-center">
          <p className="font-mono text-xs text-slate-600">
            joeltelling.com{" "}
            <span className="text-slate-700">·</span>{" "}
            Seattle, WA{" "}
            <span className="text-slate-700">·</span>{" "}
            <span className="text-blue-500/50">✋</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

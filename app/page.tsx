import Image from "next/image";
import Link from "next/link";

// ─── SVG Icons ──────────────────────────────────────────────────────────────

const YouTubeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const LinkedInIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const PlayIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Data ───────────────────────────────────────────────────────────────────

const socialLinks = [
  {
    platform: "YouTube",
    handle: "@3dprintingnerd",
    url: "https://youtube.com/@3dprintingnerd",
    icon: <YouTubeIcon className="w-5 h-5" />,
    iconColor: "text-accent-red",
  },
  {
    platform: "X / Twitter",
    handle: "@joeltelling",
    url: "https://x.com/joeltelling",
    secondaryHandle: "@3dprintingnerd",
    secondaryUrl: "https://x.com/3dprintingnerd",
    icon: <XIcon />,
    iconColor: "text-white",
  },
  {
    platform: "Instagram",
    handle: "@joeltelling",
    url: "https://instagram.com/joeltelling",
    secondaryHandle: "@3dprintingnerd",
    secondaryUrl: "https://instagram.com/3dprintingnerd",
    icon: <InstagramIcon />,
    iconColor: "text-pink-500",
  },
  {
    platform: "LinkedIn",
    handle: "@joeltelling",
    url: "https://linkedin.com/in/joeltelling",
    icon: <LinkedInIcon />,
    iconColor: "text-[#0A66C2]",
  },
  {
    platform: "TikTok",
    handle: "@joeltelling5",
    url: "https://tiktok.com/@joeltelling5",
    icon: <TikTokIcon />,
    iconColor: "text-white",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="hero-glow px-6 pb-16 pt-24 sm:px-8 md:pt-32 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-4 py-1.5 animate-fade-in">
            <span aria-label="high five">&#9995;</span>
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-slate-400">
              Exceptional Giver of High Fives
            </span>
          </div>

          <h1 className="mb-4 font-heading text-7xl tracking-wide sm:text-8xl md:text-9xl animate-fade-in">
            <span className="gradient-name">JOEL TELLING</span>
          </h1>

          <p className="mb-6 font-mono text-lg font-semibold uppercase tracking-[0.3em] text-accent-blue sm:text-xl animate-fade-in">
            3D Printing Nerd
          </p>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            I review 3D printers, teach people how to use them, and get this
            technology into as many hands as possible. 650K+ subscribers on
            YouTube and counting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <a
              href="https://youtube.com/@3dprintingnerd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-lg bg-accent-blue px-7 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 cursor-pointer"
            >
              <PlayIcon className="w-4 h-4" />
              Watch Latest Video
            </a>
            <a
              href="#projects"
              className="inline-flex items-center gap-2.5 rounded-lg border border-border-subtle px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-slate-600 cursor-pointer"
            >
              Browse Projects
            </a>
          </div>
        </div>
      </section>

      {/* ── Apps & Projects ── */}
      <section id="projects" className="scroll-mt-8 px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-white">
              Apps & Projects
            </h2>
            <p className="mt-2 text-base text-slate-400">
              Things I&apos;ve built for the 3D printing community and beyond
            </p>
          </div>

          {/* Bento Row 1: 3DPN (large) + SOLVD */}
          <div className="mt-8 grid gap-5 md:grid-cols-5">
            {/* 3D Printing Nerd - flagship */}
            <div className="card-hover md:col-span-3 flex flex-col justify-between rounded-2xl border border-accent-blue/20 bg-gradient-to-br from-accent-blue/10 to-bg-surface p-8">
              <div>
                <span className="mb-4 inline-block rounded-full bg-accent-blue px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                  Flagship
                </span>
                <h3 className="mb-2 font-heading text-3xl text-white">
                  3D Printing Nerd
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-slate-400">
                  YouTube&apos;s home for 3D printing. Reviews, tutorials, tips,
                  and industry coverage from someone who genuinely loves this
                  stuff.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="https://youtube.com/@3dprintingnerd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 cursor-pointer"
                >
                  <YouTubeIcon className="w-4 h-4" />
                  Watch on YouTube
                </a>
                <span className="font-mono text-xs text-slate-500">
                  650K+ subscribers
                </span>
              </div>
            </div>

            {/* SOLVD */}
            <div className="card-hover md:col-span-2 flex flex-col justify-between rounded-2xl border border-border-subtle bg-bg-surface p-7">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue">
                  <Image src="/solvd-icon.png" alt="SOLVD" width={48} height={48} className="rounded-xl" />
                </div>
                <h3 className="mb-1 font-heading text-2xl text-white">SOLVD</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  A daily math puzzle. One grid, three difficulties. No ads, no tracking.
                </p>
              </div>
              <div className="mt-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {["iOS", "Free", "No Ads"].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="https://apps.apple.com/us/app/solvd/id6762657288" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-blue-light hover:text-white transition-colors cursor-pointer">
                    <AppleIcon /> App Store
                  </a>
                  <span className="text-border-subtle">|</span>
                  <Link href="/solvd/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
                  <Link href="/solvd/tos" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Row 2: Orange Banana + Ball Speed + RMRF */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {/* Orange Banana */}
            <div className="card-hover flex flex-col justify-between rounded-2xl border border-accent-amber/20 bg-gradient-to-br from-accent-amber/10 to-bg-surface p-7">
              <div>
                <Image src="/orange-banana-icon.jpg" alt="Orange Banana" width={44} height={44} className="mb-3 rounded-xl" />
                <h3 className="mb-1 font-heading text-xl text-white">Orange Banana</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  A fast-paced fruit-sorting game. Five mini-games testing
                  speed, memory, and coordination.
                </p>
              </div>
              <div className="mt-4">
                <span className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500">
                  iOS Game
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href="https://apps.apple.com/us/app/orange-banana/id834676062" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-blue-light hover:text-white transition-colors cursor-pointer">
                    <AppleIcon /> App Store
                  </a>
                  <span className="text-border-subtle">|</span>
                  <Link href="/orangebanana/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
                  <Link href="/orangebanana/tos" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
                </div>
              </div>
            </div>

            {/* Ball Speed */}
            <div className="card-hover flex flex-col justify-between rounded-2xl border border-border-subtle bg-bg-surface p-7">
              <div>
                <Image src="/ballspeed-icon.png" alt="Ball Speed" width={44} height={44} className="mb-3 rounded-xl" />
                <h3 className="mb-1 font-heading text-xl text-white">Ball Speed</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Measure pitch speed with your phone. Audio detection,
                  press-and-hold, or tap capture.
                </p>
              </div>
              <div className="mt-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {["iOS", "Free"].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="https://apps.apple.com/us/app/ball-speed/id6762416582" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-blue-light hover:text-white transition-colors cursor-pointer">
                    <AppleIcon /> App Store
                  </a>
                  <span className="text-border-subtle">|</span>
                  <Link href="/ballspeed/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
                  <Link href="/ballspeed/tos" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
                  <Link href="/ballspeed/support" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Support</Link>
                </div>
              </div>
            </div>

            {/* RMRF */}
            <div className="card-hover flex flex-col justify-between rounded-2xl border border-accent-purple/20 bg-gradient-to-br from-accent-purple/10 to-bg-surface p-7">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-pink-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                  </svg>
                </div>
                <h3 className="mb-1 font-heading text-xl text-white">RMRF</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Rocky Mountain RepRap Festival app. Vendors, floor maps,
                  schedules - works offline.
                </p>
              </div>
              <div className="mt-4">
                <span className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500">
                  PWA
                </span>
                <div className="mt-3">
                  <a href="https://rmrrf.joeltelling.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-blue-light hover:text-white transition-colors cursor-pointer">
                    <ExternalLinkIcon /> Open App
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Row 3: SpoolSearch (wide) + On The Way */}
          <div className="mt-5 grid gap-5 md:grid-cols-5">
            {/* SpoolSearch */}
            <div className="card-hover md:col-span-3 flex flex-col justify-between rounded-2xl border border-border-subtle bg-gradient-to-r from-accent-blue/5 via-bg-surface to-accent-green/5 p-8 sm:flex-row sm:items-center sm:gap-8">
              <div>
                <h3 className="mb-2 font-heading text-2xl text-white">SpoolSearch</h3>
                <p className="max-w-lg text-sm leading-relaxed text-slate-400">
                  The filament search engine. Search, compare, and shop from all
                  major brands. Filter by material, color, price, and temperature.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Web App", "3D Printing", "Free"].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 shrink-0 sm:mt-0">
                <a
                  href="https://spoolsearch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 cursor-pointer"
                >
                  <SearchIcon />
                  Search Filament
                </a>
              </div>
            </div>

            {/* On The Way */}
            <div className="card-hover md:col-span-2 flex flex-col justify-between rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/10 to-bg-surface p-7">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-orange to-accent-amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </div>
                <h3 className="mb-1 font-heading text-xl text-white">On The Way</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Find anything along a route you&apos;re already taking. Every
                  result shows exact detour distance.
                </p>
              </div>
              <div className="mt-4">
                <span className="rounded-full bg-bg-surface-alt px-3 py-1 font-mono text-[11px] text-slate-500">
                  Web App
                </span>
                <div className="mt-3">
                  <a href="https://ontheway.joeltelling.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-blue-light hover:text-white transition-colors cursor-pointer">
                    <ExternalLinkIcon /> Open App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Links ── */}
      <section className="border-t border-border-subtle bg-bg-surface px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 font-mono text-sm font-semibold uppercase tracking-widest text-white">
            Find Me Everywhere
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface-alt p-4 cursor-pointer"
              >
                <span className={link.iconColor}>{link.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{link.platform}</div>
                  <div className="font-mono text-[11px] text-slate-500 truncate">
                    {link.handle}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border-subtle px-6 py-10 text-center sm:px-8">
        <p className="font-heading text-lg tracking-widest text-slate-600">
          JOEL TELLING
        </p>
        <p className="mt-2 text-sm italic text-slate-500">
          As always, high five!
        </p>
        <p className="mt-3 font-mono text-[11px] text-slate-600">
          Shoreline, WA - 3D Printing Nerd - joeltelling.com
        </p>
      </footer>
    </div>
  );
}

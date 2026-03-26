import type { ReactNode } from "react";
import Image from "next/image";

// ─── Social link data ───────────────────────────────────────────────────────

interface SocialLink {
  platform: string;
  handle: string;
  url: string;
  description: string;
  icon: ReactNode;
  color: string;
}

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const socialLinks: SocialLink[] = [
  {
    platform: "X / Twitter",
    handle: "@joeltelling",
    url: "https://x.com/joeltelling",
    description: "Thoughts on tech, making, and life",
    icon: <XIcon />,
    color: "#ffffff",
  },
  {
    platform: "X / Twitter",
    handle: "@3dprintingnerd",
    url: "https://x.com/3dprintingnerd",
    description: "3D printing news and community",
    icon: <XIcon />,
    color: "#ffffff",
  },
  {
    platform: "Instagram",
    handle: "@joeltelling",
    url: "https://instagram.com/joeltelling",
    description: "Life behind the camera",
    icon: <InstagramIcon />,
    color: "#E1306C",
  },
  {
    platform: "Instagram",
    handle: "@3dprintingnerd",
    url: "https://instagram.com/3dprintingnerd",
    description: "Prints, projects, and process",
    icon: <InstagramIcon />,
    color: "#E1306C",
  },
  {
    platform: "LinkedIn",
    handle: "@joeltelling",
    url: "https://linkedin.com/in/joeltelling",
    description: "Additive manufacturing & content creation",
    icon: <LinkedInIcon />,
    color: "#0A66C2",
  },
  {
    platform: "TikTok",
    handle: "@joeltelling5",
    url: "https://tiktok.com/@joeltelling5",
    description: "Purveyor of epic high fives",
    icon: <TikTokIcon />,
    color: "#69C9D0",
  },
];

// ─── App/project data ────────────────────────────────────────────────────────

interface AppProject {
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: ReactNode;
  platforms: { label: string; url: string; available: boolean }[];
  tags: string[];
}

const projects: AppProject[] = [
  {
    name: "3D Printing Nerd",
    tagline: "YouTube's home for 3D printing",
    description:
      "Reviews, tutorials, tips, and honest industry coverage — from desktop printers to industrial additive manufacturing. One of the most trusted 3D printing channels on the internet, with a mission to inform, educate, and advocate.",
    category: "YouTube Channel",
    icon: (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-600/25 to-red-500/10">
        <svg viewBox="0 0 24 24" fill="#FF0000" className="w-8 h-8" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
    ),
    platforms: [
      {
        label: "Watch on YouTube",
        url: "https://youtube.com/@3dprintingnerd",
        available: true,
      },
    ],
    tags: ["3D Printing", "Reviews", "Tutorials", "Industry Coverage"],
  },
  {
    name: "Orange Banana",
    tagline: "A fast-paced fruit-sorting game",
    description:
      "Five addictive mini-games that test your speed, memory, and coordination. Sort falling fruit, repeat sequences, fill blenders, and match smoothie orders — all before the clock runs out.",
    category: "Game · Family",
    icon: (
      <Image
        src="/orange-banana-icon.jpg"
        alt="Orange Banana app icon"
        width={64}
        height={64}
        className="rounded-2xl"
      />
    ),
    platforms: [
      {
        label: "App Store",
        url: "https://apps.apple.com/us/app/orange-banana/id834676062",
        available: true,
      },
      {
        label: "Google Play",
        url: "",
        available: false,
      },
    ],
    tags: ["iOS", "macOS", "Free", "In-App Purchase"],
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

function SocialCard({ link }: { link: SocialLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="social-card glow-blue-hover group flex flex-col gap-3 rounded-xl bg-white/[0.03] p-5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10"
          style={{ color: link.color }}
        >
          {link.icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-widest text-blue-400/70">
            {link.platform}
          </div>
          <div className="font-mono text-sm font-medium text-white">{link.handle}</div>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="ml-auto h-4 w-4 shrink-0 text-blue-400/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-400"
        >
          <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{link.description}</p>
    </a>
  );
}

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M17.523 15.341a.604.604 0 0 1-.61.61.604.604 0 0 1-.61-.61V11.15a.604.604 0 0 1 .61-.61.604.604 0 0 1 .61.61v4.19zm-9.83 0a.604.604 0 0 1-.61.61.604.604 0 0 1-.61-.61V11.15a.604.604 0 0 1 .61-.61.604.604 0 0 1 .61.61v4.19zm5.609 3.83a.604.604 0 0 1-.61.61.604.604 0 0 1-.61-.61v-1.22h1.22v1.22zm-2.44 0a.604.604 0 0 1-.61.61.604.604 0 0 1-.61-.61v-1.22h1.22v1.22zM16.31 7.8l1.1-1.98a.23.23 0 0 0-.09-.31.23.23 0 0 0-.31.09l-1.12 2.01A6.635 6.635 0 0 0 13.2 7H10.8a6.635 6.635 0 0 0-2.68.61L6.99 5.6a.23.23 0 0 0-.31-.09.23.23 0 0 0-.09.31L7.69 7.8A5.994 5.994 0 0 0 5.4 12.37v.29h13.2v-.29A5.994 5.994 0 0 0 16.31 7.8zM10.8 10.54a.488.488 0 1 1 0-.976.488.488 0 0 1 0 .976zm2.4 0a.488.488 0 1 1 0-.976.488.488 0 0 1 0 .976z" />
  </svg>
);

function ProjectCard({ project }: { project: AppProject }) {
  return (
    <div className="social-card glow-blue rounded-2xl bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0">{project.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <span className="font-mono text-xs text-blue-400/60">{project.category}</span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-300">{project.tagline}</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-400">{project.description}</p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Platform buttons */}
          <div className="flex flex-wrap gap-3">
            {project.platforms.map((platform) =>
              platform.available ? (
                <a
                  key={platform.label}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-500/60 hover:bg-blue-500/20"
                >
                  {platform.label.includes("YouTube") ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ) : (
                    <AppleIcon />
                  )}
                  {platform.label}
                </a>
              ) : (
                <span
                  key={platform.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-600 cursor-default"
                  title="Coming soon"
                >
                  <AndroidIcon />
                  {platform.label}
                  <span className="text-xs text-slate-700">· soon</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HighFiveTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono font-medium text-blue-300">
      <span aria-label="high five emoji">✋</span>
      Exceptional Giver of High Fives
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="grid-bg min-h-screen">
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-blue-500/8 blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/6 blur-3xl animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-20">
        {/* ── Hero ── */}
        <header className="mb-20 animate-fade-in">
          <div className="mb-6">
            <span className="font-mono text-sm text-blue-400/60">// joeltelling.com</span>
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="gradient-text">Joel Telling</span>
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-xl font-medium text-slate-300">The 3D Printing Nerd</span>
            <span className="text-slate-600">·</span>
            <HighFiveTag />
          </div>

          <p className="max-w-xl text-base leading-relaxed text-slate-400">
            Pacific Northwest native based in Shoreline, WA. Content creator,
            maker, and YouTube&apos;s most trusted voice in 3D printing —
            informing, educating, and advocating for this technology since the
            early days.
          </p>
        </header>

        {/* ── Bio ── */}
        <section className="mb-20 animate-slide-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
          <div className="rounded-2xl border border-blue-500/10 bg-white/[0.025] p-8 backdrop-blur-sm glow-blue">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent" />
              <span className="font-mono text-xs text-blue-400/60 uppercase tracking-widest">About</span>
              <div className="h-px flex-1 bg-gradient-to-l from-blue-500/40 to-transparent" />
            </div>

            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                I&apos;m Joel — husband, father, believer, and lifelong tech nerd with a background in
                software development, mobile devices, and quality assurance. My love for gadgets
                eventually collided with a brand-new 3D printer, and the{" "}
                <strong className="text-white">3D Printing Nerd</strong> was born.
              </p>
              <p>
                What started as a personal channel to show off cool prints has grown into one of the
                most trusted online destinations for 3D printer reviews, hands-on tutorials, and
                honest industry coverage — from desktop hobbyist machines all the way to industrial
                additive manufacturing at events like Formnext.
              </p>
              <p>
                My mission has always been the same: <em className="text-blue-300">inform, educate, and advocate</em> — especially
                when it comes to getting this technology into the hands of kids. And yes, I end every
                video the same way.
              </p>
              <p className="font-medium text-blue-300 font-mono">
                &quot;As always, high five! ✋&quot;
              </p>
            </div>
          </div>
        </section>

        {/* ── Apps & Projects ── */}
        <section className="mb-20 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent" />
            <span className="font-mono text-xs text-blue-400/60 uppercase tracking-widest">Apps & Projects</span>
            <div className="h-px flex-1 bg-gradient-to-l from-blue-500/40 to-transparent" />
          </div>

          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </section>

        {/* ── Social Links ── */}
        <section className="animate-slide-up" style={{ animationDelay: "0.45s", opacity: 0 }}>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent" />
            <span className="font-mono text-xs text-blue-400/60 uppercase tracking-widest">Find Me Online</span>
            <div className="h-px flex-1 bg-gradient-to-l from-blue-500/40 to-transparent" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {socialLinks.map((link) => (
              <SocialCard key={`${link.platform}-${link.handle}`} link={link} />
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-24 border-t border-white/5 pt-8 text-center">
          <p className="font-mono text-xs text-slate-600">
            joeltelling.com{" "}
            <span className="text-slate-700">·</span>{" "}
            Shoreline, WA{" "}
            <span className="text-slate-700">·</span>{" "}
            <span className="text-blue-500/50">✋</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

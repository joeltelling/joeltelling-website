"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_URL || "";

export default function BetaSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [removeEmail, setRemoveEmail] = useState("");
  const [removeStatus, setRemoveStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [showRemove, setShowRemove] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStatus("submitting");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          _subject: "New Orange Banana Beta Signup",
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  async function handleRemove(e: FormEvent) {
    e.preventDefault();
    if (!removeEmail.trim()) return;

    setRemoveStatus("submitting");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: removeEmail.trim(),
          _subject: "Beta Removal Request",
          message: "Please remove this email from the Orange Banana Android beta list.",
        }),
      });
      if (!res.ok) throw new Error("Removal failed");
      setRemoveStatus("success");
    } catch {
      setRemoveStatus("error");
    }
  }

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-amber-400/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 pb-20 pt-16 sm:px-8">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs text-slate-500 transition-colors hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to joeltelling.com
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <Image
            src="/orange-banana-icon.jpg"
            alt="Orange Banana"
            width={56}
            height={56}
            className="rounded-xl"
          />
          <div>
            <h1 className="font-heading text-3xl tracking-wide text-white sm:text-4xl">
              Android Beta Test
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Orange Banana
            </p>
          </div>
        </div>

        <div className="mb-10 rounded-2xl border border-accent-amber/20 bg-gradient-to-br from-accent-amber/5 to-bg-surface p-6 sm:p-8">
          <h2 className="mb-4 font-heading text-xl text-white">What is beta testing?</h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-400">
            <p>
              Orange Banana is coming to Android and you can be one of the first to play it.
              Beta testing means you get early access before the public release.
            </p>
            <p>Here is what to expect:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="text-white font-medium">Early access</span> - you will get the
                Android version before anyone else
              </li>
              <li>
                <span className="text-white font-medium">Bugs happen</span> - the app is not
                finished yet, so things might break. That is the whole point
              </li>
              <li>
                <span className="text-white font-medium">Your feedback matters</span> - reporting
                issues and sharing your experience helps make the app better for everyone
              </li>
              <li>
                <span className="text-white font-medium">Totally free</span> - no cost to
                participate
              </li>
            </ul>
          </div>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/10 p-8 text-center">
            <div className="mb-3 text-4xl">&#9995;</div>
            <h2 className="mb-2 font-heading text-2xl text-white">You are in!</h2>
            <p className="text-sm text-slate-400">
              High five! You will receive a Google Play beta invite at the email you provided.
              Keep an eye on your inbox.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 sm:p-8">
            <h2 className="mb-1 font-heading text-xl text-white">Sign up for the beta</h2>
            <p className="mb-6 text-sm text-slate-400">
              Enter the email address associated with your Google Play account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-widest text-slate-400">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-border-subtle bg-bg-surface-alt px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-accent-amber"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-widest text-slate-400">
                  Google Play Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full rounded-lg border border-border-subtle bg-bg-surface-alt px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-accent-amber"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-accent-red">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-lg bg-accent-amber px-6 py-3.5 text-sm font-bold text-black transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? "Signing up..." : "Join the Beta"}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-600">
          Your email will be used for the beta invite and any communication regarding the beta test.
        </p>

        <div className="mt-10 border-t border-border-subtle pt-8">
          {!showRemove ? (
            <button
              onClick={() => setShowRemove(true)}
              className="mx-auto block text-xs text-slate-600 transition-colors hover:text-slate-400 cursor-pointer"
            >
              Need to leave the beta?
            </button>
          ) : removeStatus === "success" ? (
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 text-center">
              <p className="text-sm text-slate-400">
                Your removal request has been submitted. You will be removed from the beta list.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
              <h3 className="mb-1 font-heading text-lg text-white">Leave the beta</h3>
              <p className="mb-4 text-sm text-slate-400">
                Enter the email you signed up with and we will remove you from the list.
              </p>
              <form onSubmit={handleRemove} className="flex gap-3">
                <input
                  type="email"
                  required
                  value={removeEmail}
                  onChange={(e) => setRemoveEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="flex-1 rounded-lg border border-border-subtle bg-bg-surface-alt px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-accent-amber"
                />
                <button
                  type="submit"
                  disabled={removeStatus === "submitting"}
                  className="rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  {removeStatus === "submitting" ? "Removing..." : "Remove me"}
                </button>
              </form>
              {removeStatus === "error" && (
                <p className="mt-3 text-sm text-accent-red">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import LegalPage from "../../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - SOLVD",
  description: "Privacy Policy for the SOLVD iOS daily math puzzle app by Joel Telling.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="SOLVD · iOS App"
      iconSrc="/solvd-icon.png"
      iconAlt="SOLVD app icon"
      effectiveDate="May 3, 2026"
      lastUpdated="May 3, 2026"
      intro={`This Privacy Policy describes how SOLVD ("the App," "we," "us," or "our") handles information in connection with your use of our iOS daily math puzzle app. SOLVD is designed around a strict no-user-content principle: we never store text you type, and other players never see any text you've written.`}
      sections={[
        {
          number: "01",
          title: "What We Collect",
          content: (
            <>
              <p>
                When you first open SOLVD, the app creates a new anonymous account on our servers.
                This account holds:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  <strong className="text-white">An anonymous user ID</strong> — a random
                  identifier (UUID). Not tied to your name, email, phone, Apple ID, or any other
                  personal info.
                </li>
                <li>
                  <strong className="text-white">An auto-generated handle</strong> — a whimsical
                  name like "BraveFox42" picked from a fixed wordlist. Visible to other players on
                  leaderboards. You can re-roll it from a different fixed wordlist; you cannot type
                  your own.
                </li>
                <li>
                  <strong className="text-white">An auto-generated friend code</strong> — a code
                  like "BLUE-FOX-42" picked from a fixed wordlist. Only revealed to people you
                  share it with personally.
                </li>
                <li>
                  <strong className="text-white">Your daily puzzle solves</strong> — date,
                  difficulty, time taken, mistakes, and hints used. No text, no images.
                </li>
                <li>
                  <strong className="text-white">Aggregate stats derived from solves</strong> —
                  current streak, best streak, total solves, best time. Calculated locally on your
                  device and pushed to the server so leaderboards work.
                </li>
                <li>
                  <strong className="text-white">Your friend graph</strong> — the user IDs of
                  players you have mutually accepted as friends.
                </li>
                <li>
                  <strong className="text-white">Your block list</strong> — the user IDs of players
                  you have blocked. Used to hide them from your view.
                </li>
              </ul>
            </>
          ),
        },
        {
          number: "02",
          title: "What We Do Not Collect",
          content: (
            <>
              <p>
                SOLVD intentionally does not collect or transmit any of the following:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Your real name, email, phone number, address, or contacts</li>
                <li>Your location, IP address (beyond the transient one used to make a request), or device identifiers</li>
                <li>Any text you type into the app — your local profile name and friend nicknames stay strictly on your device</li>
                <li>Photos, audio, video, or any media</li>
                <li>Behavioral or analytics data — there is no analytics SDK, no advertising network, no third-party tracking</li>
              </ul>
              <p>
                There is no chat, no comments, no bios, no captions, and no way for one user to send
                another user any text. Other players see your auto-generated handle and your numeric
                stats — nothing else.
              </p>
            </>
          ),
        },
        {
          number: "03",
          title: "Local Data on Your Device",
          content: (
            <>
              <p>
                Several pieces of data live only on your device and are never sent to our servers:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>The display name you choose for your own profile</li>
                <li>Local nicknames you assign to your friends (same posture as your iOS Contacts — your private annotation, never shared)</li>
                <li>Your detailed solve history (puzzle by puzzle), badges, app settings, and theme preference</li>
              </ul>
              <p>
                If you uninstall the app, this local data is removed by iOS automatically.
              </p>
            </>
          ),
        },
        {
          number: "04",
          title: "How We Use the Data",
          content: (
            <>
              <p>The data we collect is used solely to operate the app's features:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong className="text-white">Leaderboards</strong> — to rank players by streak or daily best time</li>
                <li><strong className="text-white">Friend connections</strong> — to let you add friends via friend code and view a friends-only leaderboard</li>
                <li><strong className="text-white">Block functionality</strong> — to hide players you have blocked, in both directions</li>
              </ul>
              <p>
                We do not use your data for advertising, profiling, marketing, or any purpose
                outside the app's features. We do not sell or rent data to anyone.
              </p>
            </>
          ),
        },
        {
          number: "05",
          title: "Service Providers",
          content: (
            <>
              <p>
                We use{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Supabase
                </a>{" "}
                as the database and authentication backend that stores the data described in
                Section 01. Supabase processes this data on our behalf under their{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  privacy terms
                </a>
                .
              </p>
              <p>
                We do not use any other third-party services. There is no advertising network, no
                analytics provider, no social media SDK, and no crash reporter.
              </p>
              <p>
                Apple&apos;s App Store and iOS platform may independently collect certain data in
                accordance with{" "}
                <a
                  href="https://apple.com/legal/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Apple&apos;s Privacy Policy
                </a>
                , which is outside our control.
              </p>
            </>
          ),
        },
        {
          number: "06",
          title: "Account Deletion",
          content: (
            <>
              <p>
                You can permanently delete your account at any time:{" "}
                <strong className="text-white">Settings → Delete Account</strong> inside the app.
                Deletion is immediate and complete — your anonymous user ID, handle, friend code,
                solve history, stats, friendships, and block list are all permanently removed from
                our servers.
              </p>
              <p>
                After deletion, opening the app again creates a fresh anonymous account with no
                connection to your previous one.
              </p>
            </>
          ),
        },
        {
          number: "07",
          title: "Children's Privacy",
          content: (
            <p>
              SOLVD is suitable for players of all ages. The data we collect (anonymous ID, auto-
              generated handle, gameplay stats) does not include any personally identifying
              information. We do not knowingly collect personal information from children. If you
              believe we have inadvertently received personal information from a child under 13,
              please contact us at the address below and we will delete the associated account.
            </p>
          ),
        },
        {
          number: "08",
          title: "Data Security",
          content: (
            <p>
              Data in transit is encrypted via HTTPS. Data at rest in our backend (Supabase) is
              protected by row-level security policies that limit each account to its own data plus
              data its friends have voluntarily shared. Local data on your device is protected by
              iOS&apos;s standard app sandboxing.
            </p>
          ),
        },
        {
          number: "09",
          title: "Your Rights",
          content: (
            <>
              <p>
                Because the only personal-ish data we hold about you is an opaque user ID and your
                gameplay records, you can exercise all the standard rights via the in-app delete
                flow. Specifically:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong className="text-white">Access:</strong> All data tied to you is visible inside the app (your handle, friend code, solve history, friends, blocked users)</li>
                <li><strong className="text-white">Deletion:</strong> Settings → Delete Account removes everything in one action</li>
                <li><strong className="text-white">Portability:</strong> Your data is gameplay-only and not portable in a meaningful sense, but you can take screenshots of any of it from the in-app screens</li>
              </ul>
              <p>
                If you reside in a jurisdiction with specific data rights (such as GDPR or CCPA) and
                need anything beyond what the in-app flow provides, contact us at the address below.
              </p>
            </>
          ),
        },
        {
          number: "10",
          title: "Changes to This Policy",
          content: (
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              &quot;Last updated&quot; date at the top of this page. We encourage you to review this
              page periodically. Continued use of SOLVD after any changes constitutes your
              acceptance of the updated policy.
            </p>
          ),
        },
        {
          number: "11",
          title: "Governing Law",
          content: (
            <p>
              This Privacy Policy is governed by and construed in accordance with applicable law. Any
              disputes arising in connection with this policy shall be resolved in the appropriate
              jurisdiction.
            </p>
          ),
        },
      ]}
      footer={
        <p>
          <strong className="text-white">Questions?</strong> If you have any questions about this
          Privacy Policy or our privacy practices, please reach out at{" "}
          <a
            href="mailto:solvd@joeltelling.com"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            solvd@joeltelling.com
          </a>
          .
        </p>
      }
    />
  );
}

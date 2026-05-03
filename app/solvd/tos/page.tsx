import type { Metadata } from "next";
import LegalPage from "../../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - SOLVD",
  description: "Terms of Service for the SOLVD iOS daily math puzzle app by Joel Telling.",
};

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="SOLVD · iOS App"
      iconSrc="/solvd-icon.png"
      iconAlt="SOLVD app icon"
      effectiveDate="May 3, 2026"
      lastUpdated="May 3, 2026"
      intro={`These Terms of Service ("Terms") govern your use of SOLVD ("the App," "we," "us," or "our"). By downloading or playing SOLVD, you agree to be bound by these Terms. Please read them carefully before playing.`}
      sections={[
        {
          number: "01",
          title: "Acceptance of Terms",
          content: (
            <>
              <p>
                By accessing or using SOLVD, you confirm that you are at least 13 years of age (or
                have the consent of a parent or guardian), that you have read and understood these
                Terms, and that you agree to be bound by them.
              </p>
              <p>If you do not agree to these Terms, please do not download or use the app.</p>
            </>
          ),
        },
        {
          number: "02",
          title: "The App & License",
          content: (
            <>
              <p>
                SOLVD is a free daily math puzzle app available on the Apple App Store for iOS
                devices. We grant you a limited, non-exclusive, non-transferable, revocable license
                to use the app for your personal, non-commercial entertainment.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or reverse-engineer any part of SOLVD.
                All content within the app — including the puzzle generator, graphics, and game logic
                — remains the intellectual property of SOLVD&apos;s developer.
              </p>
            </>
          ),
        },
        {
          number: "03",
          title: "Free App, No Purchases",
          content: (
            <p>
              SOLVD is free to download and use. There are no in-app purchases, no subscriptions, no
              advertising, and no premium tiers. Every feature is available to every player.
            </p>
          ),
        },
        {
          number: "04",
          title: "Acceptable Use",
          content: (
            <>
              <p>
                You agree to use SOLVD only for lawful, personal entertainment purposes. You must
                not attempt to exploit, hack, cheat, or otherwise manipulate the app&apos;s puzzle
                generator, scoring systems, streak mechanics, badge conditions, or leaderboards in
                unauthorized ways.
              </p>
              <p>
                You must not attempt to harvest other players&apos; friend codes by automated means,
                or use the friend system to harass other players. We may suspend or delete accounts
                found to be abusing these features.
              </p>
            </>
          ),
        },
        {
          number: "05",
          title: "Account & Social Features",
          content: (
            <>
              <p>
                When you first open SOLVD, an anonymous account is created on our servers. This
                account holds your auto-generated handle, friend code, gameplay stats, friend list,
                and block list. See the{" "}
                <a
                  href="/solvd/privacy"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Privacy Policy
                </a>{" "}
                for the full list of what&apos;s stored.
              </p>
              <p>
                You can delete your account at any time via{" "}
                <strong className="text-white">Settings → Delete Account</strong> inside the app.
                Deletion removes all server-side data tied to your account.
              </p>
              <p>
                You can block any other player from your view via the in-app Friends or Decline
                flows. Blocking is bidirectional for visibility — neither side will see the other on
                leaderboards.
              </p>
            </>
          ),
        },
        {
          number: "06",
          title: "Local Data",
          content: (
            <p>
              SOLVD stores your detailed puzzle progress, badges, app settings, and theme preference
              locally on your device. This local data is separate from your server-side account and
              is not synced. If you uninstall the app, this local data is removed by iOS
              automatically. We are not responsible for loss of local progress.
            </p>
          ),
        },
        {
          number: "07",
          title: "Disclaimer of Warranties",
          content: (
            <p>
              SOLVD is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
              any kind, express or implied. The developer does not guarantee error-free operation or
              continuous availability, and reserves the right to update or discontinue the app
              without advance notice.
            </p>
          ),
        },
        {
          number: "08",
          title: "Limitation of Liability",
          content: (
            <p>
              To the fullest extent permitted by applicable law, the developer shall not be liable
              for any indirect, incidental, special, or consequential damages arising out of your
              use of or inability to use SOLVD, including but not limited to loss of data or
              in-game progress.
            </p>
          ),
        },
        {
          number: "09",
          title: "Changes to These Terms",
          content: (
            <p>
              The developer may update these Terms periodically. When revisions occur, the &quot;Last
              updated&quot; date at the top of this page will reflect the change. Continued use
              following updates constitutes acceptance of the revised terms.
            </p>
          ),
        },
        {
          number: "10",
          title: "Governing Law",
          content: (
            <p>
              These Terms are governed by and construed in accordance with applicable law. Any
              disputes arising in connection with these Terms shall be resolved in the appropriate
              jurisdiction.
            </p>
          ),
        },
      ]}
      footer={
        <div className="space-y-1">
          <p>
            <strong className="text-white">Questions?</strong> If you have any questions about these
            Terms, please reach out at{" "}
            <a
              href="mailto:solvd@joeltelling.com"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              solvd@joeltelling.com
            </a>
            .
          </p>
          <p className="text-slate-600 text-xs">© 2026 SOLVD · All rights reserved</p>
        </div>
      }
    />
  );
}

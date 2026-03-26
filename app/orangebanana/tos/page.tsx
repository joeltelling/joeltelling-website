import type { Metadata } from "next";
import LegalPage from "../../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - Orange Banana",
  description: "Terms of Service for the Orange Banana iOS game by Joel Telling.",
};

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Orange Banana · iOS App"
      effectiveDate="March 23, 2026"
      lastUpdated="March 23, 2026"
      intro={`These Terms of Service ("Terms") govern your use of Orange Banana ("the Game," "we," "us," or "our"). By downloading or playing Orange Banana, you agree to be bound by these Terms. Please read them carefully before playing.`}
      sections={[
        {
          number: "01",
          title: "Acceptance of Terms",
          content: (
            <>
              <p>
                By accessing or using Orange Banana, you confirm that you are at least 13 years of
                age (or have the consent of a parent or guardian), that you have read and understood
                these Terms, and that you agree to be bound by them.
              </p>
              <p>
                If you do not agree to these Terms, please do not download or use the game.
              </p>
            </>
          ),
        },
        {
          number: "02",
          title: "The Game & License",
          content: (
            <>
              <p>
                Orange Banana is a mobile game available on the Apple App Store for iOS devices. We
                grant you a limited, non-exclusive, non-transferable, revocable license to use the
                game for your personal, non-commercial entertainment.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or reverse-engineer any part of Orange
                Banana. All content within the game - including graphics, audio, and game logic -
                remains the intellectual property of Orange Banana&apos;s developers.
              </p>
            </>
          ),
        },
        {
          number: "03",
          title: "Unlocking Games",
          content: (
            <>
              <p>Orange Banana includes games that can be unlocked in two ways:</p>
              <ul className="mt-2 space-y-1 pl-4 list-disc list-outside marker:text-blue-500">
                <li>
                  <strong className="text-slate-300">Earn it:</strong> Achieve good scores in the
                  game to unlock additional games for free.
                </li>
                <li>
                  <strong className="text-slate-300">Unlock all instantly:</strong> Purchase the
                  &quot;Unlock All Games&quot; in-app purchase to immediately access every game in
                  the app.
                </li>
              </ul>
              <p>
                Both paths give you access to the same content. The in-app purchase is entirely
                optional - all games can be unlocked through normal gameplay.
              </p>
            </>
          ),
        },
        {
          number: "04",
          title: "In-App Purchase",
          content: (
            <>
              <p>Orange Banana offers one in-app purchase:</p>
              <div className="my-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <span className="font-mono font-semibold text-white">$1.99 - Unlock All Games</span>
                <p className="mt-1 text-slate-400">
                  A one-time purchase that permanently unlocks every game in Orange Banana. No
                  subscriptions, no recurring charges.
                </p>
              </div>
              <p>
                All purchases are processed securely by Apple through the App Store. By making a
                purchase, you also agree to{" "}
                <a
                  href="https://www.apple.com/legal/internet-services/itunes/us/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Apple&apos;s Terms of Sale
                </a>
                . We do not handle, store, or have access to your payment information.
              </p>
              <p>
                The &quot;Unlock All Games&quot; purchase is tied to your Apple ID. If you delete
                and reinstall the app, you can restore your purchase at no additional charge using
                the in-app restore option.
              </p>
            </>
          ),
        },
        {
          number: "05",
          title: "Refunds",
          content: (
            <p>
              All purchases are final and processed by Apple. We do not issue refunds directly. If
              you believe you are entitled to a refund, please contact Apple Support at{" "}
              <a
                href="https://reportaproblem.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                reportaproblem.apple.com
              </a>
              , as refunds are handled entirely at Apple&apos;s discretion under their purchase
              policies.
            </p>
          ),
        },
        {
          number: "06",
          title: "Restoring Purchases",
          content: (
            <p>
              If you have previously purchased &quot;Unlock All Games&quot; and need to restore
              access - for example, after reinstalling the app or on a new device using the same
              Apple ID - use the restore purchases option within the app. Restoring is free and will
              reinstate your unlocked content.
            </p>
          ),
        },
        {
          number: "07",
          title: "Acceptable Use",
          content: (
            <p>
              You agree to use Orange Banana only for lawful, personal entertainment purposes. You
              must not attempt to exploit, hack, cheat, or otherwise manipulate the game&apos;s
              mechanics, scoring systems, or unlock conditions in unauthorized ways.
            </p>
          ),
        },
        {
          number: "08",
          title: "Disclaimer of Warranties",
          content: (
            <p>
              Orange Banana is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, express or implied. The developer does not guarantee
              error-free operation or continuous availability, and reserves the right to update or
              discontinue the game without advance notice.
            </p>
          ),
        },
        {
          number: "09",
          title: "Limitation of Liability",
          content: (
            <p>
              To the fullest extent permitted by applicable law, the developer shall not be liable
              for any indirect, incidental, special, or consequential damages arising out of your
              use of or inability to use Orange Banana, including but not limited to loss of data or
              in-game progress.
            </p>
          ),
        },
        {
          number: "10",
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
          number: "11",
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
              href="mailto:orangebanana@joeltelling.com"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              orangebanana@joeltelling.com
            </a>
            .
          </p>
          <p className="text-slate-600 text-xs">© 2026 Orange Banana · All rights reserved</p>
        </div>
      }
    />
  );
}

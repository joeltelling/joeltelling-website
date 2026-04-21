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
      effectiveDate="April 20, 2026"
      lastUpdated="April 20, 2026"
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
            <p>
              You agree to use SOLVD only for lawful, personal entertainment purposes. You must not
              attempt to exploit, hack, cheat, or otherwise manipulate the app&apos;s puzzle
              generator, scoring systems, streak mechanics, or badge conditions in unauthorized
              ways.
            </p>
          ),
        },
        {
          number: "05",
          title: "Local Data",
          content: (
            <p>
              SOLVD stores your puzzle progress, streak, badges, and settings locally on your
              device. This data is not backed up to any cloud service by us. If you uninstall the
              app or change devices, your progress will not transfer. We are not responsible for
              loss of local progress or data.
            </p>
          ),
        },
        {
          number: "06",
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
          number: "07",
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
          number: "08",
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
          number: "09",
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

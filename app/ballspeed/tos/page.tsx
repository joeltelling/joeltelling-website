import type { Metadata } from "next";
import LegalPage from "../../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - Ball Speed",
  description: "Terms of Service for the Ball Speed iOS pitch speed app by Joel Telling.",
};

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Ball Speed · iOS App"
      iconSrc="/ballspeed-icon.png"
      iconAlt="Ball Speed app icon"
      effectiveDate="April 22, 2026"
      lastUpdated="April 22, 2026"
      intro={`These Terms of Service ("Terms") govern your use of Ball Speed ("the App," "we," "us," or "our"). By downloading or using Ball Speed, you agree to be bound by these Terms. Please read them carefully before use.`}
      sections={[
        {
          number: "01",
          title: "Acceptance of Terms",
          content: (
            <>
              <p>
                By accessing or using Ball Speed, you confirm that you are at least 13 years of age
                (or have the consent of a parent or guardian), that you have read and understood
                these Terms, and that you agree to be bound by them.
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
                Ball Speed is a free pitch speed estimation app available on the Apple App Store
                for iOS devices. We grant you a limited, non-exclusive, non-transferable, revocable
                license to use the app for your personal, non-commercial training and entertainment.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or reverse-engineer any part of Ball
                Speed. All content within the app — including the capture-method logic, speed
                formula, and user interface — remains the intellectual property of Ball Speed&apos;s
                developer.
              </p>
            </>
          ),
        },
        {
          number: "03",
          title: "Free App, No Purchases",
          content: (
            <p>
              Ball Speed is free to download and use. There are no in-app purchases, no
              subscriptions, no advertising, and no premium tiers. Every feature is available to
              every user.
            </p>
          ),
        },
        {
          number: "04",
          title: "Measurement Accuracy Disclaimer",
          content: (
            <>
              <p>
                Ball Speed is a <strong className="text-white">training and practice tool</strong>,
                not an MLB-grade radar gun. Speed readings are estimates produced from timing a
                pitch between a release trigger and an arrival trigger (audio, tap-hold, or
                tap-tap), and they carry inherent variability from microphone latency, user
                reaction time, and measurement setup.
              </p>
              <p>
                Readings should be treated as a useful comparison tool across consistent sessions,
                not as authoritative radar measurements. The developer makes no warranty of
                accuracy and is not responsible for decisions (such as recruiting, scouting, or
                training adjustments) made based on readings produced by the app.
              </p>
            </>
          ),
        },
        {
          number: "05",
          title: "Acceptable Use",
          content: (
            <p>
              You agree to use Ball Speed only for lawful, personal training or entertainment
              purposes. You must not attempt to exploit, reverse-engineer, or manipulate the
              app&apos;s speed-calculation logic or storage in unauthorized ways.
            </p>
          ),
        },
        {
          number: "06",
          title: "Local Data",
          content: (
            <p>
              Ball Speed stores your pitch history and settings locally on your device. This data
              is not backed up to any cloud service by us. If you uninstall the app or change
              devices, your pitch history will not transfer. We are not responsible for loss of
              local data.
            </p>
          ),
        },
        {
          number: "07",
          title: "Disclaimer of Warranties",
          content: (
            <p>
              Ball Speed is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, express or implied. The developer does not guarantee
              error-free operation or continuous availability, and reserves the right to update or
              discontinue the app without advance notice.
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
              use of or inability to use Ball Speed, including but not limited to loss of data,
              inaccurate speed readings, or decisions made based on readings produced by the app.
            </p>
          ),
        },
        {
          number: "09",
          title: "Changes to These Terms",
          content: (
            <p>
              The developer may update these Terms periodically. When revisions occur, the
              &quot;Last updated&quot; date at the top of this page will reflect the change.
              Continued use following updates constitutes acceptance of the revised terms.
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
            <strong className="text-white">Questions?</strong> If you have any questions about
            these Terms, please reach out at{" "}
            <a
              href="mailto:ballspeed@joeltelling.com"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              ballspeed@joeltelling.com
            </a>
            .
          </p>
          <p className="text-slate-600 text-xs">© 2026 Ball Speed · All rights reserved</p>
        </div>
      }
    />
  );
}

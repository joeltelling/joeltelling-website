import type { Metadata } from "next";
import LegalPage from "../../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - Orange Banana",
  description: "Privacy Policy for the Orange Banana iOS game by Joel Telling.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Orange Banana"
      iconSrc="/orange-banana-icon.jpg"
      iconAlt="Orange Banana app icon"
      effectiveDate="March 21, 2026"
      lastUpdated="March 21, 2026"
      intro={`This Privacy Policy describes how Orange Banana ("the Game," "we," "us," or "our") handles information in connection with your use of our iOS mobile game. We are committed to protecting your privacy. We use Google Firebase solely to collect anonymous, non-identifiable gameplay statistics - such as how often games are played. No information that could identify you or any individual is ever collected or stored.`}
      sections={[
        {
          number: "01",
          title: "Information We Collect",
          content: (
            <>
              <p>
                Orange Banana collects limited, anonymous gameplay statistics through Google Firebase
                Analytics. This data is strictly non-personal and may include information such as how
                frequently individual games are played and general game usage patterns.
              </p>
              <p>
                We do not collect your name, email address, phone number, physical location, device
                identifiers, IP address, or any other information that could be used to identify you
                personally.
              </p>
              <p>
                Only anonymous aggregate gameplay statistics are collected. Nothing we gather can be
                traced back to you or any individual user.
              </p>
            </>
          ),
        },
        {
          number: "02",
          title: "Automatically Collected Information",
          content: (
            <>
              <p>
                When you play Orange Banana, Google Firebase Analytics automatically records anonymous
                gameplay events - for example, which games are launched and how often. This
                information is collected in aggregate and cannot be linked to any individual user.
              </p>
              <p>
                Firebase Analytics may also collect certain technical metadata (such as general device
                type or operating system version) as part of its standard operation. This data is used
                solely to understand how the game is being used in general, not to track or profile
                individuals. Firebase does not use this data to serve advertisements.
              </p>
              <p>
                We do not collect crash reports, precise location data, or any device identifiers that
                could be used to single out a specific person or device.
              </p>
            </>
          ),
        },
        {
          number: "03",
          title: "Cookies & Tracking Technologies",
          content: (
            <p>
              Orange Banana does not use cookies, web beacons, pixel tags, or any other tracking
              technologies.
            </p>
          ),
        },
        {
          number: "04",
          title: "Third-Party Services",
          content: (
            <>
              <p>
                Orange Banana uses Google Firebase Analytics, a service provided by Google LLC, to
                collect anonymous gameplay statistics. Firebase Analytics processes data in accordance
                with Google&apos;s Privacy Policy. We encourage you to review{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Google&apos;s Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Google&apos;s data safeguards for Firebase
                </a>
                .
              </p>
              <p>
                Firebase is configured to collect only anonymous, non-identifiable data. We do not
                enable any advertising, personalization, or user-identification features within
                Firebase.
              </p>
              <p>
                Orange Banana does not integrate with any advertising networks, social media
                platforms, or other data brokers.
              </p>
              <p>
                Please note that Apple&apos;s App Store and iOS platform may independently collect
                certain data in accordance with{" "}
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
          number: "05",
          title: "Children's Privacy",
          content: (
            <>
              <p>
                Orange Banana does not knowingly collect any personal information from anyone,
                including children under the age of 13. The anonymous gameplay statistics collected
                through Firebase cannot be used to identify any individual, including children.
              </p>
              <p>
                If you are a parent or guardian and have concerns about your child&apos;s privacy
                while using our game, please feel free to contact us.
              </p>
            </>
          ),
        },
        {
          number: "06",
          title: "Data Security",
          content: (
            <p>
              The anonymous gameplay statistics collected through Firebase are stored securely on
              Google&apos;s infrastructure, which employs industry-standard security measures.
              Because no personal or identifiable information is ever collected, there is no risk of
              your personal data being exposed through our game.
            </p>
          ),
        },
        {
          number: "07",
          title: "Data Retention",
          content: (
            <p>
              Anonymous gameplay statistics collected via Firebase are retained in accordance with
              Google&apos;s standard Firebase Analytics data retention settings. Because this data is
              not linked to any individual, it cannot be located, retrieved, or deleted on a per-user
              basis. No personal data is retained by us.
            </p>
          ),
        },
        {
          number: "08",
          title: "Your Rights",
          content: (
            <>
              <p>
                Because we collect only anonymous, non-identifiable data, there is no personal data
                tied to you that we could access, correct, delete, or export on your behalf. Your
                personal privacy is fully preserved by design.
              </p>
              <p>
                If you reside in the European Union, California, or another jurisdiction with
                specific privacy rights (such as GDPR or CCPA), our collection of strictly anonymous,
                aggregated data means we do not hold any personal data that would fall under those
                frameworks&apos; individual rights provisions.
              </p>
            </>
          ),
        },
        {
          number: "09",
          title: "Changes to This Policy",
          content: (
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              &quot;Last updated&quot; date at the top of this page. We encourage you to review this
              page periodically. Continued use of Orange Banana after any changes constitutes your
              acceptance of the updated policy.
            </p>
          ),
        },
        {
          number: "10",
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
            href="mailto:orangebanana@joeltelling.com"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            orangebanana@joeltelling.com
          </a>
          .
        </p>
      }
    />
  );
}

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
      effectiveDate="April 20, 2026"
      lastUpdated="April 20, 2026"
      intro={`This Privacy Policy describes how SOLVD ("the App," "we," "us," or "our") handles information in connection with your use of our iOS daily math puzzle app. Short version: SOLVD collects nothing. Everything you do in the app stays on your device.`}
      sections={[
        {
          number: "01",
          title: "Information We Collect",
          content: (
            <>
              <p>
                SOLVD does not collect any personal information. We do not collect your name, email
                address, phone number, location, IP address, device identifiers, or any other data
                that could be used to identify you.
              </p>
              <p>
                We do not use analytics services, crash reporters, advertising networks, or any other
                third-party SDK that would transmit data off your device.
              </p>
            </>
          ),
        },
        {
          number: "02",
          title: "Local Data on Your Device",
          content: (
            <>
              <p>
                SOLVD stores your puzzle progress, streak, badges, and settings locally on your
                device using iOS&apos;s built-in storage. This data never leaves your phone. We do
                not have access to it.
              </p>
              <p>
                If you delete the app, this local data is removed by iOS automatically.
              </p>
            </>
          ),
        },
        {
          number: "03",
          title: "Cookies & Tracking Technologies",
          content: (
            <p>
              SOLVD does not use cookies, web beacons, pixel tags, or any other tracking technologies.
            </p>
          ),
        },
        {
          number: "04",
          title: "Third-Party Services",
          content: (
            <>
              <p>
                SOLVD does not integrate with any third-party services. There is no advertising
                network, no analytics provider, no social media SDK, and no cloud backup.
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
            <p>
              SOLVD does not collect any personal information from anyone, including children under
              the age of 13. Because no data is collected at all, the app is safe for players of any
              age from a data-collection standpoint.
            </p>
          ),
        },
        {
          number: "06",
          title: "Data Security",
          content: (
            <p>
              Because we collect and transmit no data, there is no risk of your personal information
              being exposed through SOLVD. Local puzzle data on your device is protected by iOS&apos;s
              standard app sandboxing.
            </p>
          ),
        },
        {
          number: "07",
          title: "Your Rights",
          content: (
            <>
              <p>
                Because SOLVD collects no personal data, there is nothing tied to you that we could
                access, correct, delete, or export on your behalf. Your privacy is fully preserved by
                design.
              </p>
              <p>
                If you reside in the European Union, California, or another jurisdiction with
                specific privacy rights (such as GDPR or CCPA), the absence of any data collection
                means we do not hold personal data subject to those frameworks&apos; individual
                rights provisions.
              </p>
            </>
          ),
        },
        {
          number: "08",
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
          number: "09",
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

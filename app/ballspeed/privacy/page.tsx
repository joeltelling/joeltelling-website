import type { Metadata } from "next";
import LegalPage from "../../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - Ball Speed",
  description: "Privacy Policy for the Ball Speed iOS pitch speed app by Joel Telling.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Ball Speed · iOS App"
      iconSrc="/ballspeed-icon.png"
      iconAlt="Ball Speed app icon"
      effectiveDate="April 22, 2026"
      lastUpdated="April 22, 2026"
      intro={`This Privacy Policy describes how Ball Speed ("the App," "we," "us," or "our") handles information in connection with your use of our iOS pitch speed app. Short version: Ball Speed collects nothing. Every pitch you record stays on your device.`}
      sections={[
        {
          number: "01",
          title: "Information We Collect",
          content: (
            <>
              <p>
                Ball Speed does not collect any personal information. We do not collect your name,
                email address, phone number, location, IP address, device identifiers, or any other
                data that could be used to identify you.
              </p>
              <p>
                We do not use analytics services, crash reporters, advertising networks, or any
                other third-party SDK that would transmit data off your device.
              </p>
            </>
          ),
        },
        {
          number: "02",
          title: "Microphone Access",
          content: (
            <>
              <p>
                Ball Speed requests microphone access for one reason: to detect the impact sound of
                a pitched ball hitting a mitt or bat when you choose the audio-trigger capture
                method. The microphone is only active while you are in an active listening session
                on the Measure screen.
              </p>
              <p>
                Audio is <strong className="text-white">never recorded, stored, or transmitted</strong>.
                The app only reads live audio levels to detect an impact, then discards the data
                immediately. No audio ever leaves your device. If you prefer not to grant microphone
                access, you can use the Tap-to-Hold or Tap-Tap capture methods instead — both work
                fully offline and require no permissions.
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
                Ball Speed stores your pitch history (speed, distance, capture method, timestamp,
                and any optional pitcher/field tags you add) and your app settings locally on your
                device using iOS&apos;s built-in storage. This data never leaves your phone. We do
                not have access to it.
              </p>
              <p>
                You can delete individual pitches or clear all history at any time from within the
                app. If you delete Ball Speed, iOS automatically removes this local data.
              </p>
            </>
          ),
        },
        {
          number: "04",
          title: "Cookies & Tracking Technologies",
          content: (
            <p>
              Ball Speed does not use cookies, web beacons, pixel tags, or any other tracking
              technologies.
            </p>
          ),
        },
        {
          number: "05",
          title: "Third-Party Services",
          content: (
            <>
              <p>
                Ball Speed does not integrate with any third-party services. There is no advertising
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
          number: "06",
          title: "Children's Privacy",
          content: (
            <p>
              Ball Speed does not collect any personal information from anyone, including children
              under the age of 13. Because no data is collected at all, the app is safe for players
              of any age from a data-collection standpoint.
            </p>
          ),
        },
        {
          number: "07",
          title: "Data Security",
          content: (
            <p>
              Because we collect and transmit no data, there is no risk of your personal
              information being exposed through Ball Speed. Local pitch data on your device is
              protected by iOS&apos;s standard app sandboxing.
            </p>
          ),
        },
        {
          number: "08",
          title: "Your Rights",
          content: (
            <>
              <p>
                Because Ball Speed collects no personal data, there is nothing tied to you that we
                could access, correct, delete, or export on your behalf. Your privacy is fully
                preserved by design.
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
          number: "09",
          title: "Changes to This Policy",
          content: (
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              &quot;Last updated&quot; date at the top of this page. We encourage you to review this
              page periodically. Continued use of Ball Speed after any changes constitutes your
              acceptance of the updated policy.
            </p>
          ),
        },
        {
          number: "10",
          title: "Governing Law",
          content: (
            <p>
              This Privacy Policy is governed by and construed in accordance with applicable law.
              Any disputes arising in connection with this policy shall be resolved in the
              appropriate jurisdiction.
            </p>
          ),
        },
      ]}
      footer={
        <p>
          <strong className="text-white">Questions?</strong> If you have any questions about this
          Privacy Policy or our privacy practices, please reach out at{" "}
          <a
            href="mailto:ballspeed@joeltelling.com"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            ballspeed@joeltelling.com
          </a>
          .
        </p>
      }
    />
  );
}

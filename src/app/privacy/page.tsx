import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy · Dropship Navigator India",
  description: "How Dropship Navigator India collects, uses, and protects your data.",
};

const CONTACT_EMAIL = "dropshipnavigatorindia@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" lastUpdated="12 July 2026">
      <p>
        This Privacy Policy explains what personal data Dropship Navigator India (&ldquo;Navigator&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, how we use it, who we share it with, and your rights. It applies to
        the Navigator website and app. By using the Service you agree to this policy.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Account data</strong> — your email address, and (if you sign in with Google) basic profile information Google shares with us.</li>
        <li><strong>Seller profile data</strong> — the answers you give during onboarding and profile edits (e.g. experience level, budget band, state of operation, product category, GST status, business type, sales channels). This is business information you choose to enter.</li>
        <li><strong>Usage data</strong> — your progress through the journey, tool inputs and results you save, and settlement/reconciliation files you upload.</li>
        <li><strong>Payment data</strong> — handled by our payment provider (Razorpay). We receive your subscription status; we do <strong>not</strong> store your full card or bank details.</li>
        <li><strong>Support communications</strong> — messages you send us.</li>
      </ul>

      <h2>2. How we use your data</h2>
      <ul>
        <li>to create and manage your account and sign you in;</li>
        <li>to generate and personalize your launch plan, guidance, and calculations;</li>
        <li>to operate paid plans, billing, and per-plan limits;</li>
        <li>to respond to your requests and provide support;</li>
        <li>to maintain security, prevent abuse, and improve the Service;</li>
        <li>to meet legal and accounting obligations.</li>
      </ul>

      <h2>3. Legal basis &amp; consent</h2>
      <p>
        We process your data to provide the Service you asked for, to pursue our legitimate interests in running and
        improving it, to meet legal obligations, and — where required under India&rsquo;s Digital Personal Data
        Protection Act, 2023 — with your consent. You can withdraw consent by closing your account.
      </p>

      <h2>4. Where your data is stored</h2>
      <p>
        Your account and app data are stored in our database hosted by Supabase in the Mumbai (India) region. Some of
        the service providers below may process limited data outside India.
      </p>

      <h2>5. Service providers we share data with</h2>
      <p>We share the minimum necessary data with trusted providers who help us run the Service:</p>
      <ul>
        <li><strong>Supabase</strong> — database and authentication (hosting your account and app data).</li>
        <li><strong>Vercel</strong> — application hosting and delivery.</li>
        <li><strong>Razorpay</strong> — payment processing for subscriptions.</li>
        <li><strong>Google</strong> — optional &ldquo;Sign in with Google&rdquo; authentication.</li>
        <li><strong>Anthropic</strong> — the AI model that personalizes some guidance. When you use personalized plans, your non-identifying profile attributes (such as state, product category, and GST status) are sent to generate tailored copy. We do not send your name, email, or payment details for this purpose.</li>
        <li><strong>Email delivery</strong> — a mail service is used to send account emails such as confirmation and password reset.</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2>6. Cookies &amp; sessions</h2>
      <p>
        We use essential cookies to keep you signed in and to remember your active profile. These are necessary for the
        Service to work; we do not use them for third-party advertising.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We keep your data while your account is active. Detailed records such as uploaded settlement rows are retained
        only for the window allowed by your plan and then removed, with summaries kept. If you close your account, we
        delete or anonymize your personal data within a reasonable period, except where we must keep records to meet
        legal or accounting obligations.
      </p>

      <h2>8. Your rights</h2>
      <p>Subject to applicable law, you can:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>correct inaccurate data (you can edit most of it directly in the app);</li>
        <li>request deletion of your data by closing your account or contacting us;</li>
        <li>withdraw consent and stop using the Service.</li>
      </ul>
      <p>
        To exercise any of these, email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard measures — including access controls, encryption in transit, and per-user database
        security rules — to protect your data. No method of transmission or storage is completely secure, so we cannot
        guarantee absolute security. Keep your password safe and use a strong, unique one.
      </p>

      <h2>10. Children</h2>
      <p>The Service is intended for adults (18+) running or planning a business. It is not directed at children.</p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. If we make material changes, we will take reasonable steps to
        notify you. The &ldquo;Last updated&rdquo; date above shows the current version.
      </p>

      <h2>12. Contact &amp; grievances</h2>
      <p>
        For any privacy question, request, or grievance under the Digital Personal Data Protection Act, 2023, contact
        us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within a reasonable time.
      </p>
    </LegalShell>
  );
}

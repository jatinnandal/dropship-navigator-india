import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Terms & Conditions · Dropship Navigator India",
  description: "The terms that govern your use of Dropship Navigator India.",
};

const CONTACT_EMAIL = "dropshipnavigatorindia@gmail.com";

export default function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions" lastUpdated="12 July 2026">
      <p>
        Welcome to Dropship Navigator India (&ldquo;Navigator&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
        &ldquo;our&rdquo;). These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of our
        website, application, and services (together, the &ldquo;Service&rdquo;). By creating an account or using the
        Service, you agree to these Terms. If you do not agree, please do not use the Service.
      </p>

      <div className="legal-callout">
        <p>
          <strong>Important — please read this first.</strong> Navigator is an educational and guidance tool. All
          information, plans, checklists, calculators, tax and GST guidance, marketplace fees, timelines, and
          suggestions are provided on a <strong>best-of-knowledge, best-effort basis</strong>. They may be incomplete,
          outdated, or inaccurate, and rules, rates, and marketplace policies change frequently.
        </p>
        <p>
          Nothing in the Service is <strong>legal, tax, accounting, financial, or professional advice</strong>, and it
          should not be treated as legally or factually accurate. You are <strong>solely responsible</strong> for your
          own business, financial, tax, and compliance decisions and their outcomes. Always verify important information
          with the official source (e.g. the GST portal, the marketplace, your bank) and consult a qualified
          professional before acting.
        </p>
      </div>

      <h2>1. Who can use Navigator</h2>
      <p>
        You must be at least 18 years old and able to enter into a binding contract under Indian law. By using the
        Service you confirm that you meet these requirements and that the information you provide is accurate.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You are responsible for keeping your login credentials confidential and for all activity under your account.</li>
        <li>Provide accurate information and keep it up to date. Your personalized plan is only as good as the details you enter.</li>
        <li>Tell us promptly if you suspect any unauthorized use of your account.</li>
        <li>We may suspend or close accounts that breach these Terms or that we reasonably believe are being misused.</li>
      </ul>

      <h2>3. What Navigator does — and does not — do</h2>
      <p>
        Navigator helps first-time and growing Indian e-commerce sellers plan their launch: step-by-step guidance,
        checklists, calculators, and reference information. It is a <strong>mentor and organizer, not an authority</strong>.
      </p>
      <ul>
        <li>We do not file anything on your behalf, register you with any authority, or interact with any marketplace or government portal for you.</li>
        <li>We are not affiliated with, endorsed by, or acting for Amazon, Flipkart, Meesho, Shopify, Razorpay, the GST department, or any other third party mentioned in the Service.</li>
        <li>Numbers such as fees, RTO rates, break-even ROAS, and settlement timelines are <strong>estimates</strong> to help you plan, not guarantees.</li>
      </ul>

      <h2>4. No guarantee of results</h2>
      <p>
        E-commerce involves real risk. We make no promise that using Navigator will lead to any particular sales,
        profit, savings, or business outcome. Any examples or figures are illustrative. Your results depend on your own
        products, effort, market conditions, and many factors outside our control.
      </p>

      <h2>5. Plans, billing &amp; payments</h2>
      <ul>
        <li>Navigator offers a free tier and paid subscription plans. Paid features are described at the time of purchase.</li>
        <li>Payments are processed by our third-party payment provider (Razorpay). We do not store your full card or bank details.</li>
        <li>Paid subscriptions renew automatically for the chosen billing period until cancelled. You can cancel from within the app; cancellation stops future renewals and access continues until the end of the current paid period.</li>
        <li>Prices are in Indian Rupees and may include applicable taxes. We may change prices with reasonable notice; changes do not affect the period you have already paid for.</li>
        <li>Except where required by law, payments are <strong>non-refundable</strong>. If you believe you were charged in error, contact us and we will review it in good faith.</li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service for anything unlawful, or to plan or support unlawful activity;</li>
        <li>copy, scrape, resell, or redistribute the Service or its content, or use it to build a competing product;</li>
        <li>attempt to break, overload, reverse-engineer, or gain unauthorized access to the Service or other users&rsquo; data;</li>
        <li>share your account with others or misuse per-plan limits (e.g. creating multiple profiles to bypass caps).</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        The Service, including its content, design, text, and software, belongs to us or our licensors. We grant you a
        limited, personal, non-transferable licence to use the Service for your own business while these Terms apply.
        Information you enter remains yours; you grant us permission to process it to provide the Service (see our{" "}
        <a href="/privacy">Privacy Policy</a>).
      </p>

      <h2>8. Third-party services</h2>
      <p>
        The Service relies on and may link to third parties (for example Razorpay for payments, Google for sign-in,
        marketplaces, and government portals). We are not responsible for their content, availability, or practices, and
        your use of them is governed by their own terms.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Navigator and its team will not be liable for any indirect, incidental,
        or consequential loss, or for any loss of profits, revenue, data, or business, arising from your use of or
        reliance on the Service. Our total liability for any claim relating to the Service will not exceed the amount you
        paid us for the Service in the 3 months before the claim (or ₹0 if you use the free tier). Nothing in these Terms
        limits liability that cannot be limited under Indian law.
      </p>

      <h2>10. Indemnity</h2>
      <p>
        You agree to indemnify and hold us harmless from claims, losses, and expenses arising out of your use of the
        Service, your business decisions, or your breach of these Terms.
      </p>

      <h2>11. Changes to the Service and these Terms</h2>
      <p>
        We may update, change, or discontinue parts of the Service, and we may update these Terms from time to time.
        If we make material changes, we will take reasonable steps to notify you. Continuing to use the Service after
        changes take effect means you accept the updated Terms.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using the Service and close your account at any time. We may suspend or end your access if you
        breach these Terms or if we stop offering the Service. Sections that by their nature should survive (such as
        disclaimers, limitation of liability, and indemnity) will continue to apply.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the
        competent courts in India.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms? Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}

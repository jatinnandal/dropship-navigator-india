import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dropship-navigator-india.vercel.app";

const DESCRIPTION =
  "From first doubt to first payout. An India-first mentor for new e-commerce and dropshipping sellers on Meesho, Amazon, Flipkart and Shopify: GST registration, supplier sourcing, margins, RTO, and payout reconciliation - step by step.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Dropship Navigator India - seller mentor for Meesho, Amazon & Flipkart",
  description: DESCRIPTION,
  applicationName: "Dropship Navigator India",
  keywords: [
    "how to sell on Meesho",
    "sell on Amazon India",
    "Flipkart seller",
    "GST for online sellers",
    "dropshipping India",
    "RTO meaning",
    "ecommerce seller India",
    "margin calculator India",
    "payout reconciliation",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Dropship Navigator India",
    title: "Dropship Navigator India - seller mentor for India",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dropship Navigator India",
    description: "From first doubt to first payout. India-first mentor for new online sellers.",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dropship Navigator India",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: "en-IN",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "0",
    highPrice: "199",
    offerCount: "3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        {children}
      </body>
    </html>
  );
}

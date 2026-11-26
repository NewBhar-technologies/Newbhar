import { InfoPage } from "@/components/section";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Newbhar Technologies. Learn how we handle information, data privacy, and confidentiality.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy | ${SITE.name}`,
    description:
      "Privacy policy for Newbhar Technologies. Learn how we handle information, data privacy, and confidentiality.",
    url: `${SITE.url}/privacy-policy`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Privacy Policy - ${SITE.name}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${SITE.name}`,
    description:
      "Privacy policy for Newbhar Technologies. Learn how we handle information, data privacy, and confidentiality.",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Privacy Policy - ${SITE.name}`,
      },
    ],
  },
};
export default function Privacy() {
  return <InfoPage eyebrow="Legal" title="Privacy Policy" blocks={[
    ["Overview", "Newbhar Technologies respects your privacy and is committed to protecting any personal information you share with us. We adhere to privacy-by-design and GDPR principles."],
    ["Information we collect", "This website does not collect personal data without your knowledge. When you reach out via our contact forms or email, your information is used solely to respond to your project enquiry and is never sold or shared."],
    ["Cookies & Analytics", "We implement a strict opt-in cookie consent model. Optional analytics cookies are disabled by default and activate only with your explicit consent. When permitted, we collect anonymous, aggregated metrics only; we never store IP addresses, personal identifiers, session recordings, or browser fingerprints in our database. You can adjust your preferences or revoke consent at any time via the Cookie Settings link in the footer."],
    ["Contact", "Questions about privacy or data handling can be sent to our privacy team at contact@newbhar.com."],
  ]} />;
}

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
    ["Overview", "Newbhar Technologies respects your privacy and is committed to protecting any personal information you share with us."],
    ["Information we collect", "This website is static and does not collect personal data itself. If you email us, we store what you send to respond to your enquiry."],
    ["Contact", "Questions about privacy can be sent to the email address on our Contact page."],
  ]} />;
}

import { SITE } from "@/lib/site";
import { PageHeader, Section, CTA } from "@/components/section";
import { Steps } from "@/components/cards";

export const metadata = {
  title: "How We Work",
  description:
    "Learn about our transparent engineering process at Newbhar Technologies: Discover, Design, Build, and Launch & Support with clear milestones.",
  alternates: {
    canonical: "/how-we-work",
  },
  openGraph: {
    title: `How We Work | ${SITE.name}`,
    description:
      "Learn about our transparent engineering process at Newbhar Technologies: Discover, Design, Build, and Launch & Support with clear milestones.",
    url: `${SITE.url}/how-we-work`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `How We Work - ${SITE.name}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `How We Work | ${SITE.name}`,
    description:
      "Learn about our transparent engineering process at Newbhar Technologies: Discover, Design, Build, and Launch & Support with clear milestones.",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `How We Work - ${SITE.name}`,
      },
    ],
  },
};
export default function HowWeWork() {
  return (
    <>
      <PageHeader eyebrow="How we work" title="Clear steps. No surprises." intro="A process built around communication, short feedback loops and shipping early." />
      <Section><Steps /></Section>
      <CTA />
    </>
  );
}

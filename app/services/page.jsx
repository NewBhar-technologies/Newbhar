import { SITE } from "@/lib/site";
import { PageHeader, Section, CTA } from "@/components/section";
import { ServiceGrid } from "@/components/cards";

export const metadata = {
  title: "Software Development & Digital Services",
  description:
    "Explore end-to-end digital engineering services by Newbhar Technologies: custom software, web development, mobile apps, AI & ML, data science, and cloud DevOps.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: `Software Development & Digital Services | ${SITE.name}`,
    description:
      "Explore end-to-end digital engineering services by Newbhar Technologies: custom software, web development, mobile apps, AI & ML, data science, and cloud DevOps.",
    url: `${SITE.url}/services`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Software Development & Digital Services - ${SITE.name}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Software Development & Digital Services | ${SITE.name}`,
    description:
      "Explore end-to-end digital engineering services by Newbhar Technologies: custom software, web development, mobile apps, AI & ML, data science, and cloud DevOps.",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Software Development & Digital Services - ${SITE.name}`,
      },
    ],
  },
};
export default function Services() {
  return (
    <>
      <PageHeader eyebrow="Services" title="End-to-end digital engineering." intro="Pick one service or combine several. We scale the team to what your project needs." />
      <Section><ServiceGrid /></Section>
      <CTA />
    </>
  );
}

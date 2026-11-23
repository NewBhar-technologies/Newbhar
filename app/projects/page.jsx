import { SITE } from "@/lib/site";
import { PageHeader, Section, CTA } from "@/components/section";
import { ProjectGrid } from "@/components/cards";

export const metadata = {
  title: "Our Projects",
  description:
    "Case studies and engineering projects delivered by Newbhar Technologies: ERP platforms, offline-first mobile apps, and data & AI analytics dashboards.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Our Projects | ${SITE.name}`,
    description:
      "Case studies and engineering projects delivered by Newbhar Technologies: ERP platforms, offline-first mobile apps, and data & AI analytics dashboards.",
    url: `${SITE.url}/projects`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Our Projects - ${SITE.name}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Our Projects | ${SITE.name}`,
    description:
      "Case studies and engineering projects delivered by Newbhar Technologies: ERP platforms, offline-first mobile apps, and data & AI analytics dashboards.",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Our Projects - ${SITE.name}`,
      },
    ],
  },
};
export default function Projects() {
  return (
    <>
      <PageHeader eyebrow="Projects" title="Work we're proud of." intro="A selection of systems, apps and platforms we've designed and built." />
      <Section><ProjectGrid /></Section>
      <CTA />
    </>
  );
}

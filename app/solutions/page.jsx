import { PageHeader, Section, CTA, card } from "@/components/section";
import { SITE, SOLUTIONS } from "@/lib/site";

export const metadata = {
  title: "Technology Solutions",
  description:
    "Tailored digital solutions by Newbhar Technologies: ERP systems, customer platforms, mobile applications, AI workflow automation, and cloud modernisation.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    title: `Technology Solutions by Newbhar | ${SITE.name}`,
    description:
      "Tailored digital solutions by Newbhar Technologies: ERP systems, customer platforms, mobile applications, AI workflow automation, and cloud modernisation.",
    url: `${SITE.url}/solutions`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Technology Solutions - ${SITE.name}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Technology Solutions by Newbhar | ${SITE.name}`,
    description:
      "Tailored digital solutions by Newbhar Technologies: ERP systems, customer platforms, mobile applications, AI workflow automation, and cloud modernisation.",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Technology Solutions - ${SITE.name}`,
      },
    ],
  },
};
export default function Solutions() {
  return (
    <>
      <PageHeader eyebrow="Solutions" title="Solutions for real business problems." intro="Common problems we solve, and the systems we build to fix them." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => <div key={s.title} className={card}><h3 className="mb-2 text-lg font-semibold tracking-[-0.03em]">{s.title}</h3><p className="text-sm leading-relaxed text-muted">{s.text}</p></div>)}
        </div>
      </Section>
      <CTA />
    </>
  );
}

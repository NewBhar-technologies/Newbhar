import { InfoPage } from "@/components/section";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using the Newbhar Technologies website and engaging with our digital engineering services.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: `Terms & Conditions | ${SITE.name}`,
    description:
      "Terms and conditions for using the Newbhar Technologies website and engaging with our digital engineering services.",
    url: `${SITE.url}/terms-and-conditions`,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Terms & Conditions - ${SITE.name}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms & Conditions | ${SITE.name}`,
    description:
      "Terms and conditions for using the Newbhar Technologies website and engaging with our digital engineering services.",
    images: [
      {
        url: `${SITE.url}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `Terms & Conditions - ${SITE.name}`,
      },
    ],
  },
};
export default function Terms() {
	return (
		<InfoPage
			eyebrow="Legal"
			title="Terms & Conditions"
			blocks={[
				["Use of this website", "By accessing or using the Newbhar Technologies website, you agree to comply with and be bound by these terms."],
				["Content", "Information on this site is provided for general purposes and may change without notice."],
				["Projects", "Services are governed by a separate written agreement signed by both parties."],
			]}
		/>
	);
}

import "./globals.css";
import { SITE } from "@/lib/site";
import PublicShell from "@/components/public-shell";

const siteTitle = `${SITE.name} | Custom Software & Digital Engineering`;
const siteDescription =
  "Custom software development, web platforms, mobile apps, and cloud engineering.";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: siteTitle,
    template: `%s | ${SITE.name}`,
  },
  description: siteDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/newbhar-mark.png", type: "image/png" },
    ],
    apple: "/newbhar-mark.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: "/newbhar-banner.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} Digital Engineering`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/newbhar-banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f3f7",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  alternateName: "Newbhar Technologies",
  url: SITE.url,
  logo: `${SITE.url}/newbhar-mark.png`,
  image: `${SITE.url}/newbhar-banner.jpg`,
  description: siteDescription,
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: SITE.email,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}

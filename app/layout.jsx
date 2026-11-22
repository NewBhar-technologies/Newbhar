
import "./globals.css";
import { SITE } from "@/lib/site";
import PublicShell from "@/components/public-shell";

const siteTitle = `${SITE.name} | Custom Software & Digital Engineering`;

const siteDescription =
  "Custom software development, web platforms, mobile apps, AI solutions, and cloud engineering.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: "Newbhar",
      url: `${SITE.url}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/newbhar-mark.png`,
      },
      image: `${SITE.url}/newbhar-banner.jpg`,
      description: siteDescription,
      email: SITE.email,
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      alternateName: "Newbhar",
      url: `${SITE.url}/`,
      inLanguage: "en-IN",
      publisher: {
        "@id": `${SITE.url}/#organization`,
      },
    },
  ],
};

export const metadata = {
  metadataBase: new URL(`${SITE.url}/`),

  title: {
    default: siteTitle,
    template: `%s | ${SITE.name}`,
  },

  description: siteDescription,

  applicationName: SITE.name,

  authors: [
    {
      name: SITE.name,
      url: SITE.url,
    },
  ],

  creator: SITE.name,
  publisher: SITE.name,

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      {
        url: "/newbhar-mark.png",
        type: "image/png",
        sizes: "96x96",
      },
    ],
    apple: [
      {
        url: "/newbhar-mark.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE.url}/`,
    siteName: SITE.name,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/newbhar-banner.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} - Custom Software & Digital Engineering`,
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/newbhar-banner.jpg",
        alt: `${SITE.name} Digital Engineering`,
      },
    ],
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
  themeColor: "#08080a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </head>

      <body className="bg-background font-sans text-foreground antialiased">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}

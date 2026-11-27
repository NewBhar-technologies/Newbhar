
import "./globals.css";
import { SITE } from "@/lib/site";
import PublicShell from "@/components/public-shell";

const siteTitle = `${SITE.name} | Custom Software & Digital Engineering`;

const siteDescription =
  "Custom software development, web platforms, mobile apps, AI solutions, and cloud engineering.";

// Normalize the website URL to prevent duplicate slashes.
const siteUrl = SITE.url.replace(/\/+$/, "");

const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE.name,
      alternateName: "Newbhar",
      url: `${siteUrl}/`,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: `${siteUrl}/newbhar-technologies-logo.png`,
        contentUrl: `${siteUrl}/newbhar-technologies-logo.png`,
        width: 512,
        height: 512,
        caption: `${SITE.name} Official Company Logo`,
      },
      image: {
        "@type": "ImageObject",
        url: `${siteUrl}/newbhar-banner.jpg`,
        width: 1200,
        height: 630,
        caption: `${SITE.name} Official Website Banner`,
      },
      description: siteDescription,
      email: SITE.infoEmail || "info@newbhar.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "general inquiries",
          email: "info@newbhar.com",
          availableLanguage: ["English", "Hindi"],
        },
        {
          "@type": "ContactPoint",
          contactType: "customer contact",
          email: "contact@newbhar.com",
          availableLanguage: ["English", "Hindi"],
        },
        {
          "@type": "ContactPoint",
          contactType: "technical support",
          email: "support@newbhar.com",
          availableLanguage: ["English", "Hindi"],
        },
      ],
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE.name,
      alternateName: "Newbhar",
      url: `${siteUrl}/`,
      inLanguage: "en-IN",
      publisher: {
        "@id": organizationId,
      },
    },
  ],
};

export const metadata = {
  metadataBase: new URL(`${siteUrl}/`),

  title: {
    default: siteTitle,
    template: `%s | ${SITE.name}`,
  },

  description: siteDescription,

  applicationName: SITE.name,

  authors: [
    {
      name: SITE.name,
      url: `${siteUrl}/`,
    },
  ],

  creator: SITE.name,
  publisher: SITE.name,

  alternates: {
    canonical: `${siteUrl}/`,
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${siteUrl}/`,
    siteName: SITE.name,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/newbhar-banner.jpg`,
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
        url: `${siteUrl}/newbhar-banner.jpg`,
        alt: `${SITE.name} - Custom Software & Digital Engineering`,
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
          id="newbhar-structured-data"
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

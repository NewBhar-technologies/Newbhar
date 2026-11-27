import Link from "next/link";
import { InfoPage } from "@/components/section";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "Terms & Conditions governing the use of the Newbhar Technologies website (newbhar.com), intellectual property rights, acceptable usage, and digital engineering engagement boundaries.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: `Terms & Conditions | ${SITE.name}`,
    description:
      "Terms & Conditions for Newbhar Technologies. Legal terms covering website usage, intellectual property, disclaimers, liability limitations, and governing law.",
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
      "Terms & Conditions governing use of the Newbhar Technologies platform and engineering advisory interfaces.",
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
  const blocks = [
    [
      "Agreement to Terms & Website Scope",
      <>
        <p>
          Welcome to the official website of <strong>Newbhar Technologies</strong> (&ldquo;Newbhar&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at{" "}
          <Link href="/">https://newbhar.com</Link>. These Terms &amp; Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Visitor&rdquo;, or &ldquo;you&rdquo;) and Newbhar Technologies regarding your access to and browsing of our website, digital portfolios, and inquiry interfaces.
        </p>
        <p>
          By accessing, navigating, or utilizing this website, you confirm that you have read, understood, and agreed to be bound by these Terms and our companion{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>. If you do not agree with any provision of these Terms, you must discontinue your use of this website immediately.
        </p>
        <div className="vx-info-callout">
          <p>
            <strong>Eligibility:</strong> This website is intended for business entities, professionals, and individuals who are at least eighteen (18) years of age or have attained the age of legal majority in their jurisdiction.
          </p>
        </div>
      </>,
    ],
    [
      "Client Projects Require Separate Written Contracts",
      <>
        <p>
          <strong>Essential Legal Distinction:</strong> This website is an informational portal designed to showcase our capabilities, technical proficiencies, past case studies, and engineering philosophy.
        </p>
        <ul>
          <li>
            <strong>No Binding Engagement via Website:</strong> Browsing this site, submitting a contact inquiry, sharing a project brief, receiving an automated confirmation receipt, or scheduling a technical discovery call does <strong>not</strong> create a binding contract for professional software development, consulting, cloud architecture, or engineering services.
          </li>
          <li>
            <strong>Separate Formal Contract Required:</strong> All commercial client engagements, deliverables, delivery timelines, payment schedules, intellectual property transfers, warranties, service level agreements (SLAs), and non-disclosure obligations are strictly governed by independent, bilateral written agreements.
          </li>
          <li>
            <strong>Contract Precedence:</strong> Client projects require formally executed <strong>Master Services Agreements (MSA)</strong>, <strong>Statements of Work (SOW)</strong>, or <strong>Non-Disclosure Agreements (NDA)</strong> signed by authorized corporate signatories. In the event of any conflict between these website Terms and an executed client agreement, the terms of the signed client agreement shall prevail exclusively.
          </li>
        </ul>
      </>,
    ],
    [
      "Intellectual Property & Website Content Ownership",
      <>
        <p>
          All intellectual property rights in and to this website and its entire contents are the exclusive property of Newbhar Technologies or its licensors:
        </p>
        <ul>
          <li>
            <strong>Protected Assets:</strong> The Newbhar Technologies name, company logo, domain name (newbhar.com), source code, user interface components, responsive layout systems, illustrations, motion animations, technical writings, brand design, and curated case studies are protected under the <strong>Indian Copyright Act, 1957</strong>, the <strong>Trade Marks Act, 1999</strong>, and international intellectual property conventions.
          </li>
          <li>
            <strong>Limited Visitor License:</strong> You are granted a limited, non-exclusive, revocable, non-transferable, non-sublicensable license to view, browse, and temporarily cache pages of this website for internal business evaluation purposes.
          </li>
          <li>
            <strong>Explicit Restrictions:</strong> You shall not copy, reproduce, republish, distribute, broadcast, display publicly, decompile, reverse-engineer, mirror, frame, extract, or scrape any portion of our website code, styling, or documentation for commercial exploitation without prior written authorization from Newbhar Technologies.
          </li>
        </ul>
      </>,
    ],
    [
      "Acceptable Website Usage",
      <>
        <p>
          You agree to interact with this website strictly for lawful, legitimate business purposes and in adherence with all applicable local, national, and international laws and regulations. You specifically agree not to:
        </p>
        <ul>
          <li>
            Introduce any viruses, trojans, worms, logic bombs, or other technologically malicious materials to our infrastructure.
          </li>
          <li>
            Attempt to gain unauthorized access to our web servers, administrative portals, databases, or API infrastructure.
          </li>
          <li>
            Engage in automated scraping, data extraction, harvesting, or crawling of website contents without explicit written consent.
          </li>
          <li>
            Bypass, manipulate, or probe our security mechanisms, rate limiters, honeypots, or request payload size restrictions.
          </li>
          <li>
            Transmit deceptive, fraudulent, defamatory, obscene, or abusive communications through our contact or project brief forms.
          </li>
          <li>
            Use the website in any manner that could disable, overburden, impair, or compromise our web servers or networks, in violation of the <strong>Information Technology Act, 2000 (India)</strong> and related cyber defense frameworks.
          </li>
        </ul>
      </>,
    ],
    [
      "Third-Party Links & External Services",
      <>
        <p>
          For convenience, our website may display links to external websites, platforms, or services that are not owned or operated by Newbhar Technologies (including LinkedIn, GitHub, and Instagram).
        </p>
        <ul>
          <li>
            <strong>No Endorsement or Control:</strong> The inclusion of any third-party link does not constitute an endorsement, sponsorship, or recommendation by Newbhar Technologies. We have no control over the content, security practices, or privacy policies of third-party platforms.
          </li>
          <li>
            <strong>Assumption of Risk:</strong> If you elect to navigate to third-party services, you do so entirely at your own discretion and subject to the respective third party&rsquo;s terms and policies.
          </li>
        </ul>
      </>,
    ],
    [
      "Disclaimer of Warranties",
      <>
        <p>
          This website, its content, case studies, technology overviews, and general insights are provided on an <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong> basis without warranties of any kind, whether express, statutory, or implied.
        </p>
        <p>
          To the maximum extent permissible under applicable law, Newbhar Technologies expressly disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, uninterrupted accessibility, and absence of computer bugs or errors.
        </p>
        <div className="vx-info-callout">
          <p>
            <strong>Informational Nature:</strong> Content published on this website is for informational and exploratory guidance only. It does not constitute binding technical architecture advice, legal guidance, or contractual commitments.
          </p>
        </div>
      </>,
    ],
    [
      "Limitation of Liability",
      <>
        <p>
          To the fullest extent permitted by applicable Indian law, under no circumstances shall Newbhar Technologies, its founders, directors, employees, contractors, partners, or agents be liable for:
        </p>
        <ul>
          <li>
            Any indirect, incidental, consequential, special, punitive, or exemplary damages whatsoever.
          </li>
          <li>
            Any loss of profits, commercial revenue, anticipated savings, goodwill, business opportunities, data loss, or server downtime.
          </li>
          <li>
            Any damages arising out of or related to your use of, inability to use, or reliance on information presented on this website.
          </li>
        </ul>
        <p>
          In jurisdictions where the exclusion or limitation of liability for consequential or incidental damages is restricted, our liability shall be limited to the minimum amount permitted by applicable law, or an aggregate ceiling of <strong>INR 1,000 (Indian Rupees One Thousand)</strong>.
        </p>
      </>,
    ],
    [
      "Indemnification",
      <>
        <p>
          You agree to defend, indemnify, and hold harmless Newbhar Technologies, its officers, directors, employees, and authorized agents from and against any third-party claims, liabilities, damages, losses, costs, and expenses (including reasonable legal and attorney fees) arising out of or in any way connected with:
        </p>
        <ul>
          <li>Your breach or violation of these Terms.</li>
          <li>Your misuse or unlawful access of this website or its underlying APIs.</li>
          <li>Your infringement of any intellectual property, privacy, or proprietary rights of any third party.</li>
        </ul>
      </>,
    ],
    [
      "Modifications to Website & Terms",
      <>
        <p>
          Newbhar Technologies reserves the right to modify, amend, suspend, or discontinue any feature, page, or service capability on this website at any time without prior individual notice.
        </p>
        <p>
          We may update these Terms periodically to reflect evolving legal mandates, technological shifts, or operational adjustments. When changes are made, the &ldquo;Last Revised&rdquo; timestamp below will be updated. Your continued use of the website following published updates signifies your binding acceptance of the revised Terms.
        </p>
      </>,
    ],
    [
      "Applicable Indian Law, Jurisdiction & Dispute Resolution",
      <>
        <p>
          These Terms, their interpretation, validity, and any dispute, controversy, or claim arising out of or in connection with them or your usage of this website shall be governed by and construed in accordance with the substantive <strong>laws of the Republic of India</strong>, including the <strong>Indian Contract Act, 1872</strong>, the <strong>Information Technology Act, 2000</strong>, and statutory amendments thereto.
        </p>
        <div className="vx-info-callout">
          <p>
            <strong>Exclusive Jurisdiction:</strong> You irrevocably agree that the competent courts situated in <strong>Kolkata, West Bengal, India</strong> shall have exclusive territorial and subject-matter jurisdiction to resolve any lawsuit, claim, or legal dispute arising from or related to these Terms or newbhar.com.
          </p>
        </div>
      </>,
    ],
    [
      "Severability & Legal Contact",
      <>
        <p>
          If any provision of these Terms is deemed unlawful, void, or for any reason unenforceable by a court of competent jurisdiction, that specific provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of these Terms shall not be construed as a waiver of such right or provision.
        </p>
        <div className="vx-info-callout">
          <p>
            <strong>Official Legal Contact:</strong><br />
            <strong>Entity:</strong> Newbhar Technologies<br />
            <strong>Legal Correspondence:</strong> <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a><br />
            <strong>General Inquiries:</strong> <a href={`mailto:${SITE.infoEmail}`}>{SITE.infoEmail}</a><br />
            <strong>Registered Location:</strong> Kolkata, West Bengal, India &middot; PIN 700109
          </p>
        </div>
        <p className="text-xs text-zinc-500 font-mono mt-4">
          Document Reference: NB-LEGAL-TERMS-V2.1 &middot; Last Revised: November 2026
        </p>
      </>,
    ],
  ];

  return <InfoPage eyebrow="Legal & Compliance" title="Terms & Conditions" blocks={blocks} />;
}

import Link from "next/link";
import { InfoPage } from "@/components/section";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Newbhar Technologies. Learn how we collect, process, store, and protect your information in accordance with Indian DPDP Act 2023 and GDPR principles.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy | ${SITE.name}`,
    description:
      "Privacy Policy for Newbhar Technologies. Transparent information on data collection, processing, storage, cookie governance, and privacy rights.",
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
      "Privacy Policy for Newbhar Technologies. Learn how we handle your personal data and respect your digital privacy rights.",
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
  const blocks = [
    [
      "Scope & Data Fiduciary Details",
      <>
        <p>
          Newbhar Technologies (&ldquo;Newbhar&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the digital engineering website{" "}
          <Link href="/">https://newbhar.com</Link>. We are committed to safeguarding the privacy and personal data of everyone who interacts with our online platform.
        </p>
        <p>
          Under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong>, Newbhar Technologies acts as the <strong>Data Fiduciary</strong> in relation to personal data provided through this website. Where our operations engage with prospective clients or website visitors residing in the European Economic Area (EEA) or the United Kingdom, we adhere to the principles of the <strong>General Data Protection Regulation (GDPR / UK GDPR)</strong> as a Data Controller.
        </p>
        <div className="vx-info-callout">
          <p>
            <strong>Effective Date:</strong> November 2026 &middot; <strong>Headquarters:</strong> Kolkata, West Bengal, India (PIN 700109). This Privacy Policy applies exclusively to personal data collected through newbhar.com and related direct electronic correspondence.
          </p>
        </div>
      </>,
    ],
    [
      "Information We Collect",
      <>
        <p>
          We adhere to strict data minimization principles. We only collect information that is genuinely necessary to address your technical inquiries, scope potential software engineering collaborations, and maintain infrastructure security.
        </p>
        <h3>1. Information You Voluntarily Provide</h3>
        <ul>
          <li>
            <strong>Contact &amp; Discovery Inquiries:</strong> When you complete our contact form (<Link href="/contact">/contact</Link>) or initiate a project brief (<Link href="/start-project">/start-project</Link>), we collect your full name, business email address, company or organization name, service domain of interest, estimated investment budget, desired delivery timeline, and project description.
          </li>
          <li>
            <strong>Direct Electronic Communications:</strong> If you contact us directly via email (<a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> or <a href={`mailto:${SITE.infoEmail}`}>{SITE.infoEmail}</a>), we retain your email address and message contents to fulfill your request.
          </li>
        </ul>

        <h3>2. Information Collected Automatically for Security</h3>
        <p>
          When you access our website, our server infrastructure temporarily logs standard HTTP headers:
        </p>
        <ul>
          <li>
            <strong>Client IP Address:</strong> Used solely in memory and security middleware for real-time rate limiting, DDoS defense, bot filtration, and spam prevention. We <strong>never</strong> store or associate IP addresses with visitor identities in our analytics database.
          </li>
          <li>
            <strong>Device &amp; User-Agent Attributes:</strong> Parsed anonymously to determine general browser engine, operating system family, and device category (Desktop, Tablet, Mobile) to ensure responsive rendering.
          </li>
          <li>
            <strong>Honeypot Anti-Spam Fields:</strong> Hidden form fields are utilized to detect automated bots. Any data entered into honeypot inputs is silently discarded and discarded immediately.
          </li>
        </ul>

        <div className="vx-info-callout">
          <p>
            <strong>No Sensitive Data:</strong> We never solicit, process, or store sensitive categories of personal data (e.g., government identification numbers, biometrics, financial card details, religious beliefs, or health information) through this website.
          </p>
        </div>
      </>,
    ],
    [
      "Purposes & Legal Bases for Processing",
      <>
        <p>
          We process personal data strictly in accordance with recognized lawful grounds under applicable data protection statutes:
        </p>
        <ul>
          <li>
            <strong>Pre-Contractual Steps &amp; Technical Discovery:</strong> Evaluating incoming project specifications, analyzing technical feasibility, estimating engineering effort, and preparing tailored service proposals requested by you.
          </li>
          <li>
            <strong>Client Communication &amp; Confirmation:</strong> Sending automated submission confirmation receipts containing a unique reference identifier (e.g., NB-REF) and coordinating project discovery communications.
          </li>
          <li>
            <strong>Legitimate Business Interests &amp; Cyber Defense:</strong> Monitoring server health, mitigating automated brute-force attacks, enforcing input payload size limits (32KB), and safeguarding our digital systems.
          </li>
          <li>
            <strong>Explicit Consent:</strong> Collecting anonymous, aggregated metrics on website interaction patterns through optional analytics cookies, active <em>only</em> if affirmative consent is granted.
          </li>
          <li>
            <strong>Statutory Compliance:</strong> Fulfilling tax, corporate reporting, and lawful governmental regulatory requests under applicable Indian law.
          </li>
        </ul>
        <p>
          <strong>Zero Commercial Monetization:</strong> We do not sell, rent, lease, barter, or distribute your personal contact information to third-party data brokers, marketers, or advertisers under any circumstances.
        </p>
      </>,
    ],
    [
      "Email Communications & Third-Party Service Providers",
      <>
        <p>
          To maintain dependable infrastructure, high availability, and swift communication, Newbhar Technologies engages reputable enterprise infrastructure providers who process data strictly under confidentiality agreements:
        </p>
        <div className="vx-info-table-wrapper">
          <table className="vx-info-table">
            <thead>
              <tr>
                <th>Service Provider</th>
                <th>Role &amp; Processing Scope</th>
                <th>Data Safeguards</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Resend Inc.</strong></td>
                <td>Transactional email dispatch engine for internal administrative alerts and visitor inquiry confirmations.</td>
                <td>TLS in transit, SOC 2 Type II compliant, strict API authentication.</td>
              </tr>
              <tr>
                <td><strong>Supabase Inc.</strong></td>
                <td>Managed PostgreSQL cloud database storing inquiry contact records and operational logs.</td>
                <td>AES-256 encryption at rest, TLS 1.3 in transit, automated backups, row-level security.</td>
              </tr>
              <tr>
                <td><strong>Vercel Inc.</strong></td>
                <td>Next.js edge serverless hosting and global Content Delivery Network (CDN).</td>
                <td>ISO 27001, SOC 2 compliant, DDoS mitigation, edge caching.</td>
              </tr>
              <tr>
                <td><strong>Google Analytics (Optional)</strong></td>
                <td>Consent-gated website traffic analytics (Google LLC).</td>
                <td>IP anonymization enabled, data processing restrictions, zero ad personalization.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>,
    ],
    [
      "Cookie Governance & Browser Storage Audit",
      <>
        <p>
          Newbhar Technologies employs an uncompromising <strong>opt-in consent model</strong>. When you visit newbhar.com, all optional analytics tracking scripts and persistent identifiers are disabled by default until you provide affirmative consent.
        </p>
        <h3>Detailed Breakdown of Cookies &amp; Local Storage</h3>
        <div className="vx-info-table-wrapper">
          <table className="vx-info-table">
            <thead>
              <tr>
                <th>Storage Key / Cookie</th>
                <th>Type &amp; Category</th>
                <th>Lifespan</th>
                <th>Operational Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>newbhar_cookie_consent</code></td>
                <td><span className="vx-info-badge">Necessary</span> (LocalStorage)</td>
                <td>Persistent</td>
                <td>Stores your cookie consent preferences (accepted / rejected / undecided) locally in your browser. Never uploaded to a backend database.</td>
              </tr>
              <tr>
                <td><code>newbhar_admin_session</code></td>
                <td><span className="vx-info-badge">Necessary</span> (HTTP Cookie)</td>
                <td>24 Hours</td>
                <td>Secure, HttpOnly, SameSite=Lax cookie used solely for authenticated staff access to the administrative portal (/admin). Never issued to public visitors.</td>
              </tr>
              <tr>
                <td><code>newbhar_visitor_id</code></td>
                <td>Optional (LocalStorage)</td>
                <td>Until Revoked</td>
                <td>Randomized anonymous identifier (e.g., vis_*) created <em>only after explicit consent</em> to measure aggregate page visits.</td>
              </tr>
              <tr>
                <td><code>newbhar_session_id</code></td>
                <td>Optional (SessionStorage)</td>
                <td>Session Close</td>
                <td>Randomized session token (e.g., ses_*) tracking navigation flow during a single visit. Automatically wiped when the browser tab closes.</td>
              </tr>
              <tr>
                <td><code>_ga</code>, <code>_gid</code></td>
                <td>Optional (HTTP Cookies)</td>
                <td>24h &ndash; 2 Years</td>
                <td>Google Analytics 4 cookies with IP anonymization, activated only upon explicit consent to understand traffic trends.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Withdrawing Consent at Any Time:</strong> You maintain full autonomy over your privacy. You can reopen your preferences, toggle analytics, or execute an immediate &ldquo;Reject All&rdquo; purge at any moment using our footer tool:
        </p>
        <div className="mt-3">
          <CookieSettingsButton className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm text-[#98f90d] border border-[#98f90d]/30 font-medium transition-colors">
            Manage Cookie &amp; Privacy Preferences
          </CookieSettingsButton>
        </div>
      </>,
    ],
    [
      "Data Storage, Retention & Deletion",
      <>
        <p>
          All electronic data captured via this website is stored within secure, access-controlled PostgreSQL database instances managed by Supabase, located in enterprise cloud facilities.
        </p>
        <ul>
          <li>
            <strong>Inquiry &amp; Lead Retention:</strong> Form submissions and discovery correspondence are retained for up to <strong>36 months</strong> from the date of last contact to maintain context for ongoing or prospective client engagements.
          </li>
          <li>
            <strong>Executed Project Data:</strong> Data relating to contracted client projects is governed by separate written Master Services Agreements (MSA) and retained in accordance with Indian commercial, tax, and accounting statutory periods (typically 8 years).
          </li>
          <li>
            <strong>Right to Deletion / Erasure:</strong> Any individual can request the permanent deletion, expungement, or anonymization of their contact records at any time by emailing our Grievance Officer at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Deletion requests are fulfilled within 30 days of verification.
          </li>
        </ul>
      </>,
    ],
    [
      "Data Security Practices",
      <>
        <p>
          We employ multi-layered technical, organizational, and physical security measures designed to protect your personal data from unauthorized access, alteration, disclosure, or accidental destruction:
        </p>
        <ul>
          <li>
            <strong>Cryptographic Encryption:</strong> High-grade TLS 1.3 encryption for all data in transit across public networks; AES-256 encryption for database tables at rest.
          </li>
          <li>
            <strong>Strict Request Boundaries:</strong> Rigid schema validation (Zod validation), JSON content-type restrictions, and payload size hard caps (maximum 32KB) preventing buffer overflow and injection attacks.
          </li>
          <li>
            <strong>Abuse &amp; Rate Limiting:</strong> In-memory sliding-window IP rate limiters defending API endpoints against automated scrapers, brute force, and denial-of-service abuse.
          </li>
          <li>
            <strong>Principle of Least Privilege:</strong> Administrative access is strictly cordoned off behind cryptographically signed JSON Web Tokens (JWT), role-based access control, and environment variable isolation.
          </li>
          <li>
            <strong>Zero Cardholder Data Storage:</strong> We do not collect, process, or store credit card, debit card, or banking authentication credentials on our web servers.
          </li>
        </ul>
      </>,
    ],
    [
      "Your Privacy Rights Under the Indian DPDP Act, 2023",
      <>
        <p>
          If you are a resident of India, your personal data is protected by the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. As a Data Principal, you enjoy the following statutory rights:
        </p>
        <ul>
          <li>
            <strong>Right to Access Information:</strong> You have the right to obtain a summary of personal data being processed by us, the processing activities carried out, and the identities of third-party data fiduciaries or processors with whom data has been shared.
          </li>
          <li>
            <strong>Right to Correction &amp; Erasure:</strong> You have the right to request the correction of inaccurate or misleading data, the completion of incomplete information, and the erasure of personal data that is no longer necessary for the purpose for which it was collected.
          </li>
          <li>
            <strong>Right of Grievance Redressal:</strong> You have the right to a readily accessible grievance redressal mechanism provided by Newbhar Technologies to address any concerns regarding our personal data handling practices.
          </li>
          <li>
            <strong>Right to Nominate:</strong> You have the right to nominate an individual who, in the event of your death or incapacity, shall exercise your data rights in accordance with the DPDP rules.
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Where processing is predicated on consent, you may withdraw your consent at any time without negative repercussion on prior lawful processing.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please submit a written request to our designated Grievance Officer detailed in Section 10 below.
        </p>
      </>,
    ],
    [
      "Additional Protections for International Visitors (GDPR / UK GDPR)",
      <>
        <p>
          For visitors and prospective clients accessing newbhar.com from the European Economic Area (EEA), the United Kingdom, or Switzerland, we comply with relevant provisions of the General Data Protection Regulation (Regulation (EU) 2016/679) and UK GDPR:
        </p>
        <ul>
          <li>
            <strong>Legal Grounds:</strong> We process your data under Article 6(1)(b) (performance of pre-contractual steps), Article 6(1)(f) (legitimate business interests in secure operations), and Article 6(1)(a) (freely given consent for optional analytics).
          </li>
          <li>
            <strong>Data Subject Rights:</strong> You may exercise your rights of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and objection to processing (Art. 21).
          </li>
          <li>
            <strong>International Data Transfers:</strong> When personal data is processed outside the EEA or UK, we ensure appropriate safeguards are implemented, including Standard Contractual Clauses (SCCs) and adherence to recognized data protection frameworks.
          </li>
          <li>
            <strong>Right to Lodge a Complaint:</strong> You possess the right to file a complaint with an authorized Data Protection Supervisory Authority in your EU Member State or the UK Information Commissioner&rsquo;s Office (ICO).
          </li>
        </ul>
      </>,
    ],
    [
      "Grievance Officer & Official Privacy Contact",
      <>
        <p>
          In accordance with the <strong>Digital Personal Data Protection Act, 2023</strong> and the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, Newbhar Technologies has appointed a designated Grievance Officer to oversee data protection compliance and resolve privacy concerns:
        </p>
        <div className="vx-info-callout">
          <p>
            <strong>Data Protection &amp; Grievance Redressal Office:</strong><br />
            <strong>Entity:</strong> Newbhar Technologies<br />
            <strong>Attention:</strong> Grievance Officer / Privacy Team<br />
            <strong>Official Email:</strong> <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a><br />
            <strong>Corporate Inquiries:</strong> <a href={`mailto:${SITE.infoEmail}`}>{SITE.infoEmail}</a><br />
            <strong>Headquarters Address:</strong> Kolkata, West Bengal, India &middot; PIN 700109<br />
            <strong>Statutory Turnaround:</strong> Inquiries are formally acknowledged within 48 hours and resolved within thirty (30) calendar days.
          </p>
        </div>
      </>,
    ],
    [
      "Modifications to this Privacy Policy",
      <>
        <p>
          Newbhar Technologies reserves the right to periodically revise or update this Privacy Policy to reflect advancements in our technology, shifts in statutory data protection regulations, or changes in our operational procedures.
        </p>
        <p>
          Any material updates will be published on this page with an updated &ldquo;Last Updated&rdquo; timestamp. We encourage visitors to review this document periodically. Your continued interaction with newbhar.com following published revisions constitutes your informed acknowledgement of the updated terms.
        </p>
        <p className="text-xs text-zinc-500 font-mono mt-4">
          Document Reference: NB-LEGAL-PRIVACY-V2.1 &middot; Last Revised: November 2026
        </p>
      </>,
    ],
  ];

  return <InfoPage eyebrow="Legal & Privacy" title="Privacy Policy" blocks={blocks} />;
}

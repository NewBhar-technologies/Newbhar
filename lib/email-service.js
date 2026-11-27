import { getResendApiKey, getEmailFromAddress, getNotificationRecipientEmail, SITE_URL } from "./env.js";
import { SettingsRepository } from "./repositories/settings.repository.js";
import crypto from "crypto";

/**
 * NEWBHAR TECHNOLOGIES — CENTRALIZED EMAIL NOTIFICATION SERVICE
 *
 * Handles automated notification emails for all form submissions across the website.
 * Features:
 * - Automatic form type classification
 * - Branded, responsive, mobile-friendly HTML email template
 * - Secure server-side dispatch via Resend
 * - Header injection and XSS protection
 * - Unique submission reference ID generator
 * - Graceful fallback and error logging (inquiry never lost)
 */

export const FORM_TYPES = {
  CONTACT: {
    id: "contact",
    label: "Contact Us",
    badgeText: "CONTACT INQUIRY",
    badgeColor: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.12)",
    icon: "✉",
  },
  PROJECT_INQUIRY: {
    id: "project_inquiry",
    label: "Project Inquiry",
    badgeText: "PROJECT INQUIRY",
    badgeColor: "#98f90d",
    badgeBg: "rgba(152, 249, 13, 0.12)",
    icon: "⚡",
  },
  QUOTE: {
    id: "quote",
    label: "Get a Quote",
    badgeText: "QUOTE REQUEST",
    badgeColor: "#facc15",
    badgeBg: "rgba(250, 204, 21, 0.12)",
    icon: "💰",
  },
  CAREER: {
    id: "career",
    label: "Career Application",
    badgeText: "CAREER APPLICATION",
    badgeColor: "#c084fc",
    badgeBg: "rgba(192, 132, 252, 0.12)",
    icon: "💼",
  },
  NEWSLETTER: {
    id: "newsletter",
    label: "Newsletter Subscription",
    badgeText: "NEWSLETTER SIGNUP",
    badgeColor: "#34d399",
    badgeBg: "rgba(52, 211, 153, 0.12)",
    icon: "📰",
  },
  MEETING: {
    id: "meeting",
    label: "Meeting Request",
    badgeText: "MEETING REQUEST",
    badgeColor: "#fb923c",
    badgeBg: "rgba(251, 146, 60, 0.12)",
    icon: "📅",
  },
  GENERIC: {
    id: "generic",
    label: "Website Submission",
    badgeText: "FORM SUBMISSION",
    badgeColor: "#98f90d",
    badgeBg: "rgba(152, 249, 13, 0.12)",
    icon: "📋",
  },
};

/**
 * Generate a unique submission reference ID.
 * Format: NB-YYYYMMDD-XXXXX (e.g. NB-20261127-A8F2K)
 */
export function generateReferenceId(prefix = "NB") {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

/**
 * Sanitize text to prevent HTML injection in emails.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize header strings to prevent email header injection (CRLF attacks).
 */
export function sanitizeHeader(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\r\n\u0085\u2028\u2029]/g, "")
    .replace(/%0[ad]/gi, "")
    .trim()
    .slice(0, 200);
}

/**
 * Automatically identify the form type from payload fields and source page.
 */
export function detectFormType(data = {}, sourcePage = "") {
  const explicit = (data.formType || data.type || "").toLowerCase().trim();

  if (explicit === "contact" || explicit === "contact_us") return FORM_TYPES.CONTACT;
  if (explicit === "project" || explicit === "project_inquiry" || explicit === "start_project") return FORM_TYPES.PROJECT_INQUIRY;
  if (explicit === "quote" || explicit === "get_quote" || explicit === "quotation") return FORM_TYPES.QUOTE;
  if (explicit === "career" || explicit === "job" || explicit === "application") return FORM_TYPES.CAREER;
  if (explicit === "newsletter" || explicit === "subscribe") return FORM_TYPES.NEWSLETTER;
  if (explicit === "meeting" || explicit === "meeting_request" || explicit === "call") return FORM_TYPES.MEETING;

  // Infer based on fields
  if (data.meetingDate || data.meetingTime || data.preferredDate) {
    return FORM_TYPES.MEETING;
  }

  if (data.resume || data.portfolioUrl || data.position || (data.service && /career|job|internship/i.test(data.service))) {
    return FORM_TYPES.CAREER;
  }

  if (data.budget || data.timeline || (sourcePage && sourcePage.includes("start-project"))) {
    if (data.subject && /quote|pricing|estimate/i.test(data.subject)) {
      return FORM_TYPES.QUOTE;
    }
    return FORM_TYPES.PROJECT_INQUIRY;
  }

  // Newsletter if only email is provided with no message or name
  if (data.email && !data.message && (!data.name || data.name === "Subscriber")) {
    return FORM_TYPES.NEWSLETTER;
  }

  return FORM_TYPES.CONTACT;
}

/**
 * Format submission timestamp in Indian Standard Time (IST) and UTC.
 */
export function formatSubmissionTimestamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const istString = d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const utcString = d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
  return {
    ist: `${istString} IST`,
    utc: utcString,
    full: `${istString} IST (${utcString})`,
  };
}

/**
 * Build responsive HTML email template for Newbhar Technologies.
 */
export function buildNotificationEmailHtml({
  formType,
  data,
  referenceId,
  timestamp,
  clientIp = "N/A",
  sourcePage = "/contact",
}) {
  const safeRefId = escapeHtml(referenceId);
  const safeName = escapeHtml(data.name || "Anonymous Visitor");
  const safeEmail = escapeHtml(data.email || "No email provided");
  const safePhone = escapeHtml(data.phone || data.phoneNumber || "");
  const safeCompany = escapeHtml(data.companyName || data.company || "");
  const safeService = escapeHtml(data.service || "");
  const safeBudget = escapeHtml(data.budget || "");
  const safeTimeline = escapeHtml(data.timeline || "");
  const safeSubject = escapeHtml(data.subject || "");
  const safeMessage = escapeHtml(data.message || "(No message body provided)");
  const safeSourcePage = escapeHtml(sourcePage || "/contact");
  const safeClientIp = escapeHtml(clientIp);
  const safeMeetingDate = escapeHtml(data.meetingDate || data.date || "");
  const safeMeetingTime = escapeHtml(data.meetingTime || data.time || "");
  const safeTimezone = escapeHtml(data.timezone || "");
  const safePosition = escapeHtml(data.position || data.role || "");
  const safePortfolio = escapeHtml(data.portfolioUrl || data.linkedin || "");

  const timeFormatted = formatSubmissionTimestamp(timestamp || new Date());
  const logoUrl = `${SITE_URL}/newbhar-mark.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Newbhar Technologies Notification - ${escapeHtml(formType.label)}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #08080a;
      color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    a {
      color: #98f90d;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 12px !important;
      }
      .stack-column {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .responsive-padding {
        padding: 20px 16px !important;
      }
      .header-title {
        font-size: 22px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #08080a; color: #e4e4e7;">
  <center style="width: 100%; background-color: #08080a; text-align: left;">
    <div style="max-width: 640px; margin: 0 auto; padding: 24px 16px;" class="email-container">

      <!-- BRAND HEADER -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align: middle;">
                  <!-- Logo & Wordmark -->
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 12px;">
                        <img src="${logoUrl}" alt="Newbhar Technologies" width="36" height="36" style="display: block; border: 0; border-radius: 8px; background-color: #11131c;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; display: block; line-height: 1.1;">
                          New<span style="color: #98f90d;">bhar</span>
                        </span>
                        <span style="font-size: 9px; font-family: monospace; letter-spacing: 2px; color: #a1a1aa; text-transform: uppercase; display: block;">
                          TECHNOLOGIES
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <span style="display: inline-block; padding: 5px 12px; border-radius: 9999px; background-color: ${formType.badgeBg}; border: 1px solid ${formType.badgeColor}; color: ${formType.badgeColor}; font-size: 11px; font-family: monospace; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                    ${formType.badgeText}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- MAIN CARD CONTAINER -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f111a; border: 1px solid #232738; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- CARD HEADER -->
        <tr>
          <td style="padding: 28px 28px 20px 28px; border-bottom: 1px solid #1f2333; background: linear-gradient(180deg, #161926 0%, #0f111a 100%);" class="responsive-padding">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="color: #98f90d; font-size: 12px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 6px;">
                    Automated Inbound Notification
                  </span>
                  <h1 class="header-title" style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                    New ${escapeHtml(formType.label)}
                  </h1>
                  <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.5;">
                    A visitor has submitted a new inquiry through the Newbhar Technologies official website.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- REFERENCE & TIME METADATA STRIP -->
        <tr>
          <td style="background-color: #141724; padding: 12px 28px; border-bottom: 1px solid #1f2333;" class="responsive-padding">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size: 12px; font-family: monospace; color: #a1a1aa;">
                  REF ID: <strong style="color: #98f90d; font-size: 13px;">${safeRefId}</strong>
                </td>
                <td style="text-align: right; font-size: 12px; font-family: monospace; color: #a1a1aa;">
                  ${timeFormatted.ist}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CUSTOMER DETAILS SECTION -->
        <tr>
          <td style="padding: 24px 28px 20px 28px;" class="responsive-padding">
            <h2 style="margin: 0 0 14px 0; font-size: 13px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #98f90d; font-weight: 700;">
              Customer Contact Information
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141724; border: 1px solid #232738; border-radius: 10px;">
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; width: 140px; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Full Name:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px; font-weight: 600;">
                  ${safeName}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Email Address:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px;">
                  <a href="mailto:${safeEmail}?subject=Re:%20[${safeRefId}]%20Newbhar%20Technologies%20Inquiry" style="color: #98f90d; text-decoration: none; font-weight: 600;">
                    ${safeEmail}
                  </a>
                </td>
              </tr>
              ${safePhone ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Phone Number:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px;">
                  ${safePhone}
                </td>
              </tr>` : ""}
              ${safeCompany ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Organization:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px;">
                  ${safeCompany}
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding: 12px 16px; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Source Page:
                </td>
                <td style="padding: 12px 16px; color: #a1a1aa; font-size: 13px; font-family: monospace;">
                  ${safeSourcePage}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SUBMISSION / PROJECT SPECIFICATIONS SECTION -->
        ${(safeService || safeBudget || safeTimeline || safeMeetingDate || safePosition) ? `
        <tr>
          <td style="padding: 0 28px 20px 28px;" class="responsive-padding">
            <h2 style="margin: 0 0 14px 0; font-size: 13px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #98f90d; font-weight: 700;">
              Submission Specifications
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141724; border: 1px solid #232738; border-radius: 10px;">
              ${safeService ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; width: 140px; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Service Focus:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px; font-weight: 600;">
                  ${safeService}
                </td>
              </tr>` : ""}
              ${safeBudget ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Budget Range:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #98f90d; font-size: 14px; font-weight: 700;">
                  ${safeBudget}
                </td>
              </tr>` : ""}
              ${safeTimeline ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Target Timeline:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px;">
                  ${safeTimeline}
                </td>
              </tr>` : ""}
              ${safeMeetingDate ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Preferred Meeting:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px;">
                  ${safeMeetingDate} at ${safeMeetingTime} ${safeTimezone ? `(${safeTimezone})` : ""}
                </td>
              </tr>` : ""}
              ${safePosition ? `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Applied Role:
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #1d2130; color: #ffffff; font-size: 14px;">
                  ${safePosition}
                </td>
              </tr>` : ""}
              ${safePortfolio ? `
              <tr>
                <td style="padding: 12px 16px; color: #8f96a3; font-size: 13px; font-weight: 600;">
                  Portfolio / Profile:
                </td>
                <td style="padding: 12px 16px; color: #ffffff; font-size: 14px;">
                  <a href="${safePortfolio}" target="_blank" style="color: #98f90d;">${safePortfolio}</a>
                </td>
              </tr>` : ""}
            </table>
          </td>
        </tr>` : ""}

        <!-- SUBMITTED MESSAGE / BRIEF SECTION -->
        <tr>
          <td style="padding: 0 28px 24px 28px;" class="responsive-padding">
            <h2 style="margin: 0 0 14px 0; font-size: 13px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #98f90d; font-weight: 700;">
              Submitted Message &amp; Requirements
            </h2>
            <div style="background-color: #141724; border-left: 3px solid #98f90d; border-radius: 0 10px 10px 0; padding: 18px 20px; color: #e4e4e7; font-size: 14px; line-height: 1.7; white-space: pre-wrap; word-break: break-word;">
              ${safeMessage}
            </div>
          </td>
        </tr>

        <!-- ACTION BUTTON STRIP -->
        <tr>
          <td style="padding: 0 28px 28px 28px; text-align: left;" class="responsive-padding">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius: 8px; background-color: #98f90d;">
                  <a href="mailto:${safeEmail}?subject=Re:%20[${safeRefId}]%20${encodeURIComponent(formType.label)}%20-%20Newbhar%20Technologies" style="display: inline-block; padding: 12px 24px; color: #08080a; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                    Reply to Inquirer (${safeEmail}) &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TECHNICAL AUDIT FOOTER -->
        <tr>
          <td style="background-color: #0b0c13; padding: 20px 28px; border-top: 1px solid #1f2333; font-size: 12px; color: #71717a; line-height: 1.6;" class="responsive-padding">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <strong style="color: #a1a1aa;">Security &amp; Audit Metadata:</strong><br>
                  Submission Ref: <span style="font-family: monospace; color: #d4d4d8;">${safeRefId}</span><br>
                  Origin IP: <span style="font-family: monospace; color: #d4d4d8;">${safeClientIp}</span><br>
                  Timestamp UTC: <span style="font-family: monospace; color: #d4d4d8;">${timeFormatted.utc}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- EMAIL FOOTER -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
        <tr>
          <td style="text-align: center; color: #71717a; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 6px 0;">
              This is an automated notification from the <strong style="color: #d4d4d8;">Newbhar Technologies</strong> Centralized Notification System.
            </p>
            <p style="margin: 0 0 6px 0;">
              Recipient Target: <span style="color: #98f90d; font-family: monospace;">info@newbhar.com</span> &bull; 
              <a href="${SITE_URL}" style="color: #98f90d; text-decoration: none;">newbhar.com</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: #52525b;">
              &copy; ${new Date().getFullYear()} Newbhar Technologies. All rights reserved. Confidential business notification.
            </p>
          </td>
        </tr>
      </table>

    </div>
  </center>
</body>
</html>
  `.trim();
}

/**
 * Build plain-text fallback version of the notification email.
 */
export function buildNotificationEmailText({
  formType,
  data,
  referenceId,
  timestamp,
  clientIp = "N/A",
  sourcePage = "/contact",
}) {
  const timeFormatted = formatSubmissionTimestamp(timestamp || new Date());

  const lines = [
    `================================================================`,
    `NEWBHAR TECHNOLOGIES — NEW FORM SUBMISSION NOTIFICATION`,
    `================================================================`,
    ``,
    `Form Type: ${formType.label} (${formType.badgeText})`,
    `Reference ID: ${referenceId}`,
    `Submitted At: ${timeFormatted.full}`,
    `Source Page: ${sourcePage}`,
    `Client IP: ${clientIp}`,
    ``,
    `----------------------------------------------------------------`,
    `CUSTOMER INFORMATION`,
    `----------------------------------------------------------------`,
    `Name:    ${data.name || "Anonymous"}`,
    `Email:   ${data.email || "N/A"}`,
    data.phone ? `Phone:   ${data.phone}` : null,
    data.companyName || data.company ? `Company: ${data.companyName || data.company}` : null,
    ``,
    `----------------------------------------------------------------`,
    `SUBMISSION DETAILS`,
    `----------------------------------------------------------------`,
    data.service ? `Service Focus:   ${data.service}` : null,
    data.budget ? `Budget Range:    ${data.budget}` : null,
    data.timeline ? `Target Timeline: ${data.timeline}` : null,
    data.subject ? `Subject:         ${data.subject}` : null,
    data.meetingDate ? `Meeting Date:    ${data.meetingDate} at ${data.meetingTime || "TBD"}` : null,
    data.position ? `Applied Role:    ${data.position}` : null,
    data.portfolioUrl ? `Portfolio:       ${data.portfolioUrl}` : null,
    ``,
    `----------------------------------------------------------------`,
    `MESSAGE / REQUIREMENTS`,
    `----------------------------------------------------------------`,
    data.message || "(No message provided)",
    ``,
    `================================================================`,
    `Quick Reply: mailto:${data.email || "info@newbhar.com"}`,
    `This notification was generated automatically by newbhar.com.`,
  ];

  return lines.filter((l) => l !== null).join("\r\n");
}

/**
 * Centralized Email Notification Dispatcher
 *
 * Sends an email notification to info@newbhar.com whenever any form is submitted.
 *
 * @param {Object} options
 * @param {string} [options.formType] - Optional explicit form type
 * @param {Object} options.data - The submitted form payload
 * @param {string} [options.sourcePage] - The page URL where submission happened
 * @param {string} [options.clientIp] - Client IP for audit logging
 * @param {string} [options.referenceId] - Optional existing reference ID
 * @returns {Promise<{ success: boolean, delivered: boolean, referenceId: string, formType: string, error?: string }>}
 */
export async function sendFormNotificationEmail({
  formType: explicitType,
  data = {},
  sourcePage = "/contact",
  clientIp = "127.0.0.1",
  referenceId: existingRefId,
}) {
  const referenceId = existingRefId || generateReferenceId();
  const formType = explicitType
    ? FORM_TYPES[explicitType.toUpperCase()] || detectFormType({ ...data, formType: explicitType }, sourcePage)
    : detectFormType(data, sourcePage);

  // Recipient is strictly server-enforced to info@newbhar.com
  const recipientEmail = getNotificationRecipientEmail();
  const senderEmail = getEmailFromAddress("info");

  // Subject sanitization against header injection
  const customerName = sanitizeHeader(data.name || "Visitor");
  const emailSubject = sanitizeHeader(
    `[${formType.label}] New submission from ${customerName} (Ref: ${referenceId})`
  );

  const htmlBody = buildNotificationEmailHtml({
    formType,
    data,
    referenceId,
    timestamp: new Date(),
    clientIp,
    sourcePage,
  });

  const textBody = buildNotificationEmailText({
    formType,
    data,
    referenceId,
    timestamp: new Date(),
    clientIp,
    sourcePage,
  });

  const resendApiKey = getResendApiKey();
  let delivered = false;
  let providerResponse = "";
  let dispatchError = null;

  if (resendApiKey && resendApiKey !== "re_your_api_key_here") {
    try {
      const payload = {
        from: senderEmail,
        to: [recipientEmail],
        subject: emailSubject,
        html: htmlBody,
        text: textBody,
      };

      // Set reply_to to the customer's email if valid
      if (data.email && typeof data.email === "string" && data.email.includes("@")) {
        payload.reply_to = sanitizeHeader(data.email);
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseJson = await res.json().catch(() => ({}));

      if (res.ok) {
        delivered = true;
        providerResponse = `Delivered via Resend REST API (ID: ${responseJson.id || "ok"})`;
      } else {
        delivered = false;
        providerResponse = `Resend API Error HTTP ${res.status}: ${responseJson.message || res.statusText || "Delivery failed"}`;
        dispatchError = providerResponse;
        console.error("[EmailNotificationService] Resend API error:", providerResponse);
      }
    } catch (err) {
      delivered = false;
      providerResponse = `Network/Dispatch Error: ${err.message}`;
      dispatchError = err.message;
      console.error("[EmailNotificationService] Resend dispatch exception:", err.message);
    }
  } else {
    providerResponse = "Resend API key not configured in environment (RESEND_API_KEY). Email simulated.";
    console.warn("[EmailNotificationService] Warning: RESEND_API_KEY is not configured or placeholder.");
  }

  // Log email attempt into Supabase emails table for admin tracking & audits
  try {
    await SettingsRepository.logEmail({
      recipientEmail,
      senderEmail,
      subject: emailSubject,
      category: `Form:${formType.id}`,
      status: delivered ? "sent" : "failed",
      providerResponse,
    });
  } catch (logErr) {
    console.warn("[EmailNotificationService] Warning: Failed to record email in database:", logErr.message);
  }

  return {
    success: delivered,
    delivered,
    referenceId,
    formType: formType.id,
    providerResponse,
    ...(dispatchError ? { error: dispatchError } : {}),
  };
}

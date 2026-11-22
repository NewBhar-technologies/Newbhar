
import { SITE } from "./site";

/**
 * Newbhar Technologies
 * Meeting Request Email Generator
 */

const DEFAULT_SUBJECT = "New Meeting Request | Newbhar Technologies";

const DEFAULT_VALUE = "Not provided";

/**
 * Safely format meeting information.
 */
const formatValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return DEFAULT_VALUE;
  }

  return String(value).trim();
};

/**
 * Generate a professional meeting request email body.
 */
export const getMeetingEmailBody = (meeting = {}) => {
  const name = formatValue(meeting.name);
  const email = formatValue(meeting.email);
  const phone = formatValue(meeting.phone);
  const company = formatValue(meeting.company);
  const service = formatValue(meeting.service);
  const message = formatValue(meeting.message);
  const meetingDate = formatValue(meeting.meeting_date);
  const meetingTime = formatValue(meeting.meeting_time);
  const timezone = formatValue(meeting.timezone);

  return [
    "Hello Newbhar Technologies Team,",
    "",
    "You have received a new meeting request through the Newbhar Technologies website.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "MEETING REQUEST DETAILS",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "CONTACT INFORMATION",
    "",
    `Full Name: ${name}`,
    `Email Address: ${email}`,
    `Phone Number: ${phone}`,
    `Company / Organization: ${company}`,
    "",
    "PROJECT INFORMATION",
    "",
    `Project / Service Required: ${service}`,
    `Project Description: ${message}`,
    "",
    "MEETING PREFERENCES",
    "",
    `Preferred Date: ${meetingDate}`,
    `Preferred Time: ${meetingTime}`,
    `Time Zone: ${timezone}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "NEXT STEPS",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Please review the submitted information and contact the client to confirm availability and schedule the meeting.",
    "",
    "You can reply directly to this email to communicate with the client.",
    "",
    "Best regards,",
    "",
    "Newbhar Technologies",
    "Technology & Digital Solutions",
    "",
    `Website: ${SITE.url || "https://newbhar.com"}`,
    `Email: ${SITE.email}`,
    "",
    "This is an automated notification generated from the Newbhar Technologies website.",
  ].join("\r\n");
};

/**
 * Generate Gmail Compose URL.
 *
 * Opens Gmail with pre-filled recipient, subject and body.
 * This does NOT send the email automatically.
 */
export const getMeetingEmailUrl = (meeting = {}) => {
  const recipient = SITE.email;

  if (!recipient) {
    throw new Error("Newbhar notification email is not configured.");
  }

  const subject = meeting.name
    ? `New Meeting Request | ${formatValue(meeting.name)}`
    : DEFAULT_SUBJECT;

  const body = getMeetingEmailBody(meeting);

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: recipient,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
};

/**
 * Default Gmail Compose URL.
 */
export const MEETING_EMAIL_URL = getMeetingEmailUrl();

import { LeadRepository } from "@/lib/repositories/lead.repository";
import { NotificationRepository } from "@/lib/repositories/notification.repository";
import { SettingsRepository } from "@/lib/repositories/settings.repository";
import { getResendApiKey, getEmailFromAddress } from "@/lib/env";
import { renderTemplatePlaceholders } from "@/lib/template-utils";
import { parseBudgetValue } from "@/lib/utils";
import {
  buildCustomerConfirmationEmailHtml,
  buildCustomerConfirmationEmailText,
  cleanEmailText,
} from "@/lib/email-service";

export { renderTemplatePlaceholders };

/**
 * Core event dispatcher that triggers enabled workflows matching trigger type
 */
export async function triggerWorkflow(triggerType, payload = {}) {
  const automations = await SettingsRepository.listAutomations();
  const matchingAutomations = automations.filter(
    (a) => a.trigger === triggerType && a.enabled === true
  );

  const results = [];

  for (const automation of matchingAutomations) {
    let success = true;
    const executionDetails = [];

    try {
      for (const action of automation.actions || []) {
        if (action.type === "save_inquiry") {
          executionDetails.push("Inquiry saved to database.");
        } else if (action.type === "create_lead") {
          if (payload.email) {
            const { leads } = await LeadRepository.list({ search: payload.email, limit: 1 });
            const existingLead = leads.find((l) => l.email.toLowerCase() === payload.email.toLowerCase());

            if (!existingLead) {
              const newLead = await LeadRepository.create({
                contactId: payload.contactId || null,
                name: payload.name || "New Inquirer",
                email: payload.email,
                companyName: payload.companyName || "",
                service: payload.service || "General Inquiry",
                stage: "new",
                estimatedValue: parseBudgetValue(payload.budget) || 0,
                source: "Automated Contact Ingestion",
                notes: [
                  {
                    id: `n_${Date.now()}`,
                    author: "Workflow Automation",
                    text: payload.budget
                      ? `Auto-created lead from inquiry. Budget: ${payload.budget}`
                      : "Auto-created lead from inquiry.",
                    createdAt: new Date().toISOString(),
                  },
                ],
              });
              executionDetails.push(`Lead created (${newLead.id}).`);
            } else {
              executionDetails.push("Lead already exists for email.");
            }
          }
        } else if (action.type === "notify_admin") {
          await NotificationRepository.create({
            title: `New ${triggerType.replace(/_/g, " ").toUpperCase()}`,
            message: `${payload.name ? payload.name + " (" + payload.email + ")" : "A new event"} triggered ${automation.name}.`,
            category:
              triggerType === "contact_submit"
                ? "inquiry"
                : triggerType === "meeting_booked"
                ? "meeting"
                : "general",
            link:
              triggerType === "contact_submit"
                ? "/admin/contacts"
                : triggerType === "meeting_booked"
                ? "/admin/meetings"
                : "/admin/leads",
          });
          executionDetails.push("In-app admin notification dispatched.");
        } else if (action.type === "send_template_email") {
          const templates = await SettingsRepository.listEmailTemplates();
          const template = templates.find((t) => t.id === action.params?.templateId) || templates[0];

          // Prevent duplicate customer confirmation email delivery if already dispatched directly
          const isInquiryConfirmation =
            !action.params?.templateId ||
            action.params?.templateId === "a1b2c3d4-0001-4000-8000-000000000001" ||
            template?.category === "Inquiry Confirmation";

          if (payload.customerEmailSent && isInquiryConfirmation) {
            executionDetails.push("Customer inquiry confirmation already dispatched; duplicate skipped.");
            continue;
          }

          if (template && payload.email) {
            let emailSubject = renderTemplatePlaceholders(template.subject, payload);
            let emailTextBody = "";
            let emailHtmlBody = null;

            if (isInquiryConfirmation) {
              emailHtmlBody = buildCustomerConfirmationEmailHtml({
                data: payload,
                referenceId: payload.referenceId,
                timestamp: payload.timestamp || new Date(),
              });
              emailTextBody = buildCustomerConfirmationEmailText({
                data: payload,
                referenceId: payload.referenceId,
                timestamp: payload.timestamp || new Date(),
              });
              if (!emailSubject || emailSubject === template.subject) {
                emailSubject = `Thank You for Reaching Out — Newbhar Technologies [Ref: ${payload.referenceId || "NB"}]`;
              }
            } else {
              const rawBody = renderTemplatePlaceholders(template.content, payload);
              emailTextBody = cleanEmailText(rawBody);
            }

            const resendApiKey = getResendApiKey();
            const fromAddress = getEmailFromAddress("contact");
            let emailStatus = "sent";
            let providerResponse = "Pending dispatch";

            if (resendApiKey && resendApiKey !== "re_your_api_key_here") {
              try {
                const emailPayload = {
                  from: fromAddress,
                  to: [payload.email],
                  subject: emailSubject,
                  text: emailTextBody,
                  reply_to: "contact@newbhar.com",
                };
                if (emailHtmlBody) {
                  emailPayload.html = emailHtmlBody;
                }

                const res = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${resendApiKey}`,
                  },
                  body: JSON.stringify(emailPayload),
                });
                if (!res.ok) {
                  emailStatus = "failed";
                  providerResponse = `Resend status: ${res.status}`;
                } else {
                  providerResponse = "Delivered via Resend REST API";
                }
              } catch (e) {
                emailStatus = "failed";
                providerResponse = e.message;
              }
            } else {
              emailStatus = "failed";
              providerResponse = "Not Configured: Outgoing email provider (RESEND_API_KEY or SMTP credentials) is not configured in environment variables.";
            }

            await SettingsRepository.logEmail({
              recipientEmail: payload.email,
              senderEmail: fromAddress,
              subject: emailSubject,
              category: template.category || "Automated",
              status: emailStatus,
              providerResponse,
            });

            executionDetails.push(`Email (${emailStatus}) logged for ${payload.email}.`);
          }
        }
      }
    } catch (err) {
      success = false;
      executionDetails.push(`Execution error: ${err.message}`);
    }

    await SettingsRepository.logAutomationRun({
      automationId: automation.id,
      automationName: automation.name,
      trigger: triggerType,
      status: success ? "success" : "failure",
      details: executionDetails.join(" "),
    });

    results.push({
      automationId: automation.id,
      automationName: automation.name,
      status: success ? "success" : "failure",
      details: executionDetails.join(" "),
    });
  }

  return results;
}

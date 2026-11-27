export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { LeadRepository } from "@/lib/repositories/lead.repository";
import { ClientRepository } from "@/lib/repositories/client.repository";
import { recordAuditLogSync } from "@/lib/auth/session";
import { parseBudgetValue } from "@/lib/utils";

export async function GET(req) {
  return withAdminAuth(req, "leads", async () => {
    try {
      const { searchParams } = new URL(req.url);
      const stage = searchParams.get("stage") || "all";
      const search = searchParams.get("search") || "";
      const includeArchived = searchParams.get("includeArchived") === "true";
      const onlyArchived = searchParams.get("onlyArchived") === "true";

      const result = await LeadRepository.list({
        stage,
        search,
        limit: 300,
        includeArchived,
        onlyArchived,
      });

      return NextResponse.json({
        success: true,
        leads: result.leads,
        total: result.total,
        archivedCount: result.archivedCount,
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to fetch leads" },
        { status: 500 }
      );
    }
  });
}

export async function POST(req) {
  return withAdminAuth(req, "leads", async (request, admin) => {
    try {
      const body = await request.json().catch(() => ({}));
      const {
        action,
        leadId,
        leadIds,
        stageCheck,
        name,
        email,
        companyName,
        service,
        stage,
        estimatedValue,
      } = body;

      // 1. Soft-Delete / Archive individual lead
      if (action === "archive_lead" && leadId) {
        const archivedLead = await LeadRepository.archive(leadId, admin);

        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "ARCHIVE_LEAD",
          module: "LEADS",
          recordId: leadId,
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Archived lead ${leadId} (${archivedLead.name} - ${archivedLead.email}).`,
          result: "success",
        });

        return NextResponse.json({
          success: true,
          message: "Lead archived successfully.",
          lead: archivedLead,
        });
      }

      // 2. Selective Bulk Archive
      if (action === "archive_bulk" && Array.isArray(leadIds) && leadIds.length > 0) {
        const result = await LeadRepository.archiveBulk(leadIds, stageCheck, admin);

        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "ARCHIVE_LEADS_BULK",
          module: "LEADS",
          recordId: leadIds.join(", "),
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Bulk archived ${result.count} leads (Filter stage: ${stageCheck || "none"}).`,
          result: "success",
        });

        return NextResponse.json({
          success: true,
          message: `Successfully archived ${result.count} selected lead(s).`,
          ...result,
        });
      }

      // 3. Clear All Lost Leads (Strictly only 'lost' stage)
      if (action === "clear_all_lost" || action === "archive_all_lost") {
        const result = await LeadRepository.archiveAllLost(admin);

        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "CLEAR_ALL_LOST_LEADS",
          module: "LEADS",
          recordId: "all_lost",
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Cleared and archived all ${result.count} lost leads from pipeline.`,
          result: "success",
        });

        return NextResponse.json({
          success: true,
          message: `Successfully cleared and archived ${result.count} lost lead(s).`,
          ...result,
        });
      }

      // 4. Restore an archived lead
      if (action === "restore_lead" && leadId) {
        const restoredLead = await LeadRepository.restore(leadId, admin);

        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "RESTORE_LEAD",
          module: "LEADS",
          recordId: leadId,
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Restored archived lead ${leadId} (${restoredLead.name}) back to stage '${restoredLead.stage}'.`,
          result: "success",
        });

        return NextResponse.json({
          success: true,
          message: `Lead successfully restored to ${restoredLead.stage} stage.`,
          lead: restoredLead,
        });
      }

      // 5. Convert lead to client
      if (action === "convert_to_client" && leadId) {
        const lead = await LeadRepository.findById(leadId);
        if (!lead) {
          return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
        }

        const updatedLead = await LeadRepository.update(leadId, { stage: "won" });

        const newClient = await ClientRepository.create({
          name: lead.companyName || lead.name,
          contactPerson: lead.name,
          email: lead.email,
          industry: lead.service || "Enterprise",
          status: "active",
          totalValue: Number(lead.estimatedValue) || 20000,
          notes: `Converted from lead ${lead.id}. Interested in ${lead.service}.`,
        });

        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "CONVERT_LEAD_TO_CLIENT",
          module: "LEADS",
          recordId: leadId,
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Converted lead ${leadId} into client ${newClient.id}.`,
          result: "success",
        });

        return NextResponse.json({ success: true, client: newClient, lead: updatedLead });
      }

      // 6. Manual lead creation
      if (!name || !email) {
        return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
      }

      const newLead = await LeadRepository.create({
        name,
        email,
        companyName: companyName || "",
        service: service || "General Software Services",
        stage: stage || "new",
        estimatedValue: parseBudgetValue(estimatedValue) || 0,
        source: "Admin Created",
        assignedTo: admin.id,
      });

      recordAuditLogSync({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "CREATE_LEAD",
        module: "LEADS",
        recordId: newLead.id,
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        details: `Created new lead ${newLead.id} for ${email}.`,
        result: "success",
      });

      return NextResponse.json({ success: true, lead: newLead });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to process lead request" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(req) {
  return withAdminAuth(req, "leads", async (request, admin) => {
    try {
      const body = await request.json().catch(() => ({}));
      const { id, stage, estimatedValue, noteText } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: "Lead ID required" }, { status: 400 });
      }

      const updates = {};
      if (stage !== undefined) updates.stage = stage;
      if (estimatedValue !== undefined) {
        updates.estimatedValue = parseBudgetValue(estimatedValue);
      }

      let lead = await LeadRepository.update(id, updates);

      if (noteText) {
        lead = await LeadRepository.addNote(id, noteText, admin.name || admin.email);
      }

      recordAuditLogSync({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "UPDATE_LEAD",
        module: "LEADS",
        recordId: id,
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        details: `Updated lead ${id} (Stage: ${stage || lead.stage}).`,
        result: "success",
      });

      return NextResponse.json({ success: true, lead });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to update lead" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req) {
  return withAdminAuth(req, "leads", async (request, admin) => {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      const stage = searchParams.get("stage");
      const isAll = searchParams.get("all") === "true";
      const isPermanent = searchParams.get("permanent") === "true";

      // Bulk Clear via DELETE /api/admin/leads?stage=lost&all=true
      if (stage === "lost" && isAll) {
        const result = await LeadRepository.archiveAllLost(admin);

        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "CLEAR_ALL_LOST_LEADS",
          module: "LEADS",
          recordId: "all_lost",
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Cleared and archived all ${result.count} lost leads.`,
          result: "success",
        });

        return NextResponse.json({
          success: true,
          message: `All ${result.count} lost leads cleared and safely archived.`,
          count: result.count,
        });
      }

      if (!id) {
        return NextResponse.json({ success: false, error: "Lead ID required" }, { status: 400 });
      }

      // Permanent delete if explicitly specified
      if (isPermanent) {
        await LeadRepository.delete(id);
        recordAuditLogSync({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "PERMANENT_DELETE_LEAD",
          module: "LEADS",
          recordId: id,
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          details: `Permanently deleted lead ${id}.`,
          result: "success",
        });
        return NextResponse.json({ success: true, message: "Lead permanently deleted." });
      }

      // Default safe archive / soft delete
      const archivedLead = await LeadRepository.archive(id, admin);

      recordAuditLogSync({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "ARCHIVE_LEAD",
        module: "LEADS",
        recordId: id,
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        details: `Safely archived lead ${id} (${archivedLead.name}).`,
        result: "success",
      });

      return NextResponse.json({
        success: true,
        message: "Lead removed from active pipeline and safely archived.",
        lead: archivedLead,
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to delete lead" },
        { status: 500 }
      );
    }
  });
}

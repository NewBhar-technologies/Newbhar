import { getAdminClient } from "@/lib/supabase/admin";
import { sanitizePostgrestSearch } from "@/lib/utils";

/**
 * Helper to determine if a lead has been archived/soft-deleted.
 * Checks both JSONB notes trail and optional is_archived column.
 */
export function isLeadArchived(lead) {
  if (!lead) return false;
  if (lead.is_archived === true || lead.isArchived === true) return true;
  if (Array.isArray(lead.notes)) {
    return lead.notes.some((n) => n && (n.isArchived === true || n.type === "archive"));
  }
  return false;
}

export const LeadRepository = {
  async create({
    contactId,
    name,
    email,
    companyName,
    service,
    stage = "new",
    estimatedValue = 0,
    source = "Website Contact Form",
    assignedTo,
    notes = [],
  }) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        contact_id: contactId || null,
        name,
        email: email.trim().toLowerCase(),
        company_name: companyName || "",
        service: service || "",
        stage,
        estimated_value: Number(estimatedValue) || 0,
        source,
        assigned_to: assignedTo || null,
        notes: notes || [],
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      contactId: data.contact_id,
      name: data.name,
      email: data.email,
      companyName: data.company_name,
      service: data.service,
      stage: data.stage,
      estimatedValue: Number(data.estimated_value) || 0,
      source: data.source,
      assignedTo: data.assigned_to,
      notes: data.notes || [],
      isArchived: isLeadArchived(data),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async list({
    page = 1,
    limit = 50,
    stage,
    search,
    assignedTo,
    includeArchived = false,
    onlyArchived = false,
  } = {}) {
    const supabase = getAdminClient();
    let query = supabase.from("leads").select("*", { count: "exact" });

    if (stage && stage !== "all") query = query.eq("stage", stage);
    if (assignedTo) query = query.eq("assigned_to", assignedTo);
    const cleanSearch = sanitizePostgrestSearch(search);
    if (cleanSearch) {
      query = query.or(
        `name.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%,company_name.ilike.%${cleanSearch}%,service.ilike.%${cleanSearch}%`
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const rawLeads = data || [];
    const mapped = rawLeads.map((l) => ({
      id: l.id,
      contactId: l.contact_id,
      name: l.name,
      email: l.email,
      companyName: l.company_name,
      service: l.service,
      stage: l.stage,
      estimatedValue: Number(l.estimated_value) || 0,
      source: l.source,
      assignedTo: l.assigned_to,
      notes: l.notes || [],
      isArchived: isLeadArchived(l),
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    }));

    // Filter based on archived preferences
    let filtered = mapped;
    if (onlyArchived) {
      filtered = mapped.filter((l) => l.isArchived);
    } else if (!includeArchived) {
      filtered = mapped.filter((l) => !l.isArchived);
    }

    const totalArchivedCount = mapped.filter((l) => l.isArchived).length;

    return {
      leads: filtered,
      total: filtered.length,
      rawCount: count || 0,
      archivedCount: totalArchivedCount,
      page,
      limit,
    };
  },

  async findById(id) {
    if (!id) return null;
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      contactId: data.contact_id,
      name: data.name,
      email: data.email,
      companyName: data.company_name,
      service: data.service,
      stage: data.stage,
      estimatedValue: Number(data.estimated_value) || 0,
      source: data.source,
      assignedTo: data.assigned_to,
      notes: data.notes || [],
      isArchived: isLeadArchived(data),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id, updates = {}) {
    const supabase = getAdminClient();
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.service !== undefined) payload.service = updates.service;
    if (updates.stage !== undefined) payload.stage = updates.stage;
    if (updates.estimatedValue !== undefined) payload.estimated_value = Number(updates.estimatedValue) || 0;
    if (updates.source !== undefined) payload.source = updates.source;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo || null;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase
      .from("leads")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      contactId: data.contact_id,
      name: data.name,
      email: data.email,
      companyName: data.company_name,
      service: data.service,
      stage: data.stage,
      estimatedValue: Number(data.estimated_value) || 0,
      source: data.source,
      assignedTo: data.assigned_to,
      notes: data.notes || [],
      isArchived: isLeadArchived(data),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Safe Soft-Delete / Archive for an individual lead.
   * Preserves all lead data, history, timestamps and original customer record.
   */
  async archive(id, adminInfo = {}) {
    const current = await this.findById(id);
    if (!current) throw new Error("Lead not found.");

    if (isLeadArchived(current)) {
      return current; // Already archived, avoid duplicate operation
    }

    const notes = Array.isArray(current.notes) ? [...current.notes] : [];
    notes.push({
      id: `lead_archived_${Date.now()}`,
      type: "archive",
      isArchived: true,
      archivedAt: new Date().toISOString(),
      archivedBy: adminInfo.name || adminInfo.email || "Admin",
      previousStage: current.stage,
      reason: adminInfo.reason || "Cleared from pipeline",
    });

    return this.update(id, { notes });
  },

  /**
   * Bulk archive multiple leads.
   * If stageCheck is provided (e.g. 'lost'), strictly ensures only leads matching
   * that stage are archived, protecting other pipeline stages.
   */
  async archiveBulk(ids = [], stageCheck = null, adminInfo = {}) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: true, count: 0, affectedIds: [], skippedIds: [] };
    }

    const affectedIds = [];
    const skippedIds = [];

    for (const id of ids) {
      try {
        const lead = await this.findById(id);
        if (!lead) {
          skippedIds.push({ id, reason: "Not found" });
          continue;
        }

        // Strict stage check if requested (e.g. only 'lost' stage)
        if (stageCheck && lead.stage !== stageCheck) {
          skippedIds.push({ id, reason: `Lead stage '${lead.stage}' does not match required stage '${stageCheck}'` });
          continue;
        }

        if (isLeadArchived(lead)) {
          skippedIds.push({ id, reason: "Already archived" });
          continue;
        }

        await this.archive(id, adminInfo);
        affectedIds.push(id);
      } catch (err) {
        skippedIds.push({ id, reason: err.message });
      }
    }

    return {
      success: true,
      count: affectedIds.length,
      affectedIds,
      skippedIds,
    };
  },

  /**
   * Archive all leads currently in the 'lost' stage.
   * Excludes any already-archived leads and never touches other pipeline stages.
   */
  async archiveAllLost(adminInfo = {}) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("stage", "lost");

    if (error) throw new Error(error.message);

    const lostLeads = data || [];
    const affectedIds = [];

    for (const l of lostLeads) {
      if (!isLeadArchived(l)) {
        await this.archive(l.id, {
          ...adminInfo,
          reason: "Bulk clear all lost leads",
        });
        affectedIds.push(l.id);
      }
    }

    return {
      success: true,
      count: affectedIds.length,
      affectedIds,
    };
  },

  /**
   * Restore an archived lead back into the active pipeline.
   */
  async restore(id, adminInfo = {}) {
    const current = await this.findById(id);
    if (!current) throw new Error("Lead not found.");

    const existingNotes = Array.isArray(current.notes) ? [...current.notes] : [];
    const archiveEntries = existingNotes.filter((n) => n && (n.isArchived || n.type === "archive"));
    const lastArchive = archiveEntries[archiveEntries.length - 1];
    const restoredStage = lastArchive?.previousStage || current.stage || "lost";

    // Clean archive flags and add restore stamp
    const cleanedNotes = existingNotes.filter((n) => !(n && (n.isArchived || n.type === "archive")));
    cleanedNotes.push({
      id: `lead_restored_${Date.now()}`,
      type: "restore",
      restoredAt: new Date().toISOString(),
      restoredBy: adminInfo.name || adminInfo.email || "Admin",
      restoredStage,
    });

    return this.update(id, {
      stage: restoredStage,
      notes: cleanedNotes,
    });
  },

  async delete(id) {
    const supabase = getAdminClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  },

  async addNote(id, noteText, author = "Admin") {
    const current = await this.findById(id);
    if (!current) throw new Error("Lead not found.");
    const notes = Array.isArray(current.notes) ? [...current.notes] : [];
    notes.push({
      id: `lead_note_${Date.now()}`,
      author,
      text: noteText,
      createdAt: new Date().toISOString(),
    });
    return this.update(id, { notes });
  },
};

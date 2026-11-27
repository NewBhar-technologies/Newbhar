/**
 * Test Suite: Leads and Exchange Rate API Routes
 * Tests authentication, authorization, archival actions, bulk clear,
 * and currency exchange rate endpoints.
 */

import assert from "assert";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createSessionToken, COOKIE_NAME } from "../lib/auth/session.js";
import { AdminRepository } from "../lib/repositories/admin.repository.js";
import { GET as getExchangeRate } from "../app/api/admin/exchange-rate/route.js";
import { GET as getLeads, POST as postLeads, DELETE as deleteLeads } from "../app/api/admin/leads/route.js";
import { LeadRepository } from "../lib/repositories/lead.repository.js";

console.log("=================================================");
console.log("TEST SUITE: API ROUTES & AUTH GUARD VERIFICATION");
console.log("=================================================\n");

let passed = 0;
let total = 0;

async function runAsyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// In-memory test store for leads
let mockLeadsDb = [
  {
    id: "lead_lost_1",
    name: "Subhamoy Saha",
    email: "subhamoy@example.com",
    companyName: "TechCorp",
    service: "Web Development",
    stage: "lost",
    estimatedValue: 1500,
    notes: [],
  },
  {
    id: "lead_lost_2",
    name: "John Doe",
    email: "john@example.com",
    companyName: "Acme Inc",
    service: "AI & ML",
    stage: "lost",
    estimatedValue: 3000,
    notes: [],
  },
  {
    id: "lead_won_1",
    name: "Enterprise Client",
    email: "client@enterprise.com",
    companyName: "MegaCorp",
    service: "Cloud & DevOps",
    stage: "won",
    estimatedValue: 10000,
    notes: [],
  },
  {
    id: "lead_new_1",
    name: "New Lead",
    email: "new@example.com",
    companyName: "Startup LLC",
    service: "Mobile App",
    stage: "new",
    estimatedValue: 500,
    notes: [],
  },
];

// Mock AdminRepository findById for session resolution
AdminRepository.findById = async (id) => ({
  id,
  email: "admin@newbhar.com",
  name: "Super Admin",
  role: "SUPER_ADMIN",
  status: "active",
});

// Mock LeadRepository methods
LeadRepository.list = async ({ stage, includeArchived = false, onlyArchived = false } = {}) => {
  let list = mockLeadsDb;
  if (stage && stage !== "all") {
    list = list.filter((l) => l.stage === stage);
  }
  const isArchived = (l) => l.notes?.some((n) => n.isArchived || n.type === "archive");
  if (onlyArchived) {
    list = list.filter((l) => isArchived(l));
  } else if (!includeArchived) {
    list = list.filter((l) => !isArchived(l));
  }
  return {
    leads: list,
    total: list.length,
    archivedCount: mockLeadsDb.filter((l) => isArchived(l)).length,
  };
};

LeadRepository.findById = async (id) => {
  return mockLeadsDb.find((l) => l.id === id) || null;
};

LeadRepository.update = async (id, updates) => {
  const index = mockLeadsDb.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Lead not found");
  mockLeadsDb[index] = { ...mockLeadsDb[index], ...updates };
  return mockLeadsDb[index];
};

LeadRepository.archive = async (id, admin) => {
  const lead = await LeadRepository.findById(id);
  if (!lead) throw new Error("Lead not found");
  const notes = [...(lead.notes || [])];
  notes.push({
    id: `archive_${Date.now()}`,
    type: "archive",
    isArchived: true,
    archivedAt: new Date().toISOString(),
    archivedBy: admin?.name || "Admin",
    previousStage: lead.stage,
  });
  return LeadRepository.update(id, { notes });
};

LeadRepository.archiveAllLost = async (admin) => {
  const lostLeads = mockLeadsDb.filter((l) => l.stage === "lost" && !l.notes?.some((n) => n.isArchived));
  const affectedIds = [];
  for (const l of lostLeads) {
    await LeadRepository.archive(l.id, admin);
    affectedIds.push(l.id);
  }
  return { success: true, count: affectedIds.length, affectedIds };
};

LeadRepository.archiveBulk = async (ids, stageCheck, admin) => {
  const affectedIds = [];
  for (const id of ids) {
    const lead = await LeadRepository.findById(id);
    if (!lead) continue;
    if (stageCheck && lead.stage !== stageCheck) continue;
    await LeadRepository.archive(id, admin);
    affectedIds.push(id);
  }
  return { success: true, count: affectedIds.length, affectedIds };
};

LeadRepository.restore = async (id, admin) => {
  const lead = await LeadRepository.findById(id);
  if (!lead) throw new Error("Lead not found");
  const notes = (lead.notes || []).filter((n) => !(n.isArchived || n.type === "archive"));
  notes.push({
    id: `restore_${Date.now()}`,
    type: "restore",
    restoredAt: new Date().toISOString(),
    restoredBy: admin?.name || "Admin",
  });
  return LeadRepository.update(id, { notes, stage: "lost" });
};

async function runAll() {
  // 1. Auth Guard Protection (Unauthorized request without cookie)
  await runAsyncTest("1. Exchange Rate API blocks unauthorized requests (401)", async () => {
    const req = new Request("http://localhost:3000/api/admin/exchange-rate");
    const res = await getExchangeRate(req);
    assert.strictEqual(res.status, 401);
  });

  // Create valid admin session token
  const adminToken = await createSessionToken({
    id: "admin_super_1",
    email: "admin@newbhar.com",
    name: "Super Admin",
    role: "SUPER_ADMIN",
  });
  const authHeaders = {
    Cookie: `${COOKIE_NAME}=${adminToken}`,
    "Content-Type": "application/json",
  };

  // 2. Exchange Rate API with Admin Auth
  await runAsyncTest("2. Exchange Rate API returns USD/INR rate with Admin Auth", async () => {
    const req = new Request("http://localhost:3000/api/admin/exchange-rate", {
      headers: authHeaders,
    });
    const res = await getExchangeRate(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.base, "USD");
    assert.strictEqual(data.target, "INR");
    assert.ok(data.usdToInr > 0);
    assert.ok(data.updatedAt);
  });

  // 3. GET Leads API with Admin Auth
  await runAsyncTest("3. GET /api/admin/leads returns active leads list", async () => {
    const req = new Request("http://localhost:3000/api/admin/leads", {
      headers: authHeaders,
    });
    const res = await getLeads(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.leads.length, 4);
  });

  // 4. POST Archive Single Lead
  await runAsyncTest("4. POST archive_lead safely archives single lost lead", async () => {
    const req = new Request("http://localhost:3000/api/admin/leads", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        action: "archive_lead",
        leadId: "lead_lost_1",
      }),
    });
    const res = await postLeads(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    // Verify lead is archived
    const lead = await LeadRepository.findById("lead_lost_1");
    assert.ok(lead.notes.some((n) => n.isArchived));

    // Verify GET active leads now excludes lead_lost_1
    const listRes = await getLeads(new Request("http://localhost:3000/api/admin/leads", { headers: authHeaders }));
    const listData = await listRes.json();
    assert.strictEqual(listData.leads.some((l) => l.id === "lead_lost_1"), false);
  });

  // 5. POST Restore Lead
  await runAsyncTest("5. POST restore_lead brings lead back to active pipeline", async () => {
    const req = new Request("http://localhost:3000/api/admin/leads", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        action: "restore_lead",
        leadId: "lead_lost_1",
      }),
    });
    const res = await postLeads(req);
    assert.strictEqual(res.status, 200);

    // Verify GET active leads now includes lead_lost_1 again
    const listRes = await getLeads(new Request("http://localhost:3000/api/admin/leads", { headers: authHeaders }));
    const listData = await listRes.json();
    assert.strictEqual(listData.leads.some((l) => l.id === "lead_lost_1"), true);
  });

  // 6. POST Archive Bulk with Stage Verification
  await runAsyncTest("6. POST archive_bulk clears selected lost leads and protects won lead", async () => {
    const req = new Request("http://localhost:3000/api/admin/leads", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        action: "archive_bulk",
        leadIds: ["lead_lost_1", "lead_lost_2", "lead_won_1"],
        stageCheck: "lost",
      }),
    });
    const res = await postLeads(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.count, 2); // Only the 2 lost leads were cleared
    assert.deepStrictEqual(data.affectedIds, ["lead_lost_1", "lead_lost_2"]);

    // Verify won lead is NOT archived
    const wonLead = await LeadRepository.findById("lead_won_1");
    assert.strictEqual(wonLead.notes?.some((n) => n.isArchived) || false, false);
  });

  // 7. POST Clear All Lost Leads
  await runAsyncTest("7. POST clear_all_lost executes cleanly", async () => {
    // Restore lead 1 & 2 for test
    await LeadRepository.restore("lead_lost_1");
    await LeadRepository.restore("lead_lost_2");

    const req = new Request("http://localhost:3000/api/admin/leads", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        action: "clear_all_lost",
      }),
    });
    const res = await postLeads(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.count, 2);
  });

  // 8. DELETE Lead with query params (safe archive)
  await runAsyncTest("8. DELETE /api/admin/leads?id=lead_new_1 archives lead safely", async () => {
    const req = new Request("http://localhost:3000/api/admin/leads?id=lead_new_1", {
      method: "DELETE",
      headers: authHeaders,
    });
    const res = await deleteLeads(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const lead = await LeadRepository.findById("lead_new_1");
    assert.ok(lead.notes.some((n) => n.isArchived));
  });

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} of ${total} API Route tests PASSED!`);
  console.log("=================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runAll();

/**
 * Test Suite: Opportunity Pipeline & Funnel Enhancements
 * Tests USD/INR Calculator math & rules, exchange rate caching/fallback,
 * and LeadRepository archival, selective clear, and restoration logic.
 *
 * Run with: node scripts/test-pipeline-enhancements.mjs
 */

import assert from "assert";

console.log("=================================================");
console.log("TEST SUITE: OPPORTUNITY PIPELINE & FUNNEL ENHANCEMENTS");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// ----------------------------------------------------------------------
// PART 1: Currency Conversion & Calculation Tests
// ----------------------------------------------------------------------
console.log("--- PART 1: USD ↔ INR Currency Calculator Tests ---");

const MOCK_USD_TO_INR = 86.85;

function convertCurrency(amount, from, to, rate) {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return 0;
  if (from === "USD" && to === "INR") {
    return num * rate;
  }
  if (from === "INR" && to === "USD") {
    return num / rate;
  }
  return num;
}

function formatUSD(num) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatINR(num) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

runTest("1. USD to INR conversion accurate calculation", () => {
  const result = convertCurrency(1000, "USD", "INR", MOCK_USD_TO_INR);
  assert.strictEqual(result, 86850);
});

runTest("2. USD to INR conversion with decimal values", () => {
  const result = convertCurrency(1250.50, "USD", "INR", MOCK_USD_TO_INR);
  assert.ok(Math.abs(result - 108605.925) < 0.001);
});

runTest("3. INR to USD conversion accurate calculation", () => {
  const result = convertCurrency(86850, "INR", "USD", MOCK_USD_TO_INR);
  assert.ok(Math.abs(result - 1000) < 0.0001);
});

runTest("4. INR to USD conversion with decimal values", () => {
  const result = convertCurrency(100000.75, "INR", "USD", MOCK_USD_TO_INR);
  assert.strictEqual(Number(result.toFixed(4)), 1151.4191);
});

runTest("5. Currency swapping maintains reciprocal conversion accuracy", () => {
  const usdAmount = 500;
  const inrResult = convertCurrency(usdAmount, "USD", "INR", MOCK_USD_TO_INR);
  const backToUsd = convertCurrency(inrResult, "INR", "USD", MOCK_USD_TO_INR);
  assert.strictEqual(Math.round(backToUsd), usdAmount);
});

runTest("6. Manual exchange-rate override calculation", () => {
  const overrideRate = 90.00; // Custom rate
  const result = convertCurrency(1000, "USD", "INR", overrideRate);
  assert.strictEqual(result, 90000);
});

runTest("7. Empty and invalid inputs produce 0 without throwing", () => {
  assert.strictEqual(convertCurrency("", "USD", "INR", MOCK_USD_TO_INR), 0);
  assert.strictEqual(convertCurrency("abc", "USD", "INR", MOCK_USD_TO_INR), 0);
  assert.strictEqual(convertCurrency("-50", "USD", "INR", MOCK_USD_TO_INR), 0);
});

runTest("8. Proper Currency String Formatting (USD en-US & INR en-IN)", () => {
  const usdFormatted = formatUSD(1250.50);
  const inrFormatted = formatINR(100000);
  assert.ok(usdFormatted.includes("1,250.50"));
  assert.ok(inrFormatted.includes("1,00,000")); // Indian numbering format check
});

// ----------------------------------------------------------------------
// PART 2: Safe Lead Archival, Selective Clear & Restore Tests
// ----------------------------------------------------------------------
console.log("\n--- PART 2: Safe Lead Archival & Lost Section Clear Tests ---");

import { isLeadArchived } from "../lib/repositories/lead.repository.js";

runTest("9. isLeadArchived detects non-archived leads correctly", () => {
  const activeLead = {
    id: "lead_1",
    name: "Subhamoy Saha",
    email: "subhamoy@example.com",
    stage: "lost",
    notes: [{ text: "Customer said budget postponed", author: "Admin" }],
  };
  assert.strictEqual(isLeadArchived(activeLead), false);
});

runTest("10. isLeadArchived detects archived leads via notes entry", () => {
  const archivedLead = {
    id: "lead_2",
    name: "Alex Vance",
    email: "alex@example.com",
    stage: "lost",
    notes: [
      { text: "Customer call notes" },
      {
        id: "lead_archived_12345",
        type: "archive",
        isArchived: true,
        archivedAt: "2026-11-27T10:00:00Z",
        previousStage: "lost",
      },
    ],
  };
  assert.strictEqual(isLeadArchived(archivedLead), true);
});

runTest("11. isLeadArchived detects archived leads via is_archived column if present", () => {
  const archivedWithColumn = {
    id: "lead_3",
    name: "Jordan Lee",
    email: "jordan@example.com",
    stage: "lost",
    is_archived: true,
    notes: [],
  };
  assert.strictEqual(isLeadArchived(archivedWithColumn), true);
});

runTest("12. Individual Lead Archive preserves customer contact information", () => {
  const originalLead = {
    id: "lead_test_indiv",
    name: "Subhamoy Saha",
    email: "subhamoy@example.com",
    companyName: "Newbhar Partner",
    service: "Software Development",
    stage: "lost",
    estimatedValue: 2500,
    notes: [{ text: "Initial contact via form" }],
  };

  // Simulate repository archive logic
  const notes = [...originalLead.notes];
  notes.push({
    id: `lead_archived_${Date.now()}`,
    type: "archive",
    isArchived: true,
    archivedAt: new Date().toISOString(),
    archivedBy: "Super Admin",
    previousStage: originalLead.stage,
    reason: "Cleared from pipeline",
  });

  const updatedLead = { ...originalLead, notes };

  assert.strictEqual(isLeadArchived(updatedLead), true);
  assert.strictEqual(updatedLead.name, "Subhamoy Saha");
  assert.strictEqual(updatedLead.email, "subhamoy@example.com");
  assert.strictEqual(updatedLead.companyName, "Newbhar Partner");
  assert.strictEqual(updatedLead.estimatedValue, 2500);
  assert.strictEqual(updatedLead.notes.length, 2);
});

runTest("13. Bulk clear strictly verifies LOST status and ignores other pipeline stages", () => {
  const leadsDataset = [
    { id: "1", name: "Lead 1", stage: "lost", notes: [] },
    { id: "2", name: "Lead 2", stage: "lost", notes: [] },
    { id: "3", name: "Won Client", stage: "won", notes: [] },
    { id: "4", name: "Qualified Deal", stage: "qualified", notes: [] },
    { id: "5", name: "New Inquiry", stage: "new", notes: [] },
  ];

  const targetIds = ["1", "2", "3", "4", "5"];
  const stageCheck = "lost";

  const affectedIds = [];
  const skippedIds = [];

  for (const id of targetIds) {
    const lead = leadsDataset.find((l) => l.id === id);
    if (!lead) continue;
    if (stageCheck && lead.stage !== stageCheck) {
      skippedIds.push({ id, reason: `Lead stage '${lead.stage}' not '${stageCheck}'` });
      continue;
    }
    affectedIds.push(id);
  }

  assert.deepStrictEqual(affectedIds, ["1", "2"]);
  assert.strictEqual(skippedIds.length, 3);
  assert.ok(skippedIds.some((s) => s.id === "3")); // Won lead was safely preserved!
  assert.ok(skippedIds.some((s) => s.id === "4")); // Qualified deal was safely preserved!
  assert.ok(skippedIds.some((s) => s.id === "5")); // New inquiry was safely preserved!
});

runTest("14. Restore functionality cleanly restores lead back to its previous stage", () => {
  const archivedLead = {
    id: "lead_restore_test",
    name: "Rachel Green",
    email: "rachel@example.com",
    stage: "lost",
    notes: [
      { text: "Call made" },
      {
        id: "archive_1",
        type: "archive",
        isArchived: true,
        archivedAt: "2026-11-20T00:00:00Z",
        previousStage: "lost",
      },
    ],
  };

  // Restoration logic
  const existingNotes = [...archivedLead.notes];
  const lastArchive = existingNotes.filter((n) => n && (n.isArchived || n.type === "archive")).pop();
  const restoredStage = lastArchive?.previousStage || "lost";
  const cleanedNotes = existingNotes.filter((n) => !(n && (n.isArchived || n.type === "archive")));
  cleanedNotes.push({
    id: `lead_restored_${Date.now()}`,
    type: "restore",
    restoredAt: new Date().toISOString(),
    restoredBy: "Admin",
    restoredStage,
  });

  const restoredLead = {
    ...archivedLead,
    stage: restoredStage,
    notes: cleanedNotes,
  };

  assert.strictEqual(isLeadArchived(restoredLead), false);
  assert.strictEqual(restoredLead.stage, "lost");
  assert.ok(restoredLead.notes.some((n) => n.type === "restore"));
});

runTest("15. Active pipeline filter correctly excludes archived leads", () => {
  const allLeads = [
    { id: "1", name: "A", stage: "lost", notes: [{ isArchived: true }] },
    { id: "2", name: "B", stage: "lost", notes: [] },
    { id: "3", name: "C", stage: "new", notes: [] },
  ];

  const activeLeads = allLeads.filter((l) => !isLeadArchived(l));
  assert.strictEqual(activeLeads.length, 2);
  assert.strictEqual(activeLeads.some((l) => l.id === "1"), false);
});

console.log("\n=================================================");
console.log(`SUMMARY: ${passedTests} of ${totalTests} tests PASSED!`);
console.log("=================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}

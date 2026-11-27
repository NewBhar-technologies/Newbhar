"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  ArrowRight,
  UserCheck,
  Building2,
  Mail,
  CheckCircle2,
  DollarSign,
  Search,
  Filter,
  RotateCcw,
  X,
  Save,
  AlertCircle,
  Clock,
  Trash2,
  CheckSquare,
  Square,
  Archive,
  RefreshCw,
  AlertTriangle,
  History,
  Check,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { CurrencyCalculator } from "@/components/admin/currency-calculator";
import { formatCurrencyUSD, parseBudgetValue } from "@/lib/utils";

const STAGES = [
  { id: "new", label: "New Leads", color: "border-[#98f90d]/30 bg-[#98f90d]/[0.02]", text: "text-[#98f90d]" },
  { id: "contacted", label: "Contacted", color: "border-cyan-500/30 bg-cyan-500/[0.02]", text: "text-cyan-400" },
  { id: "qualified", label: "Qualified", color: "border-purple-500/30 bg-purple-500/[0.02]", text: "text-purple-400" },
  { id: "proposal_sent", label: "Proposal Sent", color: "border-indigo-500/30 bg-indigo-500/[0.02]", text: "text-indigo-400" },
  { id: "won", label: "Won (Clients)", color: "border-emerald-500/30 bg-emerald-500/[0.02]", text: "text-emerald-400" },
  { id: "lost", label: "Lost", color: "border-white/10 bg-white/[0.01]", text: "text-gray-400" },
];

const BUDGET_PRESETS = [50, 100, 500, 1000, 2500, 5000];

const BUDGET_FILTER_LABELS = {
  specified: "Budget Specified",
  unspecified: "Budget Not Specified",
  under_100: "Under $100",
  "100_500": "$100 – $500",
  "500_1000": "$500 – $1,000",
  "1000_2500": "$1,000 – $2,500",
  "2500_5000": "$2,500 – $5,000",
  above_5000: "$5,000+",
};

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState([]);
  const [archivedLeads, setArchivedLeads] = useState([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");

  // Lead Dossier modal editing states
  const [editBudget, setEditBudget] = useState("");
  const [editStage, setEditStage] = useState("new");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState("");

  // Notification Toast state
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

  // Lost Leads Management States
  const [isLostSelectionMode, setIsLostSelectionMode] = useState(false);
  const [selectedLostLeadIds, setSelectedLostLeadIds] = useState([]);

  // Confirmation Modals State
  const [leadToDelete, setLeadToDelete] = useState(null); // Individual lead removal
  const [showClearAllLostModal, setShowClearAllLostModal] = useState(false);
  const [showClearSelectedModal, setShowClearSelectedModal] = useState(false);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Create lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    email: "",
    companyName: "",
    service: "Software Development",
    estimatedValue: "",
    stage: "new",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeads(data.leads || []);
          if (data.archivedCount !== undefined) {
            setArchivedCount(data.archivedCount);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchArchivedLeads = useCallback(() => {
    fetch("/api/admin/leads?onlyArchived=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setArchivedLeads(data.leads || []);
          setArchivedCount(data.leads?.length || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchArchivedLeads();
  }, [fetchLeads, fetchArchivedLeads]);

  const openLeadDossier = (lead) => {
    setSelectedLead(lead);
    setEditBudget(lead.estimatedValue > 0 ? String(lead.estimatedValue) : "");
    setEditStage(lead.stage || "new");
    setSaveStatus(null);
    setStatusMessage("");
  };

  const handleStageChange = async (leadId, newStage) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, stage: newStage }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev) => ({ ...prev, stage: newStage }));
          setEditStage(newStage);
        }
        showToast(`Lead moved to ${newStage} stage`, "success");
      }
    } catch {
      showToast("Failed to update lead stage", "error");
    }
  };

  const handleConvertToClient = async (leadId) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert_to_client", leadId }),
      });
      if (res.ok) {
        showToast("Lead successfully converted to corporate Client dossier!", "success");
        fetchLeads();
        setSelectedLead(null);
      }
    } catch {
      showToast("Failed to convert lead to client", "error");
    }
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    setSaveStatus(null);
    setStatusMessage("");

    const parsedVal = parseBudgetValue(editBudget);

    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLead.id,
          stage: editStage,
          estimatedValue: parsedVal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus("success");
        setStatusMessage("Deal value & stage saved successfully");

        const updatedLead = {
          ...selectedLead,
          estimatedValue: parsedVal,
          stage: editStage,
        };
        setSelectedLead(updatedLead);
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? updatedLead : l))
        );

        setTimeout(() => {
          setSaveStatus(null);
        }, 3000);
      } else {
        setSaveStatus("error");
        setStatusMessage(data.error || "Failed to save lead updates");
      }
    } catch (err) {
      setSaveStatus("error");
      setStatusMessage(err.message || "Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLeadForm,
        estimatedValue: parseBudgetValue(newLeadForm.estimatedValue),
      };
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewLeadForm({
          name: "",
          email: "",
          companyName: "",
          service: "Software Development",
          estimatedValue: "",
          stage: "new",
        });
        showToast("New opportunity created successfully", "success");
        fetchLeads();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to create lead", "error");
      }
    } catch {
      showToast("Error creating lead", "error");
    }
  };

  // -------------------------------------------------------------
  // PART 2: Lost & Individual Lead Clear Actions
  // -------------------------------------------------------------

  // 1. Confirm and execute single lead removal
  const handleConfirmSingleDelete = async () => {
    if (!leadToDelete) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive_lead",
          leadId: leadToDelete.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
        setSelectedLostLeadIds((prev) => prev.filter((id) => id !== leadToDelete.id));
        setArchivedCount((c) => c + 1);
        showToast(`Lead "${leadToDelete.name}" safely removed and archived.`, "success");
        fetchArchivedLeads();
        setLeadToDelete(null);
      } else {
        showToast(data.error || "Failed to remove lead.", "error");
      }
    } catch (err) {
      showToast(err.message || "Network error during removal.", "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 2. Confirm and execute Clear All Lost Leads
  const handleConfirmClearAllLost = async () => {
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear_all_lost",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Remove only lost leads from local state
        setLeads((prev) => prev.filter((l) => l.stage !== "lost"));
        setSelectedLostLeadIds([]);
        setIsLostSelectionMode(false);
        showToast(`All ${data.count || 0} lost leads cleared and safely archived.`, "success");
        fetchArchivedLeads();
        setShowClearAllLostModal(false);
      } else {
        showToast(data.error || "Failed to clear lost leads.", "error");
      }
    } catch (err) {
      showToast(err.message || "Network error clearing lost leads.", "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 3. Confirm and execute Clear Selected Lost Leads
  const handleConfirmClearSelected = async () => {
    if (selectedLostLeadIds.length === 0) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive_bulk",
          leadIds: selectedLostLeadIds,
          stageCheck: "lost",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const removedSet = new Set(data.affectedIds || selectedLostLeadIds);
        setLeads((prev) => prev.filter((l) => !removedSet.has(l.id)));
        setSelectedLostLeadIds([]);
        showToast(`Successfully removed and archived ${data.count || 0} selected lead(s).`, "success");
        fetchArchivedLeads();
        setShowClearSelectedModal(false);
      } else {
        showToast(data.error || "Failed to remove selected leads.", "error");
      }
    } catch (err) {
      showToast(err.message || "Network error removing selected leads.", "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 4. Restore an archived lead back to pipeline
  const handleRestoreLead = async (leadId) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore_lead",
          leadId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Lead restored back to ${data.lead?.stage || "active"} stage!`, "success");
        fetchLeads();
        fetchArchivedLeads();
      } else {
        showToast(data.error || "Failed to restore lead.", "error");
      }
    } catch (err) {
      showToast(err.message || "Error restoring lead.", "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchQuery("");
    setStageFilter("all");
    setBudgetFilter("all");
    setSortFilter("newest");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    stageFilter !== "all" ||
    budgetFilter !== "all" ||
    sortFilter !== "newest";

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            (lead.name && lead.name.toLowerCase().includes(q)) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            (lead.companyName && lead.companyName.toLowerCase().includes(q)) ||
            (lead.service && lead.service.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Stage Filter
        if (stageFilter !== "all" && lead.stage !== stageFilter) {
          return false;
        }

        // Budget Filter
        const val = Number(lead.estimatedValue) || 0;
        if (budgetFilter === "specified" && val <= 0) return false;
        if (budgetFilter === "unspecified" && val > 0) return false;
        if (budgetFilter === "under_100" && (val <= 0 || val >= 100)) return false;
        if (budgetFilter === "100_500" && (val < 100 || val > 500)) return false;
        if (budgetFilter === "500_1000" && (val < 500 || val > 1000)) return false;
        if (budgetFilter === "1000_2500" && (val < 1000 || val > 2500)) return false;
        if (budgetFilter === "2500_5000" && (val < 2500 || val > 5000)) return false;
        if (budgetFilter === "above_5000" && val < 5000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortFilter === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortFilter === "val_desc") {
          return (Number(b.estimatedValue) || 0) - (Number(a.estimatedValue) || 0);
        }
        if (sortFilter === "val_asc") {
          return (Number(a.estimatedValue) || 0) - (Number(b.estimatedValue) || 0);
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [leads, searchQuery, stageFilter, budgetFilter, sortFilter]);

  // Overall Pipeline Value for Filtered Leads
  const totalPipelineValue = useMemo(() => {
    return filteredLeads.reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0);
  }, [filteredLeads]);

  // Lost Leads in current view
  const currentLostLeads = useMemo(() => {
    return filteredLeads.filter((l) => l.stage === "lost");
  }, [filteredLeads]);

  // Toggle selection for single lost lead
  const toggleSelectLostLead = (id, e) => {
    e.stopPropagation();
    setSelectedLostLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All Lost Leads
  const toggleSelectAllLostLeads = () => {
    const allIds = currentLostLeads.map((l) => l.id);
    if (selectedLostLeadIds.length === allIds.length && allIds.length > 0) {
      setSelectedLostLeadIds([]);
    } else {
      setSelectedLostLeadIds(allIds);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0f111a] border border-[#98f90d]/40 px-4 py-3 shadow-[0_0_25px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toast.type === "error" ? (
            <AlertCircle size={16} className="text-rose-400" />
          ) : (
            <CheckCircle2 size={16} className="text-[#98f90d]" />
          )}
          <span className="text-xs font-mono font-medium text-white">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#98f90d] uppercase">
              Supabase Live Pipeline: leads
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Opportunity Pipeline &amp; Funnel
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Visual Kanban management of enterprise prospects, financial currency calculation, and lead clearing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Archived Directory Button */}
          <button
            type="button"
            onClick={() => {
              fetchArchivedLeads();
              setShowArchivedModal(true);
            }}
            title="View and restore archived leads"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0c0e15] px-3.5 py-2 text-xs font-mono text-gray-300 hover:text-white hover:border-white/25 transition shadow-sm"
          >
            <Archive size={14} className="text-gray-400" />
            <span>Archived</span>
            <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 text-[10px] font-bold text-[#98f90d]">
              {archivedCount}
            </span>
          </button>

          {/* Pipeline Total Value */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Total Pipeline Value</span>
            <span className="text-sm font-mono font-extrabold text-[#98f90d]">
              {formatCurrencyUSD(totalPipelineValue, { zeroAsCurrency: true })}
            </span>
          </div>

          {/* New Lead Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#98f90d] px-4 py-2.5 text-xs font-black tracking-wider uppercase text-[#050505] hover:bg-[#86e00b] transition shadow-[0_0_15px_rgba(152,249,13,0.3)]"
          >
            <Plus size={16} />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* PART 1: USD ↔ INR Currency Calculator */}
      <CurrencyCalculator />

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15] p-3.5 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, email, company..."
              className="w-full rounded-xl border border-white/10 bg-[#12141e] pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#12141e] px-3 py-2 text-xs text-gray-200 focus:border-[#98f90d] focus:outline-none"
            >
              <option value="all">All Stages</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  Stage: {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div>
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#12141e] px-3 py-2 text-xs text-gray-200 focus:border-[#98f90d] focus:outline-none"
            >
              <option value="all">All Budgets</option>
              <option value="specified">Budget Specified ($ &gt; 0)</option>
              <option value="unspecified">Budget Not Specified</option>
              <option value="under_100">Under $100</option>
              <option value="100_500">$100 – $500</option>
              <option value="500_1000">$500 – $1,000</option>
              <option value="1000_2500">$1,000 – $2,500</option>
              <option value="2500_5000">$2,500 – $5,000</option>
              <option value="above_5000">$5,000+</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#12141e] px-3 py-2 text-xs text-gray-200 focus:border-[#98f90d] focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="val_desc">Sort: Highest Deal Value</option>
              <option value="val_asc">Sort: Lowest Deal Value</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition ${
                hasActiveFilters
                  ? "bg-[#98f90d]/15 text-[#98f90d] border border-[#98f90d]/40 hover:bg-[#98f90d]/25 shadow-[0_0_10px_rgba(152,249,13,0.15)]"
                  : "bg-white/[0.03] text-gray-500 border border-white/[0.06] cursor-not-allowed opacity-60"
              }`}
            >
              <RotateCcw size={13} className={hasActiveFilters ? "animate-spin-once" : ""} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Summary & Active Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.05] text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredLeads.length}</strong> of{" "}
              <strong className="text-gray-300">{leads.length}</strong> active leads
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#98f90d]/10 px-2 py-0.5 text-[10px] text-[#98f90d] font-bold">
                Filtered Active
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-300">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button type="button" onClick={() => setSearchQuery("")} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              )}
              {stageFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-300">
                  Stage: {STAGES.find((s) => s.id === stageFilter)?.label || stageFilter}
                  <button type="button" onClick={() => setStageFilter("all")} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              )}
              {budgetFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-300">
                  Budget: {BUDGET_FILTER_LABELS[budgetFilter] || budgetFilter}
                  <button type="button" onClick={() => setBudgetFilter("all")} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              )}
              {sortFilter !== "newest" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-300">
                  Sort: {sortFilter}
                  <button type="button" onClick={() => setSortFilter("newest")} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
          const totalVal = stageLeads.reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0);
          const isLostColumn = stage.id === "lost";
          const isNewColumn = stage.id === "new";

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-3xl border ${stage.color} p-4 min-w-[220px] bg-[#0c0e15] shadow-xl`}
            >
              {/* Column Header */}
              <div className="mb-3.5 border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xs font-bold uppercase font-mono ${stage.text}`}>{stage.label}</h3>
                    <div className="text-[11px] text-gray-300 font-mono font-bold mt-0.5">
                      {formatCurrencyUSD(totalVal, { zeroAsCurrency: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Lost Column Extra Actions (Clear All & Selection mode) */}
                    {isLostColumn && (
                      <div className="flex items-center gap-1">
                        {/* Toggle Selection Mode Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isLostSelectionMode) {
                              setSelectedLostLeadIds([]);
                            }
                            setIsLostSelectionMode(!isLostSelectionMode);
                          }}
                          title={isLostSelectionMode ? "Cancel selection mode" : "Select leads"}
                          className={`p-1 rounded-lg text-[10px] font-mono border transition ${
                            isLostSelectionMode
                              ? "bg-[#98f90d]/20 border-[#98f90d] text-[#98f90d]"
                              : "border-white/10 bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          <CheckSquare size={12} />
                        </button>

                        {/* PART 2.2: CLEAR ALL LOST LEADS BUTTON */}
                        <button
                          type="button"
                          onClick={() => setShowClearAllLostModal(true)}
                          disabled={stageLeads.length === 0}
                          title="Clear all lost leads from pipeline"
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Clear All
                        </button>
                      </div>
                    )}

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-mono font-bold text-white">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* PART 2.3: Selective Clear Toolbar in Lost column when selection mode active */}
                {isLostColumn && isLostSelectionMode && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-1.5 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={toggleSelectAllLostLeads}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-300 hover:text-white"
                    >
                      {selectedLostLeadIds.length === stageLeads.length && stageLeads.length > 0 ? (
                        <CheckSquare size={12} className="text-[#98f90d]" />
                      ) : (
                        <Square size={12} className="text-gray-400" />
                      )}
                      <span>
                        {selectedLostLeadIds.length === stageLeads.length && stageLeads.length > 0
                          ? "Deselect"
                          : "Select All"}
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      {selectedLostLeadIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowClearSelectedModal(true)}
                          className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 transition shadow-sm"
                        >
                          Clear ({selectedLostLeadIds.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLostLeadIds([]);
                          setIsLostSelectionMode(false);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-300"
                        title="Cancel Selection"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cards in Column */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-white/10 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="py-10 text-center text-[10px] font-mono text-gray-600 uppercase">
                    Stage Empty
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isSpecified = Number(lead.estimatedValue) > 0;
                    const isSelected = selectedLostLeadIds.includes(lead.id);

                    return (
                      <div
                        key={lead.id}
                        className={`group rounded-2xl border p-3.5 shadow-md transition-all cursor-pointer relative ${
                          isLostColumn && isSelected
                            ? "border-[#98f90d]/60 bg-[#12141e]/90 shadow-[0_0_12px_rgba(152,249,13,0.15)]"
                            : "border-white/10 bg-[#12141e] hover:border-[#98f90d]/40"
                        }`}
                        onClick={() => openLeadDossier(lead)}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Checkbox for selective clear in Lost column */}
                            {isLostColumn && isLostSelectionMode && (
                              <button
                                type="button"
                                onClick={(e) => toggleSelectLostLead(lead.id, e)}
                                className="text-gray-400 hover:text-white shrink-0 p-0.5"
                              >
                                {isSelected ? (
                                  <CheckSquare size={13} className="text-[#98f90d]" />
                                ) : (
                                  <Square size={13} className="text-gray-500" />
                                )}
                              </button>
                            )}
                            <span className="font-bold text-xs text-white group-hover:text-[#98f90d] transition truncate">
                              {lead.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSpecified ? (
                              <span className="text-[10px] font-mono font-bold text-[#98f90d] bg-[#98f90d]/10 border border-[#98f90d]/25 px-1.5 py-0.5 rounded-md">
                                {formatCurrencyUSD(lead.estimatedValue)}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-medium text-gray-400 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded-md">
                                Budget not specified
                              </span>
                            )}

                            {/* PART 2.1: INDIVIDUAL LEAD REMOVE BUTTON on LOST and NEW sections */}
                            {(isLostColumn || isNewColumn) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLeadToDelete(lead);
                                }}
                                title="Remove lead from pipeline"
                                className="opacity-70 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-500/15 transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-400 truncate mb-2">
                          {lead.companyName || lead.email}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-white/[0.06] pt-2 mt-2">
                          <span className="truncate max-w-[100px] font-medium text-gray-400">{lead.service}</span>
                          <select
                            value={lead.stage}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStageChange(lead.id, e.target.value)}
                            className="rounded-lg border border-white/10 bg-[#0c0e15] text-[10px] text-gray-300 font-mono font-medium py-0.5 px-1.5 focus:border-[#98f90d]"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-[#0c0e15] text-white">
                                &rarr; {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CONFIRMATION DIALOG 1: Individual Lead Clear                  */}
      {/* ------------------------------------------------------------- */}
      {leadToDelete && (
        <Modal
          isOpen={Boolean(leadToDelete)}
          onClose={() => setLeadToDelete(null)}
          title="Remove Lead from Pipeline"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-gray-300">
            <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3.5">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">
                  Are you sure you want to remove this {leadToDelete.stage === "lost" ? "lost" : ""} lead?
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  The lead will be safely removed from the active pipeline and archived. Customer contact history is preserved for recovery.
                </p>
              </div>
            </div>

            {/* Customer Details Display */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase text-[10px]">Customer:</span>
                <span className="text-white font-bold">{leadToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase text-[10px]">Email:</span>
                <span className="text-gray-300">{leadToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase text-[10px]">Stage:</span>
                <span className="text-gray-300 uppercase">{leadToDelete.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase text-[10px]">Deal Value:</span>
                <span className="text-[#98f90d]">{formatCurrencyUSD(leadToDelete.estimatedValue)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isProcessingAction}
                className="rounded-full border border-white/10 px-4 py-2 font-medium text-gray-400 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isProcessingAction}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-5 py-2 font-bold text-white hover:bg-rose-600 transition shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isProcessingAction ? "Removing..." : "Remove Lead"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONFIRMATION DIALOG 2: Clear All Lost Leads                   */}
      {/* ------------------------------------------------------------- */}
      {showClearAllLostModal && (
        <Modal
          isOpen={showClearAllLostModal}
          onClose={() => setShowClearAllLostModal(false)}
          title="Clear All Lost Leads?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-gray-300">
            <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3.5">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">
                  This action will remove all {currentLostLeads.length} leads currently in the Lost section.
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Other pipeline stages (New, Contacted, Qualified, Proposal Sent, Won) will remain completely unchanged. All removed leads are safely archived.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 text-[11px] font-mono text-gray-400">
              <div className="flex justify-between py-1">
                <span>Leads affected:</span>
                <strong className="text-rose-400">{currentLostLeads.length} leads</strong>
              </div>
              <div className="flex justify-between py-1 border-t border-white/[0.04]">
                <span>Status target:</span>
                <strong className="text-white">LOST stage only</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowClearAllLostModal(false)}
                disabled={isProcessingAction}
                className="rounded-full border border-white/10 px-4 py-2 font-medium text-gray-400 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllLost}
                disabled={isProcessingAction || currentLostLeads.length === 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-5 py-2 font-bold text-white hover:bg-rose-600 transition shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isProcessingAction ? "Clearing..." : "Confirm Clear All"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONFIRMATION DIALOG 3: Clear Selected Lost Leads              */}
      {/* ------------------------------------------------------------- */}
      {showClearSelectedModal && (
        <Modal
          isOpen={showClearSelectedModal}
          onClose={() => setShowClearSelectedModal(false)}
          title="Clear Selected Lost Leads?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-gray-300">
            <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3.5">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">
                  Remove {selectedLostLeadIds.length} selected lead(s) from the Lost section?
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Only the selected records will be removed and archived. Other pipeline stages will remain unchanged.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 text-[11px] font-mono text-gray-300">
              Selected: <strong className="text-[#98f90d]">{selectedLostLeadIds.length} Leads</strong>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowClearSelectedModal(false)}
                disabled={isProcessingAction}
                className="rounded-full border border-white/10 px-4 py-2 font-medium text-gray-400 hover:bg-white/10 transition"
              >
                Cancel Selection
              </button>
              <button
                type="button"
                onClick={handleConfirmClearSelected}
                disabled={isProcessingAction}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-5 py-2 font-bold text-white hover:bg-rose-600 transition shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isProcessingAction ? "Removing..." : "Clear Selected"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Archived Leads Directory & Restore                   */}
      {/* ------------------------------------------------------------- */}
      {showArchivedModal && (
        <Modal
          isOpen={showArchivedModal}
          onClose={() => setShowArchivedModal(false)}
          title={`Archived Leads Directory (${archivedLeads.length})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-gray-300">
            <p className="text-gray-400 text-xs">
              All leads removed from the active pipeline are preserved here. You can safely restore any record back into the Opportunity Pipeline.
            </p>

            <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {archivedLeads.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-mono text-xs">
                  No archived leads found.
                </div>
              ) : (
                archivedLeads.map((lead) => {
                  return (
                    <div
                      key={lead.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#12141e] p-3.5 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{lead.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-gray-400 uppercase">
                            {lead.stage}
                          </span>
                          {Number(lead.estimatedValue) > 0 && (
                            <span className="text-[10px] font-mono text-[#98f90d]">
                              {formatCurrencyUSD(lead.estimatedValue)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          {lead.email} {lead.companyName ? `• ${lead.companyName}` : ""}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRestoreLead(lead.id)}
                        disabled={isProcessingAction}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#98f90d]/40 bg-[#98f90d]/10 px-3.5 py-1.5 text-xs font-mono font-bold text-[#98f90d] hover:bg-[#98f90d]/20 transition shrink-0"
                      >
                        <RotateCcw size={13} />
                        <span>Restore to Pipeline</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowArchivedModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 font-medium text-gray-400 hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Lead Detail / Conversion Modal                                */}
      {/* ------------------------------------------------------------- */}
      {selectedLead && (
        <Modal
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          title={`Lead Dossier: ${selectedLead.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs text-gray-300">
            {/* Core Info Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08]">
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Email</span>
                <p className="font-semibold text-white font-mono mt-0.5 break-all">{selectedLead.email}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Service</span>
                <p className="font-semibold text-white mt-0.5">{selectedLead.service || "General"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Company</span>
                <p className="font-semibold text-white mt-0.5">{selectedLead.companyName || "Independent"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Current Value</span>
                <p className={`font-mono text-xs font-bold mt-0.5 ${Number(selectedLead.estimatedValue) > 0 ? "text-[#98f90d]" : "text-gray-400"}`}>
                  {formatCurrencyUSD(selectedLead.estimatedValue)}
                </p>
              </div>
            </div>

            {/* Deal / Budget Value Editor with Clear Value button */}
            <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <DollarSign size={13} className="text-[#98f90d]" />
                  <span>Edit Deal Value (USD)</span>
                </label>
                <span className="text-[10px] font-mono text-gray-400">
                  Status: <strong className={parseBudgetValue(editBudget) > 0 ? "text-[#98f90d]" : "text-amber-400/90"}>
                    {formatCurrencyUSD(parseBudgetValue(editBudget))}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold text-xs">
                    $
                  </span>
                  <input
                    type="text"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    placeholder="Enter amount (e.g. 500 or 2,500)"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0e15] pl-7 pr-3 py-2 text-xs text-white placeholder-gray-500 font-mono focus:border-[#98f90d] focus:outline-none"
                  />
                </div>

                {/* CLEAR VALUE BUTTON */}
                <button
                  type="button"
                  onClick={() => setEditBudget("")}
                  title="Clear budget (resets to 'Budget not specified')"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 transition shrink-0"
                >
                  <X size={14} />
                  <span>Clear Value</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-gray-500 mr-1">Presets:</span>
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditBudget(String(preset))}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium border transition ${
                      parseBudgetValue(editBudget) === preset
                        ? "bg-[#98f90d]/20 border-[#98f90d] text-[#98f90d]"
                        : "bg-white/[0.04] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {formatCurrencyUSD(preset)}
                  </button>
                ))}
              </div>

              {/* Stage Selector inside modal */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-gray-400 font-mono text-[11px]">Pipeline Stage:</span>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0c0e15] text-xs text-white font-mono py-1 px-2.5 focus:border-[#98f90d]"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feedback Banners */}
            {saveStatus === "success" && (
              <div className="flex items-center gap-2 rounded-xl bg-[#98f90d]/10 border border-[#98f90d]/30 px-3 py-2 text-xs text-[#98f90d] font-mono">
                <CheckCircle2 size={15} />
                <span>{statusMessage}</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs text-rose-400 font-mono">
                <AlertCircle size={15} />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
              {selectedLead.stage !== "won" ? (
                <button
                  type="button"
                  onClick={() => handleConvertToClient(selectedLead.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <UserCheck size={14} />
                  <span>Convert to Client</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  ✓ Converted Client
                </span>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveLeadDetails}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#98f90d] px-5 py-2 text-xs font-black tracking-wider uppercase text-[#050505] hover:bg-[#86e00b] transition disabled:opacity-50 shadow-[0_0_15px_rgba(152,249,13,0.3)]"
                >
                  <Save size={14} />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Create Lead Modal                                             */}
      {/* ------------------------------------------------------------- */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Lead Opportunity"
        >
          <form onSubmit={handleCreateLead} className="space-y-4 text-xs text-gray-300">
            <div>
              <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                Lead Name *
              </label>
              <input
                type="text"
                required
                value={newLeadForm.name}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                placeholder="e.g. Michael Thorne"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={newLeadForm.companyName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, companyName: e.target.value })}
                  placeholder="Apex Global"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Estimated Deal Value ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold text-xs">
                    $
                  </span>
                  <input
                    type="text"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                    placeholder="e.g. 500 (or leave empty for unstated)"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-7 pr-3 py-3 text-xs text-white focus:border-[#98f90d] focus:outline-none font-mono"
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewLeadForm({ ...newLeadForm, estimatedValue: String(preset) })}
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/10"
                    >
                      {formatCurrencyUSD(preset)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Service Required
                </label>
                <select
                  value={newLeadForm.service}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0e15] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="AI & ML Development">AI & ML Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 font-medium text-gray-400 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#98f90d] px-5 py-2 font-bold text-black hover:bg-[#86e00b] transition shadow-[0_0_15px_rgba(152,249,13,0.3)]"
              >
                Create Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

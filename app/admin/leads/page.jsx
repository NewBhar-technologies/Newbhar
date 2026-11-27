"use client";

import { useState, useEffect, useMemo } from "react";
import {
  KanbanSquare,
  Plus,
  ArrowRight,
  UserCheck,
  Building2,
  Mail,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Search,
  Filter,
  RotateCcw,
  X,
  Save,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
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

  // Create lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    email: "",
    companyName: "",
    service: "Software Development",
    estimatedValue: "",
    stage: "new",
  });

  const fetchLeads = () => {
    setLoading(true);
    fetch("/api/admin/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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
      }
    } catch {}
  };

  const handleConvertToClient = async (leadId) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert_to_client", leadId }),
      });
      if (res.ok) {
        alert("Lead successfully converted to corporate Client dossier!");
        fetchLeads();
        setSelectedLead(null);
      }
    } catch {}
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    setSaveStatus(null);
    setStatusMessage("");

    const parsedVal = parseBudgetValue(editBudget); // 0 if empty or "Budget not specified"

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
        fetchLeads();
      }
    } catch {}
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

  return (
    <div className="space-y-6 text-white">
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
            Visual Kanban management of enterprise prospects and dynamic deal values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Total Pipeline Value</span>
            <span className="text-sm font-mono font-extrabold text-[#98f90d]">
              {formatCurrencyUSD(totalPipelineValue, { zeroAsCurrency: true })}
            </span>
          </div>
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
              <strong className="text-gray-300">{leads.length}</strong> leads
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

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-3xl border ${stage.color} p-4 min-w-[220px] bg-[#0c0e15] shadow-xl`}
            >
              {/* Column Header */}
              <div className="mb-3.5 flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div>
                  <h3 className={`text-xs font-bold uppercase font-mono ${stage.text}`}>{stage.label}</h3>
                  <div className="text-[11px] text-gray-300 font-mono font-bold mt-0.5">
                    {formatCurrencyUSD(totalVal, { zeroAsCurrency: true })}
                  </div>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-mono font-bold text-white">
                  {stageLeads.length}
                </span>
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
                    return (
                      <div
                        key={lead.id}
                        className="group rounded-2xl border border-white/10 bg-[#12141e] p-3.5 shadow-md hover:border-[#98f90d]/40 transition-all cursor-pointer"
                        onClick={() => openLeadDossier(lead)}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <span className="font-bold text-xs text-white group-hover:text-[#98f90d] transition truncate">
                            {lead.name}
                          </span>
                          {isSpecified ? (
                            <span className="shrink-0 text-[10px] font-mono font-bold text-[#98f90d] bg-[#98f90d]/10 border border-[#98f90d]/25 px-1.5 py-0.5 rounded-md">
                              {formatCurrencyUSD(lead.estimatedValue)}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[9px] font-mono font-medium text-gray-400 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded-md">
                              Budget not specified
                            </span>
                          )}
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

      {/* Lead Detail / Conversion Modal */}
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

      {/* Create Lead Modal */}
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

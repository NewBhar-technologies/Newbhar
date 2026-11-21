"use client";

import { useState, useEffect } from "react";
import { KanbanSquare, Plus, ArrowRight, UserCheck, DollarSign, Building2, Mail, MoreHorizontal, CheckCircle2, Sparkles } from "lucide-react";
import { Modal } from "@/components/admin/modal";

const STAGES = [
  { id: "new", label: "New Leads", color: "border-[#98f90d]/30 bg-[#98f90d]/[0.02]", text: "text-[#98f90d]" },
  { id: "contacted", label: "Contacted", color: "border-cyan-500/30 bg-cyan-500/[0.02]", text: "text-cyan-400" },
  { id: "qualified", label: "Qualified", color: "border-purple-500/30 bg-purple-500/[0.02]", text: "text-purple-400" },
  { id: "proposal_sent", label: "Proposal Sent", color: "border-indigo-500/30 bg-indigo-500/[0.02]", text: "text-indigo-400" },
  { id: "won", label: "Won (Clients)", color: "border-emerald-500/30 bg-emerald-500/[0.02]", text: "text-emerald-400" },
  { id: "lost", label: "Lost", color: "border-white/10 bg-white/[0.01]", text: "text-gray-400" },
];

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    email: "",
    companyName: "",
    service: "Software Development",
    estimatedValue: 20000,
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

  const handleStageChange = async (leadId, newStage) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, stage: newStage }),
      });
      if (res.ok) fetchLeads();
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

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewLeadForm({
          name: "",
          email: "",
          companyName: "",
          service: "Software Development",
          estimatedValue: 20000,
          stage: "new",
        });
        fetchLeads();
      }
    } catch {}
  };

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
            Visual Kanban management of enterprise prospects and deal conversions.
          </p>
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

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const totalVal = stageLeads.reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0);

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-3xl border ${stage.color} p-4 min-w-[210px] bg-[#0c0e15] shadow-xl`}
            >
              {/* Column Header */}
              <div className="mb-3.5 flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div>
                  <h3 className={`text-xs font-bold uppercase font-mono ${stage.text}`}>{stage.label}</h3>
                  <div className="text-[11px] text-gray-400 font-mono font-bold mt-0.5">
                    ${totalVal.toLocaleString()}
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
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="group rounded-2xl border border-white/10 bg-[#12141e] p-3.5 shadow-md hover:border-[#98f90d]/40 transition-all cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-[#98f90d] transition truncate">
                          {lead.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#98f90d] bg-[#98f90d]/10 border border-[#98f90d]/25 px-1.5 py-0.5 rounded-md">
                          ${(Number(lead.estimatedValue) || 0).toLocaleString()}
                        </span>
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
                  ))
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
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08]">
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Email</span>
                <p className="font-semibold text-white font-mono mt-0.5">{selectedLead.email}</p>
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
                <span className="text-gray-500 font-mono uppercase text-[10px]">Est. Value</span>
                <p className="font-bold text-[#98f90d] font-mono text-sm mt-0.5">
                  ${(Number(selectedLead.estimatedValue) || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span className="font-semibold text-gray-400">
                Current Stage: <span className="uppercase font-mono text-[#98f90d]">{selectedLead.stage}</span>
              </span>
              {selectedLead.stage !== "won" && (
                <button
                  type="button"
                  onClick={() => handleConvertToClient(selectedLead.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 font-bold text-black hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <UserCheck size={14} />
                  <span>Convert to Corporate Client</span>
                </button>
              )}
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
                  Estimated Value ($)
                </label>
                <input
                  type="number"
                  value={newLeadForm.estimatedValue}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
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

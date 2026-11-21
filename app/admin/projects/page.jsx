"use client";

import { useState, useEffect } from "react";
import { FolderKanban, Plus, Search, CheckSquare, Square, Trash2, Edit3, Calendar, DollarSign, Clock, Users, Sparkles } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

const PRIORITY_BADGES = {
  low: "bg-white/5 text-gray-400 border border-white/10",
  medium: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
  high: "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold",
  urgent: "bg-red-500/10 text-red-400 border border-red-500/30 font-bold",
};

const STATUS_BADGES = {
  planning: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  in_progress: "bg-[#98f90d]/10 text-[#98f90d] border border-[#98f90d]/30 font-bold shadow-[0_0_8px_rgba(152,249,13,0.2)]",
  on_hold: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold",
  cancelled: "bg-white/5 text-gray-400 border border-white/10",
};

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    clientName: "",
    category: "Software Development",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    deadline: "",
    budget: 35000,
    priority: "medium",
  });

  const fetchProjects = () => {
    setLoading(true);
    fetch(`/api/admin/projects?status=${statusFilter}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleToggleTask = async (projectId, taskId) => {
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_task", projectId, taskId }),
      });
      if (res.ok) {
        fetchProjects();
        if (selectedProject?.id === projectId) {
          const updatedTasks = selectedProject.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          setSelectedProject({ ...selectedProject, tasks: updatedTasks });
        }
      }
    } catch {}
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_task", projectId: selectedProject.id, taskTitle: newTaskTitle }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        fetchProjects();
      }
    } catch {}
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({
          title: "",
          clientName: "",
          category: "Software Development",
          description: "",
          startDate: new Date().toISOString().split("T")[0],
          deadline: "",
          budget: 35000,
          priority: "medium",
        });
        fetchProjects();
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/projects?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      if (selectedProject?.id === deleteTargetId) setSelectedProject(null);
      fetchProjects();
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
              Supabase Live Table: projects
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Client Projects &amp; Sprints
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track enterprise software development, sprint milestones, tasks, and client delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#98f90d] px-4 py-2.5 text-xs font-black tracking-wider uppercase text-[#050505] hover:bg-[#86e00b] transition shadow-[0_0_15px_rgba(152,249,13,0.3)]"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute inset-y-0 left-3.5 my-auto text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, client name, category..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-[#0c0e15] py-2.5 px-4 text-xs text-gray-300 focus:border-[#98f90d] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-gray-500">
            Loading projects from Supabase...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-gray-500">
            No projects found. Click &ldquo;New Project&rdquo; to initiate your first client build.
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between hover:border-[#98f90d]/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-base text-white group-hover:text-[#98f90d] transition">
                    {p.title}
                  </h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold capitalize ${STATUS_BADGES[p.status] || "bg-white/5 text-gray-400"}`}>
                    {p.status?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  Client: <span className="text-white font-medium">{p.clientName}</span> · <span className="text-gray-500">{p.category}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-400">Sprint Completion</span>
                    <span className="font-bold text-[#98f90d]">{p.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
                    <div
                      style={{ width: `${p.progress}%` }}
                      className="h-full rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]"
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-400 border-t border-white/[0.06] pt-3">
                  <div>
                    <span className="text-gray-600 uppercase text-[9px] block">Budget</span>
                    <span className="font-bold text-white">${(Number(p.budget) || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 uppercase text-[9px] block">Priority</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${PRIORITY_BADGES[p.priority] || "text-gray-400"}`}>
                      {p.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedProject(p)}
                  className="rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-1.5 text-xs font-bold text-gray-300 hover:bg-[#98f90d] hover:text-[#050505] transition-all"
                >
                  Manage Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(p.id)}
                  className="rounded-xl p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete project"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task & Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={Boolean(selectedProject)}
          onClose={() => setSelectedProject(null)}
          title={`Project Workspace: ${selectedProject.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs text-gray-300">
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08]">
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Client Partner</span>
                <p className="font-bold text-white mt-0.5">{selectedProject.clientName}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Sprint Status</span>
                <p className="font-bold text-[#98f90d] mt-0.5 uppercase font-mono">{selectedProject.status?.replace(/_/g, " ")}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Allocated Budget</span>
                <p className="font-bold text-white mt-0.5 font-mono">${(Number(selectedProject.budget) || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Task Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono uppercase text-[11px] font-bold text-gray-400">
                  Sprint Task Checklist ({selectedProject.tasks?.filter((t) => t.completed).length || 0} / {selectedProject.tasks?.length || 0})
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                  <p className="text-gray-500 italic py-4 text-center">No tasks defined for this sprint yet.</p>
                ) : (
                  selectedProject.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(selectedProject.id, task.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                        task.completed
                          ? "bg-white/[0.02] border-white/[0.06] text-gray-500 line-through"
                          : "bg-white/[0.04] border-white/10 text-white hover:border-[#98f90d]/40"
                      }`}
                    >
                      {task.completed ? (
                        <CheckSquare size={16} className="text-[#98f90d] shrink-0" />
                      ) : (
                        <Square size={16} className="text-gray-500 shrink-0" />
                      )}
                      <span className="text-xs font-medium">{task.title}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Task Input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new milestone or engineering task..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="rounded-xl bg-[#98f90d] px-4 py-2 text-xs font-bold text-[#050505] hover:bg-[#86e00b] transition"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Client Project &amp; Sprint"
        >
          <form onSubmit={handleCreateProject} className="space-y-4 text-xs text-gray-300">
            <div>
              <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="e.g. Cleancity Automated Portal"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Client Organization *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.clientName}
                  onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })}
                  placeholder="e.g. Apex Health"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Category Focus
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0e15] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="AI & ML Solutions">AI & ML Solutions</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Contract Budget ($)
                </label>
                <input
                  type="number"
                  value={createForm.budget}
                  onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0e15] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
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
                Create Project
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks and milestones will be removed."
        confirmText="Delete Project"
        isDanger={true}
      />
    </div>
  );
}

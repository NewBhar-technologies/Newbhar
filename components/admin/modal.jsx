"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidth} transform overflow-hidden rounded-3xl bg-[#0f111a] p-6 text-left shadow-2xl transition-all border border-white/10 max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto py-4 text-xs text-gray-300 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDanger = false,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-full px-5 py-2 text-xs font-bold transition shadow-sm ${
              isDanger
                ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                : "bg-[#98f90d] hover:bg-[#86e00b] text-[#050505] shadow-[0_0_15px_rgba(152,249,13,0.35)]"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

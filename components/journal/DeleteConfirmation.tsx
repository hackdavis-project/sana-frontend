"use client";
import { AlertCircle } from "lucide-react";
import type { JournalEntry } from "@/lib/types";

interface DeleteConfirmationProps {
  isOpen: boolean;
  entry: JournalEntry | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmation({
  isOpen,
  entry,
  onCancel,
  onConfirm,
}: DeleteConfirmationProps) {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border border-amber-100">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-900">Delete Entry</h3>
        </div>
        <p className="mb-6 text-amber-800">
          Are you sure you want to delete "{entry.title}"? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border border-amber-200 hover:bg-amber-50 transition-colors text-amber-800"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";
import { ChevronLeft } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import { EntryItem } from "./EntryItem";
import { useState, useEffect } from "react";

interface JournalSidebarProps {
  isOpen: boolean;
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  onClose: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry, e: React.MouseEvent) => void;
}

export function JournalSidebar({
  isOpen,
  entries,
  currentEntry,
  onClose,
  onSelectEntry,
  onDeleteEntry,
}: JournalSidebarProps) {
  // Track entries with their animation states
  const [animatedEntries, setAnimatedEntries] =
    useState<(JournalEntry & { isRemoving?: boolean })[]>(entries);

  // Update animated entries when the entries prop changes
  useEffect(() => {
    // Find entries that were in animatedEntries but are no longer in entries (were deleted)
    const removedEntryIds = animatedEntries
      .filter(
        (animEntry) =>
          !entries.some((entry) => entry.id === animEntry.id) &&
          !animEntry.isRemoving
      )
      .map((entry) => entry.id);

    if (removedEntryIds.length > 0) {
      // Mark these entries for removal animation
      setAnimatedEntries((prev) =>
        prev.map((entry) =>
          removedEntryIds.includes(entry.id)
            ? { ...entry, isRemoving: true }
            : entry
        )
      );
    } else {
      // Normal update (for new entries or when no entries were removed)
      const newEntries = entries.filter(
        (entry) =>
          !animatedEntries.some((animEntry) => animEntry.id === entry.id)
      );

      setAnimatedEntries([
        ...newEntries,
        ...animatedEntries.filter(
          (entry) => entries.some((e) => e.id === entry.id) || entry.isRemoving
        ),
      ]);
    }
  }, [entries]);

  // Handle animation end and remove entry completely
  const handleAnimationEnd = (entryId: string) => {
    setAnimatedEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-amber-900">
            Journal Entries
          </h2>
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5 text-amber-800" />
          </button>
        </div>

        <div className="p-2 overflow-y-auto max-h-[calc(100vh-64px)]">
          {animatedEntries.map((entry) => (
            <div
              key={entry.id}
              className={`transition-all duration-300 ease-in-out ${
                entry.isRemoving
                  ? "opacity-0 transform -translate-x-full"
                  : "opacity-100 transform translate-x-0"
              }`}
              onTransitionEnd={() =>
                entry.isRemoving && handleAnimationEnd(entry.id)
              }
            >
              <EntryItem
                entry={entry}
                isActive={currentEntry?.id === entry.id}
                onSelect={onSelectEntry}
                onDelete={onDeleteEntry}
              />
            </div>
          ))}

          {animatedEntries.length === 0 && (
            <div className="text-center p-4 text-gray-500">No entries yet</div>
          )}
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}
    </>
  );
}

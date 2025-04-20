"use client"

import type React from "react"
import { ChevronLeft } from "lucide-react"
import type { JournalEntry } from "@/lib/types"
import { EntryItem } from "./EntryItem"

interface JournalSidebarProps {
  isOpen: boolean
  entries: JournalEntry[]
  currentEntry: JournalEntry | null
  onClose: () => void
  onSelectEntry: (entry: JournalEntry) => void
  onDeleteEntry: (entry: JournalEntry, e: React.MouseEvent) => void
}

export function JournalSidebar({
  isOpen,
  entries,
  currentEntry,
  onClose,
  onSelectEntry,
  onDeleteEntry,
}: JournalSidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-amber-900">Journal Entries</h2>
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onClose}>
            <ChevronLeft className="w-5 h-5 text-amber-800" />
          </button>
        </div>

        <div className="p-2 overflow-y-auto max-h-[calc(100vh-64px)]">
          {entries.map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              isActive={currentEntry?.id === entry.id}
              onSelect={onSelectEntry}
              onDelete={onDeleteEntry}
            />
          ))}

          {entries.length === 0 && <div className="text-center p-4 text-gray-500">No entries yet</div>}
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}
    </>
  )
}

"use client"

import type React from "react"
import { Trash2 } from "lucide-react"
import type { JournalEntry } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface EntryItemProps {
  entry: JournalEntry
  isActive: boolean
  onSelect: (entry: JournalEntry) => void
  onDelete: (entry: JournalEntry, e: React.MouseEvent) => void
}

export function EntryItem({ entry, isActive, onSelect, onDelete }: EntryItemProps) {
  return (
    <div
      className={`relative flex items-center w-full rounded-lg mb-2 ${
        isActive ? "bg-amber-50 border border-amber-200" : "border border-transparent"
      }`}
    >
      <button
        className="flex-1 text-left p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-lg"
        onClick={() => onSelect(entry)}
      >
        <div className="text-xs text-amber-700 mb-1">{formatDate(entry.date)}</div>
        <div className="text-sm font-medium text-amber-900 mb-1">{entry.title}</div>
        <div className="text-sm text-gray-800 line-clamp-2">{entry.preview || "Empty entry"}</div>
      </button>
      <button
        className="p-3 mr-1 rounded-full active:bg-red-100"
        onClick={(e) => onDelete(entry, e)}
        aria-label="Delete entry"
      >
        <Trash2 className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  )
}

"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Menu } from "lucide-react"
import type { JournalEntry } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { PlaybackControls } from "./PlaybackControls"

interface JournalEditorProps {
  currentEntry: JournalEntry | null
  isSaved: boolean
  isPlaying: boolean
  isPlayButtonLoading: boolean
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onMenuOpen: () => void
  onPlayClick: () => void
}

export function JournalEditor({
  currentEntry,
  isSaved,
  isPlaying,
  isPlayButtonLoading,
  onTitleChange,
  onContentChange,
  onMenuOpen,
  onPlayClick,
}: JournalEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the textarea on mount and when currentEntry changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [currentEntry])

  if (!currentEntry) return null

  return (
    <div className="absolute inset-0 bg-gray-100 pb-20 flex flex-col">
      <input
        type="text"
        value={currentEntry.title}
        onChange={onTitleChange}
        className="w-full px-4 pt-16 pb-2 focus:outline-none text-xl font-semibold text-amber-900 font-montserrat bg-gray-100"
        placeholder="Entry Title"
      />
      <div className="w-full px-4 mb-2 flex items-center justify-between">
        <div className="flex-1 flex items-center">
          {/* Dotted line */}
          <div className="flex-1 border-t border-amber-300 border-dotted opacity-70"></div>
        </div>

        {/* Playback controls */}
        <PlaybackControls
          isSaved={isSaved}
          isPlaying={isPlaying}
          isPlayButtonLoading={isPlayButtonLoading}
          onPlayClick={onPlayClick}
        />
      </div>
      <textarea
        ref={textareaRef}
        value={currentEntry.content}
        onChange={onContentChange}
        className="w-full h-full p-4 resize-none focus:outline-none text-base text-amber-900 font-montserrat bg-gray-100"
        placeholder="Start writing your journal entry..."
      />

      {/* Menu button - positioned at the top left */}
      <button className="absolute top-4 left-4 bg-white/70 p-2 rounded-full shadow-sm" onClick={onMenuOpen}>
        <Menu className="w-5 h-5 text-amber-800" />
      </button>

      {/* Current entry date - positioned at the top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/70 px-3 py-1 rounded-full text-sm text-amber-800">
        {formatDate(currentEntry.date)}
      </div>
    </div>
  )
}

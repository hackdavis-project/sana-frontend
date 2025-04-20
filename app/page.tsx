"use client"

import type React from "react"

import { useState } from "react"
import { Montserrat } from "next/font/google"
import type { JournalEntry } from "@/lib/types"
import { useJournalEntries } from "@/hooks/useJournalEntries"
import { usePlayback } from "@/hooks/usePlayback"
import { JournalEditor } from "@/components/journal/JournalEditor"
import { JournalSidebar } from "@/components/journal/JournalSidebar"
import { DeleteConfirmation } from "@/components/journal/DeleteConfirmation"
import { ActionMenu } from "@/components/journal/ActionMenu"
import { BottomNavigation } from "@/components/journal/BottomNavigation"

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
})

export default function WritingApp() {
  // Use our custom hook for journal entries
  const {
    entries,
    currentEntry,
    isSaved,
    playButtonReady,
    createNewEntry,
    selectEntry,
    updateEntryTitle,
    updateEntryContent,
    deleteEntry,
  } = useJournalEntries()

  // Use our custom hook for playback
  const { isPlaying, isPlayButtonLoading, handlePlayClick, setIsPlaying } = usePlayback(isSaved, playButtonReady)

  // UI state
  const [activeTab, setActiveTab] = useState("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isActionMenuExpanded, setIsActionMenuExpanded] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEntryTitle(e.target.value)
  }

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateEntryContent(e.target.value)
  }

  // Handle entry selection
  const handleSelectEntry = (entry: JournalEntry) => {
    selectEntry(entry)
    setIsMenuOpen(false)
    setIsPlaying(false)
  }

  // Function to initiate the delete process
  const initiateDelete = (entry: JournalEntry, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the entry when clicking delete
    setEntryToDelete(entry)
    setShowDeleteConfirmation(true)
  }

  // Function to confirm and execute deletion
  const confirmDelete = () => {
    if (!entryToDelete) return
    deleteEntry(entryToDelete.id)
    setShowDeleteConfirmation(false)
    setEntryToDelete(null)
  }

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirmation(false)
    setEntryToDelete(null)
  }

  // Toggle action menu
  const toggleActionMenu = () => {
    setIsActionMenuExpanded(!isActionMenuExpanded)
  }

  return (
    <main className={`flex flex-col h-[100svh] bg-gray-100 relative ${montserrat.className}`}>
      {/* Full screen text area */}
      <div className="flex-1 relative">
        <JournalEditor
          currentEntry={currentEntry}
          isSaved={isSaved}
          isPlaying={isPlaying}
          isPlayButtonLoading={isPlayButtonLoading}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onMenuOpen={() => setIsMenuOpen(true)}
          onPlayClick={handlePlayClick}
        />

        {/* Action Menu (Plus button) */}
        <ActionMenu isExpanded={isActionMenuExpanded} onToggle={toggleActionMenu} />
      </div>

      {/* Sidebar */}
      <JournalSidebar
        isOpen={isMenuOpen}
        entries={entries}
        currentEntry={currentEntry}
        onClose={() => setIsMenuOpen(false)}
        onSelectEntry={handleSelectEntry}
        onDeleteEntry={initiateDelete}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        entry={entryToDelete}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Bottom navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} onNewEntry={createNewEntry} />
    </main>
  )
}

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import type { JournalEntry } from "@/lib/types";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { usePlayback } from "@/hooks/usePlayback";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalSidebar } from "@/components/journal/JournalSidebar";
import { DeleteConfirmation } from "@/components/journal/DeleteConfirmation";
import { ActionMenu, ButtonPosition } from "@/components/journal/ActionMenu";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { apiClient } from "@/app/api/client";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

export default function WritingApp() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

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
  } = useJournalEntries();

  // Use our custom hook for playback
  const { isPlaying, isPlayButtonLoading, handlePlayClick, setIsPlaying } =
    usePlayback(isSaved, playButtonReady);

  // Handle play button click wrapper
  const handlePlay = () => {
    if (currentEntry?.content) {
      handlePlayClick(currentEntry.content);
    } else {
      handlePlayClick();
    }
  };

  // UI state
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionMenuExpanded, setIsActionMenuExpanded] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEntryTitle(e.target.value);
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateEntryContent(e.target.value);
  };

  // Handle entry selection
  const handleSelectEntry = (entry: JournalEntry) => {
    selectEntry(entry);
    setIsMenuOpen(false);
    setIsPlaying(false);
  };

  // Function to initiate the delete process
  const initiateDelete = (entry: JournalEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the entry when clicking delete
    setEntryToDelete(entry);
    setShowDeleteConfirmation(true);
  };

  // Function to confirm and execute deletion
  const confirmDelete = () => {
    if (!entryToDelete) return;

    // First close the confirmation dialog
    setShowDeleteConfirmation(false);

    // Small delay to allow animation to complete before actual deletion
    setTimeout(() => {
      deleteEntry(entryToDelete.id);
      apiClient.deleteJournalEntry(entryToDelete.id);
      setEntryToDelete(null);
    }, 350); // Slightly longer than animation duration to ensure it completes
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setEntryToDelete(null);
  };

  // Toggle action menu
  const toggleActionMenu = () => {
    setIsActionMenuExpanded(!isActionMenuExpanded);
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    if (tab === "calendar") {
      router.push("/community");
    } else if (tab !== "home") {
      router.push(`/${tab}`);
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 relative ${montserrat.className}`}
    >
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
          onPlayClick={handlePlay}
        />

        {/* Action Menu (Plus button) */}
        <ActionMenu
          isExpanded={isActionMenuExpanded}
          onToggle={toggleActionMenu}
          position={ButtonPosition.RIGHT}
          onTranscriptionComplete={(transcribedText) => {
            if (!transcribedText || transcribedText.trim().length === 0) {
              alert("Transcription was empty. Please try again.");
              return;
            }
            // Use the journal store logic to create and select the new entry
            const newEntry = createNewEntry(transcribedText);
            selectEntry(newEntry);
          }}
        />
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
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewEntry={createNewEntry}
      />
    </main>
  );
}

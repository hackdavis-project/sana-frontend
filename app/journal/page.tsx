"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalSidebar } from "@/components/journal/JournalSidebar";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { ActionMenu } from "@/components/journal/ActionMenu";
import { DeleteConfirmation } from "@/components/journal/DeleteConfirmation";
import { AnimatePresence, motion } from "framer-motion";
import type { JournalEntry as LibJournalEntry, MoodRating } from "@/lib/types";
import { getMockEntries } from "@/app/utils/mockData";
import { useSttStore } from "@/app/store/sttStore";
import { useJournalEntries } from "@/hooks/useJournalEntries";

// For local development without backend integration
// Our simplified version of JournalEntry for the demo
interface JournalEntrySimple {
  id: string;
  title: string;
  content: string;
  date: string;
}

// Adapter functions to convert between types
function adaptToLibEntry(entry: any): LibJournalEntry {
  // Generate preview dynamically
  const preview =
    entry.content.substring(0, 100) + (entry.content.length > 100 ? "..." : "");
  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    date: new Date(entry.date), // Convert date string to Date object
    preview: preview,
  };
}

export default function JournalPage() {
  // Use the custom hook for journal entries
  const {
    entries,
    currentEntry,
    isSaved,
    playButtonReady,
    isLoading,
    createNewEntry,
    addEntry,
    selectEntry,
    updateEntryTitle,
    updateEntryContent,
    deleteEntry,
    setPlayButtonReady,
  } = useJournalEntries();

  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActionMenuExpanded, setIsActionMenuExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayButtonLoading, setIsPlayButtonLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Create adapted versions for components expecting LibJournalEntry
  const adaptedEntries: LibJournalEntry[] = entries.map(adaptToLibEntry);
  const adaptedCurrentEntry: LibJournalEntry | null = currentEntry
    ? adaptToLibEntry(currentEntry)
    : null;

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Toggle action menu
  const toggleActionMenu = useCallback(() => {
    console.log("Toggling action menu, current state:", isActionMenuExpanded);
    setIsActionMenuExpanded((prev) => !prev);
  }, [isActionMenuExpanded]);

  // Create a new entry using the store function
  const createNewEntry = useCallback(() => {
    const newEntry = createEntry();
    setCurrentEntry(newEntry);
    setIsSaved(false);
  }, [createEntry, setCurrentEntry]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Select an entry - Assume the component (JournalSidebar) provides LibJournalEntry
  const selectEntry = useCallback(
    (entry: LibJournalEntry) => {
      // Expect LibJournalEntry from component
      // Find the full entry from the store based on ID
      const storeEntry = entries.find((e) => e.id === entry.id);
      if (storeEntry) {
        setCurrentEntry(storeEntry);
      }
      setIsSidebarOpen(false);
    },
    [entries, setCurrentEntry]
  );

  // Handle delete entry - Assume the component provides LibJournalEntry
  const handleDeleteEntry = useCallback(
    (entry: LibJournalEntry, e: React.MouseEvent) => {
      // Expect LibJournalEntry from component
      e.stopPropagation();
      // Find the full entry from the store based on ID
      const storeEntry = entries.find((e) => e.id === entry.id);
      if (storeEntry) {
        setCurrentEntry(storeEntry); // Set the store entry as current for deletion
      }
      setShowDeleteConfirmation(true);
    },
    [entries, setCurrentEntry]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!currentEntry) return;

      const updatedEntry: JournalEntryType = {
        ...currentEntry,
        title: e.target.value,
        isSaved: false,
        lastModified: new Date().toISOString(),
      };
      setCurrentEntry(updatedEntry);

      // Update entry in the entries list
      const updatedEntries = entries.map((entry: JournalEntryType) =>
        entry.id === currentEntry.id ? updatedEntry : entry
      );
      setEntries(updatedEntries);

      setIsSaved(false);
    },
    [currentEntry, setCurrentEntry, setEntries]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!currentEntry) return;

      const updatedEntry: JournalEntryType = {
        ...currentEntry,
        content: e.target.value,
        isSaved: false,
        lastModified: new Date().toISOString(),
      };
      setCurrentEntry(updatedEntry);

      // Update entry in the entries list
      const updatedEntries = entries.map((entry: JournalEntryType) =>
        entry.id === currentEntry.id ? updatedEntry : entry
      );
      setEntries(updatedEntries);

      setIsSaved(false);
    },
    [currentEntry, setCurrentEntry, setEntries]
  );

  // Play the current entry (Refactored from useEffect)
  const handlePlayClick = useCallback(() => {
    if (!currentEntry) return;

    setIsPlaying(true);
    setIsPlayButtonLoading(true);

    // Simulate audio processing delay
    setTimeout(() => {
      setIsPlayButtonLoading(false);
      // In a real app, this would trigger audio playback
      console.log("Playing entry:", currentEntry);
      // Add actual playback logic here if applicable
    }, 1000);
  }, [isPlaying]); // Dependencies: isPlaying state

  // Stop playback
  const handleStopPlayback = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Handle mood change
  const handleMoodChange = useCallback((mood: MoodRating) => {
    if (!currentEntry) return;
    
    // Create updated entry with new mood
    const updatedEntry = {
      ...currentEntry,
      mood: mood,
    };
    
    // Update current entry with the new mood
    setCurrentEntry(updatedEntry);
    
    // Update entry in the entries list
    const updatedEntries = entries.map(entry => 
      entry.id === currentEntry.id ? updatedEntry : entry
    );
    setEntries(updatedEntries);
    
    // Mark as unsaved
    setIsSaved(false);
    
    console.log("Mood updated:", mood);
  }, [currentEntry, entries]);

  // Save the current entry
  const handleSave = useCallback(() => {
    if (currentEntry) {
      saveEntry(currentEntry.id); // Use saveEntry from store
      setIsSaved(true); // Update local state too
    }
  }, [currentEntry, saveEntry]);

  // Delete confirmation
  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  // Confirm deletion
  const confirmDelete = useCallback(() => {
    if (currentEntry) {
      deleteEntry(currentEntry.id);
    }
    setShowDeleteConfirmation(false);
  }, [currentEntry, deleteEntry]);

  // Auto-save entries periodically
  useEffect(() => {
    if (isSaved) return;

    const saveTimer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(saveTimer);
  }, [isSaved, handleSave, currentEntry]);

  // Subscribe to STT transcription results
  const transcriptionResult = useSttStore((state) => state.transcriptionResult);
  const setTranscriptionResult = useSttStore((state) => state.setTranscriptionResult);

  // Handler for ActionMenu transcription completion
  const handleTranscriptionComplete = useCallback((transcribedText: string) => {
    if (!transcribedText || transcribedText.trim().length === 0) {
      alert("Transcription was empty. Please try again.");
      return;
    }
    // Use the journal store directly to create a new entry
    useJournalStore.getState().createEntry(transcribedText);
  }, []);
  // Define the handler for when transcription is complete
  const handleTranscriptionComplete = useCallback(
    (text: string) => {
      console.log("handleTranscriptionComplete received text:", text);
      if (text) {
        createVoiceNote(text);
        console.log("Called createVoiceNote function.");
      } else {
        console.warn("Transcription complete handler called with empty text.");
      }
    },
    [createVoiceNote]
  );

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* Main content */}
      <div className="h-full flex flex-col">
        {/* Journal editor */}
        {adaptedCurrentEntry && (
          <JournalEditor
            currentEntry={adaptedCurrentEntry}
            isSaved={isSaved}
            isPlaying={isPlaying}
            isPlayButtonLoading={isPlayButtonLoading}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            onMenuOpen={toggleSidebar}
            onPlayClick={handlePlayClick}
            onDelete={handleDeleteClick}
            onStopPlayback={handleStopPlayback}
            onCreateNote={createVoiceNote}
            onMoodChange={handleMoodChange}
          />
        )}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="absolute top-0 left-0 h-full w-5/6 max-w-md z-20"
          >
            <JournalSidebar
              isOpen={isSidebarOpen}
              entries={adaptedEntries}
              currentEntry={adaptedCurrentEntry}
              onClose={toggleSidebar}
              onSelectEntry={selectEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewEntry={createNewEntry}
      />

      {/* Action Menu - Microphone/Recording Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <ActionMenu
          isExpanded={isActionMenuExpanded}
          onToggle={toggleActionMenu}
          onTranscriptionComplete={handleTranscriptionComplete}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && adaptedCurrentEntry && (
          <DeleteConfirmation
            isOpen={showDeleteConfirmation}
            entry={adaptedCurrentEntry}
            onConfirm={confirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

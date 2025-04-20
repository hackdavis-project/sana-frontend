"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { JournalEntry } from "@/lib/types";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { usePlayback } from "@/hooks/usePlayback";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalSidebar } from "@/components/journal/JournalSidebar";
import { DeleteConfirmation } from "@/components/journal/DeleteConfirmation";
import { ActionMenu, ButtonPosition } from "@/components/journal/ActionMenu";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { VoiceCalibrationModal } from "@/components/voice/VoiceCalibrationModal";
import { apiClient, CurrentUser } from "@/app/api/client";



export default function WritingApp() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  // Use our custom hook for journal entries
  const {
    entries,
    currentEntry,
    isSaved,
    playButtonReady,
    createNewEntry,
    addEntry,
    selectEntry,
    updateEntryTitle,
    updateEntryContent,
    deleteEntry,
  } = useJournalEntries();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response.success) {
          setUser(response.data);
          console.log('User info fetched:', response.data);
          
          // Check if voice calibration is needed
          if (!response.data.voice_id) {
            setShowVoiceModal(true);
          }
        } else {
          console.error('Failed to fetch user info:', response.message);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

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
  
  // Handle voice calibration completion
  const handleVoiceCalibrated = async (voiceId: string) => {
    // Update user state locally
    if (user) {
      setUser({
        ...user,
        voice_id: voiceId
      });
    }
    setShowVoiceModal(false);
  };
  
  // Handle skipping voice calibration
  const handleSkipVoiceCalibration = () => {
    // Store the user's preference in localStorage
    localStorage.setItem('skippedVoiceCalibration', 'true');
    setShowVoiceModal(false);
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
    if (tab === "community") {
      router.push("/community");
    } else if (tab !== "home") {
      router.push(`/${tab}`);
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 relative`}
    >
      {/* Voice Calibration Modal */}
      <VoiceCalibrationModal 
        isOpen={showVoiceModal}
        onClose={handleSkipVoiceCalibration}
        onVoiceCalibrated={handleVoiceCalibrated}
      />

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
          onTranscriptionComplete={async (transcribedText) => {
            if (!transcribedText || transcribedText.trim().length === 0) {
              // Optionally, show a toast or non-blocking notification here
              return;
            }
            // Add a new entry with the transcript content and select it
            const newEntry = await addEntry({
              title: "Voice Note",
              content: transcribedText,
              moodValue: 3,
            });
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

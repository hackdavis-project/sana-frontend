"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Menu, Smile } from "lucide-react";
import type { JournalEntry, MoodRating } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PlaybackControls } from "./PlaybackControls";
import { MoodModal } from "./MoodModal";
import { motion, AnimatePresence } from "framer-motion";
// Import Wave component from react-wavify
import Wave from "react-wavify";

interface JournalEditorProps {
  currentEntry: JournalEntry | null;
  isSaved: boolean;
  isPlaying: boolean;
  isPlayButtonLoading: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMenuOpen: () => void;
  onPlayClick: () => void;
  onDelete?: () => void;
  onStopPlayback?: () => void;
  onCreateNote?: (transcribedText: string) => void; // Keep this prop for future use if needed
  onMoodChange?: (mood: MoodRating) => void; // Prop for mood changes
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
  onDelete,
  onStopPlayback,
  onCreateNote,
  onMoodChange,
}: JournalEditorProps) {
  // Logging for debugging: log when currentEntry changes
  useEffect(() => {
    console.log("JournalEditor received currentEntry:", currentEntry);
  }, [currentEntry]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previousEntry, setPreviousEntry] = useState<JournalEntry | null>(null);
  const [showRipple, setShowRipple] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [controlsDisabled, setControlsDisabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // Auto-focus the textarea on mount and when currentEntry changes
  useEffect(() => {
    // Only focus textarea when a completely new entry is created
    // We check isNewEntry to ensure we don't focus on every title/content change
    if (textareaRef.current && isNewEntry) {
      textareaRef.current.focus();
    }
  }, [isNewEntry]);

  // First load focus
  useEffect(() => {
    // Handle initial focus on first component mount
    if (textareaRef.current && !previousEntry && currentEntry) {
      textareaRef.current.focus();
    }
  }, []);

  // Detect when a new entry is created
  useEffect(() => {
    if (!previousEntry && currentEntry) {
      // First load of the component
      setPreviousEntry(currentEntry);
      return;
    }

    if (previousEntry && currentEntry && previousEntry.id !== currentEntry.id) {
      // New entry detected
      setIsNewEntry(true);
      setShowRipple(true);
      setControlsDisabled(true);

      // Reset animation state and stop sound playback
      setWaveKey((prevKey) => prevKey + 1);
      if (isPlaying && onStopPlayback) {
        onStopPlayback();
      }

      // Hide ripple after animation completes
      const rippleTimer = setTimeout(() => {
        setShowRipple(false);
      }, 800);

      // Re-enable controls after a brief period
      const controlsTimer = setTimeout(() => {
        setControlsDisabled(false);
      }, 1500);

      return () => {
        clearTimeout(rippleTimer);
        clearTimeout(controlsTimer);
      };
    }

    // Update previous entry reference
    setPreviousEntry(currentEntry);
  }, [currentEntry, previousEntry, isPlaying, onStopPlayback]);

  // Reset new entry state after animation
  useEffect(() => {
    if (isNewEntry) {
      const timer = setTimeout(() => {
        setIsNewEntry(false);
      }, 1000); // Increased timeout to ensure animations complete

      return () => clearTimeout(timer);
    }
  }, [isNewEntry]);

  const handleDelete = () => {
    if (!onDelete) return;

    setIsDeleting(true);
    // Allow animation to complete before actual deletion
    setTimeout(() => {
      onDelete();
      setIsDeleting(false);
    }, 300);
  };

  if (!currentEntry) return null;

  return (
    <div className="absolute inset-0 bg-gray-100 pb-20 flex flex-col overflow-hidden">
      {/* Ripple effect when new note is created */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            className="absolute z-20 pointer-events-none"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(237,201,105,0.4) 0%, rgba(237,201,105,0) 70%)",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentEntry.id}
          className="w-full flex flex-col flex-1 overflow-hidden min-h-0"
          initial={isNewEntry ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={
            isDeleting ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: -20 }
          }
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            value={currentEntry.title}
            onChange={onTitleChange}
            className="w-full px-4 pt-16 pb-2 focus:outline-none text-xl font-semibold text-amber-900 font-montserrat bg-gray-100"
            placeholder="Entry Title"
          />
          <div className="w-full px-4 my-4 flex items-center justify-between">
            <div className="flex-1 flex items-center h-12">
              {/* Wave animation or dotted line depending on playback state */}
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key={`waves-${waveKey}`}
                    className="flex-1 h-8 overflow-hidden rounded-md bg-black/5 relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Multiple waves with different parameters for a more complex sound wave look */}
                    <motion.div
                      key={`wave1-${waveKey}`}
                      className="absolute inset-0 opacity-80"
                      initial={{ y: 40 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <Wave
                        fill="#f59e0b"
                        paused={false}
                        options={{
                          height: 8,
                          amplitude: 15,
                          speed: 0.2,
                          points: 7,
                        }}
                        className="w-full h-full"
                      />
                    </motion.div>
                    <motion.div
                      key={`wave2-${waveKey}`}
                      className="absolute inset-0 opacity-50"
                      initial={{ y: 40 }}
                      animate={{ y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                    >
                      <Wave
                        fill="#eab308"
                        paused={false}
                        options={{
                          height: 10,
                          amplitude: 8,
                          speed: 0.3,
                          points: 5,
                        }}
                        className="w-full h-full"
                      />
                    </motion.div>
                    {/* Third wave for more complexity */}
                    <motion.div
                      key={`wave3-${waveKey}`}
                      className="absolute inset-0 opacity-30"
                      initial={{ y: 40 }}
                      animate={{ y: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                    >
                      <Wave
                        fill="#fbbf24"
                        paused={false}
                        options={{
                          height: 5,
                          amplitude: 20,
                          speed: 0.15,
                          points: 4,
                        }}
                        className="w-full h-full"
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`dotted-line-${waveKey}`}
                    className="h-0 flex-1 border-t-4 border-dotted border-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {/* Mood button */}
              <button
                onClick={() => setIsMoodModalOpen(true)}
                className={`flex items-center gap-1 text-amber-600 hover:text-amber-800 text-sm font-medium p-1 rounded-full transition-colors duration-200 ${
                  controlsDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={controlsDisabled}
              >
                <Smile className="w-4 h-4" />
                {currentEntry?.mood ? (
                  <span>{currentEntry.mood.label}</span>
                ) : (
                  <span>Add Mood</span>
                )}
              </button>

              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className={`text-red-500 hover:text-red-700 text-sm font-medium p-1 rounded-full transition-colors duration-200 ${
                    isDeleting || controlsDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isDeleting || controlsDisabled}
                >
                  Delete
                </button>
              )}

              {/* Playback controls */}
              <PlaybackControls
                isSaved={isSaved && !controlsDisabled}
                isPlaying={isPlaying}
                isPlayButtonLoading={isPlayButtonLoading}
                onPlayClick={onPlayClick}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={currentEntry.content}
              onChange={onContentChange}
              className="w-full h-full p-4 resize-none focus:outline-none text-base text-amber-900 font-montserrat bg-gray-100 overflow-auto"
              placeholder="Start writing your journal entry..."
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Menu button - positioned at the top left */}
      <button
        className="absolute top-4 left-4 bg-white/70 p-2 rounded-full shadow-sm z-10"
        onClick={onMenuOpen}
      >
        <Menu className="w-5 h-5 text-amber-800" />
      </button>

      {/* Date container with flex for perfect centering */}
      <div className="absolute top-0 left-0 right-0 flex justify-center items-center h-14 pointer-events-none z-10">
        <motion.div
          className="px-3 py-1 rounded-full text-sm text-gray-500 bg-white/70 shadow-sm pointer-events-auto"
          key={`date-${currentEntry.id}`}
          initial={isNewEntry ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {formatDate(currentEntry.date)}
        </motion.div>
      </div>

      {/* Mood Modal */}
      <MoodModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSaveMood={(mood) => {
          if (onMoodChange) {
            onMoodChange(mood);
          }
          setIsMoodModalOpen(false);
        }}
        initialMood={currentEntry?.mood}
      />
    </div>
  );
}

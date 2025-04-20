"use client";

import { useState, useEffect, useCallback } from "react";
import type { JournalEntry } from "@/lib/types";
import { apiClient } from "@/app/api/client";
import { JournalEntry as ApiJournalEntry } from "@/app/api/client";

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [playButtonReady, setPlayButtonReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved entries from API on initial render
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getJournalEntries();
        if (response.success) {
          const apiEntries = response.data.map((entry: ApiJournalEntry) => ({
            id: entry.entry_id,
            date: new Date(entry.createdAt || Date.now()),
            title: entry.title || "Journal Entry",
            content: entry.note || "",
            preview: (entry.note || "").substring(0, 30) || "Empty entry",
            mood: entry.feelingRating
              ? {
                  date: new Date(entry.createdAt || Date.now()),
                  value: entry.feelingRating,
                }
              : undefined,
          }));

          setEntries(apiEntries);

          // Set the most recent entry as current
          if (apiEntries.length > 0) {
            setCurrentEntry(apiEntries[0]);
          } else {
            createNewEntry();
          }
        } else {
          console.error("Error fetching entries:", response.message);
          createNewEntry();
        }
      } catch (e) {
        console.error("Error fetching entries", e);
        createNewEntry();
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Create a new entry with default content
  const createNewEntry = useCallback(async () => {
    return addEntry({
      title: "New Entry",
      content: "",
      moodValue: 3,
    });
  }, []);

  // Add a new entry with custom content (for STT transcript, etc)
  const addEntry = useCallback(
    async ({ title, content, moodValue = 3 }: { title: string; content: string; moodValue?: number }) => {
      setIsSaved(false);
      setPlayButtonReady(false);
      const newEntry: JournalEntry = {
        id: Date.now().toString(), // Temporary ID
        date: new Date(),
        title: title || "Voice Note",
        content: content || "",
        preview: (content || "").substring(0, 30) || "Empty entry",
        mood: {
          date: new Date(),
          value: moodValue,
        },
      };
      setEntries((prev) => [newEntry, ...prev]);
      setCurrentEntry(newEntry);
      
      // Create the entry in the backend
      let createdEntry = newEntry;
      try {
        const response = await apiClient.createJournalEntry({
          content: newEntry.content,
          feelingRating: newEntry.mood?.value || 3,
        });
        
        if (response.success) {
          createdEntry = {
            ...newEntry,
            id: response.data.entry_id,
            date: new Date(),
          };
          
          // Update local state with the created entry
          setEntries((prev) => [createdEntry, ...prev.filter((entry) => entry.id !== newEntry.id)]);
          setCurrentEntry(createdEntry);
          
          // Immediately save the content to ensure it's persisted
          await apiClient.updateJournalEntry({
            entry_id: createdEntry.id,
            note: createdEntry.content,
            title: createdEntry.title,
          });
          
          // Mark as saved after successful update
          setIsSaved(true);
          console.log("New entry created and saved to backend:", createdEntry.id);
        }
      } catch (error) {
        console.error("Error creating or saving entry:", error);
      }
      
      return createdEntry;
    },
    []
  );

  // Select an existing entry
  const selectEntry = useCallback(async (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsSaved(true);
    setPlayButtonReady(false);

    try {
      // Get full entry details from API
      const response = await apiClient.getJournalEntry(entry.id);
      if (response.success) {
        const fullEntry = {
          ...entry,
          title: response.data.title || "Journal Entry",
          content: response.data.note || "",
          date: new Date(response.data.createdAt || Date.now()),
          feelingRating: response.data.feelingRating,
          preview: response.data.note
            ? response.data.note.substring(0, 30) || "Empty entry"
            : "Empty entry",
        };
        setCurrentEntry(fullEntry);
      }
    } catch (error) {
      console.error("Error fetching entry details:", error);
    }

    // Simulate processing time for the newly selected entry
    if (entry.content) {
      setTimeout(() => {
        setPlayButtonReady(true);
      }, 2000);
    }

    return entry;
  }, []);

  // Update entry title
  const updateEntryTitle = useCallback(
    (title: string) => {
      if (!currentEntry) return;

      setCurrentEntry({
        ...currentEntry,
        title,
      });
      setIsSaved(false);
      setPlayButtonReady(false);
    },
    [currentEntry]
  );

  // Update entry content
  const updateEntryContent = useCallback(
    (content: string) => {
      if (!currentEntry) return;

      setCurrentEntry({
        ...currentEntry,
        content,
      });
      setIsSaved(false);
      setPlayButtonReady(false);
    },
    [currentEntry]
  );

  // Delete an entry
  const deleteEntry = useCallback(
    async (entryId: string) => {
      try {
        const response = await apiClient.deleteJournalEntry(entryId);
        if (response.success) {
          const newEntries = entries.filter((entry) => entry.id !== entryId);
          setEntries(newEntries);

          // If the deleted entry was the current entry, select another one or create a new one
          if (currentEntry && currentEntry.id === entryId) {
            if (newEntries.length > 0) {
              setCurrentEntry(newEntries[0]);
            } else {
              createNewEntry();
            }
          }

          return newEntries;
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    },
    [entries, currentEntry, createNewEntry]
  );

  // Auto-save current entry
  useEffect(() => {
    if (!currentEntry || isSaved) return;

    const saveTimer = setTimeout(async () => {
      try {
        // Update entry in API
        const response = await apiClient.updateJournalEntry({
          entry_id: currentEntry.id,
          note: currentEntry.content,
          title: currentEntry.title,
        });

        if (response.success) {
          // Update local state
          setEntries((prev) =>
            prev.map((entry) =>
              entry.id === currentEntry.id
                ? {
                    ...entry,
                    title: currentEntry.title,
                    content: currentEntry.content,
                    preview:
                      currentEntry.content.substring(0, 30) || "Empty entry",
                  }
                : entry
            )
          );
          setIsSaved(true);

          // Start the timer for the play button to become ready
          setTimeout(() => {
            setPlayButtonReady(true);
          }, 2000);
        }
      } catch (error) {
        console.error("Error saving entry:", error);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [currentEntry, isSaved]);

  return {
    entries,
    currentEntry,
    isSaved,
    playButtonReady,
    isLoading,
    createNewEntry,
    addEntry, // <-- Exported for STT and custom note creation
    selectEntry,
    updateEntryTitle,
    updateEntryContent,
    deleteEntry,
    setPlayButtonReady,
  };
}

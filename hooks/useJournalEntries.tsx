"use client"

import { useState, useEffect, useCallback } from "react"
import type { JournalEntry } from "@/lib/types"

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [isSaved, setIsSaved] = useState(true)
  const [playButtonReady, setPlayButtonReady] = useState(false)

  // Load saved entries from localStorage on initial render
  useEffect(() => {
    const savedEntries = localStorage.getItem("journal-entries")

    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }))
        setEntries(parsedEntries)

        // Set the most recent entry as current
        if (parsedEntries.length > 0) {
          setCurrentEntry(parsedEntries[0])
        } else {
          createNewEntry()
        }
      } catch (e) {
        console.error("Error parsing saved entries", e)
        createNewEntry()
      }
    } else {
      createNewEntry()
    }
  }, [])

  // Create a new entry
  const createNewEntry = useCallback(() => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      title: "New Entry",
      content: "",
      preview: "New entry",
    }

    setEntries((prev) => [newEntry, ...prev])
    setCurrentEntry(newEntry)
    setIsSaved(false)
    setPlayButtonReady(false)

    return newEntry
  }, [])

  // Select an existing entry
  const selectEntry = useCallback((entry: JournalEntry) => {
    setCurrentEntry(entry)
    setIsSaved(true)
    setPlayButtonReady(false)

    // Simulate processing time for the newly selected entry
    if (entry.content) {
      setTimeout(() => {
        setPlayButtonReady(true)
      }, 2000)
    }

    return entry
  }, [])

  // Update entry title
  const updateEntryTitle = useCallback(
    (title: string) => {
      if (!currentEntry) return

      setCurrentEntry({
        ...currentEntry,
        title,
      })
      setIsSaved(false)
      setPlayButtonReady(false)
    },
    [currentEntry],
  )

  // Update entry content
  const updateEntryContent = useCallback(
    (content: string) => {
      if (!currentEntry) return

      setCurrentEntry({
        ...currentEntry,
        content,
      })
      setIsSaved(false)
      setPlayButtonReady(false)
    },
    [currentEntry],
  )

  // Delete an entry
  const deleteEntry = useCallback(
    (entryId: string) => {
      const newEntries = entries.filter((entry) => entry.id !== entryId)
      setEntries(newEntries)

      // If the deleted entry was the current entry, select another one or create a new one
      if (currentEntry && currentEntry.id === entryId) {
        if (newEntries.length > 0) {
          setCurrentEntry(newEntries[0])
        } else {
          createNewEntry()
        }
      }

      return newEntries
    },
    [entries, currentEntry, createNewEntry],
  )

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem("journal-entries", JSON.stringify(entries))
    }
  }, [entries])

  // Auto-save current entry
  useEffect(() => {
    if (!currentEntry) return

    const saveTimer = setTimeout(() => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === currentEntry.id
            ? {
                ...entry,
                title: currentEntry.title,
                content: currentEntry.content,
                preview: currentEntry.content.substring(0, 30) || "Empty entry",
              }
            : entry,
        ),
      )
      setIsSaved(true)

      // Start the timer for the play button to become ready
      // This simulates processing time after the entry is saved
      setTimeout(() => {
        setPlayButtonReady(true)
      }, 3000) // 3 seconds of "processing" time after saving
    }, 1000)

    return () => clearTimeout(saveTimer)
  }, [currentEntry])

  return {
    entries,
    currentEntry,
    isSaved,
    playButtonReady,
    createNewEntry,
    selectEntry,
    updateEntryTitle,
    updateEntryContent,
    deleteEntry,
    setPlayButtonReady,
  }
}

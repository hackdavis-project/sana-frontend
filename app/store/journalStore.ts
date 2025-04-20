"use client";

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

// Define the journal entry type
export interface JournalEntryType {
  id: string;
  title: string;
  content: string;
  date: string;
  isSaved: boolean;
  lastModified: string;
}

// Define the journal store state
interface JournalState {
  entries: JournalEntryType[];
  currentEntry: JournalEntryType | null;
  setEntries: (entries: JournalEntryType[]) => void;
  setCurrentEntry: (entry: JournalEntryType | null) => void;
  saveEntry: (id: string) => void;
  createEntry: (content?: string) => JournalEntryType;
  deleteEntry: (id: string) => void;
}

// Create the journal store
export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  currentEntry: null,
  
  // Set all entries
  setEntries: (entries) => set({ entries }),
  
  // Set current entry
  setCurrentEntry: (entry) => set({ currentEntry: entry }),
  
  // Save entry (mark as saved)
  saveEntry: (id) => set((state) => ({
    entries: state.entries.map(entry => 
      entry.id === id 
        ? { ...entry, isSaved: true, lastModified: new Date().toISOString() } 
        : entry
    ),
    currentEntry: state.currentEntry?.id === id 
      ? { ...state.currentEntry, isSaved: true, lastModified: new Date().toISOString() } 
      : state.currentEntry
  })),
  
  // Create a new entry
  createEntry: (content = "") => {
    const newEntry: JournalEntryType = {
      id: uuid(),
      title: "New Entry",
      content,
      date: new Date().toISOString(),
      isSaved: false,
      lastModified: new Date().toISOString()
    };
    
    set((state) => ({
      entries: [newEntry, ...state.entries],
      currentEntry: newEntry
    }));
    
    return newEntry;
  },
  
  // Delete an entry
  deleteEntry: (id) => set((state) => {
    const filteredEntries = state.entries.filter(entry => entry.id !== id);
    
    // If the current entry is the one being deleted, select another one
    let nextCurrentEntry = state.currentEntry;
    if (state.currentEntry?.id === id) {
      nextCurrentEntry = filteredEntries.length > 0 ? filteredEntries[0] : null;
    }
    
    return {
      entries: filteredEntries,
      currentEntry: nextCurrentEntry
    };
  })
})); 
import { create } from "zustand";

interface SttStore {
  transcriptionResult: string | null;
  setTranscriptionResult: (text: string | null) => void;
}

console.log("[sttStore.ts] Zustand STT store is being created");
export const useSttStore = create<SttStore>((set) => ({
  transcriptionResult: null,
  setTranscriptionResult: (result: string | null) => {
    console.log("[sttStore.ts] setTranscriptionResult called with:", result);
    set({ transcriptionResult: result });
  },
}));

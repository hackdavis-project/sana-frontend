"use client"
import { Headphones } from "lucide-react"
import { Ring } from "@uiball/loaders"

interface PlaybackControlsProps {
  isSaved: boolean
  isPlaying: boolean
  isPlayButtonLoading: boolean
  onPlayClick: () => void
}

export function PlaybackControls({ isSaved, isPlaying, isPlayButtonLoading, onPlayClick }: PlaybackControlsProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        className={`ml-2 p-3 rounded-full transition-all duration-300 ${
          !isSaved
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : isPlayButtonLoading
              ? "bg-amber-100 text-amber-400"
              : isPlaying
                ? "bg-amber-500 text-white"
                : "bg-amber-200 text-amber-800"
        }`}
        onClick={onPlayClick}
        disabled={!isSaved || isPlayButtonLoading}
        aria-label={
          !isSaved
            ? "Save entry to enable playback"
            : isPlayButtonLoading
              ? "Preparing playback"
              : isPlaying
                ? "Stop listening"
                : "Listen to journal entry"
        }
      >
        {!isSaved ? (
          <Headphones className="w-5 h-5" />
        ) : isPlayButtonLoading ? (
          <div className="flex items-center justify-center">
            <Ring size={20} color="#b45309" />
          </div>
        ) : (
          <Headphones className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}

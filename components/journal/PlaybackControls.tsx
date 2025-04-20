"use client";
import { Headphones, Disc3 } from "lucide-react";
import { Ring } from "@uiball/loaders";
import { twMerge } from "tailwind-merge";

interface PlaybackControlsProps {
  isSaved: boolean;
  isPlaying: boolean;
  isPlayButtonLoading: boolean;
  onPlayClick: () => void;
}

export function PlaybackControls({
  isSaved,
  isPlaying,
  isPlayButtonLoading,
  onPlayClick,
}: PlaybackControlsProps) {
  return (
    <button
      onClick={onPlayClick}
      disabled={!isSaved || isPlayButtonLoading}
      className={twMerge(
        "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 relative overflow-hidden shadow-md",
        !isSaved
          ? "bg-amber-500/50 text-white/70 cursor-not-allowed"
          : isPlaying
          ? "bg-gradient-to-br from-gray-900 to-black text-amber-500 scale-110 shadow-lg"
          : "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:scale-105"
      )}
      aria-label={isPlaying ? "Playing audio" : "Play audio"}
    >
      {/* Record grooves - only visible when playing */}
      <div
        className={twMerge(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
          isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="w-8 h-8 rounded-full border border-gray-600 opacity-60"></div>
        <div className="absolute w-6 h-6 rounded-full border border-gray-600 opacity-70"></div>
        <div className="absolute w-4 h-4 rounded-full border border-gray-600 opacity-80"></div>
        <div className="absolute w-2 h-2 rounded-full bg-amber-500"></div>
      </div>

      <div
        className={twMerge(
          "flex items-center justify-center z-10 transition-transform duration-300",
          isPlaying ? "animate-spin" : ""
        )}
        style={{ animationDuration: isPlaying ? "3s" : "0s" }}
      >
        {!isSaved ? (
          <Headphones className="w-5 h-5" />
        ) : isPlayButtonLoading ? (
          <Ring size={20} color="white" />
        ) : isPlaying ? (
          <Disc3 className="w-5 h-5" />
        ) : (
          <Headphones className="w-5 h-5" />
        )}
      </div>
    </button>
  );
}

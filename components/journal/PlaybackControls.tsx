"use client";
import { Headphones, Disc3 } from "lucide-react";
import { Ring } from "@uiball/loaders";

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
      className={`text-xs ${
        !isSaved ? "disabled" : isPlaying ? "playing" : "ready"
      }`}
    >
      {!isSaved ? (
        <Headphones />
      ) : isPlayButtonLoading ? (
        <Ring />
      ) : isPlaying ? (
        <Disc3 />
      ) : (
        <Headphones />
      )}
    </button>
  );
}

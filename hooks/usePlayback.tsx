"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/app/api/client";
import play from "audio-play";
// @ts-ignore
import audioContext from "audio-context";

export function usePlayback(isSaved: boolean, playButtonReady: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayButtonLoading, setIsPlayButtonLoading] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackInterval, setPlaybackInterval] =
    useState<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element on client-side
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio();

      // Add event listeners
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        if (playbackInterval) {
          clearInterval(playbackInterval);
          setPlaybackInterval(null);
        }
        setPlaybackTime(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle play button click
  const handlePlayClick = async (text?: string) => {
    if (!isSaved || !playButtonReady) return;

    if (isPlaying) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsPlaying(false);
      if (playbackInterval) {
        clearInterval(playbackInterval);
        setPlaybackInterval(null);
      }
      setPlaybackTime(0);
    } else {
      // Start playing if we have text
      if (text) {
        setIsPlayButtonLoading(true);

        try {
          // Get TTS audio from API
          const audioBlob = await apiClient.generateTTS(text);

          // Create object URL for the audio blob
          const audioUrl = URL.createObjectURL(audioBlob);

          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();

            setIsPlaying(true);

            // Set up interval to update playback time
            const interval = setInterval(() => {
              if (audioRef.current) {
                setPlaybackTime(Math.floor(audioRef.current.currentTime));
              }
            }, 1000);

            setPlaybackInterval(interval);
          }

          setIsPlayButtonLoading(false);
        } catch (error) {
          console.error("Error generating TTS:", error);
          setIsPlayButtonLoading(false);
        }
      }
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Cleanup playback interval on unmount
  useEffect(() => {
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [playbackInterval]);

  return {
    isPlaying,
    isPlayButtonLoading,
    playbackTime,
    formatTime,
    handlePlayClick,
    setIsPlaying,
    setIsPlayButtonLoading,
  };
}

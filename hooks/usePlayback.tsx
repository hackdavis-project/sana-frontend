"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/app/api/client";
import { KokoroTTS } from "kokoro-js";

const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";

var tts: KokoroTTS;

(async () => {
  tts = await KokoroTTS.from_pretrained(model_id, {
    dtype: "q8", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
    device: "wasm", // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
  });
})();

export function usePlayback(isSaved: boolean, playButtonReady: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayButtonLoading, setIsPlayButtonLoading] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackInterval, setPlaybackInterval] =
    useState<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Detect iOS device
  const isIOSRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if device is iOS
    if (typeof window !== "undefined") {
      isIOSRef.current =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;
    }

    // Create audio element on client-side
    if (typeof window !== "undefined" && !audioRef.current) {
      // Create the audio element
      audioRef.current = new Audio();

      // iOS requires these attributes for better compatibility
      if (isIOSRef.current) {
        audioRef.current.setAttribute("playsinline", "true");
        audioRef.current.setAttribute("webkit-playsinline", "true");
      }

      // Add event listeners
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        if (playbackInterval) {
          clearInterval(playbackInterval);
          setPlaybackInterval(null);
        }
        setPlaybackTime(0);
      });

      // Add error handling
      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setIsPlayButtonLoading(false);
        if (playbackInterval) {
          clearInterval(playbackInterval);
          setPlaybackInterval(null);
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // Remove event listeners to prevent memory leaks
        audioRef.current.removeEventListener("ended", () => {});
        audioRef.current.removeEventListener("error", () => {});
        audioRef.current = null;
      }

      // Clean up object URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
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
          const audio = await tts.generate(text, {
            // Use `tts.list_voices()` to list all available voices
            voice: "af_heart",
          });

          // Clean up previous URL if exists
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
          }

          // Create object URL for the audio blob
          const audioBlob = new Blob([audio.audio], { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          audioUrlRef.current = audioUrl;

          if (audioRef.current) {
            // Set the source
            audioRef.current.src = audioUrl;

            // iOS requires loading before play
            audioRef.current.load();

            // Use a promise to handle play() which returns a promise
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  // Playback started successfully
                  setIsPlaying(true);

                  // Set up interval to update playback time
                  const interval = setInterval(() => {
                    if (audioRef.current) {
                      setPlaybackTime(Math.floor(audioRef.current.currentTime));
                    }
                  }, 1000);

                  setPlaybackInterval(interval);
                })
                .catch((error) => {
                  // Auto-play was prevented or other error
                  console.error("Playback error:", error);

                  // For iOS, we might need to show a play button or message
                  if (isIOSRef.current) {
                    console.log("iOS detected - autoplay may be blocked");
                    // You could set a state here to show a manual play button
                  }

                  setIsPlayButtonLoading(false);
                });
            }
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

      // Clean up object URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
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

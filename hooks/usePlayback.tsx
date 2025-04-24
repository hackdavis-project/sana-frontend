"use client";

import { useState, useEffect, useRef } from "react";

export function usePlayback(isSaved: boolean, playButtonReady: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayButtonLoading, setIsPlayButtonLoading] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackInterval, setPlaybackInterval] =
    useState<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef<boolean>(false);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const currentTextRef = useRef<string | null>(null);
  const speakingAttemptRef = useRef<number>(0);
  const isPlaybackPausedRef = useRef<boolean>(false);
  const visibilityPausedRef = useRef<boolean>(false);

  // Detect iOS device
  const isIOSRef = useRef<boolean>(false);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        availableVoicesRef.current = voices;
        voicesLoadedRef.current = true;
        console.log("Voices loaded:", voices.length);
      }
    };

    loadVoices(); // Try loading immediately

    // Chrome needs this event to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Properly handle visibility changes for speech synthesis
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const handleVisibilityChange = () => {
      // Tab is now hidden
      if (document.hidden) {
        // If we're playing, mark as paused by visibility change and pause
        if (isPlaying && !isPlaybackPausedRef.current) {
          console.log("Tab hidden, marking speech as paused");
          visibilityPausedRef.current = true;

          // Don't call cancel() as that would trigger an "interrupted" error
          // Instead, just pause - we'll resume when visibility returns
          try {
            window.speechSynthesis.pause();
          } catch (e) {
            console.log("Error pausing speech:", e);
          }
        }
      }
      // Tab is now visible
      else {
        // If we were playing and paused due to visibility, resume
        if (visibilityPausedRef.current) {
          console.log("Tab visible, resuming speech");
          visibilityPausedRef.current = false;

          try {
            window.speechSynthesis.resume();

            // Check if resuming actually worked
            setTimeout(() => {
              // If speechSynthesis isn't speaking after resume or is still paused
              if (
                isPlaying &&
                (!window.speechSynthesis.speaking ||
                  window.speechSynthesis.paused) &&
                currentTextRef.current
              ) {
                console.log("Resume failed, restarting speech");

                // We need to restart completely rather than using cancel/speak again
                // which would trigger another "interrupted" error
                restartSpeechFromCurrentPosition();
              }
            }, 250); // Give it time to actually resume
          } catch (e) {
            console.log("Error resuming speech:", e);

            // If resume fails, try restarting
            if (currentTextRef.current && isPlaying) {
              restartSpeechFromCurrentPosition();
            }
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

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

      // Cancel any ongoing speech - do this last to prevent any issues
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Restart speech from current position
  const restartSpeechFromCurrentPosition = () => {
    if (!currentTextRef.current || !window.speechSynthesis) return;

    // Increment attempt counter to prevent infinite loops
    speakingAttemptRef.current += 1;
    if (speakingAttemptRef.current > 3) {
      console.warn("Too many speech restart attempts, giving up");
      cleanupSpeech();
      return;
    }

    // Must cancel before creating a new utterance - this will trigger an "interrupted"
    // error on the current utterance, but we're replacing it anyway
    window.speechSynthesis.cancel();

    // Small delay to ensure cancellation completes
    setTimeout(() => {
      if (currentTextRef.current) {
        // Create a new utterance with the same text
        createAndPlayUtterance(currentTextRef.current);
      }
    }, 150);
  };

  // Clean up speech resources
  const cleanupSpeech = () => {
    setIsPlaying(false);
    currentTextRef.current = null;
    speechSynthRef.current = null;
    isPlaybackPausedRef.current = false;
    visibilityPausedRef.current = false;

    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
    setPlaybackTime(0);
  };

  // Clean text for speech synthesis
  const cleanTextForSpeech = (text: string): string => {
    // Remove special characters that might cause issues
    return text.replace(/[^\w\s.,!?'-]/g, " ").trim();
  };

  // Create utterance and play it
  const createAndPlayUtterance = (text: string) => {
    if (!window.speechSynthesis) return;

    try {
      const cleanedText = cleanTextForSpeech(text);

      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      speechSynthRef.current = utterance;

      // Select a voice
      if (voicesLoadedRef.current && availableVoicesRef.current.length > 0) {
        // Try to find a female English voice
        const preferredVoice = availableVoicesRef.current.find(
          (voice) =>
            (voice.name.includes("female") || voice.name.includes("Female")) &&
            (voice.lang.includes("en-US") || voice.lang.includes("en-GB"))
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          utterance.lang = preferredVoice.lang;
        } else {
          // Fallback to any available voice
          utterance.voice = availableVoicesRef.current[0];
          utterance.lang = utterance.voice.lang;
        }
      }

      // Set rate and pitch
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Add events
      utterance.onstart = () => {
        console.log("Speech started");
        setIsPlaying(true);
        setIsPlayButtonLoading(false);

        // Set up interval to update playback time
        const interval = setInterval(() => {
          setPlaybackTime((prev) => prev + 1);
        }, 1000);

        setPlaybackInterval(interval);
      };

      utterance.onend = () => {
        console.log("Speech ended normally");
        // Reset attempt counter on successful completion
        speakingAttemptRef.current = 0;
        cleanupSpeech();
      };

      utterance.onpause = () => {
        console.log("Speech paused");
        // Only set if not paused by visibility change
        if (!visibilityPausedRef.current) {
          isPlaybackPausedRef.current = true;
        }
      };

      utterance.onresume = () => {
        console.log("Speech resumed");
        isPlaybackPausedRef.current = false;
      };

      utterance.onerror = (event) => {
        console.error(
          "Speech synthesis error:",
          event.error,
          "charIndex:",
          event.charIndex,
          "elapsedTime:",
          event.elapsedTime
        );

        // If it's an interrupted error
        if (event.error === "interrupted") {
          // Only attempt recovery if we didn't cause the interruption ourselves
          // (i.e., from our own cancel call when intentionally stopping)
          if (
            isPlaying &&
            currentTextRef.current &&
            !isPlaybackPausedRef.current
          ) {
            console.log(
              "Speech was interrupted externally, attempting to recover..."
            );

            // Wait before attempting to restart
            setTimeout(() => {
              if (isPlaying && currentTextRef.current) {
                restartSpeechFromCurrentPosition();
              }
            }, 500);
          } else {
            // This was likely our own intentional cancellation
            console.log(
              "Speech interrupted by our code, not attempting recovery"
            );
            cleanupSpeech();
          }
        } else {
          // For other errors, just reset the state
          console.error("Non-interruption speech error:", event.error);
          cleanupSpeech();
        }
      };

      // Speak the text
      console.log("Starting speech synthesis");
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error generating speech:", error);
      setIsPlayButtonLoading(false);
      cleanupSpeech();
    }
  };

  // Handle play button click
  const handlePlayClick = async (text?: string) => {
    if (!isSaved || !playButtonReady || !text) return;

    // If already playing, stop playback
    if (isPlaying) {
      console.log("Stopping speech");
      isPlaybackPausedRef.current = false;
      visibilityPausedRef.current = false;

      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      cleanupSpeech();
    } else {
      // Start playing if we have text
      if (text && window.speechSynthesis) {
        console.log("Starting new speech");
        setIsPlayButtonLoading(true);

        // Reset attempt counter
        speakingAttemptRef.current = 0;
        currentTextRef.current = text;

        // Must cancel any previous speech first to avoid queuing
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();

          // Give a brief moment for the cancellation to complete
          setTimeout(() => {
            createAndPlayUtterance(text);
          }, 150);
        } else {
          // No ongoing speech, start immediately
          createAndPlayUtterance(text);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSpeech();

      // Clean up object URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

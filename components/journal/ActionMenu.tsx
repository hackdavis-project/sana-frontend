"use client";
import { Mic, Pause, Play, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/app/api/client";
import { voiceEvents } from "@/app/events/voiceEvents"; // Removed useSttStore

// Position enum for button placement
export enum ButtonPosition {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

interface ActionMenuProps {
  isExpanded: boolean;
  onToggle: () => void;
  position?: ButtonPosition;
  onFinishRecording?: (audioData?: any) => void;
  onTranscriptionComplete?: (text: string) => void;
}

export function ActionMenu({
  isExpanded,
  onToggle,
  position = ButtonPosition.LEFT,
  onFinishRecording = () => {},
  onTranscriptionComplete = () => {},
}: ActionMenuProps) {
  console.log("ActionMenu render. isExpanded:", isExpanded, "position:", position, "onFinishRecording:", typeof onFinishRecording, "onTranscriptionComplete:", typeof onTranscriptionComplete);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Debug logging
  useEffect(() => {
    console.log("ActionMenu mounted");
    return () => {
      console.log("ActionMenu unmounted");
    };
  }, []);

  // Clean up timers and recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      console.log("Recording started successfully");
      setIsRecording(true);
      setIsPaused(false);

      // Start timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access your microphone. Please check your permissions.");
    }
  };

  const pauseRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      console.log("Recording paused");
    }

    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      console.log("Recording resumed");
    }

    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const finishRecording = async () => {
    console.log("Finishing recording...");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsProcessing(true);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();

      // Wait for the final data and process it
      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log("MediaRecorder stopped, processing audio...");
          // Create audio blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          console.log("Audio blob created, size:", audioBlob.size);

          // For debugging: create and play audio to verify recording worked
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onloadedmetadata = () => {
            console.log("Audio duration:", audio.duration);
          };

          // Create a File object from the Blob
          const audioFile = new File([audioBlob], "recording.webm", {
            type: "audio/webm",
          });

          console.log("Calling transcribeAudio API...");
          // Call the API to transcribe the audio
          const response = await apiClient.transcribeAudio(audioFile);
          console.log("API response:", response);

          if (response.success && response.data.transcription) {
            const transcribedText = response.data.transcription.full_text;
            console.log("Transcribed text:", transcribedText);

            if (transcribedText) {
              onTranscriptionComplete(transcribedText);
            } else {
              console.warn("Transcribed text is empty");
            }
          } else {
            console.error("Transcription failed:", response);
          }
        } catch (error) {
          console.error("Error transcribing audio:", error);
        } finally {
          // Clean up
          setIsRecording(false);
          setIsPaused(false);
          setRecordingTime(0);
          setIsProcessing(false);

          // Stop all tracks from the stream
          if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream
              .getTracks()
              .forEach((track) => track.stop());
          }

          onFinishRecording(audioChunksRef.current);
          audioChunksRef.current = [];
        }
      };
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="absolute right-6 bottom-28 flex items-center z-10">
      <div className="relative">

        {/* Vertical stack of controls */}
        <div className="flex flex-col-reverse items-center">
          {/* Main button - transforms between mic and finish */}
          <div className="relative z-20">
            {/* Recording indicator dot */}
            <div
              className={`absolute top-0 right-[-0.1rem] w-4 h-4 bg-red-400 rounded-full z-10 transition-all duration-500 ease-in-out ${
                isRecording
                  ? "opacity-100 scale-100 animate-pulse"
                  : "opacity-0 scale-0"
              }`}
              style={{
                animationDuration: "1.5s",
              }}
            />

            <button
              className={`relative rounded-full border shadow-lg w-16 h-16 flex items-center justify-center transition-all duration-500 ${
                isRecording
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-amber-100 border-amber-200 hover:bg-amber-200 text-amber-800"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={isRecording ? finishRecording : startRecording}
              disabled={isProcessing}
              aria-label={isRecording ? "Finish recording" : "Start recording"}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`absolute transition-all duration-500 ${
                    isRecording
                      ? "opacity-0 scale-0 rotate-90"
                      : "opacity-100 scale-100"
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </div>

                <div
                  className={`absolute transition-all duration-500 ${
                    isRecording
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-0 -rotate-90"
                  }`}
                >
                  <Check className="w-6 h-6" />
                </div>

                {/* Voice animation waves - only visible during recording */}
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`absolute w-12 h-12 rounded-full border-2 border-white opacity-40 ${
                        isPaused ? "" : "animate-ping-slow"
                      }`}
                    ></div>
                    <div
                      className={`absolute w-10 h-10 rounded-full border-2 border-white opacity-30 ${
                        isPaused ? "" : "animate-ping-slow"
                      }`}
                      style={{ animationDelay: "200ms" }}
                    ></div>
                    <div
                      className={`absolute w-8 h-8 rounded-full border-2 border-white opacity-20 ${
                        isPaused ? "" : "animate-ping-slow"
                      }`}
                      style={{ animationDelay: "400ms" }}
                    ></div>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Pause/Resume button */}
          <div
            className={`absolute transition-all duration-700 ease-in-out z-10 ${
              isRecording && !isProcessing
                ? "opacity-100 translate-y-[-4.5rem] scale-100"
                : "opacity-0 translate-y-0 scale-75 pointer-events-none"
            }`}
            style={{ transitionDelay: isRecording ? "150ms" : "0ms" }}
          >
            <button
              className="bg-amber-100 rounded-full border border-amber-200 shadow-md w-14 h-14 flex items-center justify-center hover:bg-amber-200 transition-colors"
              onClick={isPaused ? resumeRecording : pauseRecording}
              disabled={!isRecording || isProcessing}
              aria-label={isPaused ? "Resume recording" : "Pause recording"}
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-amber-800" />
              ) : (
                <Pause className="w-5 h-5 text-amber-800" />
              )}
            </button>
          </div>

          {/* Time display at top - always present when recording */}
          <div
            className={`absolute transition-all duration-700 ease-in-out z-10 ${
              isRecording
                ? "opacity-100 translate-y-[-9rem] scale-100"
                : "opacity-0 translate-y-0 scale-75 pointer-events-none"
            }`}
            style={{
              width: "90px",
              textAlign: "center",
              transitionDelay: isRecording ? "300ms" : "150ms",
            }}
          >
            <div className="bg-amber-100 py-2 rounded-full shadow-md text-amber-800 font-medium">
              <span className="font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute top-0 translate-y-[-12rem] bg-amber-100 py-2 px-4 rounded-full shadow-md text-amber-800 font-medium">
              <span className="animate-pulse">Transcribing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

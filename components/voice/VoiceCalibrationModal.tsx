"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/app/api/client";

interface VoiceCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCalibrated: (voiceId: string) => void;
}

export function VoiceCalibrationModal({
  isOpen,
  onClose,
  onVoiceCalibrated,
}: VoiceCalibrationModalProps) {
  // No need to check localStorage as we're now checking voice_setup flag from the API
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"intro" | "recording" | "preview" | "uploading" | "success">("intro");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        setStep("preview");
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStep("recording");
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Auto-stop after 30 seconds
        if (seconds >= 30) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access your microphone. Please check permissions and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    setStep("uploading");
    setError(null);
    
    try {
      const audioFile = new File([audioBlob], "voice-calibration.wav", {
        type: "audio/wav",
      });
      
      const response = await apiClient.cloneVoice(audioFile);
      
      if (response.success && response.data.voice_id) {
        setStep("success");
        onVoiceCalibrated(response.data.voice_id);
        
        // Close modal after 2 seconds of success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to calibrate voice");
      }
    } catch (err) {
      console.error("Error uploading voice sample:", err);
      setError("Failed to process your voice sample. Please try again.");
      setStep("preview");
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setStep("intro");
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // This prevents closing when clicking inside the modal content
            // but allows closing when clicking the backdrop
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md mx-auto relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-amber-900 mb-2">Voice Calibration</h2>
              <p className="text-gray-600">
                {step === "intro" && "Record a short sample of your voice to enable text-to-speech features"}
                {step === "recording" && "Please read the following text aloud:"}
                {step === "preview" && "Review your recording"}
                {step === "uploading" && "Processing your voice..."}
                {step === "success" && "Voice calibration complete!"}
              </p>
            </div>

            {/* Step-specific content */}
            <div className="mb-6">
              {step === "intro" && (
                <div className="text-center p-4">
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-4">
                    We need a sample of your voice to create a personalized text-to-speech experience.
                    Please record yourself reading a short passage.
                  </p>
                </div>
              )}

              {step === "recording" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    "Today I'm taking a moment to reflect on my thoughts and feelings. 
                    This voice sample will help create a personalized experience for me 
                    when I use this journaling app."
                  </p>
                  <div className="text-red-500 font-medium">
                    Recording: {formatTime(recordingTime)}
                  </div>
                </div>
              )}

              {step === "preview" && audioBlob && (
                <div className="text-center">
                  <div className="w-full max-w-sm mx-auto mb-4 bg-gray-100 p-4 rounded-lg">
                    <audio 
                      ref={audioRef}
                      src={URL.createObjectURL(audioBlob)} 
                      controls 
                      className="w-full"
                    />
                  </div>
                  <p className="text-gray-700 mb-2">
                    Listen to your recording. If you're satisfied, click "Submit" to continue.
                  </p>
                </div>
              )}

              {step === "uploading" && (
                <div className="text-center p-4">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-700">
                    Please wait while we process your voice sample...
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="text-center p-4">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">
                    Your voice has been successfully calibrated! You can now use text-to-speech features.
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="text-center p-4">
                  <button
                    onClick={() => onClose()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              {step !== "uploading" && step !== "success" && (
                <>
                  {step === "intro" && (
                    <div className="flex justify-center w-full">
                      <button
                        onClick={startRecording}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors shadow-sm"
                      >
                        Start Recording
                      </button>
                    </div>
                  )}
                  
                  {step === "recording" && (
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm"
                    >
                      Stop Recording
                    </button>
                  )}
                  
                  {step === "preview" && (
                    <>
                      <button
                        onClick={resetRecording}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Record Again
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors shadow-sm"
                      >
                        Submit
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

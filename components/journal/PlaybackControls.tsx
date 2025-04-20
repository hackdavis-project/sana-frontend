"use client";
import { Headphones, Disc3 } from "lucide-react";
import { Ring } from "@uiball/loaders";
import { motion, AnimatePresence } from "framer-motion";

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
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.div
                key="disc"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ transform: "scale(1.4)" }}
                  className="flex items-center justify-center"
                >
                  <Disc3 className="w-5 h-5" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="headphones"
                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Headphones className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </button>
    </div>
  );
}

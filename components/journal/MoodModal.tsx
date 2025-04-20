"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MoodRating } from "@/lib/types";

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMood: (mood: MoodRating) => void;
  initialMood?: MoodRating;
}

const MOOD_LABELS = ["Very Bad", "Bad", "Okay", "Good", "Very Good"];
const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😄"];
const MOOD_COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-lime-400",
  "bg-green-400",
];

export function MoodModal({ isOpen, onClose, onSaveMood, initialMood }: MoodModalProps) {
  const [moodValue, setMoodValue] = useState<number>(initialMood?.value || 3);
  const [isDragging, setIsDragging] = useState(false);

  // Reset to initial value when modal opens
  useEffect(() => {
    if (isOpen && initialMood?.value) {
      setMoodValue(initialMood.value);
    } else if (isOpen) {
      setMoodValue(3); // Default to neutral
    }
  }, [isOpen, initialMood]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodValue(parseInt(e.target.value));
  };

  const handleSave = () => {
    onSaveMood({
      date: new Date(),
      value: moodValue,
      label: MOOD_LABELS[moodValue - 1],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-amber-900 mb-2">How are you feeling?</h2>
              <p className="text-gray-600">Record your mood for this journal entry</p>
            </div>

            {/* Emoji display */}
            <div className="text-center mb-4">
              <motion.div
                key={moodValue}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-6xl"
              >
                {MOOD_EMOJIS[moodValue - 1]}
              </motion.div>
              <motion.p
                key={`label-${moodValue}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-2 font-medium text-amber-800"
              >
                {MOOD_LABELS[moodValue - 1]}
              </motion.p>
            </div>

            {/* Slider */}
            <div className="relative mb-8 px-4">
              <div className="flex justify-between mb-2">
                {MOOD_EMOJIS.map((emoji, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      moodValue === index + 1 ? MOOD_COLORS[index] : "bg-gray-200"
                    } transition-colors duration-300`}
                  >
                    <span className="text-sm">{emoji}</span>
                  </div>
                ))}
              </div>

              <div className="h-2 bg-gray-200 rounded-full mb-2 relative">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                    MOOD_COLORS[moodValue - 1]
                  }`}
                  style={{ width: `${((moodValue - 1) / 4) * 100}%` }}
                ></div>
              </div>

              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={moodValue}
                onChange={handleSliderChange}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors shadow-sm"
              >
                Save Mood
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

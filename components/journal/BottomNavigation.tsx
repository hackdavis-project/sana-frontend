"use client";
import { FileText, BarChart, LifeBuoy, Users } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";
import router from "next/router";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewEntry: () => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  onNewEntry,
}: BottomNavigationProps) {
  const noteAnimation = useAnimation();
  const [animating, setAnimating] = useState(false);
  const [noteVisible, setNoteVisible] = useState(true);

  const handleNoteClick = async () => {
    if (animating) return;

    setAnimating(true);

    // If we're not on the notes page, switch to it first
    if (activeTab !== "home") {
      onTabChange("home");
      // Small delay to allow for tab change to register
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Always perform the animation and create new note
    // Charge up - move slightly down first
    await noteAnimation.start({
      y: 15,
      scale: 0.9,
      rotate: 0,
      transition: { duration: 0.15, ease: "easeIn" },
    });

    // Shoot up higher than the middle of the screen
    await noteAnimation.start({
      y: -window.innerHeight / 2 - 50, // Overshoot the middle
      scale: 1.8,
      rotate: [2, 15, -10, 5],
      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }, // Custom bezier curve for more bounce
    });

    // Slight pause at the peak
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Fall down to the middle of the screen with "landing" effect
    await noteAnimation.start({
      y: -window.innerHeight / 2 + 70,
      scale: 0.8, // Become smaller on landing
      rotate: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    });

    // "Bounce" effect on landing
    await noteAnimation.start({
      y: -window.innerHeight / 2 + 50,
      scale: 1.2,
      transition: { duration: 0.15, ease: "easeOut" },
    });

    // Pause briefly
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Disappear into the center (falling effect - getting smaller and fading)
    await noteAnimation.start({
      y: -window.innerHeight / 2 + 100, // Move down slightly
      scale: 0.1,
      opacity: 0,
      rotate: 0,
      transition: {
        duration: 0.3,
        ease: [0.68, -0.6, 0.32, 1.6], // Custom easing for more dramatic effect
      },
    });

    // Hide the note
    setNoteVisible(false);

    // Create the new note immediately
    onNewEntry();

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Reset the animation state without showing - position it below the stack
    await noteAnimation.start({
      y: 200, // Start well below the bottom of the screen
      x: 0,
      scale: 0.9,
      rotate: 2,
      opacity: 0,
      transition: { duration: 0 },
    });

    // Show the note again
    setNoteVisible(true);

    // Slide up into position with a nice bounce effect
    await noteAnimation.start({
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        y: {
          type: "spring",
          stiffness: 300,
          damping: 15,
        },
        opacity: {
          duration: 0.3,
        },
      },
    });

    setAnimating(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
      <button
        className={`flex flex-col items-center justify-center p-2 ${
          activeTab === "home" ? "text-amber-800" : "text-gray-500"
        }`}
        onClick={() => onTabChange("home")}
      >
        <FileText className="w-6 h-6" />
        <span className="text-xs mt-1">Notes</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 ${
          activeTab === "calendar" ? "text-amber-800" : "text-gray-500"
        }`}
        onClick={() => onTabChange("calendar")}
      >
        <Users className="w-6 h-6" />
        <span className="text-xs mt-1">Community</span>
      </button>

      {/* Messy stack of note cards button */}
      <button
        className="relative -mt-8 w-16 h-16 flex items-center justify-center"
        onClick={handleNoteClick}
        aria-label="Create new note"
        disabled={animating}
      >
        <motion.div
          className="absolute w-14 h-14 bg-white rounded-lg shadow-md border border-amber-100 transform rotate-[-8deg] top-1"
          whileTap={{ rotate: -10, y: -2 }}
        ></motion.div>
        <motion.div
          className="absolute w-14 h-14 bg-white rounded-lg shadow-md border border-amber-100 transform rotate-[5deg] top-0.5 left-0.5"
          whileTap={{ rotate: 7, y: -2 }}
        ></motion.div>
        <motion.div
          className="absolute w-14 h-14 bg-amber-50 rounded-lg shadow-md border border-amber-200 transform rotate-[-3deg] top-0 left-0.5"
          whileTap={{ rotate: -5, y: -2 }}
        >
          <div className="w-full h-full flex flex-col justify-start items-center pt-2">
            <div className="w-10 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-8 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-10 h-0.5 bg-amber-200"></div>
          </div>
        </motion.div>
        <motion.div
          className="absolute w-14 h-14 bg-white rounded-lg shadow-md border border-amber-100 transform rotate-[8deg] -top-0.5 -left-0.5"
          whileTap={{ rotate: 10, y: -2 }}
        >
          <div className="w-full h-full flex flex-col justify-start items-center pt-2">
            <div className="w-10 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-8 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-10 h-0.5 bg-amber-200"></div>
          </div>
        </motion.div>
        {noteVisible && (
          <motion.div
            className="absolute w-14 h-14 bg-amber-400 rounded-lg shadow-lg border border-amber-500 transform rotate-[2deg] -top-1 left-0.5 z-10"
            whileTap={{ rotate: 4, y: -2 }}
            animate={noteAnimation}
          >
            <div className="w-full h-full flex flex-col justify-start items-center pt-2">
              <div className="w-10 h-0.5 bg-amber-500 mb-1.5"></div>
              <div className="w-8 h-0.5 bg-amber-500 mb-1.5"></div>
              <div className="w-10 h-0.5 bg-amber-500"></div>
            </div>
          </motion.div>
        )}
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 ${
          activeTab === "resources" ? "text-amber-800" : "text-gray-500"
        }`}
        onClick={() => onTabChange("resources")}
      >
        <LifeBuoy className="w-6 h-6" />
        <span className="text-xs mt-1">Resources</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 ${
          activeTab === "insights" ? "text-amber-800" : "text-gray-500"
        }`}
        onClick={() => onTabChange("insights")}
      >
        <BarChart className="w-6 h-6" />
        <span className="text-xs mt-1">Insights</span>
      </button>
    </div>
  );
}

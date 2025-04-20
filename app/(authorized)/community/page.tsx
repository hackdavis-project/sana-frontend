"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { apiClient } from "@/app/api/client";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

// Sample user stories - limited to 5 as requested
const userStories = [
  {
    content:
      "After years of feeling controlled in my relationship, I finally realized I had the power to make my own choices. It started with small things - what I wore, how I spent my free time - and grew from there. Each decision felt like reclaiming a piece of myself.",
    timeAgo: "3 days ago",
  },
  {
    content:
      "I've struggled with feeling in control of my emotions. Journaling has helped me identify triggers and recognize patterns. Now when I feel overwhelmed, I have strategies to ground myself instead of spiraling.",
    timeAgo: "1 week ago",
  },
  {
    content:
      "Control was something I thought I needed in every situation. Through therapy, I've learned to distinguish between what I can control and what I need to accept. This shift has brought me so much peace.",
    timeAgo: "2 weeks ago",
  },
  {
    content:
      "My journey with emotional control has been challenging. I used to think showing emotion was weakness, but now I understand that acknowledging feelings is actually a strength.",
    timeAgo: "3 weeks ago",
  },
  {
    content:
      "Learning to let go of controlling others has been transformative. I realize now that the only person I can truly control is myself, and that's been freeing.",
    timeAgo: "1 month ago",
  },
];

export default function CommunityPage() {
  const router = useRouter();
  
  const { createNewEntry } = useJournalEntries();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sharedEntries, setSharedEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch shared entries from the API
    const fetchSharedEntries = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getSharedEntries("Control");
        if (response.success) {
          // Limit to 5 entries as requested
          setSharedEntries(response.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching shared entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedEntries();
  }, []);

  // Use API data if available, otherwise use sample data (limited to 5)
  const displayStories =
    sharedEntries.length > 0
      ? sharedEntries.map((entry) => ({
          content: entry.content,
          timeAgo: getTimeAgo(entry.createdAt),
        }))
      : userStories;

  // Function to calculate time ago from date
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Handle next story
  const handleNext = () => {
    if (currentIndex < displayStories.length) {
      setCurrentIndex(currentIndex + 1);
      scrollToCard(currentIndex + 1);
    }
  };

  // Handle previous story
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollToCard(currentIndex - 1);
    }
  };

  // Scroll to a specific card
  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardHeight = scrollContainerRef.current.offsetHeight;
      scrollContainerRef.current.scrollTo({
        top: index * cardHeight,
        behavior: "smooth",
      });
    }
  };

  // Handle scroll event to update current index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const cardHeight = scrollContainerRef.current.offsetHeight;
      const newIndex = Math.round(scrollTop / cardHeight);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 relative ${montserrat.className}`}
    >
      <div className="flex-1 overflow-hidden pb-16">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-gray-100 p-6 pb-2 shadow-sm">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Community</h1>
          <p className="text-gray-600 mb-2">
            Connect with others on similar healing journeys. All stories are anonymous.
          </p>
        </div>
        
        {/* TikTok-style Vertical Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="h-[calc(100vh-140px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide pb-24"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={handleScroll}
        >
          {/* Stories */}
          {displayStories.map((story, index) => (
            <div 
              key={index}
              className="h-full w-full snap-start snap-always flex items-center justify-center p-6 "
            >
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1
                }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl bg-amber-50 rounded-xl p-10 shadow-lg border border-amber-100 min-h-[60vh] flex flex-col justify-center"
              >
                <p className="text-gray-700 leading-relaxed text-2xl mb-8 flex-grow flex items-center">
                  "{story.content}"
                </p>
                <div className="text-sm text-amber-700 font-medium">
                  Shared {story.timeAgo}
                </div>
              </motion.div>
            </div>
          ))}
          
          {/* "That's all for today" message as the 6th scroll item */}
          <div className="h-full w-full snap-start snap-always flex items-center justify-center p-6 mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1
              }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-white rounded-xl p-10 shadow-lg text-center min-h-[60vh] flex flex-col justify-center"
            >
              <h2 className="text-3xl font-bold text-amber-800 mb-6">
                You’ve reached the end of today’s shared stories
              </h2>
              <p className="text-gray-600 text-xl">
                There are no more community stories right now. Please check back tomorrow—and remember, you’re not alone.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Navigation controls and pagination indicators removed for a cleaner experience */}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={"community"}
        onTabChange={(tab) => {
          if (tab === "community") {
            router.push("/community");
          } else if (tab !== "home") {
            router.push(`/${tab}`);
          } else {
            router.push("/");
          }
        }}
        onNewEntry={() => {}}
      />
    </main>
  );
}

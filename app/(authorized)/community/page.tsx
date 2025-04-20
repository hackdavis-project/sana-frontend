"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { apiClient } from "@/app/api/client";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

// Sample user stories
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [sharedEntries, setSharedEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch shared entries from the API
    const fetchSharedEntries = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getSharedEntries("Control");
        if (response.success) {
          setSharedEntries(response.data);
        }
      } catch (error) {
        console.error("Error fetching shared entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedEntries();
  }, []);

  // Use API data if available, otherwise use sample data
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
    if (currentIndex < displayStories.length - 1) {
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
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Handle scroll event to update current index
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 relative ${montserrat.className}`}
    >
      <div className="flex-1 p-6 pb-24 overflow-hidden">
        <h1 className="text-4xl font-bold text-amber-800 mb-6">Community</h1>
        <p className="text-gray-600 mb-4">
          Connect with others on similar healing journeys. All shared stories
          are anonymous.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">
            Stories about Control
          </h2>

          {/* Story Carousel */}
          <div className="relative">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-amber-50 rounded-full p-1 ${
                currentIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft className="text-amber-800" />
            </button>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="overflow-x-scroll scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onScroll={handleScroll}
            >
              <div className="flex perspective-[1000px] py-4">
                {displayStories.map((story, index) => {
                  // Calculate the "distance" from the current card
                  const distance = Math.abs(currentIndex - index);
                  const scale = distance === 0 ? 1 : 0.9 - distance * 0.05;
                  const opacity = distance === 0 ? 1 : 0.8 - distance * 0.2;
                  const translateY = distance === 0 ? 0 : distance * 5;

                  return (
                    <div
                      key={index}
                      className="min-w-full flex-shrink-0 snap-center px-8 transition-all duration-300"
                      style={{
                        transform: `scale(${scale}) translateY(${translateY}px)`,
                        opacity: opacity,
                      }}
                    >
                      <div className="bg-amber-50 bg-opacity-50 rounded-lg p-5 min-h-[180px] flex flex-col justify-between shadow-md border border-amber-100">
                        <p className="text-gray-700 leading-relaxed">
                          "{story.content}"
                        </p>
                        <div className="text-sm text-amber-700 mt-3 font-medium">
                          Shared {story.timeAgo}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentIndex === displayStories.length - 1}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-amber-50 rounded-full p-1 ${
                currentIndex === displayStories.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : ""
              }`}
            >
              <ChevronRight className="text-amber-800" />
            </button>
          </div>

          {/* Pagination Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {displayStories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  scrollToCard(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-4 bg-amber-500"
                    : "w-2 bg-amber-200"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-gray-600 italic mt-6">
          Remember: Everyone's healing journey is unique. Take what resonates
          and leave the rest.
        </p>
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

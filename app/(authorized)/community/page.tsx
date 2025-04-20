"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { PlaybackControls } from "@/components/journal/PlaybackControls";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { usePlayback } from "@/hooks/usePlayback";
import { apiClient } from "@/app/api/client";
import { Headphones } from "lucide-react";

// Sample user stories - limited to 5 as requested
const userStories = [
  {
    content:
      'i never knew if it was abuse because there weren\'t bruises. but the way he talked to me made me feel like nothing. like i was always "too sensitive" or "making things up." i still catch myself apologizing for everything. even now, i hear his voice in my head. i\'m tired of shrinking myself to be loved. i want to trust my emotions again. to feel like they matter.',
    timeAgo: "3 days ago",
    title: "Emotional Abuse (Relationship)",
  },
  {
    content:
      "my mom always said she was protecting me, but it felt like control. no privacy, no choices, just constant judgment masked as \"love.\" i still second-guess everything. even when i stand up for myself, she turns it around like i'm hurting her. it's confusing. i want to be able to make decisions without guilt. i'm 23, and i still feel like a child in her presence. i want to break out of that.",
    timeAgo: "1 week ago",
    title: "Parental Control & Gaslighting",
  },
  {
    content:
      "misgendered again. third time this week. and no one said anything. it sounds small, but it builds up. i shouldn't need a speech just to exist at work. i question myself constantly—am i overreacting? but when i go home, my chest hurts and i'm replaying everything. it's exhausting. people say they support me, but they don't show it. silence hurts just as much as the comments. i just want to feel seen.",
    timeAgo: "2 weeks ago",
    title: "Workplace Microaggressions & Identity Harm",
  },
  {
    content:
      "i didn't remember most of it until recently. yelling, slamming doors, hiding in my room with music to drown it out. i told myself it wasn't that bad, but why do i flinch at raised voices? why does my chest tighten around my parents? i want to stop feeling like a scared kid. i want peace. i don't want to carry those moments into every room i walk into now.",
    timeAgo: "3 weeks ago",
    title: "Childhood Abuse (Suppressed Memory)",
  },
  {
    content:
      "sometimes i convince myself it wasn't that bad. but then i remember how i used to cry in secret and smile in public. how every fight became my fault. how he'd deny what he said minutes after saying it. i kept a list of his words just to believe myself. even now, i reread it to feel sane. i want to trust my memory. i want to believe myself again.",
    timeAgo: "1 month ago",
    title: "Gaslighting + Self-Doubt",
  },
];

export default function CommunityPage() {
  const router = useRouter();

  const { createNewEntry } = useJournalEntries();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sharedEntries, setSharedEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStoryText, setCurrentStoryText] = useState("");

  // Initialize playback hook
  const { isPlaying, isPlayButtonLoading, handlePlayClick } = usePlayback(
    true,
    true
  );

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

  const onHeadphonesClick = (story: { content: string }) => {
    setCurrentStoryText(story.content);
    handlePlayClick(story.content);
  };

  // Use API data if available, otherwise use sample data (limited to 5)
  const displayStories =
    sharedEntries.length > 0
      ? sharedEntries.map((entry) => ({
          content: entry.content,
          timeAgo: getTimeAgo(entry.createdAt),
          title: entry.title || "",
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
    <main className={`flex flex-col h-[100svh] bg-gray-100 relative`}>
      <div className="flex-1 overflow-hidden pb-16">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-gray-100 p-6 pb-2 shadow-sm">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Community</h1>
          <p className="text-gray-600 mb-2">
            Connect with others on similar healing journeys. All stories are
            anonymous.
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
                  scale: 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl bg-amber-50 rounded-xl p-10 shadow-lg border border-amber-100 min-h-[60vh] flex flex-col justify-center"
              >
                {story.title && (
                  <h3 className="text-amber-800 font-bold text-xl mb-4">
                    {story.title}
                  </h3>
                )}
                <p className="text-gray-700 leading-relaxed text-2xl mb-8 flex-grow flex items-center">
                  "{story.content}"
                </p>
                <div className="flex flex-row justify-between text-sm text-amber-700 font-medium">
                  <span>Shared {story.timeAgo}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onHeadphonesClick(story);
                    }}
                    className="focus:outline-none"
                    aria-label="Listen to story"
                  >
                    <PlaybackControls
                      isSaved={true}
                      isPlaying={
                        isPlaying && currentStoryText === story.content
                      }
                      isPlayButtonLoading={
                        isPlayButtonLoading &&
                        currentStoryText === story.content
                      }
                      onPlayClick={() => onHeadphonesClick(story)}
                    />
                  </button>
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
                scale: 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-white rounded-xl p-10 shadow-lg text-center min-h-[60vh] flex flex-col justify-center"
            >
              <h2 className="text-3xl font-bold text-amber-800 mb-6">
                You’ve reached the end of today’s shared stories
              </h2>
              <p className="text-gray-600 text-xl">
                There are no more community stories right now. Please check back
                tomorrow—and remember, you’re not alone.
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

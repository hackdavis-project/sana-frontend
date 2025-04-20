"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { apiClient } from "@/app/api/client";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

export default function CalendarPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const { createNewEntry } = useJournalEntries();

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "calendar") {
      router.push(tab === "home" ? "/" : `/${tab}`);
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 relative ${montserrat.className}`}
    >
      <div className="flex-1 p-6 pb-24">
        <h1 className="text-4xl font-bold text-amber-800 mb-6">Calendar</h1>
        <p className="text-gray-600">Calendar view will be implemented soon.</p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewEntry={createNewEntry}
      />
    </main>
  );
}

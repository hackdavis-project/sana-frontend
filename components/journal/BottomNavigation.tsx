"use client"
import { Home, Calendar, BarChart, GroupIcon as Guides } from "lucide-react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onNewEntry: () => void
}

export function BottomNavigation({ activeTab, onTabChange, onNewEntry }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
      <button
        className={`flex flex-col items-center justify-center p-2 ${activeTab === "home" ? "text-amber-800" : "text-gray-500"}`}
        onClick={() => onTabChange("home")}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">Home</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 ${activeTab === "calendar" ? "text-amber-800" : "text-gray-500"}`}
        onClick={() => onTabChange("calendar")}
      >
        <Calendar className="w-6 h-6" />
        <span className="text-xs mt-1">Calendar</span>
      </button>

      {/* Messy stack of note cards button */}
      <button
        className="relative -mt-8 w-16 h-16 flex items-center justify-center"
        onClick={onNewEntry}
        aria-label="Create new note"
      >
        <div className="absolute w-14 h-14 bg-white rounded-lg shadow-md border border-amber-100 transform rotate-[-8deg] top-1"></div>
        <div className="absolute w-14 h-14 bg-white rounded-lg shadow-md border border-amber-100 transform rotate-[5deg] top-0.5 left-0.5"></div>
        <div className="absolute w-14 h-14 bg-amber-50 rounded-lg shadow-md border border-amber-200 transform rotate-[-3deg] top-0 left-0.5">
          <div className="w-full h-full flex flex-col justify-start items-center pt-2">
            <div className="w-10 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-8 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-10 h-0.5 bg-amber-200"></div>
          </div>
        </div>
        <div className="absolute w-14 h-14 bg-white rounded-lg shadow-md border border-amber-100 transform rotate-[8deg] -top-0.5 -left-0.5">
          <div className="w-full h-full flex flex-col justify-start items-center pt-2">
            <div className="w-10 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-8 h-0.5 bg-amber-200 mb-1.5"></div>
            <div className="w-10 h-0.5 bg-amber-200"></div>
          </div>
        </div>
        <div className="absolute w-14 h-14 bg-amber-400 rounded-lg shadow-lg border border-amber-500 transform rotate-[2deg] -top-1 left-0.5 z-10">
          <div className="w-full h-full flex flex-col justify-start items-center pt-2">
            <div className="w-10 h-0.5 bg-amber-500 mb-1.5"></div>
            <div className="w-8 h-0.5 bg-amber-500 mb-1.5"></div>
            <div className="w-10 h-0.5 bg-amber-500"></div>
          </div>
        </div>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 ${activeTab === "guides" ? "text-amber-800" : "text-gray-500"}`}
        onClick={() => onTabChange("guides")}
      >
        <Guides className="w-6 h-6" />
        <span className="text-xs mt-1">Guides</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 ${activeTab === "insights" ? "text-amber-800" : "text-gray-500"}`}
        onClick={() => onTabChange("insights")}
      >
        <BarChart className="w-6 h-6" />
        <span className="text-xs mt-1">Insights</span>
      </button>
    </div>
  )
}

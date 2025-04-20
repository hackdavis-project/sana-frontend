"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  BarChart,
  Heart,
  MessageSquare,
  Calendar as CalendarIcon,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useInsights } from "@/hooks/useInsights";
import { apiClient } from "@/app/api/client";



export default function InsightsPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");
  const { entries, createNewEntry } = useJournalEntries();
  const {
    writingActivityData,
    themes,
    consistencyData,
    weeklyActivity,
    mostActiveDay,
    moodTrendData,
  } = useInsights(entries);
  const [feelingData, setFeelingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch feeling data from the API
    const fetchFeelingData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getFeelingData();
        if (response.success) {
          setFeelingData(response.data);
        }
      } catch (error) {
        console.error("Error fetching feeling data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeelingData();
  }, []);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "insights") {
      if (tab === "calendar") {
        router.push("/community");
      } else {
        router.push(tab === "home" ? "/" : `/${tab}`);
      }
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-50 relative`}
    >
      <div className="flex-1 overflow-auto p-6 pb-24">
        <h1 className="text-4xl font-bold text-amber-800 mb-6">
          Your Healing Journey
        </h1>

        {/* Emotional Well-being Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-amber-800 mb-4">
            Emotional Well-being Trend
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodTrendData}
                margin={{ top: 30, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f5f5f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  domain={[1, 3]}
                  ticks={[1, 3]}
                />
                <Line
                  type="natural"
                  dataKey="value"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-gray-600 mt-2">
            Your emotional well-being shows an upward trend. Journaling helps
            process difficult emotions and build resilience.
          </p>
        </div>

        {/* Insights Cards */}
        <div className="space-y-6">
          {/* Theme Card */}
          {themes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">
                    Theme:{" "}
                    {themes[0].name.charAt(0).toUpperCase() +
                      themes[0].name.slice(1)}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You've written a lot about {themes[0].name}—would you like
                    to explore stories about reclaiming it?
                  </p>
                  <a
                    href="#"
                    className="text-amber-700 font-medium flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/community");
                    }}
                  >
                    See community stories <span className="ml-1">↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Consistency Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-amber-800">
                Consistency
              </h3>
              <CalendarIcon className="w-6 h-6 text-amber-700" />
            </div>

            <div className="flex justify-between mt-6 mb-2">
              <div className="text-center">
                <h4 className="text-gray-600 text-sm">Current Streak</h4>
                <div className="text-5xl font-bold text-amber-800 mt-2">
                  {consistencyData.currentStreak}
                </div>
                <div className="text-sm text-gray-500">days</div>
              </div>

              <div className="text-center">
                <h4 className="text-gray-600 text-sm">Longest Streak</h4>
                <div className="text-5xl font-bold text-amber-800 mt-2">
                  {consistencyData.longestStreak}
                </div>
                <div className="text-sm text-gray-500">days</div>
              </div>

              <div className="text-center">
                <h4 className="text-gray-600 text-sm">Total Entries</h4>
                <div className="text-5xl font-bold text-amber-800 mt-2">
                  {consistencyData.totalEntries}
                </div>
                <div className="text-sm text-gray-500">entries</div>
              </div>
            </div>

            <p className="text-gray-600 mt-6">
              You've journaled {consistencyData.currentStreak} days in a row.
              Consistency helps process emotions and build resilience.
            </p>
          </div>

          {/* Weekly Activity Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-amber-800">
                Weekly Activity
              </h3>
              <BarChart2 className="w-6 h-6 text-amber-700" />
            </div>

            <div className="mt-6 flex items-end justify-between h-32">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-amber-200 rounded-t-md"
                    style={{
                      height: `${(day.entries / 3) * 100}%`,
                      backgroundColor:
                        day.day === mostActiveDay ? "#F59E0B" : "#FDE68A",
                    }}
                  ></div>
                  <div className="text-sm mt-2 text-gray-600">{day.day}</div>
                </div>
              ))}
            </div>

            <p className="text-gray-600 mt-6">
              You journal most frequently on {mostActiveDay}. Regular reflection
              helps identify patterns in your healing journey.
            </p>
          </div>
        </div>
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

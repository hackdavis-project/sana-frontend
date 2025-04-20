"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useInsights } from "@/hooks/useInsights";
import { Heart, Phone, MapPin, FileText, Moon } from "lucide-react";
import { apiClient } from "@/app/api/client";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

export default function ResourcesPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("resources");
  const { entries, createNewEntry } = useJournalEntries();
  const { groundingResources, emotionalPatterns, mentalHealthResources } =
    useInsights(entries);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    // Fetch resources from the API
    const fetchResources = async () => {
      try {
        const response = await apiClient.getResources();
        if (response.success) {
          setResources(response.data);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  // Resource icons mapping
  const getResourceIcon = (title: string) => {
    if (title.includes("988") || title.includes("Crisis")) {
      return <Phone className="w-6 h-6 text-amber-800" />;
    } else if (title.includes("SAMHSA") || title.includes("Locator")) {
      return <MapPin className="w-6 h-6 text-amber-800" />;
    } else if (title.includes("Grounding")) {
      return <FileText className="w-6 h-6 text-amber-800" />;
    }
    return <Heart className="w-6 h-6 text-amber-800" />;
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "resources") {
      router.push(tab === "home" ? "/" : `/${tab}`);
    }
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 relative ${montserrat.className}`}
    >
      <div className="flex-1 overflow-auto p-6 pb-24">
        <h1 className="text-4xl font-bold text-amber-800 mb-6">Resources</h1>

        <div className="space-y-6">
          {/* Recurring Memories Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Heart className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  {groundingResources.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {groundingResources.description}
                </p>
                <a
                  href={groundingResources.link}
                  className="text-amber-700 font-medium flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(groundingResources.link);
                  }}
                >
                  View grounding guide <span className="ml-1">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Emotional Patterns Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Moon className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  {emotionalPatterns.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {emotionalPatterns.description}
                </p>
                <a
                  href={emotionalPatterns.link}
                  className="text-amber-700 font-medium flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(emotionalPatterns.link);
                  }}
                >
                  Bedtime techniques <span className="ml-1">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mental Health Resources */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-semibold text-amber-800">
                Mental Health Resources
              </h3>
              <Heart className="w-6 h-6 text-amber-700" />
            </div>

            <div className="space-y-8">
              {mentalHealthResources.map((resource, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      {getResourceIcon(resource.title)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-amber-800 mb-2">
                        {resource.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {resource.description}
                      </p>
                      <a
                        href={resource.link}
                        className="text-amber-700 font-medium flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          if (resource.link.startsWith("http")) {
                            window.open(resource.link, "_blank");
                          } else {
                            router.push(resource.link);
                          }
                        }}
                      >
                        {resource.linkText} <span className="ml-1">↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

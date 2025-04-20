"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { BottomNavigation } from "@/components/journal/BottomNavigation";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useInsights } from "@/hooks/useInsights";
import { Heart, Phone, MapPin, FileText, Moon } from "lucide-react";
import { apiClient } from "@/app/api/client";



export default function ResourcesPage() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("resources");
  const { entries, createNewEntry } = useJournalEntries();
  const { groundingResources, emotionalPatterns, mentalHealthResources } =
    useInsights(entries);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Compile all journal entries into a single string
    // Compile all journal entries into a single string using the 'content' field (populated by useJournalEntries)
    const compiledContent = entries.map(e => e.content || '').join('\n\n');

    // Fetch personalized resources from the API
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getResources(compiledContent);
        if (response.success) {
          setResources(response.data);
        } else {
          setError('Failed to fetch resources.');
        }
      } catch (err: any) {
        setError('Error fetching resources: ' + (err?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (entries.length === 0) {
      setResources([]);
      setLoading(false);
      setError(null);
      return;
    }
    fetchResources();
  }, [entries]);

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
      className={`flex flex-col h-[100svh] bg-gray-100 relative`}
    >
      <div className="flex-1 overflow-auto p-6 pb-24">
        <h1 className="text-4xl font-bold text-amber-800 mb-6">Resources</h1>

        {loading && (
          <div className="flex justify-center items-center h-40">
            <span className="text-amber-700 text-lg font-medium">Loading resources...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        {!loading && !error && resources.length === 0 && entries.length > 0 && (
          <div className="text-gray-500 italic text-center mt-12">
            No resources found.<br />
            Try writing about different topics or concerns to see more suggestions.
          </div>
        )}
        {entries.length === 0 && !loading && !error ? (
          <div className="text-gray-500 italic text-center mt-12">
            Add a journal entry to get personalized resource recommendations!
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, idx) => (
              <div
                key={resource.name + idx}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full transition hover:shadow-lg border border-amber-50"
                tabIndex={0}
                aria-label={`Resource: ${resource.name}`}
              >
                <div className="flex items-start gap-4 mb-2">
                  {resource.image_url && (
                    <img
                      src={resource.image_url}
                      alt={resource.name + ' image'}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-amber-800 flex items-center">
                    {resource.name}
                  </h2>
                </div>
                <p className="text-gray-700 mb-4 flex-1">{resource.description}</p>
                <div className="space-y-2 mt-auto">
                  {resource.phone && (
                    <div>
                      <a
                        href={`tel:${resource.phone}`}
                        className="text-amber-700 hover:underline font-medium flex items-center gap-2"
                        aria-label={`Call ${resource.phone}`}
                      >
                        <Phone className="w-5 h-5" />
                        {resource.phone}
                      </a>
                    </div>
                  )}
                  {resource.website && (
                    <div>
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 hover:underline font-medium flex items-center gap-2"
                        aria-label={`Visit website: ${resource.website}`}
                      >
                        <MapPin className="w-5 h-5" />
                        {resource.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {resource.address && (
                    <div className="text-gray-600 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {resource.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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

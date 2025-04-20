// Mock data for development and testing

import { JournalEntryType } from '@/app/store/journalStore';

/**
 * Generate a set of mock journal entries for development and testing
 */
export function getMockEntries(): JournalEntryType[] {
  return [
    {
      id: "1",
      title: "First Entry",
      content: "This is my first journal entry. I'm feeling hopeful today.",
      date: new Date().toISOString(),
      isSaved: true,
      lastModified: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Second Entry",
      content:
        "Today was challenging, but I found moments of peace. Writing helps me process.",
      date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      isSaved: true,
      lastModified: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
  ];
}

/**
 * Generate a random journal entry
 */
export function getRandomEntry(): JournalEntryType {
  const mockTexts = [
    "Today was a challenging day. I struggled with feelings of anxiety, but I managed to practice some deep breathing exercises that helped me calm down.",
    "I'm proud of myself for speaking up in the meeting today. It wasn't easy, but I expressed my concerns and felt heard.",
    "I noticed I've been avoiding social gatherings lately. I think I need to be gentle with myself and recognize that healing takes time.",
    "Writing in this journal is helping me process my thoughts and gain clarity about my situation."
  ];
  
  // Select a random mock text
  const content = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  const words = content.split(" ");
  const titlePreview = words.slice(0, 5).join(" ");
  const title = `Journal Entry: ${titlePreview}${words.length > 5 ? "..." : ""}`;
  
  return {
    id: String(Date.now()),
    title,
    content,
    date: new Date().toISOString(),
    isSaved: true,
    lastModified: new Date().toISOString(),
  };
} 
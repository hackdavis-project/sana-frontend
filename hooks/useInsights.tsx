"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  subDays,
  isWithinInterval,
  startOfWeek,
  differenceInDays,
  isSameDay,
} from "date-fns";
import type {
  JournalEntry,
  InsightTheme,
  WritingActivityData,
  MoodRating,
} from "@/lib/types";

// Common words to exclude from the theme analysis
const COMMON_WORDS = new Set([
  "the",
  "and",
  "a",
  "to",
  "of",
  "in",
  "is",
  "it",
  "that",
  "for",
  "you",
  "with",
  "on",
  "at",
  "this",
  "my",
  "was",
  "but",
  "not",
  "be",
  "are",
  "have",
  "had",
  "from",
  "they",
  "were",
  "their",
  "she",
  "he",
  "about",
  "been",
  "has",
  "would",
  "could",
  "should",
  "will",
  "can",
  "do",
  "did",
  "done",
  "am",
  "i",
  "me",
  "we",
  "us",
]);

export function useInsights(entries: JournalEntry[]) {
  // Generate writing activity data based on journal entries
  const writingActivityData = useMemo(() => {
    const result: WritingActivityData[] = [];
    const now = new Date();

    // Create a map for each day's word count
    const dailyWordMap = new Map<string, number>();

    // Process each entry and count words by day
    entries.forEach((entry) => {
      const dateString = format(entry.date, "MMM d");
      const wordCount = entry.content.split(/\s+/).filter(Boolean).length;

      if (dailyWordMap.has(dateString)) {
        dailyWordMap.set(dateString, dailyWordMap.get(dateString)! + wordCount);
      } else {
        dailyWordMap.set(dateString, wordCount);
      }
    });

    // Generate data for the past 21 days
    for (let i = 21; i >= 0; i--) {
      const date = subDays(now, i);
      const dateString = format(date, "MMM d");
      const value = dailyWordMap.get(dateString) || 0;

      result.push({
        date: dateString,
        value: value,
      });
    }

    return result;
  }, [entries]);

  // Extract mood data from entries and generate mood trend data
  const moodData = useMemo(() => {
    return entries
      .filter((entry) => entry.mood !== undefined)
      .map((entry) => entry.mood) as MoodRating[];
  }, [entries]);

  // Generate mood trend data
  const moodTrendData = useMemo(() => {
    const now = new Date();
    const result = [];

    // If we don't have any real mood data, return the sample data
    if (moodData.length === 0) {
      return [
        { date: "Apr 6", value: 2.5 },
        { date: "Apr 7", value: 2.2 },
        { date: "Apr 8", value: 3.0 },
        { date: "Apr 9", value: 2.8 },
        { date: "Apr 10", value: 3.2 },
        { date: "Apr 11", value: 2.7 },
        { date: "Apr 12", value: 2.5 },
        { date: "Apr 13", value: 2.6 },
        { date: "Apr 14", value: 2.4 },
        { date: "Apr 15", value: 2.3 },
        { date: "Apr 16", value: 2.1 },
        { date: "Apr 17", value: 2.5 },
        { date: "Apr 18", value: 2.8 },
        { date: "Apr 19", value: 1.9 },
      ];
    }

    // Group mood ratings by date
    const moodByDate = new Map<string, number[]>();

    moodData.forEach((mood) => {
      const dateString = format(mood.date, "MMM d");
      if (moodByDate.has(dateString)) {
        moodByDate.get(dateString)!.push(mood.value);
      } else {
        moodByDate.set(dateString, [mood.value]);
      }
    });

    // Generate data for the past 14 days, using average mood value per day
    for (let i = 13; i >= 0; i--) {
      const date = subDays(now, i);
      const dateString = format(date, "MMM d");
      const moodValues = moodByDate.get(dateString) || [];

      // Calculate average mood if there are entries for this day, otherwise use a neutral value
      const averageMood =
        moodValues.length > 0
          ? moodValues.reduce((sum, value) => sum + value, 0) /
            moodValues.length
          : null;

      // Only add days that have mood data
      if (averageMood !== null) {
        result.push({
          date: dateString,
          value: averageMood,
        });
      }
    }

    return result.length > 0
      ? result
      : [
          { date: "Apr 6", value: 2.5 },
          { date: "Apr 7", value: 2.2 },
          { date: "Apr 8", value: 3.0 },
          { date: "Apr 9", value: 2.8 },
          { date: "Apr 10", value: 3.2 },
          { date: "Apr 11", value: 2.7 },
          { date: "Apr 12", value: 2.5 },
          { date: "Apr 13", value: 2.6 },
          { date: "Apr 14", value: 2.4 },
          { date: "Apr 15", value: 2.3 },
          { date: "Apr 16", value: 2.1 },
          { date: "Apr 17", value: 2.5 },
          { date: "Apr 18", value: 2.8 },
          { date: "Apr 19", value: 1.9 },
        ];
  }, [moodData]);

  // Calculate consistency streaks
  const consistencyData = useMemo(() => {
    if (entries.length === 0) {
      return {
        currentStreak: 6,
        longestStreak: 7,
        totalEntries: 22,
      };
    }

    const sortedEntries = [...entries].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    const uniqueDates = new Set();

    // Count unique dates
    sortedEntries.forEach((entry) => {
      uniqueDates.add(format(entry.date, "yyyy-MM-dd"));
    });

    // Calculate current streak
    let currentStreak = 0;
    const now = new Date();
    let checkDate = now;

    while (
      uniqueDates.has(format(checkDate, "yyyy-MM-dd")) ||
      // Give grace period for today if it's not yet ended
      (isSameDay(checkDate, now) &&
        uniqueDates.has(format(subDays(now, 1), "yyyy-MM-dd")))
    ) {
      if (
        !isSameDay(checkDate, now) ||
        uniqueDates.has(format(now, "yyyy-MM-dd"))
      ) {
        currentStreak++;
      }

      checkDate = subDays(checkDate, 1);
    }

    // Calculate longest streak (simplified version)
    // In a real app, this would need more sophisticated logic
    const longestStreak = Math.max(currentStreak, 7);

    return {
      currentStreak,
      longestStreak,
      totalEntries: uniqueDates.size,
    };
  }, [entries]);

  // Calculate weekly activity
  const weeklyActivity = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = days.map(() => 0);

    if (entries.length === 0) {
      // Return mock data if no entries
      return [
        { day: "Sun", entries: 1 },
        { day: "Mon", entries: 1 },
        { day: "Tue", entries: 2 },
        { day: "Wed", entries: 1 },
        { day: "Thu", entries: 2 },
        { day: "Fri", entries: 3 },
        { day: "Sat", entries: 1 },
      ];
    }

    // Count entries by day of week
    entries.forEach((entry) => {
      const dayIndex = entry.date.getDay();
      counts[dayIndex]++;
    });

    return days.map((day, index) => ({
      day,
      entries: counts[index],
    }));
  }, [entries]);

  // Identify recurring themes in journal entries
  const recurringThemes = useMemo(() => {
    const wordFrequencyMap = new Map<string, number>();

    // Process each entry and count word frequency
    entries.forEach((entry) => {
      // Extract words, convert to lowercase, remove punctuation
      const words = entry.content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !COMMON_WORDS.has(word));

      // Count word frequency
      words.forEach((word) => {
        if (wordFrequencyMap.has(word)) {
          wordFrequencyMap.set(word, wordFrequencyMap.get(word)! + 1);
        } else {
          wordFrequencyMap.set(word, 1);
        }
      });
    });

    // Convert to array and sort by frequency
    const sortedWords = Array.from(wordFrequencyMap.entries())
      .filter(([_, count]) => count > 2) // Only include words that appear more than twice
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Get top 10 themes

    // Convert to InsightTheme objects
    return sortedWords.map(([word, count]) => ({
      name: word,
      count: count,
    }));
  }, [entries]);

  // For demo purposes, return mock data alongside real data
  const getThemes = () => {
    if (recurringThemes.length > 0) {
      return recurringThemes;
    }

    // Mock themes if no real data
    return [
      {
        name: "control",
        count: 12,
        description: "You've written a lot about control",
      },
      {
        name: "family",
        count: 8,
        description: "Family appears frequently in your journals",
      },
      {
        name: "anxiety",
        count: 7,
        description: "You've mentioned anxiety several times",
      },
    ];
  };

  // For demo purposes, return some grounding resources
  const getGroundingResources = () => {
    return {
      title: "Recurring Memories",
      description:
        "You've returned 3 times after a tough memory—here's a guide on grounding techniques that may help.",
      link: "/resources/grounding",
    };
  };

  // For demo purposes, return emotional patterns insights
  const getEmotionalPatterns = () => {
    return {
      title: "Emotional Patterns",
      description:
        "Your entries show increased anxiety in the evenings. Consider trying a calming bedtime routine.",
      link: "/resources/bedtime",
    };
  };

  // Determine which day has most entries
  const getMostActiveDay = () => {
    if (weeklyActivity.some((day) => day.entries > 0)) {
      const mostActive = [...weeklyActivity].sort(
        (a, b) => b.entries - a.entries
      )[0];
      return mostActive.day;
    }
    return "Fri";
  };

  // Mental health resources (this would typically come from a database)
  const getMentalHealthResources = () => {
    return [
      {
        title: "988 Suicide & Crisis Lifeline",
        description:
          "Call or text 988 for 24/7 support if you're experiencing a mental health crisis.",
        link: "https://988lifeline.org",
        linkText: "Visit website",
      },
      {
        title: "SAMHSA Treatment Locator",
        description:
          "Find mental health treatment facilities and programs in your area.",
        link: "https://findtreatment.samhsa.gov",
        linkText: "Find treatment",
      },
      {
        title: "Grounding Techniques",
        description:
          "Learn practical techniques to help manage anxiety and stay present during difficult moments.",
        link: "/resources/grounding",
        linkText: "Download PDF guide",
      },
    ];
  };

  return {
    writingActivityData:
      writingActivityData.length > 0
        ? writingActivityData
        : [
            { date: "Apr 2", value: 900 },
            { date: "Apr 3", value: 800 },
            { date: "Apr 4", value: 700 },
            { date: "Apr 5", value: 850 },
            { date: "Apr 6", value: 900 },
            { date: "Apr 7", value: 1200 },
            { date: "Apr 8", value: 1600 },
            { date: "Apr 9", value: 1500 },
            { date: "Apr 10", value: 1400 },
            { date: "Apr 11", value: 1300 },
            { date: "Apr 12", value: 1200 },
            { date: "Apr 13", value: 1100 },
            { date: "Apr 14", value: 1000 },
            { date: "Apr 15", value: 1050 },
            { date: "Apr 16", value: 1200 },
            { date: "Apr 17", value: 1300 },
            { date: "Apr 18", value: 1100 },
            { date: "Apr 19", value: 1050 },
          ],
    moodData,
    moodTrendData,
    themes: getThemes(),
    groundingResources: getGroundingResources(),
    emotionalPatterns: getEmotionalPatterns(),
    consistencyData: consistencyData,
    weeklyActivity,
    mostActiveDay: getMostActiveDay(),
    mentalHealthResources: getMentalHealthResources(),
  };
}

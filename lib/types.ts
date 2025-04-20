export type JournalEntry = {
  id: string
  date: Date
  title: string
  content: string
  preview: string
  mood?: MoodRating // Optional mood rating for each entry
}

export type MoodRating = {
  date: Date
  value: number // 1-5 scale
  label?: string // Optional label like "Very Bad", "Bad", "Okay", "Good", "Very Good"
}

export type InsightTheme = {
  name: string
  count: number
  description?: string
}

export type WritingActivityData = {
  date: string
  value: number
}

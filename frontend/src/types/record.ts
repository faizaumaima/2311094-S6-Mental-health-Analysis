export const MOODS = ["happy", "calm", "neutral", "anxious", "sad", "angry"] as const

export type Mood = (typeof MOODS)[number]

export interface RecordInput {
  mood: Mood
  stress_level: number
  sleep_hours: number
  record_date: string
  notes: string | null
}

export interface WellBeingRecord extends RecordInput {
  id: number
  created_at: string
}
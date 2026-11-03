import { useState } from "react"
import { MOODS } from "../types/record"
import type { Mood, RecordInput, WellBeingRecord } from "../types/record"

interface Props {
  initial?: WellBeingRecord
  onSubmit: (input: RecordInput) => Promise<void>
  onCancel?: () => void
}

export default function RecordForm({ initial, onSubmit, onCancel }: Props) {
  const [mood, setMood] = useState<Mood>(initial?.mood ?? "happy")
  const [stress, setStress] = useState(initial?.stress_level ?? 5)
  const [sleep, setSleep] = useState(initial?.sleep_hours ?? 7)
  const [date, setDate] = useState(
    initial?.record_date ?? new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await onSubmit({
        mood,
        stress_level: Number(stress),
        sleep_hours: Number(sleep),
        record_date: date,
        notes: notes.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Mood
        <select value={mood} onChange={(e) => setMood(e.target.value as Mood)}>
          {MOODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>

      <label>
        Stress level (1-10)
        <input
          type="number"
          value={stress}
          onChange={(e) => setStress(Number(e.target.value))}
          required
        />
      </label>

      <label>
        Sleep hours (0-24)
        <input
          type="number"
          step="0.5"
          value={sleep}
          onChange={(e) => setSleep(Number(e.target.value))}
          required
        />
      </label>

      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <label>
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        />
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : initial ? "Save changes" : "Add record"}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  )
}
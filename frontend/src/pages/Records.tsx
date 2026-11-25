
import { useCallback, useEffect, useState } from "react"
import RecordForm from "../components/RecordForm"
import RecordList from "../components/RecordList"
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/records"
import type { RecordInput, WellBeingRecord } from "../types/record"

export default function Records() {
  const [records, setRecords] = useState<WellBeingRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<WellBeingRecord | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<WellBeingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRecords = useCallback(async () => {
    try {
      setError("")
      const data = await listRecords()
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  async function handleSubmit(input: RecordInput) {
    try {
      setError("")

      if (editingRecord) {
        await updateRecord(editingRecord.id, input)
        setEditingRecord(null)
      } else {
        await createRecord(input)
      }

      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record")
      throw err
    }
  }

  async function handleView(id: number) {
    try {
      setError("")
      const record = await getRecord(id)
      setSelectedRecord(record)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load record")
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return
    }

    try {
      setError("")
      await deleteRecord(id)

      if (selectedRecord?.id === id) {
        setSelectedRecord(null)
      }

      if (editingRecord?.id === id) {
        setEditingRecord(null)
      }

      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record")
    }
  }

  return (
    <section>
      <h2>My Well-Being Records</h2>

      {error && <p className="error">{error}</p>}

      <RecordForm
        key={editingRecord?.id ?? "new"}
        initial={editingRecord ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => setEditingRecord(null)}
      />

      <h3>My Records</h3>

      {loading ? (
        <p>Loading records...</p>
      ) : (
        <RecordList
          records={records}
          onView={handleView}
          onEdit={setEditingRecord}
          onDelete={handleDelete}
        />
      )}

      {selectedRecord && (
        <section>
          <h3>Record Details</h3>
          <p><strong>Date:</strong> {selectedRecord.record_date}</p>
          <p><strong>Mood:</strong> {selectedRecord.mood}</p>
          <p><strong>Stress level:</strong> {selectedRecord.stress_level}</p>
          <p><strong>Sleep hours:</strong> {selectedRecord.sleep_hours}</p>
          <p><strong>Notes:</strong> {selectedRecord.notes || "No notes"}</p>
          <button onClick={() => setSelectedRecord(null)}>
            Close Details
          </button>
        </section>
      )}
    </section>
  )
}


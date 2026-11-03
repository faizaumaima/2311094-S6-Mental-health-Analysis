import { useCallback, useEffect, useState } from "react"
import RecordForm from "./components/RecordForm"
import RecordList from "./components/RecordList"
import {
  createRecord, deleteRecord, getRecord, listRecords, updateRecord,
} from "./services/api"
import type { RecordInput, WellBeingRecord } from "./types/record"

export default function App() {
  const [records, setRecords] = useState<WellBeingRecord[]>([])
  const [selected, setSelected] = useState<WellBeingRecord | null>(null)
  const [editing, setEditing] = useState<WellBeingRecord | null>(null)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    try {
      setRecords(await listRecords())
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load records")
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreate(input: RecordInput) {
    await createRecord(input)
    await refresh()
  }

  async function handleUpdate(input: RecordInput) {
    if (!editing) return
    await updateRecord(editing.id, input)
    setEditing(null)
    setSelected(null)
    await refresh()
  }

  async function handleView(id: number) {
    try {
      setSelected(await getRecord(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load record")
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this record?")) return
    try {
      await deleteRecord(id)
      if (selected?.id === id) setSelected(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record")
    }
  }

  return (
    <main>
      <h1>Mental Health Analysis</h1>

      <section>
        <h2>{editing ? `Edit record #${editing.id}` : "New record"}</h2>
        {editing ? (
          <RecordForm
            key={editing.id}
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <RecordForm onSubmit={handleCreate} />
        )}
      </section>

      {error && <p className="error">{error}</p>}

      <section>
        <h2>Records</h2>
        <RecordList
          records={records}
          onView={handleView}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      </section>

      {selected && (
        <section>
          <h2>Record #{selected.id}</h2>
          <p>Date: {selected.record_date}</p>
          <p>Mood: {selected.mood}</p>
          <p>Stress: {selected.stress_level}/10</p>
          <p>Sleep: {selected.sleep_hours} hours</p>
          <p>Note: {selected.notes ?? "(none)"}</p>
          <p>Created: {new Date(selected.created_at).toLocaleString()}</p>
          <button onClick={() => setSelected(null)}>Close</button>
        </section>
      )}
    </main>
  )
}
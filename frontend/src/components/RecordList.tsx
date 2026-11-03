import type { WellBeingRecord } from "../types/record"

interface Props {
  records: WellBeingRecord[]
  onView: (id: number) => void
  onEdit: (record: WellBeingRecord) => void
  onDelete: (id: number) => void
}

export default function RecordList({ records, onView, onEdit, onDelete }: Props) {
  if (records.length === 0) return <p>No records yet.</p>
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Mood</th><th>Stress</th><th>Sleep (h)</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.id}>
            <td>{r.record_date}</td>
            <td>{r.mood}</td>
            <td>{r.stress_level}</td>
            <td>{r.sleep_hours}</td>
            <td>
              <button onClick={() => onView(r.id)}>View</button>
              <button onClick={() => onEdit(r)}>Edit</button>
              <button onClick={() => onDelete(r.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
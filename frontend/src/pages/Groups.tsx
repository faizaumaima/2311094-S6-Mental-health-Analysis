
import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import {
  listGroups,
  createGroup,
  addGroupMember,
  listGroupRecords,
  createGroupRecord,
  deleteGroup,
} from "../services/groups"
import type { Group, GroupRecord } from "../types/groups"
import type { Mood, RecordInput } from "../types/record"

const moods: Mood[] = [
  "happy",
  "calm",
  "neutral",
  "anxious",
  "sad",
  "angry",
]

export default function Groups() {
  const { user } = useAuth()

  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [records, setRecords] = useState<GroupRecord[]>([])
  const [groupName, setGroupName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [permissions, setPermissions] = useState({
    can_create: false,
    can_edit: false,
    can_assign: false,
  })
  const [record, setRecord] = useState<RecordInput>({
    mood: "neutral",
    stress_level: 5,
    sleep_hours: 8,
    record_date: new Date().toISOString().slice(0, 10),
    notes: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const loadGroups = useCallback(async () => {
    try {
      setError("")
      const data = await listGroups()
      setGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  async function handleSelectGroup(group: Group) {
    setSelectedGroup(group)
    setRecords([])
    setMessage("")
    try {
      setError("")
      const data = await listGroupRecords(group.id)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group records")
    }
  }

  async function handleCreateGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setError("")
      setMessage("")
      await createGroup({ name: groupName.trim() })
      setGroupName("")
      setMessage("Group created successfully.")
      await loadGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group")
    }
  }

  async function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedGroup) return

    try {
      setError("")
      setMessage("")
      await addGroupMember(selectedGroup.id, {
        email: memberEmail.trim(),
        ...permissions,
      })
      setMemberEmail("")
      setPermissions({
        can_create: false,
        can_edit: false,
        can_assign: false,
      })
      setMessage("Member added successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member")
    }
  }

  async function handleCreateRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedGroup) return

    try {
      setError("")
      setMessage("")
      await createGroupRecord(selectedGroup.id, record)
      const data = await listGroupRecords(selectedGroup.id)
      setRecords(data)
      setMessage("Group record created successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record")
    }
  }

  async function handleDeleteGroup(group: Group) {
    if (!window.confirm(`Delete group "${group.name}" and its records?`)) return

    try {
      setError("")
      setMessage("")
      await deleteGroup(group.id)
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(null)
        setRecords([])
      }
      setMessage("Group deleted successfully.")
      await loadGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group")
    }
  }

  const isOwner = selectedGroup?.owner_id === user?.id

  return (
    <section>
      <h2>Groups</h2>
      <p>Create groups and share well-being records with other members.</p>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <h3>Create a Group</h3>
      <form onSubmit={handleCreateGroup}>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          minLength={1}
          maxLength={100}
          required
        />
        <button type="submit">Create Group</button>
      </form>

      <h3>My Groups</h3>
      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <button type="button" onClick={() => handleSelectGroup(group)}>
                {group.name}
              </button>
              {group.owner_id === user?.id && (
                <button type="button" onClick={() => handleDeleteGroup(group)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedGroup && (
        <div>
          <hr />
          <h3>{selectedGroup.name}</h3>
          <p>Group ID: {selectedGroup.id}</p>

          {isOwner && (
            <>
              <h4>Add a Member</h4>
              <form onSubmit={handleAddMember}>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Member email"
                  required
                />

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.can_create}
                    onChange={(e) =>
                      setPermissions({ ...permissions, can_create: e.target.checked })
                    }
                  />
                  Can create records
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.can_edit}
                    onChange={(e) =>
                      setPermissions({ ...permissions, can_edit: e.target.checked })
                    }
                  />
                  Can edit records
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.can_assign}
                    onChange={(e) =>
                      setPermissions({ ...permissions, can_assign: e.target.checked })
                    }
                  />
                  Can assign records
                </label>

                <button type="submit">Add Member</button>
              </form>
            </>
          )}

          <h4>Create a Group Record</h4>
          <form onSubmit={handleCreateRecord}>
            <label>
              Mood
              <select
                value={record.mood}
                onChange={(e) =>
                  setRecord({ ...record, mood: e.target.value as Mood })
                }
              >
                {moods.map((mood) => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </label>

            <label>
              Stress level (1–10)
              <input
                type="number"
                min="1"
                max="10"
                value={record.stress_level}
                onChange={(e) =>
                  setRecord({ ...record, stress_level: Number(e.target.value) })
                }
                required
              />
            </label>

            <label>
              Sleep hours
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={record.sleep_hours}
                onChange={(e) =>
                  setRecord({ ...record, sleep_hours: Number(e.target.value) })
                }
                required
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={record.record_date}
                onChange={(e) =>
                  setRecord({ ...record, record_date: e.target.value })
                }
                required
              />
            </label>

            <label>
              Notes
              <textarea
                value={record.notes ?? ""}
                maxLength={1000}
                onChange={(e) =>
                  setRecord({ ...record, notes: e.target.value })
                }
              />
            </label>

            <button type="submit">Add Group Record</button>
          </form>

          <h4>Group Records</h4>
          {records.length === 0 ? (
            <p>No records found in this group.</p>
          ) : (
            <ul>
              {records.map((item) => (
                <li key={item.id}>
                  <strong>{item.mood}</strong> — Stress: {item.stress_level}/10
                  — Sleep: {item.sleep_hours} hours
                  — Date: {item.record_date}
                  {item.notes && <p>{item.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}


import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import {
  listGroups,
  createGroup,
  addGroupMember,
  listGroupMembers,
  renameGroup,
  updateMemberPermissions,
  removeGroupMember,
  listGroupRecords,
  createGroupRecord,
  updateGroupRecord,
  assignGroupRecord,
  deleteGroup,
} from "../services/groups"
import type { Group, GroupMember, GroupRecord } from "../types/groups"
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
  const [members, setMembers] = useState<GroupMember[]>([])
  const [newGroupName, setNewGroupName] = useState("")
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
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [editRecord, setEditRecord] = useState<RecordInput | null>(null)
  const [assignSelections, setAssignSelections] = useState<Record<number, number>>({})
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
    setMembers([])
    setMessage("")
    try {
      setError("")
      const data = await listGroupRecords(group.id)
      setRecords(data)
      const memberData = await listGroupMembers(group.id)
      setMembers(memberData)
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
      const memberData = await listGroupMembers(selectedGroup.id)
      setMembers(memberData)
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

  async function handleUpdateMemberPermissions(
    member: GroupMember,
    data: Pick<GroupMember, "can_create" | "can_edit" | "can_assign">,
  ) {
    if (!selectedGroup) return

    try {
      setError("")
      setMessage("")
      await updateMemberPermissions(selectedGroup.id, member.user_id, data)
      const memberData = await listGroupMembers(selectedGroup.id)
      setMembers(memberData)
      setMessage("Member permissions updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update permissions")
    }
  }

  async function handleRemoveMember(member: GroupMember) {
    if (!selectedGroup) return
    if (!window.confirm(`Remove ${member.email} from this group?`)) return

    try {
      setError("")
      setMessage("")
      await removeGroupMember(selectedGroup.id, member.user_id)
      const memberData = await listGroupMembers(selectedGroup.id)
      setMembers(memberData)
      setMessage("Member removed successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member")
    }
  }
  function startEditingRecord(item: GroupRecord) {
    setEditingRecordId(item.id)
    setEditRecord({
      mood: item.mood,
      stress_level: item.stress_level,
      sleep_hours: item.sleep_hours,
      record_date: item.record_date,
      notes: item.notes ?? "",
    })
  }

  async function handleUpdateRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedGroup || !editRecord || editingRecordId === null) return

    try {
      setError("")
      setMessage("")
      await updateGroupRecord(selectedGroup.id, editingRecordId, editRecord)
      const data = await listGroupRecords(selectedGroup.id)
      setRecords(data)
      setEditingRecordId(null)
      setEditRecord(null)
      setMessage("Group record updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record")
    }
  }

  async function handleAssignRecord(recordId: number) {
    if (!selectedGroup) return

    const assignedTo = assignSelections[recordId]
    if (!assignedTo) {
      setError("Please select a group member.")
      return
    }

    try {
      setError("")
      setMessage("")
      await assignGroupRecord(selectedGroup.id, recordId, {
        assigned_to: assignedTo,
      })
      setMessage("Record assigned successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign record")
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

  async function handleRenameGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedGroup) return

    try {
      setError("")
      setMessage("")
      const updatedGroup = await renameGroup(
        selectedGroup.id,
        newGroupName.trim(),
      )
      setSelectedGroup(updatedGroup)
      setNewGroupName("")
      setMessage("Group renamed successfully.")
      await loadGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename group")
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
    setMembers([])
      }
      setMessage("Group deleted successfully.")
      await loadGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group")
    }
  }

  const isOwner = selectedGroup?.owner_id === user?.id
  const currentMember = members.find((member) => member.user_id === user?.id)
  const canEditRecords = isOwner || currentMember?.can_edit === true
  const canAssignRecords = isOwner || currentMember?.can_assign === true
  const canCreateRecords = isOwner || currentMember?.can_create === true

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
            <form onSubmit={handleRenameGroup}>
              <label>
                New group name
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter new group name"
                  minLength={1}
                  maxLength={100}
                  required
                />
              </label>
              <button type="submit">Rename Group</button>
            </form>
          )}
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

          {isOwner && (
            <>
              <h4>Group Members</h4>
              {members.length === 0 ? (
                <p>No members found.</p>
              ) : (
                <ul>
                  {members.map((member) => (
                    <li key={member.user_id}>
                      <strong>{member.name}</strong> ({member.email})

                      <label>
                        <input
                          type="checkbox"
                          checked={member.can_create}
                          onChange={(e) =>
                            handleUpdateMemberPermissions(member, {
                              can_create: e.target.checked,
                              can_edit: member.can_edit,
                              can_assign: member.can_assign,
                            })
                          }
                        />
                        Can create records
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={member.can_edit}
                          onChange={(e) =>
                            handleUpdateMemberPermissions(member, {
                              can_create: member.can_create,
                              can_edit: e.target.checked,
                              can_assign: member.can_assign,
                            })
                          }
                        />
                        Can edit records
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={member.can_assign}
                          onChange={(e) =>
                            handleUpdateMemberPermissions(member, {
                              can_create: member.can_create,
                              can_edit: member.can_edit,
                              can_assign: e.target.checked,
                            })
                          }
                        />
                        Can assign records
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                      >
                        Remove Member
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {canCreateRecords && (
            <>
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
              Stress level (1-10)
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
            </>
          )}

          <h4>Group Records</h4>
          {records.length === 0 ? (
            <p>No records found in this group.</p>
          ) : (
            <ul>
              {records.map((item) => (
                <li key={item.id}>
                  {editingRecordId === item.id && editRecord ? (
                    <form onSubmit={handleUpdateRecord}>
                      <label>
                        Mood
                        <select value={editRecord.mood}
                          onChange={(e) => setEditRecord({ ...editRecord, mood: e.target.value as Mood })}>
                          {moods.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
                        </select>
                      </label>
                      <label>
                        Stress Level
                        <input type="number" min="1" max="10" value={editRecord.stress_level}
                          onChange={(e) => setEditRecord({ ...editRecord, stress_level: Number(e.target.value) })} />
                      </label>
                      <label>
                        Sleep Hours
                        <input type="number" min="0" max="24" step="0.5" value={editRecord.sleep_hours}
                          onChange={(e) => setEditRecord({ ...editRecord, sleep_hours: Number(e.target.value) })} />
                      </label>
                      <label>
                        Date
                        <input type="date" value={editRecord.record_date}
                          onChange={(e) => setEditRecord({ ...editRecord, record_date: e.target.value })} />
                      </label>
                      <label>
                        Notes
                        <textarea value={editRecord.notes ?? ""} maxLength={1000}
                          onChange={(e) => setEditRecord({ ...editRecord, notes: e.target.value })} />
                      </label>
                      <button type="submit">Save Changes</button>
                      <button type="button" onClick={() => {
                        setEditingRecordId(null)
                        setEditRecord(null)
                      }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <strong>{item.mood}</strong> - Stress: {item.stress_level}/10
                      - Sleep: {item.sleep_hours} hours
                      - Date: {item.record_date}
                      {item.notes && <p>{item.notes}</p>}
                      {canEditRecords && (
                        <button type="button" onClick={() => startEditingRecord(item)}>Edit</button>
                      )}
                    </>
                  )}
                  {canAssignRecords && (
                    <div>
                      <label>
                        Assign to:
                        <select value={assignSelections[item.id] ?? ""}
                          onChange={(e) => setAssignSelections({
                            ...assignSelections,
                            [item.id]: Number(e.target.value),
                          })}>
                          <option value="">Select a member</option>
                          {members.map((member) => (
                            <option key={member.user_id} value={member.user_id}>
                              {member.name} ({member.email})
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="button" disabled={members.length === 0}
                        onClick={() => handleAssignRecord(item.id)}>Assign Record</button>
                      {members.length === 0 && <p>No group members available to assign records.</p>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
</div>
      )}
    </section>
  )
}

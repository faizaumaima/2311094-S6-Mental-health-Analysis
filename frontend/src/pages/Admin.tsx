
import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import {
  getAdminStats,
  listAdminUsers,
  banUser,
  unbanUser,
  changeUserRole,
  listAllAdminRecords,
  deleteAdminRecord,
  listAllAdminGroups,
  deleteAdminGroup,
  listAuditLogs,
  exportAdminUsers,
} from "../services/admin"
import type {
  AdminStats,
  AdminRecord,
  AdminGroup,
  AuditLog,
} from "../types/admin"
import type { User } from "../types/auth"

export default function Admin() {
  const { user: currentUser } = useAuth()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [records, setRecords] = useState<AdminRecord[]>([])
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [banReason, setBanReason] = useState("")
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setError("")
      const [statsData, usersData, recordsData, groupsData, logsData] =
        await Promise.all([
          getAdminStats(),
          listAdminUsers(page, 10, search),
          listAllAdminRecords(),
          listAllAdminGroups(),
          listAuditLogs(1),
        ])

      setStats(statsData)
      setUsers(usersData.items)
      setTotalUsers(usersData.total)
      setRecords(recordsData)
      setGroups(groupsData)
      setLogs(logsData.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleBan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedUser === null || selectedUser === currentUser?.id) return

    try {
      setError("")
      setMessage("")
      await banUser(selectedUser, { reason: banReason })
      setBanReason("")
      setSelectedUser(null)
      setMessage("User banned successfully.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ban user")
    }
  }

  async function handleUnban(userId: number) {
    if (userId === currentUser?.id) return

    try {
      setError("")
      setMessage("")
      await unbanUser(userId)
      setMessage("User unbanned successfully.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unban user")
    }
  }

  async function handleRoleChange(targetUser: User) {
    if (targetUser.id === currentUser?.id) return

    const newRole = targetUser.role === "admin" ? "user" : "admin"

    if (!window.confirm(`Change ${targetUser.name}'s role to ${newRole}?`)) return

    try {
      setError("")
      setMessage("")
      await changeUserRole(targetUser.id, { role: newRole })
      setMessage("User role updated successfully.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  async function handleDeleteRecord(recordId: number) {
    if (!window.confirm("Delete this record permanently?")) return

    try {
      setError("")
      setMessage("")
      await deleteAdminRecord(recordId)
      setMessage("Record deleted successfully.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record")
    }
  }

  async function handleDeleteGroup(groupId: number) {
    if (!window.confirm("Delete this group and its records permanently?")) return

    try {
      setError("")
      setMessage("")
      await deleteAdminGroup(groupId)
      setMessage("Group deleted successfully.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group")
    }
  }

  async function handleExport() {
    try {
      setError("")
      await exportAdminUsers()
      setMessage("CSV export started.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export users")
    }
  }

  if (loading) return <p>Loading admin dashboard...</p>

  return (
    <section>
      <h2>Admin Dashboard</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <h3>Statistics</h3>
      {stats && (
        <div>
          <p>Total users: {stats.users}</p>
          <p>Banned users: {stats.banned_users}</p>
          <p>Total records: {stats.records}</p>
          <p>Total groups: {stats.groups}</p>
          <p>New users (7 days): {stats.new_users_7d}</p>
          <p>New records (7 days): {stats.new_records_7d}</p>
        </div>
      )}

      <hr />
      <h3>User Management</h3>

      <input
        type="search"
        value={search}
        placeholder="Search by email"
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />

      <button type="button" onClick={handleExport}>
        Export Users CSV
      </button>

      <p>Total matching users: {totalUsers}</p>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div>
          {users.map((targetUser) => {
            const isCurrentUser = targetUser.id === currentUser?.id
            const isAdmin = targetUser.role === "admin"
            const cannotBan = isCurrentUser || isAdmin

            return (
              <article key={targetUser.id}>
                <p>
                  <strong>
                    {targetUser.name}
                    {isCurrentUser ? " (You)" : ""}
                  </strong>
                </p>
                <p>Email: {targetUser.email}</p>
                <p>Role: {targetUser.role}</p>
                <p>Status: {targetUser.is_active ? "Active" : "Banned"}</p>

                <button
                  type="button"
                  disabled={isCurrentUser}
                  onClick={() => handleRoleChange(targetUser)}
                  title={isCurrentUser ? "You cannot change your own role" : ""}
                >
                  Change Role
                </button>

                {targetUser.is_active ? (
                  <button
                    type="button"
                    disabled={cannotBan}
                    onClick={() => setSelectedUser(targetUser.id)}
                    title={cannotBan ? "You cannot ban yourself or another admin" : ""}
                  >
                    Ban User
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isCurrentUser}
                    onClick={() => handleUnban(targetUser.id)}
                  >
                    Unban User
                  </button>
                )}

                {selectedUser === targetUser.id && (
                  <form onSubmit={handleBan}>
                    <input
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Reason for ban"
                      minLength={1}
                      maxLength={500}
                      required
                    />
                    <button type="submit">Confirm Ban</button>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
                <hr />
              </article>
            )
          })}
        </div>
      )}

      <button
        type="button"
        disabled={page <= 1}
        onClick={() => setPage((current) => current - 1)}
      >
        Previous
      </button>
      <span> Page {page} </span>
      <button
        type="button"
        disabled={page * 10 >= totalUsers}
        onClick={() => setPage((current) => current + 1)}
      >
        Next
      </button>

      <hr />
      <h3>All Records</h3>
      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        records.map((record) => (
          <article key={record.id}>
            <p>
              #{record.id} - {record.mood} - Stress: {record.stress_level}/10
            </p>
            <p>Date: {record.record_date}</p>
            <button
              type="button"
              onClick={() => handleDeleteRecord(record.id)}
            >
              Delete Record
            </button>
            <hr />
          </article>
        ))
      )}

      <h3>All Groups</h3>
      {groups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        groups.map((group) => (
          <article key={group.id}>
            <p>
              #{group.id} - {group.name} - Owner ID: {group.owner_id}
            </p>
            <button
              type="button"
              onClick={() => handleDeleteGroup(group.id)}
            >
              Delete Group
            </button>
            <hr />
          </article>
        ))
      )}

      <h3>Audit Logs</h3>
      {logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        logs.map((log) => (
          <article key={log.id}>
            <p>Action: {log.action}</p>
            <p>Actor user ID: {log.actor_user_id}</p>
            <p>Target user ID: {log.target_user_id ?? "N/A"}</p>
            <p>Details: {log.details ?? "N/A"}</p>
            <p>Date: {new Date(log.created_at).toLocaleString()}</p>
            <hr />
          </article>
        ))
      )}
    </section>
  )
}

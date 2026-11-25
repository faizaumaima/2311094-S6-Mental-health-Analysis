
import { useEffect, useState, type FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import {
  updateProfile,
  changePassword,
  listSessions,
  revokeSession,
} from "../services/profile"
import type { SessionInfo } from "../types/auth"

export default function Profile() {
  const { user, refreshUser } = useAuth()

  const [name, setName] = useState(user?.name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await listSessions()
        setSessions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions")
      }
    }

    loadSessions()
  }, [])

  async function handleProfileUpdate(e: FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      await updateProfile(name)
      await refreshUser()
      setMessage("Profile updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })

      setCurrentPassword("")
      setNewPassword("")
      setMessage("Password changed successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleRevokeSession(id: number) {
    try {
      setError("")
      await revokeSession(id)
      setSessions((previous) => previous.filter((session) => session.id !== id))
      setMessage("Session revoked successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session")
    }
  }

  return (
    <section>
      <h2>My Profile</h2>

      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}

      <h3>Account Information</h3>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Role:</strong> {user?.role}</p>
      <p><strong>Account status:</strong> {user?.is_active ? "Active" : "Inactive"}</p>

      <form onSubmit={handleProfileUpdate}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          Update Profile
        </button>
      </form>

      <h3>Change Password</h3>

      <form onSubmit={handlePasswordChange}>
        <label>
          Current Password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          Change Password
        </button>
      </form>

      <h3>Active Sessions</h3>

      {sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id}>
              <p>Created: {new Date(session.created_at).toLocaleString()}</p>
              <p>Expires: {new Date(session.expires_at).toLocaleString()}</p>
              <button onClick={() => handleRevokeSession(session.id)}>
                Revoke Session
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

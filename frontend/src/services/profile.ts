
import type {
  User,
  SessionInfo,
  PasswordChangeInput,
} from "../types/auth"
import { request } from "./http"

export function updateProfile(name: string): Promise<User> {
  return request<User>("/auth/me", {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export function changePassword(
  input: PasswordChangeInput,
): Promise<void> {
  return request<void>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function listSessions(): Promise<SessionInfo[]> {
  return request<SessionInfo[]>("/users/me/sessions")
}

export function revokeSession(sessionId: number): Promise<void> {
  return request<void>(`/users/me/sessions/${sessionId}`, {
    method: "DELETE",
  })
}

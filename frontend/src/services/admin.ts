import { request, getAccessToken } from "./http"
import type {
  AdminUserList,
  AdminStats,
  BanInput,
  RoleInput,
  RoleUpdateResponse,
  AdminRecord,
  AdminGroup,
  AuditLogList,
} from "../types/admin"
import type { User } from "../types/auth"

const BASE = "/admin"

export function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>(`${BASE}/stats`)
}

export function listAdminUsers(
  page = 1,
  pageSize = 10,
  q = "",
  role = "",
  isActive?: boolean,
): Promise<AdminUserList> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (q.trim()) params.set("q", q.trim())
  if (role) params.set("role", role)
  if (isActive !== undefined) {
    params.set("is_active", String(isActive))
  }

  return request<AdminUserList>(
    `${BASE}/users?${params.toString()}`,
  )
}

export function banUser(
  userId: number,
  data: BanInput,
): Promise<User> {
  return request<User>(`${BASE}/users/${userId}/ban`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function unbanUser(userId: number): Promise<User> {
  return request<User>(`${BASE}/users/${userId}/unban`, {
    method: "PATCH",
  })
}

export function changeUserRole(
  userId: number,
  data: RoleInput,
): Promise<RoleUpdateResponse> {
  return request<RoleUpdateResponse>(
    `${BASE}/users/${userId}/role`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  )
}

export function listAllAdminRecords(
  groupId?: number,
  ownerId?: number,
): Promise<AdminRecord[]> {
  const params = new URLSearchParams()

  if (groupId !== undefined) {
    params.set("group_id", String(groupId))
  }
  if (ownerId !== undefined) {
    params.set("owner_id", String(ownerId))
  }

  const query = params.toString()
  return request<AdminRecord[]>(
    `${BASE}/records${query ? `?${query}` : ""}`,
  )
}

export function deleteAdminRecord(recordId: number): Promise<void> {
  return request<void>(`${BASE}/records/${recordId}`, {
    method: "DELETE",
  })
}

export function listAllAdminGroups(): Promise<AdminGroup[]> {
  return request<AdminGroup[]>(`${BASE}/groups`)
}

export function deleteAdminGroup(groupId: number): Promise<void> {
  return request<void>(`${BASE}/groups/${groupId}`, {
    method: "DELETE",
  })
}

export function listAuditLogs(
  page = 1,
  action = "",
  userId?: number,
): Promise<AuditLogList> {
  const params = new URLSearchParams({
    page: String(page),
  })

  if (action) params.set("action", action)
  if (userId !== undefined) {
    params.set("user_id", String(userId))
  }

  return request<AuditLogList>(
    `${BASE}/audit-log?${params.toString()}`,
  )
}

export async function exportAdminUsers(): Promise<void> {
  const response = await fetch("/api/admin/users/export", {
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to export users")
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "users.csv"
  link.click()

  URL.revokeObjectURL(url)
}
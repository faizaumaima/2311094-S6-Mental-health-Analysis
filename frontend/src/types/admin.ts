import type { User } from "./auth"
import type { Group } from "./groups"
import type { WellBeingRecord } from "./record"

export interface AdminUserList {
  items: User[]
  total: number
  page: number
  page_size: number
}

export interface AdminStats {
  users: number
  banned_users: number
  records: number
  groups: number
  new_users_7d: number
  new_records_7d: number
}

export interface BanInput {
  reason: string
}

export interface RoleInput {
  role: "user" | "admin"
}

export interface RoleUpdateResponse {
  id: number
  role: string
}

export interface AuditLog {
  id: number
  actor_user_id: number
  action: string
  target_user_id: number | null
  details: string | null
  created_at: string
}

export interface AuditLogList {
  items: AuditLog[]
  total: number
  page: number
  page_size: number
}

export type AdminRecord = WellBeingRecord
export type AdminGroup = Group
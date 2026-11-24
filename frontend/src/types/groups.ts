import type { RecordInput, WellBeingRecord } from "./record"

export interface Group {
  id: number
  name: string
  owner_id: number
  created_at: string
}

export interface GroupMembership {
  id: number
  group_id: number
  user_id: number
  can_create: boolean
  can_edit: boolean
  can_assign: boolean
  created_at: string
}

export interface GroupRecordAssignment {
  id: number
  record_id: number
  group_id: number
  assigned_to: number
  assigned_by: number
  created_at: string
}

export interface GroupInput {
  name: string
}

export interface MemberInput {
  email: string
  can_create: boolean
  can_edit: boolean
  can_assign: boolean
}

export interface PermissionsInput {
  can_create: boolean
  can_edit: boolean
  can_assign: boolean
}

export interface AssignInput {
  assigned_to: number
}

export type GroupRecordInput = RecordInput
export type GroupRecord = WellBeingRecord
import { request } from "./http"
import type {
  Group,
  GroupMember,
  GroupInput,
  MemberInput,
  PermissionsInput,
  AssignInput,
  GroupRecord,
  GroupRecordInput,
  GroupRecordAssignment,
} from "../types/groups"

const BASE = "/groups"

export function listGroups(): Promise<Group[]> {
  return request<Group[]>(`${BASE}/`)
}

export function listGroupMembers(groupId: number): Promise<GroupMember[]> {
  return request<GroupMember[]>(`${BASE}/${groupId}/members`)
}

export function renameGroup(groupId: number, name: string): Promise<Group> {
  return request<Group>(`${BASE}/${groupId}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}
export function createGroup(data: GroupInput): Promise<Group> {
  return request<Group>(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function addGroupMember(
  groupId: number,
  data: MemberInput,
): Promise<unknown> {
  return request(`${BASE}/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateMemberPermissions(
  groupId: number,
  userId: number,
  data: PermissionsInput,
): Promise<unknown> {
  return request(`${BASE}/${groupId}/members/${userId}/permissions`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function removeGroupMember(
  groupId: number,
  userId: number,
): Promise<void> {
  return request<void>(`${BASE}/${groupId}/members/${userId}`, {
    method: "DELETE",
  })
}

export function listGroupRecords(groupId: number): Promise<GroupRecord[]> {
  return request<GroupRecord[]>(`${BASE}/${groupId}/records`)
}

export function createGroupRecord(
  groupId: number,
  data: GroupRecordInput,
): Promise<GroupRecord> {
  return request<GroupRecord>(`${BASE}/${groupId}/records`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateGroupRecord(
  groupId: number,
  recordId: number,
  data: Partial<GroupRecordInput>,
): Promise<GroupRecord> {
  return request<GroupRecord>(
    `${BASE}/${groupId}/records/${recordId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  )
}

export function assignGroupRecord(
  groupId: number,
  recordId: number,
  data: AssignInput,
): Promise<GroupRecordAssignment> {
  return request<GroupRecordAssignment>(
    `${BASE}/${groupId}/records/${recordId}/assign`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  )
}

export function deleteGroup(groupId: number): Promise<void> {
  return request<void>(`${BASE}/${groupId}`, {
    method: "DELETE",
  })
}

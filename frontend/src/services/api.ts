import type { RecordInput, WellBeingRecord } from "../types/record"

const BASE = "/api/records"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`

    try {
      const body = await res.json()

      if (typeof body.detail === "string") {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((d: { loc: (string | number)[]; msg: string }) =>
            `${d.loc[d.loc.length - 1]}: ${d.msg}`)
          .join("; ")
      }
    } catch {
      // Keep the generic message
    }

    throw new Error(message)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const listRecords = () =>
  request<WellBeingRecord[]>(`${BASE}/`)

export const getRecord = (id: number) =>
  request<WellBeingRecord>(`${BASE}/${id}`)

export const createRecord = (input: RecordInput) =>
  request<WellBeingRecord>(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  })

export const updateRecord = (id: number, input: Partial<RecordInput>) =>
  request<WellBeingRecord>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })

export const deleteRecord = (id: number) =>
  request<void>(`${BASE}/${id}`, { method: "DELETE" })

import type {
  RecordInput,
  WellBeingRecord,
} from "../types/record"
import { request } from "./http"

const BASE = "/records"

export const listRecords = () =>
  request<WellBeingRecord[]>(`${BASE}/`)

export const getRecord = (id: number) =>
  request<WellBeingRecord>(`${BASE}/${id}`)

export const createRecord = (input: RecordInput) =>
  request<WellBeingRecord>(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  })

export const updateRecord = (
  id: number,
  input: Partial<RecordInput>,
) =>
  request<WellBeingRecord>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })

export const deleteRecord = (id: number) =>
  request<void>(`${BASE}/${id}`, {
    method: "DELETE",
  })

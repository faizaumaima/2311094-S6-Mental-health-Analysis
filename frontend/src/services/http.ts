
import type { AuthTokens } from "../types/auth"

const API_BASE = "/api"

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function saveTokens(tokens: AuthTokens) {
  accessToken = tokens.access_token
  localStorage.setItem("refresh_token", tokens.refresh_token)
}

export function clearTokens() {
  accessToken = null
  localStorage.removeItem("refresh_token")
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) return null

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) {
        clearTokens()
        return null
      }

      const tokens: AuthTokens = await res.json()
      saveTokens(tokens)
      return tokens.access_token
    } catch {
      clearTokens()
      return null
    }
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function parseError(res: Response): Promise<ApiError> {
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
    // Keep generic error message
  }

  return new ApiError(message, res.status)
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  const isAuthEndpoint =
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh")

  if (res.status === 401 && !isAuthEndpoint) {
    const newToken = await refreshAccessToken()

    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`)
      res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
      })
    }
  }

  if (!res.ok) {
    throw await parseError(res)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

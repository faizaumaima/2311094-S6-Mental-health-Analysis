
import type {
  AuthTokens,
  LoginInput,
  RegisterInput,
  User,
} from "../types/auth"
import { request, saveTokens, clearTokens } from "./http"

export async function login(input: LoginInput): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })

  saveTokens(tokens)
  return tokens
}

export function register(input: RegisterInput): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me")
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refresh_token")

  try {
    if (refreshToken) {
      await request<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    }
  } finally {
    clearTokens()
  }
}

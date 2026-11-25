export interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface SessionInfo {
  id: number
  expires_at: string
  created_at: string
}

export interface PasswordChangeInput {
  current_password: string
  new_password: string
}
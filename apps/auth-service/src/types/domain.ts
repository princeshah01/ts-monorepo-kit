export type UserRole = "admin" | "member"
export type UserStatus = "active" | "disabled"

export interface UserRecord {
  id: string
  email: string
  name: string
  passwordHash: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface PublicUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface SessionRecord {
  refreshToken: string
  userId: string
  expiresAt: Date
  createdAt: Date
  revokedAt?: Date
}

export interface AccessTokenRecord {
  accessToken: string
  userId: string
  expiresAt: Date
}

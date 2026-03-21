import { createHash, randomBytes, randomUUID } from "node:crypto"
import {
  accessTokens,
  findUserByEmail,
  refreshSessions,
  toPublicUser,
  users
} from "../data/user.store.js"
import type { PublicUser, UserRecord } from "../types/domain.js"
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError
} from "../types/errors.js"

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

interface RegisterInput {
  email: string
  password: string
  name: string
}

interface LoginInput {
  email: string
  password: string
}

interface RefreshInput {
  refreshToken: string
}

interface LogoutInput {
  refreshToken: string
}

interface TokensPayload {
  accessToken: string
  refreshToken: string
  tokenType: "Bearer"
  expiresIn: number
}

let isSeeded = false

export class AuthService {
  constructor() {
    if (!isSeeded) {
      this.seedDefaultAdmin()
      isSeeded = true
    }
  }

  register(payload: RegisterInput): {
    user: PublicUser
    tokens: TokensPayload
  } {
    const existingUser = findUserByEmail(payload.email)

    if (existingUser) {
      throw new ConflictError("Email already exists")
    }

    const now = new Date()
    const user: UserRecord = {
      id: randomUUID(),
      email: payload.email.toLowerCase(),
      name: payload.name,
      passwordHash: this.hashPassword(payload.password),
      role: "member",
      status: "active",
      createdAt: now,
      updatedAt: now
    }

    users.set(user.id, user)

    return {
      user: toPublicUser(user),
      tokens: this.issueTokens(user.id)
    }
  }

  login(payload: LoginInput): { user: PublicUser; tokens: TokensPayload } {
    const user = findUserByEmail(payload.email)

    if (!user || user.passwordHash !== this.hashPassword(payload.password)) {
      throw new UnauthorizedError("Invalid email or password")
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("User is disabled")
    }

    return {
      user: toPublicUser(user),
      tokens: this.issueTokens(user.id)
    }
  }

  refresh(payload: RefreshInput): { user: PublicUser; tokens: TokensPayload } {
    const session = refreshSessions.get(payload.refreshToken)

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token")
    }

    const user = users.get(session.userId)

    if (!user) {
      throw new NotFoundError("User not found for this refresh token")
    }

    session.revokedAt = new Date()
    refreshSessions.set(session.refreshToken, session)

    return {
      user: toPublicUser(user),
      tokens: this.issueTokens(user.id)
    }
  }

  logout(payload: LogoutInput): { loggedOut: true } {
    const session = refreshSessions.get(payload.refreshToken)

    if (session && !session.revokedAt) {
      session.revokedAt = new Date()
      refreshSessions.set(session.refreshToken, session)
    }

    return { loggedOut: true }
  }

  me(userId: string): PublicUser {
    const user = users.get(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    return toPublicUser(user)
  }

  validateAccessToken(token: string): UserRecord | null {
    const tokenRecord = accessTokens.get(token)

    if (!tokenRecord || tokenRecord.expiresAt <= new Date()) {
      return null
    }

    const user = users.get(tokenRecord.userId)
    return user ?? null
  }

  revokeUserTokens(userId: string): void {
    for (const [token, accessToken] of accessTokens.entries()) {
      if (accessToken.userId === userId) {
        accessTokens.delete(token)
      }
    }

    for (const [refreshToken, session] of refreshSessions.entries()) {
      if (session.userId === userId) {
        session.revokedAt = new Date()
        refreshSessions.set(refreshToken, session)
      }
    }
  }

  private issueTokens(userId: string): TokensPayload {
    const accessToken = `at_${randomBytes(24).toString("hex")}`
    const refreshToken = `rt_${randomBytes(32).toString("hex")}`
    const now = Date.now()

    accessTokens.set(accessToken, {
      accessToken,
      userId,
      expiresAt: new Date(now + ACCESS_TOKEN_TTL_SECONDS * 1000)
    })

    refreshSessions.set(refreshToken, {
      refreshToken,
      userId,
      createdAt: new Date(now),
      expiresAt: new Date(now + REFRESH_TOKEN_TTL_SECONDS * 1000)
    })

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS
    }
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex")
  }

  private seedDefaultAdmin(): void {
    if (findUserByEmail("admin@local.dev")) {
      return
    }

    const now = new Date()
    const defaultAdmin: UserRecord = {
      id: randomUUID(),
      email: "admin@local.dev",
      name: "System Admin",
      passwordHash: this.hashPassword("admin1234"),
      role: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now
    }

    users.set(defaultAdmin.id, defaultAdmin)
  }
}

export const authService = new AuthService()

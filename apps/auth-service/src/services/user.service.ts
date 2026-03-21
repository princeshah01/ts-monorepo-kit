import { createHash, randomUUID } from "node:crypto"
import {
  accessTokens,
  findUserByEmail,
  refreshSessions,
  toPublicUser,
  users
} from "../data/user.store.js"
import type {
  PublicUser,
  UserRecord,
  UserRole,
  UserStatus
} from "../types/domain.js"
import { ConflictError, NotFoundError } from "../types/errors.js"

interface ListUsersQuery {
  page: number
  limit: number
}

interface CreateUserInput {
  email: string
  password: string
  name: string
  role?: UserRole
  status?: UserStatus
}

interface UpdateUserInput {
  name?: string
  role?: UserRole
  status?: UserStatus
}

export class UserService {
  list(query: ListUsersQuery): {
    items: PublicUser[]
    pagination: {
      page: number
      limit: number
      totalItems: number
      totalPages: number
    }
  } {
    const allUsers = [...users.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(toPublicUser)

    const start = (query.page - 1) * query.limit
    const end = start + query.limit
    const items = allUsers.slice(start, end)
    const totalItems = allUsers.length
    const totalPages = Math.max(1, Math.ceil(totalItems / query.limit))

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages
      }
    }
  }

  getById(userId: string): PublicUser {
    const user = users.get(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    return toPublicUser(user)
  }

  create(payload: CreateUserInput): PublicUser {
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
      role: payload.role ?? "member",
      status: payload.status ?? "active",
      createdAt: now,
      updatedAt: now
    }

    users.set(user.id, user)
    return toPublicUser(user)
  }

  update(userId: string, payload: UpdateUserInput): PublicUser {
    const user = users.get(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    const updatedUser: UserRecord = {
      ...user,
      name: payload.name ?? user.name,
      role: payload.role ?? user.role,
      status: payload.status ?? user.status,
      updatedAt: new Date()
    }

    users.set(userId, updatedUser)
    return toPublicUser(updatedUser)
  }

  remove(userId: string): { deleted: true } {
    const user = users.get(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    users.delete(userId)

    for (const [token, accessToken] of accessTokens.entries()) {
      if (accessToken.userId === userId) {
        accessTokens.delete(token)
      }
    }

    for (const [token, session] of refreshSessions.entries()) {
      if (session.userId === userId) {
        session.revokedAt = new Date()
        refreshSessions.set(token, session)
      }
    }

    return { deleted: true }
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex")
  }
}

export const userService = new UserService()

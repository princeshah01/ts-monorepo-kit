import { relations, sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core"

export const scopeEnum = pgEnum("scope", ["GLOBAL", "APPLICATION"])

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    uniqueIndex("users_email_unique_idx").on(table.email),
    uniqueIndex("users_email_lower_unique_idx").on(sql`lower(${table.email})`),
    index("users_is_active_idx").on(table.isActive)
  ]
)

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    clientId: text("client_id").notNull(),
    clientSecret: text("client_secret").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade"
      }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    uniqueIndex("applications_client_id_unique_idx").on(table.clientId),
    index("applications_created_by_idx").on(table.createdBy),
    index("applications_name_idx").on(table.name)
  ]
)

export const applicationRedirectUris = pgTable(
  "application_redirect_uris",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      }),
    redirectUri: text("redirect_uri").notNull()
  },
  table => [
    index("application_redirect_uris_app_id_idx").on(table.applicationId),
    unique("application_redirect_uris_app_uri_unique").on(
      table.applicationId,
      table.redirectUri
    )
  ]
)

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    scope: scopeEnum("scope").notNull(),
    description: text("description")
  },
  table => [
    uniqueIndex("resources_name_unique_idx").on(table.name),
    index("resources_scope_idx").on(table.scope)
  ]
)

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scope: scopeEnum("scope").notNull(),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, {
        onDelete: "restrict",
        onUpdate: "cascade"
      }),
    action: text("action").notNull()
  },
  table => [
    index("permissions_resource_id_idx").on(table.resourceId),
    index("permissions_scope_idx").on(table.scope),
    unique("permissions_resource_action_scope_unique").on(
      table.resourceId,
      table.action,
      table.scope
    )
  ]
)

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    scope: scopeEnum("scope").notNull(),
    applicationId: uuid("application_id").references(() => applications.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    index("roles_application_id_idx").on(table.applicationId),
    index("roles_scope_idx").on(table.scope),
    uniqueIndex("roles_global_name_unique_idx")
      .on(table.name)
      .where(sql`${table.scope} = 'GLOBAL'`),
    uniqueIndex("roles_application_name_unique_idx")
      .on(table.applicationId, table.name)
      .where(sql`${table.scope} = 'APPLICATION'`),
    check(
      "roles_scope_application_id_ck",
      sql`(
				(${table.scope} = 'GLOBAL' AND ${table.applicationId} IS NULL)
				OR
				(${table.scope} = 'APPLICATION' AND ${table.applicationId} IS NOT NULL)
			)`
    )
  ]
)

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      })
  },
  table => [
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(table.permissionId),
    unique("role_permissions_role_permission_unique").on(
      table.roleId,
      table.permissionId
    )
  ]
)

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade", onUpdate: "cascade" })
  },
  table => [
    index("user_roles_user_id_idx").on(table.userId),
    index("user_roles_role_id_idx").on(table.roleId),
    unique("user_roles_user_role_unique").on(table.userId, table.roleId)
  ]
)

export const authorizationCodes = pgTable(
  "authorization_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    uniqueIndex("authorization_codes_code_unique_idx").on(table.code),
    index("authorization_codes_user_id_idx").on(table.userId),
    index("authorization_codes_application_id_idx").on(table.applicationId),
    index("authorization_codes_expires_at_idx").on(table.expiresAt),
    index("authorization_codes_used_idx").on(table.used)
  ]
)

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      }),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_application_id_idx").on(table.applicationId),
    uniqueIndex("sessions_refresh_token_unique_idx").on(table.refreshToken),
    index("sessions_expires_at_idx").on(table.expiresAt)
  ]
)

export const jwksKeys = pgTable(
  "jwks_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kid: text("kid").notNull(),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    uniqueIndex("jwks_keys_kid_unique_idx").on(table.kid),
    index("jwks_keys_is_active_idx").on(table.isActive)
  ]
)

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade"
    }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_entity_idx").on(table.entity),
    index("audit_logs_created_at_idx").on(table.createdAt)
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  applicationsCreated: many(applications),
  userRoles: many(userRoles),
  authorizationCodes: many(authorizationCodes),
  sessions: many(sessions),
  auditLogs: many(auditLogs)
}))

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [applications.createdBy],
      references: [users.id]
    }),
    redirectUris: many(applicationRedirectUris),
    roles: many(roles),
    authorizationCodes: many(authorizationCodes),
    sessions: many(sessions)
  })
)

export const applicationRedirectUrisRelations = relations(
  applicationRedirectUris,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationRedirectUris.applicationId],
      references: [applications.id]
    })
  })
)

export const resourcesRelations = relations(resources, ({ many }) => ({
  permissions: many(permissions)
}))

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  resource: one(resources, {
    fields: [permissions.resourceId],
    references: [resources.id]
  }),
  rolePermissions: many(rolePermissions)
}))

export const rolesRelations = relations(roles, ({ one, many }) => ({
  application: one(applications, {
    fields: [roles.applicationId],
    references: [applications.id]
  }),
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles)
}))

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id]
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id]
    })
  })
)

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  })
}))

export const authorizationCodesRelations = relations(
  authorizationCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [authorizationCodes.userId],
      references: [users.id]
    }),
    application: one(applications, {
      fields: [authorizationCodes.applicationId],
      references: [applications.id]
    })
  })
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  }),
  application: one(applications, {
    fields: [sessions.applicationId],
    references: [applications.id]
  })
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id]
  })
}))

export const schema = {
  scopeEnum,
  users,
  applications,
  applicationRedirectUris,
  resources,
  permissions,
  roles,
  rolePermissions,
  userRoles,
  authorizationCodes,
  sessions,
  jwksKeys,
  auditLogs
}

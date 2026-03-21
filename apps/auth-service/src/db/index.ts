import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  keepAlive: true,
  max: 50,
  min: 3,
  idleTimeoutMillis: 600000
})

export const db = drizzle(pool, { logger: false })

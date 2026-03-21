/* eslint-disable no-console */
import { db } from "./index"
import { migrate } from "drizzle-orm/node-postgres/migrator"

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "src/db/migrations" })
    console.log("Migrations applied successfully")
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    console.log("Dbstring injected is ", process.env.DATABASE_URL)
    process.exit(1)
  }
}

runMigrations()

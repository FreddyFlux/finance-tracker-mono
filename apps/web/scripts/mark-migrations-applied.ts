/**
 * Marks existing migrations as applied when the database was set up via db:push
 * or is in a partially migrated state (e.g. "relation already exists" errors).
 *
 * Run from monorepo root: pnpm exec tsx apps/web/scripts/mark-migrations-applied.ts
 * Requires DATABASE_URL in apps/web/.env
 */
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env') })
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const migrationsDir = join(__dirname, '../drizzle')
const journalPath = join(migrationsDir, 'meta/_journal.json')

const journal = JSON.parse(readFileSync(journalPath, 'utf-8')) as {
  entries: Array<{ tag: string; when: number }>
}

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const entries = journal.entries.map((e) => {
    const content = readFileSync(join(migrationsDir, `${e.tag}.sql`), 'utf-8')
    const hash = createHash('sha256').update(content).digest('hex')
    return { hash, created_at: e.when }
  })

  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `

  for (const { hash, created_at } of entries) {
    const existing = await sql`
      SELECT 1 FROM drizzle.__drizzle_migrations
      WHERE hash = ${hash}
    `
    if (existing.length === 0) {
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${created_at})
      `
      console.log(`Marked migration as applied (created_at: ${created_at})`)
    } else {
      console.log(`Migration already marked (created_at: ${created_at})`)
    }
  }

  console.log('Done. You can now run: pnpm --filter web db:migrate')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

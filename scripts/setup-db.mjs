import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envContent = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
const dbUrl = envContent.match(/DATABASE_URL=(.*)/)?.[1]?.trim();

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl });

const sql = `
-- Create enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"     VARCHAR(255) NOT NULL UNIQUE,
  "password"  VARCHAR(255) NOT NULL,
  "name"      VARCHAR(255) NOT NULL,
  "role"      "Role" NOT NULL DEFAULT 'MEMBER',
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Project table
CREATE TABLE IF NOT EXISTS "Project" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"       VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status"      "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "startDate"   TIMESTAMPTZ,
  "endDate"     TIMESTAMPTZ,
  "createdBy"   UUID NOT NULL REFERENCES "User"("id"),
  "isArchived"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ProjectAssignment table
CREATE TABLE IF NOT EXISTS "ProjectAssignment" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId"  UUID NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "userId"     UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("projectId", "userId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Project_createdBy_idx" ON "Project"("createdBy");
CREATE INDEX IF NOT EXISTS "ProjectAssignment_projectId_idx" ON "ProjectAssignment"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectAssignment_userId_idx" ON "ProjectAssignment"("userId");
`;

async function main() {
  try {
    await client.connect();
    console.log('Connected to database.');
    await client.query(sql);
    console.log('All tables created successfully!');

    // Verify tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('Tables in database:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

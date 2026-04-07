import pg from "pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envContent = readFileSync(resolve(__dirname, "..", ".env"), "utf-8");
const dbUrl = envContent.match(/DATABASE_URL=(.*)/)?.[1]?.trim().replace(/^["']|["']$/g, '');

if (!dbUrl) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl });

const users = [
  {
    email: "admin@example.com",
    password: "admin123",
    name: "管理者ユーザー",
    role: "ADMIN",
  },
  {
    email: "manager@example.com",
    password: "manager123",
    name: "マネージャーユーザー",
    role: "MANAGER",
  },
  {
    email: "member@example.com",
    password: "member123",
    name: "メンバーユーザー",
    role: "MEMBER",
  },
];

async function main() {
  try {
    await client.connect();
    console.log("Connected to database.");

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);

      await client.query(
        `INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4::\"Role\", true, now(), now())
         ON CONFLICT (email) DO UPDATE SET
           password = $2,
           name = $3,
           role = $4::\"Role\",
           "updatedAt" = now()`,
        [user.email, hashedPassword, user.name, user.role]
      );

      console.log(`  Created/Updated: ${user.email} (${user.role}) / password: ${user.password}`);
    }

    console.log("\nSeed completed! Test accounts:");
    console.log("  admin@example.com    / admin123");
    console.log("  manager@example.com  / manager123");
    console.log("  member@example.com   / member123");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

// One-off: apply supabase/schema.sql to a Supabase Postgres database.
// Usage: PG_CONN="postgres://..." node scripts/apply-schema.mjs
// Credentials are NEVER hardcoded here — always pass PG_CONN.
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const CONN = process.env.PG_CONN;

if (!CONN) {
  console.error(
    "Missing PG_CONN env var. Use the pooler connection string from your Supabase dashboard:\n" +
      '  PG_CONN="postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require" node scripts/apply-schema.mjs'
  );
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), "supabase/schema.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new Client({
  connectionString: CONN,
  ssl: { rejectUnauthorized: false }, // Supabase pooler presents a chain Node's store lacks
});
await client.connect();
try {
  const res = await client.query(sql);
  console.log("Schema applied OK. Commands:", res.command ?? "MULTI");
} finally {
  await client.end();
}

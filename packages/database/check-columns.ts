import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"]! });

async function main() {
  const res = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
  );
  console.log("Users columns:", res.rows.map((r: any) => r.column_name));
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });

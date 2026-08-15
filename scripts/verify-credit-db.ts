import "dotenv/config";
import { Client } from "pg";

async function verifyCredit() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const submissionId = "92fb5b03-35a5-4d39-ac4b-3be4d72863c6";
  const res = await client.query('SELECT * FROM "Credit" WHERE submission_id = $1', [submissionId]);
  console.log("=== Credit Record in PostgreSQL Database ===");
  console.log(JSON.stringify(res.rows[0], null, 2));

  await client.end();
}

verifyCredit().catch(console.error);

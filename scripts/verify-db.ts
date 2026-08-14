import "dotenv/config";
import { Client } from "pg";

async function verify() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const submissionId = "92fb5b03-35a5-4d39-ac4b-3be4d72863c6";

  const subRes = await client.query('SELECT * FROM "Submission" WHERE id = $1', [submissionId]);
  console.log("=== Submission Record in DB ===");
  console.log(JSON.stringify(subRes.rows[0], null, 2));

  const verRes = await client.query('SELECT * FROM "Verification" WHERE submission_id = $1', [submissionId]);
  console.log("=== Verification Record in DB ===");
  console.log(JSON.stringify(verRes.rows[0], null, 2));

  await client.end();
}

verify().catch(console.error);

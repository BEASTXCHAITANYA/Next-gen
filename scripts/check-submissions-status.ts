import "dotenv/config";
import { Client } from "pg";

async function checkSubmissions() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const res = await client.query('SELECT s.id, s.status, s.photo_url, u.wallet_address FROM "Submission" s JOIN "User" u ON s.user_id = u.id ORDER BY s.created_at DESC');
  console.log("=== All Submissions in Database ===");
  console.table(res.rows);

  await client.end();
}

checkSubmissions().catch(console.error);

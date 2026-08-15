import "dotenv/config";
import { prisma } from "../lib/prisma";

async function verify() {
  console.log("Querying Neon PostgreSQL database for Test A records...");
  const targetWallet = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const user = await prisma.user.findUnique({
    where: { wallet_address: targetWallet },
    include: {
      submissions: true,
    },
  });

  console.log("=== User Record in DB ===");
  console.log(JSON.stringify(user, null, 2));

  if (user && user.submissions.length > 0) {
    console.log("CONFIRMED: User and Submission records exist in Neon PostgreSQL!");
  } else {
    console.error("ERROR: Record not found!");
    process.exit(1);
  }
}

verify()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

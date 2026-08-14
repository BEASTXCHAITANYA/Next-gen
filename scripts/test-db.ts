import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Testing database connection to Neon PostgreSQL...");
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected;`;
    console.log("Database connection successful!", result);

    const testWallet = `0xTest${Date.now()}`;
    const user = await prisma.user.create({
      data: {
        wallet_address: testWallet,
      },
    });
    console.log("Created test user:", user);

    const submission = await prisma.submission.create({
      data: {
        user_id: user.id,
        photo_url: "https://gateway.pinata.cloud/ipfs/QmTest123",
        latitude: 12.9716,
        longitude: 77.5946,
        status: "pending",
      },
    });
    console.log("Created test submission:", submission);

    const fetchedSubmissions = await prisma.submission.findMany({
      where: { user_id: user.id },
      include: { user: true },
    });
    console.log(`Fetched ${fetchedSubmissions.length} submissions for user.`);

    // Cleanup test data
    await prisma.submission.delete({ where: { id: submission.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleaned up test data successfully.");
  } catch (error) {
    console.error("Database test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

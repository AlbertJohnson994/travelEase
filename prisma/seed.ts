import { ensureSeeded } from "../lib/seed-helper";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding TravelEase SaaS database...");
  const result = await ensureSeeded(true);
  console.log(result.message);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

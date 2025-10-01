import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create destinations
  const beachDestination = await prisma.destination.create({
    data: {
      name: "Maldives Paradise",
      description:
        "Beautiful tropical islands with crystal clear waters and white sandy beaches.",
      location: "Malé",
      country: "Maldives",
      image:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500",
      price: 1200,
      category: "BEACH",
    },
  });

  const mountainDestination = await prisma.destination.create({
    data: {
      name: "Swiss Alps Adventure",
      description:
        "Breathtaking mountain views and outdoor activities in the heart of the Alps.",
      location: "Interlaken",
      country: "Switzerland",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
      price: 1500,
      category: "MOUNTAIN",
    },
  });

  // Create packages with inclusions
  await prisma.package.create({
    data: {
      name: "Luxury Beach Getaway",
      description: "5-star resort experience with all-inclusive amenities",
      price: 2000,
      duration: 7,
      destinationId: beachDestination.id,
      inclusions: {
        create: [
          { item: "Luxury resort accommodation" },
          { item: "All meals included" },
          { item: "Snorkeling equipment" },
          { item: "Airport transfers" },
          { item: "Spa discount voucher" },
        ],
      },
    },
  });

  await prisma.package.create({
    data: {
      name: "Mountain Explorer",
      description: "Adventure package for mountain lovers",
      price: 1800,
      duration: 5,
      destinationId: mountainDestination.id,
      inclusions: {
        create: [
          { item: "Mountain lodge accommodation" },
          { item: "Breakfast and dinner" },
          { item: "Hiking guide" },
          { item: "Cable car tickets" },
          { item: "Equipment rental" },
        ],
      },
    },
  });

  // Create promotions
  await prisma.promotion.create({
    data: {
      title: "Summer Special",
      description: "Get 20% off on all beach destinations this summer",
      discount: 20,
      validUntil: new Date("2024-12-31"),
      destinationId: beachDestination.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function ensureSeeded(force = false) {
  const existingDestinations = await prisma.destination.count();
  const existingUsers = await prisma.user.count();

  if (!force && existingDestinations >= 6 && existingUsers >= 2) {
    return { seeded: false, message: "Database already seeded" };
  }

  if (force) {
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.packageInclusion.deleteMany();
    await prisma.package.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.contactMessage.deleteMany();
  }

  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("travel123", 10);

  // 1. Upsert Demo Users (Admin + Customer + VIP Customer)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@travelease.com" },
    update: { role: "ADMIN", plan: "ELITE" },
    create: {
      email: "admin@travelease.com",
      name: "Sarah Jenkins (Admin)",
      password: adminPassword,
      phone: "+1 (555) 010-9988",
      role: "ADMIN",
      plan: "ELITE",
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: "alex@travelease.com" },
    update: { plan: "PRO" },
    create: {
      id: "demo-customer-id",
      email: "alex@travelease.com",
      name: "Alex Rivera",
      password: customerPassword,
      phone: "+1 (555) 234-5678",
      role: "CUSTOMER",
      plan: "PRO",
    },
  });

  const secondCustomer = await prisma.user.upsert({
    where: { email: "elena@example.com" },
    update: {},
    create: {
      email: "elena@example.com",
      name: "Elena Rostova",
      password: customerPassword,
      phone: "+44 20 7946 0921",
      role: "CUSTOMER",
      plan: "ELITE",
    },
  });

  if (existingDestinations < 6 || force) {
    // Clear partial destinations if re-seeding
    if (!force && existingDestinations > 0) {
      await prisma.review.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.packageInclusion.deleteMany();
      await prisma.package.deleteMany();
      await prisma.promotion.deleteMany();
      await prisma.destination.deleteMany();
    }

    // 2. Create 8 Curated Global Destinations across all 5 categories
    const maldives = await prisma.destination.create({
      data: {
        name: "Maldives Coral Atolls",
        description:
          "Overwater villas suspended above turquoise lagoons, vibrant coral reefs teeming with marine life, and private white-sand islands.",
        location: "Malé & Baa Atoll",
        country: "Maldives",
        image:
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
        price: 1450,
        rating: 4.9,
        featured: true,
        category: "BEACH",
      },
    });

    const swissAlps = await prisma.destination.create({
      data: {
        name: "Swiss Alps & Zermatt",
        description:
          "Iconic Matterhorn panoramas, luxury alpine chalets, glacier express train journeys, and world-class skiing and hiking trails.",
        location: "Interlaken & Zermatt",
        country: "Switzerland",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
        price: 1650,
        rating: 4.9,
        featured: true,
        category: "MOUNTAIN",
      },
    });

    const kyoto = await prisma.destination.create({
      data: {
        name: "Kyoto Imperial Heritage",
        description:
          "Ancient Zen temples, crimson torii gates of Fushimi Inari, bamboo groves of Arashiyama, and authentic tea ceremonies.",
        location: "Kyoto",
        country: "Japan",
        image:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        price: 1380,
        rating: 4.8,
        featured: true,
        category: "HISTORICAL",
      },
    });

    const santorini = await prisma.destination.create({
      data: {
        name: "Santorini Caldera Escape",
        description:
          "Iconic blue-domed churches, cliffside infinity pools in Oia, volcanic beaches, and sunset catamaran cruises over the Aegean Sea.",
        location: "Oia & Fira",
        country: "Greece",
        image:
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        price: 1290,
        rating: 4.8,
        featured: true,
        category: "BEACH",
      },
    });

    const tokyo = await prisma.destination.create({
      data: {
        name: "Tokyo Neon Metropolis",
        description:
          "Futuristic skyscrapers, Michelin-starred ramen and sushi, Shibuya crossing energy, and tranquil Meiji Shrine gardens.",
        location: "Tokyo",
        country: "Japan",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
        price: 1320,
        rating: 4.9,
        featured: true,
        category: "CITY",
      },
    });

    const patagonia = await prisma.destination.create({
      data: {
        name: "Patagonia Wilderness Trek",
        description:
          "Dramatic granite peaks of Torres del Paine, calving turquoise glaciers, gaucho estancias, and untamed southern hemisphere nature.",
        location: "Torres del Paine",
        country: "Chile",
        image:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        price: 1790,
        rating: 4.9,
        featured: true,
        category: "ADVENTURE",
      },
    });

    const rome = await prisma.destination.create({
      data: {
        name: "Eternal Rome & Amalfi",
        description:
          "Walk through 2,500 years of history at the Colosseum and Vatican, paired with coastal lemon groves and cliffside towns.",
        location: "Rome & Positano",
        country: "Italy",
        image:
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
        price: 1180,
        rating: 4.7,
        featured: false,
        category: "HISTORICAL",
      },
    });

    const newYork = await prisma.destination.create({
      data: {
        name: "New York Skyline & Broadway",
        description:
          "The city that never sleeps: Central Park, Broadway VIP shows, SoHo art galleries, and Manhattan rooftop dining.",
        location: "New York City",
        country: "United States",
        image:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
        price: 1090,
        rating: 4.7,
        featured: false,
        category: "CITY",
      },
    });

    // 3. Create Packages with rich inclusions
    const pkgMaldives = await prisma.package.create({
      data: {
        name: "Overwater Villa All-Inclusive Retreat",
        description:
          "7-night 5-star overwater bungalow stay with seaplane transfers, fine dining, coral reef snorkeling, and sunset dolphin cruise.",
        price: 2450,
        duration: 7,
        maxGuests: 6,
        destinationId: maldives.id,
        inclusions: {
          create: [
            { item: "5-Star Overwater Pool Villa accommodation" },
            { item: "Round-trip Seaplane transfers from Malé" },
            { item: "All-inclusive gourmet meals & premium beverages" },
            { item: "Guided coral reef snorkeling & gear" },
            { item: "60-minute couples overwater spa treatment" },
          ],
        },
      },
    });

    const pkgMaldivesShort = await prisma.package.create({
      data: {
        name: "Maldives Island Hopping & Dive",
        description:
          "5-day tropical reef exploration designed for ocean lovers and scuba enthusiasts.",
        price: 1690,
        duration: 5,
        maxGuests: 8,
        destinationId: maldives.id,
        inclusions: {
          create: [
            { item: "Beachfront boutique resort stay" },
            { item: "Daily breakfast and sunset BBQ dinner" },
            { item: "3 guided boat dives / manta ray safari" },
            { item: "Speedboat airport transfers" },
          ],
        },
      },
    });

    const pkgAlps = await prisma.package.create({
      data: {
        name: "Glacier Express & Matterhorn Luxury",
        description:
          "6-day alpine expedition featuring panoramic first-class Glacier Express rail, Zermatt chalet stay, and Jungfraujoch excursion.",
        price: 2190,
        duration: 6,
        maxGuests: 10,
        destinationId: swissAlps.id,
        inclusions: {
          create: [
            { item: "4-Star Boutique Alpine Chalet accommodation" },
            { item: "First-class Glacier Express panoramic train tickets" },
            { item: "Daily Swiss breakfast & fondue tasting dinner" },
            { item: "Gornergrat & Matterhorn cable car passes" },
            { item: "Private certified mountain guide" },
          ],
        },
      },
    });

    const pkgKyoto = await prisma.package.create({
      data: {
        name: "Kyoto Zen & Ryokan Immersion",
        description:
          "8-day cultural journey through Kyoto's UNESCO temples, private geisha district walking tour, and hot spring ryokan stay.",
        price: 2290,
        duration: 8,
        maxGuests: 8,
        destinationId: kyoto.id,
        inclusions: {
          create: [
            { item: "Traditional luxury Ryokan with private Onsen" },
            { item: "7-Day JR Bullet Train (Shinkansen) Pass" },
            { item: "Multi-course Kaiseki dinner & tea ceremony" },
            { item: "Private historian guide for Fushimi Inari & Kinkaku-ji" },
            { item: "Airport limousine transfer" },
          ],
        },
      },
    });

    const pkgSantorini = await prisma.package.create({
      data: {
        name: "Aegean Sunset & Caldera Yacht Week",
        description:
          "6-day Greek islands escape with cave suite lodging in Oia, volcanic hot springs catamaran cruise, and Assyrtiko wine tour.",
        price: 1890,
        duration: 6,
        maxGuests: 6,
        destinationId: santorini.id,
        inclusions: {
          create: [
            { item: "Cliffside Caldera View Cave Suite" },
            { item: "Private sunset catamaran cruise with BBQ" },
            { item: "Santorini volcanic vineyard tasting tour" },
            { item: "Daily Mediterranean breakfast on private terrace" },
            { item: "Port & airport private chauffeur transfers" },
          ],
        },
      },
    });

    const pkgTokyo = await prisma.package.create({
      data: {
        name: "Tokyo Future & Culinary Insider",
        description:
          "7-day high-energy urban adventure across Shinjuku, Shibuya, TeamLab Planets, and Mount Fuji day trip.",
        price: 1990,
        duration: 7,
        maxGuests: 10,
        destinationId: tokyo.id,
        inclusions: {
          create: [
            { item: "5-Star Shinjuku Skyline Hotel stay" },
            { item: " Tsukiji & Omakase culinary night tour" },
            { item: "TeamLab Planets VIP fast-track admission" },
            { item: "Private day excursion to Mt. Fuji & Hakone" },
            { item: "Unlimited Tokyo Metro pass & Pocket Wi-Fi" },
          ],
        },
      },
    });

    const pkgPatagonia = await prisma.package.create({
      data: {
        name: "Torres del Paine W-Trek & EcoCamp",
        description:
          "9-day guided expedition through Patagonia's iconic granite towers, Grey Glacier kayak adventure, and luxury geodesic domes.",
        price: 2890,
        duration: 9,
        maxGuests: 8,
        destinationId: patagonia.id,
        inclusions: {
          create: [
            { item: "Luxury Patagonia EcoCamp Geodesic Dome stay" },
            { item: "All park permits & catamaran lake crossings" },
            { item: "Full board meals & Chilean wine pairings" },
            { item: "Grey Glacier ice-trekking & kayaking gear" },
            { item: "Bilingual wilderness expedition leaders" },
          ],
        },
      },
    });

    const pkgRome = await prisma.package.create({
      data: {
        name: "La Dolce Vita: Rome to Positano",
        description:
          "7-day Italian classic combining VIP Colosseum underground access, Vatican Museums, and 4 nights on the Amalfi Coast.",
        price: 2150,
        duration: 7,
        maxGuests: 10,
        destinationId: rome.id,
        inclusions: {
          create: [
            { item: "Boutique hotels in historic Rome & Positano" },
            { item: "VIP skip-the-line Colosseum & Vatican tour" },
            { item: "High-speed Frecciarossa train + private coast driver" },
            { item: "Capri island boat excursion" },
            { item: "Authentic pasta & limoncello masterclass" },
          ],
        },
      },
    });

    const pkgNY = await prisma.package.create({
      data: {
        name: "Manhattan VIP & Broadway Weekend",
        description:
          "4-day luxury city break in Midtown Manhattan with Broadway orchestra seats, helicopter skyline tour, and museum passes.",
        price: 1490,
        duration: 4,
        maxGuests: 6,
        destinationId: newYork.id,
        inclusions: {
          create: [
            { item: "5th Avenue Luxury Hotel accommodation" },
            { item: "Orchestra tickets to a hit Broadway show" },
            { item: "15-minute Manhattan skyline helicopter flight" },
            { item: "SUMMIT One Vanderbilt & MoMA VIP passes" },
          ],
        },
      },
    });

    // 4. Create Active Promotions (valid well into 2027/2028)
    await prisma.promotion.createMany({
      data: [
        {
          title: "Maldives Paradise Early Bird",
          description:
            "Save 20% on all Maldives overwater villa & dive packages with complimentary seaplane lounge access.",
          promoCode: "MALDIVES20",
          discount: 20,
          validUntil: new Date("2027-08-31T23:59:59.000Z"),
          destinationId: maldives.id,
        },
        {
          title: "Alpine Season Pass Deal",
          description:
            "Enjoy 15% off Swiss Alps rail and chalet packages when booking for 2 or more travelers.",
          promoCode: "ALPS15",
          discount: 15,
          validUntil: new Date("2027-06-30T23:59:59.000Z"),
          destinationId: swissAlps.id,
        },
        {
          title: "Japan Cultural Golden Deal",
          description:
            "Get 25% off our signature Kyoto & Tokyo cultural packages including Shinkansen rail passes.",
          promoCode: "JAPAN25",
          discount: 25,
          validUntil: new Date("2027-10-15T23:59:59.000Z"),
          destinationId: kyoto.id,
        },
        {
          title: "Mediterranean Summer Flash Sale",
          description:
            "Limited-time 18% discount on Santorini cliffside suites and sunset yacht packages.",
          promoCode: "AEGEAN18",
          discount: 18,
          validUntil: new Date("2027-09-01T23:59:59.000Z"),
          destinationId: santorini.id,
        },
      ],
    });

    // 5. Create Sample Bookings for Demo Customer & Second Customer
    await prisma.booking.createMany({
      data: [
        {
          userId: demoCustomer.id,
          packageId: pkgMaldives.id,
          travelDate: new Date("2027-02-14T00:00:00.000Z"),
          travelers: 2,
          totalPrice: 3920,
          status: "CONFIRMED",
          transport: "AIR",
          paymentMethod: "CARD",
          paymentStatus: "PAID",
          specialRequests: "Honeymoon anniversary setup, high-floor lagoon view.",
        },
        {
          userId: demoCustomer.id,
          packageId: pkgAlps.id,
          travelDate: new Date("2027-04-10T00:00:00.000Z"),
          travelers: 2,
          totalPrice: 3723,
          status: "PENDING",
          transport: "LAND",
          paymentMethod: "CARD",
          paymentStatus: "PAID",
          specialRequests: "Window seats on the Glacier Express.",
        },
        {
          userId: demoCustomer.id,
          packageId: pkgSantorini.id,
          travelDate: new Date("2026-06-15T00:00:00.000Z"),
          travelers: 1,
          totalPrice: 1890,
          status: "COMPLETED",
          transport: "SEA",
          paymentMethod: "PAYPAL",
          paymentStatus: "PAID",
          specialRequests: "Vegetarian menu for the catamaran BBQ.",
        },
        {
          userId: secondCustomer.id,
          packageId: pkgPatagonia.id,
          travelDate: new Date("2027-03-20T00:00:00.000Z"),
          travelers: 3,
          totalPrice: 6936,
          status: "CONFIRMED",
          transport: "AIR",
          paymentMethod: "CARD",
          paymentStatus: "PAID",
          specialRequests: "Vegan meals during W-Trek.",
        },
        {
          userId: adminUser.id,
          packageId: pkgKyoto.id,
          travelDate: new Date("2027-05-05T00:00:00.000Z"),
          travelers: 2,
          totalPrice: 3435,
          status: "CONFIRMED",
          transport: "AIR",
          paymentMethod: "CARD",
          paymentStatus: "PAID",
          specialRequests: "Private tea ceremony reservation.",
        },
      ],
    });

    // 6. Create Authentic Reviews
    await prisma.review.createMany({
      data: [
        {
          userId: demoCustomer.id,
          destinationId: maldives.id,
          rating: 5,
          comment:
            "Hands down the best vacation of our lives! The seaplane transfer and overwater villa exceeded every expectation.",
        },
        {
          userId: secondCustomer.id,
          destinationId: maldives.id,
          rating: 5,
          comment:
            "Crystal clear water right off our deck. We saw reef sharks, sea turtles, and manta rays every single morning!",
        },
        {
          userId: demoCustomer.id,
          destinationId: swissAlps.id,
          rating: 5,
          comment:
            "The Glacier Express panoramic train and waking up to the Matterhorn in Zermatt was pure magic.",
        },
        {
          userId: secondCustomer.id,
          destinationId: kyoto.id,
          rating: 5,
          comment:
            "Our private historian guide took us through hidden bamboo trails in Kyoto before the crowds arrived. Incredible!",
        },
        {
          userId: demoCustomer.id,
          destinationId: santorini.id,
          rating: 5,
          comment:
            "The sunset catamaran cruise around the caldera was unforgettable. Seamless booking from start to finish.",
        },
      ],
    });

    // 7. Create Sample Contact Support Messages
    await prisma.contactMessage.createMany({
      data: [
        {
          name: "Marcus Vance",
          email: "marcus.vance@corporate.io",
          subject: "Corporate Retreat Group Booking (18 Travelers)",
          message:
            "Hi TravelEase team, we are looking to book the Swiss Alps Glacier Express package for our executive team of 18 in May. Do you offer custom Enterprise invoicing?",
          status: "OPEN",
        },
        {
          name: "Chloe Dubois",
          email: "chloe.d@example.com",
          subject: "Dietary accommodations on Kyoto Ryokan stay",
          message:
            "Can the traditional Kaiseki dinner be adapted for gluten-free travelers? Thank you!",
          status: "RESOLVED",
        },
      ],
    });

    void pkgMaldivesShort;
    void pkgTokyo;
    void pkgRome;
    void pkgNY;
  }

  return { seeded: true, message: "Database seeded with comprehensive SaaS data" };
}


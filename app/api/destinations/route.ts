import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-helper";
import { DestinationCategory } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await ensureSeeded(false);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const whereClause: {
      category?: DestinationCategory;
      OR?: Array<{
        name?: { contains: string };
        country?: { contains: string };
        location?: { contains: string };
        description?: { contains: string };
      }>;
    } = {};

    if (
      category &&
      category !== "ALL" &&
      ["BEACH", "MOUNTAIN", "CITY", "HISTORICAL", "ADVENTURE"].includes(category)
    ) {
      whereClause.category = category as DestinationCategory;
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { name: { contains: q } },
        { country: { contains: q } },
        { location: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const destinations = await prisma.destination.findMany({
      where: whereClause,
      include: {
        promotions: {
          where: {
            validUntil: {
              gt: new Date(),
            },
          },
        },
        packages: {
          include: {
            inclusions: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: { name: true, plan: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            packages: true,
            reviews: true,
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      location,
      country,
      image,
      price,
      category,
      featured,
      rating,
    } = body;

    if (!name || !description || !location || !country || !price || !category) {
      return NextResponse.json(
        { error: "Missing required destination fields" },
        { status: 400 }
      );
    }

    const destination = await prisma.destination.create({
      data: {
        name,
        description,
        location,
        country,
        image:
          image ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        price: parseFloat(price),
        category: category as DestinationCategory,
        featured: Boolean(featured),
        rating: rating ? parseFloat(rating) : 4.8,
      },
      include: {
        promotions: true,
        packages: true,
      },
    });

    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    console.error("Failed to create destination:", error);
    return NextResponse.json(
      { error: "Failed to create destination" },
      { status: 500 }
    );
  }
}

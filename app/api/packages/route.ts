import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-helper";

export async function GET(request: Request) {
  try {
    await ensureSeeded(false);
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destination");

    const packages = await prisma.package.findMany({
      where: destinationId && destinationId !== "ALL" ? { destinationId } : {},
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            country: true,
            category: true,
            rating: true,
            promotions: {
              where: {
                validUntil: {
                  gt: new Date(),
                },
              },
            },
          },
        },
        inclusions: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
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
      price,
      duration,
      maxGuests,
      destinationId,
      inclusions,
    } = body;

    if (!name || !description || !price || !duration || !destinationId) {
      return NextResponse.json(
        { error: "Missing required package fields" },
        { status: 400 }
      );
    }

    const inclusionItems: string[] = Array.isArray(inclusions)
      ? inclusions.filter((i: string) => i && i.trim())
      : typeof inclusions === "string"
        ? inclusions
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : ["Accommodation included", "Airport transfers", "Guided tours"];

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        maxGuests: maxGuests ? parseInt(maxGuests) : 10,
        destinationId,
        inclusions: {
          create: inclusionItems.map((item) => ({ item })),
        },
      },
      include: {
        destination: true,
        inclusions: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Failed to create package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}

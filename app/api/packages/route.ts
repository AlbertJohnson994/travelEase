import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destination");

    const packages = await prisma.package.findMany({
      where: destinationId ? { destinationId } : {},
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            country: true,
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

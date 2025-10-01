import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        validUntil: {
          gt: new Date(),
        },
      },
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
      },
      orderBy: {
        validUntil: "asc",
      },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      include: {
        promotions: {
          where: {
            validUntil: {
              gt: new Date(),
            },
          },
        },
        packages: true,
      },
    });

    return NextResponse.json(destinations);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

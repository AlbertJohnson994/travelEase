import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const packageData = await prisma.package.findUnique({
      where: { id: params.id },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            location: true,
            country: true,
            price: true,
            category: true,
          },
        },
        inclusions: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(packageData);
  } catch (error) {
    console.error("Failed to fetch package:", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}

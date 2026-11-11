import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-helper";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded(false);
    const { id } = await params;

    const packageData = await prisma.package.findUnique({
      where: { id },
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}


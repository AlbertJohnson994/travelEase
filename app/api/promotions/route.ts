import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-helper";

export async function GET(request: Request) {
  try {
    await ensureSeeded(false);
    const { searchParams } = new URL(request.url);
    const includeExpired = searchParams.get("all") === "true";

    const promotions = await prisma.promotion.findMany({
      where: includeExpired
        ? {}
        : {
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
            price: true,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, promoCode, discount, validUntil, destinationId } =
      body;

    if (!title || !description || !discount || !validUntil || !destinationId) {
      return NextResponse.json(
        { error: "Missing required promotion fields" },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        promoCode: promoCode ? promoCode.toUpperCase().trim() : null,
        discount: parseFloat(discount),
        validUntil: new Date(validUntil),
        destinationId,
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
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Failed to create promotion:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Promotion ID is required" },
        { status: 400 }
      );
    }

    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ message: "Promotion deleted" });
  } catch (error) {
    console.error("Failed to delete promotion:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed-helper";

export async function GET(request: Request) {
  try {
    await ensureSeeded(false);
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destinationId");

    const reviews = await prisma.review.findMany({
      where: destinationId ? { destinationId } : {},
      include: {
        user: {
          select: { id: true, name: true, plan: true },
        },
        destination: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeeded(false);
    const body = await request.json();
    const { destinationId, rating, comment, userId: bodyUserId } = body;

    if (!destinationId || !comment) {
      return NextResponse.json(
        { error: "Destination and review comment are required" },
        { status: 400 }
      );
    }

    const effectiveUser = await getEffectiveUser(true);
    const userId = bodyUserId || effectiveUser?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to post a review" },
        { status: 401 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(String(rating)) || 5));

    const review = await prisma.review.create({
      data: {
        destinationId,
        userId,
        rating: numericRating,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, plan: true },
        },
      },
    });

    // Recalculate destination average rating
    const agg = await prisma.review.aggregate({
      where: { destinationId },
      _avg: { rating: true },
    });
    if (agg._avg.rating) {
      await prisma.destination.update({
        where: { id: destinationId },
        data: { rating: Number(agg._avg.rating.toFixed(1)) },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed-helper";
import { TransportType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await ensureSeeded(false);
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const queryUserId = searchParams.get("userId");

    const effectiveUser = await getEffectiveUser(true);
    const targetUserId = queryUserId || effectiveUser?.id;

    const whereClause = showAll
      ? {}
      : targetUserId
        ? { userId: targetUserId }
        : {};

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          },
        },
        package: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeeded(false);
    const body = await request.json();
    const {
      packageId,
      travelers,
      travelDate,
      transport,
      specialRequests,
      totalPrice,
      paymentMethod,
      userId: bodyUserId,
    } = body;

    if (!packageId || !travelers || !travelDate || !transport || !totalPrice) {
      return NextResponse.json(
        { error: "All booking fields are required" },
        { status: 400 }
      );
    }

    const travelersNum = parseInt(String(travelers), 10);
    if (isNaN(travelersNum) || travelersNum < 1 || travelersNum > 20) {
      return NextResponse.json(
        { error: "Number of travelers must be between 1 and 20" },
        { status: 400 }
      );
    }

    const travelDateObj = new Date(travelDate);
    if (isNaN(travelDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid travel date" },
        { status: 400 }
      );
    }

    const effectiveUser = await getEffectiveUser(true);
    const resolvedUserId = bodyUserId || effectiveUser?.id;

    if (!resolvedUserId) {
      return NextResponse.json(
        { error: "Please sign in to create a booking" },
        { status: 401 }
      );
    }

    const validTransport: TransportType = ["AIR", "LAND", "SEA"].includes(
      transport
    )
      ? (transport as TransportType)
      : "AIR";

    const booking = await prisma.booking.create({
      data: {
        userId: resolvedUserId,
        packageId,
        travelers: travelersNum,
        travelDate: travelDateObj,
        transport: validTransport,
        paymentMethod: paymentMethod || "CARD",
        paymentStatus: "PAID",
        status: "CONFIRMED",
        specialRequests: specialRequests || "",
        totalPrice: parseFloat(String(totalPrice)),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, plan: true },
        },
        package: {
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
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

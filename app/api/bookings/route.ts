import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // In real app, get user ID from session
    const userId = "temp-user-id";

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        package: {
          include: {
            destination: {
              select: {
                id: true,
                name: true,
                image: true,
                location: true,
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
    const {
      packageId,
      travelers,
      travelDate,
      transport,
      specialRequests,
      totalPrice,
    } = await request.json();

    // Validate required fields
    if (!packageId || !travelers || !travelDate || !transport || !totalPrice) {
      return NextResponse.json(
        { error: "All booking fields are required" },
        { status: 400 }
      );
    }

    // Validate travelers count
    if (travelers < 1 || travelers > 10) {
      return NextResponse.json(
        { error: "Number of travelers must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Validate travel date (must be in future)
    const travelDateObj = new Date(travelDate);
    if (travelDateObj <= new Date()) {
      return NextResponse.json(
        { error: "Travel date must be in the future" },
        { status: 400 }
      );
    }

    // In real app, get user ID from session
    const userId = "temp-user-id";

    const booking = await prisma.booking.create({
      data: {
        userId,
        packageId,
        travelers: parseInt(travelers),
        travelDate: travelDateObj,
        transport,
        specialRequests: specialRequests || "",
        totalPrice: parseFloat(totalPrice),
      },
      include: {
        package: {
          include: {
            destination: {
              select: {
                id: true,
                name: true,
                image: true,
                location: true,
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

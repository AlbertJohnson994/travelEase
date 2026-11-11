import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, specialRequests } = body;

    const updateData: {
      status?: BookingStatus;
      specialRequests?: string;
    } = {};

    if (
      status &&
      ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)
    ) {
      updateData.status = status as BookingStatus;
    }

    if (specialRequests !== undefined) {
      updateData.specialRequests = specialRequests;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        package: {
          include: {
            destination: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
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
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}


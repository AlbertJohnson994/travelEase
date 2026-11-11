import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-helper";

export async function GET() {
  try {
    await ensureSeeded(false);

    const [
      users,
      destinations,
      packages,
      bookings,
      promotions,
      reviews,
      messages,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.destination.findMany({
        include: {
          _count: { select: { packages: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.package.findMany({
        include: {
          destination: { select: { id: true, name: true, country: true } },
          inclusions: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, plan: true } },
          package: {
            include: {
              destination: { select: { id: true, name: true, category: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.promotion.findMany({
        include: {
          destination: { select: { id: true, name: true } },
        },
        orderBy: { validUntil: "asc" },
      }),
      prisma.review.findMany({
        include: {
          user: { select: { name: true } },
          destination: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const activeBookings = bookings.filter((b) => b.status !== "CANCELLED");
    const totalBookingRevenue = activeBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0
    );

    const proUsers = users.filter((u) => u.plan === "PRO").length;
    const eliteUsers = users.filter((u) => u.plan === "ELITE").length;
    const monthlyRecurringRevenue = proUsers * 19 + eliteUsers * 49;

    return NextResponse.json({
      kpis: {
        totalBookingRevenue,
        monthlyRecurringRevenue,
        annualRecurringRevenue: monthlyRecurringRevenue * 12,
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED")
          .length,
        pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
        completedBookings: bookings.filter((b) => b.status === "COMPLETED")
          .length,
        cancelledBookings: bookings.filter((b) => b.status === "CANCELLED")
          .length,
        totalUsers: users.length,
        paidSubscribers: proUsers + eliteUsers,
        totalDestinations: destinations.length,
        totalPackages: packages.length,
        activePromotions: promotions.filter(
          (p) => new Date(p.validUntil) > new Date()
        ).length,
        openSupportTickets: messages.filter((m) => m.status === "OPEN").length,
      },
      users,
      destinations,
      packages,
      bookings,
      promotions,
      reviews,
      messages,
    });
  } catch (error) {
    console.error("Failed to load admin SaaS stats:", error);
    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const res = await ensureSeeded(true);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Failed to re-seed database:", error);
    return NextResponse.json(
      { error: "Failed to reset demo data" },
      { status: 500 }
    );
  }
}


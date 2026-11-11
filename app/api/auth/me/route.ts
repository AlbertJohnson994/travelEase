import { NextResponse } from "next/server";
import { getSessionUser, AUTH_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const bookingsCount = await prisma.booking.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        ...user,
        bookingsCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id || body.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updateData: {
      name?: string;
      email?: string;
      phone?: string | null;
      plan?: "FREE" | "PRO" | "ELITE";
      role?: "ADMIN" | "CUSTOMER";
    } = {};

    if (body.name) updateData.name = body.name.trim();
    if (body.email) updateData.email = body.email.trim().toLowerCase();
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.plan && ["FREE", "PRO", "ELITE"].includes(body.plan)) {
      updateData.plan = body.plan;
    }
    if (body.role && ["ADMIN", "CUSTOMER"].includes(body.role)) {
      updateData.role = body.role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const bookingsCount = await prisma.booking.count({
      where: { userId: updatedUser.id },
    });

    const response = NextResponse.json({
      message: "Profile updated",
      user: { ...updatedUser, bookingsCount },
    });

    response.cookies.set(AUTH_COOKIE_NAME, updatedUser.id, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}


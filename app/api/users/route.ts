import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed-helper";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await ensureSeeded(false);
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeeded(false);
    const { email, name, password, phone, role, plan } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password: hashedPassword,
        phone: phone || null,
        role: role === "ADMIN" ? "ADMIN" : "CUSTOMER",
        plan: plan === "PRO" || plan === "ELITE" ? plan : "FREE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, role, plan } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const data: {
      role?: "ADMIN" | "CUSTOMER";
      plan?: "FREE" | "PRO" | "ELITE";
    } = {};
    if (role && ["ADMIN", "CUSTOMER"].includes(role)) data.role = role;
    if (plan && ["FREE", "PRO", "ELITE"].includes(plan)) data.plan = plan;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

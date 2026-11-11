import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ensureSeeded } from "./seed-helper";

export const AUTH_COOKIE_NAME = "travelease_user_id";

export async function getSessionUser() {
  try {
    await ensureSeeded(false);
    const cookieStore = await cookies();
    const userId = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error("Error reading session user:", error);
    return null;
  }
}

export async function getEffectiveUser(fallbackToDemo = true) {
  const sessionUser = await getSessionUser();
  if (sessionUser) return sessionUser;

  if (!fallbackToDemo) return null;

  await ensureSeeded(false);
  const demoUser =
    (await prisma.user.findUnique({
      where: { email: "alex@travelease.com" },
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
    })) ||
    (await prisma.user.findFirst({
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
    }));

  return demoUser;
}

export function getPlanDiscountPercent(plan?: string | null): number {
  if (plan === "ELITE") return 20;
  if (plan === "PRO") return 10;
  return 0;
}


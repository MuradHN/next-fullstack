import { NextResponse } from "next/server";
import { ensureDefaultAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieName, sessionMaxAge } from "@/lib/session";

export async function POST(request: Request) {
  await ensureDefaultAdmin();

  const body = (await request.json()) as {
    email?: unknown;
    password?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });

  response.cookies.set({
    name: sessionCookieName,
    value: createSessionToken({
      userId: user.id,
      email: user.email
    }),
    httpOnly: true,
    maxAge: sessionMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

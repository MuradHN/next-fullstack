import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    email?: unknown;
    name?: unknown;
    password?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        email,
        name: name || null,
        ...(password ? { passwordHash: await hashPassword(password) } : {})
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: "Email already exists" }, { status: 409 });
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { user: currentUser, response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;

  if (currentUser?.id === id) {
    return NextResponse.json({ message: "You cannot delete your current user" }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    throw error;
  }
}

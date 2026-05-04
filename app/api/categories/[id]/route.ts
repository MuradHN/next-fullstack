import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
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
    name?: unknown;
    slug?: unknown;
  };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";

  if (!name || !slug) {
    return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({
      where: {
        id
      },
      data: {
        name,
        slug
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;

  try {
    await prisma.category.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Category has posts and cannot be deleted" },
          { status: 409 }
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }
    }

    throw error;
  }
}

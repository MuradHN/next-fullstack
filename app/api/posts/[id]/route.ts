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
    title?: unknown;
    description?: unknown;
    categoryId?: unknown;
    imageUrls?: unknown;
  };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : [];

  if (!title || !description || !categoryId) {
    return NextResponse.json(
      { message: "Title, description and category are required" },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.update({
      where: {
        id
      },
      data: {
        title,
        description,
        categoryId,
        images: {
          deleteMany: {},
          create: imageUrls.map((url) => ({
            url
          }))
        }
      },
      include: {
        category: true,
        images: true
      }
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ message: "Category not found" }, { status: 400 });
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
    await prisma.post.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    throw error;
  }
}

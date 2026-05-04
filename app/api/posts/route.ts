import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const posts = await prisma.post.findMany({
    include: {
      category: true,
      images: {
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

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
    const post = await prisma.post.create({
      data: {
        title,
        description,
        categoryId,
        images: {
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

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ message: "Category not found" }, { status: 400 });
    }

    throw error;
  }
}

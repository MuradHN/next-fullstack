import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const body = (await request.json()) as {
    imageUrl?: unknown;
    name?: unknown;
    slug?: unknown;
  };
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : null;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";

  if (!name || !slug) {
    return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: {
        imageUrl,
        name,
        slug
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
    }

    throw error;
  }
}

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const products = await prisma.product.findMany({
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

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const body = (await request.json()) as {
    categoryId?: unknown;
    description?: unknown;
    imageUrls?: unknown;
    name?: unknown;
    price?: unknown;
    quantity?: unknown;
  };
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = parseNumber(body.price);
  const quantity = parseNumber(body.quantity);

  if (!name || !description || !categoryId || price === null || quantity === null) {
    return NextResponse.json(
      { message: "Name, description, category, price and quantity are required" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        categoryId,
        description,
        inventory: quantity,
        name,
        price,
        quantity,
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

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ message: "Category not found" }, { status: 400 });
    }

    throw error;
  }
}

function parseNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  return Math.floor(numberValue);
}

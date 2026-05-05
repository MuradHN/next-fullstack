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
    categoryId?: unknown;
    description?: unknown;
    imageUrls?: unknown;
    inventory?: unknown;
    name?: unknown;
    price?: unknown;
    quantity?: unknown;
  };
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : [];
  const inventory = parseNumber(body.inventory);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = parseNumber(body.price);
  const quantity = parseNumber(body.quantity);

  if (
    !name ||
    !description ||
    !categoryId ||
    inventory === null ||
    price === null ||
    quantity === null
  ) {
    return NextResponse.json(
      { message: "Name, description, category, price, quantity and inventory are required" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: {
        id
      },
      data: {
        categoryId,
        description,
        inventory,
        name,
        price,
        quantity,
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

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
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
    await prisma.product.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
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

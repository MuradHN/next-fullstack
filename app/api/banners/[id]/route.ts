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
    image?: unknown;
    title?: unknown;
  };
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title || !image) {
    return NextResponse.json({ message: "Title and image are required" }, { status: 400 });
  }

  try {
    const banner = await prisma.banner.update({
      where: {
        id
      },
      data: {
        image,
        title
      }
    });

    return NextResponse.json({ banner });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 });
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
    await prisma.banner.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 });
    }

    throw error;
  }
}

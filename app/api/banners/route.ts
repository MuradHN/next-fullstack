import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const banners = await prisma.banner.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ banners });
}

export async function POST(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const body = (await request.json()) as {
    image?: unknown;
    title?: unknown;
  };
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title || !image) {
    return NextResponse.json({ message: "Title and image are required" }, { status: 400 });
  }

  const banner = await prisma.banner.create({
    data: {
      image,
      title
    }
  });

  return NextResponse.json({ banner }, { status: 201 });
}

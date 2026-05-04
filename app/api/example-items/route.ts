import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.exampleItem.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: unknown };
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  const item = await prisma.exampleItem.create({
    data: {
      title
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}

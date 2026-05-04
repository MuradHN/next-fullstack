import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function getExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if (extension) {
    return extension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "image/gif") {
    return ".gif";
  }

  return ".jpg";
}

export async function POST(request: Request) {
  const { response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ message: "At least one image is required" }, { status: 400 });
  }

  const invalidFile = files.find((file) => !allowedTypes.has(file.type));

  if (invalidFile) {
    return NextResponse.json(
      { message: "Only jpg, png, webp and gif images are allowed" },
      { status: 400 }
    );
  }

  await mkdir(uploadDir, {
    recursive: true
  });

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const fileName = `${Date.now()}-${randomUUID()}${getExtension(file)}`;
      const filePath = path.join(uploadDir, fileName);
      const bytes = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, bytes);

      return {
        name: file.name,
        url: `/uploads/${fileName}`
      };
    })
  );

  return NextResponse.json({ files: uploaded }, { status: 201 });
}

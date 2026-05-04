import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

export async function requireApiUser(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${sessionCookieName}=`))
    ?.split("=")[1];

  const payload = verifySessionToken(token);

  if (!payload) {
    return {
      user: null,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    user,
    response: null
  };
}

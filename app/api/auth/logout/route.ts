import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: sessionCookieName,
    value: "",
    maxAge: 0,
    path: "/"
  });

  return response;
}

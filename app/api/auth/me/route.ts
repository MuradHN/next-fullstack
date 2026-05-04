import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser(request);

  if (response) {
    return response;
  }

  return NextResponse.json({ user });
}

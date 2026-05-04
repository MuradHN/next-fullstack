import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

export const defaultAdmin = {
  email: "admin@gmail.com",
  password: "abcd1234",
  name: "Admin"
};

export async function ensureDefaultAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: defaultAdmin.email
    }
  });

  if (existingAdmin) {
    return prisma.user.update({
      where: {
        id: existingAdmin.id
      },
      data: {
        passwordHash: await hashPassword(defaultAdmin.password)
      }
    });
  }

  return prisma.user.create({
    data: {
      email: defaultAdmin.email,
      name: defaultAdmin.name,
      passwordHash: await hashPassword(defaultAdmin.password)
    }
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(sessionCookieName)?.value);

  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: payload.userId
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

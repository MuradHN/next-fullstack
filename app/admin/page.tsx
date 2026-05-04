import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [categories, posts, users] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.post.findMany({
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
    }),
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
  ]);

  return (
    <AdminDashboard
      currentUser={{
        id: user.id,
        email: user.email,
        name: user.name
      }}
      initialData={{
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          _count: category._count
        })),
        posts: posts.map((post) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          categoryId: post.categoryId,
          category: {
            id: post.category.id,
            name: post.category.name,
            slug: post.category.slug
          },
          images: post.images.map((image) => ({
            id: image.id,
            url: image.url
          }))
        })),
        users
      }}
    />
  );
}

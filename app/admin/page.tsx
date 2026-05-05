import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [banners, categories, products, users] = await Promise.all([
    prisma.banner.findMany({
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.product.findMany({
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
        banners: banners.map((banner) => ({
          id: banner.id,
          image: banner.image,
          title: banner.title
        })),
        categories: categories.map((category) => ({
          id: category.id,
          imageUrl: category.imageUrl,
          name: category.name,
          slug: category.slug,
          _count: category._count
        })),
        products: products.map((product) => ({
          id: product.id,
          categoryId: product.categoryId,
          category: {
            id: product.category.id,
            imageUrl: product.category.imageUrl,
            name: product.category.name,
            slug: product.category.slug
          },
          description: product.description,
          images: product.images.map((image) => ({
            id: image.id,
            url: image.url
          })),
          inventory: product.inventory,
          name: product.name,
          price: product.price,
          quantity: product.quantity
        })),
        users
      }}
    />
  );
}

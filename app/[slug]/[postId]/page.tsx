import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post-detail";
import { prisma } from "@/lib/prisma";

type PostDetailPageProps = {
  params: Promise<{
    slug: string;
    postId: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId, slug } = await params;
  const product = await prisma.product.findUnique({
    where: {
      id: postId
    },
    include: {
      category: true,
      images: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!product || product.category.slug !== slug) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: {
        not: product.id
      }
    },
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
    },
    take: 3
  });
  const headerCategories = await prisma.category.findMany({
    orderBy: {
      name: "asc"
    },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });

  return (
    <PostDetail
      headerCategories={headerCategories}
      post={product}
      relatedProducts={relatedProducts}
    />
  );
}

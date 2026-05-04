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
  const post = await prisma.post.findUnique({
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

  if (!post || post.category.slug !== slug) {
    notFound();
  }

  return <PostDetail post={post} />;
}

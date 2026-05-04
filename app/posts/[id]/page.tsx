import { redirect } from "next/navigation";
import { getPostUrl } from "@/lib/post-url";
import { prisma } from "@/lib/prisma";

type LegacyPostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LegacyPostDetailPage({ params }: LegacyPostDetailPageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: {
      id
    },
    include: {
      category: true
    }
  });

  if (!post) {
    redirect("/");
  }

  redirect(getPostUrl(post.category.slug, post.id));
}

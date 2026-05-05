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
  const product = await prisma.product.findUnique({
    where: {
      id
    },
    include: {
      category: true
    }
  });

  if (!product) {
    redirect("/");
  }

  redirect(getPostUrl(product.category.slug, product.id));
}

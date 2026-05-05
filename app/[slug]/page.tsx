import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getPostUrl } from "@/lib/post-url";
import { prisma } from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc"
    },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });
  const selectedCategory = categories.find((category) => category.slug === slug);

  if (!selectedCategory) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: selectedCategory.id
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
    }
  });

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <SiteHeader categories={categories} />

      <div className="border-b border-[#e4e7ec] bg-[#f7f8fa]">
        <div className="mx-auto max-w-[1280px] px-4 py-4 text-sm text-[#344054]">
          <Link className="font-bold text-[#101828]" href="/">
            Trang chủ
          </Link>
          <span className="px-2">/</span>
          <span>Danh mục</span>
          {selectedCategory ? (
            <>
              <span className="px-2">/</span>
              <span>{selectedCategory.name}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-6">
        <h1 className="text-3xl font-black leading-10">
          {selectedCategory?.name ?? "Danh mục sản phẩm"}
        </h1>

        <section className="mt-4 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-[#e4e7ec] pr-4 lg:block">
            <FilterGroup
              categories={categories}
              selectedSlug={selectedCategory?.slug}
              title="Loại tin"
            />
            <div className="mt-5 border-t border-[#e4e7ec] pt-4">
              <h2 className="text-sm font-black uppercase text-[#073199]">Quy cách đóng gói</h2>
              <div className="mt-3 grid gap-3 text-sm text-[#667085]">
                {["240 viên", "100 viên", "30 viên", "60 viên"].map((item) => (
                  <label className="flex items-center gap-2" key={item}>
                    <span className="size-4 rounded-full border border-[#d0d5dd]" />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-base text-[#667085]">Tổng sản phẩm: {products.length}</p>
              <button
                className="flex h-10 items-center gap-3 rounded-full border border-[#d0d5dd] px-4 text-sm font-semibold text-[#344054]"
                type="button"
              >
                Sắp xếp theo
                <ChevronDownIcon />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="rounded border border-[#e4e7ec] p-10 text-center text-[#667085]">
                Chưa có sản phẩm trong danh mục này.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard
                    categorySlug={product.category.slug}
                    imageUrl={product.images[0]?.url}
                    key={product.id}
                    name={product.name}
                    price={product.price}
                    productId={product.id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterGroup({
  categories,
  selectedSlug,
  title
}: {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  selectedSlug?: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="flex items-center justify-between border-b border-[#e4e7ec] pb-3 text-sm font-black uppercase text-[#073199]">
        {title}
        <ChevronUpIcon />
      </h2>
      <div className="mt-3 grid max-h-[500px] gap-3 overflow-y-auto pr-2 text-sm text-[#667085]">
        {categories.map((category) => {
          const isActive = category.slug === selectedSlug;

          return (
            <Link
              className={`flex items-center gap-2 ${isActive ? "font-bold text-[#073199]" : ""}`}
              href={`/${category.slug}`}
              key={category.id}
            >
              <span
                className={`size-4 rounded-full border ${
                  isActive ? "border-[#0d6efd] bg-[#0d6efd]" : "border-[#d0d5dd]"
                }`}
              />
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ProductCard({
  categorySlug,
  imageUrl,
  name,
  price,
  productId
}: {
  categorySlug: string;
  imageUrl?: string;
  name: string;
  price: number;
  productId: string;
}) {
  return (
    <Link
      className="grid min-h-[410px] rounded border border-[#e4e7ec] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
      href={getPostUrl(categorySlug, productId)}
    >
      <p className="text-xs font-semibold text-[#101828]">#{productId.slice(-5)}</p>
      <div className="relative mt-3 aspect-square">
        {imageUrl ? (
          <Image alt={name} className="object-contain" fill sizes="220px" src={imageUrl} />
        ) : (
          <div className="flex size-full items-center justify-center bg-[#f2f4f7] text-xs text-[#98a2b3]">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 self-end">
        <h2 className="line-clamp-2 min-h-[48px] text-base font-black leading-6">{name}</h2>
        <p className="mt-3 text-lg font-black text-[#ff0000]">{formatVnd(price)}</p>
        <p className="mt-3 text-sm text-[#344054]">{formatUnitPrice(price)}/Viên</p>
      </div>
    </Link>
  );
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency"
  }).format(value);
}

function formatUnitPrice(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.max(1, Math.round(value / 30)));
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <IconBase>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

function ChevronUpIcon() {
  return (
    <IconBase>
      <path d="m18 15-6-6-6 6" />
    </IconBase>
  );
}

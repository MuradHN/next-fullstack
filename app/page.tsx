import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { SiteHeader } from "@/components/site-header";
import { getPostUrl } from "@/lib/post-url";
import { prisma } from "@/lib/prisma";

const fallbackCategories = [
  "Dược phẩm",
  "TPCN",
  "Chăm sóc da",
  "Thiết bị y tế",
  "Mẹ và Bé",
  "Chăm sóc cá nhân"
];

const badges = ["-15%", "Bán chạy", "Mới", ""];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [banners, products] = await Promise.all([
    prisma.banner.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 5
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
    })
  ]);

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc"
    },
    take: 6
  });

  const [featuredProduct, ...otherProducts] = products;
  const productCards = products.slice(0, 4);
  const articleProducts =
    otherProducts.length > 0 ? otherProducts.slice(0, 3) : products.slice(0, 3);
  const categoryCards =
    categories.length > 0
      ? categories.map((category) => ({
          imageUrl: category.imageUrl,
          name: category.name,
          slug: category.slug
        }))
      : fallbackCategories.map((name) => ({
          imageUrl: null,
          name,
          slug: ""
        }));
  const headerCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug
  }));

  return (
    <main className="min-h-screen bg-[#f7f9ff] text-[#181c20]">
      <SiteHeader categories={headerCategories} />

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-11 px-4 pb-12 pt-5 sm:px-6">
        <HeroSection banners={banners} featuredProduct={featuredProduct} />
        <CategorySection categories={categoryCards.slice(0, 6)} />

        {products.length === 0 ? (
          <section className="rounded-[7px] bg-white p-10 text-center text-[#4b5563] shadow-sm">
            Chưa có sản phẩm nào. Đăng nhập admin để tạo sản phẩm đầu tiên.
          </section>
        ) : (
          <>
            <ProductSection products={productCards} />
            <ArticleSection products={articleProducts} />
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}

function HeroSection({
  banners,
  featuredProduct
}: {
  banners: Array<{
    image: string;
    title: string;
  }>;
  featuredProduct?: {
    id: string;
    description: string;
    name: string;
    category: { slug: string; name: string };
    images: Array<{ url: string }>;
  };
}) {
  const slides =
    banners.length > 0
      ? banners.map((banner) => ({
          eyebrow: "Khuyến mãi",
          href: featuredProduct
            ? getPostUrl(featuredProduct.category.slug, featuredProduct.id)
            : "/",
          image: banner.image,
          subtitle:
            featuredProduct?.description ??
            "Chuyên trang dược phẩm và sức khỏe, cập nhật các nội dung chăm sóc sức khỏe mới nhất.",
          title: banner.title
        }))
      : [
          {
            eyebrow: featuredProduct?.category.name ?? "Sản phẩm mới",
            href: featuredProduct
              ? getPostUrl(featuredProduct.category.slug, featuredProduct.id)
              : "/admin",
            image: featuredProduct?.images[0]?.url,
            subtitle:
              featuredProduct?.description ??
              "Chuyên trang dược phẩm và sức khỏe, cập nhật các nội dung chăm sóc sức khỏe mới nhất.",
            title: featuredProduct?.name ?? "Long Châu Pharma"
          }
        ];

  return (
    <section className="grid gap-5 lg:grid-cols-12">
      <HeroSlider slides={slides} />

      <div className="grid gap-5 lg:col-span-4">
        <ServiceCard
          body="Đặt hàng online nhận ngay tại nhà chỉ trong vòng 2 giờ đồng hồ."
          tone="blue"
          title="Giao hàng nhanh 2H"
        />
        <ServiceCard
          body="Đội ngũ dược sĩ giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7."
          tone="green"
          title="Tư vấn bởi Dược sĩ"
        />
      </div>
    </section>
  );
}

function ServiceCard({
  body,
  title,
  tone
}: {
  body: string;
  title: string;
  tone: "blue" | "green";
}) {
  return (
    <article
      className={`relative min-h-[188px] overflow-hidden rounded-[7px] p-5 text-white ${
        tone === "blue" ? "bg-[#0d6efd]" : "bg-[#198754]"
      }`}
    >
      <h2 className="text-lg font-bold leading-[19px]">{title}</h2>
      <p className="mt-2 max-w-[290px] text-[13px] leading-[19px] text-white/90">{body}</p>
      <div className="absolute -bottom-4 -right-4 flex size-28 items-center justify-center rounded-full border-[10px] border-white/10 text-white/20">
        {tone === "blue" ? <TruckIcon /> : <PharmacistIcon />}
      </div>
    </article>
  );
}

function CategorySection({
  categories
}: {
  categories: Array<{
    imageUrl: string | null;
    name: string;
    slug: string;
  }>;
}) {
  return (
    <section className="grid gap-5">
      <SectionHeader title="Danh mục nổi bật" action="Xem tất cả" />
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category, index) => (
          <Link
            className="flex min-h-[130px] flex-col items-center justify-center gap-3 rounded-[7px] bg-white p-4 text-center shadow-[0_2px_2px_rgba(0,0,0,0.08)]"
            href={category.slug ? `/${category.slug}` : "/"}
            key={`${category.name}-${index}`}
          >
            <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-xl bg-[#ebeef3] text-[#0d6efd]">
              {category.imageUrl ? (
                <Image alt={category.name} className="object-cover" fill src={category.imageUrl} />
              ) : (
                <CategoryIcon index={index} />
              )}
            </div>
            <p className="text-[15px] font-bold leading-[23px]">{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSection({
  products
}: {
  products: Array<{
    id: string;
    description: string;
    name: string;
    price: number;
    category: { slug: string; name: string };
    images: Array<{ url: string }>;
  }>;
}) {
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold leading-8 text-[#073199]">Sản phẩm Bán Chạy</h2>
        <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white">
          Hot
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <Link
            className="group overflow-hidden rounded-[7px] bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-lg"
            href={getPostUrl(product.category.slug, product.id)}
            key={product.id}
          >
            <div className="relative aspect-square overflow-hidden rounded-[7px] bg-[#ebeef3]">
              {product.images[0]?.url ? (
                <Image
                  alt={product.name}
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 768px) 100vw, 293px"
                  src={product.images[0].url}
                />
              ) : null}
              {badges[index] ? (
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold text-white ${
                    index === 0
                      ? "bg-[#ffc107] text-[#181c20]"
                      : index === 1
                        ? "bg-[#198754]"
                        : "bg-[#0d6efd]"
                  }`}
                >
                  {badges[index]}
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-2">
              <p className="text-xs text-[#6c757d]">{product.category.name}</p>
              <h3 className="line-clamp-2 min-h-[38px] text-sm font-bold leading-[19px] text-[#212529]">
                {product.name}
              </h3>
              <p className="text-base font-bold text-[#dc3545]">{formatVnd(product.price)}</p>
              <span className="flex h-[38px] items-center justify-center gap-2 rounded bg-[#0d6efd] text-sm font-bold text-white">
                <CartIcon />
                Chọn mua
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ArticleSection({
  products
}: {
  products: Array<{
    id: string;
    description: string;
    name: string;
    createdAt: Date;
    category: { slug: string; name: string };
    images: Array<{ url: string }>;
  }>;
}) {
  return (
    <section className="grid gap-5">
      <SectionHeader title="Góc Sức Khỏe" action="Xem tất cả bài viết" />
      <div className="grid gap-5 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            className="group overflow-hidden rounded-[7px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-lg"
            href={getPostUrl(product.category.slug, product.id)}
            key={product.id}
          >
            <div className="relative h-48 bg-[#ebeef3]">
              {product.images[0]?.url ? (
                <Image
                  alt={product.name}
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 1024px) 100vw, 395px"
                  src={product.images[0].url}
                />
              ) : null}
            </div>
            <div className="grid gap-2 p-4">
              <p className="text-xs font-bold uppercase text-[#0d6efd]">{product.category.name}</p>
              <h3 className="line-clamp-2 text-lg font-bold leading-[19px] text-[#212529]">
                {product.name}
              </h3>
              <p className="line-clamp-2 text-[13px] leading-[19px] text-[#6c757d]">
                {product.description}
              </p>
              <p className="flex items-center gap-1 pt-1 text-xs text-[#6c757d]">
                <CalendarIcon />
                {new Intl.DateTimeFormat("vi-VN").format(product.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ action, title }: { action: string; title: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-2xl font-bold leading-8 text-[#073199]">{title}</h2>
      <Link className="flex shrink-0 items-center gap-1 text-sm font-bold text-[#0d6efd]" href="/">
        {action}
        <ChevronRightIcon />
      </Link>
    </div>
  );
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency"
  }).format(value);
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-xl font-bold leading-7 text-[#073199]">Long Châu Pharma</h2>
          <p className="mt-3 text-[13px] leading-5 text-[#4b5563]">
            © 2024 FPT Long Châu. Chuyên trang dược phẩm hàng đầu Việt Nam. Tận tâm phục vụ vì sức
            khỏe cộng đồng.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#ebeef3] text-[#073199]">
              f
            </span>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#ebeef3] text-[#073199]">
              z
            </span>
          </div>
        </div>
        <FooterColumn
          title="Về chúng tôi"
          items={["Giới thiệu công ty", "Hệ thống nhà thuốc", "Tuyển dụng", "Liên hệ"]}
        />
        <FooterColumn
          title="Chính sách"
          items={[
            "Chính sách bảo mật",
            "Điều khoản sử dụng",
            "Chính sách đổi trả",
            "Giao hàng và Thanh toán"
          ]}
        />
        <div>
          <h3 className="text-[15px] font-bold leading-[23px] text-[#073199]">Tổng đài hỗ trợ</h3>
          <div className="mt-4 grid gap-3 text-base font-bold text-[#073199]">
            <p className="flex items-center gap-2">
              <PhoneIcon />
              Mua hàng: 1800 6928
            </p>
            <p className="flex items-center gap-2">
              <MessageIcon />
              Góp ý: 1800 6928
            </p>
            <Link
              className="mt-1 flex h-12 items-center justify-center rounded bg-[#0d6efd] px-4 text-center text-white"
              href="/login"
            >
              Tải App Long Châu ngay!
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#e5e7eb] py-6 text-center text-xs text-[#6c757d]">
        © 2024 FPT Long Châu. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}

function FooterColumn({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold leading-[23px] text-[#073199]">{title}</h3>
      <ul className="mt-4 grid gap-2 text-[13px] leading-5 text-[#4b5563]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
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

function CartIcon() {
  return (
    <IconBase>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.1 2.1h2l2.7 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 7H5.1" />
    </IconBase>
  );
}

function ChevronRightIcon() {
  return (
    <IconBase>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function CalendarIcon() {
  return (
    <IconBase>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18" />
    </IconBase>
  );
}

function PhoneIcon() {
  return (
    <IconBase>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" />
    </IconBase>
  );
}

function MessageIcon() {
  return (
    <IconBase>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </IconBase>
  );
}

function TruckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M14 8h4l4 4v5h-3" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function PharmacistIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 21a8 8 0 0 0 8-8V8l-8-4-8 4v5a8 8 0 0 0 8 8Z" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  );
}

function CategoryIcon({ index }: { index: number }) {
  const icons = [
    <path d="m10 21 10-10a4 4 0 0 0-6-6L4 15v6h6Z" key="pill" />,
    <path d="M12 21s7-4 7-10V5l-7-3-7 3v6c0 6 7 10 7 10Z" key="shield" />,
    <path d="M12 22c4-4 8-7 8-12a8 8 0 1 0-16 0c0 5 4 8 8 12Z" key="care" />,
    <path d="M7 7h10v14H7z M9 3h6v4H9z M10 13h4 M12 11v4" key="kit" />,
    <path d="M12 21c-4-3-7-6-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7-7 10Z" key="heart" />,
    <path d="M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4" key="doc" />
  ];

  return <IconBase>{icons[index % icons.length]}</IconBase>;
}

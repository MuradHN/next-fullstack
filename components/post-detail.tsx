import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getPostUrl } from "@/lib/post-url";

type ProductDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  inventory: number;
  createdAt: Date;
  category: {
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
  }>;
};

type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
};

export function PostDetail({
  headerCategories = [],
  post,
  relatedProducts = []
}: {
  headerCategories?: HeaderCategory[];
  post: ProductDetail;
  relatedProducts?: ProductDetail[];
}) {
  const mainImage = post.images[0]?.url;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#101828]">
      <SiteHeader categories={headerCategories} />

      <div className="mx-auto max-w-[1280px] px-4 py-4">
        <div className="mb-3 text-xs text-[#667085]">
          Trang chủ / {post.category.name} / <span className="text-[#344054]">{post.name}</span>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
            <ProductGallery mainImage={mainImage} name={post.name} thumbnails={post.images} />
            <ProductPurchasePanel post={post} />
          </div>

          <aside className="hidden lg:block">
            <RelatedProducts products={relatedProducts} />
          </aside>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="bg-white">
            <div className="flex border-b border-[#e4e7ec] text-xs font-semibold">
              <button className="border-b-2 border-[#0d6efd] px-4 py-3 text-[#0d6efd]">
                Thông tin sản phẩm
              </button>
              <button className="px-4 py-3 text-[#475467]">Thành phần</button>
              <button className="px-4 py-3 text-[#475467]">Cách dùng</button>
            </div>

            <div className="grid gap-6 p-5">
              <section>
                <h2 className="text-lg font-bold text-[#101828]">Thông tin sản phẩm</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#475467]">
                  {post.description}
                </p>
              </section>

              <section className="overflow-hidden bg-[#f8fafc]">
                <h3 className="px-4 pt-4 text-base font-bold">Thành phần chính</h3>
                <div className="mt-3 divide-y divide-[#e4e7ec] text-sm">
                  <div className="flex justify-between px-4 py-3">
                    <span className="font-semibold">Hoạt chất chính</span>
                    <span>1500 mg</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="font-semibold">Tá dược vừa đủ</span>
                    <span>1 viên</span>
                  </div>
                </div>
                <p className="px-4 py-3 text-xs italic text-[#667085]">
                  Thông tin thành phần có thể được cập nhật trong phần mô tả sản phẩm.
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold">Cách dùng</h3>
                <div className="mt-3 grid gap-3 text-sm text-[#475467]">
                  {[
                    ["Đọc kỹ hướng dẫn", "Luôn đọc hướng dẫn sử dụng trước khi dùng sản phẩm."],
                    ["Liều lượng", "Dùng theo chỉ định của chuyên gia hoặc hướng dẫn trên bao bì."],
                    ["Bảo quản", "Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp."]
                  ].map(([title, body], index) => (
                    <div className="flex gap-3" key={title}>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0d6efd] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <p>
                        <strong className="block text-[#101828]">{title}</strong>
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className="grid gap-4 lg:hidden">
            <RelatedProducts products={relatedProducts} />
          </aside>
          <aside className="hidden lg:grid">
            <AppPromo />
          </aside>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function ProductGallery({
  mainImage,
  name,
  thumbnails
}: {
  mainImage?: string;
  name: string;
  thumbnails: Array<{ id: string; url: string }>;
}) {
  return (
    <div className="bg-white p-4">
      <div className="relative aspect-square border border-[#e4e7ec] bg-white">
        {mainImage ? (
          <Image
            alt={name}
            className="object-contain p-4"
            fill
            priority
            sizes="540px"
            src={mainImage}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-[#98a2b3]">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {(thumbnails.length > 0 ? thumbnails.slice(0, 5) : [{ id: "empty", url: "" }]).map(
          (image, index) => (
            <div
              className={`relative aspect-square border bg-white ${
                index === 0 ? "border-[#0d6efd]" : "border-[#e4e7ec]"
              }`}
              key={image.id}
            >
              {image.url ? (
                <Image
                  alt={`${name} ${index + 1}`}
                  className="object-contain p-2"
                  fill
                  sizes="96px"
                  src={image.url}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ProductPurchasePanel({ post }: { post: ProductDetail }) {
  return (
    <section className="bg-white p-4">
      <p className="text-xs font-bold text-[#0d6efd]">Thương hiệu Long Châu</p>
      <h1 className="mt-1 text-2xl font-bold leading-8 text-[#101828]">{post.name}</h1>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="text-[#fdb022]">★★★★★</span>
        <span className="text-[#667085]">
          | Đã bán {post.quantity} | SKU #{post.id.slice(-6)}
        </span>
      </div>

      <div className="mt-4 bg-[#f8fafc] p-4">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#ef233c]">{formatVnd(post.price)}</span>
          {post.price > 0 ? (
            <span className="mb-1 text-sm text-[#98a2b3] line-through">
              {formatVnd(post.price * 1.2)}
            </span>
          ) : null}
          <span className="mb-1 rounded-full bg-[#ef233c] px-2 py-0.5 text-xs font-bold text-white">
            -17%
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#039855]">
          <CheckIcon />
          {post.inventory > 0 ? "Còn hàng" : "Hết hàng"}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[#667085]">Chọn số lượng</p>
          <div className="mt-2 flex h-9 w-28 items-center justify-between border border-[#d0d5dd] text-sm">
            <button className="h-full w-9 text-lg text-[#667085]">−</button>
            <span>1</span>
            <button className="h-full w-9 text-lg text-[#667085]">+</button>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#667085]">Giao hàng đến</p>
          <p className="mt-2 text-sm font-semibold text-[#101828]">
            <LocationIcon /> Hồ Chí Minh, Quận 1
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <button className="flex h-10 items-center justify-center gap-2 bg-[#073199] text-sm font-bold text-white">
          <CartIcon />
          Chọn mua
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="h-10 border border-[#0d6efd] text-sm font-bold text-[#0d6efd]">
            Tư vấn ngay
          </button>
          <button className="h-10 border border-[#d0d5dd] text-sm font-bold text-[#101828]">
            Mua tại cửa hàng
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#e4e7ec] pt-4 text-center text-xs text-[#475467]">
        <Benefit icon={<ShieldIcon />} text="100% Chính hãng" />
        <Benefit icon={<TruckSmallIcon />} text="Miễn phí vận chuyển" />
        <Benefit icon={<ClockIcon />} text="Đổi ý 03 ngày" />
      </div>
    </section>
  );
}

function RelatedProducts({ products }: { products: ProductDetail[] }) {
  return (
    <section className="bg-white p-4">
      <h2 className="text-base font-bold">Sản phẩm tương tự</h2>
      <div className="mt-3 grid gap-3">
        {products.length === 0 ? (
          <p className="text-sm text-[#667085]">Chưa có sản phẩm tương tự.</p>
        ) : (
          products.map((product) => (
            <Link
              className="grid grid-cols-[72px_1fr] gap-3 border border-[#e4e7ec] p-2"
              href={getPostUrl(product.category.slug, product.id)}
              key={product.id}
            >
              <div className="relative aspect-square bg-white">
                {product.images[0]?.url ? (
                  <Image
                    alt={product.name}
                    className="object-contain"
                    fill
                    sizes="72px"
                    src={product.images[0].url}
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              <div>
                <h3 className="line-clamp-2 text-xs font-bold leading-5">{product.name}</h3>
                <p className="mt-1 text-sm font-bold text-[#ef233c]">{formatVnd(product.price)}</p>
                <p className="text-[11px] text-[#667085]">Lọ 30 viên</p>
              </div>
            </Link>
          ))
        )}
      </div>
      <Link
        className="mt-3 flex h-9 items-center justify-center border border-[#0d6efd] text-xs font-bold text-[#0d6efd]"
        href="/"
      >
        Xem tất cả
      </Link>
    </section>
  );
}

function AppPromo() {
  return (
    <section className="bg-[#0d6efd] p-4 text-white">
      <p className="w-fit bg-[#ffd60a] px-2 py-1 text-[10px] font-bold uppercase text-[#101828]">
        Ưu đãi độc quyền
      </p>
      <h2 className="mt-3 text-base font-bold">Tải ứng dụng Long Châu</h2>
      <p className="mt-2 text-xs leading-5 text-white/90">
        Nhận ngay ưu đãi giảm giá khi đặt hàng lần đầu qua App.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex size-16 items-center justify-center bg-white text-xs text-[#101828]">
          QR
        </div>
        <div className="grid gap-1 text-xs font-bold">
          <span className="rounded bg-black px-3 py-1">App Store</span>
          <span className="rounded bg-black px-3 py-1">Google Play</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-8 bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h2 className="font-bold text-[#073199]">Long Châu Pharma</h2>
          <p className="mt-2 text-xs leading-5 text-[#667085]">
            © 2024 FPT Long Châu. Chuyên trang dược phẩm hàng đầu Việt Nam.
          </p>
        </div>
        <FooterColumn title="Về chúng tôi" items={["Hệ thống cửa hàng", "Liên hệ", "Tuyển dụng"]} />
        <FooterColumn
          title="Chính sách"
          items={["Chính sách bảo mật", "Điều khoản sử dụng", "Chính sách đổi trả"]}
        />
        <div>
          <h3 className="font-bold">Tổng đài hỗ trợ</h3>
          <p className="mt-2 text-xs text-[#475467]">1800 6928 (Mua hàng)</p>
          <p className="mt-2 text-xs text-[#475467]">1800 6928 (Góp ý)</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 grid gap-2 text-xs text-[#667085]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="grid justify-items-center gap-1">
      <span className="text-[#0d6efd]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex size-full items-center justify-center text-[#98a2b3]">
      <ImageIcon />
    </div>
  );
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency"
  }).format(value);
}

function IconBase({
  children,
  className = "size-4"
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
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

function CheckIcon() {
  return (
    <IconBase>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

function LocationIcon() {
  return (
    <span className="inline-flex text-[#0d6efd]">
      <IconBase>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </IconBase>
    </span>
  );
}

function ShieldIcon() {
  return (
    <IconBase className="size-6">
      <path d="M12 21s7-4 7-10V5l-7-3-7 3v6c0 6 7 10 7 10Z" />
    </IconBase>
  );
}

function TruckSmallIcon() {
  return (
    <IconBase className="size-6">
      <path d="M10 17h4V5H2v12h3" />
      <path d="M14 8h4l4 4v5h-3" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </IconBase>
  );
}

function ClockIcon() {
  return (
    <IconBase className="size-6">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </IconBase>
  );
}

function ImageIcon() {
  return (
    <IconBase>
      <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </IconBase>
  );
}

import Image from "next/image";
import Link from "next/link";

type PostDetail = {
  title: string;
  description: string;
  createdAt: Date;
  category: {
    name: string;
  };
  images: Array<{
    id: string;
    url: string;
  }>;
};

export function PostDetail({ post }: { post: PostDetail }) {
  return (
    <main className="min-h-screen bg-[#f2f2f2] text-[#222]">
      <header className="border-b-4 border-[#f15a24] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link className="text-3xl font-black uppercase text-[#f15a24]" href="/">
            Next14
          </Link>
          <Link className="text-sm font-bold uppercase text-[#f15a24]" href="/">
            Trang chủ
          </Link>
        </div>
      </header>

      <article className="mx-auto grid max-w-4xl gap-6 px-4 py-8">
        <div className="rounded bg-white p-6 shadow-sm max-sm:p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded bg-[#f15a24] px-2 py-1 text-xs font-bold uppercase text-white">
              {post.category.name}
            </span>
            <span className="text-sm text-[#777]">
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short"
              }).format(post.createdAt)}
            </span>
          </div>

          <h1 className="m-0 text-4xl font-black leading-tight max-sm:text-3xl">{post.title}</h1>
          <p className="mt-5 whitespace-pre-line text-lg font-medium leading-8 text-[#444]">
            {post.description}
          </p>
        </div>

        {post.images.length > 0 ? (
          <section className="grid gap-4">
            {post.images.map((image, index) => (
              <div
                className="relative aspect-[16/9] overflow-hidden rounded bg-[#ddd]"
                key={image.id}
              >
                <Image
                  alt={`${post.title} ${index + 1}`}
                  className="object-cover"
                  fill
                  priority={index === 0}
                  sizes="(max-width: 896px) 100vw, 896px"
                  src={image.url}
                />
              </div>
            ))}
          </section>
        ) : null}
      </article>
    </main>
  );
}

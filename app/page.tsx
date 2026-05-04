import Image from "next/image";
import Link from "next/link";
import { getPostUrl } from "@/lib/post-url";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const posts = await prisma.post.findMany({
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
  const [featuredPost, ...otherPosts] = posts;
  const sidePosts = otherPosts.slice(0, 2);
  const latestPosts = otherPosts.slice(2);

  return (
    <main className="min-h-screen bg-[#f2f2f2] text-[#222]">
      <header className="border-b-4 border-[#f15a24] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="text-3xl font-black uppercase text-[#f15a24]" href="/">
            Next14
          </Link>
          <Link
            className="rounded bg-[#f15a24] px-4 py-2 text-sm font-bold text-white hover:bg-[#d94d1f]"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        <div className="border-b border-[#d8d8d8] pb-3">
          <h1 className="m-0 text-2xl font-black uppercase text-[#333]">Tin mới nhất</h1>
        </div>

        {posts.length === 0 ? (
          <div className="rounded bg-white p-10 text-center text-app-muted">
            Chưa có bài viết nào. Đăng nhập admin để tạo bài viết đầu tiên.
          </div>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              {featuredPost ? (
                <Link
                  className="block overflow-hidden rounded bg-white text-inherit shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  href={getPostUrl(featuredPost.category.slug, featuredPost.id)}
                >
                  <PostImage
                    alt={featuredPost.title}
                    className="aspect-[16/9]"
                    src={featuredPost.images[0]?.url}
                  />
                  <div className="grid gap-3 p-5">
                    <span className="w-fit rounded bg-[#f15a24] px-2 py-1 text-xs font-bold uppercase text-white">
                      {featuredPost.category.name}
                    </span>
                    <h2 className="m-0 text-3xl font-black leading-tight max-sm:text-2xl">
                      {featuredPost.title}
                    </h2>
                    <p className="m-0 text-base leading-relaxed text-[#555]">
                      {featuredPost.description}
                    </p>
                  </div>
                </Link>
              ) : null}

              <div className="grid gap-5">
                {sidePosts.map((post) => (
                  <Link
                    className="block overflow-hidden rounded bg-white text-inherit shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href={getPostUrl(post.category.slug, post.id)}
                    key={post.id}
                  >
                    <PostImage
                      alt={post.title}
                      className="aspect-[16/9]"
                      src={post.images[0]?.url}
                    />
                    <div className="grid gap-2 p-4">
                      <span className="text-xs font-bold uppercase text-[#f15a24]">
                        {post.category.name}
                      </span>
                      <h3 className="m-0 text-xl font-black leading-tight">{post.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  className="grid overflow-hidden rounded bg-white text-inherit shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  href={getPostUrl(post.category.slug, post.id)}
                  key={post.id}
                >
                  <PostImage alt={post.title} className="aspect-[4/3]" src={post.images[0]?.url} />
                  <div className="grid gap-2 p-4">
                    <span className="text-xs font-bold uppercase text-[#f15a24]">
                      {post.category.name}
                    </span>
                    <h3 className="m-0 text-lg font-black leading-tight">{post.title}</h3>
                    <p className="m-0 line-clamp-3 text-sm leading-6 text-[#666]">
                      {post.description}
                    </p>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function PostImage({ alt, className, src }: { alt: string; className: string; src?: string }) {
  if (!src) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#ddd] text-sm text-[#777]`}
      >
        No image
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-[#ddd]`}>
      <Image
        alt={alt}
        className="object-cover"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={src}
      />
    </div>
  );
}

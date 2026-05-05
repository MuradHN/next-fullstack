"use client";

import { Modal } from "antd";
import Link from "next/link";
import { useState } from "react";

type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
};

export function SiteHeader({ categories = [] }: { categories?: HeaderCategory[] }) {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const visibleCategories = categories.slice(0, 3);
  const hasMoreCategories = categories.length > visibleCategories.length;

  return (
    <header className="bg-[#073199] text-white shadow-sm">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-2">
        <Link className="w-28 text-lg font-black uppercase leading-5" href="/">
          Long Châu Pharma
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-xs font-semibold md:flex">
          {visibleCategories.map((category) => (
            <Link
              className="text-white/85 hover:text-white"
              href={getCategoryHref(category.slug)}
              key={category.id}
            >
              {category.name}
            </Link>
          ))}
          {hasMoreCategories ? (
            <button
              className="text-white/85 hover:text-white"
              onClick={() => setCategoryModalOpen(true)}
              type="button"
            >
              Xem thêm
            </button>
          ) : null}
        </nav>
        <form className="hidden h-8 w-[320px] items-center bg-white lg:flex">
          <input
            className="min-w-0 flex-1 px-3 text-xs text-[#344054] outline-none"
            placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..."
            type="search"
          />
          <button
            aria-label="Tìm kiếm"
            className="flex h-8 w-10 items-center justify-center bg-[#0dcaf0]"
            type="submit"
          >
            <SearchIcon />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-4 text-white/90 lg:ml-0">
          <CartIcon />
          <UserIcon />
          <BellIcon />
        </div>
      </div>

      <Modal
        footer={null}
        onCancel={() => setCategoryModalOpen(false)}
        open={categoryModalOpen}
        title="Tất cả danh mục"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              className="rounded border border-[#e4e7ec] px-3 py-2 text-sm font-medium text-[#101828] transition hover:border-[#0d6efd] hover:text-[#0d6efd]"
              href={getCategoryHref(category.slug)}
              key={category.id}
              onClick={() => setCategoryModalOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </Modal>
    </header>
  );
}

function getCategoryHref(slug: string) {
  return `/${slug}`;
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

function SearchIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </IconBase>
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

function UserIcon() {
  return (
    <IconBase>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
  );
}

function BellIcon() {
  return (
    <IconBase>
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    </IconBase>
  );
}

# Next Prisma Starter

Source nền cho frontend và backend bằng Next.js App Router, TypeScript và Prisma.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Ant Design
- Jotai atom state
- API routes trong `app/api`
- Prisma ORM
- SQLite local mặc định qua `DATABASE_URL`

## Chạy local

```bash
npm install
npm run db:push
npm run dev
```

Ứng dụng chạy tại `http://localhost:3000`.

Tài khoản mặc định được tạo khi login lần đầu:

```text
email: admin@gmail.com
password: abcd1234
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:push
```

## Cấu trúc chính

- `app/page.tsx`: trang chủ public hiển thị danh sách bài viết
- `app/login/page.tsx`: màn hình đăng nhập
- `app/admin/page.tsx`: dashboard quản trị
- `app/providers.tsx`: provider chung cho Ant Design và Jotai
- `components/admin-dashboard.tsx`: CRUD categories, posts, users
- `components/login-form.tsx`: login form
- `components/setup-status.tsx`: component mẫu dùng Ant Design và Jotai atom
- `state/app-atoms.ts`: atom state mẫu
- `app/api/health/route.ts`: health check API
- `app/api/example-items/route.ts`: API mẫu có đọc/ghi database
- `app/api/auth/*`: login, logout, current user
- `app/api/categories/*`: CRUD danh mục
- `app/api/posts/*`: CRUD bài post
- `app/api/uploads`: upload một hoặc nhiều ảnh cho bài viết
- `app/api/users/*`: CRUD user đăng nhập
- `lib/prisma.ts`: Prisma Client singleton
- `lib/auth.ts`: auth helpers và tài khoản admin mặc định
- `lib/session.ts`: signed session cookie
- `lib/password.ts`: password hashing
- `prisma/schema.prisma`: database schema
- `tailwind.config.ts`: cấu hình Tailwind

Khi bắt đầu implement business, thêm model vào `prisma/schema.prisma`, chạy migration, rồi tạo service/API route tương ứng.

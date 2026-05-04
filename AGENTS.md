# Project Context For AI Agents

This file is the fast-entry context for coding agents. Read it before changing code.

## Product

Small news/CMS app built with Next.js. It has:

- Public homepage at `/` showing posts in a news layout.
- Public post detail at `/{categorySlug}/{postId}`.
- Legacy detail route `/posts/{postId}` redirects to `/{categorySlug}/{postId}`.
- Admin login at `/login`.
- Admin dashboard at `/admin` for CRUD categories, posts, and users.

Default login:

```text
email: admin@gmail.com
password: abcd1234
```

`ensureDefaultAdmin()` keeps this default admin login available.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Ant Design
- Jotai
- Prisma ORM
- SQLite local database via `.env`:

```env
DATABASE_URL="file:./dev.db"
```

## Database

Schema source: `prisma/schema.prisma`.

Main models:

- `User`: login users. Password is stored as `passwordHash`.
- `Category`: `name`, unique `slug`.
- `Post`: `title`, `description`, belongs to a category.
- `PostImage`: one post has many images. Image files live in `public/uploads`.
- `ExampleItem`: starter/sample model; not part of main business.

After schema changes:

```bash
npm run prisma:generate
npm run db:push
```

Use `db:push` for current local-dev workflow. Use migrations later when production history matters.

## Auth

- Login API: `POST /api/auth/login`
- Logout API: `POST /api/auth/logout`
- Current user API: `GET /api/auth/me`
- Session cookie name is in `lib/session.ts`.
- Session token is HMAC-signed and HTTP-only.
- Password hashing is in `lib/password.ts` using Node `crypto.scrypt`.
- API auth guard is `requireApiUser()` in `lib/api-auth.ts`.

All admin CRUD APIs must call `requireApiUser()`.

## API

- `app/api/categories/*`: CRUD categories.
- `app/api/posts/*`: CRUD posts.
- `app/api/users/*`: CRUD users.
- `app/api/uploads`: multipart image upload. Saves files to `public/uploads` and returns image URLs.

Post create/update expects optional:

```ts
imageUrls?: string[];
```

## UI

- Public homepage: `app/page.tsx`
- Public detail UI: `components/post-detail.tsx`
- Dynamic detail route: `app/[slug]/[postId]/page.tsx`
- Admin server entry: `app/admin/page.tsx`
- Admin client dashboard: `components/admin-dashboard.tsx`
- Login form: `components/login-form.tsx`
- URL helper: `lib/post-url.ts`

Use `getPostUrl(category.slug, post.id)` for post links.

## Runtime Files

- SQLite file: `dev.db` in project root. It is ignored by git.
- Uploaded images: `public/uploads/*`. They are ignored by git except `.gitkeep`.
- Do not commit runtime database files or uploaded files.

## Commands

```bash
npm run dev
npm run lint
npm run format:check
npm run build
npm run prisma:generate
npm run db:push
```

Build sometimes needs to run outside the Codex sandbox because Turbopack may bind a local port while processing CSS.

## Coding Rules

- Keep App Router route handlers in `app/api/**/route.ts`.
- Keep shared server helpers in `lib`.
- Keep reusable UI in `components`.
- Use Tailwind for layout and Ant Design for admin controls/forms/tables.
- Do not expose `passwordHash` in API responses.
- Do not delete a currently logged-in user.
- Keep category slug unique.
- A category with posts should not be deleted.
- Validate required fields server-side even if AntD forms validate client-side.

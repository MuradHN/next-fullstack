"use client";

import {
  App,
  Button,
  Card,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  Upload
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
};

type Post = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: Category;
  images: PostImage[];
};

type PostImage = {
  id: string;
  url: string;
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Entity = "category" | "post" | "user";
type EditingState =
  | { entity: "category"; record?: Category }
  | { entity: "post"; record?: Post }
  | { entity: "user"; record?: User }
  | null;

type CategoryValues = {
  name: string;
  slug: string;
};

type PostValues = {
  title: string;
  description: string;
  categoryId: string;
  imageUrls: string[];
};

type UserValues = {
  email: string;
  name: string;
  password?: string;
};

async function requestJson<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? "Request failed");
  }

  return (await response.json()) as T;
}

export function AdminDashboard({
  currentUser,
  initialData
}: {
  currentUser: CurrentUser;
  initialData: {
    categories: Category[];
    posts: Post[];
    users: User[];
  };
}) {
  const router = useRouter();
  const { message } = App.useApp();
  const categoryForm = useForm<CategoryValues>({
    defaultValues: {
      name: "",
      slug: ""
    }
  });
  const postForm = useForm<PostValues>({
    defaultValues: {
      categoryId: "",
      description: "",
      imageUrls: [],
      title: ""
    }
  });
  const userForm = useForm<UserValues>({
    defaultValues: {
      email: "",
      name: "",
      password: ""
    }
  });
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [posts, setPosts] = useState<Post[]>(initialData.posts);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<EditingState>(null);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id
      })),
    [categories]
  );

  async function loadData() {
    setLoading(true);

    try {
      const [categoryData, postData, userData] = await Promise.all([
        requestJson<{ categories: Category[] }>("/api/categories"),
        requestJson<{ posts: Post[] }>("/api/posts"),
        requestJson<{ users: User[] }>("/api/users")
      ]);

      setCategories(categoryData.categories);
      setPosts(postData.posts);
      setUsers(userData.users);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function openCreate(entity: Entity) {
    setEditing({ entity });
    categoryForm.reset({
      name: "",
      slug: ""
    });
    postForm.reset({
      categoryId: "",
      description: "",
      imageUrls: [],
      title: ""
    });
    userForm.reset({
      email: "",
      name: "",
      password: ""
    });
  }

  function openEdit(entity: "category", record: Category): void;
  function openEdit(entity: "post", record: Post): void;
  function openEdit(entity: "user", record: User): void;
  function openEdit(entity: Entity, record: Category | Post | User) {
    setEditing({ entity, record } as EditingState);

    if (entity === "category") {
      const category = record as Category;

      categoryForm.reset({
        name: category.name,
        slug: category.slug
      });
    }

    if (entity === "post") {
      const post = record as Post;

      postForm.reset({
        categoryId: post.categoryId,
        description: post.description,
        imageUrls: post.images.map((image) => image.url),
        title: post.title
      });
    }

    if (entity === "user") {
      const user = record as User;

      userForm.reset({
        email: user.email,
        name: user.name ?? "",
        password: ""
      });
    }
  }

  async function handleDelete(entity: Entity, id: string) {
    const resource = entity === "category" ? "categories" : `${entity}s`;

    try {
      await requestJson(`/api/${resource}/${id}`, {
        method: "DELETE"
      });
      message.success("Deleted");
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function handleLogout() {
    await requestJson("/api/auth/logout", {
      method: "POST"
    });
    router.replace("/login");
    router.refresh();
  }

  async function submitCategory(values: CategoryValues) {
    const record = editing?.entity === "category" ? editing.record : undefined;

    await saveEntity(
      record ? `/api/categories/${record.id}` : "/api/categories",
      record ? "PATCH" : "POST",
      values
    );
  }

  async function submitPost(values: PostValues) {
    const record = editing?.entity === "post" ? editing.record : undefined;

    await saveEntity(
      record ? `/api/posts/${record.id}` : "/api/posts",
      record ? "PATCH" : "POST",
      values
    );
  }

  async function submitUser(values: UserValues) {
    const record = editing?.entity === "user" ? editing.record : undefined;

    await saveEntity(
      record ? `/api/users/${record.id}` : "/api/users",
      record ? "PATCH" : "POST",
      values
    );
  }

  async function saveEntity(url: string, method: "POST" | "PATCH", values: object) {
    setSaving(true);

    try {
      await requestJson(url, {
        method,
        body: JSON.stringify(values)
      });
      message.success("Saved");
      setEditing(null);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImages(files: File[]) {
    if (files.length === 0) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    setUploading(true);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message ?? "Upload failed");
      }

      const data = (await response.json()) as {
        files: Array<{
          url: string;
        }>;
      };
      message.success("Images uploaded");
      return data.files.map((file) => file.url);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Upload failed");
      return [];
    } finally {
      setUploading(false);
    }
  }

  const categoryColumns: ColumnsType<Category> = [
    {
      title: "Name",
      dataIndex: "name"
    },
    {
      title: "Slug",
      dataIndex: "slug"
    },
    {
      title: "Posts",
      render: (_, record) => record._count?.posts ?? 0
    },
    {
      title: "Actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEdit("category", record)}>Edit</Button>
          <Popconfirm
            title="Delete category?"
            onConfirm={() => handleDelete("category", record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const postColumns: ColumnsType<Post> = [
    {
      title: "Title",
      dataIndex: "title"
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true
    },
    {
      title: "Category",
      render: (_, record) => record.category?.name
    },
    {
      title: "Images",
      render: (_, record) => record.images.length
    },
    {
      title: "Actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEdit("post", record)}>Edit</Button>
          <Popconfirm title="Delete post?" onConfirm={() => handleDelete("post", record.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const userColumns: ColumnsType<User> = [
    {
      title: "Name",
      render: (_, record) => record.name || "-"
    },
    {
      title: "Email",
      dataIndex: "email"
    },
    {
      title: "Actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEdit("user", record)}>Edit</Button>
          <Popconfirm title="Delete user?" onConfirm={() => handleDelete("user", record.id)}>
            <Button danger disabled={record.id === currentUser.id}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-app-background px-6 py-8 max-sm:px-4">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <Typography.Title level={2} className="!mb-1">
              Admin dashboard
            </Typography.Title>
            <Typography.Text type="secondary">
              Logged in as {currentUser.name || currentUser.email}
            </Typography.Text>
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </header>

        <Card>
          <Tabs
            items={[
              {
                key: "categories",
                label: "Categories",
                children: (
                  <div className="grid gap-4">
                    <Button className="w-fit" type="primary" onClick={() => openCreate("category")}>
                      Add category
                    </Button>
                    <Table<Category>
                      columns={categoryColumns}
                      dataSource={categories}
                      loading={loading}
                      rowKey="id"
                    />
                  </div>
                )
              },
              {
                key: "posts",
                label: "Posts",
                children: (
                  <div className="grid gap-4">
                    <Button className="w-fit" type="primary" onClick={() => openCreate("post")}>
                      Add post
                    </Button>
                    <Table<Post>
                      columns={postColumns}
                      dataSource={posts}
                      loading={loading}
                      rowKey="id"
                    />
                  </div>
                )
              },
              {
                key: "users",
                label: "Users",
                children: (
                  <div className="grid gap-4">
                    <Button className="w-fit" type="primary" onClick={() => openCreate("user")}>
                      Add user
                    </Button>
                    <Table<User>
                      columns={userColumns}
                      dataSource={users}
                      loading={loading}
                      rowKey="id"
                    />
                  </div>
                )
              }
            ]}
          />
        </Card>
      </div>

      <Modal
        destroyOnHidden
        okButtonProps={{
          loading: saving
        }}
        onCancel={() => setEditing(null)}
        onOk={categoryForm.handleSubmit(submitCategory)}
        open={editing?.entity === "category"}
        title={editing?.entity === "category" && editing.record ? "Edit category" : "Add category"}
      >
        <form className="grid gap-4" onSubmit={categoryForm.handleSubmit(submitCategory)}>
          <FieldLabel error={categoryForm.formState.errors.name?.message} label="Name">
            <Controller
              control={categoryForm.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <Input {...field} status={categoryForm.formState.errors.name ? "error" : ""} />
              )}
            />
          </FieldLabel>
          <FieldLabel error={categoryForm.formState.errors.slug?.message} label="Slug">
            <Controller
              control={categoryForm.control}
              name="slug"
              rules={{ required: "Slug is required" }}
              render={({ field }) => (
                <Input {...field} status={categoryForm.formState.errors.slug ? "error" : ""} />
              )}
            />
          </FieldLabel>
        </form>
      </Modal>

      <Modal
        destroyOnHidden
        okButtonProps={{
          loading: saving
        }}
        onCancel={() => setEditing(null)}
        onOk={postForm.handleSubmit(submitPost)}
        open={editing?.entity === "post"}
        title={editing?.entity === "post" && editing.record ? "Edit post" : "Add post"}
      >
        <form className="grid gap-4" onSubmit={postForm.handleSubmit(submitPost)}>
          <FieldLabel error={postForm.formState.errors.title?.message} label="Title">
            <Controller
              control={postForm.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Input {...field} status={postForm.formState.errors.title ? "error" : ""} />
              )}
            />
          </FieldLabel>
          <FieldLabel error={postForm.formState.errors.description?.message} label="Description">
            <Controller
              control={postForm.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={4}
                  status={postForm.formState.errors.description ? "error" : ""}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel error={postForm.formState.errors.categoryId?.message} label="Category">
            <Controller
              control={postForm.control}
              name="categoryId"
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoryOptions}
                  placeholder="Select category"
                  status={postForm.formState.errors.categoryId ? "error" : ""}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel label="Images">
            <Controller
              control={postForm.control}
              name="imageUrls"
              render={({ field }) => (
                <ImageUploadField
                  loading={uploading}
                  onChange={field.onChange}
                  onUpload={handleUploadImages}
                  value={field.value}
                />
              )}
            />
          </FieldLabel>
        </form>
      </Modal>

      <Modal
        destroyOnHidden
        okButtonProps={{
          loading: saving
        }}
        onCancel={() => setEditing(null)}
        onOk={userForm.handleSubmit(submitUser)}
        open={editing?.entity === "user"}
        title={editing?.entity === "user" && editing.record ? "Edit user" : "Add user"}
      >
        <form className="grid gap-4" onSubmit={userForm.handleSubmit(submitUser)}>
          <FieldLabel label="Name">
            <Controller
              control={userForm.control}
              name="name"
              render={({ field }) => <Input {...field} />}
            />
          </FieldLabel>
          <FieldLabel error={userForm.formState.errors.email?.message} label="Email">
            <Controller
              control={userForm.control}
              name="email"
              rules={{
                pattern: {
                  message: "Email is invalid",
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                },
                required: "Email is required"
              }}
              render={({ field }) => (
                <Input {...field} status={userForm.formState.errors.email ? "error" : ""} />
              )}
            />
          </FieldLabel>
          <FieldLabel
            error={userForm.formState.errors.password?.message}
            label={editing?.entity === "user" && editing.record ? "New password" : "Password"}
          >
            <Controller
              control={userForm.control}
              name="password"
              rules={
                editing?.entity === "user" && editing.record
                  ? undefined
                  : { required: "Password is required" }
              }
              render={({ field }) => (
                <Input.Password
                  {...field}
                  status={userForm.formState.errors.password ? "error" : ""}
                />
              )}
            />
          </FieldLabel>
        </form>
      </Modal>
    </main>
  );
}

function FieldLabel({
  children,
  error,
  label
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function ImageUploadField({
  loading,
  onChange,
  onUpload,
  value = []
}: {
  loading: boolean;
  onChange?: (value: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
  value?: string[];
}) {
  const fileList: UploadFile[] = value.map((url, index) => ({
    uid: url,
    name: `image-${index + 1}`,
    status: "done",
    url
  }));

  return (
    <Upload
      accept="image/*"
      customRequest={async ({ file, onError, onSuccess }) => {
        try {
          const uploadedUrls = await onUpload([file as File]);
          onChange?.([...value, ...uploadedUrls]);
          onSuccess?.("ok");
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error("Upload failed"));
        }
      }}
      fileList={fileList}
      listType="picture-card"
      multiple
      onRemove={(file) => {
        onChange?.(value.filter((url) => url !== file.url));
      }}
      showUploadList={{
        showPreviewIcon: false
      }}
    >
      {loading ? "Uploading..." : "Upload"}
    </Upload>
  );
}

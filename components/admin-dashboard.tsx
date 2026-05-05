"use client";

import {
  App,
  Button,
  Card,
  Input,
  InputNumber,
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

type Banner = {
  id: string;
  image: string;
  title: string;
};

type Category = {
  id: string;
  imageUrl: string | null;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
};

type Product = {
  id: string;
  categoryId: string;
  category: Category;
  description: string;
  images: ProductImage[];
  inventory: number;
  name: string;
  price: number;
  quantity: number;
};

type ProductImage = {
  id: string;
  url: string;
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Entity = "banner" | "category" | "product" | "user";
type EditingState =
  | { entity: "banner"; record?: Banner }
  | { entity: "category"; record?: Category }
  | { entity: "product"; record?: Product }
  | { entity: "user"; record?: User }
  | null;

type BannerValues = {
  image: string | null;
  title: string;
};

type CategoryValues = {
  imageUrl: string | null;
  name: string;
  slug: string;
};

type ProductValues = {
  categoryId: string;
  description: string;
  imageUrls: string[];
  inventory: number;
  name: string;
  price: number;
  quantity: number;
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
    banners: Banner[];
    categories: Category[];
    products: Product[];
    users: User[];
  };
}) {
  const router = useRouter();
  const { message } = App.useApp();
  const bannerForm = useForm<BannerValues>({
    defaultValues: {
      image: null,
      title: ""
    }
  });
  const categoryForm = useForm<CategoryValues>({
    defaultValues: {
      imageUrl: null,
      name: "",
      slug: ""
    }
  });
  const productForm = useForm<ProductValues>({
    defaultValues: {
      categoryId: "",
      description: "",
      imageUrls: [],
      inventory: 0,
      name: "",
      price: 0,
      quantity: 0
    }
  });
  const userForm = useForm<UserValues>({
    defaultValues: {
      email: "",
      name: "",
      password: ""
    }
  });
  const [banners, setBanners] = useState<Banner[]>(initialData.banners);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [products, setProducts] = useState<Product[]>(initialData.products);
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
      const [bannerData, categoryData, productData, userData] = await Promise.all([
        requestJson<{ banners: Banner[] }>("/api/banners"),
        requestJson<{ categories: Category[] }>("/api/categories"),
        requestJson<{ products: Product[] }>("/api/products"),
        requestJson<{ users: User[] }>("/api/users")
      ]);

      setBanners(bannerData.banners);
      setCategories(categoryData.categories);
      setProducts(productData.products);
      setUsers(userData.users);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function openCreate(entity: Entity) {
    setEditing({ entity });
    bannerForm.reset({
      image: null,
      title: ""
    });
    categoryForm.reset({
      imageUrl: null,
      name: "",
      slug: ""
    });
    productForm.reset({
      categoryId: "",
      description: "",
      imageUrls: [],
      inventory: 0,
      name: "",
      price: 0,
      quantity: 0
    });
    userForm.reset({
      email: "",
      name: "",
      password: ""
    });
  }

  function openEdit(entity: "banner", record: Banner): void;
  function openEdit(entity: "category", record: Category): void;
  function openEdit(entity: "product", record: Product): void;
  function openEdit(entity: "user", record: User): void;
  function openEdit(entity: Entity, record: Banner | Category | Product | User) {
    setEditing({ entity, record } as EditingState);

    if (entity === "banner") {
      const banner = record as Banner;

      bannerForm.reset({
        image: banner.image,
        title: banner.title
      });
    }

    if (entity === "category") {
      const category = record as Category;

      categoryForm.reset({
        imageUrl: category.imageUrl,
        name: category.name,
        slug: category.slug
      });
    }

    if (entity === "product") {
      const product = record as Product;

      productForm.reset({
        categoryId: product.categoryId,
        description: product.description,
        imageUrls: product.images.map((image) => image.url),
        inventory: product.inventory,
        name: product.name,
        price: product.price,
        quantity: product.quantity
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
    const resource =
      entity === "banner"
        ? "banners"
        : entity === "category"
          ? "categories"
          : entity === "product"
            ? "products"
            : "users";

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

  async function submitBanner(values: BannerValues) {
    const record = editing?.entity === "banner" ? editing.record : undefined;

    await saveEntity(
      record ? `/api/banners/${record.id}` : "/api/banners",
      record ? "PATCH" : "POST",
      values
    );
  }

  async function submitCategory(values: CategoryValues) {
    const record = editing?.entity === "category" ? editing.record : undefined;

    await saveEntity(
      record ? `/api/categories/${record.id}` : "/api/categories",
      record ? "PATCH" : "POST",
      values
    );
  }

  async function submitProduct(values: ProductValues) {
    const record = editing?.entity === "product" ? editing.record : undefined;

    await saveEntity(
      record ? `/api/products/${record.id}` : "/api/products",
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
      title: "Image",
      width: 90,
      render: (_, record) =>
        record.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={record.name} className="h-12 w-12 rounded object-cover" src={record.imageUrl} />
        ) : (
          "-"
        )
    },
    {
      title: "Name",
      dataIndex: "name"
    },
    {
      title: "Slug",
      dataIndex: "slug"
    },
    {
      title: "Products",
      render: (_, record) => record._count?.products ?? 0
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

  const bannerColumns: ColumnsType<Banner> = [
    {
      title: "Image",
      width: 140,
      render: (_, record) =>
        record.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={record.title} className="h-16 w-28 rounded object-cover" src={record.image} />
        ) : (
          "-"
        )
    },
    {
      title: "Title",
      dataIndex: "title"
    },
    {
      title: "Actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEdit("banner", record)}>Edit</Button>
          <Popconfirm title="Delete banner?" onConfirm={() => handleDelete("banner", record.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const productColumns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name"
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
      title: "Price",
      render: (_, record) => formatCurrency(record.price)
    },
    {
      title: "Quantity",
      dataIndex: "quantity"
    },
    {
      title: "Inventory",
      dataIndex: "inventory"
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
          <Button onClick={() => openEdit("product", record)}>Edit</Button>
          <Popconfirm title="Delete product?" onConfirm={() => handleDelete("product", record.id)}>
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
                key: "banners",
                label: "Banners",
                children: (
                  <div className="grid gap-4">
                    <Button className="w-fit" type="primary" onClick={() => openCreate("banner")}>
                      Add banner
                    </Button>
                    <Table<Banner>
                      columns={bannerColumns}
                      dataSource={banners}
                      loading={loading}
                      rowKey="id"
                    />
                  </div>
                )
              },
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
                key: "products",
                label: "Products",
                children: (
                  <div className="grid gap-4">
                    <Button className="w-fit" type="primary" onClick={() => openCreate("product")}>
                      Add product
                    </Button>
                    <Table<Product>
                      columns={productColumns}
                      dataSource={products}
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
        onOk={bannerForm.handleSubmit(submitBanner)}
        open={editing?.entity === "banner"}
        title={editing?.entity === "banner" && editing.record ? "Edit banner" : "Add banner"}
      >
        <form className="grid gap-4" onSubmit={bannerForm.handleSubmit(submitBanner)}>
          <FieldLabel error={bannerForm.formState.errors.title?.message} label="Title">
            <Controller
              control={bannerForm.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Input {...field} status={bannerForm.formState.errors.title ? "error" : ""} />
              )}
            />
          </FieldLabel>
          <FieldLabel error={bannerForm.formState.errors.image?.message} label="Image">
            <Controller
              control={bannerForm.control}
              name="image"
              rules={{ required: "Image is required" }}
              render={({ field }) => (
                <ImageUploadField
                  key={field.value ?? "empty-banner-image"}
                  loading={uploading}
                  multiple={false}
                  onChange={(urls) => field.onChange(urls[0] ?? null)}
                  onUpload={handleUploadImages}
                  value={field.value ? [field.value] : []}
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
          <FieldLabel label="Image">
            <Controller
              control={categoryForm.control}
              name="imageUrl"
              render={({ field }) => (
                <ImageUploadField
                  key={field.value ?? "empty-category-image"}
                  loading={uploading}
                  multiple={false}
                  onChange={(urls) => field.onChange(urls[0] ?? null)}
                  onUpload={handleUploadImages}
                  value={field.value ? [field.value] : []}
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
        onOk={productForm.handleSubmit(submitProduct)}
        open={editing?.entity === "product"}
        title={editing?.entity === "product" && editing.record ? "Edit product" : "Add product"}
      >
        <form className="grid gap-4" onSubmit={productForm.handleSubmit(submitProduct)}>
          <FieldLabel error={productForm.formState.errors.name?.message} label="Name">
            <Controller
              control={productForm.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <Input {...field} status={productForm.formState.errors.name ? "error" : ""} />
              )}
            />
          </FieldLabel>
          <FieldLabel error={productForm.formState.errors.description?.message} label="Description">
            <Controller
              control={productForm.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={4}
                  status={productForm.formState.errors.description ? "error" : ""}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel error={productForm.formState.errors.categoryId?.message} label="Category">
            <Controller
              control={productForm.control}
              name="categoryId"
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoryOptions}
                  placeholder="Select category"
                  status={productForm.formState.errors.categoryId ? "error" : ""}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel error={productForm.formState.errors.price?.message} label="Price">
            <Controller
              control={productForm.control}
              name="price"
              rules={{
                required: "Price is required",
                min: { value: 0, message: "Price must be 0 or greater" }
              }}
              render={({ field }) => (
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={0}
                  status={productForm.formState.errors.price ? "error" : ""}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel error={productForm.formState.errors.quantity?.message} label="Quantity">
            <Controller
              control={productForm.control}
              name="quantity"
              rules={{
                required: "Quantity is required",
                min: { value: 0, message: "Quantity must be 0 or greater" }
              }}
              render={({ field }) => (
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={0}
                  status={productForm.formState.errors.quantity ? "error" : ""}
                  value={field.value}
                  onChange={(value) => {
                    const nextValue = value ?? 0;
                    field.onChange(nextValue);
                    if (!(editing?.entity === "product" && editing.record)) {
                      productForm.setValue("inventory", nextValue, { shouldValidate: true });
                    }
                  }}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel error={productForm.formState.errors.inventory?.message} label="Inventory">
            <Controller
              control={productForm.control}
              name="inventory"
              rules={{
                required: "Inventory is required",
                min: { value: 0, message: "Inventory must be 0 or greater" }
              }}
              render={({ field }) => (
                <InputNumber
                  className="w-full"
                  disabled={!(editing?.entity === "product" && editing.record)}
                  min={0}
                  precision={0}
                  status={productForm.formState.errors.inventory ? "error" : ""}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel label="Images">
            <Controller
              control={productForm.control}
              name="imageUrls"
              render={({ field }) => (
                <ImageUploadField
                  key={field.value.join("|") || "empty-product-images"}
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
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency"
  }).format(value);
}

function ImageUploadField({
  loading,
  multiple = true,
  onChange,
  onUpload,
  value = []
}: {
  loading: boolean;
  multiple?: boolean;
  onChange?: (value: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
  value?: string[];
}) {
  const [displayUrls, setDisplayUrls] = useState(value);

  const fileList: UploadFile[] = displayUrls.map((url, index) => ({
    uid: url,
    name: `image-${index + 1}`,
    status: "done",
    url
  }));

  return (
    <Upload
      accept="image/*"
      beforeUpload={async (file) => {
        try {
          const uploadedUrls = await onUpload([file]);
          const nextUrls = multiple ? [...displayUrls, ...uploadedUrls] : uploadedUrls.slice(0, 1);

          setDisplayUrls(nextUrls);
          onChange?.(nextUrls);
        } catch {
          // handleUploadImages already displays the API error through AntD message.
        }

        return Upload.LIST_IGNORE;
      }}
      fileList={fileList}
      listType="picture-card"
      maxCount={multiple ? undefined : 1}
      multiple={multiple}
      onRemove={(file) => {
        const removedUrl = file.url ?? file.uid;
        const nextUrls = displayUrls.filter((url) => url !== removedUrl);

        setDisplayUrls(nextUrls);
        onChange?.(nextUrls);
      }}
      showUploadList={{
        showPreviewIcon: false
      }}
    >
      {!multiple && displayUrls.length > 0 ? null : loading ? "Uploading..." : "Upload"}
    </Upload>
  );
}

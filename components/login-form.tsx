"use client";

import { App, Button, Card, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<LoginValues>({
    defaultValues: {
      email: "admin@gmail.com",
      password: "abcd1234"
    }
  });

  async function handleLogin(values: LoginValues) {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "Login failed");
      }

      message.success("Login successful");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-background px-4">
      <Card className="w-full max-w-[420px]" variant="outlined">
        <div className="mb-6">
          <Typography.Title level={2} className="!mb-2">
            Admin login
          </Typography.Title>
          <Typography.Text type="secondary">Use admin@gmail.com / abcd1234</Typography.Text>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(handleLogin)}>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <Controller
              control={control}
              name="email"
              rules={{
                pattern: {
                  message: "Email is invalid",
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                },
                required: "Email is required"
              }}
              render={({ field }) => (
                <Input {...field} autoComplete="email" status={errors.email ? "error" : ""} />
              )}
            />
            {errors.email ? (
              <span className="text-xs text-red-600">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required"
              }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  autoComplete="current-password"
                  status={errors.password ? "error" : ""}
                />
              )}
            />
            {errors.password ? (
              <span className="text-xs text-red-600">{errors.password.message}</span>
            ) : null}
          </label>

          <Button block htmlType="submit" loading={loading} type="primary">
            Login
          </Button>
        </form>
      </Card>
    </main>
  );
}

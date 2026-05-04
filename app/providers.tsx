"use client";

import { App as AntdApp, ConfigProvider, theme } from "antd";
import { Provider as JotaiProvider } from "jotai";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            borderRadius: 8,
            colorPrimary: "#0f766e",
            fontFamily: "Arial, Helvetica, sans-serif"
          }
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </JotaiProvider>
  );
}

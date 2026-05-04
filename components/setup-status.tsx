"use client";

import { Button, Space, Tag } from "antd";
import { useAtom } from "jotai";
import { setupReadyAtom } from "@/state/app-atoms";

export function SetupStatus() {
  const [isReady, setIsReady] = useAtom(setupReadyAtom);

  return (
    <Space wrap>
      <Tag color={isReady ? "success" : "default"}>
        {isReady ? "Frontend stack ready" : "Checking setup"}
      </Tag>
      <Button type="primary" onClick={() => setIsReady((value) => !value)}>
        Toggle atom
      </Button>
    </Space>
  );
}

"use client";

import { useEffect } from "react";

export function useDesignPreviewBridge(handler: (payload: unknown) => void) {
  useEffect(() => {
    const listener = (event: MessageEvent) => handler(event.data);
    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, [handler]);
}

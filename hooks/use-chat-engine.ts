"use client";

import { useMemo, useState } from "react";

export function useChatEngine() {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
  };

  const transcript = useMemo(() => messages.join("\n"), [messages]);

  return { messages, transcript, addMessage };
}

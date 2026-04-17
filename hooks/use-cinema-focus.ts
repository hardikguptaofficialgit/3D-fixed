"use client";

import { useState } from "react";

export function useCinemaFocus<T>(items: T[]) {
  const [index, setIndex] = useState<number | null>(null);
  const open = (nextIndex: number) => setIndex(nextIndex);
  const close = () => setIndex(null);

  const next = () => {
    if (index === null || items.length === 0) return;
    setIndex((index + 1) % items.length);
  };

  const previous = () => {
    if (index === null || items.length === 0) return;
    setIndex((index - 1 + items.length) % items.length);
  };

  return { index, open, close, next, previous };
}

"use client";

import { useEffect, useState } from "react";

export function useThemeMode(defaultMode: "dark" | "light" = "dark") {
  const [mode, setMode] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return defaultMode;
    const saved = window.localStorage.getItem("klyperix-theme");
    return saved === "dark" || saved === "light" ? saved : defaultMode;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    window.localStorage.setItem("klyperix-theme", mode);
  }, [mode]);

  return {
    mode,
    toggleMode: () => setMode((v) => (v === "dark" ? "light" : "dark")),
    setMode,
  };
}

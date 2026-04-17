"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export function usePortfolioMedia(pageName: string) {
  const [items, setItems] = useState<unknown[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from("media_slots")
        .select("*")
        .eq("page_name", pageName)
        .order("display_order", { ascending: true });

      if (mounted && data) setItems(data);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [pageName]);

  return items;
}

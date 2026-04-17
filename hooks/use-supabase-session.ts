"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export function useSupabaseSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    }

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  return { email, loading };
}

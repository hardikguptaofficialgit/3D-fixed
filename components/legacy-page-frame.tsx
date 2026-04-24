"use client";

import { motion } from "framer-motion";
import { useCallback, useRef, useEffect, useState } from "react";

type LegacyPageFrameProps = {
  src: string;
  title: string;
};

export function LegacyPageFrame({ src, title }: LegacyPageFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeSrc, setIframeSrc] = useState(() =>
    typeof window !== "undefined" ? src + window.location.hash : src,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Forward magic link tokens or hash routing from Next.js parent to the iframe.
    const syncIframeSrc = () => {
      setIframeSrc(src + window.location.hash);
    };

    syncIframeSrc();
    window.addEventListener("hashchange", syncIframeSrc);
    return () => window.removeEventListener("hashchange", syncIframeSrc);
  }, [src]);

  const onLoad = useCallback(() => {
    // Only possible for same-origin `public/` assets.
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument ?? win?.document;
    if (!doc) return;

    // Home page: make the "Explore Now" hit-target scroll to Services.
    if (src.endsWith("/klyperix.html")) {
      const target = doc.getElementById("spline-explore-target");
      const services = doc.getElementById("services");
      if (target && services) {
        const handler = (e: Event) => {
          e.preventDefault?.();
          services.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        // Avoid stacking duplicate handlers on hot reload.
        target.removeEventListener("click", handler);
        target.addEventListener("click", handler, { passive: false });
      }
    }
  }, [src]);

  return (
    <motion.main
      className="fixed inset-0 h-[100dvh] min-h-[100dvh] w-full bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <iframe
        title={title}
        src={iframeSrc}
        className="h-[100dvh] min-h-[100dvh] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        ref={iframeRef}
        onLoad={onLoad}
      />
    </motion.main>
  );
}

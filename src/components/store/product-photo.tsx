"use client";

import { useEffect, useState } from "react";
import { resolvePhoto } from "@/lib/store-remote";

export function ProductPhoto({
  url,
  alt,
  className,
}: {
  url?: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    if (!url) {
      setSrc("");
      return;
    }
    resolvePhoto(url)
      .then((value) => {
        if (active) setSrc(value);
      })
      .catch(() => {
        if (active) setSrc("");
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

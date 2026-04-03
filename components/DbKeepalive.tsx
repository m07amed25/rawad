"use client";

import { useEffect } from "react";

const INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

export function DbKeepalive() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/keepalive").catch(() => {});
    };

    // Initial ping after a short delay
    const timeout = setTimeout(ping, 5_000);
    const interval = setInterval(ping, INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return null;
}

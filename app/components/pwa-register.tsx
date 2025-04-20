"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    // Check if service workers are supported
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      window.addEventListener("load", function () {
        if (process.env.NODE_ENV === "production") {
          navigator.serviceWorker
            .register("/sw.js")
            .catch((err) =>
              console.error("Service Worker registration failed:", err)
            );
        }
      });
    }
  }, []);

  return null;
}

export default PWARegister;

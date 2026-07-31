"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev: unregister any SW so Turbopack/HMR and auth are not disrupted.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      void caches.keys().then((keys) => {
        keys.forEach((key) => void caches.delete(key));
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration errors in unsupported contexts.
    });
  }, []);

  return null;
}

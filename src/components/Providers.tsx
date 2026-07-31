"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { PwaRegistrar } from "@/components/PwaRegistrar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PwaRegistrar />
      {children}
    </AuthProvider>
  );
}

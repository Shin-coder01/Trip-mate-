"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <div className="ticket-panel p-8">
          <p className="route-label">Checking ticket</p>
          <p className="mt-3 text-sm text-muted-ink">Confirming your TripMate session.</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}

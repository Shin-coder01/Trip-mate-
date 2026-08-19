"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { tripsApi } from "@/lib/api";

export default function InviteJoin({ code }: { code: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [status, setStatus] = useState("Joining trip");

  useEffect(() => {
    if (!token) return;
    tripsApi
      .join(code, token)
      .then((trip) => router.replace(`/trips/${trip.id}`))
      .catch((err) => setStatus(err instanceof Error ? err.message : "Could not join trip"));
  }, [code, router, token]);

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <section className="ticket-panel p-8">
        <p className="route-label">Invite {code}</p>
        <h1 className="mt-4 text-4xl font-bold">{status}</h1>
      </section>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Trip, tripsApi } from "@/lib/api";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function TripsDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    tripsApi
      .list(token)
      .then(setTrips)
      .catch((err) => setStatus(err instanceof Error ? err.message : "Could not load trips"))
      .finally(() => setLoading(false));
  }, [token]);

  async function createManualTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const trip = await tripsApi.create(
        {
          name: String(form.get("name")),
          destinationName: String(form.get("destinationName")),
          budgetInr: Number(form.get("budgetInr")),
          days: Number(form.get("days")),
          startLocation: String(form.get("startLocation")),
        },
        token,
      );
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not create trip");
    }
  }

  async function joinTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const trip = await tripsApi.join(String(form.get("inviteCode")), token);
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not join trip");
    }
  }

  return (
    <motion.main
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <p className="route-label">Trip ledger</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Your group trips</h1>
        </div>
        <p className="data-value text-sm text-muted-ink">
          Passenger: {user?.name ?? "Signed in"}
        </p>
      </div>

      {status && <p className="mb-5 text-sm font-semibold text-stamp">{status}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {loading ? (
            <div className="ticket-panel p-8">
              <p className="route-label">Loading trips</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="ticket-panel p-8">
              <p className="route-label">No tickets issued</p>
              <p className="mt-3 text-muted-ink">
                Use the planner or create a manual trip to start collaborating.
              </p>
            </div>
          ) : (
            trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                data-reveal
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: index * 0.05 }}
                whileHover={{ y: -4, rotate: index % 2 === 0 ? -0.2 : 0.2 }}
              >
                <Link href={`/trips/${trip.id}`} className="ticket-panel ticket-hover block p-6">
                <div className="grid gap-4 md:grid-cols-[1fr_180px_140px]">
                  <div>
                    <p className="route-label">Invite {trip.inviteCode}</p>
                    <h2 className="mt-2 text-2xl font-bold">{trip.name}</h2>
                    <p className="mt-2 text-sm text-muted-ink">
                      {trip.startLocation} to {trip.destinationName}
                    </p>
                  </div>
                  <div>
                    <p className="route-label">Budget</p>
                    <p className="data-value mt-2 text-xl font-bold">{money.format(trip.budgetInr)}</p>
                  </div>
                  <div>
                    <p className="route-label">Members</p>
                    <p className="data-value mt-2 text-xl font-bold">{trip.members.length}</p>
                  </div>
                </div>
                </Link>
              </motion.div>
            ))
          )}
        </section>

        <aside className="space-y-5">
          <motion.section className="ticket-panel p-5" data-reveal whileHover={{ y: -2 }}>
            <p className="route-label">Create manual trip</p>
            <form onSubmit={createManualTrip} className="mt-5 space-y-4">
              <input className="field-input" name="name" placeholder="Trip name" required />
              <input className="field-input" name="destinationName" placeholder="Destination" required />
              <input className="field-input" name="startLocation" placeholder="Starting location" required />
              <div className="grid grid-cols-2 gap-3">
                <input className="field-input" name="budgetInr" min={1} placeholder="Budget" type="number" required />
                <input className="field-input" name="days" min={1} max={21} placeholder="Days" type="number" required />
              </div>
              <button className="stamp-button w-full">Create</button>
            </form>
          </motion.section>

          <motion.section className="ticket-panel p-5" data-reveal whileHover={{ y: -2 }}>
            <p className="route-label">Join by invite</p>
            <form onSubmit={joinTrip} className="mt-5 flex gap-3">
              <input className="field-input uppercase" name="inviteCode" placeholder="TMABC1" required />
              <button className="stamp-button shrink-0">Join</button>
            </form>
          </motion.section>
        </aside>
      </div>
    </motion.main>
  );
}

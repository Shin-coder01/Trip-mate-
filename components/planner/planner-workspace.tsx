"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { PlannerSuggestion, plannerApi, tripsApi } from "@/lib/api";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function PlannerWorkspace() {
  const router = useRouter();
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState<PlannerSuggestion[]>([]);
  const [formState, setFormState] = useState({
    budgetInr: "18000",
    days: "4",
    startLocation: "Chennai",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setStatus("");
    try {
      const data = await plannerApi.suggestions(
        {
          budgetInr: Number(formState.budgetInr),
          days: Number(formState.days),
          startLocation: formState.startLocation,
        },
        token,
      );
      setSuggestions(data);
      if (data.length === 0) {
        setStatus("No seeded destinations fit this budget yet. Increase the budget or reduce days.");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not fetch suggestions");
    } finally {
      setLoading(false);
    }
  }

  async function createTrip(suggestion: PlannerSuggestion) {
    if (!token) return;
    setStatus(`Creating ${suggestion.name} trip...`);
    try {
      const trip = await tripsApi.create(
        {
          name: `${suggestion.name} from ${formState.startLocation}`,
          destinationName: suggestion.name,
          budgetInr: Number(formState.budgetInr),
          days: Number(formState.days),
          startLocation: formState.startLocation,
          templateDestinationId: suggestion.destinationId,
        },
        token,
      );
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not create trip");
    }
  }

  return (
    <motion.main
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-8" data-reveal>
        <p className="route-label">Planner desk</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Find trips inside your budget.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <motion.section
          className="ticket-panel h-fit p-6"
          data-reveal
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="route-label">Budget INR</span>
              <input
                className="field-input mt-2"
                min={1}
                name="budgetInr"
                type="number"
                value={formState.budgetInr}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, budgetInr: event.target.value }))
                }
                required
              />
            </label>
            <label className="block">
              <span className="route-label">Days</span>
              <input
                className="field-input mt-2"
                min={1}
                max={21}
                name="days"
                type="number"
                value={formState.days}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, days: event.target.value }))
                }
                required
              />
            </label>
            <label className="block">
              <span className="route-label">Starting location</span>
              <input
                className="field-input mt-2"
                name="startLocation"
                value={formState.startLocation}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, startLocation: event.target.value }))
                }
                required
              />
            </label>
            <button className="stamp-button w-full" disabled={loading}>
              {loading ? "Matching" : "Match routes"}
            </button>
          </form>
          {status && <p className="mt-5 text-sm font-semibold text-stamp">{status}</p>}
        </motion.section>

        <section className="space-y-4">
          {suggestions.length === 0 ? (
            <motion.div
              className="ticket-panel p-8"
              data-reveal
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p className="route-label">Awaiting manifest</p>
              <p className="mt-3 text-muted-ink">
                Submit a budget to receive two to four feasible seeded destination tickets.
              </p>
            </motion.div>
          ) : (
            suggestions.map((suggestion, index) => (
              <motion.article
                key={suggestion.destinationId}
                className="ticket-panel ticket-hover p-6"
                data-reveal
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                  <div>
                    <p className="route-label">
                      {suggestion.category} / {suggestion.region}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">{suggestion.name}</h2>
                    <p className="mt-3 leading-7 text-muted-ink">{suggestion.description}</p>
                  </div>
                  <div className="border-ticket-line md:border-l md:pl-5">
                    <p className="route-label">Estimated total</p>
                    <p className="data-value mt-2 text-2xl font-bold">
                      {money.format(suggestion.estimatedTotalInr)}
                    </p>
                    <p className="route-label mt-5">Budget buffer</p>
                    <p className="data-value mt-2 text-xl font-bold text-brass">
                      {money.format(suggestion.remainingBudgetInr)}
                    </p>
                    <button className="stamp-button mt-5 w-full" onClick={() => createTrip(suggestion)}>
                      Create trip
                    </button>
                  </div>
                </div>
                <div className="ticket-divider my-5" />
                <div className="grid gap-3 md:grid-cols-2">
                  {suggestion.itinerary.map((item, index) => (
                    <div key={`${suggestion.destinationId}-${index}`} className="border border-ticket-line bg-kraft/30 p-4">
                      <p className="route-label">Day {item.dayNumber}</p>
                      <h3 className="mt-2 font-display text-xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-ink">{item.description}</p>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))
          )}
        </section>
      </div>
    </motion.main>
  );
}

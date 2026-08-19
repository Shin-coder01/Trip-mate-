"use client";

import { motion } from "framer-motion";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import LiveTripPanel from "@/components/trips/live-trip-panel";
import { Expense, ItineraryItem, Settlement, Trip, tripsApi } from "@/lib/api";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function TripDetailWorkspace({ tripId }: { tripId: number }) {
  const { token, user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTrip = useCallback(async () => {
    if (!token || Number.isNaN(tripId)) return;
    setLoading(true);
    try {
      const [tripData, expenseData, settlementData] = await Promise.all([
        tripsApi.get(tripId, token),
        tripsApi.expenses(tripId, token),
        tripsApi.settlements(tripId, token),
      ]);
      setTrip(tripData);
      setExpenses(expenseData);
      setSettlement(settlementData);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not load trip");
    } finally {
      setLoading(false);
    }
  }, [token, tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const currentMember = useMemo(
    () => trip?.members.find((member) => member.userId === user?.id) ?? null,
    [trip, user],
  );

  async function addItineraryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    try {
      await tripsApi.addItineraryItem(tripId, itemFromForm(form), token);
      event.currentTarget.reset();
      await loadTrip();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not add itinerary item");
    }
  }

  async function updateItineraryItem(event: FormEvent<HTMLFormElement>, item: ItineraryItem) {
    event.preventDefault();
    if (!token || item.id === null) return;
    const form = new FormData(event.currentTarget);
    try {
      await tripsApi.updateItineraryItem(tripId, item.id, itemFromForm(form), token);
      await loadTrip();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not update itinerary item");
    }
  }

  async function deleteItineraryItem(item: ItineraryItem) {
    if (!token || item.id === null) return;
    try {
      await tripsApi.deleteItineraryItem(tripId, item.id, token);
      await loadTrip();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not delete itinerary item");
    }
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !trip) return;
    const form = new FormData(event.currentTarget);
    const splitMemberIds = trip.members
      .filter((member) => form.get(`split-${member.id}`) === "on")
      .map((member) => member.id);
    if (splitMemberIds.length === 0) {
      setStatus("Select at least one member to split this expense.");
      return;
    }
    try {
      await tripsApi.addExpense(
        tripId,
        {
          title: String(form.get("title")),
          amount: Number(form.get("amount")),
          paidByMemberId: Number(form.get("paidByMemberId")),
          splitMemberIds,
        },
        token,
      );
      event.currentTarget.reset();
      await loadTrip();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not add expense");
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="ticket-panel p-8">
          <p className="route-label">Loading trip room</p>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="ticket-panel p-8">
          <p className="route-label">Trip unavailable</p>
          {status && <p className="mt-3 text-sm text-stamp">{status}</p>}
        </div>
      </main>
    );
  }

  return (
    <motion.main
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="ticket-panel p-6" data-reveal>
        <div className="grid gap-5 md:grid-cols-[1fr_220px_180px]">
          <div>
            <p className="route-label">Trip room / invite {trip.inviteCode}</p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">{trip.name}</h1>
            <p className="mt-3 text-muted-ink">
              {trip.startLocation} to {trip.destinationName}
            </p>
          </div>
          <div>
            <p className="route-label">Budget</p>
            <p className="data-value mt-2 text-2xl font-bold">{money.format(trip.budgetInr)}</p>
          </div>
          <div>
            <p className="route-label">Members</p>
            <p className="data-value mt-2 text-2xl font-bold">{trip.members.length}</p>
          </div>
        </div>
        {status && <p className="mt-5 text-sm font-semibold text-stamp">{status}</p>}
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <motion.div className="ticket-panel p-6" data-reveal whileHover={{ y: -2 }}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="route-label">Shared itinerary</p>
                <h2 className="mt-2 text-3xl font-bold">Editable by all members</h2>
              </div>
              <p className="text-sm text-muted-ink">Changes save directly to the backend.</p>
            </div>

            <div className="mt-6 space-y-4">
              {trip.itinerary.map((item) => (
                <form
                  key={item.id}
                  onSubmit={(event) => updateItineraryItem(event, item)}
                  className="border border-ticket-line bg-kraft/30 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-[90px_90px_1fr]">
                    <input
                      className="field-input"
                      name="dayNumber"
                      type="number"
                      min={1}
                      defaultValue={item.dayNumber}
                    />
                    <input
                      className="field-input"
                      name="sortOrder"
                      type="number"
                      min={1}
                      defaultValue={item.sortOrder}
                    />
                    <input className="field-input" name="title" defaultValue={item.title} />
                  </div>
                  <textarea
                    className="field-input mt-3 min-h-24"
                    name="description"
                    defaultValue={item.description}
                  />
                  <div className="mt-3 grid gap-3 md:grid-cols-[160px_1fr_120px]">
                    <input
                      className="field-input"
                      name="estimatedCostInr"
                      type="number"
                      min={0}
                      defaultValue={item.estimatedCostInr}
                    />
                    <div />
                    <div className="flex gap-2">
                      <button className="secondary-button flex-1 py-2" type="button" onClick={() => deleteItineraryItem(item)}>
                        Delete
                      </button>
                      <button className="stamp-button flex-1 py-2">Save</button>
                    </div>
                  </div>
                </form>
              ))}
            </div>

            <div className="ticket-divider my-6" />
            <form onSubmit={addItineraryItem} className="grid gap-3 md:grid-cols-[90px_90px_1fr]">
              <input className="field-input" name="dayNumber" min={1} placeholder="Day" type="number" required />
              <input className="field-input" name="sortOrder" min={1} placeholder="Order" type="number" required />
              <input className="field-input" name="title" placeholder="New itinerary item" required />
              <textarea
                className="field-input min-h-20 md:col-span-2"
                name="description"
                placeholder="Notes, timing, or place details"
                required
              />
              <div className="flex gap-3">
                <input className="field-input" name="estimatedCostInr" min={0} placeholder="Cost" type="number" required />
                <button className="stamp-button shrink-0">Add</button>
              </div>
            </form>
          </motion.div>

          <motion.div className="ticket-panel p-6" data-reveal whileHover={{ y: -2 }}>
            <p className="route-label">Expense log</p>
            <h2 className="mt-2 text-3xl font-bold">Split costs</h2>
            <form onSubmit={addExpense} className="mt-6 space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_160px_180px]">
                <input className="field-input" name="title" placeholder="Expense title" required />
                <input className="field-input" name="amount" min={1} placeholder="Amount" type="number" required />
                <select
                  className="field-input"
                  name="paidByMemberId"
                  defaultValue={currentMember?.id}
                  required
                >
                  {trip.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      Paid by {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {trip.members.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 border border-ticket-line px-3 py-2 text-sm">
                    <input name={`split-${member.id}`} type="checkbox" defaultChecked />
                    <span>{member.name}</span>
                  </label>
                ))}
              </div>
              <button className="stamp-button">Log expense</button>
            </form>

            <div className="ticket-divider my-6" />
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-ink">No expenses logged yet.</p>
              ) : (
                expenses.map((expense) => (
                  <div key={expense.id} className="border border-ticket-line bg-kraft/30 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-display text-xl font-bold">{expense.title}</p>
                        <p className="text-sm text-muted-ink">Paid by {expense.paidBy.name}</p>
                      </div>
                      <p className="data-value text-xl font-bold">{money.format(expense.amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </section>

        <aside className="space-y-6">
          <motion.section className="ticket-panel p-6" data-reveal whileHover={{ y: -2 }}>
            <p className="route-label">Settlement summary</p>
            <h2 className="mt-2 text-3xl font-bold">Settle up</h2>
            <div className="mt-5 space-y-3">
              {settlement?.transactions.length ? (
                settlement.transactions.map((transaction, index) => (
                  <div key={`${transaction.fromMemberId}-${transaction.toMemberId}-${index}`} className="border border-ticket-line bg-kraft/30 p-4">
                    <p className="text-sm text-muted-ink">{transaction.fromMemberName} pays</p>
                    <p className="data-value mt-1 text-xl font-bold">
                      {money.format(transaction.amount)} to {transaction.toMemberName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-ink">No settlement transactions needed.</p>
              )}
            </div>
            <div className="ticket-divider my-5" />
            <div className="space-y-2">
              {settlement?.balances.map((balance) => (
                <div key={balance.memberId} className="flex justify-between gap-3 text-sm">
                  <span>{balance.memberName}</span>
                  <span className="data-value">{money.format(balance.balance)}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section className="ticket-panel p-6" data-reveal whileHover={{ y: -2 }}>
            <p className="route-label">Passenger list</p>
            <div className="mt-4 space-y-3">
              {trip.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between border border-ticket-line bg-kraft/30 px-3 py-2">
                  <span>{member.name}</span>
                  <span className="route-label">{member.role}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <LiveTripPanel tripId={trip.id} member={currentMember} token={token} />
        </aside>
      </div>
    </motion.main>
  );
}

function itemFromForm(form: FormData): Omit<ItineraryItem, "id"> {
  return {
    dayNumber: Number(form.get("dayNumber")),
    sortOrder: Number(form.get("sortOrder")),
    title: String(form.get("title")),
    description: String(form.get("description")),
    estimatedCostInr: Number(form.get("estimatedCostInr")),
  };
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import TripMateNav from "@/components/tripmate/nav";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await register(
        String(form.get("name")),
        String(form.get("email")),
        String(form.get("password")),
      );
      router.push("/planner");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <TripMateNav />
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="ticket-panel p-6 md:p-8">
          <p className="route-label">Issue new ticket</p>
          <h1 className="mt-4 text-4xl font-bold">Register</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="route-label">Name</span>
              <input className="field-input mt-2" name="name" required />
            </label>
            <label className="block">
              <span className="route-label">Email</span>
              <input className="field-input mt-2" name="email" type="email" required />
            </label>
            <label className="block">
              <span className="route-label">Password</span>
              <input
                className="field-input mt-2"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </label>
            {error && <p className="text-sm font-semibold text-stamp">{error}</p>}
            <button className="stamp-button w-full" disabled={submitting}>
              {submitting ? "Issuing" : "Create account"}
            </button>
          </form>
          <div className="ticket-divider my-6" />
          <p className="text-sm text-muted-ink">
            Already registered?{" "}
            <Link className="font-bold text-stamp" href="/login">
              Log in
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

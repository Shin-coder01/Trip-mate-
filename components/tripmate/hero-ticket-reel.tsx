"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ROUTES = ["GOI", "MUN", "JAI", "RSH", "PNY", "HMP"];

const DunaLandscapeBackground = dynamic(
  () => import("@/components/tripmate/duna-landscape-background"),
  { ssr: false },
);

export default function HeroTicketReel() {
  return (
    <section
      className="relative min-h-[calc(100vh-73px)] overflow-hidden border-b border-ticket-line"
    >
      <DunaLandscapeBackground />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,246,250,0.28)_0%,rgba(243,246,250,0.12)_52%,rgba(243,246,250,0.06)_100%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.02fr_0.98fr] md:px-6 md:py-16">
        <div className="flex flex-col justify-center" data-reveal>
          <p className="route-label">TRIPMATE / INDIA / INR</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
            Travel plans that start with the budget.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-ink">
            Build realistic routes, invite your group, keep the itinerary editable, split costs
            cleanly, and share live location only when members choose to.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="stamp-button" href="/planner">
              Start Planning
            </Link>
            <Link className="secondary-button" href="/trips">
              Open Trips
            </Link>
          </div>
        </div>

        <div className="flex items-center" data-reveal>
          <div className="ticket-panel ticket-panel-large ticket-stub w-full p-6 md:p-8" data-scan>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="route-label">Boarding pass</p>
                <p className="mt-2 font-display text-3xl font-bold">Budget Manifest</p>
              </div>
              <span className="stamp-mark">READY</span>
            </div>

            <div className="ticket-divider my-6" />
            <div className="boarding-grid grid grid-cols-2 gap-4">
              <div>
                <p className="route-label">From</p>
                <p className="data-value mt-2 text-2xl font-bold">YOUR CITY</p>
              </div>
              <div>
                <p className="route-label">Budget</p>
                <p className="data-value mt-2 text-2xl font-bold">INR FIRST</p>
              </div>
              <div>
                <p className="route-label">Mode</p>
                <p className="data-value mt-2 text-2xl font-bold">GROUP</p>
              </div>
              <div>
                <p className="route-label">Status</p>
                <p className="data-value mt-2 text-2xl font-bold">LIVE READY</p>
              </div>
            </div>
            <div className="ticket-divider my-6" />
            <p className="route-label">Seeded route codes</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {ROUTES.map((route) => (
                <span key={route} className="route-chip">
                  {route}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

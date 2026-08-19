export default function TripMateFooter() {
  return (
    <footer className="border-t border-ticket-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.2fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-display text-xl font-bold">TripMate</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-ink">
            Budget-first travel planning with shared itineraries, expense settlement, and live
            group location mode.
          </p>
        </div>
        <div>
          <p className="route-label">Routes</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href="/planner">Budget planner</a>
            <a href="/trips">Group trips</a>
          </div>
        </div>
        <div>
          <p className="route-label">System</p>
          <p className="mt-3 text-sm text-muted-ink">
            Full local build: API, route planning, collaboration, expense settlement, live mode.
          </p>
        </div>
      </div>
    </footer>
  );
}

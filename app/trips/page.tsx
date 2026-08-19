import ProtectedRoute from "@/components/auth/protected-route";
import TripMateNav from "@/components/tripmate/nav";
import TripsDashboard from "@/components/trips/trips-dashboard";

export default function TripsPage() {
  return (
    <>
      <TripMateNav />
      <ProtectedRoute>
        <TripsDashboard />
      </ProtectedRoute>
    </>
  );
}

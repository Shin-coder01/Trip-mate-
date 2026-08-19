import ProtectedRoute from "@/components/auth/protected-route";
import TripMateNav from "@/components/tripmate/nav";
import TripDetailWorkspace from "@/components/trips/trip-detail-workspace";

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <TripMateNav />
      <ProtectedRoute>
        <TripDetailWorkspace tripId={Number(params.id)} />
      </ProtectedRoute>
    </>
  );
}

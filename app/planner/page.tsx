import ProtectedRoute from "@/components/auth/protected-route";
import PlannerWorkspace from "@/components/planner/planner-workspace";
import TripMateNav from "@/components/tripmate/nav";

export default function PlannerPage() {
  return (
    <>
      <TripMateNav />
      <ProtectedRoute>
        <PlannerWorkspace />
      </ProtectedRoute>
    </>
  );
}

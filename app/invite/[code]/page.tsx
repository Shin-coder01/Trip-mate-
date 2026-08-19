import ProtectedRoute from "@/components/auth/protected-route";
import InviteJoin from "@/components/trips/invite-join";
import TripMateNav from "@/components/tripmate/nav";

export default function InvitePage({ params }: { params: { code: string } }) {
  return (
    <>
      <TripMateNav />
      <ProtectedRoute>
        <InviteJoin code={params.code} />
      </ProtectedRoute>
    </>
  );
}

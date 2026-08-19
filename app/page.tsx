import FeatureManifest from "@/components/tripmate/feature-manifest";
import TripMateFooter from "@/components/tripmate/footer";
import HeroTicketReel from "@/components/tripmate/hero-ticket-reel";
import TripMateNav from "@/components/tripmate/nav";

export default function Home() {
  return (
    <>
      <TripMateNav />
      <main>
        <HeroTicketReel />
        <FeatureManifest />
      </main>
      <TripMateFooter />
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { gsap } from "@/lib/gsap-config";

export default function TripMateNav() {
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => {
      gsap.to(header, {
        backgroundColor: window.scrollY > 18 ? "rgba(247,240,223,0.96)" : "rgba(236,228,211,0.95)",
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const onHeroProgress = (event: Event) => {
      const progress = (event as CustomEvent<number>).detail;
      gsap.to(header, {
        y: progress > 0.18 && progress < 0.82 ? -74 : 0,
        duration: 0.28,
        ease: "power3.out",
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("tripmate-hero-progress", onHeroProgress);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("tripmate-hero-progress", onHeroProgress);
    };
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-ticket-line bg-kraft/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold text-ink">TripMate</span>
          <span className="route-label hidden sm:inline">BUDGET / GROUP / LIVE</span>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          <Link className="route-label text-ink" href="/planner">
            Planner
          </Link>
          <Link className="route-label text-ink" href="/trips">
            Trips
          </Link>
          {user ? (
            <button className="route-label text-stamp" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <Link className="route-label text-ink" href="/login">
                Login
              </Link>
              <Link className="stamp-button px-4 py-2" href="/register">
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link className="route-label text-ink" href="/planner">
            Plan
          </Link>
          <Link className="route-label text-ink" href="/trips">
            Trips
          </Link>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import SmoothScrollProvider from "@/lib/lenis-provider";
import { gsap } from "@/lib/gsap-config";

export default function MotionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-scan]").forEach((element) => {
        gsap.fromTo(
          element,
          { "--scan-x": "-24%" },
          {
            "--scan-x": "124%",
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [pathname]);

  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}

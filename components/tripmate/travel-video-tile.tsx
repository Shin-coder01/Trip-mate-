"use client";

import { useEffect, useRef, useState } from "react";

type TravelVideoTileProps = {
  poster: string;
  routeCode: string;
  src: string;
};

export default function TravelVideoTile({
  poster,
  routeCode,
  src,
}: TravelVideoTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return () => motionPreference.removeEventListener("change", updateMotionPreference);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    if (tileRef.current) observer.observe(tileRef.current);

    return () => {
      motionPreference.removeEventListener("change", updateMotionPreference);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible && !reducedMotion) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible, reducedMotion]);

  return (
    <div
      ref={tileRef}
      className="photo-strip relative aspect-[4/3] overflow-hidden border border-ticket-line bg-kraft"
      data-reveal
    >
      <video
        ref={videoRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        poster={poster}
        preload="none"
        src={src}
        tabIndex={-1}
      />
      <span
        aria-hidden="true"
        className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-stamp"
      >
        {routeCode}
      </span>
    </div>
  );
}
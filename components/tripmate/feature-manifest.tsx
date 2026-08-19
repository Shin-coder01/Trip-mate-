"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const FEATURES = [
  {
    code: "BGT",
    title: "Budget-Based Planner",
    body: "Enter INR budget, days, and start location. TripMate returns feasible seeded routes with day plans.",
  },
  {
    code: "GRP",
    title: "Group Collaboration",
    body: "Create a trip, share the invite code, and let every member edit the shared itinerary.",
  },
  {
    code: "EXP",
    title: "Expense Settlement",
    body: "Log expenses, choose who split each cost, and get minimum settlement transactions.",
  },
  {
    code: "LVE",
    title: "Live Trip Mode",
    body: "Members opt in to broadcast location updates into the active trip room over STOMP.",
  },
];

const ROUTE_IMAGES = [
  "/travel-images/22f55cc3f9c4f438dcaff5873166bc37.jpg",
  "/travel-images/644728dd03e03051ec91872eee56abce.jpg",
  "/travel-images/6d7127470eb0c4fa982a69d7ab4f0fbf.jpg",
  "/travel-images/911f4d44cff2a44ffe3c206589fa738f.jpg",
];

export default function FeatureManifest() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "8%"]);

  return (
    <section ref={ref} className="border-y border-ticket-line bg-paper/70">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div data-reveal>
          <p className="route-label">Complete workflow</p>
          <h2 className="mt-3 text-3xl font-bold md:text-5xl">The route desk is wired.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.code}
              className="ticket-panel ticket-hover p-5"
              data-reveal
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -4, rotate: index % 2 === 0 ? -0.35 : 0.35 }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="data-value text-sm font-bold text-stamp">{feature.code}</p>
                <span className="mini-punch" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-ink">{feature.body}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="ticket-panel p-6" data-reveal>
            <p className="route-label">Route proof</p>
            <h3 className="mt-3 text-3xl font-bold">Seeded itineraries become group trips.</h3>
            <p className="mt-4 leading-7 text-muted-ink">
              Planner suggestions copy their day templates into editable trip rooms, so the first
              plan has structure and the group can still reshape it.
            </p>
          </div>
          <motion.div className="grid grid-cols-2 gap-3" style={{ y }}>
            {ROUTE_IMAGES.map((src, index) => (
              <div
                key={src}
                className="photo-strip relative aspect-[4/3] overflow-hidden border border-ticket-line bg-kraft"
                data-reveal
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover sepia-[0.22] saturate-[0.82]"
                />
                <span className="absolute left-3 top-3 bg-paper/90 px-2 py-1 font-mono text-xs font-bold text-stamp">
                  RTE-{String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

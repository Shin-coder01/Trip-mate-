import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import MotionShell from "@/components/tripmate/motion-shell";

export const metadata: Metadata = {
  title: "TripMate - Budget Travel Planner",
  description:
    "Plan budget-based trips, collaborate with groups, split expenses, and share live location updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-kraft font-body text-ink antialiased">
        <AuthProvider>
          <MotionShell>{children}</MotionShell>
        </AuthProvider>
      </body>
    </html>
  );
}

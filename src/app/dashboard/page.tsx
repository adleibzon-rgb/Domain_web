import { Suspense } from "react";
import { ScanPanel } from "@/components/scan/scan-panel";
import { Skeleton } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Dashboard</h1>
      <p className="mb-8 text-zinc-400">Run a domain scan and export results.</p>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ScanPanel />
      </Suspense>
    </div>
  );
}

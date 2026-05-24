import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [users, scans] = await Promise.all([
    prisma.user.count(),
    prisma.scan.count(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <h1 className="text-4xl font-bold">Admin</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{users}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scans</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{scans}</CardContent>
        </Card>
      </div>
    </div>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SamplesTable } from "@/components/samples/samples-table";
import { SignOutButton } from "@/components/sign-out-button";
import { db } from "@/db";
import { samples } from "@/db/samples-schema";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const rows = await db.select().from(samples).orderBy(samples.alias);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8 xl:max-w-[90rem] 2xl:max-w-[110rem]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="text-muted-foreground">
        Signed in as <span className="font-medium">{session.user.email}</span>
      </p>
      <SamplesTable data={rows} />
    </main>
  );
}

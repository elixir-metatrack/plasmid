import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        A3Gen Sediment Database
      </h1>
      <p className="text-muted-foreground">Sample tracking and management.</p>
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Go to Dashboard
      </Button>
    </main>
  );
}

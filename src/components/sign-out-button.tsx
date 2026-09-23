"use client";

import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface SignOutButtonProps {
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
}

export function SignOutButton({
  size = "default",
  className,
}: SignOutButtonProps = {}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      variant="outline"
      size={size}
      className={className}
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/sign-in");
            },
          },
        });
        setIsPending(false);
      }}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}

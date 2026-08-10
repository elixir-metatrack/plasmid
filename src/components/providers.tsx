"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/toast";
import { getQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster>{children}</Toaster>
      {process.env.NODE_ENV === "development" && (
        <TanStackDevtools
          plugins={[
            {
              id: "react-query",
              name: "React Query",
              render: () => <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
      )}
    </QueryClientProvider>
  );
}

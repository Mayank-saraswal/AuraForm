"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";
import { Toaster } from "react-hot-toast";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // Do not retry on 4xx errors
          if (((error as unknown) as { data?: { httpStatus?: number } }).data?.httpStatus &&
              ((error as unknown) as { data: { httpStatus: number } }).data.httpStatus < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = React.useState(() =>
    trpc.createClient({ links: [createTRPCHttpBatchClientClient()] })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }}
        />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

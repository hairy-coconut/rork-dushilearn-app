import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "../backend/trpc/app-router";
import superjson from "superjson";
import { API_CONFIG } from "../constants/config";

export const trpc = createTRPCReact<AppRouter>();

// Configure tRPC client with proper API base URL
export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${API_CONFIG.baseUrl}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
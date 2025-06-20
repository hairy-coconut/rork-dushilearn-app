import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

// TODO: Set your API base URL here if needed, or remove trpcClient if not used
const API_BASE_URL = "https://placeholder-url.com";

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${API_BASE_URL}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
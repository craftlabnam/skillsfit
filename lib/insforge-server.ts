import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

// Read-only — cannot sign in/out. Auth mutations go through createAuthActions().
export const createInsforgeServer = async () => {
  return createServerClient({
    cookies: await cookies(),
  });
};

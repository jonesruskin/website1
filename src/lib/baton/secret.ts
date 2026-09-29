import "server-only";

import { authEnv } from "@/env/auth";

/** Baton signs click tokens and hashes visitors with a key derived from the auth secret. */
export function batonSecret() {
  return authEnv.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET ?? "development-only-secret-change-me-please";
}

/**
 * Centralized access to Vite env variables.
 * All env keys used by the app should be declared here and in vite-env.d.ts.
 */

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
} as const;

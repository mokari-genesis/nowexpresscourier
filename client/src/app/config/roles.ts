/**
 * Generic roles. Extend this type and ROLES object for your domain.
 */

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  READONLY: "READONLY",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && Object.values(ROLES).includes(value as Role);
}

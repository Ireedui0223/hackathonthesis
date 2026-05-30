import type { StoredUser } from "@/lib/auth";

export function canAdmin(user: StoredUser | null) {
  return user?.role === "ADMIN";
}

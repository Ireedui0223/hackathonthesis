"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, roleHome } from "@/lib/auth";

export default function DashboardRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    const user = getStoredUser();
    router.replace(user ? roleHome(user.role) : "/login");
  }, [router]);
  return <main className="grid min-h-screen place-items-center text-neutral-950">Самбар руу шилжиж байна...</main>;
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, logout } from "@/lib/auth";
import { roleLabel } from "@/lib/mn";

const links = {
  ADMIN: [
    ["/admin", "Нүүр"],
    ["/admin/users", "Хэрэглэгч"],
    ["/admin/groups", "Комисс"],
    ["/admin/schedules", "Хуваарь"],
    ["/admin/theses", "Диплом"],
    ["/admin/statistics", "Статистик"],
  ],
  STUDENT: [
    ["/student", "Нүүр"],
    ["/student/thesis", "Диплом"],
    ["/student/scores", "Оноо"],
    ["/student/schedule", "Хуваарь"],
    ["/student/critiques", "Шүүмж"],
  ],
  TEACHER: [
    ["/teacher", "Нүүр"],
    ["/teacher/mentor-students", "Оюутнууд"],
    ["/teacher/critique-groups", "Комисс"],
    ["/teacher/scoring", "Оноо"],
    ["/teacher/reviews", "Шүүмж"],
  ],
} as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const role = user?.role ?? "ADMIN";
  const items = links[role as keyof typeof links] ?? links.ADMIN;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-black tracking-tight">
              Диплом хамгаалалт
            </Link>
            <div className="lg:hidden">
              <span className="status-pill">{roleLabel(role)}</span>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {items.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
                    active ? "bg-neutral-950 text-white" : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-sm font-bold">{user?.name ?? "Demo user"}</p>
              <p className="text-xs text-neutral-500">{roleLabel(role)}</p>
            </div>
            <button
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-100"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Гарах
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

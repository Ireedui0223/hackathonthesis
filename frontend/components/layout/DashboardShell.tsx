"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredUser, logout } from "@/lib/auth";
import type { StoredUser } from "@/lib/auth";
import { roleLabel } from "@/lib/mn";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  GraduationCap,
  MessageSquare,
  Award,
  LogOut,
  Menu,
  X,
  Bot,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

const links = {
  ADMIN: [
    { href: "/admin", label: "Нүүр", icon: LayoutDashboard },
    { href: "/admin/users", label: "Хэрэглэгч", icon: Users },
    { href: "/admin/groups", label: "Комисс", icon: BookOpen },
    { href: "/admin/schedules", label: "Хуваарь", icon: Calendar },
    { href: "/admin/theses", label: "Диплом", icon: FileText },
    { href: "/admin/statistics", label: "Статистик", icon: BarChart3 },
    { href: "/admin/analytics", label: "Аналитик", icon: Activity },
  ],
  STUDENT: [
    { href: "/student", label: "Нүүр", icon: LayoutDashboard },
    { href: "/student/thesis", label: "Диплом", icon: FileText },
    { href: "/student/defense", label: "AI хамгаалалт", icon: Bot },
    { href: "/student/scores", label: "Оноо", icon: Award },
    { href: "/student/schedule", label: "Хуваарь", icon: Calendar },
    { href: "/student/critiques", label: "Шүүмж", icon: MessageSquare },
  ],
  TEACHER: [
    { href: "/teacher", label: "Нүүр", icon: LayoutDashboard },
    { href: "/teacher/mentor-students", label: "Оюутнууд", icon: GraduationCap },
    { href: "/teacher/critique-groups", label: "Комисс", icon: BookOpen },
    { href: "/teacher/defense", label: "AI хамгаалалт", icon: Bot },
    { href: "/teacher/analytics", label: "Аналитик", icon: Activity },
    { href: "/teacher/scoring", label: "Оноо", icon: Award },
    { href: "/teacher/reviews", label: "Шүүмж", icon: MessageSquare },
  ],
} as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const role = user?.role ?? "ADMIN";
  const items = user ? links[role as keyof typeof links] ?? links.ADMIN : [];

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/" className="text-lg font-black tracking-tight hover:opacity-80 transition-opacity">
                Диплом хамгаалалт
              </Link>
            </motion.div>
            
            <div className="flex items-center gap-2 lg:hidden">
              <span className="status-pill text-xs">{roleLabel(role)}</span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex gap-1 overflow-x-auto">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                    active
                      ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-neutral-500"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                className="flex flex-col gap-1 pb-2 lg:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                        active
                          ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-neutral-500"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </motion.nav>
            )}
          </AnimatePresence>

          <motion.div
            className="hidden items-center gap-3 lg:flex"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="text-right">
              <p className="text-sm font-bold">{user?.name ?? "Demo user"}</p>
              <p className="text-xs text-neutral-500">{roleLabel(role)}</p>
            </div>
            <motion.button
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold hover:bg-neutral-100 hover:border-neutral-300 transition-all"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" />
              Гарах
            </motion.button>
          </motion.div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";
import { roleLabel, teacherTypeLabel } from "@/lib/mn";

export function OverviewClient({ mode }: { mode: "admin" | "student" | "teacher" }) {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");
  const [teacherCodeMessage, setTeacherCodeMessage] = useState("");

  useEffect(() => {
    api.dashboard().then(setData).catch((err) => setError(err.message));
    if (mode === "admin") api.getStatisticsOverview().then(setStats).catch(() => null);
  }, [mode]);

  const cards = useMemo(() => {
    if (mode === "admin") {
      return [
        { label: "Оюутан", value: stats?.counts?.students ?? 0 },
        { label: "Багш", value: stats?.counts?.teachers ?? 0 },
        { label: "Диплом", value: stats?.counts?.theses ?? 0 },
        { label: "Дундаж оноо", value: Math.round(stats?.avgTotalScore ?? 0) },
      ];
    }
    if (mode === "student") {
      const thesis = data?.student?.thesis;
      return [
        { label: "Дипломын төлөв", value: thesis?.status ?? "Диплом үүсгээгүй" },
        { label: "Одоогийн хамгаалалт", value: thesis?.currentDefenseStage ?? "-" },
        { label: "Оноо", value: thesis?.defenseScores?.length ?? 0 },
        { label: "Шүүмж", value: thesis?.critiques?.length ?? 0 },
      ];
    }
    return [
      { label: "Удирдаж буй диплом", value: data?.teacher?.mentoredTheses?.length ?? 0 },
      { label: "Шүүмж комисс,", value: data?.teacher?.critiqueGroups?.length ?? 0 },
      { label: "Оноосон шүүмж", value: data?.teacher?.assignedCritiques?.length ?? 0 },
      { label: "Төрөл", value: teacherTypeLabel(data?.teacher?.user?.teacherType) },
    ];
  }, [data, mode, stats]);

  const actions =
    mode === "admin"
      ? [
          ["/admin/users", "Хэрэглэгч", "Оюутан, багш, админ нэмэх"],
          ["/admin/groups", "Шүүмж комисс,", "Багш, оюутан оноох"],
          ["/admin/theses", "Диплом оноолт", "Удирдагч, комисс,, төлөв"],
          ["/admin/statistics", "Статистик", "Оноо ба явц"],
        ]
      : mode === "student"
        ? [
            ["/student/thesis", "Диплом", "Мэдээлэл, PDF, удирдагчийн код"],
            ["/student/scores", "Оноо", "Хамгаалалтын оноо харах"],
            ["/student/schedule", "Хуваарь", "Хамгаалалтын өдөр, өрөө"],
            ["/student/critiques", "Шүүмж", "Санал ба засвар"],
          ]
        : [
            ["/teacher/mentor-students", "Оюутнууд", "Удирдаж буй диплом"],
            ["/teacher/critique-groups", "Шүүмж комисс,", "Оноогдсон бүлгүүд"],
            ["/teacher/scoring", "Оноо", "Хамгаалалтын оноо өгөх"],
            ["/teacher/reviews", "Шүүмж", "Санал, засвар шалгах"],
          ];

  async function updateTeacherCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const teacherCode = String(new FormData(event.currentTarget).get("teacherCode") ?? "");
    await api.updateTeacherCode(teacherCode);
    setTeacherCodeMessage("Багшийн код шинэчлэгдлээ.");
    setData(await api.dashboard());
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">{roleLabel(mode === "admin" ? "ADMIN" : mode === "student" ? "STUDENT" : "TEACHER")}</p>
          <h1 className="mt-2 text-3xl font-black text-neutral-950 md:text-4xl">Диплом хамгаалалтын систем</h1>
        </section>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}

        <section className="grid gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} />
          ))}
        </section>

        {mode === "teacher" ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-black">Багшийн код</h2>
            <p className="mt-1 text-sm text-neutral-600">Оюутан энэ кодыг оруулбал таны удирдлагад автоматаар оноогдоно.</p>
            <form className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={updateTeacherCode}>
              <input name="teacherCode" defaultValue={data?.teacher?.teacherCode ?? ""} className="data-input" placeholder="Жишээ: MENTOR-001" required />
              <button className="data-button shrink-0">Код хадгалах</button>
            </form>
            {teacherCodeMessage ? <p className="mt-3 text-sm font-semibold">{teacherCodeMessage}</p> : null}
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          {actions.map(([href, title, body]) => (
            <Link key={href} href={href} className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-950">
              <h2 className="font-black text-neutral-950">{title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{body}</p>
            </Link>
          ))}
        </section>
      </div>
    </DashboardShell>
  );
}

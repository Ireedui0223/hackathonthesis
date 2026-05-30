"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";

export default function AdminStatisticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState<any[]>([]);
  const [groupStats, setGroupStats] = useState<any[]>([]);

  useEffect(() => {
    void Promise.all([api.getStatisticsOverview(), api.getStatisticsTeachers(), api.getStatisticsGroups()]).then(([overviewData, teachers, groups]) => {
      setOverview(overviewData);
      setTeacherStats(teachers);
      setGroupStats(groups);
    });
  }, []);

  const counts = overview?.counts ?? {};
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">Statistics</h1>
          <p className="mt-2 text-neutral-600">Live database aggregation for defense progress, scores, teachers and groups.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Students" value={counts.students ?? 0} />
          <StatCard label="Teachers" value={counts.teachers ?? 0} />
          <StatCard label="Theses" value={counts.theses ?? 0} />
          <StatCard label="Avg total score" value={Math.round(overview?.avgTotalScore ?? 0)} />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
            <h2 className="text-xl font-black">Defense stage averages</h2>
            <div className="mt-5 grid gap-3">
              {(overview?.stageAverages ?? []).map((stage: any) => (
                <div key={stage.stage} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{stage.stage}</span>
                    <span>{stage.average.toFixed(1)} avg · {stage.completed} scores</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full bg-neutral-950" style={{ width: `${Math.min(stage.average * 4, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="font-black">Teacher averages</h2>
              <div className="mt-3 grid gap-2 text-sm">
                {teacherStats.map((row) => (
                  <div key={row.teacher} className="flex justify-between border-b border-neutral-100 py-2">
                    <span>{row.teacher}</span>
                    <b>{row.average.toFixed(1)}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="font-black">Group averages</h2>
              <div className="mt-3 grid gap-2 text-sm">
                {groupStats.map((row) => (
                  <div key={row.group} className="flex justify-between border-b border-neutral-100 py-2">
                    <span>{row.group}</span>
                    <b>{row.average.toFixed(1)}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

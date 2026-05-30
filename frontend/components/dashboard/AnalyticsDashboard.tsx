"use client";

import { ReactNode, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import rawData from "@/data/analysis.json";
import type { AnalyticsDataset } from "@/types/analysis";
import {
  GPA_LABELS,
  RISK_LABELS,
  SEASON_LABELS,
  archetypeDistribution,
  buildKpis,
  criterionPerformance,
  filterBySeason,
  reviewerConclusions,
  scoreHistogram,
  teacherDiverging,
  topAtRisk,
} from "@/lib/analytics";

const data = rawData as unknown as AnalyticsDataset;
const SEASONS = ["ALL", "S2025_WINTER", "S2026_SPRING"];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-black tracking-tight">{title}</h2>
        {note ? <span className="text-xs font-medium text-neutral-400">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Track({ value, max, tone = "bg-neutral-900" }: { value: number; max: number; tone?: string }) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function riskTone(label: string) {
  if (label === "HIGH_RISK") return "border-red-200 bg-red-50 text-red-700";
  if (label === "MEDIUM_RISK") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function AnalyticsDashboard() {
  const [season, setSeason] = useState("ALL");

  const view = useMemo(() => {
    const scoped = filterBySeason(data, season);
    return {
      students: scoped.atRiskStudents,
      kpis: buildKpis(scoped.atRiskStudents, scoped.commissionSummary.length),
      histogram: scoreHistogram(scoped.atRiskStudents),
      archetypes: archetypeDistribution(scoped.stageProgress),
      topics: [...data.topicAreaSummary].sort((a, b) => b.avg_total - a.avg_total),
      teachers: teacherDiverging(data.teacherStrictness),
      criteria: criterionPerformance(scoped.criterionSummary),
      commissions: [...scoped.commissionSummary].sort((a, b) => b.avg_total - a.avg_total),
      atRisk: topAtRisk(scoped.atRiskStudents),
      conclusions: reviewerConclusions(scoped.reviewerAlignment),
      guests: [...data.guestImpact].sort((a, b) => a.avg_guest_minus_internal_pct - b.avg_guest_minus_internal_pct),
      disagreements: [...scoped.disagreementCases].sort((a, b) => b.range_pct_of_stage - a.range_pct_of_stage),
    };
  }, [season]);

  const histMax = Math.max(...view.histogram.map((bin) => bin.count), 1);
  const archMax = Math.max(...view.archetypes.map((item) => item.count), 1);
  const conclusionTotal = view.conclusions.reduce((sum, item) => sum + item.count, 0) || 1;

  const kpiCards = [
    { label: "Нийт оюутан", value: view.kpis.total, sub: "шинжилсэн" },
    { label: "Дундаж оноо", value: view.kpis.avgScore, sub: "/ 100" },
    { label: "Тэнцсэн", value: `${view.kpis.passRate}%`, sub: "хувь" },
    { label: "Комисс", value: view.kpis.commissions, sub: "идэвхтэй" },
    { label: "Өндөр эрсдэл", value: view.kpis.highRisk, sub: "оюутан" },
  ];

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Хамгаалалтын аналитик</h1>
              <p className="mt-2 max-w-xl text-neutral-600">
                Дипломын хамгаалалтын оноо, комиссын ялгаатай байдал, багшийн хатуу зөөлөн чанар болон эрсдэлтэй оюутнуудын нэгдсэн дүр зураг.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((value) => {
                const active = season === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSeason(value)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      active ? "bg-neutral-950 text-white" : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {value === "ALL" ? "Бүх улирал" : SEASON_LABELS[value]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <p className="text-xs font-semibold text-neutral-500">{card.label}</p>
              <p className="mt-2 text-3xl font-black tabular-nums">{card.value}</p>
              <p className="text-xs text-neutral-400">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Нийт онооны тархалт" note={`${view.students.length} оюутан`}>
            <div className="flex h-48 items-end gap-2">
              {view.histogram.map((bin) => (
                <div key={bin.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-bold tabular-nums text-neutral-500">{bin.count}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-neutral-900"
                      style={{ height: `${(bin.count / histMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400">{bin.label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Явцын ангилал" note="оюутны зам">
            <div className="grid gap-3">
              {view.archetypes.map((item) => (
                <div key={item.key} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-700">{item.label}</span>
                    <span className="tabular-nums text-neutral-500">{item.count}</span>
                  </div>
                  <Track value={item.count} max={archMax} />
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Section title="Сэдвийн чиглэлээр" note="дундаж оноо / 100">
            <div className="grid gap-3">
              {view.topics.map((topic) => (
                <div key={topic.topic_area} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-700">{topic.topic_area}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{topic.student_count} оюутан</span>
                      <span className="tabular-nums font-bold">{topic.avg_total.toFixed(1)}</span>
                    </span>
                  </div>
                  <Track value={topic.avg_total} max={100} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Шалгуурын гүйцэтгэл" note="хамгийн сул нь дээр">
            <div className="grid gap-3">
              {view.criteria.map((item) => (
                <div key={item.name} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-700">{item.label}</span>
                    <span className="tabular-nums font-bold">{item.avg.toFixed(1)}%</span>
                  </div>
                  <Track value={item.avg} max={100} tone={item.avg < 75 ? "bg-amber-500" : "bg-neutral-900"} />
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Багшийн хатуу — зөөлөн чанар" note="үе тэнгийнхнээс хазайлт, нэгж: оноон хувь">
          <div className="grid gap-2">
            {view.teachers.rows.map((teacher) => {
              const strict = teacher.mean_deviation_pct < 0;
              const ratio = (Math.abs(teacher.mean_deviation_pct) / view.teachers.maxAbs) * 50;
              return (
                <div key={teacher.teacher_id} className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-3 text-sm">
                  <span className="truncate font-semibold text-neutral-700">{teacher.teacher_name}</span>
                  <div className="relative h-2 rounded-full bg-neutral-100">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-neutral-300" />
                    <div
                      className={`absolute inset-y-0 rounded-full ${strict ? "bg-indigo-500" : "bg-amber-500"}`}
                      style={strict ? { right: "50%", width: `${ratio}%` } : { left: "50%", width: `${ratio}%` }}
                    />
                  </div>
                  <span className={`w-14 text-right tabular-nums font-bold ${strict ? "text-indigo-600" : "text-amber-600"}`}>
                    {teacher.mean_deviation_pct > 0 ? "+" : ""}
                    {teacher.mean_deviation_pct.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-2"><span className="h-2 w-3 rounded-full bg-indigo-500" /> Хатуу</span>
            <span className="flex items-center gap-2"><span className="h-2 w-3 rounded-full bg-amber-500" /> Зөөлөн</span>
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Section title="Комиссын харьцуулалт" note="дундаж онооор эрэмбэлсэн">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
                  <tr>
                    <th className="py-2 pr-3 font-semibold">Комисс</th>
                    <th className="py-2 pr-3 font-semibold">Оюутан</th>
                    <th className="py-2 pr-3 font-semibold">Дундаж</th>
                    <th className="py-2 pr-3 font-semibold">Тэнцсэн</th>
                    <th className="py-2 font-semibold">Хүрээ</th>
                  </tr>
                </thead>
                <tbody>
                  {view.commissions.map((commission) => (
                    <tr key={commission.commission_id} className="border-b border-neutral-100">
                      <td className="py-2 pr-3 font-semibold text-neutral-800">
                        {SEASON_LABELS[commission.season_id] ?? commission.season_id} · {commission.commission_name}
                      </td>
                      <td className="py-2 pr-3 tabular-nums text-neutral-500">{commission.student_count}</td>
                      <td className="py-2 pr-3 tabular-nums font-bold">{commission.avg_total.toFixed(1)}</td>
                      <td className="py-2 pr-3 tabular-nums text-neutral-600">{commission.pass_rate.toFixed(0)}%</td>
                      <td className="py-2 tabular-nums text-neutral-400">
                        {commission.min_total.toFixed(0)}–{commission.max_total.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Шүүмжлэгчийн дүгнэлт" note={`${conclusionTotal} шүүмж`}>
            <div className="grid gap-3">
              {view.conclusions.map((item) => (
                <div key={item.key} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-700">{item.label}</span>
                    <span className="tabular-nums text-neutral-500">
                      {item.count} · {item.share}%
                    </span>
                  </div>
                  <Track value={item.count} max={conclusionTotal} />
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Эрсдэлтэй оюутнууд" note="эрсдэлийн оноогоор">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Оюутан</th>
                  <th className="py-2 pr-3 font-semibold">Сэдвийн чиглэл</th>
                  <th className="py-2 pr-3 font-semibold">GPA</th>
                  <th className="py-2 pr-3 font-semibold">Нийт</th>
                  <th className="py-2 pr-3 font-semibold">Үр дүн</th>
                  <th className="py-2 font-semibold">Эрсдэл</th>
                </tr>
              </thead>
              <tbody>
                {view.atRisk.map((student) => (
                  <tr key={student.student_id} className="border-b border-neutral-100">
                    <td className="py-2 pr-3 font-semibold text-neutral-800">{student.student_name}</td>
                    <td className="py-2 pr-3 text-neutral-500">{student.topic_area}</td>
                    <td className="py-2 pr-3 text-neutral-500">{GPA_LABELS[student.gpa_band] ?? student.gpa_band}</td>
                    <td className="py-2 pr-3 tabular-nums font-bold">{student.total_score.toFixed(1)}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          student.result_status === "PASSED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {student.result_status === "PASSED" ? "Тэнцсэн" : "Тэнцээгүй"}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${riskTone(student.risk_label)}`}>
                        {RISK_LABELS[student.risk_label]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Зочин үнэлэгчийн нөлөө" note="дотоод үнэлгээтэй харьцуулсан зөрүү">
            <div className="grid gap-3">
              {view.guests.map((guest) => (
                <div key={guest.guest_id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-700">{guest.guest_name}</p>
                    <p className="truncate text-xs text-neutral-400">{guest.organization_name} · {guest.appearances} удаа</p>
                  </div>
                  <span
                    className={`shrink-0 tabular-nums font-bold ${
                      guest.avg_guest_minus_internal_pct < 0 ? "text-indigo-600" : "text-amber-600"
                    }`}
                  >
                    {guest.avg_guest_minus_internal_pct > 0 ? "+" : ""}
                    {guest.avg_guest_minus_internal_pct.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Хамгийн их зөрүүтэй үнэлгээ" note="комиссын дотоод зөрүү">
            <div className="grid gap-3">
              {view.disagreements.slice(0, 6).map((item) => (
                <div key={`${item.student_id}-${item.stage}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-700">{item.student_name}</p>
                    <p className="truncate text-xs text-neutral-400">
                      {item.topic_area} · {item.evaluator_count} үнэлэгч
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums font-bold text-neutral-900">{item.range_pct_of_stage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </DashboardShell>
  );
}

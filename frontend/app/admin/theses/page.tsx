"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";
import { statusLabel } from "@/lib/mn";

const statuses = [
  "DRAFT",
  "SUBMITTED",
  "MENTOR_REVIEW",
  "DEFENSE_1_COMPLETED",
  "DEFENSE_2_COMPLETED",
  "DEFENSE_3_COMPLETED",
  "CRITIQUE_ASSIGNED",
  "REVISION_REQUIRED",
  "REVISION_SUBMITTED",
  "FINAL_DEFENSE_READY",
  "COMPLETED",
  "REJECTED",
];

export default function AdminThesesPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const mentors = useMemo(
    () => teachers.filter((teacher) => teacher.user?.teacherType === "MENTOR" || teacher.user?.teacherType === "BOTH"),
    [teachers],
  );
  const critiqueTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.user?.teacherType === "CRITIQUE" || teacher.user?.teacherType === "BOTH"),
    [teachers],
  );

  async function refresh() {
    const [thesisRows, teacherRows, groupRows] = await Promise.all([api.getTheses(), api.getTeachers(), api.getGroups()]);
    setTheses(thesisRows);
    setTeachers(teacherRows);
    setGroups(groupRows);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  const filtered = theses.filter((thesis) => {
    const haystack = `${thesis.title} ${thesis.status} ${thesis.student?.user?.name} ${thesis.academicSeason?.name} ${thesis.degreeType?.name}`.toLowerCase();
    return haystack.includes(filter.toLowerCase());
  });

  async function updateAssignment(thesisId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mentorTeacherId = String(form.get("mentorTeacherId") ?? "");
    const critiqueGroupId = String(form.get("critiqueGroupId") ?? "");
    const status = String(form.get("status") ?? "");
    const specificTeacherId = String(form.get("specificTeacherId") ?? "");

    if (mentorTeacherId) await api.assignMentor(thesisId, mentorTeacherId);
    if (critiqueGroupId) await api.assignCritiqueGroup(thesisId, critiqueGroupId);
    if (status) await api.updateThesis(thesisId, { status });
    if (specificTeacherId) await api.assignSpecificCritiqueTeacher(thesisId, specificTeacherId);
    await refresh();
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">Диплом</h1>
          <p className="mt-2 text-neutral-600">Удирдагч багш, шүүмж бүлэг, төлөв болон тусгай шүүмж багшийг онооно.</p>
        </section>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}

        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <label className="data-label">
            Хайх
            <input className="data-input" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Оюутан, сэдэв, улирал, төлөв..." />
          </label>
        </section>

        <section className="grid gap-4">
          {filtered.map((thesis) => (
            <article key={thesis.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{thesis.title}</h2>
                    <span className="status-pill">{statusLabel(thesis.status)}</span>
                    <span className="status-pill">{thesis.currentDefenseStage}-р хамгаалалт</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">
                    {thesis.student?.user?.name} · {thesis.academicSeason?.name} · {thesis.degreeType?.name}
                  </p>
                  <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <dt className="font-bold">Удирдагч багш</dt>
                      <dd className="mt-1 text-neutral-600">{thesis.mentorTeacher?.user?.name ?? "Оноогоогүй"}</dd>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <dt className="font-bold">Шүүмж бүлэг</dt>
                      <dd className="mt-1 text-neutral-600">{thesis.critiqueGroup?.name ?? "Оноогоогүй"}</dd>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <dt className="font-bold">Файл / оноо</dt>
                      <dd className="mt-1 text-neutral-600">{thesis.files?.length ?? 0} файл · {thesis.defenseScores?.length ?? 0} оноо</dd>
                    </div>
                  </dl>
                </div>

                <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => updateAssignment(thesis.id, event)}>
                  <label className="data-label">
                    Удирдагч багш
                    <select className="data-input" name="mentorTeacherId" defaultValue="">
                      <option value="">Өөрчлөхгүй</option>
                      {mentors.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="data-label">
                    Шүүмж бүлэг
                    <select className="data-input" name="critiqueGroupId" defaultValue="">
                      <option value="">Өөрчлөхгүй</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="data-label">
                    Төлөв
                    <select className="data-input" name="status" defaultValue="">
                      <option value="">Өөрчлөхгүй</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>{statusLabel(status)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="data-label">
                    Тусгай шүүмж багш
                    <select className="data-input" name="specificTeacherId" defaultValue="">
                      <option value="">Оноохгүй</option>
                      {critiqueTeachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                      ))}
                    </select>
                  </label>
                  <button className="data-button">Хадгалах</button>
                </form>
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardShell>
  );
}

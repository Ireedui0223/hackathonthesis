"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";
import { teacherTypeLabel } from "@/lib/mn";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState("");

  const critiqueTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.user?.teacherType === "CRITIQUE" || teacher.user?.teacherType === "BOTH"),
    [teachers],
  );

  async function refresh() {
    const [groupRows, seasonRows, degreeRows, teacherRows, studentRows] = await Promise.all([
      api.getGroups(),
      api.getSeasons(),
      api.getDegreeTypes(),
      api.getTeachers(),
      api.getStudents(),
    ]);
    setGroups(groupRows);
    setSeasons(seasonRows);
    setDegrees(degreeRows);
    setTeachers(teacherRows);
    setStudents(studentRows);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await api.createGroup(data);
    event.currentTarget.reset();
    await refresh();
  }

  async function assignTeacher(groupId: string, form: HTMLFormElement) {
    const teacherId = String(new FormData(form).get("teacherId"));
    await api.addGroupTeacher(groupId, teacherId);
    form.reset();
    await refresh();
  }

  async function assignStudent(groupId: string, form: HTMLFormElement) {
    const studentId = String(new FormData(form).get("studentId"));
    await api.addGroupStudent(groupId, studentId);
    form.reset();
    await refresh();
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">Шүүмжийн бүлэг</h1>
          <p className="mt-2 text-neutral-600">Шүүмж багш болон оюутнуудыг бүлэгт онооно.</p>
        </section>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-black">Бүлэг нэмэх</h2>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={createGroup}>
            <label className="data-label">
              Бүлгийн нэр
              <input name="name" className="data-input" placeholder="Хаврын хамгаалалт A" required />
            </label>
            <label className="data-label">
              Улирал
              <select name="academicSeasonId" className="data-input" required>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </select>
            </label>
            <label className="data-label">
              Зэрэг
              <select name="degreeTypeId" className="data-input">
                <option value="">Бүх зэрэг</option>
                {degrees.map((degree) => (
                  <option key={degree.id} value={degree.id}>{degree.name}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button className="data-button w-full">Нэмэх</button>
            </div>
          </form>
        </section>

        <section className="grid gap-4">
          {groups.map((group) => {
            const activeTeachers = group.teachers?.filter((item: any) => item.isActive) ?? [];
            return (
              <article key={group.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-black">{group.name}</h2>
                    <p className="text-sm text-neutral-600">{group.academicSeason?.name} · {group.degreeType?.name ?? "Бүх зэрэг"}</p>
                  </div>
                  <span className="status-pill">{activeTeachers.length}/6 багш · {group.students?.length ?? 0} оюутан</span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h3 className="font-black">Шүүмж багш</h3>
                    <div className="mt-3 grid gap-2">
                      {activeTeachers.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                          <div>
                            <p className="font-bold">{item.teacher?.user?.name}</p>
                            <p className="text-xs text-neutral-500">{teacherTypeLabel(item.teacher?.user?.teacherType)} · {item.teacher?.user?.email}</p>
                          </div>
                          <button className="data-button secondary" onClick={() => api.removeGroupTeacher(group.id, item.teacherId).then(refresh)}>
                            Хасах
                          </button>
                        </div>
                      ))}
                    </div>
                    <form
                      className="mt-3 flex gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void assignTeacher(group.id, event.currentTarget);
                      }}
                    >
                      <select name="teacherId" className="data-input" required>
                        {critiqueTeachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                        ))}
                      </select>
                      <button className="data-button">Нэмэх</button>
                    </form>
                  </div>

                  <div>
                    <h3 className="font-black">Оюутан</h3>
                    <div className="mt-3 grid gap-2">
                      {(group.students ?? []).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                          <div>
                            <p className="font-bold">{item.student?.user?.name}</p>
                            <p className="text-xs text-neutral-500">{item.student?.studentCode}</p>
                          </div>
                          <button className="data-button secondary" onClick={() => api.removeGroupStudent(group.id, item.studentId).then(refresh)}>
                            Хасах
                          </button>
                        </div>
                      ))}
                    </div>
                    <form
                      className="mt-3 flex gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void assignStudent(group.id, event.currentTarget);
                      }}
                    >
                      <select name="studentId" className="data-input" required>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>{student.user?.name}</option>
                        ))}
                      </select>
                      <button className="data-button">Нэмэх</button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </DashboardShell>
  );
}

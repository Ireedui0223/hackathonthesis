"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { statusLabel } from "@/lib/mn";

export function CritiqueWorkflowPage({ mode }: { mode: "student" | "teacher" }) {
  const [critiques, setCritiques] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    setCritiques(await api.getCritiques());
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  async function submitFeedback(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await api.submitCritiqueFeedback(id, data);
    setMessage("Шүүмж хадгалагдлаа");
    event.currentTarget.reset();
    await refresh();
  }

  async function submitRevision(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.submitRevision(id, new FormData(event.currentTarget));
    setMessage("Засвар илгээгдлээ");
    event.currentTarget.reset();
    await refresh();
  }

  async function submitDecision(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await api.submitCritiqueFinalDecision(id, data);
    setMessage("Шийдвэр хадгалагдлаа");
    event.currentTarget.reset();
    await refresh();
  }

  const user = getStoredUser();

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">{mode === "teacher" ? "Оноогдсон шүүмж" : "Миний шүүмж"}</h1>
          <p className="mt-2 text-neutral-600">
            {mode === "teacher"
              ? "3-р хамгаалалтын дараах санал, шаардлагатай засвар болон эцсийн шийдвэрийг оруулна."
              : "Шүүмжийн санал, шаардлагатай засварыг хараад засварын файлаа илгээнэ."}
          </p>
        </section>

        {message ? <p className="rounded-lg border border-neutral-200 bg-white p-4 font-semibold">{message}</p> : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}

        <section className="grid gap-4">
          {critiques.map((critique) => (
            <article key={critique.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-black">{critique.thesis?.title}</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Оюутан: {critique.thesis?.student?.user?.name} · Шүүмж багш: {critique.assignedTeacher?.user?.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="status-pill">{statusLabel(critique.status)}</span>
                  <span className="status-pill">Дуусах: {new Date(critique.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-neutral-50 p-4">
                  <h3 className="font-black">Санал</h3>
                  <p className="mt-2 text-sm text-neutral-700">{critique.feedback ?? "Одоогоор санал алга."}</p>
                  <h3 className="mt-4 font-black">Шаардлагатай засвар</h3>
                  <p className="mt-2 text-sm text-neutral-700">{critique.requiredChanges ?? "Одоогоор засварын шаардлага алга."}</p>
                </div>

                {mode === "teacher" ? (
                  <div className="grid gap-3">
                    <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => submitFeedback(critique.id, event)}>
                      <h3 className="font-black">Шүүмж бичих</h3>
                      <textarea name="feedback" className="data-input min-h-24" placeholder="Санал" required />
                      <textarea name="requiredChanges" className="data-input min-h-20" placeholder="Шаардлагатай засвар" />
                      <button className="data-button">Шүүмж хадгалах</button>
                    </form>
                    <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => submitDecision(critique.id, event)}>
                      <h3 className="font-black">Эцсийн шийдвэр</h3>
                      <select name="status" className="data-input">
                        <option value="APPROVED">Батлах</option>
                        <option value="NEEDS_MORE_WORK">Дахин засуулах</option>
                      </select>
                      <input name="teacherFinalComment" className="data-input" placeholder="Эцсийн тайлбар" />
                      <button className="data-button">Шийдвэр хадгалах</button>
                    </form>
                  </div>
                ) : (
                  <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => submitRevision(critique.id, event)}>
                    <h3 className="font-black">Засвар илгээх</h3>
                    <p className="text-sm text-neutral-600">{user?.name} нэрээр нэвтэрсэн. Энэ шүүмжид нэг засварын файл илгээнэ.</p>
                    <input name="file" type="file" className="data-input" required />
                    <button className="data-button">Засвар илгээх</button>
                  </form>
                )}
              </div>
            </article>
          ))}
          {critiques.length === 0 ? <div className="rounded-xl border border-neutral-200 bg-white p-8 text-neutral-500">Одоогоор шүүмж оноогоогүй байна.</div> : null}
        </section>
      </div>
    </DashboardShell>
  );
}

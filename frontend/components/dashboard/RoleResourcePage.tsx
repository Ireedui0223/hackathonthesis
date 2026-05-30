"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { api } from "@/lib/api";
import { statusLabel } from "@/lib/mn";

export function ThesisEditorPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");

  async function refresh() {
    const [t, s, d] = await Promise.all([api.getTheses(), api.getSeasons(), api.getDegreeTypes()]);
    setTheses(t);
    setSeasons(s);
    setDegrees(d);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (theses[0]) await api.updateThesis(theses[0].id, data);
    else await api.createThesis(data);
    setMessage("Дипломын мэдээлэл хадгалагдлаа");
    await refresh();
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!thesis) return;
    await api.uploadThesisFile(thesis.id, new FormData(event.currentTarget));
    event.currentTarget.reset();
    setMessage("PDF файл хуулагдлаа");
    await refresh();
  }

  const thesis = theses[0];
  const pdfFiles = (thesis?.files ?? []).filter((file: any) => file.mimeType === "application/pdf" || file.originalName?.toLowerCase().endsWith(".pdf"));
  const selectedPdf = pdfFiles.find((file: any) => file.id === selectedFileId) ?? pdfFiles[0];
  const fileSignature = pdfFiles.map((file: any) => file.id).join("|");

  useEffect(() => {
    if (!selectedFileId && pdfFiles[0]?.id) setSelectedFileId(pdfFiles[0].id);
    if (selectedFileId && pdfFiles.length > 0 && !pdfFiles.some((file: any) => file.id === selectedFileId)) {
      setSelectedFileId(pdfFiles[0].id);
    }
  }, [fileSignature, selectedFileId]);

  useEffect(() => {
    let objectUrl = "";
    setPreviewError("");
    if (!thesis?.id || !selectedPdf?.id) {
      setPreviewUrl("");
      return;
    }

    api.downloadThesisFile(thesis.id, selectedPdf.id)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch((err) => {
        setPreviewUrl("");
        setPreviewError(err instanceof Error ? err.message : "PDF харахад алдаа гарлаа");
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [thesis?.id, selectedPdf?.id]);

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">Дипломын самбар</h1>
          <p className="mt-2 text-neutral-600">Дипломын мэдээлэл, удирдагч багшийн код, PDF файлаа нэг дор удирдана.</p>
        </section>
        {message ? <p className="rounded-lg border border-neutral-200 bg-white p-4 font-semibold">{message}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black">Дипломын мэдээлэл</h2>
            <form className="grid gap-4" onSubmit={submit}>
              <label className="data-label">
                Сэдэв
                <input name="title" defaultValue={thesis?.title} className="data-input" required />
              </label>
              <label className="data-label">
                Хураангуй
                <textarea name="abstract" defaultValue={thesis?.abstract} className="data-input min-h-36" />
              </label>
              <label className="data-label">
                Түлхүүр үг
                <input name="keywords" defaultValue={thesis?.keywords} className="data-input" />
              </label>
              {!thesis ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="data-label">
                    Хичээлийн улирал
                    <select name="academicSeasonId" className="data-input" required>
                      {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
                    </select>
                  </label>
                  <label className="data-label">
                    Зэрэг
                    <select name="degreeTypeId" className="data-input" required>
                      {degrees.map((degree) => <option key={degree.id} value={degree.id}>{degree.name}</option>)}
                    </select>
                  </label>
                </div>
              ) : null}
              {thesis ? (
                <div className="grid gap-3 rounded-lg bg-neutral-50 p-4 text-sm md:grid-cols-3">
                  <div><b>Төлөв:</b> {statusLabel(thesis.status)}</div>
                  <div><b>Удирдагч:</b> {thesis.mentorTeacher?.user?.name ?? "Оноогоогүй"}</div>
                  <div><b>Комисс:</b> {thesis.critiqueGroup?.name ?? "Оноогоогүй"}</div>
                </div>
              ) : null}
              <label className="data-label">
                Удирдагч багшийн код
                <input name="mentorTeacherCode" className="data-input" placeholder="Жишээ: MENTOR-001" />
              </label>
              <button className="data-button w-fit">Хадгалах</button>
            </form>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black">Дипломын PDF</h2>
                <p className="text-sm text-neutral-600">PDF файлаа оруулаад шууд эндээс харна.</p>
              </div>
              {pdfFiles.length > 0 ? <span className="status-pill">{pdfFiles.length} файл</span> : null}
            </div>

            {thesis ? (
              <form className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={upload}>
                <label className="data-label">
                  PDF файл
                  <input name="file" type="file" accept="application/pdf" className="data-input" required />
                </label>
                <label className="data-label">
                  Төрөл
                  <select name="fileType" className="data-input" defaultValue="FINAL">
                    <option>PROPOSAL</option>
                    <option>DRAFT</option>
                    <option>PRE_FINAL</option>
                    <option>FINAL</option>
                    <option>REVISION</option>
                    <option>OTHER</option>
                  </select>
                </label>
                <div className="flex items-end">
                  <button className="data-button w-full">PDF хуулах</button>
                </div>
              </form>
            ) : (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                Эхлээд дипломын мэдээллээ хадгалаад дараа нь PDF файлаа оруулна.
              </div>
            )}

            {pdfFiles.length > 0 ? (
              <div className="mb-4">
                <label className="data-label">
                  Харах файл
                  <select value={selectedPdf?.id ?? ""} onChange={(event) => setSelectedFileId(event.target.value)} className="data-input">
                    {pdfFiles.map((file: any) => (
                      <option key={file.id} value={file.id}>
                        {file.originalName} - {new Date(file.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              {previewUrl ? (
                <iframe src={previewUrl} title="Дипломын PDF харах" className="h-[640px] w-full bg-white" />
              ) : (
                <div className="flex h-[360px] items-center justify-center p-6 text-center text-sm text-neutral-500">
                  {previewError || "Одоогоор PDF файл оруулаагүй байна."}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

export function FilesPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    setTheses(await api.getTheses());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!theses[0]) return;
    await api.uploadThesisFile(theses[0].id, new FormData(event.currentTarget));
    event.currentTarget.reset();
    setMessage("File uploaded");
    await refresh();
  }

  const thesis = theses[0];
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">Дипломын файлууд</h1>
          <p className="mt-2 text-neutral-600">Ноорог, эцсийн файл, засварын хувилбарууд.</p>
        </section>
        {message ? <p className="rounded-lg border border-neutral-200 bg-white p-4 font-semibold">{message}</p> : null}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
            <label className="data-label md:col-span-1">
              Файл
              <input name="file" type="file" className="data-input" required />
            </label>
            <label className="data-label">
              Файлын төрөл
              <select name="fileType" className="data-input">
                <option>PROPOSAL</option>
                <option>DRAFT</option>
                <option>PRE_FINAL</option>
                <option>FINAL</option>
                <option>REVISION</option>
                <option>OTHER</option>
              </select>
            </label>
            <label className="data-label">
              Тайлбар
              <input name="notes" className="data-input" />
            </label>
            <div className="flex items-end">
              <button className="data-button w-full">Хуулах</button>
            </div>
          </form>
        </section>
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr><th className="px-4 py-3">Файл</th><th className="px-4 py-3">Төрөл</th><th className="px-4 py-3">Хэмжээ</th><th className="px-4 py-3">Огноо</th></tr>
            </thead>
            <tbody>
              {(thesis?.files ?? []).map((file: any) => (
                <tr key={file.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-bold">{file.originalName}</td>
                  <td className="px-4 py-3"><span className="status-pill">{file.fileType}</span></td>
                  <td className="px-4 py-3 text-neutral-600">{file.size} bytes</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(file.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardShell>
  );
}

export function ListPage({ title, description, load }: { title: string; description: string; load: () => Promise<any[]> }) {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    load().then(setItems).catch((err) => setError(err.message));
  }, [load]);

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-2 text-neutral-600">{description}</p>
        </section>
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr><th className="px-4 py-3">Нэр</th><th className="px-4 py-3">Төлөв</th><th className="px-4 py-3">Мэдээлэл</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td className="px-4 py-8 text-neutral-500" colSpan={3}>Одоогоор мэдээлэл алга.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-bold">{item.title ?? item.name ?? item.thesis?.title ?? item.defenseStage?.name ?? item.id}</td>
                  <td className="px-4 py-3"><span className="status-pill">{item.status ? statusLabel(item.status) : item.defenseStage?.stageNumber ?? "Идэвхтэй"}</span></td>
                  <td className="px-4 py-3 text-neutral-600">{item.location ?? item.academicSeason?.name ?? item.comment ?? item.feedback ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardShell>
  );
}

export function ScoringPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    const [t, s] = await Promise.all([api.getTheses(), api.getDefenseStages()]);
    setTheses(t);
    setStages(s);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const thesisId = String(formData.get("thesisId"));
    await api.submitDefenseScore(thesisId, {
      defenseStageId: String(formData.get("defenseStageId")),
      score: Number(formData.get("score")),
      comment: String(formData.get("comment") ?? ""),
    });
    setMessage("Score submitted");
    event.currentTarget.reset();
    await refresh();
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">Оноо өгөх</h1>
          <p className="mt-2 text-neutral-600">Удирдагч багш 1-р хамгаалалт, шүүмж багш 2-4-р хамгаалалтад оноо өгнө.</p>
        </section>
        {message ? <p className="rounded-lg border border-neutral-200 bg-white p-4 font-semibold">Оноо хадгалагдлаа</p> : null}
        <section className="grid gap-4">
          {theses.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-8 text-neutral-500">Одоогоор оноо өгөх оюутан алга.</div>
          ) : theses.map((thesis) => (
            <article key={thesis.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-black">{thesis.student?.user?.name ?? "Student"}</h2>
                  <p className="text-sm font-semibold text-neutral-700">{thesis.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {thesis.academicSeason?.name} / {thesis.degreeType?.name} / {thesis.status}
                  </p>
                </div>
                <span className="status-pill">{thesis.currentDefenseStage}-р хамгаалалт</span>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {(thesis.defenseScores ?? []).length === 0 ? (
                  <span className="text-sm text-neutral-500">Одоогоор оноо алга.</span>
                ) : thesis.defenseScores.map((score: any) => (
                  <span key={score.id} className="status-pill">
                    D{score.defenseStage?.stageNumber}: {score.score}/{score.defenseStage?.maxScore}
                  </span>
                ))}
              </div>

              <form className="grid gap-3 md:grid-cols-[1.1fr_0.5fr_1fr_auto]" onSubmit={submit}>
                <input type="hidden" name="thesisId" value={thesis.id} />
                <label className="data-label">
                  Хамгаалалт
                  <select name="defenseStageId" className="data-input" required>
                    {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.stageNumber}. {stage.name} / {stage.maxScore}</option>)}
                  </select>
                </label>
                <label className="data-label">
                  Оноо
                  <input name="score" type="number" step="0.1" min="0" className="data-input" required />
                </label>
                <label className="data-label">
                  Тайлбар
                  <input name="comment" className="data-input" />
                </label>
                <div className="flex items-end">
                  <button className="data-button w-full">Оноо хадгалах</button>
                </div>
              </form>
            </article>
          ))}
        </section>
      </div>
    </DashboardShell>
  );
}

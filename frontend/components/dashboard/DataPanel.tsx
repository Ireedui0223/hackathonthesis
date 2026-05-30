"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { roleLabel, statusLabel, teacherTypeLabel } from "@/lib/mn";

type DataField = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: Array<[string, string]>;
  showWhen?: (values: Record<string, string>) => boolean;
};

export function DataPanel({
  title,
  description,
  load,
  create,
  fields = [],
}: {
  title: string;
  description: string;
  load: () => Promise<any[]>;
  create?: (data: Record<string, string>) => Promise<any>;
  fields?: DataField[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setItems(await load());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!create) return;
    try {
      const form = new FormData(event.currentTarget);
      const nextValues = Object.fromEntries(fields.map((field) => [field.name, String(form.get(field.name) ?? "")])) as Record<string, string>;
      const visibleFields = fields.filter((field) => !field.showWhen || field.showWhen(nextValues));
      const data = Object.fromEntries(
        visibleFields.map((field) => [field.name, String(form.get(field.name) ?? "")]),
      ) as Record<string, string>;
      await create(data);
      event.currentTarget.reset();
      setFormValues({});
      setError("");
      setSuccess("Амжилттай хадгаллаа.");
      await refresh();
    } catch (err) {
      setSuccess("");
      setError(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа");
    }
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black text-neutral-950">{title}</h1>
          <p className="mt-2 text-neutral-600">{description}</p>
        </section>

        {create ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 font-black">Шинээр нэмэх</h2>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={submit}>
              {fields.filter((field) => !field.showWhen || field.showWhen(formValues)).map((field) => (
                <label className="data-label" key={field.name}>
                  {field.label}
                  {field.options ? (
                    <select
                      name={field.name}
                      className="data-input"
                      value={formValues[field.name] ?? field.options[0]?.[0] ?? ""}
                      onChange={(event) => setFormValues((values) => ({ ...values, [field.name]: event.target.value }))}
                    >
                      {field.options.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type ?? "text"}
                      placeholder={field.placeholder ?? field.label}
                      className="data-input"
                      value={formValues[field.name] ?? ""}
                      onChange={(event) => setFormValues((values) => ({ ...values, [field.name]: event.target.value }))}
                    />
                  )}
                </label>
              ))}
              <div className="flex items-end">
                <button className="data-button w-full">Нэмэх</button>
              </div>
            </form>
          </section>
        ) : null}

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}
        {success ? <p className="rounded-lg border border-neutral-200 bg-white p-4 font-semibold">{success}</p> : null}

        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Нэр / гарчиг</th>
                  <th className="px-4 py-3">Төлөв</th>
                  <th className="px-4 py-3">Мэдээлэл</th>
                  <th className="px-4 py-3">Шинэчилсэн</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-8 text-neutral-500" colSpan={4}>
                      Уншиж байна...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-neutral-500" colSpan={4}>
                      Одоогоор мэдээлэл алга.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 font-bold text-neutral-950">
                        {item.name ?? item.title ?? item.user?.name ?? item.thesis?.title ?? item.email ?? item.id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="status-pill">
                          {item.role ? roleLabel(item.role) : item.teacherType ? teacherTypeLabel(item.teacherType) : statusLabel(item.status ?? item.isActive?.toString?.() ?? "Идэвхтэй")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {item.email ?? item.academicSeason?.name ?? item.degreeType?.name ?? item.student?.user?.name ?? item.location ?? item.teacherCode ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

"use client";

import { DataPanel } from "@/components/dashboard/DataPanel";
import { api } from "@/lib/api";

export default function AdminSeasonsPage() {
  return <DataPanel title="Хичээлийн улирал" description="Хамгаалалтын улирал нэмнэ." load={api.getSeasons} create={api.createSeason} fields={[{ name: "name", label: "Улирлын нэр", placeholder: "2025-2026 Хавар" }]} />;
}

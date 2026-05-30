"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "@/components/dashboard/DataPanel";
import { api } from "@/lib/api";

export default function AdminSchedulesPage() {
  const [options, setOptions] = useState<{ seasons: any[]; degrees: any[]; stages: any[] }>({ seasons: [], degrees: [], stages: [] });
  useEffect(() => { void Promise.all([api.getSeasons(), api.getDegreeTypes(), api.getDefenseStages()]).then(([seasons, degrees, stages]) => setOptions({ seasons, degrees, stages })); }, []);
  return (
    <DataPanel
      title="Хамгаалалтын хуваарь"
      description="Улирал, хамгаалалтын шат, өдөр, өрөөний мэдээлэл нэмнэ."
      load={api.getSchedules}
      create={api.createSchedule}
      fields={[
        { name: "title", label: "Гарчиг" },
        { name: "academicSeasonId", label: "Улирал", options: options.seasons.map((s) => [s.id, s.name]) },
        { name: "degreeTypeId", label: "Зэрэг", options: options.degrees.map((d) => [d.id, d.name]) },
        { name: "defenseStageId", label: "Шат", options: options.stages.map((s) => [s.id, `${s.stageNumber}. ${s.name}`]) },
        { name: "defenseDate", label: "Огноо", type: "datetime-local" },
        { name: "location", label: "Байршил" },
      ]}
    />
  );
}

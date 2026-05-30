"use client";

import { ListPage } from "@/components/dashboard/RoleResourcePage";
import { api } from "@/lib/api";

export default function Page() {
  return <ListPage title="Оноо" description="Хамгаалалтын оноо болон тайлбар." load={async () => (await api.getTheses()).flatMap((t: any) => t.defenseScores ?? [])} />;
}

"use client";

import { ListPage } from "@/components/dashboard/RoleResourcePage";
import { api } from "@/lib/api";

export default function Page() {
  return <ListPage title="Удирдаж буй оюутнууд" description="Танд оноогдсон дипломын жагсаалт." load={api.getTheses} />;
}

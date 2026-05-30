"use client";

import { ListPage } from "@/components/dashboard/RoleResourcePage";
import { api } from "@/lib/api";

export default function Page() {
  return <ListPage title="Шүүмжийн бүлгүүд" description="Та шүүмж багшаар оноогдсон бүлгүүд." load={api.getGroups} />;
}

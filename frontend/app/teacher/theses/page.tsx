"use client";

import { ListPage } from "@/components/dashboard/RoleResourcePage";
import { api } from "@/lib/api";

export default function Page() {
  return <ListPage title="Teacher Theses" description="Mentor assignments and critique-group theses." load={api.getTheses} />;
}

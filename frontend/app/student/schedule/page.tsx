"use client";

import { ListPage } from "@/components/dashboard/RoleResourcePage";
import { api } from "@/lib/api";

export default function Page() {
  return <ListPage title="Хуваарь" description="Таны улирал, зэргийн хамгаалалтын хуваарь." load={api.getSchedules} />;
}

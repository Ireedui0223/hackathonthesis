"use client";

import { DataPanel } from "@/components/dashboard/DataPanel";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  return (
    <DataPanel
      title="Хэрэглэгчид"
      description="Оюутан, удирдагч багш, шүүмж багш болон админ хэрэглэгч нэмнэ."
      load={api.getUsers}
      create={api.createUser}
      fields={[
        { name: "name", label: "Нэр" },
        { name: "email", label: "Имэйл" },
        { name: "password", label: "Нууц үг", placeholder: "password123" },
        { name: "role", label: "Эрх", options: [["STUDENT", "Оюутан"], ["TEACHER", "Багш"], ["ADMIN", "Админ"]] },
        {
          name: "teacherType",
          label: "Багшийн төрөл",
          options: [["MENTOR", "Удирдагч багш"], ["CRITIQUE", "Шүүмж багш"], ["BOTH", "Хоёулаа"]],
          showWhen: (values) => values.role === "TEACHER",
        },
        { name: "studentCode", label: "Оюутны код", showWhen: (values) => !values.role || values.role === "STUDENT" },
        { name: "teacherCode", label: "Багшийн код", showWhen: (values) => values.role === "TEACHER" },
        { name: "title", label: "Албан тушаал", showWhen: (values) => values.role === "TEACHER" },
      ]}
    />
  );
}

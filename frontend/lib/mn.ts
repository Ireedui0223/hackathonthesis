export function roleLabel(role?: string | null) {
  if (role === "ADMIN") return "Админ";
  if (role === "STUDENT") return "Оюутан";
  if (role === "TEACHER") return "Багш";
  return role ?? "-";
}

export function teacherTypeLabel(type?: string | null) {
  if (type === "MENTOR") return "Удирдагч багш";
  if (type === "CRITIQUE") return "Шүүмж багш";
  if (type === "BOTH") return "Удирдагч / шүүмж багш";
  return type ?? "-";
}

export function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    DRAFT: "Ноорог",
    SUBMITTED: "Илгээсэн",
    MENTOR_REVIEW: "Удирдагчийн хяналт",
    DEFENSE_1_COMPLETED: "1-р хамгаалалт дууссан",
    DEFENSE_2_COMPLETED: "2-р хамгаалалт дууссан",
    DEFENSE_3_COMPLETED: "3-р хамгаалалт дууссан",
    CRITIQUE_ASSIGNED: "Шүүмж багш оноосон",
    REVISION_REQUIRED: "Засвар шаардлагатай",
    REVISION_SUBMITTED: "Засвар илгээсэн",
    FINAL_DEFENSE_READY: "Эцсийн хамгаалалтад бэлэн",
    COMPLETED: "Дууссан",
    REJECTED: "Татгалзсан",
    ASSIGNED: "Оноосон",
    FEEDBACK_GIVEN: "Санал өгсөн",
    APPROVED: "Баталсан",
    NEEDS_MORE_WORK: "Дахин засах",
  };
  return status ? labels[status] ?? status : "-";
}

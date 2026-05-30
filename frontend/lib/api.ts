import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api";

type ApiResponse<T> = { success: true; data: T; message: string } | { success: false; message: string };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) throw new Error(payload.message || "Request failed");
  return payload.data;
}

export const api = {
  login: (email: string, password: string) => request<{ token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMe: () => request<any>("/auth/me"),
  dashboard: () => request<any>("/dashboard"),
  updateTeacherCode: (teacherCode: string) => request<any>("/me/teacher-code", { method: "PATCH", body: JSON.stringify({ teacherCode }) }),
  getUsers: () => request<any[]>("/admin/users"),
  createUser: (data: any) => request<any>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  getStudents: () => request<any[]>("/admin/students"),
  getTeachers: () => request<any[]>("/admin/teachers"),
  getSeasons: () => request<any[]>("/academic-seasons"),
  createSeason: (data: any) => request<any>("/admin/academic-seasons", { method: "POST", body: JSON.stringify(data) }),
  getDegreeTypes: () => request<any[]>("/degree-types"),
  createDegreeType: (data: any) => request<any>("/admin/degree-types", { method: "POST", body: JSON.stringify(data) }),
  getTheses: () => request<any[]>("/theses"),
  getThesis: (id: string) => request<any>(`/theses/${id}`),
  createThesis: (data: any) => request<any>("/theses", { method: "POST", body: JSON.stringify(data) }),
  updateThesis: (id: string, data: any) => request<any>(`/theses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  assignMentor: (thesisId: string, mentorTeacherId: string) => request<any>(`/admin/theses/${thesisId}/assign-mentor`, { method: "PATCH", body: JSON.stringify({ mentorTeacherId }) }),
  assignCritiqueGroup: (thesisId: string, critiqueGroupId: string) => request<any>(`/admin/theses/${thesisId}/assign-critique-group`, { method: "PATCH", body: JSON.stringify({ critiqueGroupId }) }),
  assignSpecificCritiqueTeacher: (thesisId: string, assignedTeacherId: string) => request<any>(`/admin/theses/${thesisId}/assign-specific-critique-teacher`, { method: "POST", body: JSON.stringify({ assignedTeacherId }) }),
  uploadThesisFile: (thesisId: string, data: FormData) => request<any>(`/theses/${thesisId}/files`, { method: "POST", body: data }),
  downloadThesisFile: async (thesisId: string, fileId: string) => {
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("authorization", `Bearer ${token}`);
    const response = await fetch(`${API_URL}/theses/${thesisId}/files/${fileId}/view`, { headers, cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load thesis file");
    return response.blob();
  },
  getSchedules: () => request<any[]>("/schedules"),
  createSchedule: (data: any) => request<any>("/admin/schedules", { method: "POST", body: JSON.stringify(data) }),
  getDefenseStages: () => request<any[]>("/defense-stages"),
  submitDefenseScore: (thesisId: string, data: any) => request<any>(`/theses/${thesisId}/defense-scores`, { method: "POST", body: JSON.stringify(data) }),
  getCritiques: () => request<any[]>("/critiques"),
  submitCritiqueFeedback: (id: string, data: any) => request<any>(`/critiques/${id}/feedback`, { method: "PATCH", body: JSON.stringify(data) }),
  submitRevision: (id: string, data: FormData) => request<any>(`/critiques/${id}/submit-revision`, { method: "POST", body: data }),
  submitCritiqueFinalDecision: (id: string, data: any) => request<any>(`/critiques/${id}/final-decision`, { method: "PATCH", body: JSON.stringify(data) }),
  getGroups: () => request<any[]>("/critique-groups"),
  createGroup: (data: any) => request<any>("/admin/critique-groups", { method: "POST", body: JSON.stringify(data) }),
  addGroupTeacher: (groupId: string, teacherId: string) => request<any>(`/admin/critique-groups/${groupId}/teachers`, { method: "POST", body: JSON.stringify({ teacherId }) }),
  removeGroupTeacher: (groupId: string, teacherId: string) => request<any>(`/admin/critique-groups/${groupId}/teachers/${teacherId}`, { method: "DELETE" }),
  replaceGroupTeacher: (groupId: string, oldTeacherId: string, newTeacherId: string) => request<any>(`/admin/critique-groups/${groupId}/teachers/${oldTeacherId}/replace`, { method: "PATCH", body: JSON.stringify({ newTeacherId }) }),
  addGroupStudent: (groupId: string, studentId: string) => request<any>(`/admin/critique-groups/${groupId}/students`, { method: "POST", body: JSON.stringify({ studentId }) }),
  removeGroupStudent: (groupId: string, studentId: string) => request<any>(`/admin/critique-groups/${groupId}/students/${studentId}`, { method: "DELETE" }),
  getStatisticsOverview: () => request<any>("/statistics/overview"),
  getStatisticsSeasons: () => request<any[]>("/statistics/seasons"),
  getStatisticsStages: () => request<any[]>("/statistics/defense-stages"),
  getStatisticsTeachers: () => request<any[]>("/statistics/teachers"),
  getStatisticsGroups: () => request<any[]>("/statistics/groups"),
};

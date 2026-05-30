import type { DefenseStage, Thesis, User } from "@prisma/client";
import { TeacherType, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";

export function isAdmin(user: AuthUser) {
  return user.role === UserRole.ADMIN;
}

export type AuthUser = Pick<User, "id" | "email" | "name" | "role"> & { teacherType?: TeacherType | null };

export async function canAccessThesis(user: AuthUser, thesisId: string) {
  if (isAdmin(user)) return true;
  const thesis = await prisma.thesis.findUnique({
    where: { id: thesisId },
    include: {
      student: true,
      mentorTeacher: true,
      critiqueGroup: { include: { teachers: true } },
    },
  });
  if (!thesis) return false;
  if (user.role === UserRole.STUDENT) return thesis.student.userId === user.id;
  if (user.role === UserRole.TEACHER && thesis.mentorTeacher?.userId === user.id) return true;
  if (user.role === UserRole.TEACHER) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    return Boolean(teacher && thesis.critiqueGroup?.teachers.some((item) => item.teacherId === teacher.id && item.isActive));
  }
  return false;
}

export async function canScoreThesis(user: AuthUser, thesis: Thesis, stage: DefenseStage) {
  if (isAdmin(user)) return true;
  if (user.role !== UserRole.TEACHER) return false;
  const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
  if (!teacher) return false;
  if (stage.stageNumber === 1) {
    return thesis.mentorTeacherId === teacher.id && (user.teacherType === TeacherType.MENTOR || user.teacherType === TeacherType.BOTH);
  }
  if (user.teacherType !== TeacherType.CRITIQUE && user.teacherType !== TeacherType.BOTH) return false;
  if (!thesis.critiqueGroupId) return false;
  const membership = await prisma.critiqueGroupTeacher.findUnique({
    where: { groupId_teacherId: { groupId: thesis.critiqueGroupId, teacherId: teacher.id } },
  });
  return Boolean(membership?.isActive);
}

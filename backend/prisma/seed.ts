import bcrypt from "bcrypt";
import { PrismaClient, TeacherType, ThesisStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();
const password = "password123";

async function upsertUser(input: {
  email: string;
  name: string;
  role: UserRole;
  teacherType?: TeacherType;
  studentCode?: string;
  teacherCode?: string;
  title?: string;
}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      teacherType: input.teacherType,
    },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      teacherType: input.teacherType,
      passwordHash,
    },
  });

  if (input.role === UserRole.STUDENT) {
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        studentCode: input.studentCode,
        department: "Computer Science",
      },
      create: {
        userId: user.id,
        studentCode: input.studentCode,
        department: "Computer Science",
      },
    });
  }

  if (input.role === UserRole.TEACHER) {
    await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {
        teacherCode: input.teacherCode,
        title: input.title,
        department: "Graduate School",
      },
      create: {
        userId: user.id,
        teacherCode: input.teacherCode,
        title: input.title,
        department: "Graduate School",
      },
    });
  }

  return user;
}

async function main() {
  const admin = await upsertUser({ email: "admin@demo.com", name: "Demo Admin", role: UserRole.ADMIN });
  const mentor = await upsertUser({
    email: "mentor@demo.com",
    name: "Dr. Mentor",
    role: UserRole.TEACHER,
    teacherType: TeacherType.MENTOR,
    teacherCode: "T-MENTOR",
    title: "Associate Professor",
  });

  const critiqueUsers = [];
  for (let index = 1; index <= 6; index += 1) {
    critiqueUsers.push(
      await upsertUser({
        email: `critique${index}@demo.com`,
        name: `Critique Teacher ${index}`,
        role: UserRole.TEACHER,
        teacherType: TeacherType.CRITIQUE,
        teacherCode: `T-CRIT-${index}`,
        title: "Committee Member",
      }),
    );
  }

  const studentUsers = [];
  for (let index = 1; index <= 8; index += 1) {
    studentUsers.push(
      await upsertUser({
        email: `student${index}@demo.com`,
        name: `Student ${index}`,
        role: UserRole.STUDENT,
        studentCode: `S2026${String(index).padStart(3, "0")}`,
      }),
    );
  }

  const season = await prisma.academicSeason.upsert({
    where: { name: "2025-2026 Spring" },
    update: {},
    create: { name: "2025-2026 Spring", isActive: true },
  });
  const bachelor = await prisma.degreeType.upsert({
    where: { name: "Bachelor" },
    update: {},
    create: { name: "Bachelor", description: "Undergraduate thesis defense" },
  });
  await prisma.degreeType.upsert({
    where: { name: "Master" },
    update: {},
    create: { name: "Master", description: "Graduate thesis defense" },
  });

  const stageSeeds = [
    [1, "Mentor Review / First Defense", 15],
    [2, "Main Thesis Opening", 20],
    [3, "Pre-Finished Thesis Defense", 25],
    [4, "Final Thesis Defense", 40],
  ] as const;

  for (const [stageNumber, name, maxScore] of stageSeeds) {
    await prisma.defenseStage.upsert({
      where: { stageNumber },
      update: { name, maxScore, isActive: true },
      create: { stageNumber, name, maxScore, isActive: true },
    });
  }

  const mentorProfile = await prisma.teacherProfile.findUniqueOrThrow({ where: { userId: mentor.id } });
  const critiqueProfiles = await prisma.teacherProfile.findMany({
    where: { userId: { in: critiqueUsers.map((user) => user.id) } },
    orderBy: { teacherCode: "asc" },
  });
  const studentProfiles = await prisma.studentProfile.findMany({
    where: { userId: { in: studentUsers.map((user) => user.id) } },
    include: { user: true },
    orderBy: { studentCode: "asc" },
  });

  const group = await prisma.critiqueGroup.upsert({
    where: { id: "demo-critique-group" },
    update: { name: "Spring Defense Group A", academicSeasonId: season.id, degreeTypeId: bachelor.id },
    create: { id: "demo-critique-group", name: "Spring Defense Group A", academicSeasonId: season.id, degreeTypeId: bachelor.id },
  });

  for (const teacher of critiqueProfiles) {
    await prisma.critiqueGroupTeacher.upsert({
      where: { groupId_teacherId: { groupId: group.id, teacherId: teacher.id } },
      update: { isActive: true, removedAt: null },
      create: { groupId: group.id, teacherId: teacher.id },
    });
  }

  for (const student of studentProfiles) {
    await prisma.critiqueGroupStudent.upsert({
      where: { groupId_studentId: { groupId: group.id, studentId: student.id } },
      update: {},
      create: { groupId: group.id, studentId: student.id },
    });

    await prisma.thesis.upsert({
      where: { studentId: student.id },
      update: {
        mentorTeacherId: mentorProfile.id,
        critiqueGroupId: group.id,
        academicSeasonId: season.id,
        degreeTypeId: bachelor.id,
      },
      create: {
        studentId: student.id,
        mentorTeacherId: mentorProfile.id,
        critiqueGroupId: group.id,
        academicSeasonId: season.id,
        degreeTypeId: bachelor.id,
        title: `${student.user.name} Thesis Defense Management Study`,
        abstract: "Demo abstract for thesis orchestration workflow.",
        keywords: "thesis, defense, orchestration",
        status: ThesisStatus.SUBMITTED,
      },
    });
  }

  const stages = await prisma.defenseStage.findMany();
  for (const stage of stages) {
    await prisma.defenseSchedule.create({
      data: {
        academicSeasonId: season.id,
        degreeTypeId: bachelor.id,
        defenseStageId: stage.id,
        title: `${stage.name} - Spring Demo`,
        defenseDate: new Date(`2026-06-0${stage.stageNumber}T09:00:00.000Z`),
        startTime: "09:00",
        endTime: "17:00",
        location: `Room ${200 + stage.stageNumber}`,
        notes: "Seeded hackathon schedule",
        createdById: admin.id,
      },
    });
  }

  const theses = await prisma.thesis.findMany({ take: 4, orderBy: { createdAt: "asc" } });
  const stageOne = await prisma.defenseStage.findUniqueOrThrow({ where: { stageNumber: 1 } });
  const stageTwo = await prisma.defenseStage.findUniqueOrThrow({ where: { stageNumber: 2 } });
  const stageThree = await prisma.defenseStage.findUniqueOrThrow({ where: { stageNumber: 3 } });

  for (const [index, thesis] of theses.entries()) {
    await prisma.defenseScore.upsert({
      where: { thesisId_defenseStageId_scoredById: { thesisId: thesis.id, defenseStageId: stageOne.id, scoredById: mentor.id } },
      update: { score: 12 + index, comment: "Mentor review completed." },
      create: { thesisId: thesis.id, defenseStageId: stageOne.id, scoredById: mentor.id, score: 12 + index, comment: "Mentor review completed." },
    });
    await prisma.defenseScore.upsert({
      where: { thesisId_defenseStageId_scoredById: { thesisId: thesis.id, defenseStageId: stageTwo.id, scoredById: critiqueUsers[0].id } },
      update: { score: 16 + index, comment: "Opening defense score." },
      create: { thesisId: thesis.id, defenseStageId: stageTwo.id, scoredById: critiqueUsers[0].id, score: 16 + index, comment: "Opening defense score." },
    });
  }

  const firstThesis = theses[0];
  if (firstThesis) {
    await prisma.critiqueReview.upsert({
      where: { id: "demo-critique-review" },
      update: {},
      create: {
        id: "demo-critique-review",
        thesisId: firstThesis.id,
        assignedTeacherId: critiqueProfiles[0].id,
        assignedById: admin.id,
        defenseStageId: stageThree.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "FEEDBACK_GIVEN",
        feedback: "Strengthen the methodology section and clarify evaluation criteria.",
        requiredChanges: "Add comparison table and revise conclusion.",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

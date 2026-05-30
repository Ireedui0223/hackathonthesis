-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "TeacherType" AS ENUM ('MENTOR', 'CRITIQUE', 'BOTH');

-- CreateEnum
CREATE TYPE "ThesisStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'MENTOR_REVIEW', 'DEFENSE_1_COMPLETED', 'DEFENSE_2_COMPLETED', 'DEFENSE_3_COMPLETED', 'CRITIQUE_ASSIGNED', 'REVISION_REQUIRED', 'REVISION_SUBMITTED', 'FINAL_DEFENSE_READY', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ThesisFileType" AS ENUM ('PROPOSAL', 'DRAFT', 'PRE_FINAL', 'FINAL', 'REVISION', 'OTHER');

-- CreateEnum
CREATE TYPE "CritiqueStatus" AS ENUM ('ASSIGNED', 'FEEDBACK_GIVEN', 'REVISION_SUBMITTED', 'APPROVED', 'NEEDS_MORE_WORK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "teacherType" "TeacherType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentCode" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teacherCode" TEXT,
    "department" TEXT,
    "title" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSeason" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DegreeType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DegreeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thesis" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "mentorTeacherId" TEXT,
    "critiqueGroupId" TEXT,
    "academicSeasonId" TEXT NOT NULL,
    "degreeTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "keywords" TEXT,
    "status" "ThesisStatus" NOT NULL DEFAULT 'DRAFT',
    "currentDefenseStage" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThesisFile" (
    "id" TEXT NOT NULL,
    "thesisId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "fileType" "ThesisFileType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThesisFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CritiqueGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicSeasonId" TEXT NOT NULL,
    "degreeTypeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CritiqueGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CritiqueGroupTeacher" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "CritiqueGroupTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CritiqueGroupStudent" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CritiqueGroupStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefenseStage" (
    "id" TEXT NOT NULL,
    "stageNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefenseStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefenseSchedule" (
    "id" TEXT NOT NULL,
    "academicSeasonId" TEXT NOT NULL,
    "degreeTypeId" TEXT,
    "defenseStageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "defenseDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefenseSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefenseScore" (
    "id" TEXT NOT NULL,
    "thesisId" TEXT NOT NULL,
    "defenseStageId" TEXT NOT NULL,
    "scoredById" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefenseScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CritiqueReview" (
    "id" TEXT NOT NULL,
    "thesisId" TEXT NOT NULL,
    "assignedTeacherId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "defenseStageId" TEXT,
    "feedback" TEXT,
    "requiredChanges" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "CritiqueStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "revisionFileId" TEXT,
    "teacherFinalComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CritiqueReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentCode_key" ON "StudentProfile"("studentCode");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_teacherCode_key" ON "TeacherProfile"("teacherCode");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSeason_name_key" ON "AcademicSeason"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DegreeType_name_key" ON "DegreeType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Thesis_studentId_key" ON "Thesis"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CritiqueGroupTeacher_groupId_teacherId_key" ON "CritiqueGroupTeacher"("groupId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "CritiqueGroupStudent_groupId_studentId_key" ON "CritiqueGroupStudent"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "DefenseStage_stageNumber_key" ON "DefenseStage"("stageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DefenseScore_thesisId_defenseStageId_scoredById_key" ON "DefenseScore"("thesisId", "defenseStageId", "scoredById");

-- CreateIndex
CREATE UNIQUE INDEX "CritiqueReview_revisionFileId_key" ON "CritiqueReview"("revisionFileId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_mentorTeacherId_fkey" FOREIGN KEY ("mentorTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_critiqueGroupId_fkey" FOREIGN KEY ("critiqueGroupId") REFERENCES "CritiqueGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_academicSeasonId_fkey" FOREIGN KEY ("academicSeasonId") REFERENCES "AcademicSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_degreeTypeId_fkey" FOREIGN KEY ("degreeTypeId") REFERENCES "DegreeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesisFile" ADD CONSTRAINT "ThesisFile_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesisFile" ADD CONSTRAINT "ThesisFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueGroup" ADD CONSTRAINT "CritiqueGroup_academicSeasonId_fkey" FOREIGN KEY ("academicSeasonId") REFERENCES "AcademicSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueGroup" ADD CONSTRAINT "CritiqueGroup_degreeTypeId_fkey" FOREIGN KEY ("degreeTypeId") REFERENCES "DegreeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueGroupTeacher" ADD CONSTRAINT "CritiqueGroupTeacher_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CritiqueGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueGroupTeacher" ADD CONSTRAINT "CritiqueGroupTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueGroupStudent" ADD CONSTRAINT "CritiqueGroupStudent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CritiqueGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueGroupStudent" ADD CONSTRAINT "CritiqueGroupStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseSchedule" ADD CONSTRAINT "DefenseSchedule_academicSeasonId_fkey" FOREIGN KEY ("academicSeasonId") REFERENCES "AcademicSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseSchedule" ADD CONSTRAINT "DefenseSchedule_degreeTypeId_fkey" FOREIGN KEY ("degreeTypeId") REFERENCES "DegreeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseSchedule" ADD CONSTRAINT "DefenseSchedule_defenseStageId_fkey" FOREIGN KEY ("defenseStageId") REFERENCES "DefenseStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseSchedule" ADD CONSTRAINT "DefenseSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseScore" ADD CONSTRAINT "DefenseScore_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseScore" ADD CONSTRAINT "DefenseScore_defenseStageId_fkey" FOREIGN KEY ("defenseStageId") REFERENCES "DefenseStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseScore" ADD CONSTRAINT "DefenseScore_scoredById_fkey" FOREIGN KEY ("scoredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueReview" ADD CONSTRAINT "CritiqueReview_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueReview" ADD CONSTRAINT "CritiqueReview_assignedTeacherId_fkey" FOREIGN KEY ("assignedTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueReview" ADD CONSTRAINT "CritiqueReview_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueReview" ADD CONSTRAINT "CritiqueReview_defenseStageId_fkey" FOREIGN KEY ("defenseStageId") REFERENCES "DefenseStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueReview" ADD CONSTRAINT "CritiqueReview_revisionFileId_fkey" FOREIGN KEY ("revisionFileId") REFERENCES "ThesisFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

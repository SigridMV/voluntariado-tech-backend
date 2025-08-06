-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VolunteerProject" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,

    CONSTRAINT "VolunteerProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProject_projectId_volunteerId_key" ON "public"."VolunteerProject"("projectId", "volunteerId");

-- AddForeignKey
ALTER TABLE "public"."VolunteerProject" ADD CONSTRAINT "VolunteerProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerProject" ADD CONSTRAINT "VolunteerProject_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

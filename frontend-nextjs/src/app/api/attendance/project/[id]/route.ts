import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const dateObj = new Date(dateStr + "T00:00:00.000Z");

  const workers = await prisma.worker.findMany({
    where: { projectId: BigInt(id), isActive: true },
    include: {
      position: { select: { name: true } },
      attendances: {
        where: { date: dateObj },
        select: { status: true, projectId: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Untuk setiap worker, cek apakah ada pekerja dengan NAMA SAMA sudah hadir di proyek lain
  const data = await Promise.all(
    workers.map(async (w) => {
      const currentAttendance = w.attendances.find(
        (a) => a.projectId === BigInt(id)
      );
      
      // Cek apakah ada pekerja dengan nama sama (case-insensitive) sudah hadir di proyek lain
      const attendanceInOtherProject = await prisma.attendance.findFirst({
        where: {
          date: dateObj,
          projectId: { not: BigInt(id) },
          status: "hadir",
          worker: {
            name: {
              equals: w.name,
              mode: 'insensitive',
            },
          },
        },
        include: {
          project: { select: { name: true } },
          worker: { select: { name: true } },
        },
      });

      return {
        worker_id: Number(w.id),
        worker_name: w.name,
        position: w.position?.name ?? "-",
        daily_wage: w.dailyWage ?? 0,
        current_status: currentAttendance?.status ?? null,
        already_attended: !!currentAttendance,
        attended_other_project: attendanceInOtherProject
          ? {
              project_name: attendanceInOtherProject.project.name,
              status: attendanceInOtherProject.status,
            }
          : null,
      };
    })
  );

  return NextResponse.json({ data });
});

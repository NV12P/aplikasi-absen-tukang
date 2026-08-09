import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import ExcelJS from "exceljs";

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = Number(searchParams.get("project_id"));
  const weekStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  if (!projectId) return NextResponse.json({ error: "project_id wajib diisi" }, { status: 422 });

  const weekStart = new Date(weekStr + "T00:00:00.000Z");
  const dayOfWeek = weekStart.getUTCDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setUTCDate(weekStart.getUTCDate() + diff);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  const [project, workers, attendances] = await Promise.all([
    prisma.project.findUnique({ where: { id: BigInt(projectId) } }),
    prisma.worker.findMany({
      where: { projectId: BigInt(projectId), isActive: true },
      include: { position: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: { worker: { projectId: BigInt(projectId) }, date: { gte: weekStart, lte: weekEnd } },
    }),
  ]);

  if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });

  const attMap = new Map<string, { status: string; wage: number }>();
  for (const att of attendances) {
    attMap.set(`${att.workerId}_${att.date.toISOString().split("T")[0]}`, {
      status: att.status,
      wage: att.wage,
    });
  }

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    dates.push(d);
  }
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Rekap Absensi");

  sheet.mergeCells(1, 1, 1, 11);
  sheet.getCell("A1").value = `Rekap Absensi — ${project.name}`;
  sheet.getCell("A1").font = { bold: true, size: 13 };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells(2, 1, 2, 11);
  sheet.getCell("A2").value = `Periode: ${dateFmt.format(weekStart)} s/d ${dateFmt.format(weekEnd)}`;
  sheet.getCell("A2").alignment = { horizontal: "center" };
  sheet.addRow([]);

  const headerRow = sheet.addRow([
    "No", "Nama Pekerja", "Jabatan",
    ...dates.map((d, i) => `${dayNames[i]}\n${dateFmt.format(d)}`),
    "Total Upah",
  ]);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  let totalExpense = 0;
  workers.forEach((worker, idx) => {
    const cells: (string | number)[] = [idx + 1, worker.name, worker.position?.name ?? "-"];
    let totalWage = 0;
    dates.forEach((d) => {
      const key = `${worker.id}_${d.toISOString().split("T")[0]}`;
      const att = attMap.get(key);
      cells.push(att ? att.status.toUpperCase() : "-");
      totalWage += att?.wage ?? 0;
    });
    cells.push(totalWage);
    totalExpense += totalWage;

    const row = sheet.addRow(cells);
    row.alignment = { vertical: "middle", horizontal: "center" };
    if (idx % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      });
    }
    row.getCell(11).numFmt = '"Rp"#,##0';
    row.getCell(11).alignment = { horizontal: "right" };
  });

  const totalRow = sheet.addRow(["", "TOTAL", "", ...Array(7).fill(""), totalExpense]);
  totalRow.font = { bold: true };
  totalRow.getCell(11).numFmt = '"Rp"#,##0';
  totalRow.getCell(11).alignment = { horizontal: "right" };

  sheet.columns = [
    { width: 5 }, { width: 24 }, { width: 18 },
    ...Array(7).fill({ width: 9 }),
    { width: 18 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `rekap_${project.name.replace(/\s+/g, "_")}_${weekStr}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

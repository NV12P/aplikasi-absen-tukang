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

  // Query foreman untuk signature
  const foreman = await prisma.foreman.findUnique({
    where: { projectId: BigInt(projectId) },
  });

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
  const fullDateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
  });

  const COL_COUNT = 11;

  const COLOR_HEADER_BG = "FF1E3A5F";
  const COLOR_HEADER_TEXT = "FFFFFFFF";
  const COLOR_BORDER = "FFB0B8C1";
  const COLOR_STRIPE_ODD = "FFFFFFFF";
  const COLOR_STRIPE_EVEN = "FFF8FAFC";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Absen Tukang";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Rekap Absensi");

  // ─── Baris 1: Judul "Rekap Absensi" ──────────────────────────────────────
  sheet.mergeCells(1, 1, 1, COL_COUNT);
  const titleCell = sheet.getCell("A1");
  titleCell.value = "REKAP ABSENSI";
  titleCell.font = { bold: true, size: 14, color: { argb: COLOR_HEADER_TEXT } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_BG } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 28;

  // ─── Baris 2: Lokasi (tanpa fill, hitam default) ──────────────────────────
  sheet.mergeCells(2, 1, 2, COL_COUNT);
  const locCell = sheet.getCell("A2");
  locCell.value = `Lokasi: ${project.name}`;
  locCell.font = { size: 12, bold: true, color: { argb: "FF000000" } };
  locCell.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(2).height = 20;

  // ─── Baris 3: Periode (tanpa fill, hitam default) ─────────────────────────
  sheet.mergeCells(3, 1, 3, COL_COUNT);
  const periodCell = sheet.getCell("A3");
  periodCell.value = `Periode: ${fullDateFmt.format(weekStart)} s/d ${fullDateFmt.format(weekEnd)}`;
  periodCell.font = { size: 12, color: { argb: "FF000000" } };
  periodCell.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(3).height = 20;

  // ─── Baris 4: Spacer ─────────────────────────────────────────────────────
  sheet.addRow([]);
  sheet.getRow(4).height = 6;

  // ─── Baris 5: Header kolom ───────────────────────────────────────────────
  const headerLabels = [
    "No",
    "Nama Pekerja",
    "Jabatan",
    ...dates.map((d, i) => `${dayNames[i]}\n${dateFmt.format(d)}`),
    "Total Upah",
  ];

  const headerRow = sheet.addRow(headerLabels);
  headerRow.height = 36;

  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_BG } };
    cell.font = { bold: true, color: { argb: COLOR_HEADER_TEXT }, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0D2137" } },
      bottom: { style: "medium", color: { argb: "FF0D2137" } },
      left: { style: "thin", color: { argb: COLOR_BORDER } },
      right: { style: "thin", color: { argb: COLOR_BORDER } },
    };
  });

  // ─── Baris data pekerja ──────────────────────────────────────────────────
  let totalExpense = 0;
  const COLOR_TOTAL_BG = "FFFAF6E3"; // krem

  workers.forEach((worker, idx) => {
    const cells: (string | number)[] = [idx + 1, worker.name, worker.position?.name ?? "-"];

    let totalWage = 0;
    const statusList: (string | null)[] = [];

    dates.forEach((d) => {
      const key = `${worker.id}_${d.toISOString().split("T")[0]}`;
      const att = attMap.get(key);
      cells.push(att?.status ?? "");
      statusList.push(att?.status ?? null);
      totalWage += att?.wage ?? 0;
    });

    cells.push(totalWage);
    totalExpense += totalWage;

    const dataRow = sheet.addRow(cells);
    dataRow.height = 24;

    const isEven = idx % 2 === 0;
    const rowBg = isEven ? COLOR_STRIPE_ODD : COLOR_STRIPE_EVEN;

    dataRow.eachCell((cell, colNum) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cell.font = { size: 10, color: { argb: "FF1F1F1F" } };

      if (colNum === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNum === 2 || colNum === 3) {
        cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      } else if (colNum >= 4 && colNum <= 10) {
        const statusIdx = colNum - 4;
        const status = statusList[statusIdx];

        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: true, size: 11, color: { argb: "FF000000" } };

        if (status === "hadir" || status === "lembur") {
          cell.value = "✓";
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
        } else if (status === "cor") {
          cell.value = "";
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD3D3D3" } };
        } else if (status === "alpha") {
          cell.value = "";
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6B6B" } };
        } else {
          cell.value = "";
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
        }
      } else if (colNum === 11) {
        cell.numFmt = '"Rp "#,##0';
        cell.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
        cell.font = { bold: true, size: 10 };
      }

      cell.border = {
        top: { style: "hair", color: { argb: COLOR_BORDER } },
        bottom: { style: "hair", color: { argb: COLOR_BORDER } },
        left: { style: "thin", color: { argb: COLOR_BORDER } },
        right: { style: "thin", color: { argb: COLOR_BORDER } },
      };
    });
  });

  // ─── Baris total (tanpa border, warna krem FAFAE3) ────────────────────────
  const totalCells: (string | number)[] = ["", "TOTAL", "", ...Array(7).fill(""), totalExpense];
  const totalRow = sheet.addRow(totalCells);
  totalRow.height = 24;

  totalRow.eachCell((cell, colNum) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_TOTAL_BG } };
    cell.font = { bold: true, size: 12, color: { argb: "FF5D4037" } };
    cell.border = {}; // Tidak ada border

    if (colNum === 2) {
      cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    } else if (colNum === 11) {
      cell.numFmt = '"Rp "#,##0';
      cell.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
    } else {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  });

  // ─── Lebar kolom ─────────────────────────────────────────────────────────
  sheet.columns = [
    { width: 5 },   // No
    { width: 26 },  // Nama
    { width: 20 },  // Jabatan
    { width: 11 },  // Sen
    { width: 11 },  // Sel
    { width: 11 },  // Rab
    { width: 11 },  // Kam
    { width: 11 },  // Jum
    { width: 11 },  // Sab
    { width: 11 },  // Min
    { width: 18 },  // Total Upah
  ];

  // ─── Signature Block (pojok kanan bawah) ─────────────────────────────────
  const signatureStartRow = sheet.lastRow!.number + 2;
  const locationFmt = new Intl.DateTimeFormat("id-ID", { 
    day: "numeric", 
    month: "long", 
    year: "numeric", 
    timeZone: "UTC" 
  });
  
  // Baris: "Malang, [tanggal akhir]"
  sheet.mergeCells(signatureStartRow, 9, signatureStartRow, 11);
  const cityDateCell = sheet.getCell(signatureStartRow, 9);
  cityDateCell.value = `Malang, ${locationFmt.format(weekEnd)}`;
  cityDateCell.font = { size: 10, color: { argb: "FF000000" } };
  cityDateCell.alignment = { horizontal: "left", vertical: "middle" };
  cityDateCell.border = {};

  // Baris: "MENGETAHUI"
  sheet.mergeCells(signatureStartRow + 1, 9, signatureStartRow + 1, 11);
  const mengetahuiCell = sheet.getCell(signatureStartRow + 1, 9);
  mengetahuiCell.value = "MENGETAHUI";
  mengetahuiCell.font = { size: 10, bold: true, color: { argb: "FF000000" } };
  mengetahuiCell.alignment = { horizontal: "left", vertical: "middle" };
  mengetahuiCell.border = {};

  // Baris: "KEPALA TUKANG"
  sheet.mergeCells(signatureStartRow + 2, 9, signatureStartRow + 2, 11);
  const jabatanCell = sheet.getCell(signatureStartRow + 2, 9);
  jabatanCell.value = "KEPALA TUKANG";
  jabatanCell.font = { size: 10, bold: true, color: { argb: "FF000000" } };
  jabatanCell.alignment = { horizontal: "left", vertical: "middle" };
  jabatanCell.border = {};

  // 3 baris kosong untuk tanda tangan
  for (let i = 0; i < 3; i++) {
    const emptyRow = signatureStartRow + 3 + i;
    sheet.mergeCells(emptyRow, 9, emptyRow, 11);
    const emptyCell = sheet.getCell(emptyRow, 9);
    emptyCell.value = "";
    emptyCell.border = {};
  }

  // Baris: "(Nama Kepala Tukang)"
  sheet.mergeCells(signatureStartRow + 6, 9, signatureStartRow + 6, 11);
  const nameCell = sheet.getCell(signatureStartRow + 6, 9);
  nameCell.value = foreman ? `(${foreman.name})` : "(Nama Kepala Tukang)";
  nameCell.font = { size: 10, bold: true, color: { argb: "FF000000" } };
  nameCell.alignment = { horizontal: "left", vertical: "middle" };
  nameCell.border = {};

  // ─── Page setup ───────────────────────────────────────────────────────────
  sheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
  };

  const lastDataRow = 5 + workers.length + 1 + 8; // +8 untuk signature block
  sheet.pageSetup.printArea = `A1:K${lastDataRow}`;
  sheet.headerFooter.oddFooter = `&L&8Dicetak: ${new Date().toLocaleDateString("id-ID")}&R&8Halaman &P dari &N`;

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Rekap_Absensi_${project.name.replace(/\s+/g, "_")}_${weekStr}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

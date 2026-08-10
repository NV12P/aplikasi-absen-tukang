import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  // start_date bisa diedit saat edit proyek
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: BigInt(id) } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: serializeBigInt(project) });
});

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { name, location, description, start_date, end_date, is_active } = parsed.data;

  // Ambil data proyek lama untuk cek perubahan status
  const existing = await prisma.project.findUnique({
    where: { id: BigInt(id) },
    select: { isActive: true, endDate: true },
  });

  // Logika auto end_date:
  // - Jika status berubah dari aktif → selesai DAN end_date tidak diisi → auto hari ini
  // - Jika status berubah dari selesai → aktif → clear end_date
  let resolvedEndDate: Date | null | undefined = undefined;

  if (end_date !== undefined) {
    // User eksplisit mengisi end_date
    resolvedEndDate = end_date ? new Date(end_date) : null;
  } else if (is_active === false && existing?.isActive === true && !existing?.endDate) {
    // Status berubah jadi selesai & belum ada end_date → auto hari ini
    resolvedEndDate = new Date();
  } else if (is_active === true && existing?.isActive === false) {
    // Status berubah jadi aktif kembali → hapus end_date
    resolvedEndDate = null;
  }

  const project = await prisma.project.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(location !== undefined && { location }),
      ...(description !== undefined && { description }),
      // start_date bisa diedit manual dari form edit
      ...(start_date !== undefined && { startDate: start_date ? new Date(start_date) : null }),
      // end_date: pakai resolvedEndDate jika ada
      ...(resolvedEndDate !== undefined && { endDate: resolvedEndDate }),
      ...(is_active !== undefined && { isActive: is_active }),
    },
  });

  return NextResponse.json({ data: serializeBigInt(project) });
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ message: "Deleted" });
});

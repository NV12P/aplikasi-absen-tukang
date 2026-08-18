import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  
  // Map camelCase ke snake_case untuk frontend
  const mapped = projects.map((p) => ({
    id: Number(p.id),
    name: p.name,
    location: p.location,
    description: p.description,
    start_date: p.startDate,
    end_date: p.endDate,
    is_active: p.isActive,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }));
  
  const res = NextResponse.json({ data: mapped });
  // Cache 30 detik di browser, stale-while-revalidate 60 detik di background
  res.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
  return res;
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { name, location, description, end_date, is_active } = parsed.data;

  const project = await prisma.project.create({
    data: {
      name,
      location,
      description: description ?? null,
      // start_date selalu otomatis dari server (tanggal hari ini)
      startDate: new Date(),
      endDate: end_date ? new Date(end_date) : null,
      isActive: is_active ?? true,
    },
  });

  return NextResponse.json({ 
    data: {
      id: Number(project.id),
      name: project.name,
      location: project.location,
      description: project.description,
      start_date: project.startDate,
      end_date: project.endDate,
      is_active: project.isActive,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    }
  }, { status: 201 });
});

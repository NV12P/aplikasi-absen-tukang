import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { ProyekClient } from "./ProyekClient";

export default async function ProyekPage() {
  const rawProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  const projects = serializeBigInt(rawProjects).map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    description: p.description ?? null,
    startDate: p.startDate instanceof Date
      ? p.startDate.toISOString().split("T")[0]
      : (p.startDate as string | null),
    endDate: p.endDate instanceof Date
      ? p.endDate.toISOString().split("T")[0]
      : (p.endDate as string | null),
    isActive: p.isActive,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt ?? ""),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt ?? ""),
  }));

  return (
    <Suspense fallback={null}>
      <ProyekClient initialProjects={projects} />
    </Suspense>
  );
}

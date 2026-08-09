import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { PekerjaClient } from "./PekerjaClient";

export default async function PekerjaPage() {
  const [rawWorkers, rawProjects, rawPositions] = await Promise.all([
    prisma.worker.findMany({
      include: {
        project: { select: { id: true, name: true } },
        position: {
          select: { id: true, name: true, dailyWage: true, overtimeWage: true, castingWage: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
  ]);

  // serializeBigInt konversi semua BigInt id -> number
  const workers = serializeBigInt(rawWorkers);
  const projects = serializeBigInt(rawProjects);
  const positions = serializeBigInt(rawPositions);

  return (
    <PekerjaClient
      initialWorkers={workers}
      projects={projects}
      positions={positions}
    />
  );
}

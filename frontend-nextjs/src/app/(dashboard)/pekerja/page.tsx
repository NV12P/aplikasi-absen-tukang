import { Suspense } from "react";
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
    prisma.project.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, isActive: true } }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
  ]);

  const workers = serializeBigInt(rawWorkers);
  const projects = serializeBigInt(rawProjects);
  const positions = serializeBigInt(rawPositions);

  return (
    <Suspense fallback={null}>
      <PekerjaClient
        initialWorkers={workers}
        projects={projects}
        positions={positions}
      />
    </Suspense>
  );
}

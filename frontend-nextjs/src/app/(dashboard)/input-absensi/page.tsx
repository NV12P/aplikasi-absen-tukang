import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { InputAbsensiClient } from "./InputAbsensiClient";

export default async function InputAbsensiPage() {
  const rawProjects = await prisma.project.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const projects = serializeBigInt(rawProjects);

  return (
    <Suspense fallback={null}>
      <InputAbsensiClient projects={projects} />
    </Suspense>
  );
}

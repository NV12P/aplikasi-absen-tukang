import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { RekapAbsensiClient } from "./RekapAbsensiClient";

export default async function RekapAbsensiPage() {
  const rawProjects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const projects = serializeBigInt(rawProjects);

  return <RekapAbsensiClient projects={projects} />;
}

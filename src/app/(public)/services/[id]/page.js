import { notFound } from "next/navigation";
import ServiceDetail from "@/components/services/service-detail";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Service ${String(id).slice(0, 6)}…` };
}

/** /services/[id] - params is a Promise in Next 16 (await it). */
export default async function ServiceDetailPage({ params }) {
  const { id } = await params;
  if (!id || id.length < 8) notFound();
  return <ServiceDetail id={id} />;
}

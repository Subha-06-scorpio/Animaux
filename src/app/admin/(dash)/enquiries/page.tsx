import type { Metadata } from "next";
import { EnquiriesList } from "@/components/admin/enquiries-list";
import { requirePage } from "@/lib/auth";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  await requirePage("enquiries.read");
  const items = await repo().listEnquiries();
  return (
    <div>
      <p className="eyebrow">Help desk</p>
      <h1 className="display mt-2 text-4xl">Enquiries</h1>
      <EnquiriesList items={items} />
    </div>
  );
}

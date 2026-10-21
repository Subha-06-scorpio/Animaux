import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/resource-manager";
import { requirePage } from "@/lib/auth";
import { repo } from "@/lib/data";
import type { CollectionName } from "@/lib/types";

const COLLECTIONS: CollectionName[] = ["events", "team", "gallery", "schedule", "announcements", "faqs"];
const isCollection = (c: string): c is CollectionName => (COLLECTIONS as string[]).includes(c);

export async function generateMetadata({ params }: PageProps<"/admin/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  return { title: collection.charAt(0).toUpperCase() + collection.slice(1) };
}

export default async function CollectionPage({ params }: PageProps<"/admin/[collection]">) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  await requirePage("content.write");
  const items = await repo().list(collection);
  return <ResourceManager collection={collection} items={items} />;
}
